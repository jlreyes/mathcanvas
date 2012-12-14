/*
 * Add Tool
 */
/// <reference path="../../imports.ts">

class ClearTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Clear", "Clear the canvas.", "icon-trash");
    }
    
    public onTap() {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        roomPage.clearCanvas();
    }
}