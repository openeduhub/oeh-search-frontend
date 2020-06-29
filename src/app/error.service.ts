import { Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    private error: NavigationError;

    constructor(private router: Router, private location: Location) {}

    goToErrorPage(error: NavigationError) {
        this.error = error;
        this.location.replaceState(error.url);
        this.router.navigate(['/error'], { skipLocationChange: true });
    }

    getError() {
        return this.error;
    }
}
