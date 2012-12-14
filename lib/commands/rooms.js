/*
 * Room commands
 */
var dbClient = require("../DbClient.js");
var util = require("../Util.js");

exports.createRoom = function(request, response, jsonResponse, callback) {
    /* Function we will call on fail*/
    var onFail = function(reason) {
        jsonResponse.putError(reason);
        callback();
    };
    /* Verify the user is logged in */
    var user = request.user;
    if (!util.exists(user)) {
        onFail("You are not logged in.");
        return;
    }
    /* Verify the data given is valid */
    var roomName = request.param("name");
    if (!util.exists(roomName)) {
        onFail("No room name given.");
        return;
    }
    var roomType = request.param("type");
    if (!util.exists(roomType)) {
        onFail("No room type given.");
        return;
    }
    if (!roomName.match(/\w+/)) {
        onFail("Invalid room name: " + roomName);
        return;
    }
    if (roomType !== "private" &&
            roomType !== "public") {
        onFail("Invalid room type: " + roomType);
        return;
    }
    var width = request.param("width");
    if (!util.exists(width)) {
        onFail("No width given.");
        return;
    }
    if (isNaN(width) || !util.exists(width)) {
        onFail("Invalid Width");
        return;
    }
    var height = request.param("height");
    if (!util.exists(width) || !util.exists(height)) {
        onFail("No height given.");
        return;
    }
    height = parseInt(height, 10);
    if (isNaN(height)) {
        onFail("Invalid Height");
        return;
    }
    if (width <= 512) {
        onFail("Width too small");
        return;
    }
    if (height <= 512) {
        onFail("Height too small");
        return;
    }
    /* TODO Implement private rooms */
    if (roomType === "private") roomType = "public";
    /* Create the room */
    dbClient.rooms.createRoom(function(res) {
        var room = {
            id : res.id,
            name : res.name,
            width: width,
            height: height
        };
        jsonResponse.put("room", room);
        callback();
    }, {
        type: roomType,
        name: roomName,
        width: width,
        height: height
    });
};

exports.getRoomInfo = function(request, response, jsonResponse, callback) {
    /* Function we will call if there is a problem */
    var onFail = function(reason) {
        jsonResponse.putError(reason);
        callback();
    };
    /* Make sure the user is logged in */
    var user = request.user;
    if (!util.exists(user)) {
        onFail("You are not logged in.");
        return;
    }
    /* Get the id of the room */
    var id = request.param("id");
    if (!util.exists(id)) {
        onFail("No id given.");
        return;
    }
    /* Get the room */
    var room = dbClient.rooms.getRoom(id, function(room) {
        /* Make sure the room exists */
        if (room === null) {
            onFail("Room " + id + " does not exist.");
            return;
        }
        /* Make sure the user has access to this room */
        if (room.type === "private") {
            if (!(user.id in room.permittedUsers)) {
                onFail("You do not have permission to access this room.");
            }
        }
        /* If we get here, send the user the room */
        jsonResponse.put("room", {
            id: room.id, name: room.name
        });
        callback();
    });
};