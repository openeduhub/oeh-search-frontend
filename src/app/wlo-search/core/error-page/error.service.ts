// import { Location } from '@angular/common';
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
        // private location: Location,
        private router: Router,
    ) {}

    goToErrorPage(error: NavigationError) {
        this.error = error;
        // This makes `location.href` reflect the URL that the user was trying to access _if_
        // requests were done via a route resolver.
        //
        // In this case, `location.href` will not update on its onw since there was an error
        // resolving the page. Calling `replaceState` allows the user to copy the offending URL from
        // the URL bar and to reload the page which caused the error.
        //
        // However, when requests are done by components after routing is done, this will just set
        // `location.href` to a weird URL containing the failed REST call as path.
        //
        // Currently, we do requests after routing is done.

        // this.location.replaceState(error.url);
        this.router.navigate([this.config.get().routerPath + '/error'], {
            skipLocationChange: true,
        });
    }

    getError() {
        return this.error;
    }
}
