/*
 * Typescript for the page view class:
 *     The view for the current page in the mv structure.
 */
/// <reference path="modules/globals.ts"/>
class PageView {
    private mPage : Page;
    /* The template and html for this view */
    private mTemplate : Template;
    private mContext : any;
    private mJquery : JQuery;
    /* Hashmap of special button types to their corresponding
     * function calls */
    private static sSpecialButtons = {
        back: function() {Globals.app.back();}
    };

    constructor(page : Page,
                template : Template,
                context : any) {
        this.mPage = page;
        this.mTemplate = template;
        this.mContext = context;
    }

    /* Inflate this view and call the given callback when done */
    public inflate(callback : () => void) : void {
        this.mTemplate.render(this.mContext, function(e, out) {
            if (Util.exists(e)) throw e;
            var jquery = $(out);
            this.mJquery = this.onInflation(jquery);
            this.makeMobile();
            callback();
        }.bind(this));
    }

    /* Helper function that makes the current jquery 
     * element mobile. That is, we add touch listeners */
    public makeMobile() {
        /* Button listeners */
        var buttonSelector = "button,ul.button-list li"
        var buttons = this.mJquery.find(buttonSelector);
        var addClass = function() {
                $(this).addClass("active");
        };
        var removeClass = function() {
                $(this).removeClass("active");
        };
        for (var i = 0; i < buttons.length; i++) {
            var button = $(buttons[i]);
            /* Determine the callback */
            var callback = null;
            var buttonType = button.attr("data-type");
            if (Util.exists(buttonType)) {
                if (buttonType in PageView.sSpecialButtons)
                    callback = PageView.sSpecialButtons[buttonType];
            }
            /* Create the listener */
            button.ontap(addClass, removeClass, callback);
            button.click(function(e){
                e.preventDefault();
                return false;
            });
        }
    }

    /* Called when this view is inflated. Subclasses should do template
     * modification here. */
    private onInflation(jquery : JQuery) : JQuery {
        return jquery;
    }

    /*
     * GETTERS AND SETTERS
     */
    
    public getPage() : Page {
        return this.mPage;
    }

    public getJquery() : JQuery {
        return this.mJquery;
    }
}