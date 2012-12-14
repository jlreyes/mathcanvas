/* User type */
interface User {
    id : string;
    username: string;
    rooms: {id: string; name: string;}[];
};