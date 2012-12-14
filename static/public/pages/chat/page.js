var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ChatView = (function (_super) {
    __extends(ChatView, _super);
    function ChatView(page) {
        var app = page.getApp();
        var context = {
            username: app.getUser().username
        };
        _super.call(this, page, ChatMobileView.sTemplate, context);
    }
    ChatView.prototype.onInflation = function (jquery) {
        var page = this.getPage();
        this.mMessages = jquery.find("#chat-messages");
        jquery.find("#chat-list-users-button").hammer({
        }).bind("tap", page.onListUsersTap.bind(page));
        var messages = (this.getPage()).getMessages();
        for(var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            this.addMessage(msg.username, msg.message);
        }
        var chatTextArea = jquery.find("#chat-textarea");
        jquery.find("#chat-send-button").hammer({
        }).bind("tap", function () {
            page.onSendClicked(chatTextArea.val());
            chatTextArea.val("");
        }.bind(page));
        return jquery;
    };
    ChatView.prototype.addMessage = function (username, message) {
        var mBox = $("<div class='message box'></div>");
        mBox.append($("<h2>" + username + "</h2>"));
        mBox.append($("<p>" + message + "</p>"));
        mBox.css("opacity", "0");
        this.mMessages.prepend(mBox);
        setTimeout(function () {
            mBox.css("transition", "opacity .3s ease-in-out");
            mBox.css("opacity", "1");
        }, 60);
    };
    ChatView.prototype.displayNotification = function (message, color) {
        var msg = $("<div class='message box'></div>");
        var not = $("<p>" + message + "</p>");
        not.css("color", color);
        msg.append(not);
        msg.css("opacity", 0);
        this.mMessages.prepend(msg);
        setTimeout(function () {
            msg.css("transition", "opacity .3s ease-in-out");
            msg.css("opacity", "1");
        }, 60);
    };
    return ChatView;
})(PageView);
var ChatMobileView = (function (_super) {
    __extends(ChatMobileView, _super);
    function ChatMobileView() {
        _super.apply(this, arguments);

    }
    ChatMobileView.sTemplate = new Template("page-chat-mobile");
    return ChatMobileView;
})(ChatView);
var ChatPage = (function (_super) {
    __extends(ChatPage, _super);
    function ChatPage() {
        _super.apply(this, arguments);

    }
    ChatPage.prototype.onCreate = function (intentData) {
        this.mRoom = intentData.room;
        this.mSocket = Globals.socket;
        this.mMessageQueue = this.mRoom.messages;
        if(this.getApp() instanceof MobileApp) {
            this.setView(new ChatMobileView(this));
        } else {
            throw "Unimplemented";
        }
    };
    ChatPage.prototype.onResume = function () {
        var view = this.getView();
        this.mSocket.addMessageCallback("message", "page-chat", this.onMessage.bind(this));
        this.mSocket.setNewUserCallback(this.onNewUser.bind(this));
        this.mSocket.setDisconnectCallback(function () {
            var intentData = {
                destroy: true
            };
            var intent = new Intent(JoinRoomPage, intentData);
            this.getApp().startPage(intent);
        }.bind(this));
        var onDisconnect = this.onUserDisconnect.bind(this);
        this.mSocket.setUserDisconnectCallback(onDisconnect);
    };
    ChatPage.prototype.onPause = function () {
        this.mSocket.removeMessageCallback("message", "page-chat");
        this.mSocket.removeNewUserCallback();
        this.mSocket.removeDisconnectCallback();
        this.mSocket.removeUserDisconnectCallback();
    };
    ChatPage.prototype.onListUsersTap = function () {
        var app = this.getApp();
        var intentData = {
            context: {
                title: "Connected Users",
                items: this.mRoom.usernames
            }
        };
        app.startPage(new Intent(ListDialog, intentData));
    };
    ChatPage.prototype.onNewUser = function (username) {
        var room = this.mRoom;
        var view = this.getView();
        room.usernames.push(username);
        var msg = username + " has joined the room.";
        view.displayNotification(msg, "green");
    };
    ChatPage.prototype.onUserDisconnect = function (username) {
        var room = this.mRoom;
        var view = this.getView();
        var index = room.usernames.indexOf(username);
        room.usernames.splice(index, 1);
        var msg = username + " has left the room.";
        view.displayNotification(msg, "red");
    };
    ChatPage.prototype.onMessage = function (username, message) {
        var view = this.getView();
        this.mMessageQueue.push({
            username: username,
            message: message
        });
        view.addMessage(username, message);
    };
    ChatPage.prototype.onSendClicked = function (message) {
        if(message.match(/^\s*$/)) {
            return;
        }
        var view = this.getView();
        var username = this.getApp().getUser().username;
        this.mMessageQueue.push({
            username: username,
            message: message
        });
        view.addMessage(username, message);
        this.mSocket.sendMessage("message", message);
    };
    ChatPage.prototype.getMessages = function () {
        return this.mMessageQueue;
    };
    return ChatPage;
})(Page);
//@ sourceMappingURL=page.js.map
