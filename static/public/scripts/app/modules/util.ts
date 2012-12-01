/*
 * Utility functions
 * Author: jlreyes
 */
/// <reference path="globals.ts"/>
module Util {
    export function exists(x : any) : bool {
        return (x !== null && x !== undefined);
    }


    export interface PostJSONOpts {
        back? : bool; /* Go back */
        buttons? : {text : string;
                 callback : (e : Event) => void;}[];
        onFailure? : () => void;
        preventInput? : bool;
    }
    /* Posts a json command to the server and passes the result to the callback.
     * If an error is received, a dialog is created that explains the error */
    export function postJSON(command : string, postData : any,
                             callback : (result : any) => void,
                             opts? : PostJSONOpts) {
        var app = Globals.app;
        if (!Util.exists(opts)) opts = {};
        if (opts.preventInput === true) app.preventInput();
        if (opts.back === true) app.back();
        /* Ajax success function */
        var success = function(data, textStatus, jqXHR) {
            var result = data;
            /* allow input if we disabled it */
            if (opts.preventInput === true) app.allowInput();
            /* If there was no error, call the callback */
            if (!Util.exists(result.error)) {
                callback(result);
                return;
            }
            /* If we get here, there was an error */
            if (Util.exists(opts.onFailure)) opts.onFailure();
            var context : SimpleDialogContext =
            {
                title : "Error",
                message : result.error,
                buttons : [
                    {
                        text : "Okay",
                        callback : function() {
                            Globals.app.back();
                        }
                    }
                ]
            }
            if (Util.exists(opts.buttons))
                context.buttons = opts.buttons;
            app.startPage(new Intent(SimpleDialog, {context: context}));
        };
        /* Send the ajax */
        var url = "/json/" + command;
        $.ajax(url, {
          type: 'POST',
          data: postData,
          success: success,
          dataType: "json"
        });
    }

    export function deviceWidth() {
        return window.innerWidth;
    }

    export function isIOS() {
        return  !!(navigator.userAgent.match(/iPhone/i) ||
                   navigator.userAgent.match(/iPod/i) ||
                   navigator.userAgent.match(/iPad/i));
    }

    export function isAndroid() {
        return !!(navigator.userAgent.match(/Android/));
    }

    export function isChrome() {
        return !!(navigator.userAgent.match(/Chrome/));
    };
};