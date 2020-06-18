import { Injectable } from '@angular/core';
import { NavigationEnd, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigService, ShortLocale } from './config.service';
import { Filters } from './search.service';

export interface ParsedParams {
    searchString: string;
    pageIndex: number;
    pageSize: number;
    filters: Filters;
    oer: 'ALL' | 'MIXED' | 'NONE';
}

/**
 * Get values of search-related query parameters or their default values if the
 * parameter was not given.
 */
export function parseSearchQueryParams(queryParamMap: ParamMap): ParsedParams {
    const result: ParsedParams = {
        searchString: '',
        pageIndex: 0,
        pageSize: 12,
        filters: {},
        oer: 'ALL',
    };
    if (queryParamMap.has('q')) {
        result.searchString = queryParamMap.get('q');
    }
    if (queryParamMap.has('pageIndex')) {
        result.pageIndex = parseInt(queryParamMap.get('pageIndex'), 10);
    }
    if (queryParamMap.has('pageSize')) {
        result.pageSize = parseInt(queryParamMap.get('pageSize'), 10);
    }
    if (queryParamMap.has('filters')) {
        result.filters = JSON.parse(queryParamMap.get('filters'));
    }
    if (queryParamMap.has('oer')) {
        const oer = queryParamMap.get('oer');
        switch (oer) {
            case 'ALL':
            case 'MIXED':
            case 'NONE':
                result.oer = oer;
                break;
            default:
                console.warn(`Invalid value for query parameter "oer": ${oer}`);
        }
    }
    return result;
}

@Injectable({
    providedIn: 'root',
})
export class SearchParametersService {
    private parsedParams: ParsedParams;
    private parsedParamsSubject = new BehaviorSubject<ParsedParams>(null);
    private readonly shortLocale: ShortLocale;

    constructor(config: ConfigService, private router: Router) {
        this.shortLocale = config.getShortLocale();
        // Reset to null when not in search view
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (!this.router.url.startsWith('/search')) {
                this.parsedParams = null;
                this.parsedParamsSubject.next(null);
            }
        });
    }

    get(): Observable<ParsedParams> {
        return this.parsedParamsSubject.asObservable();
    }

    getCurrentValue(): ParsedParams {
        return this.parsedParams;
    }

    /**
     * Update parameters.
     *
     * Must be called when entering search view. Calling `update` is handled outside of this
     * service, so resolvers can get up-to-date parameters.
     */
    update(paramMap: ParamMap, queryParamMap: ParamMap) {
        this.parsedParams = parseSearchQueryParams(queryParamMap);
        if (paramMap.has('educationalContext')) {
            const educationalContext = paramMap.get('educationalContext');
            this.parsedParams.filters[
                `valuespaces.educationalContext.${this.shortLocale}.keyword`
            ] = [educationalContext];
        }
        if (paramMap.has('discipline')) {
            const discipline = paramMap.get('discipline');
            this.parsedParams.filters[`valuespaces.discipline.${this.shortLocale}.keyword`] = [
                discipline,
            ];
        }
        switch (this.parsedParams.oer) {
            case 'ALL':
                this.parsedParams.filters['license.oer'] = ['ALL'];
                break;
            case 'MIXED':
                this.parsedParams.filters['license.oer'] = ['ALL', 'MIXED'];
                break;
            case 'NONE':
                break; // Don't apply any filters
        }
        this.parsedParamsSubject.next(this.parsedParams);
    }
}