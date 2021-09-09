import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dummy',
    templateUrl: './dummy.component.html',
    styleUrls: ['./dummy.component.scss'],
})
export class DummyComponent implements OnInit {
    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.http.get('/assets/dummy.json').subscribe(() => console.log('get dummy.json'));
    }
}
