module Constants {
    var TRANS_END_NAME: string;
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
    var makeMobile: (jquery: JQuery) => void;
    function cloneObject(oldObj: any);
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
    private mIsInflated;
    static sSpecialButtons;
    constructor (page: Page, template: Template, context: any);
    public inflate(callback: () => void): void;
    public makeMobile(jquery: JQuery): void;
    private onInflation(jquery);
    public getPage(): Page;
    public isInflated(): bool;
    public getParent(): JQuery;
    public getJquery(): JQuery;
}
class Page {
    private mApp;
    private mView;
    private mIntent;
    private mTransitionOver;
    constructor (app: App);
    public onStart(intent: Intent): void;
    public onCreate(intentData: any): void;
    public onResume(data?: any): void;
    public onPause(): void;
    public onDestroy(): void;
    public getApp(): App;
    public setView(view: PageView): void;
    public getView(): PageView;
    public getIntent(): Intent;
    public getTransitionOver(): bool;
    public setTransitionOver(b: bool): void;
}
class Dialog extends Page {
}
class DialogView extends PageView {
    public makeMobile(jquery: JQuery): void;
    public cancel(): void;
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
interface SelectDialogContext {
    id: string;
    title: string;
    items: {
        text: string;
        value: string;
    }[];
}
class SelectDialog extends Dialog {
    public onCreate(data: any): void;
}
class SelectDialogView extends DialogView {
    static sTemplate;
    private mId;
    constructor (page: Page, context: SelectDialogContext);
    private onInflation(jquery);
}
interface EditTextDialogContext {
    id: string;
    title: string;
    default: EditTextResult;
    onCancel?: (...args: any[]) => void;
}
interface EditTextResult {
    text: string;
    fontSize: string;
    fontColor: string;
}
class EditTextDialog extends Dialog {
    public onCreate(data: any): void;
}
class EditTextDialogView extends DialogView {
    static sTemplate;
    private mId;
    private mDefault;
    private mOnCancel;
    constructor (page: Page, context: EditTextDialogContext);
    private onInflation(jquery);
    public cancel(): void;
}
interface ListDialogContext {
    title: string;
    items: string[];
}
class ListDialog extends Dialog {
    public onCreate(data: any): void;
}
class ListDialogView extends DialogView {
    static sTemplate;
    constructor (page: Page, context: ListDialogContext);
}
interface InputDialogContext {
    id: string;
    title: string;
    placeholder: string;
}
class InputDialog extends Dialog {
    public onCreate(data: any): void;
}
class InputDialogView extends DialogView {
    static sTemplate;
    private mId;
    constructor (page: Page, context: InputDialogContext);
    private onInflation(jquery);
}
interface ColorDialogContext {
    id: string;
    default: string;
}
class ColorDialog extends Dialog {
    public onCreate(data: any): void;
}
class ColorDialogView extends DialogView {
    static sTemplate;
    private mId;
    private mDefault;
    constructor (page: Page, context: ColorDialogContext);
    private onInflation(jquery);
}
interface SizeDialogContext {
    id: string;
    default: number;
}
class SizeDialog extends Dialog {
    public onCreate(data: any): void;
}
class SizeDialogView extends DialogView {
    static sTemplate;
    private mId;
    private mDefault;
    constructor (page: Page, context: SizeDialogContext);
    private onInflation(jquery);
}
class Socket {
    private mUser;
    private mRoomId;
    private mErrorCallback;
    private mSocket;
    private mDisconnectCallback;
    private mDisconnected;
    private mNewUserCallback;
    private mNewUserQueue;
    private mUserDisconnectCallback;
    private mDisconnectedUserQueue;
    private mMessageCallbacks;
    private mUnhandledMessages;
    constructor (user: User, roomId: number, errorCallback: (error: string) => void);
    public register(callback: (response: any) => void): void;
    public sendMessage(type, message): void;
    public destroy(e?: string): void;
    private onDisconnect();
    public setDisconnectCallback(callback: () => void): void;
    public removeDisconnectCallback(): void;
    private onNewUser(username);
    public setNewUserCallback(callback: (username: string) => void): void;
    public removeNewUserCallback(): void;
    private onUserDisconnect(username);
    public setUserDisconnectCallback(callback: (username: string) => void): void;
    public removeUserDisconnectCallback(): void;
    private onMessage(data);
    private handleQueuedMessages(type, callback);
    public addMessageCallback(type: string, key: string, callback: (username: string, data: any) => void): void;
    public removeMessageCallback(type: string, key: string): void;
    public getUser(): User;
}
module Globals {
    var app: App;
    var socket: Socket;
    var whiteboardModules: any;
}
class App {
    private mUser;
    private mForegroundPage;
    private mBackgroundPage;
    private mHistory;
    private mWaitScreen;
    private mLocked;
    private mLockQueue;
    constructor (user: User);
    public preventInput(): void;
    public allowInput(): void;
    private lock();
    private unlock();
    private destroyPage(page);
    public startPage(intent: Intent): void;
    public back(intentData?: any): void;
    public getPage(): Page;
    public getUser(): User;
    public setUser(user: User): void;
}
class DesktopApp extends App {
}
class MobileApp extends App {
}
