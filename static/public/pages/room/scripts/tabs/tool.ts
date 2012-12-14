/*
 * A tool button within a tab.
 */
/// <reference path="../imports.ts"/>

class Tool {
    private mTab : Tab;
    private mName : string;
    private mDesc : string;
    private mIcon : string;

    constructor(tab : Tab, name : string,
                desc : string, icon? : string) {
        this.mTab = tab;
        this.mName = name;
        this.mDesc = desc;
        if (!Util.exists(icon)) icon = null;
        this.mIcon = icon;
    }

    /* Called when the tool is ready to be initialized */
    public init() : void {}

    public onTap() : void {
        console.log(this);
    }

    public getTab() : Tab {
        return this.mTab;
    }

    public getName() : string {
        return this.mName;
    }

    public getIcon() : string {
        return this.mIcon;
    }
}