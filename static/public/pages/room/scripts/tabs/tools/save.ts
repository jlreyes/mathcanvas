/*
 * Save tool
 */
/// <reference path="../../imports.ts">

class SaveTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Save", "Save the canvas.", "icon-save");
    }

    public init() {
        /* Add the on save callback */
        var page : RoomPage = this.getTab().getRoomPage();
        page.addResumeListener("save-canvas-input",
                               this.onSave.bind(this));
    }

    public onTap() {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var app = roomPage.getApp();
        /* Start a dialog asking the user for a name */
        var data = {
            context: {
                id: "save-canvas-input",
                title: "Save As",
                placeholder: "Name"
            }
        };
        app.startPage(new Intent(InputDialog, data));
    }

    public onSave(result) {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        /* Save the canvas */
        var modules = roomPage.getRoom().whiteboard.model.modules;
        var models = [];
        for (var id in modules) {
            var wModule = modules[id];
            var model = wModule.getModel();
            models.push(model);
        }
        localStorage[result] = JSON.stringify(models);
        /* Notify of success */
        var intentData = {
            context: {
                title: "Success",
                message: "Saved canas as \"" + result +  "\"",
                buttons: [{
                    text: "Okay",
                    callback: function() {
                        Globals.app.back();
                    }
                }]
            }
        };
        var app = roomPage.getApp();
        app.startPage(new Intent(SimpleDialog, intentData));
    }
}