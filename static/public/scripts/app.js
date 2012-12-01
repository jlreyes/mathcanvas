var PageTransitioner;
(function (PageTransitioner) {
    var pageContainer1;
    var pageContainer2;
    var activePageContainer;
    var inactivePageContainer;
    var callbacks1 = [];
    var callbackTypes1 = [];
    var callbacks2 = [];
    var callbackTypes2 = [];
    function addTransitionEndCallback(pageContainer, type, callback) {
        if(pageContainer === pageContainer1) {
            callbackTypes1.push(type);
            callbacks1.push(callback);
        } else {
            if(pageContainer === pageContainer2) {
                callbackTypes2.push(type);
                callbacks2.push(callback);
            }
        }
    }
    $(document).ready(function () {
        pageContainer1 = $("#page-container-1");
        pageContainer2 = $("#page-container-2");
        var transEnd = "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd";
        pageContainer1.bind(transEnd, function (e) {
            var i;
            for(i = 0; i < callbacks1.length; i++) {
                if(callbackTypes1[i] === e.originalEvent.propertyName) {
                    callbacks1[i](e);
                    callbacks1.splice(i, 1);
                    callbackTypes1.splice(i, 1);
                    i--;
                }
            }
        });
        pageContainer2.bind(transEnd, function (e) {
            var i;
            for(i = 0; i < callbacks2.length; i++) {
                if(callbackTypes2[i] === e.originalEvent.propertyName) {
                    callbacks2[i](e);
                    callbacks2.splice(i, 1);
                    callbackTypes2.splice(i, 1);
                    i--;
                }
            }
        });
    });
    function setCssWithoutTransition(pageContainer, property, value) {
        pageContainer.removeClass("transition");
        pageContainer.css(property, value);
        pageContainer.addClass("transition");
    }
    function swapContainers() {
        var tmp = activePageContainer;
        activePageContainer = inactivePageContainer;
        inactivePageContainer = tmp;
        reorder();
    }
    function reorder() {
        activePageContainer.css("z-index", "2");
        inactivePageContainer.css("z-index", "1");
    }
    function transitionLeft(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", -Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, "left", callback);
        }, 0);
    }
    PageTransitioner.transitionLeft = transitionLeft;
    function transitionRight(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", -Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        if(Util.exists(newPage)) {
            inactivePageContainer.empty();
            inactivePageContainer.append(newPage.getView().getJquery());
        }
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, "left", callback);
        }, 0);
    }
    PageTransitioner.transitionRight = transitionRight;
    function transitionFadeIn(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("opacity", "0");
        inactivePageContainer.css("left", "0");
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            activePageContainer.css("opacity", "1");
            addTransitionEndCallback(activePageContainer, "opacity", callback);
        }, 0);
    }
    PageTransitioner.transitionFadeIn = transitionFadeIn;
    function transitionFadeOut(oldPage, callback) {
        activePageContainer.css("opacity", "0");
        addTransitionEndCallback(activePageContainer, "opacity", function () {
            swapContainers();
            callback();
        });
    }
    PageTransitioner.transitionFadeOut = transitionFadeOut;
    function replacePage(newPage, callback) {
        inactivePageContainer = pageContainer2;
        activePageContainer = pageContainer1;
        reorder();
        pageContainer1.append(newPage.getView().getJquery());
        callback();
    }
    PageTransitioner.replacePage = replacePage;
})(PageTransitioner || (PageTransitioner = {}));
var Util;
(function (Util) {
    function exists(x) {
        return (x !== null && x !== undefined);
    }
    Util.exists = exists;
    function postJSON(command, postData, callback, opts) {
        var app = Globals.app;
        if(!Util.exists(opts)) {
            opts = {
            };
        }
        if(opts.preventInput === true) {
            app.preventInput();
        }
        if(opts.back === true) {
            app.back();
        }
        var success = function (data, textStatus, jqXHR) {
            var result = data;
            if(opts.preventInput === true) {
                app.allowInput();
            }
            if(!Util.exists(result.error)) {
                callback(result);
                return;
            }
            if(Util.exists(opts.onFailure)) {
                opts.onFailure();
            }
            var context = {
                title: "Error",
                message: result.error,
                buttons: [
                    {
                        text: "Okay",
                        callback: function () {
                            Globals.app.back();
                        }
                    }
                ]
            };
            if(Util.exists(opts.buttons)) {
                context.buttons = opts.buttons;
            }
            app.startPage(new Intent(SimpleDialog, {
                context: context
            }));
        };
        var url = "/json/" + command;
        $.ajax(url, {
            type: 'POST',
            data: postData,
            success: success,
            dataType: "json"
        });
    }
    Util.postJSON = postJSON;
    function deviceWidth() {
        return window.innerWidth;
    }
    Util.deviceWidth = deviceWidth;
    function isIOS() {
        return !!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i));
    }
    Util.isIOS = isIOS;
    function isAndroid() {
        return !!(navigator.userAgent.match(/Android/));
    }
    Util.isAndroid = isAndroid;
    function isChrome() {
        return !!(navigator.userAgent.match(/Chrome/));
    }
    Util.isChrome = isChrome;
    ; ;
})(Util || (Util = {}));
; ;
var Template = (function () {
    function Template(name) {
        this.mName = name;
    }
    Template.prototype.render = function (context, callback) {
        dust.render(this.mName, context, callback);
    };
    return Template;
})();
(function () {
    dust.register("lib-dialog-simple", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-box\"><div class=\"header\"><h1>").reference(ctx.get("title"), ctx, "h").write("</h1></div><div class=\"body\"><div class=\"section\"><p>").reference(ctx.get("message"), ctx, "h").write("</p></div><div id=\"button-container\"></div></div></div></div>");
    }
    return body_0;
})();
var Intent = (function () {
    function Intent(pageClass, data) {
        this.pageClass = pageClass;
        this.data = data;
    }
    return Intent;
})();
var PageView = (function () {
    function PageView(page, template, context) {
        this.mPage = page;
        this.mTemplate = template;
        this.mContext = context;
    }
    PageView.sSpecialButtons = {
        back: function () {
            Globals.app.back();
        }
    };
    PageView.prototype.inflate = function (callback) {
        this.mTemplate.render(this.mContext, function (e, out) {
            if(Util.exists(e)) {
                throw e;
            }
            var jquery = $(out);
            this.mJquery = this.onInflation(jquery);
            this.makeMobile();
            callback();
        }.bind(this));
    };
    PageView.prototype.makeMobile = function () {
        var buttonSelector = "button,ul.button-list li";
        var buttons = this.mJquery.find(buttonSelector);
        var addClass = function () {
            $(this).addClass("active");
        };
        var removeClass = function () {
            $(this).removeClass("active");
        };
        for(var i = 0; i < buttons.length; i++) {
            var button = $(buttons[i]);
            var callback = null;
            var buttonType = button.attr("data-type");
            if(Util.exists(buttonType)) {
                if(buttonType in PageView.sSpecialButtons) {
                    callback = PageView.sSpecialButtons[buttonType];
                }
            }
            button.ontap(addClass, removeClass, callback);
            button.click(function (e) {
                e.preventDefault();
                return false;
            });
        }
    };
    PageView.prototype.onInflation = function (jquery) {
        return jquery;
    };
    PageView.prototype.getPage = function () {
        return this.mPage;
    };
    PageView.prototype.getJquery = function () {
        return this.mJquery;
    };
    return PageView;
})();
var Page = (function () {
    function Page(app) {
        this.mApp = app;
    }
    Page.prototype.onStart = function (intent) {
        this.mIntent = intent;
        this.onCreate(intent.data);
        if(!Util.exists(this.mView)) {
            throw "onCreate did not set the view!";
        }
        this.mView.inflate(function () {
            this.onResume();
        }.bind(this));
    };
    Page.prototype.onCreate = function (intentData) {
    };
    Page.prototype.onResume = function () {
    };
    Page.prototype.onPause = function () {
    };
    Page.prototype.onDestroy = function () {
    };
    Page.prototype.getApp = function () {
        return this.mApp;
    };
    Page.prototype.setView = function (view) {
        this.mView = view;
    };
    Page.prototype.getView = function () {
        return this.mView;
    };
    Page.prototype.getIntent = function () {
        return this.mIntent;
    };
    return Page;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Dialog = (function (_super) {
    __extends(Dialog, _super);
    function Dialog() {
        _super.apply(this, arguments);

    }
    return Dialog;
})(Page);
var DialogView = (function (_super) {
    __extends(DialogView, _super);
    function DialogView() {
        _super.apply(this, arguments);

    }
    DialogView.prototype.makeMobile = function () {
        _super.prototype.makeMobile.call(this);
        var app = this.getPage().getApp();
        var jquery = this.getJquery();
        jquery.filter(".dialog").hammer({
        }).bind("tap", function (e) {
            if(e.originalEvent.target === this) {
                app.back();
            }
        });
    };
    return DialogView;
})(PageView);
var SimpleDialog = (function (_super) {
    __extends(SimpleDialog, _super);
    function SimpleDialog() {
        _super.apply(this, arguments);

    }
    SimpleDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new SimpleDialogView(this, context));
    };
    return SimpleDialog;
})(Dialog);
var SimpleDialogView = (function (_super) {
    __extends(SimpleDialogView, _super);
    function SimpleDialogView(page, context) {
        var formattedContext = {
            title: context.title,
            message: context.message
        };
        this.mButtons = context.buttons;
        _super.call(this, page, SimpleDialogView.sTemplate, formattedContext);
    }
    SimpleDialogView.sTemplate = new Template("lib-dialog-simple");
    SimpleDialogView.prototype.onInflation = function (jquery) {
        if(!Util.exists(this.mButtons)) {
            this.mButtons = [];
        }
        var buttonContainer = jquery.find("#button-container");
        for(var i = 0; i < this.mButtons.length; i++) {
            var buttonInfo = this.mButtons[i];
            var callback = buttonInfo.callback;
            var button = $("<button>" + buttonInfo.text + "</button>");
            button.addClass("full");
            button.hammer({
            }).bind("tap", callback);
            buttonContainer.append(button);
        }
        return jquery;
    };
    return SimpleDialogView;
})(DialogView);
var Globals;
(function (Globals) {
    Globals.app = null;
})(Globals || (Globals = {}));
var App = (function () {
    function App(user) {
        this.mLocked = false;
        this.mLockQueue = [];
        console.log("User:", user);
        this.mUser = user;
        this.mWaitScreen = $("#wait-screen");
        this.mWaitScreen.css("opacity", ".5");
    }
    App.prototype.preventInput = function () {
        this.mWaitScreen.css("opacity", ".5");
        this.mWaitScreen.css("z-index", "100");
    };
    App.prototype.allowInput = function () {
        this.mWaitScreen.css("opacity", "0");
        this.mWaitScreen.css("z-index", "-1");
    };
    App.prototype.lock = function () {
        this.mLocked = true;
    };
    App.prototype.unlock = function () {
        var i;
        var intents = [];
        for(i = 0; i < this.mLockQueue.length; i++) {
            intents.push(this.mLockQueue[i]);
        }
        this.mLockQueue = [];
        this.mLocked = false;
        for(i = 0; i < intents.length; i++) {
            this.startPage(intents[i]);
        }
        this.mLocked = false;
    };
    App.prototype.startPage = function (intent) {
        if(this.mLocked === true) {
            this.mLockQueue.push(intent);
            return;
        }
        if(Util.exists(this.mForegroundPage) && this.mForegroundPage instanceof Dialog) {
            this.back();
        }
        if(Util.exists(this.mBackgroundPage)) {
            if(this.mBackgroundPage instanceof intent.pageClass) {
                this.back();
                return;
            }
        }
        var foregroundExists = Util.exists(this.mForegroundPage);
        if(foregroundExists === true) {
            if(intent.data.destroy === true) {
                this.mForegroundPage.onDestroy();
                this.mForegroundPage = null;
            } else {
                this.mForegroundPage.onPause();
            }
        }
        var newPage = new intent.pageClass(this);
        newPage.onStart(intent);
        this.mBackgroundPage = this.mForegroundPage;
        this.mForegroundPage = newPage;
        this.lock();
        if(foregroundExists === false) {
            PageTransitioner.replacePage(newPage, this.unlock.bind(this));
            this.allowInput();
        } else {
            if(newPage instanceof Dialog) {
                PageTransitioner.transitionFadeIn(newPage, this.unlock.bind(this));
            } else {
                if(intent.data.destroy) {
                    PageTransitioner.transitionRight(newPage, this.unlock.bind(this));
                } else {
                    PageTransitioner.transitionLeft(newPage, this.unlock.bind(this));
                }
            }
        }
    };
    App.prototype.back = function () {
        if(!Util.exists(this.mBackgroundPage)) {
            return;
        }
        var oldPage = this.mForegroundPage;
        var newPage = this.mBackgroundPage;
        this.mForegroundPage.onDestroy();
        this.mBackgroundPage.onResume();
        this.mForegroundPage = this.mBackgroundPage;
        this.mBackgroundPage = null;
        this.lock();
        if(oldPage instanceof Dialog) {
            PageTransitioner.transitionFadeOut(newPage, this.unlock.bind(this));
        } else {
            PageTransitioner.transitionRight(null, this.unlock.bind(this));
        }
    };
    App.prototype.getPage = function () {
        return this.mForegroundPage;
    };
    App.prototype.getUser = function () {
        return this.mUser;
    };
    App.prototype.setUser = function (user) {
        this.mUser = user;
    };
    return App;
})();
var DesktopApp = (function (_super) {
    __extends(DesktopApp, _super);
    function DesktopApp() {
        _super.apply(this, arguments);

    }
    return DesktopApp;
})(App);
var MobileApp = (function (_super) {
    __extends(MobileApp, _super);
    function MobileApp() {
        _super.apply(this, arguments);

    }
    return MobileApp;
})(App);
//@ sourceMappingURL=app.js.map
