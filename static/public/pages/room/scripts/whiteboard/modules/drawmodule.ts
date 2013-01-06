/* 
 * Draw whiteboard module class 
 */
/// <reference path="../../imports.ts">


declare var fabric;

interface DrawModuleModel extends WhiteboardModuleModel {
    canvasString : string;
}

class DrawModule extends WhiteboardModule {
    private mStrokeColor : string = "black";
    private mStrokeWidth : number = 5;
    private mStrokeSizeId : string;
    private mColorDialogId : string;

    constructor(roomPage : RoomPage,
                whiteboard : Whiteboard,
                model : WhiteboardModuleModel) {
        super(roomPage, whiteboard, model);
        var view : DrawModuleView = <DrawModuleView> this.getView();
        this.addEditOption("Edit Drawing", {
            callback: this.startDrawing.bind(this),
            onEditEnd: this.doneDrawing.bind(this),
            extraButtons: view.getDrawButtons()
        }); 
        /* Register color dialog callback */
        this.mColorDialogId = "draw-dialog-color-" + this.getModel().id;
        roomPage.addResumeListener(this.mColorDialogId,
                                   this.onChooseColor.bind(this));
        /* Register sizes dialog callback */
        this.mStrokeSizeId = "draw-dialog-size-" + this.getModel().id;
        roomPage.addResumeListener(this.mStrokeSizeId,
                                   this.onChooseStrokeSize.bind(this));
    }

    /* Called when the user enters drawing mode */
    public startDrawing() {
        (<DrawModuleView> this.getView()).drawStart();
    }

    /* Called when we are no longer in drawing mode */
    public doneDrawing(canceled : bool) {
        (<DrawModuleView> this.getView()).drawEnd(canceled);
    }

    public chooseStrokeSize() {
        var app = this.getPage().getApp();
        var data = {
            context : {
                id: this.mStrokeSizeId,
                default: this.mStrokeWidth
            }
        }
        app.startPage(new Intent(SizeDialog, data));
    }

    public chooseColor() {
        var app = this.getPage().getApp();
        var data = {
            context : { 
                id: this.mColorDialogId,
                default: this.mStrokeColor
            }
        }
        app.startPage(new Intent(ColorDialog, data));
    }

    public onChooseStrokeSize(result : string) {
        var size = parseInt(result);
        this.mStrokeWidth = size;
    }

    public onChooseColor(result : string) {
        this.mStrokeColor = result;
    }

    public getDefaultModel() : DrawModuleModel {
        var defaults = <DrawModuleModel> super.getDefaultModel();
        defaults.canvasString = null; 
        defaults.dim.width = 256;
        defaults.dim.height = 256;
        return defaults;
    }

    public createView() : DrawModuleView {
        return new DrawModuleView(this);
    }

    /*
     * GETTERS AND SETTERS
     */

    public getName() : string {
        return "Draw";
    }

    public getDefaultEditName() : string {
        return "Edit Drawing";
    }

    public getStrokeWidth() : number {
        return this.mStrokeWidth;
    }

    public getStrokeColor() : string {
        return this.mStrokeColor;
    }

}

class DrawModuleView extends WhiteboardModuleView {
    private mCanvasId : string;
    private mCanvas : JQuery;
    private mContext : any;
    private mInDrawMode : bool = false;
    private mDrawButtons : JQuery = $([]);
    private mIsErasing : bool = false;

    constructor(drawModule : DrawModule) {
        super(drawModule);
        /* Create the draw buttons */
        var b;
        b = this.createButton("Color",
                              "icon-eye-open",
                              drawModule.chooseColor.bind(drawModule));
        this.mDrawButtons = this.mDrawButtons.add(b);
        /* Size button */
        b = this.createButton("Stroke Size",
                              "icon-resize-full",
                              drawModule.chooseStrokeSize.bind(drawModule));
        this.mDrawButtons = this.mDrawButtons.add(b);
        /* Erase button */
        var erase = this.createButton("Erase", "icon-check-empty", function() {
            this.mIsErasing = !this.mIsErasing;
            var text = erase.find("p");
            if (this.mIsErasing === false) text.text("Erase");
            else text.text("Stop Erasing");
        }.bind(this));
        this.mDrawButtons = this.mDrawButtons.add(erase);
        /* Clear button */
        b = this.createButton("Clear", "icon-remove-circle", function() {
            var model = this.getModule().getModel();
            this.mContext.clearRect(0, 0, model.dim.width, model.dim.height);
        }.bind(this));
        this.mDrawButtons = this.mDrawButtons.add(b);
    }

    private createJquery() : JQuery {
        var module : DrawModule = (<DrawModule> this.getModule())
        var model : DrawModuleModel = <DrawModuleModel> module.getModel();
        var container = $("<div></div>");
        this.mCanvas = $("<canvas></canvas>");
        this.mContext = (<any> this.mCanvas[0]).getContext("2d");
        /* Set the width and height */
        this.mCanvas.attr("width", model.dim.width);
        this.mCanvas.attr("height", model.dim.height);
        /* Load the canvas */
        if (Util.exists(model.canvasString))
            this.loadFromBase64(model.canvasString);
        container.append(this.mCanvas);
        return container;
    }


    /*
     * Dealing with resize clearing the canvas 
     */
    private mBeforeResize : JQuery;
    public onResizeStart() {
        super.onResizeStart();
        var model = this.getModule().getModel();
        this.mBeforeResize = $("<canvas></canvas>");
        this.mBeforeResize.attr("width", model.dim.width);
        this.mBeforeResize.attr("height", model.dim.height);
        var canvas = this.mCanvas[0];
        (<any> this.mBeforeResize[0]).getContext("2d").drawImage(canvas, 0, 0);
    }

    public onResizeDragEnd() {
        this.mContext.drawImage(this.mBeforeResize[0], 0, 0);
    }

    /**************************************************************************/
    /* UPDATE FUNCTIONS                                                       */
    /**************************************************************************/

    /* Update this view */
    public update(oldModel : DrawModuleModel,
                  newModel : DrawModuleModel) {
        super.update(oldModel, newModel);
        if (oldModel.canvasString !== newModel.canvasString) {
            this.loadFromBase64(newModel.canvasString);
        }
    }

    public updateDim(width : number, height : number) {
        this.mCanvas.attr("width", width);
        this.mCanvas.attr("height", height);
        super.updateDim(width, height);
    }

    private toBase64() {
        return (<any> this.mCanvas[0]).toDataURL();
    }

    private loadFromBase64(base64 : string) {
        var image = new Image();
        image.src = base64;
        var model = this.getModule().getModel();
        image.onload = function() {
            this.mContext.clearRect(0, 0, model.dim.width, model.dim.height);
            this.mContext.drawImage(image, 0, 0);
        }.bind(this);
    }

    /**************************************************************************/
    /* DRAWING FUNCTIONS                                                      */
    /**************************************************************************/

    /* Turn on draw mode */
    public drawStart() {
        this.removeHammer();
        this.mInDrawMode = true;
        var touchSupported = ('ontouchstart' in document.documentElement);
        if (touchSupported === true) {
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
    }

    /* End drawing mode */
    public drawEnd(canceled : bool) {
        /* Remove touch listeners */
        this.mCanvas.unbind("touchstart");
        this.mCanvas.unbind("touchmove");
        this.mCanvas.unbind("touchend");
        this.mCanvas.unbind("touchleave");
        this.mCanvas.unbind("mousedown");
        this.mCanvas.unbind("mouseout");
        this.mCanvas.unbind("mouseup");
        var model = <DrawModuleModel> this.getModule().getModel();
        /* Save the canvas if we didn't cancel */
        if (canceled === false) {
            model.canvasString = this.toBase64();
        } else {
            /* Reset the canvas if we did cancel */
            this.loadFromBase64(model.canvasString);
        }
        this.mInDrawMode = false;
        /* Re enable touch */
        this.addHammer(this.getJquery());
    }

    /*
     * PEN FUNCTIONS
     */
    private mPenDown : bool = false;

    /* Called when the pen is pressed down */
    public onPenDown(e : JQueryEventObject) {
        this.mPenDown = true;
        e.preventDefault();
    }

    /* Called when the pen moved */
    private mLastStyle : string = "";
    public onPenMove(e : any) {
        if (this.mPenDown === false) return;
        e.preventDefault();
        var context = this.mContext;
        var module = <DrawModule> this.getModule();
        var width = module.getStrokeWidth();
        if (this.mIsErasing === true) {
            context.clearRect(e.offsetX, e.offsetY, width, width);
        } else {
            var strokeColor = module.getStrokeColor();
            if (this.mLastStyle !== strokeColor) {
                context.fillStyle = strokeColor;
                this.mLastStyle = strokeColor;
            }
            var x;
            var y;
            if (Util.exists(e.offsetX) &&
                    Util.exists(e.offsetY)) {
                x = Math.round(e.offsetX);
                y = Math.round(e.offsetY);    
            } else {
                console.log(e.originalEvent);
                var original = e.originalEvent;
                var touch = original;
                if (Util.exists(original.touches))
                    touch = original.touches[0];
                var offset = this.getJquery().offset();
                x = touch.pageX - offset.left;
                y = touch.pageY - offset.top;
            }
            context.beginPath();
            context.arc(x, y, width, 0, Math.PI * 2, false);
            context.fill()
            context.closePath()
        }
    }

    /* Called when the pen is removed */
    public onPenLeave(e : JQueryEventObject) {
        this.mPenDown = false;
    }

    /**************************************************************************/
    /* GETTERS AND SETTERS                                                    */
    /**************************************************************************/
    public getContext() {
        return this.mContext;
    }

    public getDrawButtons() : JQuery {
        return this.mDrawButtons;
    }
}

/* Add to global map */
Globals.whiteboardModules.Draw = DrawModule;