var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LoginView = (function (_super) {
    __extends(LoginView, _super);
    function LoginView(page) {
        _super.call(this, page, LoginMobileView.sTemplate, {
});
    }
    LoginView.prototype.onInflation = function (jquery) {
        var page = this.getPage();
        this.mLogin = jquery.find("#form-login-login");
        this.mLogin.hammer({
        }).bind("tap", page.onLoginSubmit.bind(page));
        this.mRegister = jquery.find("#form-login-register");
        this.mRegister.hammer({
        }).bind("tap", page.onRegisterSubmit.bind(page));
        this.mUser = jquery.find("#form-login-username");
        this.mPassword = jquery.find("#form-login-password");
        this.mRecaptcha = jquery.find("#form-login-recaptcha");
        return jquery;
    };
    LoginView.prototype.notifyDataInvalid = function (msg) {
        var message = msg ? msg : "Please fill out all fields";
        var context = {
            title: "Error",
            message: message,
            buttons: [
                {
                    text: "Okay",
                    callback: function () {
                        Globals.app.back();
                    }
                }
            ]
        };
        var intent = new Intent(SimpleDialog, {
            context: context
        });
        this.getPage().getApp().startPage(intent);
    };
    LoginView.prototype.getRegisterJquery = function () {
        return this.mRegister;
    };
    LoginView.prototype.getLoginJquery = function () {
        return this.mLogin;
    };
    LoginView.prototype.getFormData = function () {
        return {
            username: this.mUser.val(),
            password: this.mPassword.val()
        };
    };
    return LoginView;
})(PageView);
var LoginMobileView = (function (_super) {
    __extends(LoginMobileView, _super);
    function LoginMobileView() {
        _super.apply(this, arguments);

    }
    LoginMobileView.sTemplate = new Template("page-login-mobile");
    return LoginMobileView;
})(LoginView);
var LoginPage = (function (_super) {
    __extends(LoginPage, _super);
    function LoginPage() {
        _super.apply(this, arguments);

        this.mRecaptchaCreated = false;
    }
    LoginPage.prototype.onCreate = function () {
        if(this.getApp() instanceof MobileApp) {
            this.setView(new LoginMobileView(this));
        } else {
            throw "Unimplemented";
        }
    };
    LoginPage.prototype.formDataValid = function () {
        var view = this.getView();
        var data = view.getFormData();
        if(data.username.match(/\s/) || data.username.replace(" ", "") === "") {
            return false;
        }
        if(data.password === "") {
            return false;
        }
        return true;
    };
    LoginPage.prototype.onLoginSubmit = function (e) {
        if(Util.exists(e)) {
            e.preventDefault();
        }
        var view = this.getView();
        if(!this.formDataValid()) {
            view.notifyDataInvalid();
            return;
        }
        var formData = view.getFormData();
        var postData = {
            method: "local",
            username: formData.username,
            password: formData.password
        };
        var app = this.getApp();
        Util.postJSON("session/login", postData, function (res) {
            Util.postJSON("session/getUser", {
            }, function (res) {
                app.setUser(res.user);
                app.startPage(new Intent(JoinRoomPage, {
                }));
            }, {
                preventInput: true
            });
        }, {
            preventInput: true
        });
    };
    LoginPage.prototype.onRegisterSubmit = function (e) {
        if(Util.exists(e)) {
            e.preventDefault();
        }
        var view = this.getView();
        if(!this.formDataValid()) {
            var msg = "Please enter a username and a password to register.";
            view.notifyDataInvalid(msg);
            return;
        }
        var app = this.getApp();
        var formData = view.getFormData();
        var onSubmit = function (e) {
            var postData = {
                username: formData.username,
                password: formData.password,
                challenge: null,
                response: null
            };
            Util.postJSON("session/register", postData, function () {
                this.onLoginSubmit();
            }.bind(this), {
                preventInput: true,
                back: true
            });
        }.bind(this);
        onSubmit();
    };
    return LoginPage;
})(Page);
//@ sourceMappingURL=page.js.map
