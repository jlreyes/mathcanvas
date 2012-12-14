/*
 * This socket server that sends data between appropriate users
 * in a given room
 */
var io = require("socket.io").listen(8080);
var dbClient = require("./lib/DbClient.js");
var util = require("./lib/Util.js");

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');
io.set('log level', 2);


/* We want to make sure we start fresh, so we remove
 * all users from all rooms */
dbClient.rooms.resetRooms();

/* Hashmap that maps a given user id to its socket */
var userIdToSocket = {};

/* An object storing socket event keys */
var events = {
    /* Events the server sends */
    server : {
        newUser: "newUser",
        userDisconnect: "userDisconnect",
        error: "error"
    },
    /* Events the client sends */
    client : {
        disconnect: "disconnect",
        register: "register"
    }
};

io.sockets.on("connection", function(socket) {
    /* The client info for this socket. Null until the
     * client has registered. */
    var user = null;
    var roomId = null;
    var registered = false;
    /* Sent by the client immediatly after connecting.
     * Add the client to the given room and verify that the
     * client has access to said room */
    socket.on(events.client.register, function(data) {
        var clientId = data.clientId; // TODO UNENCRYPT
        roomId = data.roomId;
        /* Verify the client id and room id were giving */
        if (!util.exists(roomId)) {
            onFail("No room id given.");
            return;
        }
        if (!util.exists(clientId)) {
            onFail("No client id given.");
            return;
        }
        /* Verify the user exists */
        dbClient.users.getById(clientId, function(res) {
            if (!util.exists(res)) {
                onFail("The user with the given id doesn't exist");
                return;
            }
            user = res;
            /* Verify the room */
            dbClient.rooms.getRoom(roomId, function(roomRes) {
                /* Make sure the given room exists */
                if (!util.exists(roomRes)) {
                    onError("Room " + roomId + " doesn't exist.");
                    return;
                }
                /* Make sure the client has access to this room */
                if (roomRes.type === "public") register();
                else if (roomRes.type === "private")
                    dbClient.getPermittedUsers(roomId, function(users) {
                        if (!util.exists(users)) {
                            onError("You are not allowed in this room.");
                            return;
                        }
                        register();
                    });
                else throw "Wait what? Unkown room type " + type;
            });
        });
    });
    /* Called when there is an error that we need to send to
     * this socket.  */
    var onError = function(error) {
        socket.emit(events.server.error, error);
        console.log("SENDING ERROR:", error);
        socket.disconnect();
    };
    /* Called when this socket needs to be registered.
     * Assumes roomId and user and non null and valid
     * -Adds the client to data structures
     * -Adds this client to the list of users in in the correct room.
     * -Notifies each user in the room a new client has connected.
     * -Send the client the whiteboard and usernames for the room
     * -Send the client information received between the time we got
     *  the whiteboard and usernames and the time we sent the data */
    var registerInProgress = false;
    var queuedMessages = [];
    var register = function() {
        /* Add the socket to the correct data structures */
        userIdToSocket[user.id] = socket;
        /* Start listening for messages */
        registerInProgress = true;
        /* Notify each user a new client has connected */
        dbClient.rooms.getRoom(roomId, function(room) {
            var users = room.users;
            delete users[user.id]; /* Fixes cordova bug... */
            var userIds = [];
            for (var userId in users) {
                userIds.push(userId);
                var siblingSocket = userIdToSocket[userId];
                siblingSocket.emit(events.server.newUser, user.username);
            }
            /* Add the user id to the rooms list of users */
            dbClient.rooms.addUser(roomId, user.id);
            /* Send the client the current room info */
            dbClient.users.getUsernames(userIds, function(names) {
                names.push(user.username);
                socket.emit("register", {
                    id: roomId,
                    name: room.name,
                    usernames: names,
                    whiteboardModel: room.whiteboard
                });
                /* Allow the client to start receiving messages */
                registered = true;
                registerInProgress = false;
                /* Send queued data */
                for (var i = 0; i < queuedMessages.length; i++) {
                    var m = queuedMessages[i];
                    m.fn.call(null, m.args);
                }
                queuedMessages = [];
            });
        });
    };

    /* Returns true iff this socket has been registered */
    var isRegistered = function() {
        return registered;
    };

    /* Called when this client disconnects.
     * -Removes client from data structures
     * -Removes the client from the list of users in the correct room
     * -Notifies each client in the room the user disconnected */
    socket.on(events.client.disconnect, function(data) {
        console.log("DISCONNECTED");
        if (isRegistered() === false) return;
        console.log("DISCONNECTED AND REGISTERED");
        /* Remove from data structures */
        delete userIdToSocket[user.id];
        /* Remove the user from the room */
        dbClient.rooms.removeUser(roomId, user.id, function() {
            /* Notify each user in the room the client disconnected */
            dbClient.rooms.getUsers(roomId, function(users) {
                for (var userId in users) {
                    var siblingSocket = userIdToSocket[userId];
                    siblingSocket.emit(events.server.userDisconnect,
                                       user.username);
                }
            });
        });
    });

    /* Function that registers a protected (i.e you need to be registered)
     * function with this socket */
    var protectSocketFn = function(on, fn) {
        socket.on(on, function(data) {
            if (isRegistered() === false) {
                if (registerInProgress)
                    queuedMessages.push({fn: fn, args: [data]});
                else onError("You are not registered with this server");
            } else fn(data);
        });
    };

    /* You have twenty seconds to register before we throw an error */
    setTimeout(function() {
        if (isRegistered() === false) {
            console.log("Kicking client for not registering");
            onError("Your socket did not register with the server.");
        }
    }, 1000 * 20);

    /**************************************************************************/
    /* MESSAGE FUNCTIONS.                                                     */
    /*  Messages will be sent frequently, we use helpers to avoid unecessary  */
    /*  work being done.                                                      */
    /**************************************************************************/

    /* Helper function sending the message to the client */
    var sendMessage = function(users, data) {
        for (var userId in users) {
            var siblingSocket = userIdToSocket[userId];
            if (userId !== user.id) {
                siblingSocket.emit("message", {
                    username: user.username, message: data
                });
            }
        }
    };

    /* Broadcast a message from this socket to every member of this
     * sockets room */
    protectSocketFn("message", function(data) {
        dbClient.rooms.getUsers(roomId, function(users) {
            /* If this is a whiteboard module command, update
             * the database. */
            var module;
            if (util.exists(data["modCreate"])) {
                module = data["modCreate"];
                var onCreate = function(nextId) {
                    data = {modCreate: {nextId: nextId, model: module}};
                    sendMessage(users, data);
                };
                dbClient.rooms.setModule(roomId, module.id, module, onCreate);
            } else if (util.exists(data["modModify"])) {
                module = data["modModify"];
                var onMod = function(nextId) {
                    sendMessage(users, data);
                };
                dbClient.rooms.setModule(roomId, module.id, module, onMod);
            } else if (util.exists(data["modDelete"])) {
                var onDel = function() {
                    sendMessage(users, data);
                };
                dbClient.rooms.delModule(roomId, data["modDelete"], onDel);
            } else sendMessage(users, data);
        });
    });
});

process.on("uncaughtException", function(e) {
    console.error(e);
    for (var userId in userIdToSocket) {
        var socket = userIdToSocket[userId];
        socket.disconnect();
    }
    /* Reset data structures */
    userIdToSocket = {};
    /* Remove clients from rooms */
    dbClient.rooms.resetRooms();
});