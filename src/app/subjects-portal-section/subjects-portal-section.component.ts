import { Component, Input, OnInit, Attribute } from '@angular/core';
import { Hits, MediaType } from '../search-resolver.service';
import { Filters } from '../search.service';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent implements OnInit {
    @Input() hits: Hits;
    @Input() filters: Filters;

    constructor(@Attribute('type') readonly type: MediaType) {}

    ngOnInit(): void {}
}
