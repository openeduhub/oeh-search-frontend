import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Result {
    title: string;
    isbn: string;
    pageCount: number;
    publishedDate: {
        $date: string;
    };
    thumbnailUrl: string;
    shortDescription?: string;
    longDescription?: string;
    status: string;
    authors: string[];
    categories: string[];
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
    private readonly aggregations: { [label: string]: Aggregation } = {
        Categories: {
            terms: {
                field: 'categories.keyword',
                size: 100,
            },
        },
        Authors: {
            terms: {
                field: 'authors.keyword',
                size: 100,
            },
        },
        Status: {
            terms: {
                field: 'status.keyword',
                size: 100,
            },
        },
        'Page Count': {
            range: {
                field: 'pageCount',
                ranges: [
                    {
                        from: 0,
                        to: 100,
                    },
                    {
                        from: 100,
                        to: 500,
                    },
                    {
                        from: 500,
                        to: 10000,
                    },
                ],
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
            .post(`${this.url}/books/_search`, {
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
            .post(`${this.url}/books/_search`, {
                from: pageInfo.pageIndex * pageInfo.pageSize,
                size: pageInfo.pageSize,
                query: this.generateSearchQuery(searchString, filters),
                suggest: searchString
                    ? {
                          text: searchString,
                          title: {
                              term: {
                                  field: 'title',
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
                              fields: [
                                  'title^3',
                                  'authors',
                                  'categories',
                                  'shortDescription',
                                  'longDescription',
                                  'isbn',
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
            .post(`${this.url}/books/_search`, {
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
                .post(`${this.url}/books/_search`, {
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
