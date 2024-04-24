import { Injectable } from '@angular/core';

import { FacetAggregation, Node } from 'ngx-edu-sharing-api';
import * as rxjs from 'rxjs';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { facetProperties } from 'src/app/wlo-search/core/facet-properties';
import { EduSharingService, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';

export interface SubjectsPortalResults {
    groups: { [key: string]: Node[] };
    hasMore: boolean;
}

const INITIAL_NUMBER_OF_GROUPS = 5;
const NUMBER_OF_RESULTS_PER_GROUP = 10;

@Injectable()
export class SubjectsPortalResolverService  {
    /** Number of requested groups to fetch. */
    private numberOfGroups = INITIAL_NUMBER_OF_GROUPS;

    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(): Observable<SubjectsPortalResults> {
        this.numberOfGroups = INITIAL_NUMBER_OF_GROUPS;
        return this.getSubjectsPortals().pipe(take(1));
    }

    showMoreGroups(): Observable<SubjectsPortalResults> {
        this.numberOfGroups += INITIAL_NUMBER_OF_GROUPS;
        return this.getSubjectsPortals().pipe(take(1));
    }

    private getSubjectsPortals(): Observable<SubjectsPortalResults> {
        return this.getContentTypes(this.numberOfGroups).pipe(
            switchMap((contentTypes) => {
                if (contentTypes.values.length === 0) {
                    return rxjs.of({ groups: {}, hasMore: false });
                }
                const observables = contentTypes.values
                    .slice(0, this.numberOfGroups)
                    .reduce((acc, contentType) => {
                        acc[contentType.value] = this.getHitsForType(contentType.value);
                        return acc;
                    }, {} as { [key: string]: Observable<Node[]> });
                return forkJoin(observables).pipe(
                    map((groups) => ({ groups, hasMore: contentTypes.hasMore })),
                );
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
                pageSize: NUMBER_OF_RESULTS_PER_GROUP,
                filters: { ...filters, oehLrtAggregated: [type] },
                oer,
            })
            .pipe(map((response) => response.nodes));
    }

    /**
     * Returns an observable with the facet aggregation of `oehLrtAggregated`.
     *
     * Ensures that at least `minimumNumberOfGroups` are returned.
     */
    private getContentTypes(minimumNumberOfGroups: number): Observable<FacetAggregation> {
        const inner$ = this.eduSharing.getFacets().pipe(
            map((facets) => facets[facetProperties.oehLrtAggregated]),
            filter((contentTypes) => !!contentTypes),
        );
        return inner$.pipe(
            // If we don't have enough facet entries, we need to request the missing ones before
            // returning the response of `getFacets()`.
            switchMap((contentTypes) => {
                const numberOfMissingGroups = minimumNumberOfGroups - contentTypes.values.length;
                if (numberOfMissingGroups > 0 && contentTypes.hasMore) {
                    this.eduSharing.loadMoreFacetValues('oehLrtAggregated', numberOfMissingGroups);
                    return inner$;
                } else {
                    return rxjs.of(contentTypes);
                }
            }),
        );
    }
}
