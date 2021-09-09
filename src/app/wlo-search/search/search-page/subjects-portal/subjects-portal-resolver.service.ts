import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchParametersService } from '../../../core/search-parameters.service';
import { EduSharingService, Filters, ResultNode } from '../../../core/edu-sharing.service';

export interface SubjectsPortalResults {
    method: ResultNode[];
    lessonPlanning: ResultNode[];
    content: ResultNode[];
    portal: ResultNode[];
    tool: ResultNode[];
}

@Injectable()
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly subjectsPortalNumberOfResults = 10;

    constructor(
        private searchParameters: SearchParametersService,
        private eduSharing: EduSharingService,
    ) {}

    resolve(): Observable<SubjectsPortalResults> {
        return forkJoin({
            method: this.getHitsForType('METHOD'),
            lessonPlanning: this.getHitsForType('LESSONPLANNING'),
            content: this.getHitsForType('MATERIAL'),
            portal: this.getHitsForType('SOURCE'),
            tool: this.getHitsForType('TOOL'),
        });
    }

    private getHitsForType(type: string): Observable<ResultNode[]> {
        const { searchString, filters, oer } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy.type = [type];
        return this.eduSharing
            .searchByParams(
                {
                    searchString,
                    pageIndex: 0,
                    pageSize: this.subjectsPortalNumberOfResults,
                    filters: { ...filters, type: [type] },
                    oer,
                },
                { fetchFacets: false },
            )
            .pipe(map((response) => response.nodes));
    }
}
