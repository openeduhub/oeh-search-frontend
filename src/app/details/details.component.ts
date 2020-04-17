import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Result } from 'shared/types';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {

    groups = ['discipline', 'educationalContext', 'learningResourceType', 'keywords']

    details: Result;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { details: Result }) => (this.details = data.details));
    }
    getGroupData(group): string[] {
        if(group === 'keywords') {
            return this.details.lom.general.keyword;
        }
        return this.details?.valuespaces[group]?.map((data) => data.de);
    }
    openSource(): void {
        window.location.href = this.details.lom.technical.location;
    }
}
