/*
 * View for the Room page.
 */
/// <reference path="./imports.ts"/>

class RoomView extends PageView {
    private mName : any;
    private mCanvas : JQuery;
    private mToolContainer : JQuery;
    private mTabsContainer : JQuery;
    private mTabs : JQuery;
    private mChangeTab : JQuery;
    /* Notification properties */
    private mNotificationBox : JQuery;
    private mNotificationIcon : JQuery;
    private mNotificationTitle : JQuery;
    private mNotificationMsg : JQuery;
    private mLocked : bool = false;
    private mNotificationQueue : {title:string;message:string;}[] = [];

    constructor(page : Page) {
        super(page, RoomMobileView.sTemplate, {});
    }

    /*
     * SCALE FUNCTIONS
     */
    private mScale : number = 1;
    public zoomIn() {
        this.mScale += .1;
        this.mScale = Math.min(this.mScale, 3);
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform", scale);
    }

    public zoomOut() {
        this.mScale -= .1;
        this.mScale = Math.max(this.mScale, .1);
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform", scale);
    }

    /*
     * NOTIFICATION FUNCTIONS
     */

    /* Display a notification with the given title and message*/
    public displayNotification(title : string,
                               message: string,
                               iconName: string) {
        if (this.mLocked === true) {
            this.mNotificationQueue.push({
                title: title,
                message: message,
                iconName: iconName
            });
            return;
        }
        this.mLocked = true;
        this.mNotificationTitle.text(title);
        this.mNotificationMsg.text(message);
        var transEnd = Constants.TRANS_END_NAME;
        var height = this.mNotificationBox.outerHeight();
        var width = this.mNotificationBox.outerWidth();
        var left = this.getParent().outerWidth() / 2 - width / 2;
        /* Start the notification. We assume the notification box
         * is hidden at this point */
        this.mNotificationBox.removeClass("transition");
        this.mNotificationIcon.attr("class", iconName);
        this.mNotificationBox.css("display", "block");
        this.mNotificationBox.css("top", -height);
        this.mNotificationBox.css("left", left);
        /* Function that displays this transition */
        var showTransition = function() {
            this.mNotificationBox.addClass("transition");
            this.mNotificationBox.css("top", 0);
            this.mNotificationBox.bind(transEnd, hideTransition);
        }.bind(this);
        /* Function that hides this notification */
        var hideTransition = function() {
            this.mNotificationBox.unbind(transEnd, hideTransition);
            var hideAfterDelay = function() {
                this.mNotificationBox.css("top", -height);
                this.mNotificationBox.bind(transEnd, unlock);
            }.bind(this);
            setTimeout(hideAfterDelay, 1000);
        }.bind(this);
        /* Function that unlocks this view */
        var unlock = function() {
            this.mNotificationBox.unbind(transEnd, unlock);
            this.mNotificationBox.removeClass("transition");
            this.mLocked = false;
            var notification = this.mNotificationQueue.shift();
            if (Util.exists(notification))
                this.displayNotification(notification.title,
                                         notification.message);
        }.bind(this);
        /* Display the box after a delay */
        setTimeout(showTransition, 0);
    }

    /*
     * TAB FUNCTIONS
     */

    /* Hide all tabs */
    public hideTabs() {
        this.mTabsContainer.css("display", "none");
    }

    /* Display the active tab */
    public showTabs() {
        this.mTabsContainer.css("display", "block");
    }

    /*
     * EVENT FUNCTIONS
     */

    private onInflation(jquery : JQuery) : JQuery {
        var page : RoomPage = <RoomPage> this.getPage();
        /* If the name exists, add it, otherwise, store
         * the jquery element */
        var name = jquery.find("#room-name");
        if (Util.exists(this.mName)) {
            name.text(this.mName);
        } else this.mName = name;
        /* Get references */
        this.mTabsContainer = jquery.find("#tool-controls-container");
        this.mCanvas = jquery.find("#canvas");
        this.mToolContainer = jquery.find("#module-tools-container");
        this.mNotificationBox = jquery.find("#notification-box");
        this.mNotificationTitle = this.mNotificationBox.find(">h1");
        this.mNotificationIcon = this.mNotificationBox.find(">i");
        this.mNotificationMsg = this.mNotificationBox.find(">p");
        /* Set up the canvas scaling */
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform-origin", "left top");
        this.mCanvas.css("transform", scale);
        /* Set the scroll callback */
        jquery.find("#whiteboard-container").scroll(function(e) {
        });
        /* Tab button logic */
        this.mChangeTab = jquery.find("#button-change-tab");
        this.mChangeTab
            .hammer({})
            .bind("tap", page.onTabTapped.bind(page));
        /* Chat button */
        jquery.find("#room-chat-button")
              .hammer({})
              .bind("tap", page.onChatTapped.bind(page));
        /* Set the tabs */
        var tabs : Tab[] = page.getTabs();
        for (var i = 0; i < tabs.length; i++)
            tabs[i].onPageInflation(jquery);
        /* Set the first tab */
        this.mTabs = jquery.find(".tab");
        this.onChangeTab(page.getTab());
        return jquery;
    }

    public onRegister(room : Room) {
        /* Set the room name */
        var str = room.name + " (" + room.id + ")";
        if (!Util.exists(this.mName)) this.mName = str;
        else this.mName.text(str);
    }

    /* Update the tab button text */
    public onChangeTab(tab : Tab) {
        this.mTabs.css("display", "none");
        var icon = this.mChangeTab.find("i");
        icon.attr("class", tab.getIconName());
        icon.addClass("icon-large");
        this.mChangeTab.find("p").text(tab.getName());
        tab.display();
    }

    /*
     * GETTERS AND SETTERS
     */
    public getCanvas() : JQuery {
        return this.mCanvas;
    }

    public getToolContainer() : JQuery {
        return this.mToolContainer;
    }
}