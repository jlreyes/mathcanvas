var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var JoinRoomView = (function (_super) {
    __extends(JoinRoomView, _super);
    function JoinRoomView(page) {
        var app = page.getApp();
        var context = {
            username: app.getUser().username
        };
        _super.call(this, page, JoinRoomMobileView.sTemplate, context);
    }
    JoinRoomView.prototype.onInflation = function (jquery) {
        var page = this.getPage();
        var app = page.getApp();
        var logoutButton = jquery.find("#button-logout");
        logoutButton.hammer({
        }).bind("tap", page.logout.bind(page));
        var createRoom = jquery.find("#button-create");
        createRoom.hammer({
        }).bind("tap", page.onCreateRoomTap.bind(page));
        this.mJoinRoom = jquery.find("#form-join-room-id");
        var joinRoomButton = jquery.find("#form-join-room-submit");
        joinRoomButton.hammer({
        }).bind("tap", page.onJoinRoomTap.bind(page));
        this.mRoomList = jquery.find("ul.button-list");
        this.mNumRooms = 0;
        var user = app.getUser();
        for(var roomKey in user.rooms) {
            var room = user.rooms[roomKey];
            this.addRoomListButton(room);
            this.mNumRooms++;
        }
        if(this.mNumRooms === 0) {
            this.mRoomList.text("You have no rooms.");
        }
        return jquery;
    };
    JoinRoomView.prototype.addRoomListButton = function (room) {
        if(this.mNumRooms === 0) {
            this.mRoomList.html("");
        }
        this.mNumRooms++;
        var page = this.getPage();
        var button = $("<li></li>");
        button.text(room.name);
        this.mRoomList.append(button);
        button.hammer({
        }).bind("tap", function (e) {
            var num = parseInt(room.id, 10);
            page.joinRoom(num);
        });
    };
    JoinRoomView.prototype.getJoinRoomInputJquery = function () {
        return this.mJoinRoom;
    };
    return JoinRoomView;
})(PageView);
var CreateRoomDialogView = (function (_super) {
    __extends(CreateRoomDialogView, _super);
    function CreateRoomDialogView(dialog) {
        _super.call(this, dialog, CreateRoomDialogView.sTemplate, {
});
    }
    CreateRoomDialogView.sTemplate = new Template("dialog-create-room");
    CreateRoomDialogView.prototype.onInflation = function (jquery) {
        var page = this.getPage();
        this.mRoomType = jquery.find("#form-create-room-type");
        this.mRoomName = jquery.find("#form-create-room-name");
        jquery.find("#form-create-room-submit").hammer({
        }).bind("tap", page.createRoom.bind(page));
        return jquery;
    };
    CreateRoomDialogView.prototype.getFormData = function () {
        return {
            name: this.mRoomName.val(),
            type: this.mRoomType.val().toLowerCase()
        };
    };
    return CreateRoomDialogView;
})(DialogView);
var JoinRoomMobileView = (function (_super) {
    __extends(JoinRoomMobileView, _super);
    function JoinRoomMobileView() {
        _super.apply(this, arguments);

    }
    JoinRoomMobileView.sTemplate = new Template("page-join-room-mobile");
    return JoinRoomMobileView;
})(JoinRoomView);
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\" class=\"section\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><selectid=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option><option>Private</option></select></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option><option>Private</option></select></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><label for=\"form-create-room-type\">Room Type</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option><option>Private</option></select></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option><option>Private</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option><option>Private</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"style=\"display:none;\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"style=\"display:none;\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"style=\"display:none;\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"style=\"display:none;\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("dialog-create-room", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>Create room</h1></div><div class=\"body\"><form id=\"form-create-room\"><div style=\"text-align: center;\"><input id=\"form-create-room-name\"class=\"full\"type=\"text\"placeholder=\"Room Name\"required=\"required\" /><div class=\"form-elem-wrapper\"style=\"display:none;\"><label for=\"form-create-room-type\">Room Type:</label><select id=\"form-create-room-type\"class=\"full\"><option selected=\"selected\">Public</option></select></div></div><div style=\"text-align: center;\"><button id=\"form-create-room-submit\"class=\"full\">Create Room</button></div></form></div></div></div>");
    }
    return body_0;
})();
var JoinRoomPage = (function (_super) {
    __extends(JoinRoomPage, _super);
    function JoinRoomPage() {
        _super.apply(this, arguments);

    }
    JoinRoomPage.prototype.onCreate = function () {
        if(this.getApp() instanceof MobileApp) {
            this.setView(new JoinRoomMobileView(this));
        } else {
            throw "Unimplemented";
        }
    };
    JoinRoomPage.prototype.onCreateRoomTap = function () {
        var app = this.getApp();
        app.startPage(new Intent(CreateRoomDialog, {
            callPage: this
        }));
    };
    JoinRoomPage.prototype.onJoinRoomTap = function () {
        var view = this.getView();
        var input = view.getJoinRoomInputJquery();
        var val = input.val();
        if(val.match(/^[0-9]+$/)) {
            this.joinRoom(parseInt(val));
            return;
        }
        var context = {
            title: "Error",
            message: "Invalid room id.",
            buttons: [
                {
                    text: "Okay",
                    callback: function () {
                        Globals.app.back();
                    }
                }
            ]
        };
        var app = this.getApp();
        app.startPage(new Intent(SimpleDialog, {
            context: context
        }));
    };
    JoinRoomPage.prototype.joinRoom = function (id) {
        var app = this.getApp();
        app.startPage(new Intent(RoomPage, {
            id: id
        }));
    };
    JoinRoomPage.prototype.logout = function () {
        Util.postJSON("session/logout", {
        }, function () {
            var app = this.getApp();
            app.setUser(null);
            app.startPage(new Intent(LoginPage, {
                destroy: true
            }));
        }.bind(this));
    };
    return JoinRoomPage;
})(Page);
var CreateRoomDialog = (function (_super) {
    __extends(CreateRoomDialog, _super);
    function CreateRoomDialog() {
        _super.apply(this, arguments);

    }
    CreateRoomDialog.prototype.onCreate = function (intentData) {
        this.mCallPage = intentData.callPage;
        this.setView(new CreateRoomDialogView(this));
    };
    CreateRoomDialog.prototype.createRoom = function () {
        var app = this.getApp();
        var view = this.getView();
        var formData = view.getFormData();
        var postData = {
            name: formData.name,
            type: formData.type
        };
        if(!formData.name.match(/^\w+$/)) {
            app.back();
            var context = {
                title: "Error",
                message: "Invalid room name",
                buttons: [
                    {
                        text: "Okay",
                        callback: app.back.bind(app)
                    }
                ]
            };
            app.startPage(new Intent(SimpleDialog, {
                context: context
            }));
            return;
        }
        Util.postJSON("rooms/createRoom", postData, function (result) {
            var room = result.room;
            var view = this.mCallPage.getView();
            view.addRoomListButton(room);
            app.getUser().rooms[room.id] = room;
            this.mCallPage.joinRoom(room.id);
        }.bind(this), {
            preventInput: true,
            back: true
        });
    };
    return CreateRoomDialog;
})(Dialog);
//@ sourceMappingURL=page.js.map
