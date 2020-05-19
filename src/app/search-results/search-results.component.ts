import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultFragment, Thumbnail } from '../../generated/graphql';
import { Filters, SearchService } from '../search.service';
import { parseSearchQueryParams } from '../utils';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Hits = ResultFragment['hits'];
type Hit = Unpacked<Hits['hits']>;

interface ExtendedThumbnail extends Thumbnail {
    large?: string;
}

export interface ExtendedHit extends Hit {
    thumbnail: ExtendedThumbnail;
}

interface ExtendedHits extends Hits {
    hits: ExtendedHit[];
}

export interface ExtendedResult extends ResultFragment {
    hits: ExtendedHits;
}

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
    results: ExtendedResult;

    pageInfo: {
        pageIndex: number;
        pageSize: number;
    };

    filters: Filters;
    filterCount: number;

    constructor(private route: ActivatedRoute, private search: SearchService) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: ResultFragment }) => {
            this.results = data.results;
            this.loadLargeThumbnails();
        });
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { pageIndex, pageSize, filters } = parseSearchQueryParams(queryParamMap);
            this.pageInfo = {
                pageIndex,
                pageSize,
            };
            this.filters = filters;
            this.filterCount = Object.keys(filters).filter((k) => filters[k]?.length).length;
        });
    }

    private loadLargeThumbnails() {
        this.results.hits.hits
            .filter((hit) => hit.thumbnail)
            .map((result) => {
                this.search.getLargeThumbnail(result.id).subscribe((largeThumbnail) => {
                    result.thumbnail.large = largeThumbnail;
                });
            });
    }
}
