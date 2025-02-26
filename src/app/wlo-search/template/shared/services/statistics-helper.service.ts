import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
    CollectionReference,
    CollectionService,
    FacetsDict,
    HOME_REPOSITORY,
    ReferenceEntries,
    SearchService,
} from 'ngx-edu-sharing-api';
import { Facet } from 'ngx-edu-sharing-api/lib/api/models/facet';
import { SearchResultNode } from 'ngx-edu-sharing-api/lib/api/models/search-result-node';
import { Value } from 'ngx-edu-sharing-api/lib/api/models/value';
import { StatisticChart } from 'ngx-edu-sharing-wlo-pages';
import {
    defaultLrt,
    defaultMds,
    lrtBaseUrl,
    nodeLicenseKey,
    oerLicenses,
} from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class StatisticsHelperService {
    private readonly facets$: Observable<FacetsDict> = this.searchService
        .observeFacets([defaultLrt], { includeActiveFilters: true })
        .pipe(shareReplay(1));
    private lrtMapping: Map<string, string[]> = new Map<string, string[]>();

    constructor(
        private collectionService: CollectionService,
        private searchService: SearchService,
    ) {}

    /**
     * Post-loads the statistics for a given collection ID and returns the total number of search results (for the topic name).
     *
     * @param collectionId
     * @param topicName
     * @param statistics
     */
    async postLoadStatistics(
        collectionId: string,
        topicName: string,
        statistics: StatisticChart[],
    ): Promise<number> {
        // retrieve the learning resource types for the statistics
        for (const statistic of statistics) {
            await this.retrieveAndSetLrtVocab(statistic);
        }
        // request the references of the collection (retrieved from wirlernenonline-theme/page-templates/template_themenseite.php L.135)
        const referenceEntries: ReferenceEntries = await firstValueFrom(
            this.collectionService.getReferences({
                repository: HOME_REPOSITORY,
                collection: collectionId,
                sortProperties: ['ccm:collection_ordered_position'],
                sortAscending: [true],
            }),
        );
        // filter out deleted references
        const nonDeletedReferences: CollectionReference[] = referenceEntries.references.filter(
            (ref: CollectionReference) => !!ref.originalId,
        );
        // post process those
        statistics.forEach((statistic: StatisticChart) => {
            const filteredReferences: CollectionReference[] = this.filterContents(
                nonDeletedReferences,
                statistic.vocab,
            );
            statistic.data.editorialCount = filteredReferences.length;
            statistic.data.oerCount =
                filteredReferences.filter((ref: CollectionReference) => this.isOer(ref))?.length ??
                0;
        });

        // subscribe to facets right before performing the search request to avoid conflicts with the user-configurable
        this.facets$.subscribe();
        // perform search to retrieve the number of search results
        const searchResult: SearchResultNode = await this.performSearch(topicName);
        const searchResultCount: number = searchResult.pagination.total;

        // use facets to retrieve the number of items for different learning resource types
        const facets: Value[] =
            searchResult.facets?.find((facet: Facet) => facet.property === defaultLrt)?.values ??
            [];
        statistics.forEach((statistic: StatisticChart) => {
            let count: number = 0;
            facets.forEach((facet: Value) => {
                if (statistic.vocab.includes(facet.value)) {
                    count += facet.count;
                }
            });
            statistic.data.totalCount = count;
            // TODO: This is caused by the use of different methods to calculate these counts.
            //       This workaround should not be necessary, if a reliable solution does exist.
            if (statistic.data.totalCount < statistic.data.editorialCount) {
                statistic.data.totalCount = statistic.data.editorialCount;
            }
        });
        return searchResultCount;
    }

    /**
     * Helper function to request a learning resource type with a given ID.
     *
     * @param lrtId
     */
    private async getNewLrtList(lrtId: string): Promise<string[]> {
        let newLrtList: string[] = [];
        if (!this.lrtMapping.get(lrtId)) {
            const url: string = lrtBaseUrl + lrtId + '.json';
            try {
                const response: Response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const vocabJson = await response.json();
                newLrtList.push(vocabJson.id);

                if (vocabJson.narrower?.length > 0) {
                    vocabJson.narrower.forEach((narrow) => {
                        newLrtList.push(narrow.id);
                    });
                }
                this.lrtMapping.set(lrtId, newLrtList);
            } catch (error) {
                console.error(error.message);
            }
        }

        return this.lrtMapping.get(lrtId) ?? [];
    }

    /**
     * Helper function to retrieve the learning resource types including narrow elements and store them into the given statistic object.
     *
     * @param statistic
     */
    private async retrieveAndSetLrtVocab(statistic: StatisticChart): Promise<void> {
        let vocab: string[] = [];

        for (const lrtId of statistic.relatedLrtIds) {
            const lrtVocab: string[] = await this.getNewLrtList(lrtId);
            vocab = vocab.concat(lrtVocab);
        }

        statistic.vocab = vocab;
    }

    /**
     * Helper function to filter a given content array with given vocab IDs.
     *
     * @param contentArray
     * @param vocabIds
     */
    private filterContents(
        contentArray: CollectionReference[],
        vocabIds: string[],
    ): CollectionReference[] {
        const filteredContent: CollectionReference[] = [];
        contentArray.forEach((content: CollectionReference) => {
            if (
                content.properties?.[defaultLrt]?.some((lrtId: string) => vocabIds.includes(lrtId))
            ) {
                filteredContent.push(content);
            }
        });
        return filteredContent;
    }

    /**
     * Helper function to decide, whether a given node contains OER content or not.
     *
     * @param node
     */
    private isOer(node: CollectionReference): boolean {
        const nodeLicense: string = node.properties?.[nodeLicenseKey]?.[0] ?? '';
        return oerLicenses.includes(nodeLicense);
    }

    /**
     * Helper function to perform a search for a given search term and max items.
     *
     * @param searchTerm
     * @param maxItems
     */
    private async performSearch(
        searchTerm: string,
        maxItems: number = 0,
    ): Promise<SearchResultNode> {
        const criteria = [
            {
                property: 'ngsearchword',
                values: [searchTerm],
            },
        ];
        return this.searchService
            .search({
                query: 'ngsearch',
                repository: HOME_REPOSITORY,
                maxItems,
                contentType: 'ALL',
                metadataset: defaultMds,
                body: {
                    criteria,
                    resolveCollections: true,
                },
            })
            .toPromise();
    }
}
