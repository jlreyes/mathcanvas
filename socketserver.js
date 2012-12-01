/*
 * A simple socket server that sends data between appropriate users
 * in a given room
 */
var io = require("socket.io");
var dbClient = require("./lib/dbClient.js");
var util = require("./lib/");

/* Hashmap that maps a given user id to its socket */
var userIdToSocket = {};

/* An object storing socket event keys */
var events = {
    /* Events the server sends */
    server : {
        newUser: "newUser"
    },
    /* Events the client sends */
    client : {
        disconnect: "disconnect",
        register: "register"
    }
};

/* For all events received from the client,
 * data contains:
 *     clientId : An encrypted user id.
 *     roomId : An unencrypted room id corresponding to the
 *              room the client is in.
 */
io.sockets.on("connection", function(socket) {
    /* The client info for this socket. Null until the
     * client has registered. */
    var user = null;
    var roomId = null;
    /* Sent by the client immediatly after connecting.
     * Add the client to the given room and verify that the
     * client has access to said room */
    socket.on(events.client.register, function(data) {
        var clientId = data.clientId; // TODO UNENCRYPT
        var roomId = data.roomId;
        /* Verify the user exists */
        dbClient.users.getById(clientId, function(res) {
            if (!util.exists(res)) {
                socket.disconnect();
                return;
            }
            user = {
                id: res.id, username: res.username
            };
            /* Verify the room */
            dbClient.rooms.getType(roomId, function(type) {
                /* Make sure the given room exists */
                if (!util.exists(type)) {
                    socket.disconnect();
                    return;
                }
                /* Make sure the client has access to this room */
                if (type === "public") register(clientId);
                else if (type === "private")
                    dbClient.getPermittedUsers(roomId, function(users) {
                        if (!util.exists(users)) {
                            socket.disconnect();
                            return;
                        }
                        register(clientId, roomId);
                    });
                else throw "Wait what? Unkown room type " + type;
            });
        });
    });
    /* Called when this socket needs to be registered.
     * Assumes roomId and user and non null and valid
     * -Adds the client to data structures
     * -Adds this client to the list of users in in the correct room.
     * -Notifies each user in the room a new client has connected. */
    var register = function() {
        /* Add the socket to the correct data structures */
        userIdToSocket[user.id] = socket;
        /* Notify each user a new client has connected */
        dbClient.rooms.getUsers(roomId, function(users) {
            for (var userId in users) {
                var siblingSocket = userIdToSocket[userId];
                siblingSocket.emit(events.server.newUser, user);
            }
            /* Add the user id to the rooms list of users */
            dbClient.rooms.addUser(roomId, user.id);
        });
    };
    /* Returns true iff this socket has been registered */
    var isRegistered = function() {
        return user !== null && roomId !== null;
    };
    /* Called when a client disconnects.
     * -Removes client from data structures
     * -Removes the client from the list of users in the correct room
     * -Notifies each client in the room the user disconnected */
    socket.on(events.client.disconnect, function(data) {
        if (isRegistered() === false) return;
        /* Remove from data structures */
        delete userIdToSocket[user.id];
        /* Remove the user from the room */
        dbClient.rooms.removeUser(roomId, user.id, function() {
            /* Notify each user in the room the client disconnected */
            dbClient.rooms.getUsers(roomId, function(users) {
                for (var userId in users) {
                    var siblingSocket = userIdToSocket[userId];
                    siblingSocket.emit(events.server.userDisconnect,
                                       user);
                }
            });
        });
    });
    /* Broadcast a message from this socket to every member of this
     * sockets room */
    socket.on("message", function(data) {
        if (isRegistered() === false) return;
        dbClient.rooms.getUsers(roomId, function(users) {
            for (var userId in users) {
                var siblingSocket = userIdToSocket[userId];
                siblingSocket.send({
                    user: user, message: message
                });
            }
        });
    });
});

process.on("uncaughtException", function(e) {
    console.error(e);
    io.sockets.disconnect();
    /* Reset data structures */
    userIdToSocket = {};
});

io.listen(3000);