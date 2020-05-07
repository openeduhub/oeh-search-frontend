import { Params } from '@angular/router';
import { Filters } from './search.service';

export function parseQueryParams(params: Params) {
    const result = {
        pageIndex: 0,
        pageSize: 12,
        filters: {} as Filters,
    };
    if (params.pageIndex) {
        result.pageIndex = parseInt(params.pageIndex, 10);
    }
    if (params.pageSize) {
        result.pageSize = parseInt(params.pageSize, 10);
    }
    if (params.filters) {
        result.filters = JSON.parse(params.filters);
    }
    return result;
}
