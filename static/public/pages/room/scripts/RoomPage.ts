/*
 * page-login.html page super class
 */
/// <reference path="./imports.ts"/>

/* Reference to the login page */
declare var JoinRoomPage;

class RoomPage extends Page {
    private mRoom : Room;

    public onCreate(intentData : {id:number;}) : void {
        /* Create the room */
        var id = intentData.id;
        this.mRoom = {id : id};
        console.log("Room:", id);
        /* Create the view */
        if (this.getApp() instanceof MobileApp)
            this.setView(new RoomMobileView(this, {}));
        else throw "Unimplemented";
    }

    public getRoom() : Room {
        return this.mRoom;
    }
}