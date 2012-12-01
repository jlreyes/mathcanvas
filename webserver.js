/*
 * Web Server for Math Canvas
 * Author: jlreyes
 */
/* -----------------------------------------------------------------------------
 * IMPORTS
 * -----------------------------------------------------------------------------
 */
/* Modules */
var express = require("express");
var Recaptcha = require('recaptcha').Recaptcha;

/* Local libraries */
var globals = require("./lib/Globals.js");
var dbClient = require("./lib/DbClient.js");
var JsonResponse = require("./lib/JsonResponse.js");
var util = require("./lib/Util.js");

/* -----------------------------------------------------------------------------
 * JSON COMMANDS
 * -----------------------------------------------------------------------------
 */
var commands = {};
commands.session = require("./lib/commands/session.js");
var passport = commands.session.passport;
commands.rooms = require("./lib/commands/rooms.js");

/* -----------------------------------------------------------------------------
 * INITIALIZATION
 * -----------------------------------------------------------------------------
 */
var server = express();
server.configure(function() {
    /* First, get the cookies from the user */
    server.use(express.cookieParser(globals.secret));
    /* Decode forms */
    server.use(express.bodyParser());
    /* Enable express sessions */
    server.use(express.session({secret: globals.secret}));
    /* Passport */
    server.use(passport.initialize());
    server.use(passport.session());
    /* Route to the sp);
ecific pages */
    server.use(server.router);
    /* Route non-special cases */
    server.use(express.static(__dirname + "/static/public"));
    /* Send a 404 if we get here */
    server.use(function(request, response, next) {
        sendError(response, "Page not found", "Sorry :(");
    });
});

/* Handling uncaught exceptions */
var onUncaughtException = function(e) {
    console.error(e);
};
process.on("uncaughtException", onUncaughtException);

server.listen(80);

/* -----------------------------------------------------------------------------
 * ROUTES
 * -----------------------------------------------------------------------------
 *  / -> private/home/home.html
 *  /[number] -> room.html // TODO
 *  /json/:module/:command -> commands[<module>][<command>]()
 */

/* Sends the user to the error page, passing the given error */
var sendError = function(response, title, message) {
    var error = {
        title: title, message: message
    };
    response.send(404, JSON.stringify(error));
};

/* Process json command */
server.all("/json/:module/:command", function(request, response) {
    var jsonResponse = JsonResponse.create();
    /* Callback that writes the response */
    var callback = function() {
        response.header("Cache-control", "no-cache");
        response.write(jsonResponse.stringify());
        response.end();
    };
    /* Attempt to execute the given function */
    try {
        var module = request.params.module;
        var command = request.params.command;
        commands[module][command](request, response, jsonResponse, callback);
    } catch(e) {
        jsonResponse.putError(e.toString());
        callback();
    }
});


/* -----------------------------------------------------------------------------
 * MISC
 * -----------------------------------------------------------------------------
 * Every globals.roomReapTime seconds we destroy all rooms
 * that have a last access time of greater than globals.roomTimeout
 */
var reapRooms = function() {
    console.log("Reaping rooms...");
    dbClient.rooms.getRooms(function(rooms) {
        console.log("Rooms:", rooms);
        for (var roomId in rooms) {
            dbClient.rooms.getLastAccessTime(roomId, (function(rid) {
                return function(time) {
                    var lastAccessTime = parseInt(time, 10);
                    var curTime = new Date().getTime();
                    var deltaTime = curTime - lastAccessTime;
                    if (deltaTime > Globals.roomTimeout) {
                        dbClient.removeRoom(rid, function() {
                            console.log("Removed room", rid);
                        });
                    }
                };
            })(roomId));
        }
        /* Call this function again in Globals.roomReapTime */
        setTimeout(reapRooms, globals.roomReapTime);
    });
};
reapRooms();