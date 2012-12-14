var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tab = (function () {
    function Tab(page, name, tools, iconName) {
        this.mPage = page;
        this.mName = name;
        this.mTools = tools;
        this.mDomId = "tab-" + name;
        this.mIconName = iconName;
        for(var i = 0; i < tools.length; i++) {
            tools[i].init();
        }
    }
    Tab.prototype.onPageInflation = function (jquery) {
        this.mJquery = $("<div></div>");
        this.mJquery.attr("id", this.mDomId);
        this.mJquery.addClass("tab");
        var toolCallback = function (tool) {
            return tool.onTap.bind(tool);
        };
        for(var i = 0; i < this.mTools.length; i++) {
            var tool = this.mTools[i];
            var toolButton = $("<button></button>");
            var icon = tool.getIcon();
            if(Util.exists(icon)) {
                toolButton.addClass("icon");
                var iconJquery = $("<i></i>");
                iconJquery.addClass(icon);
                iconJquery.addClass("icon-large");
                toolButton.append(iconJquery);
            }
            var name = $("<p>" + tool.getName() + "</p>");
            toolButton.append(name);
            toolButton.hammer({
            }).bind("tap", toolCallback(tool));
            this.mJquery.append(toolButton);
        }
        jquery.find("#tool-tab-container").append(this.mJquery);
    };
    Tab.prototype.display = function () {
        this.mJquery.css("display", "block");
        this.onDisplay();
    };
    Tab.prototype.onDisplay = function () {
    };
    Tab.prototype.getRoomPage = function () {
        return this.mPage;
    };
    Tab.prototype.getJquery = function () {
        return this.mJquery;
    };
    Tab.prototype.getTools = function () {
        return this.mTools;
    };
    Tab.prototype.getIconName = function () {
        return this.mIconName;
    };
    Tab.prototype.getName = function () {
        return this.mName;
    };
    Tab.prototype.getDomId = function () {
        return this.mDomId;
    };
    return Tab;
})();
var ManipulateTab = (function (_super) {
    __extends(ManipulateTab, _super);
    function ManipulateTab(page) {
        var tools = [];
        tools.push(new AddTool(this));
        tools.push(new ZoomInTool(this));
        tools.push(new ZoomOutTool(this));
        _super.call(this, page, "Manipulate", tools, "icon-move");
    }
    return ManipulateTab;
})(Tab);
var MiscTab = (function (_super) {
    __extends(MiscTab, _super);
    function MiscTab(page) {
        var tools = [];
        tools.push(new ClearTool(this));
        tools.push(new SaveTool(this));
        tools.push(new LoadTool(this));
        _super.call(this, page, "Misc", tools, "icon-cog");
    }
    return MiscTab;
})(Tab);
var Tool = (function () {
    function Tool(tab, name, desc, icon) {
        this.mTab = tab;
        this.mName = name;
        this.mDesc = desc;
        if(!Util.exists(icon)) {
            icon = null;
        }
        this.mIcon = icon;
    }
    Tool.prototype.init = function () {
    };
    Tool.prototype.onTap = function () {
        console.log(this);
    };
    Tool.prototype.getTab = function () {
        return this.mTab;
    };
    Tool.prototype.getName = function () {
        return this.mName;
    };
    Tool.prototype.getIcon = function () {
        return this.mIcon;
    };
    return Tool;
})();
var AddTool = (function (_super) {
    __extends(AddTool, _super);
    function AddTool(tab) {
        _super.call(this, tab, "Add", "Add a module.", "icon-plus");
    }
    AddTool.prototype.init = function () {
        var page = this.getTab().getRoomPage();
        page.addResumeListener("select-add-module", this.onModuleSelected.bind(this));
    };
    AddTool.prototype.onTap = function () {
        var app = this.getTab().getRoomPage().getApp();
        var intentData = {
            context: {
                id: "select-add-module",
                items: []
            }
        };
        var items = intentData.context.items;
        for(var name in Globals.whiteboardModules) {
            items.push({
                text: name,
                value: name
            });
        }
        var intent = new Intent(SelectDialog, intentData);
        app.startPage(intent);
    };
    AddTool.prototype.onModuleSelected = function (value) {
        var roomPage = this.getTab().getRoomPage();
        var room = roomPage.getRoom();
        var whiteboard = room.whiteboard;
        var className = Globals.whiteboardModules[value];
        var wModule = new className(roomPage, whiteboard);
        wModule.edit(wModule.getDefaultEditName());
    };
    return AddTool;
})(Tool);
var ZoomInTool = (function (_super) {
    __extends(ZoomInTool, _super);
    function ZoomInTool(tab) {
        _super.call(this, tab, "Zoom In", "Zoom in on the canvas.", "icon-zoom-in");
    }
    ZoomInTool.prototype.onTap = function () {
        var roomPage = this.getTab().getRoomPage();
        var view = roomPage.getView();
        view.zoomIn();
    };
    return ZoomInTool;
})(Tool);
var ZoomOutTool = (function (_super) {
    __extends(ZoomOutTool, _super);
    function ZoomOutTool(tab) {
        _super.call(this, tab, "Zoom Out", "Zoom out from the canvas.", "icon-zoom-out");
    }
    ZoomOutTool.prototype.onTap = function () {
        var roomPage = this.getTab().getRoomPage();
        var view = roomPage.getView();
        view.zoomOut();
    };
    return ZoomOutTool;
})(Tool);
var SaveTool = (function (_super) {
    __extends(SaveTool, _super);
    function SaveTool(tab) {
        _super.call(this, tab, "Save", "Save the canvas.", "icon-save");
    }
    SaveTool.prototype.init = function () {
        var page = this.getTab().getRoomPage();
        page.addResumeListener("save-canvas-input", this.onSave.bind(this));
    };
    SaveTool.prototype.onTap = function () {
        var roomPage = this.getTab().getRoomPage();
        var app = roomPage.getApp();
        var data = {
            context: {
                id: "save-canvas-input",
                title: "Save As",
                placeholder: "Name"
            }
        };
        app.startPage(new Intent(InputDialog, data));
    };
    SaveTool.prototype.onSave = function (result) {
        var roomPage = this.getTab().getRoomPage();
        var modules = roomPage.getRoom().whiteboard.model.modules;
        var models = [];
        for(var id in modules) {
            var wModule = modules[id];
            var model = wModule.getModel();
            models.push(model);
        }
        localStorage[result] = JSON.stringify(models);
        var intentData = {
            context: {
                title: "Success",
                message: "Saved canas as \"" + result + "\"",
                buttons: [
                    {
                        text: "Okay",
                        callback: function () {
                            Globals.app.back();
                        }
                    }
                ]
            }
        };
        var app = roomPage.getApp();
        app.startPage(new Intent(SimpleDialog, intentData));
    };
    return SaveTool;
})(Tool);
var LoadTool = (function (_super) {
    __extends(LoadTool, _super);
    function LoadTool(tab) {
        _super.call(this, tab, "Load", "Load a saved canvas.", "icon-file");
    }
    LoadTool.prototype.init = function () {
        var page = this.getTab().getRoomPage();
        page.addResumeListener("load-canvas", this.onLoadSelect.bind(this));
    };
    LoadTool.prototype.onTap = function () {
        var roomPage = this.getTab().getRoomPage();
        var app = roomPage.getApp();
        if(localStorage.length === 0) {
            var errorIntentData = {
                context: {
                    title: "Error",
                    message: "You have no saved canvases!",
                    buttons: [
                        {
                            text: "Okay",
                            callback: function () {
                                Globals.app.back();
                            }
                        }
                    ]
                }
            };
            app.startPage(new Intent(SimpleDialog, errorIntentData));
            return;
        }
        var items = [];
        for(var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            items.push({
                text: key,
                value: key
            });
        }
        var data = {
            context: {
                id: "load-canvas",
                title: "Select a canvas",
                items: items
            }
        };
        app.startPage(new Intent(SelectDialog, data));
    };
    LoadTool.prototype.onLoadSelect = function (key) {
        var roomPage = this.getTab().getRoomPage();
        var socket = Globals.socket;
        var whiteboard = roomPage.getRoom().whiteboard;
        var models = JSON.parse(localStorage[key]);
        roomPage.clearCanvas();
        for(var i = 0; i < models.length; i++) {
            var model = models[i];
            model.id = whiteboard.model.nextId;
            whiteboard.model.nextId++;
            model.author = Globals.app.getUser().username;
            model.layer = whiteboard.view.getNextFreeLayer();
            var construct = Globals.whiteboardModules[model.className];
            var m = new construct(roomPage, whiteboard, model);
            socket.sendMessage("modModify", m.getModel());
        }
        delete localStorage[key];
    };
    return LoadTool;
})(Tool);
var ClearTool = (function (_super) {
    __extends(ClearTool, _super);
    function ClearTool(tab) {
        _super.call(this, tab, "Clear", "Clear the canvas.", "icon-trash");
    }
    ClearTool.prototype.onTap = function () {
        var roomPage = this.getTab().getRoomPage();
        roomPage.clearCanvas();
    };
    return ClearTool;
})(Tool);
var RoomView = (function (_super) {
    __extends(RoomView, _super);
    function RoomView(page) {
        _super.call(this, page, RoomMobileView.sTemplate, {
});
        this.mLocked = false;
        this.mNotificationQueue = [];
        this.mScale = 1;
    }
    RoomView.prototype.zoomIn = function () {
        this.mScale += 0.1;
        this.mScale = Math.min(this.mScale, 3);
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform", scale);
    };
    RoomView.prototype.zoomOut = function () {
        this.mScale -= 0.1;
        this.mScale = Math.max(this.mScale, 0.1);
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform", scale);
    };
    RoomView.prototype.displayNotification = function (title, message, iconName) {
        if(this.mLocked === true) {
            this.mNotificationQueue.push({
                title: title,
                message: message,
                iconName: iconName
            });
            return;
        }
        this.mLocked = true;
        this.mNotificationTitle.text(title);
        this.mNotificationMsg.text(message);
        var transEnd = Constants.TRANS_END_NAME;
        var height = this.mNotificationBox.outerHeight();
        var width = this.mNotificationBox.outerWidth();
        var left = this.getParent().outerWidth() / 2 - width / 2;
        this.mNotificationBox.removeClass("transition");
        this.mNotificationIcon.attr("class", iconName);
        this.mNotificationBox.css("display", "block");
        this.mNotificationBox.css("top", -height);
        this.mNotificationBox.css("left", left);
        var showTransition = function () {
            this.mNotificationBox.addClass("transition");
            this.mNotificationBox.css("top", 0);
            this.mNotificationBox.bind(transEnd, hideTransition);
        }.bind(this);
        var hideTransition = function () {
            this.mNotificationBox.unbind(transEnd, hideTransition);
            var hideAfterDelay = function () {
                this.mNotificationBox.css("top", -height);
                this.mNotificationBox.bind(transEnd, unlock);
            }.bind(this);
            setTimeout(hideAfterDelay, 1000);
        }.bind(this);
        var unlock = function () {
            this.mNotificationBox.unbind(transEnd, unlock);
            this.mNotificationBox.removeClass("transition");
            this.mLocked = false;
            var notification = this.mNotificationQueue.shift();
            if(Util.exists(notification)) {
                this.displayNotification(notification.title, notification.message);
            }
        }.bind(this);
        setTimeout(showTransition, 0);
    };
    RoomView.prototype.hideTabs = function () {
        this.mTabsContainer.css("display", "none");
    };
    RoomView.prototype.showTabs = function () {
        this.mTabsContainer.css("display", "block");
    };
    RoomView.prototype.onInflation = function (jquery) {
        var page = this.getPage();
        var name = jquery.find("#room-name");
        if(Util.exists(this.mName)) {
            name.text(this.mName);
        } else {
            this.mName = name;
        }
        this.mTabsContainer = jquery.find("#tool-controls-container");
        this.mCanvas = jquery.find("#canvas");
        this.mToolContainer = jquery.find("#module-tools-container");
        this.mNotificationBox = jquery.find("#notification-box");
        this.mNotificationTitle = this.mNotificationBox.find(">h1");
        this.mNotificationIcon = this.mNotificationBox.find(">i");
        this.mNotificationMsg = this.mNotificationBox.find(">p");
        var scale = "scale(" + this.mScale + ", " + this.mScale + ")";
        this.mCanvas.css("transform-origin", "left top");
        this.mCanvas.css("transform", scale);
        jquery.find("#whiteboard-container").scroll(function (e) {
        });
        this.mChangeTab = jquery.find("#button-change-tab");
        this.mChangeTab.hammer({
        }).bind("tap", page.onTabTapped.bind(page));
        jquery.find("#room-chat-button").hammer({
        }).bind("tap", page.onChatTapped.bind(page));
        var tabs = page.getTabs();
        for(var i = 0; i < tabs.length; i++) {
            tabs[i].onPageInflation(jquery);
        }
        this.mTabs = jquery.find(".tab");
        this.onChangeTab(page.getTab());
        return jquery;
    };
    RoomView.prototype.onRegister = function (room) {
        var str = room.name + " (" + room.id + ")";
        if(!Util.exists(this.mName)) {
            this.mName = str;
        } else {
            this.mName.text(str);
        }
    };
    RoomView.prototype.onChangeTab = function (tab) {
        this.mTabs.css("display", "none");
        var icon = this.mChangeTab.find("i");
        icon.attr("class", tab.getIconName());
        icon.addClass("icon-large");
        this.mChangeTab.find("p").text(tab.getName());
        tab.display();
    };
    RoomView.prototype.getCanvas = function () {
        return this.mCanvas;
    };
    RoomView.prototype.getToolContainer = function () {
        return this.mToolContainer;
    };
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
var WhiteboardView = (function () {
    function WhiteboardView(roomView, canvas, toolsetContainer, dim) {
        this.mFocus = null;
        this.mButtonStack = [];
        this.mZIndexMap = [
            null
        ];
        this.mRoom = roomView;
        this.mCanvas = canvas;
        this.mToolset = toolsetContainer;
        this.mCanvas.css("width", dim.width);
        this.mCanvas.css("height", dim.height);
    }
    WhiteboardView.prototype.focus = function (moduleView, buttons) {
        if(this.mFocus !== null) {
            this.unfocus();
        }
        this.mRoom.hideTabs();
        this.mFocus = moduleView;
        this.pushButtons(buttons);
        moduleView.onFocus();
    };
    WhiteboardView.prototype.unfocus = function () {
        this.mFocus.onUnfocus();
        this.popButtons();
        this.mRoom.showTabs();
        this.mFocus = null;
    };
    WhiteboardView.prototype.pushButtons = function (buttons) {
        var currentButtons = this.mButtonStack[0];
        if(Util.exists(currentButtons)) {
            currentButtons.detach();
        } else {
            this.mToolset.css("display", "block");
        }
        this.mButtonStack.unshift(buttons);
        this.mToolset.append(buttons);
    };
    WhiteboardView.prototype.popButtons = function () {
        var currentButtons = this.mButtonStack.shift();
        if(!Util.exists(currentButtons)) {
            return;
        }
        currentButtons.detach();
        var newButtons = this.mButtonStack[0];
        if(Util.exists(newButtons)) {
            this.mToolset.append(newButtons);
        } else {
            this.mToolset.css("display", "none");
        }
    };
    WhiteboardView.prototype.addWhiteboardModule = function (view) {
        this.mZIndexMap[view.getModule().getModel().layer] = view;
        this.mCanvas.append(view.getJquery());
        view.onDomInsertion();
    };
    WhiteboardView.prototype.removeWhiteboardModule = function (view) {
        if(this.mFocus === view) {
            this.unfocus();
        }
        view.detach();
        this.mZIndexMap[view.getModule().getModel().layer];
    };
    WhiteboardView.prototype.getNextFreeLayer = function () {
        return this.mZIndexMap.length;
    };
    WhiteboardView.prototype.hasFocus = function () {
        return this.mFocus !== null;
    };
    WhiteboardView.prototype.getFocusLayer = function () {
        var highestZindex = this.getNextFreeLayer();
        return highestZindex * 10000;
    };
    WhiteboardView.prototype.getScroll = function () {
        var top = this.mCanvas.parent().scrollTop();
        var left = this.mCanvas.parent().scrollLeft();
        return {
            x: left,
            y: top
        };
    };
    return WhiteboardView;
})();
var WhiteboardModule = (function () {
    function WhiteboardModule(roomPage, whiteboard, model) {
        this.mEditOptions = {
        };
        this.mEditor = null;
        this.mOldModel = null;
        this.mPage = roomPage;
        this.mRoom = roomPage.getRoom();
        this.mSocket = Globals.socket;
        this.mWhiteboard = whiteboard;
        var userCreated = !Util.exists(model);
        if(userCreated === false) {
            whiteboard.model.modules[model.id] = this;
        } else {
            model = this.getDefaultModel();
        }
        this.mModel = model;
        this.mView = this.createView();
        this.addDefaultEditOptions();
        this.mWhiteboard.view.addWhiteboardModule(this.mView);
        this.mLongPressKey = "whiteboard-module-" + this.mModel.id + "-long-press";
        roomPage.addResumeListener(this.mLongPressKey, this.onLongPressReturn.bind(this));
        this.mWhiteboard.model.modules[this.mModel.id] = this;
        if(userCreated === true) {
            this.mWhiteboard.model.nextId++;
            this.mSocket.sendMessage("modCreate", this.getModel());
        }
    }
    WhiteboardModule.prototype.addDefaultEditOptions = function () {
        this.addEditOption("Move", {
            callback: this.startMove.bind(this),
            onEditEnd: this.endMove.bind(this)
        });
        this.addEditOption("Resize", {
            callback: this.startResize.bind(this),
            onEditEnd: this.endResize.bind(this)
        });
        this.addEditOption("Remove", {
            callback: this.destroy.bind(this),
            focusModule: false
        });
    };
    WhiteboardModule.prototype.addEditOption = function (name, editOption) {
        this.mEditOptions[name] = editOption;
    };
    WhiteboardModule.prototype.edit = function (editOptionName) {
        var editOption = this.mEditOptions[editOptionName];
        if(editOption.focusModule === false) {
            editOption.callback();
            return;
        }
        this.mEditor = editOptionName;
        this.mOldModel = Util.cloneObject(this.mModel);
        var defaultButtons = this.mView.getDefaultButtons();
        var buttons = defaultButtons.add(editOption.extraButtons);
        this.mWhiteboard.view.focus(this.mView, buttons);
        editOption.callback();
    };
    WhiteboardModule.prototype.cancelEdit = function () {
        var onEditEnd = this.mEditOptions[this.mEditor].onEditEnd;
        if(Util.exists(onEditEnd)) {
            onEditEnd(true);
        }
        this.mEditor = null;
        this.mView.update(this.mModel, this.mOldModel);
        this.mModel = this.mOldModel;
        this.mWhiteboard.view.unfocus();
    };
    WhiteboardModule.prototype.save = function (updateView) {
        var onEditEnd = this.mEditOptions[this.mEditor].onEditEnd;
        if(Util.exists(onEditEnd)) {
            onEditEnd(false);
        }
        if(updateView === true) {
            this.mView.update(this.mOldModel, this.mModel);
        }
        this.mEditor = null;
        this.mWhiteboard.view.unfocus();
        this.mSocket.sendMessage("modModify", this.getModel());
    };
    WhiteboardModule.prototype.startMove = function () {
        this.mView.onMoveStart();
    };
    WhiteboardModule.prototype.endMove = function () {
        this.mView.onMoveEnd();
    };
    WhiteboardModule.prototype.startResize = function () {
        this.mView.onResizeStart();
    };
    WhiteboardModule.prototype.endResize = function () {
        this.mView.onResizeEnd();
    };
    WhiteboardModule.prototype.destroy = function () {
        var id = this.mModel.id;
        this.onDestroy();
        this.mSocket.sendMessage("modDelete", id);
    };
    WhiteboardModule.prototype.onLongPress = function () {
        var app = Globals.app;
        var items = [];
        for(var key in this.mEditOptions) {
            items.push({
                text: key,
                value: key
            });
        }
        var context = {
            id: this.mLongPressKey,
            items: items
        };
        app.startPage(new Intent(SelectDialog, {
            context: context
        }));
    };
    WhiteboardModule.prototype.onLongPressReturn = function (result) {
        if(result in this.mEditOptions) {
            this.edit(result);
        }
    };
    WhiteboardModule.prototype.onModify = function (modifier) {
        var oldModel = this.mModel;
        this.mModel = modifier;
        this.mView.update(oldModel, modifier);
    };
    WhiteboardModule.prototype.onDestroy = function () {
        this.mWhiteboard.view.removeWhiteboardModule(this.mView);
        if(Util.exists(this.mWhiteboard.model.modules[this.mModel.id])) {
            delete this.mWhiteboard.model.modules[this.mModel.id];
        }
    };
    WhiteboardModule.prototype.getDefaultModel = function () {
        var rect = this.mWhiteboard.view.getScroll();
        return {
            className: this.getName(),
            id: this.mWhiteboard.model.nextId,
            author: Globals.app.getUser().username,
            layer: this.mWhiteboard.view.getNextFreeLayer(),
            pos: rect,
            dim: {
                width: 256,
                height: 256
            }
        };
    };
    WhiteboardModule.prototype.getDefaultEditName = function () {
        throw "Not implemented";
    };
    WhiteboardModule.prototype.createView = function () {
        throw "createView not implemented by" + this["constructor"];
    };
    WhiteboardModule.prototype.getName = function () {
        throw "getName not implemented by " + this["constructor"];
    };
    WhiteboardModule.prototype.getWhiteboard = function () {
        return this.mWhiteboard;
    };
    WhiteboardModule.prototype.getModel = function () {
        return this.mModel;
    };
    WhiteboardModule.prototype.getPage = function () {
        return this.mPage;
    };
    WhiteboardModule.prototype.getView = function () {
        return this.mView;
    };
    WhiteboardModule.prototype.setXY = function (x, y) {
        this.mModel.pos.x = x;
        this.mModel.pos.y = y;
        this.mView.updatePos(x, y);
    };
    WhiteboardModule.prototype.setDim = function (width, height) {
        this.mModel.dim.width = width;
        this.mModel.dim.height = height;
        this.mView.updateDim(width, height);
    };
    return WhiteboardModule;
})();
var WhiteboardModuleView = (function () {
    function WhiteboardModuleView(module) {
        this.mDefaultButtons = $([]);
        this.mIsResizing = false;
        this.mIsMoving = false;
        this.mIsFocused = false;
        this.mInitialCenterDistance = null;
        this.mInitialCenter = null;
        this.mInitialDragPos = null;
        this.mInitialDim = null;
        this.mInitialDragTouchOffset = null;
        this.mModule = module;
        this.mJquery = this.processJquery(this.createJquery());
        var save = this.mModule.save.bind(this.mModule);
        var saveButton = this.createButton("Save", "icon-save", save);
        this.addDefaultButton(saveButton);
        var cancel = this.mModule.cancelEdit.bind(this.mModule);
        var cancelButton = this.createButton("Cancel", " icon-remove", cancel);
        this.addDefaultButton(cancelButton);
    }
    WhiteboardModuleView.prototype.addDefaultButton = function (button) {
        this.mDefaultButtons = this.mDefaultButtons.add(button);
    };
    WhiteboardModuleView.prototype.createButton = function (name, icon, callback) {
        var button = $("<button></button>");
        button.addClass("icon");
        var icon = $("<i></i>").addClass(icon).addClass("icon-large");
        button.append(icon);
        button.append($("<p></p>").text(name));
        button.hammer({
        }).bind("tap", callback);
        Util.makeMobile(button);
        return button;
    };
    WhiteboardModuleView.prototype.processJquery = function (jquery) {
        var model = this.mModule.getModel();
        jquery.css("border-style", "solid");
        jquery.css("border-width", "2px");
        jquery.css("border-color", "rgba(0,0,0,0)");
        jquery.css("position", "absolute");
        jquery.css("z-index", model.layer);
        jquery.css("left", model.pos.x);
        jquery.css("top", model.pos.y);
        jquery.css("width", model.dim.width);
        jquery.css("height", model.dim.height);
        this.addHammer(jquery);
        return jquery;
    };
    WhiteboardModuleView.prototype.addHammer = function (jquery) {
        var addBorder = function () {
            console.log("ADDING BORDER");
            if(this.mIsFocused === false) {
                this.mJquery.css("border-color", "black");
                this.mJquery.css("border-style", "dotted");
            }
        }.bind(this);
        var removeBorder = function () {
            console.log("REMOVING BORDER");
            if(this.mIsFocused === false) {
                this.mJquery.css("border-color", "rgba(0,0,0,0)");
            }
        }.bind(this);
        var hammer = new Hammer(jquery[0], {
            prevent_default: true,
            tapstart_callback: addBorder,
            tapend_callback: removeBorder
        });
        this.mHammer = hammer;
        hammer.onhold = function () {
            if(this.mModule.getWhiteboard().view.hasFocus() === false) {
                this.getModule().onLongPress();
            }
        }.bind(this);
        var onDrag = function (f) {
            return function (event) {
                if(this.mIsMoving || this.mIsResizing) {
                    f.call(this, event);
                }
            }.bind(this);
        }.bind(this);
        hammer.ondragstart = onDrag(this.onDragStart);
        hammer.ondrag = onDrag(this.onDrag);
        hammer.ondragend = onDrag(this.onDragEnd);
    };
    WhiteboardModuleView.prototype.removeHammer = function () {
        this.mHammer.destroy();
    };
    WhiteboardModuleView.prototype.onDomInsertion = function () {
    };
    WhiteboardModuleView.prototype.detach = function () {
        this.mJquery.detach();
    };
    WhiteboardModuleView.prototype.onFocus = function () {
        this.mIsFocused = true;
        var whiteboardView = this.mModule.getWhiteboard().view;
        this.mJquery.css("z-index", whiteboardView.getFocusLayer());
        this.mJquery.css("border-color", "red");
        this.mJquery.css("border-width", "2px");
        this.mJquery.css("border-style", "dashed");
    };
    WhiteboardModuleView.prototype.onUnfocus = function () {
        this.mIsFocused = false;
        var model = this.mModule.getModel();
        this.mJquery.css("z-index", model.layer);
        this.mJquery.css("border-color", "rgba(0,0,0,0)");
    };
    WhiteboardModuleView.prototype.onDragStart = function (event) {
        var model = this.mModule.getModel();
        this.mInitialDragPos = event.position;
        this.mInitialDragTouchOffset = {
            x: this.mInitialDragPos.x - model.pos.x,
            y: this.mInitialDragPos.y - model.pos.y
        };
        var offset = this.mJquery.offset();
        this.mInitialCenter = {
            x: offset.left,
            y: offset.top
        };
        var deltaX = event.position.x - this.mInitialCenter.x;
        var deltaY = event.position.y - this.mInitialCenter.y;
        this.mInitialCenterDistance = deltaX * deltaX + deltaY * deltaY;
        this.mInitialCenterDistance = Math.sqrt(this.mInitialCenterDistance);
        this.mInitialDim = {
            width: this.mJquery.width(),
            height: this.mJquery.height()
        };
        if(this.mIsResizing) {
            this.onResizeDragBegin();
        }
    };
    WhiteboardModuleView.prototype.onDrag = function (event) {
        var x;
        var y;
        if(this.mIsResizing === true) {
            this.onResizeDrag(event.position.x, event.position.y);
            return;
        }
        if(this.mIsMoving === true) {
            x = this.mInitialDragPos.x + event.distanceX;
            x -= this.mInitialDragTouchOffset.x;
            y = this.mInitialDragPos.y + event.distanceY;
            y -= this.mInitialDragTouchOffset.y;
            this.onMoveDrag(x, y);
            return;
        }
    };
    WhiteboardModuleView.prototype.onDragEnd = function (event) {
        this.mInitialDragPos = null;
        this.mInitialDim = null;
        this.mInitialDragTouchOffset = null;
        this.mInitialCenter = null;
        this.mInitialCenterDistance = 0;
        if(this.mIsResizing) {
            this.onResizeDragEnd();
        }
    };
    WhiteboardModuleView.prototype.onMoveStart = function () {
        this.mIsMoving = true;
    };
    WhiteboardModuleView.prototype.onMoveEnd = function () {
        this.mIsMoving = false;
    };
    WhiteboardModuleView.prototype.onMoveDrag = function (x, y) {
        this.mModule.setXY(x, y);
    };
    WhiteboardModuleView.prototype.onResizeStart = function () {
        this.mIsResizing = true;
    };
    WhiteboardModuleView.prototype.onResizeEnd = function () {
        this.mIsResizing = false;
    };
    WhiteboardModuleView.prototype.onResizeDragBegin = function () {
    };
    WhiteboardModuleView.prototype.onResizeDragEnd = function () {
    };
    WhiteboardModuleView.prototype.onResizeDrag = function (x, y) {
        var model = this.getModule().getModel();
        var deltaX = x - this.mInitialCenter.x;
        var deltaY = y - this.mInitialCenter.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var scale = distance / this.mInitialCenterDistance;
        scale = Math.min(scale, 2);
        scale = Math.max(scale, 0.5);
        var newWidth = this.mInitialDim.width * scale;
        var newHeight = this.mInitialDim.height * scale;
        this.mModule.setDim(newWidth, newHeight);
    };
    WhiteboardModuleView.prototype.createJquery = function () {
        throw "Module view did not create jquery!";
        return null;
    };
    WhiteboardModuleView.prototype.update = function (oldModel, newModel) {
        if(newModel.className !== newModel.className) {
            throw "Classname of " + this + " changed";
        }
        if(newModel.id !== oldModel.id) {
            throw "Id of " + this + " changed.";
        }
        if(newModel.author !== oldModel.author) {
            throw "Author of " + this + " changed";
        }
        if(newModel.layer !== oldModel.layer) {
            this.mJquery.css("z-index", newModel.layer);
        }
        if(newModel.pos.x !== oldModel.pos.x) {
            this.mJquery.css("left", newModel.pos.x);
        }
        if(newModel.pos.y !== oldModel.pos.y) {
            this.mJquery.css("top", newModel.pos.y);
        }
        if(newModel.dim.width !== oldModel.dim.width || newModel.dim.height !== oldModel.dim.height) {
            this.updateDim(newModel.dim.width, newModel.dim.height);
        }
    };
    WhiteboardModuleView.prototype.updateDim = function (width, height) {
        this.mJquery.css("height", height);
        this.mJquery.css("width", width);
    };
    WhiteboardModuleView.prototype.updatePos = function (x, y) {
        this.mJquery.css("left", x);
        this.mJquery.css("top", y);
    };
    WhiteboardModuleView.prototype.getModule = function () {
        return this.mModule;
    };
    WhiteboardModuleView.prototype.getJquery = function () {
        return this.mJquery;
    };
    WhiteboardModuleView.prototype.getDefaultButtons = function () {
        return this.mDefaultButtons;
    };
    return WhiteboardModuleView;
})();
var TextModule = (function (_super) {
    __extends(TextModule, _super);
    function TextModule(roomPage, whiteboard, model) {
        _super.call(this, roomPage, whiteboard, model);
        var id = this.getModel().id;
        this.mKey = "room-page-textmodule-edittext-" + id;
        roomPage.addResumeListener(this.mKey, this.onEditText.bind(this));
        this.addEditOption("Edit Text", {
            callback: this.editText.bind(this)
        });
        (this.getView()).refreshMathjax();
    }
    TextModule.prototype.getDefaultModel = function () {
        var defaults = _super.prototype.getDefaultModel.call(this);
        defaults.text = "Hello World!";
        defaults.dim.width = "auto";
        defaults.dim.height = "auto";
        defaults.fontSize = "1em";
        defaults.fontColor = "rgb(0,0,0)";
        return defaults;
    };
    TextModule.prototype.editText = function () {
        var app = this.getPage().getApp();
        var model = this.getModel();
        var context = {
            id: this.mKey,
            title: "Edit Text",
            default: {
                text: model.text,
                fontSize: model.fontSize,
                fontColor: model.fontColor
            },
            onCancel: this.cancelEdit.bind(this)
        };
        app.startPage(new Intent(EditTextDialog, {
            context: context
        }));
    };
    TextModule.prototype.onEditText = function (result) {
        var model = this.getModel();
        var view = this.getView();
        model.text = result.text;
        model.fontSize = result.fontSize;
        model.fontColor = result.fontColor;
        this.save(true);
    };
    TextModule.prototype.createView = function () {
        return new TextModuleView(this);
    };
    TextModule.prototype.getDefaultEditName = function () {
        return "Edit Text";
    };
    TextModule.prototype.getName = function () {
        return "Text";
    };
    return TextModule;
})(WhiteboardModule);
var TextModuleView = (function (_super) {
    __extends(TextModuleView, _super);
    function TextModuleView(textModule) {
        _super.call(this, textModule);
    }
    TextModuleView.prototype.createJquery = function () {
        var container = $("<pre></pre>");
        var model = this.getModule().getModel();
        container.text(model.text);
        container.css("font-size", model.fontSize);
        container.css("color", model.fontColor);
        container.css("overflow", "hidden");
        container.css("text-overflow", "ellipses");
        container.css("word-break", "break-all");
        container.css("word-wrap", "break-word");
        return container;
    };
    TextModuleView.prototype.update = function (oldModel, newModel) {
        _super.prototype.update.call(this, oldModel, newModel);
        var refresh = false;
        if(oldModel.text !== newModel.text) {
            this.updateText(newModel.text);
        }
        if(oldModel.fontColor !== newModel.fontColor) {
            this.getJquery().css("color", newModel.fontColor);
            refresh = true;
        }
        if(oldModel.fontSize !== newModel.fontSize) {
            this.getJquery().css("font-size", newModel.fontSize);
            refresh = true;
        }
        if(refresh === true) {
            var elem = this.getJquery()[0];
            MathJax.Hub.Queue([
                "Reprocess", 
                MathJax.Hub, 
                elem
            ]);
        }
    };
    TextModuleView.prototype.onResizeEnd = function () {
        _super.prototype.onResizeEnd.call(this);
        var elem = this.getJquery()[0];
        MathJax.Hub.Queue([
            "Reprocess", 
            MathJax.Hub, 
            elem
        ]);
    };
    TextModuleView.prototype.updateText = function (text) {
        var jquery = this.getJquery();
        jquery.text(text);
        this.refreshMathjax();
    };
    TextModuleView.prototype.refreshMathjax = function () {
        var jquery = this.getJquery();
        var elem = jquery[0];
        MathJax.Hub.Queue([
            "Typeset", 
            MathJax.Hub, 
            elem
        ]);
    };
    return TextModuleView;
})(WhiteboardModuleView);
this.Globals.whiteboardModules.Text = TextModule;
var DrawModule = (function (_super) {
    __extends(DrawModule, _super);
    function DrawModule(roomPage, whiteboard, model) {
        _super.call(this, roomPage, whiteboard, model);
        this.mStrokeColor = "black";
        this.mStrokeWidth = 5;
        var view = this.getView();
        this.addEditOption("Edit Drawing", {
            callback: this.startDrawing.bind(this),
            onEditEnd: this.doneDrawing.bind(this),
            extraButtons: view.getDrawButtons()
        });
        this.mColorDialogId = "draw-dialog-color-" + this.getModel().id;
        roomPage.addResumeListener(this.mColorDialogId, this.onChooseColor.bind(this));
        this.mStrokeSizeId = "draw-dialog-size-" + this.getModel().id;
        roomPage.addResumeListener(this.mStrokeSizeId, this.onChooseStrokeSize.bind(this));
    }
    DrawModule.prototype.startDrawing = function () {
        (this.getView()).drawStart();
    };
    DrawModule.prototype.doneDrawing = function (canceled) {
        (this.getView()).drawEnd(canceled);
    };
    DrawModule.prototype.chooseStrokeSize = function () {
        var app = this.getPage().getApp();
        var data = {
            context: {
                id: this.mStrokeSizeId,
                default: this.mStrokeWidth
            }
        };
        app.startPage(new Intent(SizeDialog, data));
    };
    DrawModule.prototype.chooseColor = function () {
        var app = this.getPage().getApp();
        var data = {
            context: {
                id: this.mColorDialogId,
                default: this.mStrokeColor
            }
        };
        app.startPage(new Intent(ColorDialog, data));
    };
    DrawModule.prototype.onChooseStrokeSize = function (result) {
        var size = parseInt(result);
        this.mStrokeWidth = size;
    };
    DrawModule.prototype.onChooseColor = function (result) {
        this.mStrokeColor = result;
    };
    DrawModule.prototype.getDefaultModel = function () {
        var defaults = _super.prototype.getDefaultModel.call(this);
        defaults.canvasString = null;
        defaults.dim.width = 256;
        defaults.dim.height = 256;
        return defaults;
    };
    DrawModule.prototype.createView = function () {
        return new DrawModuleView(this);
    };
    DrawModule.prototype.getName = function () {
        return "Draw";
    };
    DrawModule.prototype.getDefaultEditName = function () {
        return "Edit Drawing";
    };
    DrawModule.prototype.getStrokeWidth = function () {
        return this.mStrokeWidth;
    };
    DrawModule.prototype.getStrokeColor = function () {
        return this.mStrokeColor;
    };
    return DrawModule;
})(WhiteboardModule);
var DrawModuleView = (function (_super) {
    __extends(DrawModuleView, _super);
    function DrawModuleView(drawModule) {
        _super.call(this, drawModule);
        this.mInDrawMode = false;
        this.mDrawButtons = $([]);
        this.mIsErasing = false;
        this.mPenDown = false;
        this.mLastStyle = "";
        var b;
        b = this.createButton("Color", "icon-eye-open", drawModule.chooseColor.bind(drawModule));
        this.mDrawButtons = this.mDrawButtons.add(b);
        b = this.createButton("Stroke Size", "icon-resize-full", drawModule.chooseStrokeSize.bind(drawModule));
        this.mDrawButtons = this.mDrawButtons.add(b);
        var erase = this.createButton("Erase", "icon-check-empty", function () {
            this.mIsErasing = !this.mIsErasing;
            var text = erase.find("p");
            if(this.mIsErasing === false) {
                text.text("Erase");
            } else {
                text.text("Stop Erasing");
            }
        }.bind(this));
        this.mDrawButtons = this.mDrawButtons.add(erase);
        b = this.createButton("Clear", "icon-remove-circle", function () {
            var model = this.getModule().getModel();
            this.mContext.clearRect(0, 0, model.dim.width, model.dim.height);
        }.bind(this));
        this.mDrawButtons = this.mDrawButtons.add(b);
    }
    DrawModuleView.prototype.createJquery = function () {
        var module = (this.getModule());
        var model = module.getModel();
        var container = $("<div></div>");
        this.mCanvas = $("<canvas></canvas>");
        this.mContext = (this.mCanvas[0]).getContext("2d");
        this.mCanvas.attr("width", model.dim.width);
        this.mCanvas.attr("height", model.dim.height);
        if(Util.exists(model.canvasString)) {
            this.loadFromBase64(model.canvasString);
        }
        container.append(this.mCanvas);
        return container;
    };
    DrawModuleView.prototype.onResizeStart = function () {
        _super.prototype.onResizeStart.call(this);
        var model = this.getModule().getModel();
        this.mBeforeResize = $("<canvas></canvas>");
        this.mBeforeResize.attr("width", model.dim.width);
        this.mBeforeResize.attr("height", model.dim.height);
        var canvas = this.mCanvas[0];
        (this.mBeforeResize[0]).getContext("2d").drawImage(canvas, 0, 0);
    };
    DrawModuleView.prototype.onResizeDragEnd = function () {
        this.mContext.drawImage(this.mBeforeResize[0], 0, 0);
    };
    DrawModuleView.prototype.update = function (oldModel, newModel) {
        _super.prototype.update.call(this, oldModel, newModel);
        if(oldModel.canvasString !== newModel.canvasString) {
            this.loadFromBase64(newModel.canvasString);
        }
    };
    DrawModuleView.prototype.updateDim = function (width, height) {
        this.mCanvas.attr("width", width);
        this.mCanvas.attr("height", height);
        _super.prototype.updateDim.call(this, width, height);
    };
    DrawModuleView.prototype.toBase64 = function () {
        return (this.mCanvas[0]).toDataURL();
    };
    DrawModuleView.prototype.loadFromBase64 = function (base64) {
        var image = new Image();
        image.src = base64;
        var model = this.getModule().getModel();
        image.onload = function () {
            this.mContext.clearRect(0, 0, model.dim.width, model.dim.height);
            this.mContext.drawImage(image, 0, 0);
        }.bind(this);
    };
    DrawModuleView.prototype.drawStart = function () {
        this.removeHammer();
        this.mInDrawMode = true;
        var touchSupported = ('ontouchstart' in document.documentElement);
        if(touchSupported === true) {
            this.mCanvas.bind("touchstart", this.onPenDown.bind(this));
            this.mCanvas.bind("touchmove", this.onPenMove.bind(this));
            this.mCanvas.bind("touchend", this.onPenLeave.bind(this));
            this.mCanvas.bind("touchleave", this.onPenLeave.bind(this));
        } else {
            this.mCanvas.bind("mousedown", this.onPenDown.bind(this));
            this.mCanvas.bind("mousemove", this.onPenMove.bind(this));
            this.mCanvas.bind("mouseout", this.onPenLeave.bind(this));
            this.mCanvas.bind("mouseup", this.onPenLeave.bind(this));
        }
    };
    DrawModuleView.prototype.drawEnd = function (canceled) {
        this.mCanvas.unbind("touchstart");
        this.mCanvas.unbind("touchmove");
        this.mCanvas.unbind("touchend");
        this.mCanvas.unbind("touchleave");
        this.mCanvas.unbind("mousedown");
        this.mCanvas.unbind("mouseout");
        this.mCanvas.unbind("mouseup");
        var model = this.getModule().getModel();
        if(canceled === false) {
            model.canvasString = this.toBase64();
        } else {
            this.loadFromBase64(model.canvasString);
        }
        this.mInDrawMode = false;
        this.addHammer(this.getJquery());
    };
    DrawModuleView.prototype.onPenDown = function (e) {
        this.mPenDown = true;
        e.preventDefault();
    };
    DrawModuleView.prototype.onPenMove = function (e) {
        if(this.mPenDown === false) {
            return;
        }
        e.preventDefault();
        var context = this.mContext;
        var module = this.getModule();
        var width = module.getStrokeWidth();
        if(this.mIsErasing === true) {
            context.clearRect(e.offsetX, e.offsetY, width, width);
        } else {
            var strokeColor = module.getStrokeColor();
            if(this.mLastStyle !== strokeColor) {
                context.fillStyle = strokeColor;
                this.mLastStyle = strokeColor;
            }
            var x;
            var y;
            if(Util.exists(e.offsetX) && Util.exists(e.offsetY)) {
                x = Math.round(e.offsetX);
                y = Math.round(e.offsetY);
            } else {
                var touch = e.originalEvent.touches[0];
                var offset = this.getJquery().offset();
                x = touch.pageX - offset.left;
                y = touch.pageY - offset.top;
            }
            context.beginPath();
            context.arc(x, y, width, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }
    };
    DrawModuleView.prototype.onPenLeave = function (e) {
        this.mPenDown = false;
    };
    DrawModuleView.prototype.getContext = function () {
        return this.mContext;
    };
    DrawModuleView.prototype.getDrawButtons = function () {
        return this.mDrawButtons;
    };
    return DrawModuleView;
})(WhiteboardModuleView);
this.Globals.whiteboardModules.Draw = DrawModule;
var RoomPage = (function (_super) {
    __extends(RoomPage, _super);
    function RoomPage() {
        _super.apply(this, arguments);

        this.mResumeListeners = {
        };
    }
    RoomPage.prototype.clearCanvas = function () {
        var modules = this.mRoom.whiteboard.model.modules;
        for(var id in modules) {
            var moduleGah = modules[id];
            moduleGah.destroy();
        }
    };
    RoomPage.prototype.selectTab = function (tab) {
        if(this.getTab() === tab) {
            return;
        }
        this.mActiveTabIndex = this.mTabs.indexOf(tab);
        var view = this.getView();
        view.onChangeTab(tab);
    };
    RoomPage.prototype.addResumeListener = function (id, callback) {
        if(!Util.exists(this.mResumeListeners[id])) {
            this.mResumeListeners[id] = [];
        }
        this.mResumeListeners[id].push(callback);
    };
    RoomPage.prototype.onCreate = function () {
        var app = this.getApp();
        this.mSocket = Globals.socket;
        this.mTabs = [];
        this.mTabs.push(new ManipulateTab(this));
        this.mTabs.push(new MiscTab(this));
        this.mActiveTabIndex = 0;
        if(this.getApp() instanceof MobileApp) {
            this.setView(new RoomMobileView(this));
        } else {
            throw "Unimplemented";
        }
        this.mSocket.register(this.onRegister.bind(this));
        this.addResumeListener("select-tab", function (value) {
            for(var i = 0; i < this.mTabs.length; i++) {
                if(this.mTabs[i].getName() === value) {
                    this.selectTab(this.mTabs[i]);
                    break;
                }
            }
        }.bind(this));
    };
    RoomPage.prototype.onResume = function (data) {
        var i;
        this.mSocket.addMessageCallback("message", "page-room-message", this.onMessage.bind(this));
        this.mSocket.addMessageCallback("modCreate", "page-room-mod-create", this.onModCreate.bind(this));
        this.mSocket.addMessageCallback("modModify", "page-room-mod-modify", this.onModModify.bind(this));
        this.mSocket.addMessageCallback("modDelete", "page-room-mod-delete", this.onModDelete.bind(this));
        this.mSocket.setDisconnectCallback(function () {
            this.getApp().back();
        }.bind(this));
        this.mSocket.setNewUserCallback(this.onNewUser.bind(this));
        var onDisconnect = this.onUserDisconnect.bind(this);
        this.mSocket.setUserDisconnectCallback(onDisconnect);
        if(!Util.exists(data)) {
            return;
        }
        if(!Util.exists(data.id)) {
            return;
        }
        var callbacks = this.mResumeListeners[data.id];
        if(!Util.exists(callbacks)) {
            return;
        }
        for(var i = 0; i < callbacks.length; i++) {
            callbacks[i](data.result);
        }
    };
    RoomPage.prototype.onPause = function () {
        this.mSocket.removeMessageCallback("modCreate", "page-room-mod-create");
        this.mSocket.removeMessageCallback("modModify", "page-room-mod-modify");
        this.mSocket.removeMessageCallback("modDelete", "page-room-mod-delete");
        this.mSocket.removeMessageCallback("message", "page-room-message");
        this.mSocket.removeDisconnectCallback();
        this.mSocket.removeNewUserCallback();
        this.mSocket.removeUserDisconnectCallback();
    };
    RoomPage.prototype.onRegister = function (roomInfo) {
        var view = this.getView();
        if(view.isInflated() === false || this.getTransitionOver() === false) {
            setTimeout(function () {
                this.onRegister.call(this, roomInfo);
            }.bind(this), 1000 / 60);
            return;
        }
        history.pushState({
        }, "/", roomInfo.id);
        var canvas = view.getCanvas();
        var toolview = view.getToolContainer();
        var whiteboard = roomInfo.whiteboardModel;
        var dim = {
            width: whiteboard.width,
            height: whiteboard.height
        };
        var whiteboardView = new WhiteboardView(view, canvas, toolview, dim);
        var model = roomInfo.whiteboardModel;
        model.nextId = parseInt(model.nextId);
        var room = {
            id: parseInt(roomInfo.id),
            name: roomInfo.name,
            usernames: roomInfo.usernames,
            messages: [],
            whiteboard: {
                model: model,
                view: whiteboardView
            }
        };
        this.mRoom = room;
        var usersRooms = this.getApp().getUser().rooms;
        if(!Util.exists(usersRooms[room.id])) {
            usersRooms[room.id] = {
                id: roomInfo.id,
                name: room.name
            };
        }
        view.onRegister(this.mRoom);
        var moduleIds = [];
        for(var moduleId in model.modules) {
            moduleIds.push(moduleId);
        }
        for(var i = 0; i < moduleIds.length; i++) {
            moduleId = moduleIds[i];
            var moduleModel = model.modules[moduleId];
            var construct = Globals.whiteboardModules[moduleModel.className];
            var module = new construct(this, room.whiteboard, moduleModel);
        }
    };
    RoomPage.prototype.onNewUser = function (username) {
        var room = this.mRoom;
        var view = this.getView();
        room.usernames.push(username);
        var msg = username + " has joined the room.";
        view.displayNotification("New User", msg, "icon-signin");
    };
    RoomPage.prototype.onUserDisconnect = function (username) {
        var room = this.mRoom;
        var view = this.getView();
        var index = room.usernames.indexOf(username);
        room.usernames.splice(index, 1);
        var msg = username + " has left the room.";
        view.displayNotification("User Disconnected", msg, "icon-signout");
    };
    RoomPage.prototype.onMessage = function (username, message) {
        var view = this.getView();
        this.mRoom.messages.push({
            username: username,
            message: message
        });
        view.displayNotification(username, message, "icon-comment-alt");
    };
    RoomPage.prototype.onModCreate = function (username, data) {
        console.log("From:", username, "Create:", data);
        var model = data.model;
        var whiteboard = this.mRoom.whiteboard;
        whiteboard.model.nextId = data.nextId;
        var construct = Globals.whiteboardModules[model.className];
        var module = new construct(this, whiteboard, model);
    };
    RoomPage.prototype.onModModify = function (username, model) {
        var whiteboard = this.mRoom.whiteboard.model;
        var id = model.id;
        whiteboard.modules[id].onModify(model);
    };
    RoomPage.prototype.onModDelete = function (username, moduleId) {
        var whiteboard = this.mRoom.whiteboard.model;
        whiteboard.modules[moduleId].onDestroy();
    };
    RoomPage.prototype.onTabTapped = function () {
        var intentData = {
            context: {
                id: "select-tab",
                items: []
            }
        };
        var items = intentData.context.items;
        for(var i = 0; i < this.mTabs.length; i++) {
            var tabName = this.mTabs[i].getName();
            items.push({
                text: tabName,
                value: tabName
            });
        }
        var intent = new Intent(SelectDialog, intentData);
        this.getApp().startPage(intent);
    };
    RoomPage.prototype.onChatTapped = function () {
        var app = this.getApp();
        var intentData = {
            room: this.mRoom
        };
        var intent = new Intent(ChatPage, intentData);
        app.startPage(intent);
    };
    RoomPage.prototype.getTab = function () {
        return this.mTabs[this.mActiveTabIndex];
    };
    RoomPage.prototype.getTabs = function () {
        return this.mTabs;
    };
    RoomPage.prototype.getRoom = function () {
        return this.mRoom;
    };
    return RoomPage;
})(Page);
//@ sourceMappingURL=page.js.map
