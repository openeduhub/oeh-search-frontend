import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { ConfigService } from '../config.service';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    private error: NavigationError;

    constructor(
        private config: ConfigService,
        private location: Location,
        private router: Router,
    ) {}

    goToErrorPage(error: NavigationError) {
        // throw error;
        this.error = error;
        this.location.replaceState(error.url);
        this.router.navigate([this.config.get().routerPath + '/error'], {
            skipLocationChange: true,
        });
    }

    getError() {
        return this.error;
    }
}
