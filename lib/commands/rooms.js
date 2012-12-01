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
    /* TODO Implement private rooms */
    if (roomType === "private") roomType = "public";
    /* Create the room */
    dbClient.rooms.createRoom(function(room) {
        jsonResponse.put("room", room);
        callback();
    }, {
        type: roomType,
        creator: user.id,
        name: roomName
    });
};