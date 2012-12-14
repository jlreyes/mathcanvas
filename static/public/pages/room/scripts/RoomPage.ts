/*
 * page-login.html page super class
 */
/// <reference path="./imports.ts"/>

/* Reference to the login page */
declare var JoinRoomPage;
declare var ChatPage;

class RoomPage extends Page {
    private mRoom : Room;
    private mTabs : Tab[];
    private mActiveTabIndex : number;
    private mSocket : Socket;
    private mResumeListeners : {
        [id : string] : any[];
    } = {};

    /* Clear the canvas */
    public clearCanvas() {
        var modules = this.mRoom.whiteboard.model.modules;
        for (var id in modules) {
            var moduleGah = modules[id];
            moduleGah.destroy();
        }
    }

    /* Select the given tab */
    public selectTab(tab : Tab) {
        if (this.getTab() === tab) return;
        this.mActiveTabIndex = this.mTabs.indexOf(tab);
        var view : RoomView = <RoomView> this.getView();
        view.onChangeTab(tab);
    }

    /* Add a listener that will fire when we receive data with id of id
     * on resume of this page */
    public addResumeListener(id : string,
                             callback : (value : any) => void) {
        if (!Util.exists(this.mResumeListeners[id]))
            this.mResumeListeners[id] = [];
        this.mResumeListeners[id].push(callback);
    }

    /*
     * EVENT LISTENERS
     */

    public onCreate() : void {
        var app = this.getApp();
        /* Get the active socket connection */
        this.mSocket = Globals.socket;
        /* Initialize our tabs */
        this.mTabs = [];
        this.mTabs.push(new ManipulateTab(this));
        this.mTabs.push(new MiscTab(this));
        this.mActiveTabIndex = 0;
        /* Create the view */
        if (this.getApp() instanceof MobileApp)
            this.setView(new RoomMobileView(this));
        else throw "Unimplemented";
        /* Tell the socket to start registration */
        this.mSocket.register(this.onRegister.bind(this));
        /* Add tab select callback */
        this.addResumeListener("select-tab", function(value) {
            for (var i = 0; i < this.mTabs.length; i++) {
                if (this.mTabs[i].getName() === value) {
                    this.selectTab(this.mTabs[i]);
                    break;
                }
            }
        }.bind(this));
    }

    public onResume(data? : any) {
        var i;
        /* Add message get callback */
        this.mSocket.addMessageCallback("message",
                                        "page-room-message",
                                        this.onMessage.bind(this));
        /* Add module create callback */
        this.mSocket.addMessageCallback("modCreate",
                                        "page-room-mod-create",
                                        this.onModCreate.bind(this));
        /* Add module modify callback */
        this.mSocket.addMessageCallback("modModify",
                                        "page-room-mod-modify",
                                        this.onModModify.bind(this));
        /* Add module delete callback */
        this.mSocket.addMessageCallback("modDelete",
                                        "page-room-mod-delete",
                                        this.onModDelete.bind(this));
        /* Add disconnect callback */
        this.mSocket.setDisconnectCallback(function() {
            this.getApp().back();
        }.bind(this));
        /* Add new user and disconnect user callbacks */
        this.mSocket.setNewUserCallback(this.onNewUser.bind(this));
        var onDisconnect = this.onUserDisconnect.bind(this);
        this.mSocket.setUserDisconnectCallback(onDisconnect);
        /* Deal with sent data if it exists */
        if (!Util.exists(data)) return;
        if (!Util.exists(data.id)) return;
        var callbacks = this.mResumeListeners[data.id];
        if (!Util.exists(callbacks)) return;
        for (var i = 0; i < callbacks.length; i++)
            callbacks[i](data.result);
    }

    public onPause() {
        /* Remove module create callback */
        this.mSocket.removeMessageCallback("modCreate",
                                           "page-room-mod-create");
        /* Modify module modify callback */
        this.mSocket.removeMessageCallback("modModify",
                                         "page-room-mod-modify");
        /* Modify module modify callback */
        this.mSocket.removeMessageCallback("modDelete",
                                           "page-room-mod-delete");
        /* Remove message get callback */
        this.mSocket.removeMessageCallback("message",
                                           "page-room-message");
        /* Remove disconnect callback */
        this.mSocket.removeDisconnectCallback();
        /* Remove new user and user disconnect callbacks */
        this.mSocket.removeNewUserCallback();
        this.mSocket.removeUserDisconnectCallback();
    }

    /* Called when we have registered */
    public onRegister(roomInfo : RoomInfo) {
        var view : RoomView = <RoomView> this.getView();
        /* Make sure that the view is inflated. and that the transition
         * if over. If it is not, we have no choice but to wait for it to*/
        if (view.isInflated() === false ||
                this.getTransitionOver() === false) {
            setTimeout(function() {
                this.onRegister.call(this, roomInfo);
            }.bind(this), 1000 / 60);
            return;
        }
        /* Change the url */
        history.pushState({}, "/", roomInfo.id);
        /* Create the whiteboard view */
        var canvas = view.getCanvas();
        var toolview = view.getToolContainer();
        var whiteboard = roomInfo.whiteboardModel;
        var dim = {width: whiteboard.width, height: whiteboard.height};
        var whiteboardView = new WhiteboardView(view, canvas, toolview, dim);
        /* Convert next id to an int */
        var model : any = roomInfo.whiteboardModel;
        model.nextId = parseInt(model.nextId);
        /* create the room */
        var room = {
            id: parseInt(roomInfo.id),
            name: roomInfo.name,
            usernames: roomInfo.usernames,
            messages: [],
            whiteboard: {
                model: model,
                view: whiteboardView /* populated by roomview */
            }
        };
        this.mRoom = room;
        /* Add this room to the user's list of rooms if it doesn't already
         * exist. */
        var usersRooms = this.getApp().getUser().rooms;
        if (!Util.exists(usersRooms[room.id])) {
            usersRooms[room.id] = {
                id: roomInfo.id, name: room.name
            };
        }
        /* Register the room with the view */
        view.onRegister(this.mRoom);
        /* Draw the current models */
        var moduleIds = [];
        for (var moduleId in model.modules) {
            moduleIds.push(moduleId);
        }
        for (var i = 0; i < moduleIds.length; i++) {
            moduleId = moduleIds[i];
            var moduleModel = model.modules[moduleId];
            var construct = Globals.whiteboardModules[moduleModel.className];
            var module = new construct(this, room.whiteboard, moduleModel);
        }
    }

    /* Called when a new user connects */
    public onNewUser(username : string) {
        var room = this.mRoom;
        var view : RoomView = <RoomView> this.getView();
        room.usernames.push(username);
        var msg = username + " has joined the room."
        view.displayNotification("New User", msg, "icon-signin");
    }

    /* Called when a user disconnects */
    public onUserDisconnect(username : string) {
        var room = this.mRoom;
        var view : RoomView = <RoomView> this.getView();
        var index = room.usernames.indexOf(username);
        room.usernames.splice(index, 1);
        var msg = username + " has left the room."
        view.displayNotification("User Disconnected", msg, "icon-signout");
    }

    /* Called when we have received a message */
    public onMessage(username : string, message : string) {
        var view : RoomView = <RoomView> this.getView();
        this.mRoom.messages.push({username: username, message: message});
        view.displayNotification(username, message, "icon-comment-alt");
    }

    /* Called when a module has been created by an external user */
    public onModCreate(username : string, data : any) {
        console.log("From:",  username, "Create:", data);
        var model = data.model;
        var whiteboard = this.mRoom.whiteboard;
        /* Store the new next id */
        whiteboard.model.nextId = data.nextId;
        /* Create the module */
        var construct = Globals.whiteboardModules[model.className];
        var module = new construct(this, whiteboard, model);
    }

    /* Called when a module has been modified by an external user */
    public onModModify(username: string, model : WhiteboardModuleModel) {
        var whiteboard = this.mRoom.whiteboard.model;
        var id = model.id;
        whiteboard.modules[id].onModify(model);
    }

    /* Called when a module has been deleted by an external user */
    public onModDelete(username: string, moduleId : number) {
        var whiteboard = this.mRoom.whiteboard.model;
        whiteboard.modules[moduleId].onDestroy();
    }

    /* Called when the tab button is tapped */
    public onTabTapped() {
        var intentData = {
            context: {
                id: "select-tab",
                items : []
            }
        };
        var items = intentData.context.items;
        for (var i = 0; i < this.mTabs.length; i++) {
            var tabName = this.mTabs[i].getName();
            items.push({
                text: tabName, value: tabName
            });
        }
        var intent : Intent = new Intent(SelectDialog, intentData);
        this.getApp().startPage(intent);
    }

    /* Called when the chat button is tapped */
    public onChatTapped() {
        var app = this.getApp();
        var intentData = {
            room: this.mRoom
        };
        var intent : Intent = new Intent(ChatPage, intentData);
        app.startPage(intent);
    }

    /*
     * GETTERS AND SETTERS
     */
    public getTab() : Tab {
        return this.mTabs[this.mActiveTabIndex];
    }

    public getTabs() : Tab[] {
        return this.mTabs;
    }

    public getRoom() : Room {
        return this.mRoom;
    }
}