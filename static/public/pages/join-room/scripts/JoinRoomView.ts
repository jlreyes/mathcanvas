/*
 * View for the login page.
 */
/// <reference path="./imports.ts"/>

declare interface Room {
    id: number; name: string;
}

class JoinRoomView extends PageView {
    private mJoinRoom : JQuery;
    private mRoomList : JQuery;
    private mNumRooms : number;

    constructor(page : Page) {
        var app : App = page.getApp();
        var context = {
            username: app.getUser().username
        };
        super(page, JoinRoomMobileView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) : JQuery {
        var page : JoinRoomPage = <JoinRoomPage> this.getPage();
        var app : App = page.getApp();
        /* Logout logic */
        var logoutButton = jquery.find("#button-logout");
        logoutButton.hammer({}).bind("tap", page.logout.bind(page));
        /* Create room logic */
        var createRoom = jquery.find("#button-create");
        createRoom.hammer({}).bind("tap", 
                                    page.onCreateRoomTap.bind(page));
        /* Join room logic */
        this.mJoinRoom = jquery.find("#form-join-room-id");
        var joinRoomButton = jquery.find("#form-join-room-submit");
        joinRoomButton.hammer({}).bind("tap", page.onJoinRoomTap.bind(page));
        /* Button list logic */
        this.mRoomList = jquery.find("ul.button-list");
        return jquery;
    }

    public refreshRoomsList() {
        this.mNumRooms = 0;
        var user = Globals.app.getUser();
        for (var roomKey in user.rooms) {
            var room = user.rooms[roomKey];
            this.addRoomListButton(room);
            this.mNumRooms++;
        }
        if (this.mNumRooms === 0)
            this.mRoomList.text("You have no rooms.");
    }

    public addRoomListButton(room : Room) {
        if (this.mNumRooms === 0) this.mRoomList.html("");
        this.mNumRooms++;
        /* Create the button */
        var page : JoinRoomPage = <JoinRoomPage> this.getPage();
        var button = $("<li></li>");
        button.text(room.name);
        this.mRoomList.append(button);
        /* Button callback */
        button.hammer({}).bind("tap", function(e) {
            page.joinRoom(room.id);
        });
    }

    public getJoinRoomInputJquery() {
        return this.mJoinRoom;
    }
}

class CreateRoomDialogView extends DialogView {
    private static sTemplate : Template = new Template("dialog-create-room");
    private mRoomType : JQuery;
    private mRoomName : JQuery;
    private mRoomWidth : JQuery;
    private mRoomHeight : JQuery;

    constructor(dialog : CreateRoomDialog) {
        super(dialog, CreateRoomDialogView.sTemplate, {});
    }

    private onInflation(jquery : JQuery) {
        var page : CreateRoomDialog = <CreateRoomDialog> this.getPage();
        /* Get references */
        this.mRoomType = jquery.find("#form-create-room-type");
        this.mRoomName = jquery.find("#form-create-room-name");
        this.mRoomWidth = jquery.find("#form-create-room-width");
        this.mRoomHeight = jquery.find("#form-create-room-height");
        /* Add the button callbacks */
        jquery.find("#form-create-room-submit")
              .hammer({})
              .bind("tap", page.createRoom.bind(page));
        return jquery;
    }

    public getFormData() {
        return {
            name: this.mRoomName.val(),
            type: this.mRoomType.val().toLowerCase(),
            width: this.mRoomWidth.val(),
            height: this.mRoomHeight.val()
        }
    }
}