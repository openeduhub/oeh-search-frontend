import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';
import * as rxjs from 'rxjs';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { EduSharingService, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';

export interface SubjectsPortalResults {
    groups: { [key: string]: Node[] };
    hasMore: boolean;
}

const INITIAL_NUMBER_OF_GROUPS = 5;
const NUMBER_OF_RESULTS_PER_GROUP = 10;

@Injectable()
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly numberOfGroups = new BehaviorSubject<number>(INITIAL_NUMBER_OF_GROUPS);

    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(): Observable<SubjectsPortalResults> {
        this.numberOfGroups.next(INITIAL_NUMBER_OF_GROUPS);
        return this.getSubjectsPortals().pipe(take(1));
    }

    showMoreGroups(): Observable<SubjectsPortalResults> {
        this.numberOfGroups.next(this.numberOfGroups.value + INITIAL_NUMBER_OF_GROUPS);
        return this.getSubjectsPortals().pipe(take(1));
    }

    private getSubjectsPortals(): Observable<SubjectsPortalResults> {
        const contentTypes$ = this.eduSharing.getFacets().pipe(
            map((facets) => facets['ccm:oeh_lrt_aggregated']),
            filter((contentTypes) => !!contentTypes),
        );
        return rxjs.combineLatest([contentTypes$, this.numberOfGroups]).pipe(
            switchMap(([contentTypes, numberOfGroups]) => {
                const observables = contentTypes.values
                    .slice(0, numberOfGroups)
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
}
