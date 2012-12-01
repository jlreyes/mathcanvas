/* -----------------------------------------------------------------------------
 * Database client
 * -----------------------------------------------------------------------------
 *  Structure:
 *
 *  globals.nextUserId : Number
 *      The user id that we will assign to the next new user
 *
 *  userIds.<username> : Number
 *      The corresponding id for a given username
 *
 *  users.<id> : HashMap
 *      id : Number
 *      username : String
 *      method : String -- The login method for this uses
 *          Possible Values:
 *              "local"
 *              "facebook"
 *      password : String -- Encrypted
 * users.<id>.rooms : Set
 *     A set of room ids that this user has visited that still exist
 *
 *  globals.nextRoomId : Number
 *      The next room id we will assign.
 *  globals.rooms : Set
 *      A set of active room ids
 *
 *  rooms.<id>.name : String
 *      The name of this room
 *  rooms.<id>.lastAccessTime
 *      Time in seconds that the last user who left the room
 *      made the room empty. Null if there are users in this room.
 *  rooms.<id>.users : Set
 *      A set of user ids that are in this room right now
 *  rooms.<id>.type : String
 *      Either "public" or "private"
 *  room.<id>.permittedUsers : Set
 *      Only exists if room.<id>.permittedUsers is "private". This is a set of
 *      user ids that are permitted.
 */
var redis = require("redis");
var util = require("./Util.js");
var client = redis.createClient(6379, "127.0.0.1", null);

/* -----------------------------------------------------------------------------
 * USER FUNCTIONS
 * -----------------------------------------------------------------------------
 */

exports.users = {};

/* Registers a new user. Passes either null or a string describing the error that
 * occurred with registration. */
exports.users.register = function(username, password, callback) {
    /* Check if the username already exists */
    exports.users.getId(username, function(id) {
        if (id !== -1) {
            callback("Username already exists.");
            return;
        }
        /* The username does not exist. Create a new user */
        client.incr("nextUserId", function(e, res) {
            if (util.exists(e)) throw e;
            var id = res;
            var user =  {
                id : id, method : "local", username : username, password : password
            };
            var multi = client.multi();
            multi.set("userIds." + username, id);
            multi.hmset("users." + id, user);
            multi.exec(function(err, replies) {
                callback();
            });
        });
    });
};

/* Gets the next user id and increments it (after getting the value) iff incr
 * is true. Passes the id to the callback function */
exports.users.getNextUserId = function(callback, incr) {
    incr = (incr === undefined)? false : incr;
    var multi = client.multi();
    var id;
    multi.get("nextUserId", function(e, res) {
        if (util.exists(e)) throw e;
        res = (res === null)? "-1" : res;
        id = parseInt(res, 10);
    });
    if (incr === true) multi.incr("nextUserId");
    multi.exec(function(e, res) {
        if (util.exists(e)) throw e;
        callback(id);
    });
};

/* Gets the user corresponding the given id. Passes the user object to the
 * callback. If a user with the given id does not exist, passes null */
exports.users.getById = function(id, callback) {
    var user;
    var multi = client.multi();
    multi.hgetall("users." + id, function(e, res) {
        if (util.exists(e)) throw e;
        user = res;
    });
    multi.smembers("users." + id + ".rooms", function(e, res) {
        if (util.exists(e)) throw e;
        if (user === null) return;
        res = util.listToSet(res);
        var rooms = {};
        /* Make sure each room for the user exists */
        var roomTrans = client.multi();
        for (var roomId in res) {
            roomTrans.get("rooms." + roomId + ".name", (function(rid) {
                return function(e, name) {
                    if (util.exists(e)) throw e;
                    if (name !== null) {
                        rooms[rid] = {
                            id: rid, name: name
                        };
                    }
                };
            })(roomId));
        }
        roomTrans.exec(function(e, res) {
            if (util.exists(e)) throw e;
            user.rooms = rooms;
            callback(user);
        });
    });
    multi.exec(function(e, res) {
        if (util.exists(e)) throw e;
    });
};

/* Returns the id corresponding with the given username. Passes the id to
 * callback. passes -1 if the username does not exist. */
exports.users.getId = function(username, callback) {
    client.get("userIds." + username, function(e, res) {
        if (util.exists(e)) throw e;
        res = (res === null)? "-1" : res;
        var id = parseInt(res, 10);
        callback(id);
    });
};

/* Room functions */
exports.rooms = {};

/* Creates a new room and a returns an object representing it.
 * The object contains an id, type, name, and
 * last access time.
 * Opts contains a type and a name */
exports.rooms.createRoom = function(callback, opts) {
    var creator = opts.creator;
    client.incr("nextRoomId", function(e, res) {
        var room = {
            id : res,
            type: opts.type,
            name: opts.name,
            lastAccessTime: new Date().getTime()
        };
        var multi = client.multi();
        multi.set("rooms." + room.id + ".type", room.type);
        multi.set("rooms." + room.id + ".name", room.name);
        multi.set("rooms." + room.id + ".lastAccessTime", room.lastAccessTime);
        multi.sadd("globals.rooms", room.id);
        multi.sadd("users." + creator + ".rooms", room.id);
        multi.exec(function(e, res) {
            if (util.exists(e)) throw e;
            callback(room);
        });
    });
};

/* Passes the name of the room to the given callback.
 * Passes null if the room with the given id does not exist */
exports.rooms.getName = function(id, callback) {
    client.get("rooms." + id + ".name", function(e, res) {
        if (util.exists(e)) throw e;
        callback(res);
    });
};

/* Passes the last access time of the room to the given callback.
 * Passes null if the room with the given id does not exist
 * or if the last access time is null (so make sure the id
 * is valid) */
exports.rooms.getLastAccessTime = function(id, callback) {
    client.get("rooms." + id + ".lastAccessTime", function(e, res) {
        if (util.exists(e)) throw e;
        callback(res);
    });
};

/* Sets the last access time of the room with the given id to
 * time. passes the result to callback */
exports.rooms.setLastAccessTime = function(id, time, callback) {
    client.set("rooms." + id + ".lastAccessTime", time,
        function(e, res) {
            if (util.exists(e)) throw e;
            callback(res);
        });
};

/* Passes the set of users (or rather, their ids) to the given callback.
 * Passes null if the room with the given id does not exist or if there
 * are no users */
exports.rooms.getUsers = function(id, callback) {
    client.get("rooms." + id + ".users", function(e, res) {
        if (util.exists(e)) throw e;
        callback(res);
    });
};

/* Returns the set of all room ids */
exports.rooms.getRooms = function(callback) {
    client.smembers("globals.rooms", function(e, res) {
        if (util.exists(e)) throw e;
        res = util.listToSet(res);
        callback(res);
    });
};

/* Adds the given user to the given room and then passes
 * the result to the callback */
exports.rooms.addUser = function(roomId, userId, callback) {
    /* Function adding the user */
    var key = "rooms." + roomId + ".users";
    var addUser = function() {
        client.sadd(key, userId, function(e, res) {
            if (util.exists(e)) throw e;
            if (util.exists(callback)) callback(res);
        });
    };
    /* See if there are any users currently. If not,
     * delete the last access time key */
    exports.rooms.getUsers(roomId, function(users) {
        if (users === null) {
            client.del("rooms." + roomId + ".lastAccessTime",
                       addUser);
            return;
        }
        addUser();
    });
};

/* Removes the given user to the given room and then passes
 * the result to the callback */
exports.rooms.removeUser = function(roomId, userId, callback) {
    var key = "rooms." + roomId + ".users";
    client.srem(key, userId, function(e, res) {
        if (util.exists(e)) throw e;
        /* Check to see if there are any users left in this
         * room. If not, set the last access time */
        exports.rooms.getUsers(roomId, function(users) {
            if (users === null) {
                var setTime = exports.rooms.setLastAccessTime;
                var time = new Date().getTime();
                setTime(roomId, time, function(){
                    if (util.exists(callback)) callback(res);
                });
                return;
            }
            if (util.exists(callback)) callback(res);
        });
    });
};

/* Passes a room type (or null if the room with the given id does not exist)
 * to the given callback. */
exports.rooms.getType = function(id, callback) {
    client.get("rooms." + id + ".type", function(e, res) {
        if (util.exists(e)) throw e;
        callback(res);
    });
};

/* Passes the permitted users for the room corresponding to the given id
 * to the callback function. If the room does not exist or the room is not
 * of type "private", null is passed. */
exports.rooms.getPermittedUsers = function(id, callback) {
    client.smembers("rooms." + id + ".permittedUsers", function(e, res) {
        if (util.exists(e)) throw e;
        res = listToSet(res);
        callback(res);
    });
};

/* Passes a room object containing an id, type, name, and
 * last access time, and users. to the given callback
 * If the room does not exist, passes null. */
exports.rooms.getRoom = function(id, callback) {
    var room = {id: id};
    var invalid = false;
    var multi = client.multi();
    multi.get("rooms." + room.id + ".type", function(e, res) {
        invalid = !util.exists(res);
        room.type = res;
    });
    multi.get("rooms." + room.id + ".name", function(e, res) {
        invalid = !util.exists(res);
        room.name = res;
    });
    multi.get("rooms." + room.id + ".lastAccessTime", function(e, res) {
        room.lastAccessTime = res;
    });
    multi.smembers("rooms." + room.id + ".users", function(e, res) {
        res = util.listToSet(res);
        room.users = res;
    });
    multi.exec(function(e, res) {
        if (util.exists(e)) throw e;
        if (invalid === true) room = null;
        callback(room);
    });
};

/* Removes the room with the given id.*/
exports.rooms.removeRoom = function(id, callback) {
    var multi = client.multi();
    multi.del("rooms." + id + ".type");
    multi.del("rooms." + id + ".name");
    multi.del("rooms." + id + ".lastAccessTime");
    multi.del("rooms." + id + ".users");
    multi.del("rooms." + id + ".permittedUsers");
    multi.srem("globals.rooms", id);
    multi.exec(function(e, res) {
        if (util.exists(e)) throw e;
        callback();
    });
};