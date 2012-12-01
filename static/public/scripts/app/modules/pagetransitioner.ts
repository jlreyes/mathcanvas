/* 
 * Module containing methods necessary for page trasitions
 */
module PageTransitioner {
    /* The page containers */
    var pageContainer1 : JQuery;
    var pageContainer2 : JQuery;
    /* The active and non-active page containers */
    var activePageContainer : JQuery;
    var inactivePageContainer : JQuery;

    /* Callbacks for transition end (for both container 1 and 2) */
    var callbacks1 = [];
    var callbackTypes1 = [];
    var callbacks2 = [];
    var callbackTypes2 = [];
    function addTransitionEndCallback(pageContainer, type, callback) {
        if (pageContainer === pageContainer1) {
            callbackTypes1.push(type);
            callbacks1.push(callback);
        } else if (pageContainer === pageContainer2) {
            callbackTypes2.push(type);
            callbacks2.push(callback);
        }
    }

    /* Get the page containers on load */
    $(document).ready(function() {
        pageContainer1 = $("#page-container-1");
        pageContainer2 = $("#page-container-2");
        /* Register for transition callbacks */
        var transEnd ="transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd";
        pageContainer1.bind(transEnd, function(e){
            var i;
            for (i = 0; i < callbacks1.length; i++) {
                if (callbackTypes1[i] === e.originalEvent.propertyName) {
                    callbacks1[i](e);
                    callbacks1.splice(i, 1);
                    callbackTypes1.splice(i, 1);
                    i--;
                }
            }
        });
        pageContainer2.bind(transEnd, function(e){
            var i;
            for (i = 0; i < callbacks2.length; i++) {
                if (callbackTypes2[i] === e.originalEvent.propertyName) {
                    callbacks2[i](e);
                    callbacks2.splice(i, 1);
                    callbackTypes2.splice(i, 1);
                    i--;
                }
            }
        });
    });

    function setCssWithoutTransition(pageContainer : JQuery, 
                                     property : string,
                                     value : any) {
        pageContainer.removeClass("transition");
        pageContainer.css(property, value);
        pageContainer.addClass("transition");
    }

    /* Swaps the active and inactive containers */
    function swapContainers() {
        var tmp = activePageContainer;
        activePageContainer = inactivePageContainer;
        inactivePageContainer = tmp;
        reorder();
    }

    /* Reorders the page containers */
    function reorder() {
        activePageContainer.css("z-index", "2");
        inactivePageContainer.css("z-index", "1");
    }

    /* Move the old page to the left. */
    export function transitionLeft(newPage : Page,
                                   callback: () => void) {
        /* Reset the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        /* Add the jquery to the inactive page container */
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        /* Do the animation */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", -Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, "left", callback);
        }, 0);
    }

    /* Move the old page to the right. newPage can be null */
    export function transitionRight(newPage : Page,
                                    callback: () => void) {
        /* Reset the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", -Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        if (Util.exists(newPage)) {
            inactivePageContainer.empty();
            inactivePageContainer.append(newPage.getView().getJquery());
        }
        /* Do the animation */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, "left", callback);
        }, 0);
    }

    /* Fade into new page */
    export function transitionFadeIn(newPage : Page,
                                     callback: () => void) {
        /* set up the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("opacity", "0");
        inactivePageContainer.css("left", "0");
        /* Add the jquery to the inactive page container */
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        /* Set the opacity */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            activePageContainer.css("opacity", "1");
            addTransitionEndCallback(activePageContainer, "opacity", callback);
        }, 0);
    }

    /* Fade out of old page */
    export function transitionFadeOut(oldPage : Page,
                                      callback: () => void) {
        activePageContainer.css("opacity", "0");
        addTransitionEndCallback(activePageContainer, "opacity",
        function() {
            swapContainers();
            callback();
        });
    }

    /* Simply replace the active page with the new page */
    export function replacePage(newPage : Page,
                                callback: () => void) {
        /* Set the active and inactive page containers*/
        inactivePageContainer = pageContainer2;
        activePageContainer = pageContainer1;
        /* Reorder the containers and add the html to the dom*/
        reorder();
        pageContainer1.append(newPage.getView().getJquery());
        callback();
    }
}
