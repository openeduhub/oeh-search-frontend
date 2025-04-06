import { Inject, Injectable, Optional } from '@angular/core';
import { defaultIconPath } from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class GlobalTemplateConfigService {
    private _iconPath: string;

    constructor(@Optional() @Inject('ICON_PATH') iconPath?: string) {
        this._iconPath = iconPath || defaultIconPath;
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
}
