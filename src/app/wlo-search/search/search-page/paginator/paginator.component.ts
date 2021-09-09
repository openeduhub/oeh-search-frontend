import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchParametersService } from '../../../core/search-parameters.service';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, OnChanges {
    @Input() length: number;

    pageIndex: number;
    pageSize: number;
    totalPages: number;
    beforePages: number[];
    afterPages: number[];
    showGoToFirst: boolean;

    constructor(private route: ActivatedRoute, private searchParameters: SearchParametersService) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((queryParamMap) => {
            const { pageIndex, pageSize } =
                this.searchParameters.parseSearchQueryParams(queryParamMap);
            this.pageIndex = pageIndex;
            this.pageSize = pageSize;
            this.update();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    private update() {
        this.totalPages = Math.ceil(this.length / this.pageSize);
        this.beforePages = range(Math.max(0, this.pageIndex - 2), this.pageIndex);
        this.afterPages = range(this.pageIndex + 1, Math.min(this.totalPages, this.pageIndex + 3));
    }
}

function range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
