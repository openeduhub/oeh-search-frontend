import { ParamMap } from '@angular/router';
import { Filters } from './search.service';

/**
 * Get values of search-related query parameters or their default values if the
 * parameter was not given.
 */
export function parseSearchQueryParams(queryParamMap: ParamMap) {
    const result = {
        searchString: '',
        pageIndex: 0,
        pageSize: 12,
        filters: {} as Filters,
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
    return result;
}
