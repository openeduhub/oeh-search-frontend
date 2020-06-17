import { Component, Input, OnInit } from '@angular/core';
import { Hit } from '../result-card/result-card.component';
import { Filters, SearchService } from '../search.service';

@Component({
    selector: 'app-result-card-content-standard',
    templateUrl: './result-card-content-standard.component.html',
    styleUrls: ['./result-card-content-standard.component.scss'],
})
export class ResultCardContentStandardComponent implements OnInit {
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
