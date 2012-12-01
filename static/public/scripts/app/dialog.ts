/*
 * Typescript for the dialog class:
 *     A dialog is a special kind of page
 */
/// <reference path="modules/globals.ts"/>

class Dialog extends Page {}
class DialogView extends PageView {
    public makeMobile() : void {
        super.makeMobile();
        var app : App = this.getPage().getApp();
        var jquery = this.getJquery();
        /* The area outside of the dialog cancels the dialog */
        jquery.filter(".dialog").hammer({}).bind("tap", function(e) {
            /* Check if the target was this (can't just stop propagation)
             * due to hammer.js bug */
            if (e.originalEvent.target === this) app.back();
        });
    }
}

class SimpleDialog extends Dialog {
    public onCreate(data : any) {
        var context = data.context;
        this.setView(new SimpleDialogView(this, context));
    }
}

interface SimpleDialogContext {
    title : string;
    message : string;
    buttons? : {
        text: string; callback : (e : Event) => void;
    }[];
}

/* View for this dialog */
class SimpleDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-simple");
    private mButtons : {text : string; callback : (e : Event) => void;}[];

    constructor(page : Page,
                context : SimpleDialogContext) {
        var formattedContext = {
            title : context.title,
            message : context.message,
        };
        this.mButtons = context.buttons;
        super(page, SimpleDialogView.sTemplate, formattedContext);
    }

    /* We need to add the passed buttons */
    private onInflation(jquery : JQuery) : JQuery {
        /* Add the buttons */
        if (!Util.exists(this.mButtons)) this.mButtons = [];
        var buttonContainer = jquery.find("#button-container");
        for (var i = 0; i < this.mButtons.length; i++) {
            var buttonInfo = this.mButtons[i];
            var callback = buttonInfo.callback;
            var button = $("<button>" + buttonInfo.text + "</button>");
            button.addClass("full");
            button.hammer({}).bind("tap", callback);
            buttonContainer.append(button);
        }
        return jquery;
    }
}