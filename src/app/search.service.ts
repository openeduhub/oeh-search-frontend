import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Result {
    hash: string;
    source: {
        id: string;
        total_count: number;
        name: string;
    };
    thumbnail: {
        mimetype: string;
        small: string;
        large?: string;
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
    fulltext: string;
    valuespaces?: {
        discipline?: {
            de: string;
        }[];
        educationalContext?: {
            de: string;
        }[];
    };
}

export interface Results {
    total: number;
    time: number; // ms
    results: Result[];
}

export interface DidYouMeanSuggestion {
    plain: string;
    html: string;
}

export type Facet = 'sources' | 'keywords' | 'disciplines' | 'educationalContexts';

interface Bucket {
    key: string;
    doc_count: number;
}

export type Facets = {
    [label in Facet]: {
        buckets: Bucket[];
    };
};

export type Filters = {
    [label in Facet]?: string[];
};

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

interface AggregationTerms {
    field: string;
    size: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
    private readonly url = environment.elasticSearchUrl;
    private readonly index = 'search_idx';
    private readonly aggregationTerms: { [label: string]: AggregationTerms } = {
        sources: {
            field: 'source.name.keyword',
            size: 100,
        },
        keywords: {
            field: 'lom.general.keyword.keyword',
            size: 100,
        },
        disciplines: {
            field: 'valuespaces.discipline.de.keyword',
            size: 100,
        },
        educationalContexts: {
            field: 'valuespaces.educationalContext.de.keyword',
            size: 100,
        },
    };

    private facets = new BehaviorSubject<Facets>(null);
    private didYouMeanSuggestion = new BehaviorSubject<DidYouMeanSuggestion>(null);

    constructor(private http: HttpClient) {}

    search(
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
                _source: {
                    excludes: ['thumbnail.large'],
                },
                query: this.generateSearchQuery(searchString, filters),
                suggest: this.generateSuggest(searchString),
                aggregations: this.generateAggregations(searchString, filters),
            })
            .pipe(
                tap((response: any) => this.updateDidYouMeanSuggestion(response.suggest)),
                tap((response: any) => this.updateFacets(response.aggregations)),
                map((response: any) => ({
                    total: response.hits.total.value,
                    time: response.took,
                    results: response.hits.hits.map((hit: any) => hit._source),
                })),
            );
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
            .pipe(
                map((response: any) =>
                    response.hits.hits.map((hit) => hit._source.lom.general.title),
                ),
            );
    }

    getFacets(): Observable<Facets> {
        return this.facets.asObservable();
    }

    getDidYouMeanSuggestion(): Observable<DidYouMeanSuggestion> {
        return this.didYouMeanSuggestion.asObservable();
    }

    private generateSearchQuery(searchString?: string, filters: Filters = {}) {
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

    private generateAggregations(searchString?: string, filters: Filters = {}) {
        // Extract the non-facet part of the query to apply to all aggregations.
        const query = this.generateSearchQuery(searchString, {});
        // Build a modified aggregations object, where each facet is wrapped in a filter aggregation
        // that applies all active filters but that of the facet itself. This way, options are
        // narrowed down by other filters but currently not selected options of *this* facet are
        // still shown.
        const aggregations = Object.entries(this.aggregationTerms).reduce((acc, [label, terms]) => {
            const otherFilters = { ...filters };
            delete otherFilters[label];
            const filteredAggregation = {
                filter: {
                    bool: {
                        must: query.bool.must,
                        filter: this.mapFilters(otherFilters),
                    },
                },
                aggregations: {
                    [`filtered_${label}`]: {
                        // Will return the top entries with respect to currently active filters.
                        terms,
                    },
                    [`selected_${label}`]: {
                        // Will return the currently selected (filtered by) entries.
                        //
                        // This is important since the currently selected entries might not be among
                        // the top results we get from the above aggregation. We explicitly add all
                        // selected entries to make sure all active filters appear on the list.
                        terms: {
                            ...terms,
                            include: filters[label] || [],
                        },
                    },
                },
            };
            acc[label] = filteredAggregation;
            return acc;
        }, {});
        return {
            all_facets: {
                global: {},
                aggregations,
            },
        };
    }

    private async updateFacets(aggregations: any) {
        // Unwrap the filter structure introduced by `generateAggregations`.
        const facets = Object.entries(aggregations.all_facets).reduce(
            (acc, [label, aggregation]) => {
                if (aggregation[`filtered_${label}`]) {
                    acc[label] = mergeAggregations(
                        aggregation[`filtered_${label}`],
                        aggregation[`selected_${label}`],
                    );
                }
                return acc;
            },
            {} as Facets,
        );
        this.facets.next(facets);
    }

    private generateSuggest(searchString: string) {
        if (searchString) {
            return {
                text: searchString,
                title: {
                    term: {
                        field: 'lom.general.title',
                    },
                },
            };
        } else {
            return undefined;
        }
    }

    private updateDidYouMeanSuggestion(suggest?: { [label: string]: any }) {
        // TODO: consider suggestions for multiple fields
        if (suggest) {
            const didYouMeanSuggestion = this.processDidYouMeanSuggestion(suggest.title);
            this.didYouMeanSuggestion.next(didYouMeanSuggestion);
        } else {
            this.didYouMeanSuggestion.next(null);
        }
    }

    private processDidYouMeanSuggestion(suggests: Suggest[]) {
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
        const terms = this.aggregationTerms[label];
        if (terms && 'field' in terms) {
            return {
                terms: {
                    [terms.field]: value,
                },
            };
        } else {
            throw new Error(`Unknown filter label: ${label}`);
        }
    }
}

function mergeAggregations(
    lhs: { buckets: Bucket[] },
    rhs: { buckets: Bucket[] },
): { buckets: Bucket[] } {
    // There are actually more fields in aggregations than `buckets`, but we don't use them at the
    // moment, so we just drop them.
    return { buckets: mergeBuckets(lhs.buckets, rhs.buckets) };
}

function mergeBuckets(lhs: Bucket[], rhs: Bucket[]): Bucket[] {
    for (const bucket of rhs) {
        if (!lhs.some((b) => b.key === bucket.key)) {
            lhs.push(bucket);
        }
    }
    return lhs;
}
