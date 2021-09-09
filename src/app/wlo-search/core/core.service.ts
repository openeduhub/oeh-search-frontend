import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class CoreService {
    constructor(
        private router: Router,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
    ) {
        this.registerCustomIcons();
        this.registerMessageHandler();
    }

    setUp(): void {
        // Dummy function.
        //
        // We do the setup once the service is injected because we want to do it only once in the
        // application lifetime. To achieve this, we set this service to `providedIn: 'root'`, but we
        // need to make sure it will be injected for the setup to happen as a side effect. This method
        // exists, so the service will not be removed by accident or optimized out of the application.
    }

    private registerCustomIcons(): void {
        for (const icon of [
            'advertisement_green',
            'advertisement_red',
            'login_green',
            'login_orange',
            'login_red',
            'price_green',
            'price_orange',
            'price_red',
        ]) {
            this.matIconRegistry.addSvgIcon(
                icon,
                this.domSanitizer.bypassSecurityTrustResourceUrl(
                    `./assets/wlo-search/icons/${icon}.svg`,
                ),
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
