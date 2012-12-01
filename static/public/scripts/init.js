/*
 * App initialization
 */

/* Patches */
(function() {
    /* Patch request animation frame */
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(fn){
            setTimeout(function(){
                fn(Date.now());
            }, 1000/60);
        };
    /* Patch bind */
    if (Function.prototype.bind === undefined){
            Function.prototype.bind = function (bind) {
                var self = this;
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    return self.apply(bind || null, args);
                };
            };
    }
})();

/* Create a new app when the dom is ready */
$(document).ready(function() {
    /* Check with the server if we are logged in */
    $.getJSON("/json/session/getUser", function(data) {
        var user = null;
        if (Util.exists(data.user)) user = data.user;
        /* Determine the device type TODO */
        /* Create the app */
        Globals.app = new MobileApp(user);
        /* Create the first page */
        var startClass;
        if (Util.exists(user)) startClass = JoinRoomPage;
        else startClass = LoginPage;
        var intent = new Intent(startClass, {});
        Globals.app.startPage(intent);
    });
});