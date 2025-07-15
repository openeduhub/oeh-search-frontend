import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class CoreService {
    constructor(private router: Router) {}

    /**
     * Handles the initialization of this service.
     * This is not done in the constructor to be able to call the icon registration at a later time.
     */
    setUp(): void {
        this.registerMessageHandler();
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
