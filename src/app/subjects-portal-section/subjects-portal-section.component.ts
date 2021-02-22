import { Attribute, Component, Input } from '@angular/core';
import { Facet, Type } from '../../generated/graphql';
import { Hits } from '../search-resolver.service';
import { Filters } from '../search.service';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent {
    readonly Type = Type;
    readonly Facet = Facet;

    @Input() hits: Hits;
    @Input() filters: Filters;

    constructor(@Attribute('type') readonly type: Type) {}
}
