import { Component, Input, OnInit } from '@angular/core';
import { CollapsibleComponent } from '../collapsible/collapsible.component';

@Component({
    selector: 'app-expand-button',
    templateUrl: './expand-button.component.html',
    styleUrls: ['./expand-button.component.scss'],
})
export class ExpandButtonComponent implements OnInit {
    @Input() collapsible: CollapsibleComponent;

    constructor() {}

    ngOnInit(): void {}
}
