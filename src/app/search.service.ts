import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Result {
    hash: string;
    source: {
        id: string;
        total_count: number;
        name: string;
    };
    lom: {
        technical: {};
        educational: {};
        classification: {};
        general: {
            title: string;
            identifier: string;
            keyword: string;
        };
        rights: {};
        lifecycle: {};
    };
    id: string;
    fulltext: number;
}

export interface Results {
    total: number;
    results: Result[];
    didYouMeanSuggestion?: { plain: string; html: string };
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

@Injectable()
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

    autoComplete(searchString: string): Observable<string[]> {
        return this.http
            .post(`${this.url}/${this.index}/_search`, {
                query: {
                    multi_match: {
                        query: searchString,
                        type: 'bool_prefix',
                        fields: [
                            'title.search_as_you_type',
                            'title.search_as_you_type._2gram',
                            'title.search_as_you_type._3gram',
                            'title.search_as_you_type._index_prefix',
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
                map((response: any) => ({
                    total: response.hits.total.value,
                    results: response.hits.hits.map((hit: any) => hit._source),
                    // TODO: consider suggestions for multiple fields
                    didYouMeanSuggestion: searchString
                        ? this.getDidYouMeanSuggestion(response.suggest.title)
                        : undefined,
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
                              fields: ['lom.general.title^3', 'lom.general.keyword', 'fulltext'],
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

    private getDidYouMeanSuggestion(suggests: Suggest[]) {
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
