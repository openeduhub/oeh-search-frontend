import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubjectsPortalResults } from '../subjects-portal-resolver.service';

@Component({
    selector: 'app-subjects-portal',
    templateUrl: './subjects-portal.component.html',
    styleUrls: ['./subjects-portal.component.scss'],
})
export class SubjectsPortalComponent implements OnInit {
    discipline: string;
    educationalContext: string;
    results: SubjectsPortalResults;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data: { subjectsPortalResults: SubjectsPortalResults }) => {
            this.results = data.subjectsPortalResults;
        });
        this.route.paramMap.subscribe((paramMap) => {
            this.discipline = paramMap.get('discipline');
            this.educationalContext = paramMap.get('educationalContext');
        });
    }
}
