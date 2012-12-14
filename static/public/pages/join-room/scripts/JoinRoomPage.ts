/*
 * page-login.html page super class
 */
/// <reference path="./imports.ts"/>

/* Reference to the login page and room page*/
declare var LoginPage;
declare var RoomPage;

class JoinRoomPage extends Page {

    public onCreate() : void {
        /* Create the view */
        if (this.getApp() instanceof MobileApp)
            this.setView(new JoinRoomMobileView(this));
        else throw "Unimplemented";
    }

    public onResume() : void {
        /* Fill the rooms list */
        var view : JoinRoomView = <JoinRoomView> this.getView();
        view.refreshRoomsList();
        /* See if we just returned from a room */
        if (Util.exists(Globals.socket)) {
            Globals.socket.destroy();
            Globals.socket = null;
            /* Change the url */
            history.pushState({}, "", "/");
        } else {
            /* Check the url. If a number is appended to the url, take the
             * user to that room */
             var path : string = window.location.pathname;
             if (Util.exists(path) && path.length > 1) {
                 path = path.substring(1, path.length);
                 var id : number = parseInt(path, 10);
                 if (Util.exists(id) && !isNaN(id))
                    this.joinRoom(id);
             }
        }
    }

    /* Called when the user presses the "Create Room" button */
    public onCreateRoomTap() {
        var app = this.getApp();
        app.startPage(new Intent(CreateRoomDialog, {
            callPage: this
        }));
    }

    /* Called when the user presses the "Join Room" button */
    // TODO add room to "My Rooms"
    public onJoinRoomTap() {
        var view : JoinRoomView = <JoinRoomView> this.getView();
        var input = view.getJoinRoomInputJquery();
        var val = input.val();
        if (val.match(/^[0-9]+$/)) {
            this.joinRoom(parseInt(val));
            return;
        }
        /* If we get here the data was invalid */
        var context : SimpleDialogContext = {
            title : "Error", message : "Invalid room id.",
            buttons : [
                {
                    text : "Okay",
                    callback : function() {
                        Globals.app.back();
                    }
                }
            ]
        };
        var app = this.getApp();
        app.startPage(new Intent(SimpleDialog, {context: context}));
    }

    /* Called when we request to join a room with the given id */
    public joinRoom(id : number) {
        var app : App = this.getApp();
        /* Create the socket error callback */
        var onError = function(e : string) {
            app.startPage(new Intent(JoinRoomPage, {destroy: true}));
            var context = {
                title: "Error",
                message: e,
                buttons: [{
                    text: "Okay", callback: app.back.bind(app)
                }]
            };
            app.startPage(new Intent(SimpleDialog, {context: context}));
        };
        /* Create the socket */
        Globals.socket = new Socket(app.getUser(), id, onError);
        app.startPage(new Intent(RoomPage, {}));
    }

    /* Called when the login button is tapped */
    public logout() : void {
        Util.postJSON("session/logout", {}, function() {
            var app : App = this.getApp();
            app.setUser(null);
            app.back({backHint: LoginPage});
        }.bind(this));
    }

}

/* Create room dialog used by this view */
class CreateRoomDialog extends Dialog {
    private mCallPage : JoinRoomPage;
    public onCreate(intentData : any) {
        this.mCallPage = intentData.callPage;
        this.setView(new CreateRoomDialogView(this));
    }

    /* Create a room using the settings in the form */
    public createRoom() {
        var app : App = this.getApp();
        var view : CreateRoomDialogView = <CreateRoomDialogView> this.getView();
        var formData = view.getFormData();
        var postData = {
            name: formData.name, type: formData.type,
            width: formData.width, height: formData.height
        };
        var onFail = function(message) {
            app.back();
            var context : SimpleDialogContext = {
                title: "Error", message: message,
                buttons? : [{
                    text: "Okay",
                    callback: app.back.bind(app)
                }]
            };
            app.startPage(new Intent(SimpleDialog, {context: context}));
        }
        if (!formData.name.match(/^\w+$/)) {
            onFail("Invalid room name");
            return;
        }
        if (parseInt(formData.width, 10) <= 512 || 
                parseInt(formData.width, 10) >= 4096) {
            onFail("Width must be in range [512-4096]");
            return;
        }
        if (parseInt(formData.height, 10) <= 512 ||
                parseInt(formData.height, 10) >= 4096) {
            onFail("Height must be in range [512-4096]");
            return;
        }
        Util.postJSON("rooms/createRoom", postData, function(result) {
            var room = result.room;
            var view = <JoinRoomView> this.mCallPage.getView();
            view.addRoomListButton(room);
            app.getUser().rooms[room.id] = room;
            this.mCallPage.joinRoom(room.id);
        }.bind(this), {preventInput : true, back: true});
    }
}