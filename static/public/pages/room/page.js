var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RoomView = (function (_super) {
    __extends(RoomView, _super);
    function RoomView(page, context) {
        _super.call(this, page, RoomMobileView.sTemplate, context);
    }
    return RoomView;
})(PageView);
var RoomMobileView = (function (_super) {
    __extends(RoomMobileView, _super);
    function RoomMobileView() {
        _super.apply(this, arguments);

    }
    RoomMobileView.sTemplate = new Template("page-room-mobile");
    return RoomMobileView;
})(RoomView);
var RoomPage = (function (_super) {
    __extends(RoomPage, _super);
    function RoomPage() {
        _super.apply(this, arguments);

    }
    RoomPage.prototype.onCreate = function (intentData) {
        var id = intentData.id;
        this.mRoom = {
            id: id
        };
        console.log("Room:", id);
        if(this.getApp() instanceof MobileApp) {
            this.setView(new RoomMobileView(this, {
            }));
        } else {
            throw "Unimplemented";
        }
    };
    RoomPage.prototype.getRoom = function () {
        return this.mRoom;
    };
    return RoomPage;
})(Page);
//@ sourceMappingURL=page.js.map
