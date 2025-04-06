import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GlobalTemplateConfigService } from '../template/shared/services/global-template-config.service';

@Injectable({
    providedIn: 'root',
})
export class CoreService {
    private iconPath: string;

    constructor(
        private domSanitizer: DomSanitizer,
        private globalTemplateConfigService: GlobalTemplateConfigService,
        private matIconRegistry: MatIconRegistry,
        private router: Router,
    ) {}

    /**
     * Handles the initialization of this service.
     * This is not done in the constructor to be able to call the icon registration at a later time.
     */
    setUp(): void {
        this.iconPath = this.globalTemplateConfigService.iconPath;
        this.registerCustomIcons();
        this.registerMessageHandler();
    }

    private registerCustomIcons(): void {
        // We inline SVG icons to make them available for usage in web components.
        //
        // When adding new icons, make sure to use a plain SVG format, e.g., when working with
        // Inkscape.
        for (const icon of [
            'advertisement',
            'anchor',
            'author',
            'editorial',
            'left_side_panel',
            'login',
            'one_column',
            'oer',
            'price',
            'right_side_panel',
            'storage',
            'three_columns',
            'two_columns',
        ]) {
            this.matIconRegistry.addSvgIcon(
                icon,
                this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPath + icon + '.svg'),
            );
        }
    }

    private registerMessageHandler(): void {
        window.addEventListener('message', (event) => {
            const message: Message = event.data;
            if (message.scope !== 'OEH') {
                return;
            }
            switch (message.type) {
                case 'navigate':
                    this.router.navigateByUrl(message.data.url);
                    break;
                default:
                    console.error(`Unknown message type: ${message.type}`, event);
            }
        });
    }
}

type Message = { scope: 'OEH' } & {
    type: 'navigate';
    data: {
        url: string;
    };
};
