/*
 * Load Tool
 */
/// <reference path="../../imports.ts">

class LoadTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Load", "Load a saved canvas.", "icon-file");
    }

    public init() {
        /* Add the on save callback */
        var page : RoomPage = this.getTab().getRoomPage();
        page.addResumeListener("load-canvas",
                               this.onLoadSelect.bind(this));
    }

    public onTap() {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var app = roomPage.getApp();
        /* Make sure there is the user has stored a canvas */
        if (localStorage.length === 0) {
            var errorIntentData = {
                context: {
                    title: "Error",
                    message: "You have no saved canvases!",
                    buttons: [{
                        text: "Okay",
                        callback: function() {
                            Globals.app.back();
                        }
                    }]
                }
            };
            app.startPage(new Intent(SimpleDialog, errorIntentData));
            return;
        }
        var items = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            items.push({
                text: key, value: key
            });
        }
        /* Start a dialog asking the user for a name */
        var data = {
            context: {
                id: "load-canvas",
                title: "Select a canvas",
                items: items
            }
        };
        app.startPage(new Intent(SelectDialog, data));
    }

    /* Called when we have selected the name we want to load */
    public onLoadSelect(key : string) {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var socket = Globals.socket;
        var whiteboard = roomPage.getRoom().whiteboard;
        var models = JSON.parse(localStorage[key]);
        /* We are replacing this canvas, so clear the current stuff */
        roomPage.clearCanvas();
        /* Create the new models*/
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            /* Change the id */
            model.id = whiteboard.model.nextId;
            whiteboard.model.nextId++;
            /* Change the author */
            model.author = Globals.app.getUser().username;
            /* Change the layer */
            model.layer = whiteboard.view.getNextFreeLayer();
            /* Create the module */
            var construct = Globals.whiteboardModules[model.className];
            var m = new construct(roomPage, whiteboard, model);
            /* Send a creation event */
            socket.sendMessage("modModify", m.getModel());
        }
        /* Delete this key */
        delete localStorage[key];
    }
}