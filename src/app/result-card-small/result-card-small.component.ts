import { Component, OnInit, Input } from '@angular/core';
import { ResultFragment } from '../../generated/graphql';
import { Unpacked } from '../utils';

type Hits = ResultFragment['hits']['hits'];
type Hit = Unpacked<Hits>;

@Component({
    selector: 'app-result-card-small',
    templateUrl: './result-card-small.component.html',
    styleUrls: ['./result-card-small.component.scss'],
})
export class ResultCardSmallComponent implements OnInit {
    @Input() hit: Hit;

    constructor() {}

    ngOnInit(): void {}
}
