/*
 * page-login.html page super class
 */
/// <reference path="./imports.ts"/>

/* Handle to the next page */
declare var JoinRoomPage;

class LoginPage extends Page {

    public onCreate() : void {
        /* Create the view */
        if (this.getApp() instanceof MobileApp)
            this.setView(new LoginMobileView(this));
        else throw "Unimplemented";
    }

    /* Validates the form data */
    private formDataValid() : bool {
        var view : LoginView = <LoginView> this.getView();
        var data = view.getFormData();
        if (data.username.match(/\s/) ||
            data.username.replace(" ","") === "")
            return false;
        if (data.password === "") return false;
        return true;
    }

    public onLoginSubmit(e) {
        if (Util.exists(e)) e.preventDefault();
        var view : LoginView = <LoginView> this.getView();
        if (!this.formDataValid()) {
            view.notifyDataInvalid();
            return;
        }
        /* Submit the form */
        var formData = view.getFormData();
        var postData = {
            method : "local",
            username : formData.username,
            password : formData.password
        };
        var app : App = this.getApp();
        Util.postJSON("session/login", postData, function(res) {
            Util.postJSON("session/getUser", {}, function(res) {
                app.setUser(res.user);
                app.startPage(new Intent(JoinRoomPage, {}));
            }, {preventInput : true});
        }, {preventInput: true});
    }

    public onRegisterSubmit(e) {
        if (Util.exists(e)) e.preventDefault();
        var view : LoginView = <LoginView> this.getView();
        if (!this.formDataValid()) {
            var msg = "Please enter a username and a password to register.";
            view.notifyDataInvalid(msg);
            return;
        }
        /* Create a captcha popup */
        var app : App = this.getApp();
        var formData = view.getFormData();
        /* Called on captcha submission */
        var onSubmit = function(e) {
            var postData = {
                username: formData.username,
                password: formData.password,
                challenge: Recaptcha.get_challenge(),
                response: Recaptcha.get_response()
            }
            Recaptcha.destroy();
            Util.postJSON("session/register", postData, function() {
                this.onLoginSubmit();
            }.bind(this),{preventInput: true, back: true});
        }.bind(this);
        /* The data we pass to the dialog */
        var data = {
            context : {
                title: "Recaptcha?",
                message: "",
                buttons: [{
                    text: "Submit",
                    callback: onSubmit
                }]
            }
        }
        var intent : Intent = new Intent(SimpleDialog, data);
        app.startPage(intent);
        /* Insert the recaptcha whenever the div appears */
        var checkRecaptcha = function() {
            var container = $(".dialog .dialog-box .body > div > p");
            if (container.length > 0) {
                container.html("");
                container.append($("<div id='recaptcha'></div>"));
                Recaptcha.create("6LcqudkSAAAAAImtOjBR3ALKVzy1EAMHeg2c3roB",
                                 "recaptcha",
                                 {theme: "clean"});
            } else requestAnimationFrame(checkRecaptcha);
        };
        checkRecaptcha();
    }
}