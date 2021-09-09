import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultNode } from '../../core/edu-sharing.service';

@Component({
    selector: 'app-details-page',
    templateUrl: './details-page.component.html',
    styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
    entry: ResultNode;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { entry: ResultNode }) => {
            this.entry = data.entry;
        });
    }
}
