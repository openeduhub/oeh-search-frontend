import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ViewService {
    private showFilterBarSubject = new BehaviorSubject(false);

    constructor() {}

    getShowFilterBar(): Observable<boolean> {
        return this.showFilterBarSubject.asObservable();
    }

    toggleShowFilterBar() {
        this.showFilterBarSubject.next(!this.showFilterBarSubject.value);
    }
}
