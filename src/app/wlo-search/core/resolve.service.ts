import { Injectable } from '@angular/core';
import { ActivatedRoute, Resolve, Router } from '@angular/router';
import { combineLatest, Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { ErrorService } from './error-page/error.service';
import { ViewService } from './view.service';

@Injectable({
    providedIn: 'root',
})
export class ResolveService {
    constructor(private view: ViewService, private error: ErrorService, private router: Router) {}

    /**
     * Mimics the behavior of using a resolver in the router with `runGuardsAndResolvers` set to
     * `paramsOrQueryParamsChange`.
     *
     * @param resolver has to to return an Observable that will emit once and then complete
     */
    resolve<T>(resolver: Resolve<T>, route: ActivatedRoute): Observable<T> {
        return combineLatest([route.params, route.queryParams]).pipe(
            tap(() => Promise.resolve().then(() => this.view.setIsLoading())),
            switchMap(() =>
                (
                    resolver.resolve(
                        route.snapshot,
                        this.router.routerState.snapshot,
                    ) as Observable<T>
                ).pipe(finalize(() => Promise.resolve().then(() => this.view.unsetIsLoading()))),
            ),
            catchError((err) => {
                this.error.goToErrorPage(err);
                return throwError(err);
            }),
        );
    }
}
