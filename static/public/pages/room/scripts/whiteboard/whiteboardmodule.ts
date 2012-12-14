/*
 * Whiteboard module super class including its model.
 */
/// <reference path="../imports.ts"/>

interface Pos {
    x: number; 
    y: number;
}

interface Dim {
    width: any;  /* Could be a percent, or "auto" */
    height: any;
}

/* Model of a whiteboard module. Contains all necessary information 
 * needed to make a new whiteboard module (or modify) */
interface WhiteboardModuleModel {
    className : any;
    id : number;
    author: string;
    layer : number;
    pos : Pos;
    dim : Dim;
}

interface EditOption {
    callback : () => void; /* Called when we have selected this module */
    onEditEnd? : (canceled : bool) => void;
    extraButtons? : JQuery; /* The extra buttons to add when selected */
    focusModule? : bool; /* Whether or not to focus this module on select */
}

class WhiteboardModule {
    private mPage : RoomPage;
    private mRoom : Room;
    private mSocket : Socket;
    private mWhiteboard : Whiteboard;
    private mModel : WhiteboardModuleModel;
    private mView : WhiteboardModuleView;
    /* Key used for long press callbacks */
    private mLongPressKey : string;
    /* If mEditor is nonnull, it is the key to the callback
     * in mEditOptions. Otherwise, we are not editing */
    private mEditOptions : {
        [name : string] : EditOption;
    } = {}; 
    private mEditor : string = null;
    private mOldModel : WhiteboardModuleModel = null;

    /* Creates a new instance of the module. If no whiteboard module
     * creator is passed, defaults are used and we assume that this
     * module was created by this user. */
    constructor(roomPage : RoomPage,
                whiteboard : Whiteboard,
                model : WhiteboardModuleModel) {
        this.mPage = roomPage;
        this.mRoom = roomPage.getRoom();
        this.mSocket = Globals.socket; /* Get the active socket */
        this.mWhiteboard = whiteboard;
        /* Check to see if the model was passed. If it wasn't, we do not
         * store the model in the whiteboard model. If it was, we do. */
        var userCreated : bool = !Util.exists(model);
        if (userCreated === false)
            whiteboard.model.modules[model.id] = this;
        else model = this.getDefaultModel();
        this.mModel = model;
        this.mView = this.createView();
        this.addDefaultEditOptions();
        /* Add this module to the canvas */
        this.mWhiteboard.view.addWhiteboardModule(this.mView);
        /* Register this module for callbacks */
        this.mLongPressKey = "whiteboard-module-" + this.mModel.id + 
                             "-long-press";
        roomPage.addResumeListener(this.mLongPressKey,
                                   this.onLongPressReturn.bind(this));
        this.mWhiteboard.model.modules[this.mModel.id] = this;
        /* Send a creation event if the user created the module */
        if (userCreated === true) {
            this.mWhiteboard.model.nextId++;
            this.mSocket.sendMessage("modCreate", this.getModel());
        }
    }

    /* Add the popup edit options to this module */
    private addDefaultEditOptions() : void {
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
            focusModule : false
        });
    }

    /* Adds the given edit option to the popup that appears when
     * we long press the module. Display the given buttons along with
     * the default buttons. */
    public addEditOption(name : string, editOption : EditOption) {
        this.mEditOptions[name] = editOption;
    }

    /* Starts the editing process for this module */
    public edit(editOptionName : string) {
        var editOption = this.mEditOptions[editOptionName];
        /* If the option does not require focus, just call the
         * callback */
        if (editOption.focusModule === false) {
            editOption.callback();
            return;
        }
        this.mEditor = editOptionName;
        this.mOldModel = Util.cloneObject(this.mModel);
        var defaultButtons = this.mView.getDefaultButtons();
        var buttons = defaultButtons.add(editOption.extraButtons);
        this.mWhiteboard.view.focus(this.mView, buttons);
        editOption.callback();
    }

    /* Ends the editing process for this module, not saving the result */
    public cancelEdit() : void {
        var onEditEnd = this.mEditOptions[this.mEditor].onEditEnd;
        if (Util.exists(onEditEnd)) onEditEnd(true);
        this.mEditor = null;
        this.mView.update(this.mModel, this.mOldModel);
        this.mModel = this.mOldModel;
        this.mWhiteboard.view.unfocus();
    }

    /* Ends the editing process for this module, saving the result */
    public save(updateView? : bool) : void {
        var onEditEnd = this.mEditOptions[this.mEditor].onEditEnd;
        if (Util.exists(onEditEnd)) onEditEnd(false);
        if (updateView === true)
            this.mView.update(this.mOldModel, this.mModel);
        this.mEditor = null;
        this.mWhiteboard.view.unfocus();
        this.mSocket.sendMessage("modModify", this.getModel());
    }

    /* Starts the moving process for this module. */
    public startMove() : void {
        this.mView.onMoveStart();
    }

    /* Ends the moving process for this module. */
    public endMove() : void {
        this.mView.onMoveEnd();
    }

    /* Starts the resize process for this module. */
    public startResize() : void {
        this.mView.onResizeStart();
    }

    /* Ends the resize process for this module. */
    public endResize() : void {
        this.mView.onResizeEnd();
    }

    /* Deletes this module and view and sends a message to other
     * clients */
    public destroy() : void {
        var id = this.mModel.id;
        this.onDestroy();
        this.mSocket.sendMessage("modDelete", id);
    }

    /*
     * EVENT LISTENERS
     */

    /* Called when the user has long pressed on this module
     * (not during editing) */
    public onLongPress() {
        var app = Globals.app;
        var items = [];
        for (var key in this.mEditOptions)
            items.push({text: key, value: key});
        var context = {
            id: this.mLongPressKey,
            items: items
        };
        app.startPage(new Intent(SelectDialog, {context: context}));
    }

    /* Called when a long press's menu has returned */
    public onLongPressReturn(result : string) {
        if (result in this.mEditOptions)
            this.edit(result);
    }

    /* Called when this module has been modified,
     * We update the values passed and the view */
    public onModify(modifier : WhiteboardModuleModel) {
        var oldModel = this.mModel;
        this.mModel = modifier;
        this.mView.update(oldModel, modifier);
    }

    /* Called when this module has been requested to be deleted, whether
     * that be from an external or internal user */
    public onDestroy() : void {
        this.mWhiteboard.view.removeWhiteboardModule(this.mView);
        if (Util.exists(this.mWhiteboard.model.modules[this.mModel.id]))
            delete this.mWhiteboard.model.modules[this.mModel.id];
    }

    /*
     * OVERRIDE METHODS
     *  Methods subclasses should override and implement.
     *  (all subclasses should call super method)
     */
    public getDefaultModel() : WhiteboardModuleModel {
        var rect : Pos = this.mWhiteboard.view.getScroll();
        return {
            className: this.getName(),
            id : this.mWhiteboard.model.nextId,
            author : Globals.app.getUser().username,
            layer : this.mWhiteboard.view.getNextFreeLayer(),
            pos : rect,
            dim : {width: 256, height: 256}
        };
    }

    /*
     * ABSTRACT METHODS
     *     Methods that should be implemented by the subclass
     */
    public getDefaultEditName() : string {
        throw "Not implemented";
    }

    public createView() : WhiteboardModuleView {
        throw "createView not implemented by" + this["constructor"];
    }

    /* The name used in Globals.whiteboardModules */
    public getName() : string {
        throw "getName not implemented by " + this["constructor"];
    }

    /* 
     * GETTERS AND SETTERS
     */
    
    public getWhiteboard() : Whiteboard {
        return this.mWhiteboard;
    }
    
    /* Returns the model associated with this module */
    public getModel() : WhiteboardModuleModel {
        return this.mModel;
    }

    public getPage() : RoomPage {
        return this.mPage;
    }

    public getView() : WhiteboardModuleView {
        return this.mView;
    }

    public setXY(x : number, y : number) {
        this.mModel.pos.x = x;
        this.mModel.pos.y = y;
        this.mView.updatePos(x, y);
    }

    public setDim(width : number, height : number) {
        this.mModel.dim.width = width;
        this.mModel.dim.height = height;
        this.mView.updateDim(width, height);
    }
}