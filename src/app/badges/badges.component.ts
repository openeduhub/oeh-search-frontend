import { Component, Input } from '@angular/core';
import { ResultNode } from '../edu-sharing/edu-sharing.service';

@Component({
    selector: 'app-badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss'],
})
export class BadgesComponent {
    @Input() hit: ResultNode;
    @Input() orientation: 'horizontal' | 'vertical';

    constructor() {}
}
