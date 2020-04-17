import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Result } from 'shared/types';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
    details: Result;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { details: Result }) => (this.details = data.details));
    }
}
