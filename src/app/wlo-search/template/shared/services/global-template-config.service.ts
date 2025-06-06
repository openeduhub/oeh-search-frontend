import { Inject, Injectable, Optional } from '@angular/core';
import { defaultParentPageConfigNodeId } from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class GlobalTemplateConfigService {
    private _parentPageConfigNodeId: string;

    constructor(@Optional() @Inject('PARENT_PAGE_CONFIG_NODE_ID') parentPageConfigNodeId?: string) {
        this._parentPageConfigNodeId = parentPageConfigNodeId || defaultParentPageConfigNodeId;
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
