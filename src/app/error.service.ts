import { Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    private error: NavigationError;

    constructor(private router: Router) {}

    goToErrorPage(error: NavigationError) {
        this.error = error;
        this.router.navigate(['/error']);
    }

    getError() {
        return this.error;
    }
}
