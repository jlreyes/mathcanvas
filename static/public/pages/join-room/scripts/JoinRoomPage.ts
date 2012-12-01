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

    /* Called when the user presses the "Create Room" button */
    public onCreateRoomTap() {
        var app = this.getApp();
        app.startPage(new Intent(CreateRoomDialog, {
            callPage: this
        }));
    }

    /* Called when the user presses the "Join Room" button */
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
        app.startPage(new Intent(RoomPage, {id : id}));
    }

    /* Called when the login button is tapped */
    public logout() : void {
        Util.postJSON("session/logout", {}, function() {
            var app : App = this.getApp();
            app.setUser(null);
            app.startPage(new Intent(LoginPage, {
                destroy: true
            }));
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
            name: formData.name, type: formData.type
        };
        if (!formData.name.match(/^\w+$/)) {
            app.back();
            var context : SimpleDialogContext = {
                title: "Error", message: "Invalid room name",
                buttons? : [{
                    text: "Okay",
                    callback: app.back.bind(app)
                }]
            };
            app.startPage(new Intent(SimpleDialog, {context: context}));
            return;
        }
        Util.postJSON("rooms/createRoom", postData, function(result) {
            var room = result;
            var view = <JoinRoomView> this.mCallPage.getView();
            view.addRoomListButton(room);
            app.getUser().rooms[room.id] = room;
            this.mCallPage.joinRoom(room.id);
        }.bind(this), {preventInput : true, back: true});
    }
}