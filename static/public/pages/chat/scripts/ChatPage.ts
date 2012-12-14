/*
 * page-login.html page super class
 */
/// <reference path="./imports.ts"/>

/* Reference to pages*/
declare var RoomPage;
declare var JoinRoomPage;

/* Message interface */
declare interface Message {
    username : string;
    message: string;
}

/* Room interface */
declare interface Room {
    id: number;
    name: string;
    usernames: string[];
    messages : Message[];
    whiteboard: any;
}

class ChatPage extends Page {
    private mRoom : Room;
    private mMessageQueue : Message[];
    private mSocket : Socket;

    public onCreate(intentData : any) : void {
        /* Get the active socket connection and the passed
         * room id*/
        this.mRoom = intentData.room;
        this.mSocket = Globals.socket;
        this.mMessageQueue = this.mRoom.messages;
        /* Create the view */
        if (this.getApp() instanceof MobileApp)
            this.setView(new ChatMobileView(this));
        else throw "Unimplemented";
    }

    public onResume() {
        var view = <ChatView> this.getView();
        this.mSocket.addMessageCallback("message",
                                        "page-chat",
                                        this.onMessage.bind(this));
        /* Add new user and disconnect user callbacks */
        this.mSocket.setNewUserCallback(this.onNewUser.bind(this));
        this.mSocket.setDisconnectCallback(function() {
            var intentData = {destroy: true};
            var intent = new Intent(JoinRoomPage, intentData);
            this.getApp().startPage(intent);
        }.bind(this));
        var onDisconnect = this.onUserDisconnect.bind(this);
        this.mSocket.setUserDisconnectCallback(onDisconnect);      
    }

    public onPause() {
        this.mSocket.removeMessageCallback("message",
                                           "page-chat");
        this.mSocket.removeNewUserCallback();
        this.mSocket.removeDisconnectCallback();
        this.mSocket.removeUserDisconnectCallback();
    }

    /* Called when the user taps on list users */
    public onListUsersTap() {
        var app = this.getApp();
        var intentData = {
            context: {
                title: "Connected Users",
                items: this.mRoom.usernames
            }
        };
        app.startPage(new Intent(ListDialog, intentData));
    }

    /* Called when a new user connects */
    public onNewUser(username : string) {
        var room = this.mRoom;
        var view = <ChatView> this.getView();
        room.usernames.push(username);
        var msg = username + " has joined the room."
        view.displayNotification(msg, "green");
    }

    /* Called when a user disconnects */
    public onUserDisconnect(username : string) {
        var room = this.mRoom;
        var view = <ChatView> this.getView();
        var index = room.usernames.indexOf(username);
        room.usernames.splice(index, 1);
        var msg = username + " has left the room."
        view.displayNotification(msg, "red");
    }

    /* Called when we have received a message */
    public onMessage(username : string, message : string) {
        var view = <ChatView> this.getView();
        this.mMessageQueue.push({username: username, message: message});
        view.addMessage(username, message);
    }

    public onSendClicked(message : string) {
        /* Only send if the user typed something in */
        if (message.match(/^\s*$/)) return;
        var view = <ChatView> this.getView();
        var username = this.getApp().getUser().username;
        this.mMessageQueue.push({username: username, message: message});
        view.addMessage(username, message);
        this.mSocket.sendMessage("message", message);
    }

    /* 
     * GETTERS AND SETTERS 
     */
    public getMessages() : Message[] {
        return this.mMessageQueue;
    }
}