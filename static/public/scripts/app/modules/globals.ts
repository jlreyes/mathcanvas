/*
 * Typescript file containg both the Globals module and
 * references to all the project references.
 */
/* Declarations */
/// <reference path="../declarations/jquery.d.ts"/>
/// <reference path="../declarations/user.d.ts"/>
/* Modules */
/// <reference path="constants.ts"/>
/// <reference path="pagetransitioner.ts"/>
/// <reference path="util.ts"/>
/* Templates */
/// <reference path="../template.ts"/>
/// <reference path="../templates/simple-dialog-view.ts"/>
/* Main files */
/// <reference path="../intent.ts"/>
/// <reference path="../pageview.ts"/>
/// <reference path="../page.ts"/>
/// <reference path="../dialog.ts"/>
/// <reference path="../app.ts"/>

declare var dust;
declare var hammer;
declare var Recaptcha;

module Globals {
    export var app : App = null;
}