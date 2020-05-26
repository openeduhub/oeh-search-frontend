import { Component, OnInit, Input } from '@angular/core';
import { Hits } from '../subjects-portal-resolver.service';

@Component({
    selector: 'app-subjects-portal-section',
    templateUrl: './subjects-portal-section.component.html',
    styleUrls: ['./subjects-portal-section.component.scss'],
})
export class SubjectsPortalSectionComponent implements OnInit {
    @Input() title: string;
    @Input() hits: Hits['hits'];

    constructor() {}

    ngOnInit(): void {}
}
