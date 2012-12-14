/*
 * Add Tool
 */
/// <reference path="../../imports.ts">

class AddTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Add", "Add a module.", "icon-plus");
    }

    public init() {
        /* Add the on module selected callback */
        var page : RoomPage = this.getTab().getRoomPage();
        page.addResumeListener("select-add-module",
                               this.onModuleSelected.bind(this));
    }

    public onTap() {
        var app = this.getTab().getRoomPage().getApp();
        var intentData = {
            context: {
                id: "select-add-module",
                items: []
            }
        };
        var items = intentData.context.items;
        for (var name in Globals.whiteboardModules) {
            items.push({
                text: name, value: name
            });
        }
        var intent : Intent = new Intent(SelectDialog, intentData);
        app.startPage(intent);
    }

    public onModuleSelected(value : string) {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var room : Room = roomPage.getRoom();
        var whiteboard = room.whiteboard;
        var className : any = Globals.whiteboardModules[value];
        var wModule : WhiteboardModule = new className(roomPage, whiteboard);
        wModule.edit(wModule.getDefaultEditName());
    }
}