import { Injectable } from '@angular/core';
import * as rxjs from 'rxjs';
import { Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import * as apiModels from '../api/models';
import { NodeV1Service, SearchV1Service } from '../api/services';
import { ParsedParams, SearchParametersService } from '../search-parameters.service';
import { facetProperties } from './facet-properties';
import { ValueMappingService } from './value-mapping.service';

export type SearchResults = Pick<apiModels.SearchResultNode, 'nodes' | 'pagination'>;
export type ResultNode = apiModels.Node;
export type Collection = ArrayElement<ResultNode['usedInCollections']>;

type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Facet = keyof typeof facetProperties;

export interface FacetValue {
    count: number;
    id: string;
    displayName: string;
}

interface FacetAggregation {
    // TODO: pagination information
    values: FacetValue[];
}

export type Facets = {
    [facet in Facet]: FacetAggregation;
};

export type Filters = {
    [key in Facet]?: string[];
};

export interface DidYouMeanSuggestion {
    plain: string;
    html: string;
}

@Injectable()
export class EduSharingService {
    static readonly repository = 'local';
    static readonly metadataSet = 'mds_oeh';
    private static readonly searchQuery = 'ngsearch';

    private readonly searchResponse$ = new ReplaySubject<apiModels.SearchResultNode>(1);
    private readonly facets$ = new ReplaySubject<Facets>(1);
    private didYouMeanSuggestion$ = new ReplaySubject<DidYouMeanSuggestion>(1);

    constructor(
        private searchParameters: SearchParametersService,
        private searchV1: SearchV1Service,
        private nodeV1: NodeV1Service,
        private valueMapping: ValueMappingService,
    ) {
        this.searchResponse$
            .pipe(switchMap(({ facettes }) => this.mapFacets(facettes)))
            .subscribe((facets) => this.facets$.next(facets));
        this.searchResponse$
            .pipe(map((response) => this.mapDidYouMeanSuggestion(response)))
            .subscribe((didYouMeanSuggestion) =>
                this.didYouMeanSuggestion$.next(didYouMeanSuggestion),
            );
    }

    search(): Observable<SearchResults> {
        return this.searchByParams(this.searchParameters.getCurrentValue()).pipe(
            tap((response) => this.searchResponse$.next(response)),
            map(({ nodes, pagination }) => ({ nodes, pagination })),
        );
    }

    searchByParams(
        params: ParsedParams,
        { fetchFacets = true } = {},
    ): Observable<apiModels.SearchResultNode> {
        const { searchString, pageIndex, pageSize, filters, oer } = params;
        return this.searchV1.searchV2({
            repository: EduSharingService.repository,
            metadataset: EduSharingService.metadataSet,
            query: EduSharingService.searchQuery,
            contentType: 'FILES',
            skipCount: pageIndex * pageSize,
            maxItems: pageSize,
            sortProperties: ['score', 'cm:modified'],
            sortAscending: [false, false],
            propertyFilter: ['-all-'],
            body: {
                criterias: this.getSearchCriteria(searchString, filters, oer),
                facettes: fetchFacets ? Object.values(facetProperties) : [],
                resolveCollections: true,
            },
        });
    }

    getNode(id: string): Observable<ResultNode> {
        return this.nodeV1
            .getMetadata({
                repository: EduSharingService.repository,
                node: id,
                propertyFilter: ['-all-'],
            })
            .pipe(map((nodeEntry) => nodeEntry.node));
    }

    getFacets(): Observable<Facets> {
        return this.facets$.asObservable();
    }

    getFacetSuggestions(inputString: string): Observable<Facets> {
        // This is a placeholder implementation with non-final results.
        const params = {
            ...this.searchParameters.getCurrentValue(),
            pageSize: 0,
            pageIndex: 0,
            searchString: inputString,
        };
        return this.searchByParams(params).pipe(
            switchMap((result) => this.mapFacets(result.facettes)),
        );
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestion> {
        return this.didYouMeanSuggestion$.asObservable();
    }

    private getSearchCriteria(
        searchString: string,
        filters: Filters,
        oer: ParsedParams['oer'],
    ): apiModels.SearchParameters['criterias'] {
        return [
            ...this.mapSearchString(searchString),
            ...this.mapFilters(filters),
            ...this.mapOer(oer),
        ];
    }

    private mapFacets(
        searchResultFacets: apiModels.SearchResultNode['facettes'],
    ): Observable<Facets> {
        return rxjs.forkJoin(
            mapObjectValues(facetProperties, (property) =>
                this.mapFacet(searchResultFacets.find((f) => f.property === property)),
            ),
        );
    }

    private mapFacet(searchResultFacet: apiModels.Facette): Observable<FacetAggregation> {
        if (searchResultFacet.values.length === 0) {
            return rxjs.of({ values: [] });
        }
        const values$ = rxjs.forkJoin(
            searchResultFacet.values.map(({ count, value: id }) =>
                this.valueMapping
                    .getDisplayName(searchResultFacet.property, id)
                    .pipe(map((displayName) => ({ count, id, displayName }))),
            ),
        );
        return values$.pipe(map((values) => ({ values })));
    }

    private mapDidYouMeanSuggestion(response: apiModels.SearchResultNode): DidYouMeanSuggestion {
        // return { plain: 'Foo bar', html: '<em>Foo</em> bar' };
        return null;
    }

    private mapSearchString(searchString: string): apiModels.SearchParameters['criterias'] {
        if (searchString) {
            return [{ property: 'ngsearchword', values: [searchString] }];
        } else {
            return [];
        }
    }

    private mapFilters(filters: Filters): apiModels.SearchParameters['criterias'] {
        return Object.entries(filters).map(([facet, values]) => ({
            property: facetProperties[facet],
            values,
        }));
    }

    private mapOer(oer: ParsedParams['oer']): apiModels.SearchParameters['criterias'] {
        switch (oer) {
            case 'ALL':
                return [{ property: 'license', values: ['OPEN', 'CC_BY_OPEN'] }];
            case 'NONE':
                return [];
        }
    }
}

function mapObjectValues<T, R>(
    obj: { [key: string]: T },
    mapFn: (value: T) => R,
): { [key: string]: R } {
    return Object.entries(obj).reduce((result, [key, value]) => {
        result[key] = mapFn(value);
        return result;
    }, {} as { [key: string]: R });
}
