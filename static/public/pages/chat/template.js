(function(){dust.register("page-chat-mobile",body_0);function body_0(chk,ctx){return chk.write("<!-- Join Room Page --><div class=\"page\"><div class=\"header\"><button id=\"chat-back-button\"class=\"icon left\"data-type=\"back\"><i class=\"icon-caret-left icon-large\"></i><p>Back</p></button><h1>Chat</h1><button id=\"chat-list-users-button\"class=\"icon right\"><i class=\"icon-group icon-large\"></i><p>Users</p></button></div><div class=\"body\"><div id=\"chat-messages\"></div><div id=\"chat-input\"><form id=\"chat-input-form\"class=\"box\"><input id=\"chat-textarea\"class=\"full\"placeholder=\"Message\" required=\"required\"type=\"text\" /><button id=\"chat-send-button\"class=\"full\">Send</button></form></div></div><div class=\"footer\"><h1>").reference(ctx.get("username"),ctx,"h").write("</h1></div></div>");}return body_0;})();