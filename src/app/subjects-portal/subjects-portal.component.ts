import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubjectPortalsQuery } from '../../generated/graphql';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit {
    discipline: string;
    educationalContext: string;
    results: SubjectPortalsQuery;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { results: SubjectPortalsQuery }) => {
            this.results = data.results;
        });
        this.route.paramMap.subscribe((paramMap) => {
            this.discipline = paramMap.get('discipline');
            this.educationalContext = paramMap.get('educationalContext');
        });
    }
}
