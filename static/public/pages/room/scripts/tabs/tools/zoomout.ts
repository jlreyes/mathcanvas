/*
 * Zoom Tool
 */
/// <reference path="../../imports.ts">

class ZoomOutTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Zoom Out", "Zoom out from the canvas.", "icon-zoom-out");
    }
    
    public onTap() {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var view : RoomView = <RoomView> roomPage.getView();
        view.zoomOut();
    }
}