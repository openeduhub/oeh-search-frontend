import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, OnChanges {
    @Input() length: number;
    @Input() pageIndex: number;
    @Input() pageSize: number;
    @Output() page = new EventEmitter<PageEvent>();

    totalPages: number;
    beforePages: number[];
    afterPages: number[];
    showGoToFirst: boolean;

    constructor() {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        this.totalPages = Math.ceil(this.length / this.pageSize);
        this.beforePages = range(Math.max(0, this.pageIndex - 2), this.pageIndex);
        this.afterPages = range(this.pageIndex + 1, Math.min(this.totalPages, this.pageIndex + 3));
        this.showGoToFirst = this.pageIndex > 0 && this.beforePages[0] > 0;
    }

    goToPage(index: number) {
        this.page.emit({
            pageIndex: index,
            previousPageIndex: this.pageIndex,
            pageSize: this.pageSize,
            length: this.length,
        });
    }
}

function range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
