/*
 * View for the whiteboard module class.
 */
/// <reference path="../imports.ts"/>

declare var Hammer;

class WhiteboardModuleView {
    private mModule : WhiteboardModule;
    private mHammer : any;
    private mJquery : JQuery;
    private mDefaultButtons : JQuery = $([]);
    private mIsResizing : bool = false;
    private mIsMoving : bool = false;
    private mIsFocused : bool = false;

    constructor(module : WhiteboardModule) {
        this.mModule = module;
        this.mJquery = this.processJquery(this.createJquery());
        /* Create the save button */
        var save = this.mModule.save.bind(this.mModule);
        var saveButton = this.createButton("Save", "icon-save", save);
        this.addDefaultButton(saveButton);
        /* Create the cancel button */
        var cancel = this.mModule.cancelEdit.bind(this.mModule);
        var cancelButton = this.createButton("Cancel", " icon-remove", cancel);
        this.addDefaultButton(cancelButton);
    }

    /* Adds the given button to the list of default buttons
     * that show up when this module is being edited */
    public addDefaultButton(button : JQuery) {
        this.mDefaultButtons = this.mDefaultButtons.add(button);
    }

    public createButton(name : string, icon : string,
                         callback : () => void) : JQuery {
        var button = $("<button></button>");
        button.addClass("icon");
        var icon = $("<i></i>").addClass(icon).addClass("icon-large");
        button.append(icon);
        button.append($("<p></p>").text(name));
        button.hammer({}).bind("tap", callback);
        Util.makeMobile(button);
        return button;
    }

    /* Process the jquery returned by createJquery. That is, add
     * touch handlers and make sure certain css is set */
    private processJquery(jquery : JQuery) : JQuery {
        /* Add css */
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
    }

    /* Add touch listeners to the given jquery */
    public addHammer(jquery : JQuery) {
        /* add a border on tap */
        var addBorder = function() {
            console.log("ADDING BORDER");
            if (this.mIsFocused === false) {
                this.mJquery.css("border-color", "black");
                this.mJquery.css("border-style", "dotted");
            }
        }.bind(this);
        /* Remove a border on tap */
        var removeBorder = function() {
            console.log("REMOVING BORDER");
            if (this.mIsFocused === false) {
                this.mJquery.css("border-color", "rgba(0,0,0,0)");
            }
        }.bind(this);
        /* Set up hammer */
        var hammer = new Hammer(jquery[0], {
            prevent_default: true,
            tapstart_callback: addBorder,
            tapend_callback: removeBorder
        });
        this.mHammer = hammer;
        /* Long press callback */
        hammer.onhold = function() {
            if (this.mModule.getWhiteboard().view.hasFocus() === false)
                this.getModule().onLongPress();
        }.bind(this);
        /* Dragging while we have the ability to Drag */
        var onDrag = function(f)  {
            return function(event) {
                if (this.mIsMoving ||
                        this.mIsResizing) f.call(this, event);
            }.bind(this);
        }.bind(this);
        hammer.ondragstart = onDrag(this.onDragStart);
        hammer.ondrag = onDrag(this.onDrag);
        hammer.ondragend = onDrag(this.onDragEnd);
    }

    /* Remove hammer from this module */
    public removeHammer() {
        this.mHammer.destroy();
    }

    /* Called when this view is added to the whiteboard */
    public onDomInsertion() {}

    /* Removes this view from the dom */
    public detach() {
        this.mJquery.detach();
    }

    /* Called when this view is focused */
    public onFocus() {
        this.mIsFocused = true;
        var whiteboardView = this.mModule.getWhiteboard().view;
        this.mJquery.css("z-index", whiteboardView.getFocusLayer());
        this.mJquery.css("border-color", "red");
        this.mJquery.css("border-width", "2px");
        this.mJquery.css("border-style", "dashed");
    }

    /* Called when this view is unfocused */
    public onUnfocus() {
        this.mIsFocused = false;
        var model = this.mModule.getModel();
        this.mJquery.css("z-index", model.layer);
        this.mJquery.css("border-color", "rgba(0,0,0,0)");
    }

    /**************************************************************************/
    /* DRAG FUNCTIONS                                                         */
    /**************************************************************************/

    private mInitialCenterDistance : number = null;
    private mInitialCenter : Pos = null;
    private mInitialDragPos : Pos = null;
    private mInitialDim : Dim = null;
    private mInitialDragTouchOffset : Pos = null;
    private onDragStart(event) {
        var model = this.mModule.getModel();
        this.mInitialDragPos = event.position;
        this.mInitialDragTouchOffset  = {
            x: this.mInitialDragPos.x - model.pos.x,
            y: this.mInitialDragPos.y - model.pos.y
        };
        /* Find the distance from the center */
        var offset = this.mJquery.offset();
        this.mInitialCenter = {
            x: offset.left,
            y: offset.top
        };
        var deltaX = event.position.x - this.mInitialCenter.x;
        var deltaY = event.position.y - this.mInitialCenter.y;
        this.mInitialCenterDistance = deltaX * deltaX + deltaY * deltaY;
        this.mInitialCenterDistance = Math.sqrt(this.mInitialCenterDistance);
        /* Find the initial dimensions */
        this.mInitialDim = {
            width: this.mJquery.width(),
            height: this.mJquery.height()
        }
        if (this.mIsResizing) this.onResizeDragBegin();
    }

    private onDrag(event) {
        var x;
        var y;
        if (this.mIsResizing === true) {
            this.onResizeDrag(event.position.x, event.position.y);
            return;
        }
        if (this.mIsMoving === true) {
            x = this.mInitialDragPos.x + event.distanceX;
            x -= this.mInitialDragTouchOffset.x;
            y = this.mInitialDragPos.y + event.distanceY;
            y -= this.mInitialDragTouchOffset.y;
            this.onMoveDrag(x, y);
            return;
        }
    }

    private onDragEnd(event) {
        this.mInitialDragPos = null;
        this.mInitialDim = null;
        this.mInitialDragTouchOffset = null;
        this.mInitialCenter = null;
        this.mInitialCenterDistance = 0;
        if (this.mIsResizing) this.onResizeDragEnd();
    }

    /**************************************************************************/
    /* MOVE AND DRAG FUNCTIONS                                                */
    /**************************************************************************/

    public onMoveStart() {
        this.mIsMoving = true;
    }

    public onMoveEnd() {
        this.mIsMoving = false;
    }

    public onMoveDrag(x : number, y : number) {
        this.mModule.setXY(x, y);
    }

    /**************************************************************************/
    /* RESIZE FUNCTIONS                                                       */
    /**************************************************************************/

    public onResizeStart() {
        this.mIsResizing = true;
    }

    public onResizeEnd() {
        this.mIsResizing = false;
    }

    public onResizeDragBegin() {}

    public onResizeDragEnd() {}

    public onResizeDrag(x : number, y : number) {
        var model = this.getModule().getModel();
        /* Find the distance from the initial center */
        var deltaX = x - this.mInitialCenter.x;
        var deltaY = y - this.mInitialCenter.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        /* Find how much our distance has increased from the initial distance */
        var scale = distance / this.mInitialCenterDistance;
        scale = Math.min(scale, 2);
        scale = Math.max(scale, .5);
        var newWidth = this.mInitialDim.width * scale;
        var newHeight = this.mInitialDim.height * scale;
        this.mModule.setDim(newWidth, newHeight);
    }

    /*
     * OVERRIDE
     *  Methods subclasses should implement
     */
    
    private createJquery() : JQuery {
        throw "Module view did not create jquery!";
        return null;
    }

     /*
     * ABSTRACT METHODS
     *  Methods subclasses should override and implement.
     *  (all subclasses should call super method)
     */

    /* Grab the latest model from the module and update the jquery
     * accordingly */
    public update(oldModel : WhiteboardModuleModel,
                  newModel : WhiteboardModuleModel) {
        if (newModel.className !== newModel.className) {
            throw "Classname of " + this + " changed";
        }
        if (newModel.id !== oldModel.id) {
            throw "Id of " + this +  " changed.";
        }
        if (newModel.author !== oldModel.author) {
            throw "Author of " + this + " changed";
        }
        if (newModel.layer !== oldModel.layer) {
            this.mJquery.css("z-index", newModel.layer);
        }
        if (newModel.pos.x !== oldModel.pos.x) {
            this.mJquery.css("left", newModel.pos.x);
        }
        if (newModel.pos.y !== oldModel.pos.y) {
            this.mJquery.css("top", newModel.pos.y);
        }
        if (newModel.dim.width !== oldModel.dim.width ||
                newModel.dim.height !== oldModel.dim.height) {
            this.updateDim(newModel.dim.width, newModel.dim.height);
        }
    }

    public updateDim(width : number, height : number) {
        this.mJquery.css("height", height);
        this.mJquery.css("width", width);
    }

    public updatePos(x : number, y : number) {
        this.mJquery.css("left", x);
        this.mJquery.css("top", y);
    }

    /*
     * GETTERS AND SETTERS
     */
    public getModule() : WhiteboardModule {
        return this.mModule;
    }

    public getJquery() : JQuery {
        return this.mJquery;
    }

    public getDefaultButtons() : JQuery {
        return this.mDefaultButtons;
    }
}