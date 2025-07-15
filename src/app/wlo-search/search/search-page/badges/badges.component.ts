import { Component, Input } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';

@Component({
    selector: 'app-badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss'],
    standalone: false,
})
export class BadgesComponent {
    @Input() hit: Node;
    @Input() orientation: 'horizontal' | 'vertical';

    constructor() {}
}
