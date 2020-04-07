import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Result {
    hash: string;
    source: {
        id: string;
        total_count: number;
        name: string;
    };
    thumbnail: {
        small: string;
    };
    lom: {
        technical: {
            location: string;
        };
        educational: {
            description: string;
        };
        classification: {};
        general: {
            title: string;
            identifier: string;
            keyword: string[];
        };
        rights: {
            description: string;
        };
        lifecycle: {};
    };
    id: string;
    fulltext: number;
}

export interface Results {
    total: number;
    results: Result[];
}

export interface DidYouMeanSuggestion {
    plain: string;
    html: string;
}

export interface Facets {
    [label: string]: {
        buckets: {
            key: string;
            doc_count: number;
        }[];
    };
}

export interface Filters {
    [label: string]: string[] | null;
}

interface Suggest {
    text: string;
    offset: number;
    length: number;
    options: SuggestOption[];
}

interface SuggestOption {
    text: string;
    score: number;
    freq: number;
}

type Aggregation =
    | { terms: { field: string; size: number } }
    | { range: { field: string; ranges: { from: number; to: number }[] } };

@Injectable({ providedIn: 'root' })
export class SearchService {
    private readonly url = 'http://localhost:9200';
    private readonly index = 'search_idx';
    private readonly aggregations: { [label: string]: Aggregation } = {
        Source: {
            terms: {
                field: 'source.name.keyword',
                size: 100,
            },
        },
        Keywords: {
            terms: {
                field: 'lom.general.keyword.keyword',
                size: 100,
            },
        },
    };

    private facets = new BehaviorSubject<Facets>(null);

    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestion>(null);

    constructor(private http: HttpClient) {
        this.updateFacets();
    }

    search(
        searchString: string,
        pageInfo: {
            pageIndex: number;
            pageSize: number;
        },
        filters: Filters,
    ): Observable<Results> {
        this.updateFacets(searchString, filters);
        return this.performSearch(searchString, pageInfo, filters);
    }

    getDetails(id: string): Observable<Result> {
        return this.http
            .post(`${this.url}/${this.index}/_search`, {
                query: { term: { _id: id } },
            })
            .pipe(
                map((response: any) => {
                    if (response.hits.total.value !== 1) {
                        throw new Error(
                            `Got ${response.hits.total.value} results when requesting entry by id`,
                        );
                    }
                    return response.hits.hits[0]._source;
                }),
            );
    }

    autoComplete(searchString: string): Observable<string[]> {
        return this.http
            .post(`${this.url}/${this.index}/_search`, {
                query: {
                    multi_match: {
                        query: searchString,
                        type: 'bool_prefix',
                        fields: [
                            'lom.general.title.search_as_you_type',
                            'lom.general.title.search_as_you_type._2gram',
                            'lom.general.title.search_as_you_type._3gram',
                            'lom.general.title.search_as_you_type._index_prefix',
                        ],
                        operator: 'and',
                    },
                },
            })
            .pipe(map((response: any) => response.hits.hits.map((hit) => hit._source.title)));
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestion> {
        return this.didYouMeanSuggestion.asObservable();
    }

    private performSearch(
        searchString: string,
        pageInfo: {
            pageIndex: number;
            pageSize: number;
        },
        filters: Filters,
    ): Observable<Results> {
        return this.http
            .post(`${this.url}/${this.index}/_search`, {
                from: pageInfo.pageIndex * pageInfo.pageSize,
                size: pageInfo.pageSize,
                query: this.generateSearchQuery(searchString, filters),
                suggest: searchString
                    ? {
                          text: searchString,
                          title: {
                              term: {
                                  field: 'lom.general.title',
                              },
                          },
                      }
                    : undefined,
            })
            .pipe(
                tap((response: any) => {
                    // TODO: consider suggestions for multiple fields
                    if (response.suggest) {
                        const didYouMeanSuggestion = this.generateDidYouMeanSuggestion(
                            response.suggest.title,
                        );
                        this.didYouMeanSuggestion.next(didYouMeanSuggestion);
                    } else {
                        this.didYouMeanSuggestion.next(null);
                    }
                }),
                map((response: any) => ({
                    total: response.hits.total.value,
                    results: response.hits.hits.map((hit: any) => hit._source),
                })),
            );
    }

    private generateSearchQuery(searchString?: string, filters: Filters = {}): object {
        return {
            bool: {
                must: searchString
                    ? {
                          multi_match: {
                              query: searchString,
                              type: 'cross_fields',
                              fields: [
                                  'lom.general.title^3',
                                  'lom.general.keyword',
                                  'lom.educational.description',
                                  'fulltext',
                              ],
                              operator: 'and',
                          },
                      }
                    : undefined,
                filter: this.mapFilters(filters),
            },
        };
    }

    private async updateFacets(searchString?: string, filters: Filters = {}) {
        const body = {
            size: 0,
            aggregations: this.aggregations,
        };
        // We want to narrow the facets down with the already applied filters.
        // Therefore, we generally apply filters when getting facets...
        const filteredFacetsPromise = this.http
            .post(`${this.url}/${this.index}/_search`, {
                ...body,
                query: this.generateSearchQuery(searchString, filters),
            })
            .pipe(map((response: any) => response.aggregations))
            .toPromise();
        // ...with the exception of facets that a filter applies to: We cannot
        // filter the affected facet itself; otherwise we would end up showing
        // the user only these values that they already selected. Therefore, we
        // filter a facet with all filters *but* the one affecting the facet.
        const overridesPromises = Object.keys(filters).map((key) => {
            const otherFilters = { ...filters };
            delete otherFilters[key];
            return this.http
                .post(`${this.url}/${this.index}/_search`, {
                    ...body,
                    query: this.generateSearchQuery(searchString, otherFilters),
                })
                .pipe(
                    map((response: any) => ({
                        label: key,
                        facet: response.aggregations[key],
                    })),
                )
                .toPromise();
        });
        // Do all necessary HTTP requests simultaneously. When done, construct
        // the final facets object.
        const [facets, ...overrides] = await Promise.all([
            filteredFacetsPromise,
            ...overridesPromises,
        ]);
        for (const override of overrides) {
            facets[override.label] = override.facet;
        }
        this.facets.next(facets);
    }

    private generateDidYouMeanSuggestion(suggests: Suggest[]) {
        const words = suggests.map((suggest) => {
            if (suggest.options.length > 0) {
                return { text: suggest.options[0].text, changed: true };
            } else {
                return { text: suggest.text, changed: false };
            }
        });
        if (words.some((word) => word.changed)) {
            return {
                plain: words.map((word) => word.text).join(' '),
                html: words
                    .map((word) => (word.changed ? `<em>${word.text}</em>` : word.text))
                    .join(' '),
            };
        } else {
            return null;
        }
    }

    private mapFilters(filters: Filters): object[] {
        return Object.entries(filters)
            .map(([label, value]) => this.generateFilter(label, value))
            .filter((entry) => entry !== null);
    }

    private generateFilter(label: string, value: string[] | null): object | null {
        if (value === null || value.length === 0) {
            return null;
        }
        const aggregation = this.aggregations[label];
        if ('terms' in aggregation) {
            return {
                terms: {
                    [aggregation.terms.field]: value,
                },
            };
        } else {
            throw new Error(`Unknown filter label: ${label}`);
        }
    }
}
