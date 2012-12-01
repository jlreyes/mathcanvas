/* User type */
interface User {
    id : string;
    username: string;
    rooms: Room;
};

interface Room {
    id : string;
    name : string;
};