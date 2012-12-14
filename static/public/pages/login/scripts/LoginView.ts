/*
 * View for the login page.
 */
/// <reference path="./imports.ts"/>

class LoginView extends PageView {
    private mUser : JQuery;
    private mPassword : JQuery;
    private mLogin : JQuery;
    private mRegister : JQuery;
    private mRecaptcha : JQuery;

    constructor(page : Page) {
        super(page, LoginMobileView.sTemplate, {});
    }

    private onInflation(jquery : JQuery) : JQuery {
        var page : LoginPage = <LoginPage> this.getPage();
        /* Listen for form submission */
        this.mLogin = jquery.find("#form-login-login");
        this.mLogin
            .hammer({})
            .bind("tap", page.onLoginSubmit.bind(page));
        this.mRegister = jquery.find("#form-login-register");
        this.mRegister
            .hammer({})
            .bind("tap", page.onRegisterSubmit.bind(page));
        /* Get form elem references */
        this.mUser = jquery.find("#form-login-username");
        this.mPassword = jquery.find("#form-login-password");
        this.mRecaptcha = jquery.find("#form-login-recaptcha");
        return jquery;
    }

    public notifyDataInvalid(msg? : string) {
        var message = msg? msg : "Please fill out all fields";
        var context : SimpleDialogContext =
            {
                title : "Error",
                message : message,
                buttons : [
                    {
                        text : "Okay",
                        callback : function() {
                            Globals.app.back();
                        }
                    }
                ]
            }
        var intent : Intent = new Intent(SimpleDialog, {context:context});
        this.getPage().getApp().startPage(intent);
    }

    public getRegisterJquery() {
        return this.mRegister;
    }

    public getLoginJquery() {
        return this.mLogin;
    }

    public getFormData() {
        return {
            username: this.mUser.val(),
            password: this.mPassword.val()
        };
    }
}