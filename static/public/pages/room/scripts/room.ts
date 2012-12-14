/*
 * Typescript for the room model
 */
/// <reference path="./imports.ts"/>

/* Data sent by the socket server */
interface RoomInfo {
    id: string;
    name: string;
    usernames: string[];
    whiteboardModel : WhiteboardModel;
}

interface Message {
    username: string;
    message: string;
}

interface Room {
    id: number;
    name: string;
    usernames: string[];
    messages : Message[];
    whiteboard: Whiteboard;
}