import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
    name: string;
    error: Error;
    json: string;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const error = JSON.parse(params.error);
            this.error = error;
            this.json = JSON.stringify(error, null, 4);
            this.name = params.name;
        });
    }
}
