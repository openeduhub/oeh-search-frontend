import { Injectable } from '@angular/core';
import { NavigationEnd, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PageModeService } from './page-mode.service';
import { Filters } from './search.service';

export interface ParsedParams {
    searchString: string;
    pageIndex: number;
    pageSize: number;
    filters: Filters;
    oer: 'ALL' | 'NONE';
}

@Injectable({
    providedIn: 'root',
})
export class SearchParametersService {
    private parsedParams: ParsedParams;
    private readonly parsedParamsSubject = new BehaviorSubject<ParsedParams>(null);
    private defaultPageSize;

    constructor(private router: Router, private pageMode: PageModeService) {
        // Reset to null when not in search view
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (!this.router.url.startsWith('/search')) {
                this.parsedParams = null;
                this.parsedParamsSubject.next(null);
            }
        });
        this.pageMode
            .getPageConfig('numberOfResults')
            .subscribe((numberOfResults) => (this.defaultPageSize = numberOfResults));
    }

    get(): Observable<ParsedParams> {
        return this.parsedParamsSubject.asObservable();
    }

    /**
     * Use this if you plan on modifying the obtained object.
     */
    getCopy(): Observable<ParsedParams> {
        return this.parsedParamsSubject.pipe(
            map((parsedParams) => JSON.parse(JSON.stringify(parsedParams))),
        );
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
        this.parsedParams = this.parseSearchQueryParams(queryParamMap);
        this.parsedParamsSubject.next(this.parsedParams);
    }

    /**
     * Get values of search-related query parameters or their default values if the
     * parameter was not given.
     */
    parseSearchQueryParams(queryParamMap: ParamMap): ParsedParams {
        const result: ParsedParams = {
            searchString: '',
            pageIndex: 0,
            pageSize: this.defaultPageSize,
            filters: {},
            oer: 'NONE',
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
                case 'NONE':
                    result.oer = oer;
                    break;
                default:
                    console.warn(`Invalid value for query parameter "oer": ${oer}`);
            }
        }
        return result;
    }
}
