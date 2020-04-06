import { Component, OnInit } from '@angular/core';
import { SearchService, Result } from '../search.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
    result: Result;

    constructor(activatedRoute: ActivatedRoute, search: SearchService) {
        activatedRoute.params
            .pipe(switchMap((params) => search.getDetails(params.id)))
            .subscribe((result) => (this.result = result));
    }

    ngOnInit(): void {}
}
