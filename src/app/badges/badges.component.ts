import { Component, Input } from '@angular/core';
import { EditorialTag } from '../../generated/graphql';
import { Hit } from '../view.service';

@Component({
    selector: 'app-badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss'],
})
export class BadgesComponent {
    @Input() hit: Hit;
    @Input() orientation: 'horizontal' | 'vertical';

    readonly EditorialTag = EditorialTag;

    constructor() {}
}
