/*
 * Whiteboard Models
 */
/// <reference path="./imports.ts"/>

interface Whiteboard {
    model : WhiteboardModel;
    view : WhiteboardView;
}

interface WhiteboardModel {
    nextId: number;
    width: number;
    height: number;
    modules : {
        [id : number] : WhiteboardModule;
    };
}

class WhiteboardView {
    private mRoom : RoomView;
    private mCanvas : JQuery;
    private mToolset : JQuery;
    private mScale : number;
    private mFocus : WhiteboardModuleView = null; /* Null if no focus */
    private mButtonStack : JQuery[] = [];
    /* Maps a z-index to a whiteboard module */
    private mZIndexMap : WhiteboardModuleView[] = [null];

    constructor(roomView : RoomView,
                canvas : JQuery,
                toolsetContainer : JQuery,
                dim : Dim) {
        this.mRoom = roomView;
        this.mCanvas = canvas;
        this.mToolset = toolsetContainer;
        /* Set the canvas width and height */
        this.mCanvas.css("width", dim.width);
        this.mCanvas.css("height", dim.height);
    }

    /* Focus in on the given module view, displaying
     * the given buttons */
    public focus(moduleView : WhiteboardModuleView, buttons : JQuery) {
        /* We can only focus on one thing */
        if (this.mFocus !== null) this.unfocus();
        this.mRoom.hideTabs();
        this.mFocus = moduleView;
        /* Add the buttons then notify the module view */
        this.pushButtons(buttons);
        /* Notify the passed module view */
        moduleView.onFocus();
    }

    /* Unfocus from mFocus */
    public unfocus() {
        this.mFocus.onUnfocus();
        this.popButtons();
        this.mRoom.showTabs();
        this.mFocus = null;
    }

    /* Pushes the given buttons into view */
    public pushButtons(buttons : JQuery) {
        /* Get rid of the current buttons. If there weren't any,
         * display the toolset */
        var currentButtons = this.mButtonStack[0];
        if (Util.exists(currentButtons)) currentButtons.detach();
        else this.mToolset.css("display", "block");
        /* Add the buttons to the stack */
        this.mButtonStack.unshift(buttons);
        this.mToolset.append(buttons);
    }

    /* Pops currently displayed buttons from view */
    public popButtons() {
        var currentButtons = this.mButtonStack.shift();
        if (!Util.exists(currentButtons)) return;
        currentButtons.detach();
        /* If a set of buttons is on the stack, push them in view */
        var newButtons = this.mButtonStack[0];
        if (Util.exists(newButtons)) this.mToolset.append(newButtons);
        else this.mToolset.css("display", "none");
    }

    /* Add a whiteboard module view to this canvas */
    public addWhiteboardModule(view : WhiteboardModuleView) {
        this.mZIndexMap[view.getModule().getModel().layer] = view;
        this.mCanvas.append(view.getJquery());
        view.onDomInsertion();
    }

    /* Delete a whiteboard module view from this canvas.
     * //TODO Shift layers on delete */
    public removeWhiteboardModule(view : WhiteboardModuleView) {
        if (this.mFocus === view) this.unfocus();
        view.detach();
        this.mZIndexMap[view.getModule().getModel().layer];

    }

    /* Walk the modules in view, finding the highest z-index + 1.
     * TODO be less stupid */
    public getNextFreeLayer() : number {
        return this.mZIndexMap.length;
    }

    public hasFocus() : bool {
        return this.mFocus !== null;
    }

    /* Returns a layer that is higher than all other layers. Because
     * the returned number is only higher at the time of return, if
     * another user creates a new module, it is possible that their modules
     * layer will conflict with the new number. To deal with this, we return
     * the highest number available times 10000. Hopefully 10000 elements wont
     * be created before the element is unfocused.*/
    public getFocusLayer() : number {
        var highestZindex = this.getNextFreeLayer();
        return highestZindex * 10000;
    }

    public getScroll() : Pos {
        var top = this.mCanvas.parent().scrollTop();
        var left = this.mCanvas.parent().scrollLeft();
        return {
            x: left, y: top
        };
    }
}