import { Inject, Injectable, Optional } from '@angular/core';
import { defaultIconPath, defaultParentPageConfigNodeId } from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class GlobalTemplateConfigService {
    private _iconPath: string;
    private _parentPageConfigNodeId: string;

    constructor(
        @Optional() @Inject('ICON_PATH') iconPath?: string,
        @Optional() @Inject('PARENT_PAGE_CONFIG_NODE_ID') parentPageConfigNodeId?: string,
    ) {
        this._iconPath = iconPath || defaultIconPath;
        this._parentPageConfigNodeId = parentPageConfigNodeId || defaultParentPageConfigNodeId;
    }

    /**
     * Returns the relative path to the icon files.
     */
    get iconPath(): string {
        return this._iconPath;
    }

    /**
     * Sets the relative path of the icon files.
     */
    set iconPath(value: string) {
        this._iconPath = value;
    }

    /**
     * Returns the node ID of the parent page config.
     */
    get parentPageConfigNodeId(): string {
        return this._parentPageConfigNodeId;
    }

    /**
     * Sets the node ID of the parent page config.
     */
    set parentPageConfigNodeId(value: string) {
        this._parentPageConfigNodeId = value;
    }
}
