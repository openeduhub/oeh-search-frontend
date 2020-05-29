import { Component, Input, OnInit } from '@angular/core';
import { CollapsibleComponent } from '../collapsible/collapsible.component';

@Component({
    selector: 'app-collapse-button',
    templateUrl: './collapse-button.component.html',
    styleUrls: ['./collapse-button.component.scss'],
})
export class CollapseButtonComponent implements OnInit {
    @Input() collapsible: CollapsibleComponent;

    constructor() {}

    ngOnInit(): void {}
}
