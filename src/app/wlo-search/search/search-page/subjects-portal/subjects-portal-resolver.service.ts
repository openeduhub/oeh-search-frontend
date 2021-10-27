import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EduSharingService, Filters } from '../../../core/edu-sharing.service';
import { SearchParametersService } from '../../../core/search-parameters.service';

export interface SubjectsPortalResults {
    method: Node[];
    lessonPlanning: Node[];
    content: Node[];
    portal: Node[];
    tool: Node[];
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

    private getHitsForType(type: string): Observable<Node[]> {
        const { searchString, filters, oer } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy.type = [type];
        return this.eduSharing
            .requestSearch({
                searchString,
                pageIndex: 0,
                pageSize: this.subjectsPortalNumberOfResults,
                filters: { ...filters, type: [type] },
                oer,
            })
            .pipe(map((response) => response.nodes));
    }
}
