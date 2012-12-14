/*
 * Zoom Tool
 */
/// <reference path="../../imports.ts">

class ZoomInTool extends Tool {
    constructor(tab : Tab) {
        super(tab, "Zoom In", "Zoom in on the canvas.", "icon-zoom-in");
    }
    
    public onTap() {
        var roomPage : RoomPage = this.getTab().getRoomPage();
        var view : RoomView = <RoomView> roomPage.getView();
        view.zoomIn();
    }
}