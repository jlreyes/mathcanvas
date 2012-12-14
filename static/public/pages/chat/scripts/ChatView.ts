/*
 * View for the login page.
 */
/// <reference path="./imports.ts"/>

class ChatView extends PageView {
    private mMessages : JQuery;

    constructor(page : ChatPage) {
        var app : App = page.getApp();
        var context = {
            username: app.getUser().username
        };
        super(page, ChatMobileView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) : JQuery {
        var page : ChatPage = <ChatPage> this.getPage();
        /* Get references */
        this.mMessages = jquery.find("#chat-messages");
        /* Add users button logic */
        jquery.find("#chat-list-users-button")
              .hammer({})
              .bind("tap", page.onListUsersTap.bind(page));
        /* Add messages */
        var messages = (<ChatPage> this.getPage()).getMessages();
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            this.addMessage(msg.username, msg.message);
        }
        /* Add send button logic */
        var chatTextArea = jquery.find("#chat-textarea");
        jquery.find("#chat-send-button")
              .hammer({})
              .bind("tap", function() {
                page.onSendClicked(chatTextArea.val());
                chatTextArea.val("");
               }.bind(page));
        return jquery;
    }

    public addMessage(username : string, message : string) {
        var mBox = $("<div class='message box'></div>");
        mBox.append($("<h2>" + username + "</h2>"));
        mBox.append($("<p>" + message + "</p>"));
        mBox.css("opacity", "0");
        this.mMessages.prepend(mBox);
        setTimeout(function() {
            mBox.css("transition", "opacity .3s ease-in-out");
            mBox.css("opacity", "1");
        }, 60);
    }

    public displayNotification(message : string, color : string) {
        var msg = $("<div class='message box'></div>");
        var not = $("<p>" + message +"</p>");
        not.css("color", color);
        msg.append(not);
        msg.css("opacity", 0);
        this.mMessages.prepend(msg)
        setTimeout(function() {
            msg.css("transition", "opacity .3s ease-in-out");
            msg.css("opacity", "1");
        }, 60);
    }
}