import { Component, OnInit } from '@angular/core';
import { NavigationError } from '@angular/router';
import { ErrorService } from './error.service';

@Component({
    selector: 'app-error',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss'],
    standalone: false,
})
export class ErrorPageComponent implements OnInit {
    error: NavigationError;
    json: string;
    pageUrl: string;

    constructor(private errorService: ErrorService) {}

    ngOnInit(): void {
        this.error = this.errorService.getError();
        this.json = JSON.stringify(this.error, null, 4);
        this.pageUrl = window.location.href;
    }
}
