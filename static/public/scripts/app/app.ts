/* 
 * App class for index.html
 */
/// <reference path="modules/globals.ts"/>

class App {
    /* The user that is using this app. NULL if no
     * user */
    private mUser : User;
    /* Only two pages can be in memory at a time */
    private mForegroundPage : Page;
    private mBackgroundPage : Page;
    /* Reference to the wait screen */
    private mWaitScreen : JQuery;
    /* Whether or not this app is locked */
    private mLocked : bool = false;
    private mLockQueue : Intent[] = [];

    constructor(user : User) {
        console.log("User:", user);
        this.mUser = user;
        this.mWaitScreen = $("#wait-screen");
        this.mWaitScreen.css("opacity", ".5");
    }
    
    /* Called when the app needs to prevent user input */
    public preventInput() : void {
        this.mWaitScreen.css("opacity", ".5");
        this.mWaitScreen.css("z-index", "100");
    }

    /* Called when the app will accept user input again */
    public allowInput() : void {
        this.mWaitScreen.css("opacity", "0");
        this.mWaitScreen.css("z-index", "-1");
    }

    /* Lock the app so we cannot start any pages while the lock
     * is active */
    private lock() : void {
        this.mLocked = true;
    }

    /* Unlock the app and execute locked intents */
    private unlock() : void {
        var i;
        /* Clone the current lock queue */
        var intents = [];
        for (i = 0; i < this.mLockQueue.length; i++)
            intents.push(this.mLockQueue[i]);
        this.mLockQueue = [];
        /* Execute the intents in the intents array */
        this.mLocked = false;
        for (i = 0; i < intents.length; i++) {
            this.startPage(intents[i]);
        }
        this.mLocked = false;
    }

    /* Push the given page onto the history stack and put
     * it in view */
    public startPage(intent : Intent) {
        /* See if we are locked */
        if (this.mLocked === true) {
            this.mLockQueue.push(intent);
            return;
        }
        /* We can't start a new page on a dialog. So
         * go back if there is already a dialog */
        if (Util.exists(this.mForegroundPage) &&
                this.mForegroundPage instanceof Dialog)
            this.back();
        /* See if we actually should be calling this.back() */
        if (Util.exists(this.mBackgroundPage)) {
            if (this.mBackgroundPage instanceof intent.pageClass) {
                this.back();
                return;
            }
        }
        /* Either pause or destroy the foreground */
        var foregroundExists = Util.exists(this.mForegroundPage);
        if (foregroundExists === true) {
            if (intent.data.destroy === true) {
                this.mForegroundPage.onDestroy();
                this.mForegroundPage = null;
            }
            else this.mForegroundPage.onPause();
        }
        /* Create the new page */
        var newPage = new intent.pageClass(this);
        newPage.onStart(intent);
        /* Change the pages */
        this.mBackgroundPage = this.mForegroundPage;
        this.mForegroundPage = newPage;
        /* Start the transition */
        this.lock();
        if (foregroundExists === false) {
            PageTransitioner.replacePage(newPage,
                                         this.unlock.bind(this));
            this.allowInput();
        } else if (newPage instanceof Dialog)
            PageTransitioner.transitionFadeIn(newPage,
                                              this.unlock.bind(this));
        else if (intent.data.destroy) {
            PageTransitioner.transitionRight(newPage,
                                             this.unlock.bind(this));    
        } else PageTransitioner.transitionLeft(newPage,
                                               this.unlock.bind(this));
    }

    /* Go to the background page from the foreground page*/
    public back() : void {
        if (!Util.exists(this.mBackgroundPage)) return;
        var oldPage : Page = this.mForegroundPage;
        var newPage : Page = this.mBackgroundPage;
        /* Notify the current pages */
        this.mForegroundPage.onDestroy();
        this.mBackgroundPage.onResume();
        /* Change the pages */
        this.mForegroundPage = this.mBackgroundPage;
        this.mBackgroundPage = null;
        /* Start the view transition */
        this.lock();
        if (oldPage instanceof Dialog)
            PageTransitioner.transitionFadeOut(newPage,
                                               this.unlock.bind(this));
        else
            PageTransitioner.transitionRight(null,
                                             this.unlock.bind(this));
    }

    /*
     * GETTERS AND SETTERS
     */
    public getPage() : Page {
        return this.mForegroundPage;
    }

    public getUser() {
        return this.mUser;
    }

    public setUser(user : User) {
        this.mUser = user;
    }
}

/* Specific app classes */
class DesktopApp extends App{}
class MobileApp extends App{}