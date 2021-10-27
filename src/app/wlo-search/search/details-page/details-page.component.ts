import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Node } from 'ngx-edu-sharing-api';

@Component({
    selector: 'app-details-page',
    templateUrl: './details-page.component.html',
    styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
    entry: Node;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { entry: Node }) => {
            this.entry = data.entry;
        });
    }
}
