import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Facet, Language, SearchGQL, Type } from '../../generated/graphql';
import { ConfigService } from '../config.service';
import { SearchParametersService } from '../search-parameters.service';
import { Hits, SubjectsPortalResults } from '../search-resolver.service';
import { Filters, mapFilters } from '../search.service';

@Injectable({
    providedIn: 'root',
})
export class SubjectsPortalResolverService implements Resolve<SubjectsPortalResults> {
    private readonly subjectsPortalNumberOfResults = 10;
    private language: Language;

    constructor(
        config: ConfigService,
        private searchGQL: SearchGQL,
        private searchParameters: SearchParametersService,
    ) {
        this.language = config.getLanguage();
    }

    resolve(): Observable<SubjectsPortalResults> {
        return forkJoin({
            method: this.getHitsForType(Type.Method),
            lessonPlanning: this.getHitsForType(Type.LessonPlanning),
            content: this.getHitsForType(Type.Content),
            portal: this.getHitsForType(Type.Portal),
            tool: this.getHitsForType(Type.Tool),
        });
    }

    private getHitsForType(type: Type): Observable<Hits> {
        const { searchString, filters, oer } = this.searchParameters.getCurrentValue();
        const filtersCopy: Filters = { ...filters };
        filtersCopy[Facet.Type] = [type];
        return this.searchGQL
            .fetch({
                searchString,
                size: this.subjectsPortalNumberOfResults,
                filters: mapFilters(filtersCopy, oer),
                language: this.language,
            })
            .pipe(map((response) => response.data.search.hits));
    }
}
