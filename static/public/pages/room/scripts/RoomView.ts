/*
 * View for the Room page.
 */
/// <reference path="./imports.ts"/>

class RoomView extends PageView {

    constructor(page : Page, context : any) {
        super(page, RoomMobileView.sTemplate, context);
    }
}