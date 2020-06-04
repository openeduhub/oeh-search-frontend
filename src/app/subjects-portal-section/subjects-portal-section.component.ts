import { Component, Input, OnInit } from '@angular/core';
import { Hits } from '../search-resolver.service';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent implements OnInit {
    @Input() sectionTitle: string;
    @Input() hits: Hits['hits'];

    constructor() {}

    ngOnInit(): void {}
}
