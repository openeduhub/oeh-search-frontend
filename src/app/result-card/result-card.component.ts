import { Component, Input, OnInit } from '@angular/core';
import { ResultFragment } from '../../generated/graphql';
import { Filters, SearchService } from '../search.service';
import { Unpacked } from '../utils';

type Hits = ResultFragment['hits']['hits'];
type Hit = Unpacked<Hits>;

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {
    @Input() result: Hit;
    @Input() filters: Filters;

    thumbnail: string;

    constructor(private search: SearchService) {}

    ngOnInit(): void {
        this.loadLargeThumbnail();
    }

    private loadLargeThumbnail() {
        if (this.result.thumbnail) {
            this.thumbnail = this.result.thumbnail.small;
            this.search.getLargeThumbnail(this.result.id).subscribe((largeThumbnail) => {
                this.thumbnail = largeThumbnail;
            });
        }
    }
}
