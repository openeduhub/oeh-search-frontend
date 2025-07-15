import { Injectable } from '@angular/core';
import { HOME_REPOSITORY, SearchService } from 'ngx-edu-sharing-api';
import { SearchResultNode } from 'ngx-edu-sharing-api/lib/api/models/search-result-node';
import { StatisticChart, StatisticNode, StatisticSummaryData } from 'ngx-edu-sharing-wlo-pages';
import {
    defaultMds,
    disciplineKey,
    lrtBaseUrl,
    lrtIdsOrganizations,
    lrtIdsPeople,
} from '../custom-definitions';
import { GridTile } from '../types/grid-tile';
import { Swimlane } from '../types/swimlane';

@Injectable({
    providedIn: 'root',
})
export class StatisticsHelperService {
    private lrtMapping: Map<string, string[]> = new Map<string, string[]>();
    private mappingsAndSearchLoaded: boolean = false;
    private searchResultCount: number = 0;

    constructor(private searchService: SearchService) {}

    async updateStatistics(
        topicName: string,
        taxonIds: string[],
        statistics: StatisticChart[],
        swimlanes: Swimlane[],
    ): Promise<number> {
        console.time('executionFunctionToBeMeasured');
        // retrieve the learning resource types for the statistics
        if (!this.mappingsAndSearchLoaded) {
            for (const statistic of statistics) {
                await this.retrieveAndSetLrtVocab(statistic);
            }
            // perform search to retrieve the number of search results
            const searchResult: SearchResultNode = await this.performSearch(topicName, taxonIds);
            this.searchResultCount = searchResult.pagination.total;
            this.mappingsAndSearchLoaded = true;
        }
        // create one combined array
        const nodeIdToStatisticsMap: Map<string, StatisticNode> = new Map<string, StatisticNode>();
        swimlanes.forEach((swimlane: Swimlane): void => {
            swimlane.grid?.forEach((gridItem: GridTile): void => {
                gridItem.statistics?.forEach((statistic: StatisticNode): void => {
                    // either not yet included or the current value exists
                    if (
                        !nodeIdToStatisticsMap.has(statistic.nodeId) ||
                        nodeIdToStatisticsMap.get(statistic.nodeId).lrts?.length <
                            statistic.lrts?.length
                    ) {
                        nodeIdToStatisticsMap.set(statistic.nodeId, statistic);
                    }
                });
            });
        });
        // reset the statistics
        // note: create a new object for each statistic to get the whole object updated
        //       and not only its reference, which is important for listening to data changes
        statistics.forEach((statistic: StatisticChart): void => {
            statistic.data = new StatisticSummaryData();
        });
        // update the statistics (for each node, check if the lrt is included in the statistics vocab
        nodeIdToStatisticsMap.forEach((statisticNode: StatisticNode, key): void => {
            for (const statistic of statistics) {
                const increaseCounts = () => {
                    statistic.data.totalCount += 1;
                    if (statisticNode.isOer) {
                        statistic.data.oerCount += 1;
                    }
                    if (statisticNode.isEditorial) {
                        statistic.data.editorialCount += 1;
                    }
                };
                if (statisticNode.lrts?.some((lrt) => statistic.vocab.includes(lrt))) {
                    increaseCounts();
                }
                // workarounds to check for specific learning resource types
                if (
                    statistic.vocab.length > 0 &&
                    statistic.vocab[0].includes(lrtIdsPeople[0]) &&
                    statisticNode.isPerson
                ) {
                    increaseCounts();
                }
                if (
                    statistic.vocab.length > 0 &&
                    statistic.vocab[0].includes(lrtIdsOrganizations[0]) &&
                    statisticNode.isOrganization
                ) {
                    increaseCounts();
                }
            }
        });
        console.timeEnd('executionFunctionToBeMeasured');
        return this.searchResultCount;
    }

    /**
     * Helper function to request a learning resource type with a given ID.
     *
     * @param lrtId
     * @param lrtUrl
     */
    private async getNewLrtList(lrtId: string, lrtUrl: string = lrtBaseUrl): Promise<string[]> {
        let newLrtList: string[] = [];
        if (!this.lrtMapping.get(lrtId)) {
            const url: string = lrtUrl + lrtId + '.json';
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
            const lrtVocab: string[] = await this.getNewLrtList(lrtId, statistic.lrtUrl);
            vocab = vocab.concat(lrtVocab);
        }

        statistic.vocab = vocab;
    }

    /**
     * Helper function to perform a search for a given search term, taxon IDs and max items.
     *
     * @param searchTerm
     * @param taxonIds
     * @param maxItems
     */
    private async performSearch(
        searchTerm: string,
        taxonIds: string[],
        maxItems: number = 0,
    ): Promise<SearchResultNode> {
        const criteria = [
            {
                property: 'ngsearchword',
                values: [searchTerm],
            },
            {
                property: disciplineKey,
                values: taxonIds,
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
