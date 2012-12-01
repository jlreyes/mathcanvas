/*
 * Session commands
 */
var passport = require("passport");
var PassportLocalStrategy = require('passport-local').Strategy;
var dbClient = require("../DbClient.js");
var util = require("../Util.js");

exports.passport = passport;

/* Puts null iff there is no user logged in */
exports.getUser = function(request, response,
                                    jsonResponse, callback) {
    if(!util.exists(request.user)) {
        jsonResponse.put("user", null);
        callback();
        return;
    }
    var user = {
        id: request.user.id,
        username: request.user.username,
        rooms: {}
    };
    dbClient.users.getById(user.id, function(res) {
        if (!util.exists(res) ||
                user.username !== res.username) {
            jsonResponse.putError("Server error.");
            callback();
            return;
        };
        user.rooms = res.rooms;
        jsonResponse.put("user", user);
        callback();
    });
};

exports.register = function(request, response,
                                     jsonResponse, callback) {
    var username = request.param("username");
    var password = request.param("password"); // TODO UNENCRYPT
    if (!util.exists(username)) throw "No username given";
    if (!util.exists(password)) throw "No password given";
    /* Verify the username and password are valid */
    if (username === "") throw "Invalid username";
    if (password === "") throw "Invalid password";
    /* Recaptcha data */
    var data = {
        remoteip:  request.connection.remoteAddress,
        challenge: request.param("challenge"),
        response:  request.param("response")
    };
    var recaptcha = new Recaptcha(globals.RE_PUBLIC_KEY,
                                  globals.RE_PRIVATE_KEY, data);
    recaptcha.verify(function(success, error_code) {
        /* On success, register the user */
        if (success) {
            dbClient.users.register(username, password, function(e) {
                if (util.exists(e))
                    jsonResponse.putError(e);
                else jsonResponse.put("result", "success");
                callback();
            });
        } else {
            jsonResponse.putError("Recaptcha incorrect.");
            callback();
        }
    });
};

exports.logout = function(request, response, jsonResponse, callback) {
    request.logout();
    jsonResponse.put("result", "success");
    callback();
};

exports.login = function(request, response, jsonResponse, callback) {
    var method = request.param("method", null);
    var username = request.param("username", null);
    var password = request.param("password", null); // TODO encyrpt
    if (!util.exists(method)) throw "No method given.";
    if (!util.exists(username)) throw "No username given";
    if (!util.exists(password)) throw "No password given.";
    /* Authenticate using passport */
    passport.authenticate(method, function(e, user, info) {
        var successKey = "success";
        var successValue = false;
         if (util.exists(e) || user === false) {
            if (util.exists(e)) info = e;
            jsonResponse.putError(info);
            callback();
            return;
        }
        /* The user should always be valid as defined by our passportlocalstrategy
         * below */
        jsonResponse.put("result", successKey);
        request.login(user, function(e) {
            return;
        });
        callback();
    })(request, response);
};

/* -----------------------------------------------------------------------------
 * PASSPORT STRATEGIES
 * -----------------------------------------------------------------------------
 * For all strategies, we assume the given usernames and passwords are
 * unecrypted and non-null/undefined
 */
/* User serialization */
passport.serializeUser(function(user, done) {
    var serializedUser = {
        id : user.id,
        username : user.username,
        rooms : user.rooms
    };
    done(null, JSON.stringify(serializedUser));
});

passport.deserializeUser(function(sUser, done) {
    var serializedUser = JSON.parse(sUser);
    dbClient.users.getById(serializedUser.id, function(user) {
        done(null, user);
    });
});

/* Set up a strategy to use for local authentication */
passport.use(new PassportLocalStrategy(
    function(username, password, done) {
        dbClient.users.getId(username, function(id) {
            if (id === -1) {
                done(null, false, "Invalid username");
                return;
            }
            /* If we get here, the username is valid */
            dbClient.users.getById(id, function(user) {
                if (user.password !== password) {
                    done(null, false, "Invalid password");
                    return;
                }
                done(null, user);
            });
        });
}));