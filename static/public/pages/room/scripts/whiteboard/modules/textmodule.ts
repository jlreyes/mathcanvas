/* 
 * Text whiteboard module class 
 */
/// <reference path="../../imports.ts">


interface TextModuleModel extends WhiteboardModuleModel {
    text : string;
    fontSize: string;
    fontColor: string;
}

class TextModule extends WhiteboardModule {
    private mKey : string;

    constructor(roomPage : RoomPage,
                whiteboard : Whiteboard,
                model : WhiteboardModuleModel) {
        super(roomPage, whiteboard, model);
        var id = this.getModel().id;
        this.mKey = "room-page-textmodule-edittext-" + id;
        roomPage.addResumeListener(this.mKey,
                                   this.onEditText.bind(this));
        /* Add edit option */
        this.addEditOption("Edit Text", {
            callback: this.editText.bind(this)
        });
        /* Process the text */
        (<TextModuleView> this.getView()).refreshMathjax();
    }

    public getDefaultModel() : TextModuleModel {
        var defaults = <TextModuleModel> super.getDefaultModel();
        defaults.text = "Hello World!";
        defaults.dim.width = "auto";
        defaults.dim.height = "auto";
        defaults.fontSize = "1em";
        defaults.fontColor = "rgb(0,0,0)";
        return defaults;
    }

    /* Called when the edit text button is pressed */
    public editText() {
        var app = this.getPage().getApp();
        var model : TextModuleModel = <TextModuleModel> this.getModel();
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
        app.startPage(new Intent(EditTextDialog, {context: context}));
    }


    /* Called when the text has been edited */
    public onEditText(result : EditTextResult) {
        var model : TextModuleModel = <TextModuleModel> this.getModel();
        var view = <TextModuleView> this.getView();
        model.text = result.text;
        model.fontSize = result.fontSize;
        model.fontColor = result.fontColor; 
        this.save(true);
    }

    public createView() : TextModuleView {
        return new TextModuleView(this);
    }

    public getDefaultEditName() : string {
        return "Edit Text";
    }

    public getName() : string {
        return "Text";
    }

}

declare var MathJax;

class TextModuleView extends WhiteboardModuleView {

    constructor(textModule : TextModule) {
        super(textModule);
    }

    private createJquery() : JQuery {
        var container = $("<pre></pre>");
        var model = <TextModuleModel> this.getModule().getModel();
        container.text(model.text);
        container.css("font-size", model.fontSize);
        container.css("color", model.fontColor);
        /* No overflow! */
        container.css("overflow", "hidden");
        container.css("text-overflow", "ellipses");
        container.css("word-break", "break-all");
        container.css("word-wrap", "break-word");
        return container;
    }

    /* Update this view */
    public update(oldModel : TextModuleModel,
                  newModel : TextModuleModel) {
        super.update(oldModel, newModel);
        var refresh = false;
        if (oldModel.text !== newModel.text) {
            this.updateText(newModel.text);
        }
        if (oldModel.fontColor !== newModel.fontColor) {
            this.getJquery().css("color", newModel.fontColor);
            refresh = true;
        }
        if (oldModel.fontSize !== newModel.fontSize) {
            this.getJquery().css("font-size", newModel.fontSize);
            refresh = true;
        }
        if (refresh === true) {
            var elem = this.getJquery()[0];
            MathJax.Hub.Queue(["Reprocess", MathJax.Hub, elem]);
        }
    }

    public onResizeEnd() {
        super.onResizeEnd();
        var elem = this.getJquery()[0];
        MathJax.Hub.Queue(["Reprocess", MathJax.Hub, elem]);
    }

    public updateText(text : string) {
        var jquery = this.getJquery();
        jquery.text(text);
        this.refreshMathjax();
    }

    public refreshMathjax() {
        var jquery = this.getJquery();
        var elem = jquery[0];
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, elem]);   
    }
}

/* Add to global map */
Globals.whiteboardModules.Text = TextModule;