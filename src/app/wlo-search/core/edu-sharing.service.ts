import { Injectable } from '@angular/core';
import {
    DidYouMeanSuggestion,
    FacetsDict,
    MdsIdentifier,
    MdsLabelService,
    Node,
    NodeService,
    SearchRequestParams,
    SearchResults,
    SearchService,
} from 'ngx-edu-sharing-api';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { facetProperties } from './facet-properties';
import { ParsedParams, SearchParametersService } from './search-parameters.service';

export type Collection = ArrayElement<Node['usedInCollections']>;

type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Facet = keyof typeof facetProperties;

export type Filters = {
    [key in Facet]?: string[];
};

@Injectable({
    providedIn: 'root',
})
export class EduSharingService {
    static readonly repository = 'local';
    static readonly metadataSet = 'mds_oeh';
    private static readonly searchQuery = 'ngsearch';

    private readonly facets$ = this.searchService
        .getFacets(Object.values(facetProperties), { includeActiveFilters: true })
        .pipe(shareReplay(1));
    private readonly didYouMeanSuggestion$ = this.searchService
        .getDidYouMeanSuggestion()
        .pipe(shareReplay(1));

    constructor(
        private searchParameters: SearchParametersService,
        private searchService: SearchService,
        private nodeService: NodeService,
        private mdsLabelService: MdsLabelService,
    ) {
        // Subscribe early, so required data will be fetched with search requests.
        this.facets$.subscribe();
        this.didYouMeanSuggestion$.subscribe();
    }

    /**
     * Sends a search request with current params and updates facets.
     */
    search(): Observable<SearchResults> {
        const requestParams = this.getSearchRequestParams(this.searchParameters.getCurrentValue());
        return this.searchService.search(requestParams);
    }

    /**
     * Sends a search request with custom params without updating facets.
     */
    requestSearch(params: ParsedParams): Observable<SearchResults> {
        const requestParams = this.getSearchRequestParams(params);
        return this.searchService.requestSearch(requestParams);
    }

    getNode(id: string): Observable<Node> {
        return this.nodeService.getNode(EduSharingService.repository, id);
    }

    getFacets(): Observable<FacetsDict> {
        return this.facets$;
    }

    loadMoreFacetValues(facet: Facet, size: number): void {
        this.searchService.loadMoreFacets(facetProperties[facet], size);
    }

    getFacetSuggestions(inputString: string): Observable<FacetsDict> {
        return this.searchService.getAsYouTypeFacetSuggestions(
            inputString,
            Object.values(facetProperties),
            5,
        );
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestion> {
        return this.didYouMeanSuggestion$;
    }

    getDisplayName(property: string, key: string): Observable<string> {
        return this.mdsLabelService.getLabel(this.getMdsIdentifier(), property, key);
    }

    getSourceUrl(node: Node): Observable<string> {
        return this.mdsLabelService
            .findValue(
                this.getMdsIdentifier(),
                'ccm:replicationsource',
                node.properties['ccm:replicationsource']?.[0],
            )
            .pipe(map((value) => value?.url));
    }

    private getMdsIdentifier(): MdsIdentifier {
        return {
            repository: EduSharingService.repository,
            metadataSet: EduSharingService.metadataSet,
        };
    }

    private getSearchRequestParams(params: ParsedParams): SearchRequestParams {
        const { searchString, pageIndex, pageSize, filters, oer } = params;
        return {
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
                criteria: this.getSearchCriteria(searchString, filters, oer),
                facets: [],
                resolveCollections: true,
                facetLimit: 10,
                facetMinCount: 1,
            },
        };
    }

    private getSearchCriteria(
        searchString: string,
        filters: Filters,
        oer: ParsedParams['oer'],
    ): SearchRequestParams['body']['criteria'] {
        return [
            ...this.mapSearchString(searchString),
            ...this.mapFilters(filters),
            ...this.mapOer(oer),
        ];
    }

    private mapSearchString(searchString: string): SearchRequestParams['body']['criteria'] {
        if (searchString) {
            return [{ property: 'ngsearchword', values: [searchString] }];
        } else {
            return [];
        }
    }

    private mapFilters(filters: Filters): SearchRequestParams['body']['criteria'] {
        return Object.entries(filters).map(([facet, values]) => ({
            property: facetProperties[facet as Facet],
            values,
        }));
    }

    private mapOer(oer: ParsedParams['oer']): SearchRequestParams['body']['criteria'] {
        switch (oer) {
            case 'ALL':
                return [{ property: 'license', values: ['OPEN', 'CC_BY_OPEN'] }];
            case 'NONE':
                return [];
        }
    }
}