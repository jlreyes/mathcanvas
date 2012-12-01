module Constants {
}
module PageTransitioner {
    function transitionLeft(newPage: Page, callback: () => void): void;
    function transitionRight(newPage: Page, callback: () => void): void;
    function transitionFadeIn(newPage: Page, callback: () => void): void;
    function transitionFadeOut(oldPage: Page, callback: () => void): void;
    function replacePage(newPage: Page, callback: () => void): void;
}
module Util {
    function exists(x: any): bool;
    interface PostJSONOpts {
        back?: bool;
        buttons?: {
            text: string;
            callback: (e: Event) => void;
        }[];
        onFailure?: () => void;
        preventInput?: bool;
    }
    function postJSON(command: string, postData: any, callback: (result: any) => void, opts?: PostJSONOpts): void;
    function deviceWidth(): number;
    function isIOS(): bool;
    function isAndroid(): bool;
    function isChrome(): bool;
}
class Template {
    private mName;
    constructor (name: string);
    public render(context: any, callback: (e: any, out: HTMLElement) => void): void;
}
class Intent {
    public pageClass: any;
    public data: any;
    constructor (pageClass: any, data: any);
}
class PageView {
    private mPage;
    private mTemplate;
    private mContext;
    private mJquery;
    static sSpecialButtons;
    constructor (page: Page, template: Template, context: any);
    public inflate(callback: () => void): void;
    public makeMobile(): void;
    private onInflation(jquery);
    public getPage(): Page;
    public getJquery(): JQuery;
}
class Page {
    private mApp;
    private mView;
    private mIntent;
    constructor (app: App);
    public onStart(intent: Intent): void;
    public onCreate(intentData: any): void;
    public onResume(): void;
    public onPause(): void;
    public onDestroy(): void;
    public getApp(): App;
    public setView(view: PageView): void;
    public getView(): PageView;
    public getIntent(): Intent;
}
class Dialog extends Page {
}
class DialogView extends PageView {
    public makeMobile(): void;
}
class SimpleDialog extends Dialog {
    public onCreate(data: any): void;
}
interface SimpleDialogContext {
    title: string;
    message: string;
    buttons?: {
        text: string;
        callback: (e: Event) => void;
    }[];
}
class SimpleDialogView extends DialogView {
    static sTemplate;
    private mButtons;
    constructor (page: Page, context: SimpleDialogContext);
    private onInflation(jquery);
}
module Globals {
    var app: App;
}
class App {
    private mUser;
    private mForegroundPage;
    private mBackgroundPage;
    private mWaitScreen;
    private mLocked;
    private mLockQueue;
    constructor (user: User);
    public preventInput(): void;
    public allowInput(): void;
    private lock();
    private unlock();
    public startPage(intent: Intent): void;
    public back(): void;
    public getPage(): Page;
    public getUser(): User;
    public setUser(user: User): void;
}
class DesktopApp extends App {
}
class MobileApp extends App {
}
