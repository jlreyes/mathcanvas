/*
 * A tab containing a set of tools
 */
/// <reference path="./imports.ts"/>

class Tab {
    private mPage : RoomPage;
    private mName : string;
    private mDomId : string;
    private mJquery : JQuery;
    private mTools : Tool[];
    private mIconName : string;

    constructor(page : RoomPage,
                name : string,
                tools : Tool[],
                iconName : string) {
        this.mPage = page;
        this.mName = name;
        this.mTools = tools;
        this.mDomId = "tab-" + name;
        this.mIconName = iconName;
        /* Initialize the tools in this tab */
        for (var i = 0; i < tools.length; i++) tools[i].init();
    }

    public onPageInflation(jquery : JQuery) {
        this.mJquery = $("<div></div>");
        this.mJquery.attr("id", this.mDomId);
        this.mJquery.addClass("tab");
        /* Add the tools */
        var toolCallback = function(tool) {
            return tool.onTap.bind(tool);
        };
        for (var i = 0; i < this.mTools.length; i++) {
            var tool = this.mTools[i];
            var toolButton = $("<button></button>");
            var icon = tool.getIcon();
            if (Util.exists(icon)) {
                toolButton.addClass("icon");
                var iconJquery = $("<i></i>");
                iconJquery.addClass(icon);
                iconJquery.addClass("icon-large");
                toolButton.append(iconJquery);
            }
            var name = $("<p>" + tool.getName() + "</p>");
            toolButton.append(name);
            toolButton.hammer({}).bind("tap", toolCallback(tool));
            this.mJquery.append(toolButton);
        }
        /* Add the tab to the given jquery element */
        jquery.find("#tool-tab-container").append(this.mJquery);
    }

    public display() : void {
        this.mJquery.css("display", "block");
        this.onDisplay();
    }

    /* Called when this tab has just been displayed */
    private onDisplay() : void {}

    /*
     * GETTERS AND SETTERS
     */
    public getRoomPage() : RoomPage {
        return this.mPage;
    }

    public getJquery() : JQuery {
        return this.mJquery;
    }

    public getTools() : Tool[] {
        return this.mTools;
    }

    public getIconName() {
        return this.mIconName;
    }

    public getName() {
        return this.mName;
    }

    public getDomId() {
        return this.mDomId;
    }
}

class ManipulateTab extends Tab {
    constructor(page : RoomPage) {
        var tools : Tool[] = [];
        tools.push(new AddTool(this));
        tools.push(new ZoomInTool(this));
        tools.push(new ZoomOutTool(this));
        super(page, "Manipulate", tools, "icon-move");
    }
}

class MiscTab extends Tab {
    constructor(page : RoomPage) {
        var tools : Tool[] = [];
        tools.push(new ClearTool(this));
        tools.push(new SaveTool(this));
        tools.push(new LoadTool(this));
        super(page, "Misc", tools, "icon-cog");
    }
}