import { Component, Input, OnInit, Attribute } from '@angular/core';
import { Hits } from '../search-resolver.service';
import { Filters } from '../search.service';
import { Facet, Type } from '../../generated/graphql';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent implements OnInit {
    readonly Type = Type;
    readonly Facet = Facet;

    @Input() hits: Hits;
    @Input() filters: Filters;

    constructor(@Attribute('type') readonly type: Type) {}

    ngOnInit(): void {}
}
