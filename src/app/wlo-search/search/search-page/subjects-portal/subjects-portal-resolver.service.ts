import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { EduSharingService, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';

export interface SubjectsPortalResults {
    [key: string]: Node[];
}

@Injectable()
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly subjectsPortalNumberOfResults = 10;

    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(): Observable<SubjectsPortalResults> {
        return this.eduSharing.getFacets().pipe(
            map((facets) => facets['ccm:oeh_lrt_aggregated']),
            filter((contentTypes) => !!contentTypes),
            switchMap((contentTypes) => {
                const observables = contentTypes.values.slice(0, 5).reduce((acc, contentType) => {
                    acc[contentType.value] = this.getHitsForType(contentType.value);
                    return acc;
                }, {} as { [key: string]: Observable<Node[]> });
                return forkJoin(observables);
            }),
        );
    }

    private getHitsForType(type: string): Observable<Node[]> {
        const { searchString, filters, oer } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy.type = [type];
        return this.eduSharing
            .requestSearch({
                searchString,
                pageIndex: 0,
                pageSize: this.subjectsPortalNumberOfResults,
                filters: { ...filters, oehLrtAggregated: [type] },
                oer,
            })
            .pipe(map((response) => response.nodes));
    }
}
