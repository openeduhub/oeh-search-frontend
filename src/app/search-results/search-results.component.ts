import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultFragment, Thumbnail, GetLargeThumbnailGQL } from 'src/generated/graphql';
import { Filters, SearchService } from '../search.service';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Hits = ResultFragment['hits'];
type Hit = Unpacked<Hits['hits']>;

interface ExtendedThumbnail extends Thumbnail {
    large?: string;
}

interface ExtendedHit extends Hit {
    thumbnail: ExtendedThumbnail;
}

interface ExtendedHits extends Hits {
    hits: ExtendedHit[];
}

interface ExtendedResult extends ResultFragment {
    hits: ExtendedHits;
}

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
    results: ExtendedResult;

    pageInfo = {
        pageIndex: 0,
        pageSize: 12,
    };

    filters: Filters = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private search: SearchService,
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: ResultFragment }) => {
            this.results = data.results;
            this.loadLargeThumbnails();
        });
        this.route.queryParams.subscribe((params) => {
            if (params.pageIndex) {
                this.pageInfo.pageIndex = parseInt(params.pageIndex, 10);
            }
            if (params.pageSize) {
                this.pageInfo.pageSize = parseInt(params.pageSize, 10);
            }
            if (params.filters) {
                this.filters = JSON.parse(params.filters);
            }
        });
    }

    onPage(pageEvent: PageEvent) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                pageIndex: pageEvent.pageIndex,
                pageSize: pageEvent.pageSize,
            },
            queryParamsHandling: 'merge',
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
