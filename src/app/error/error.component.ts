import { Component, OnInit } from '@angular/core';
import { NavigationError } from '@angular/router';
import { ErrorService } from '../error.service';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
    error: NavigationError;
    json: string;

    constructor(private errorService: ErrorService) {}

    ngOnInit(): void {
        this.error = this.errorService.getError();
        this.json = JSON.stringify(this.error, null, 4);
    }
}
