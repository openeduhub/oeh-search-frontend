import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { EduSharingService, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';
import { SearchResultsService } from '../search-results/search-results.service';
import { Value } from 'ngx-edu-sharing-api/lib/api/models/value';

export interface SubjectsPortalResults {
    [key: string]: Node[];
}

@Injectable()
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly subjectsPortalNumberOfResults = 10;
    categories = new BehaviorSubject<Value[]>(null);
    constructor(
        private searchParameters: SearchParametersService,
        private searchResultsService: SearchResultsService,
        private eduSharing: EduSharingService,
    ) {
        this.searchResultsService.results
            .pipe(
                filter((v) => !!v),
                map((v) => v.facets.find((f) => f.property === 'ccm:oeh_lrt_aggregated')?.values),
                filter((v) => !!v),
            )
            .subscribe(this.categories);
    }

    resolve(): Observable<SubjectsPortalResults> {
        return this.eduSharing.getFacets().pipe(
            filter((v) => !!v),
            map((v) => v['ccm:oeh_lrt_aggregated']?.values),
            filter((v) => !!v),
            switchMap((value) => {
                const data: { [key: string]: Observable<Node[]> } = {};
                value.slice(0, 5).forEach((v) => (data[v.value] = this.getHitsForType(v.value)));
                return forkJoin(data);
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
