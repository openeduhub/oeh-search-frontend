import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ResultCardStyle = 'standard' | 'compact';

@Injectable({
    providedIn: 'root',
})
export class ViewService {
    private showFilterBarSubject: BehaviorSubject<boolean>;
    private resultCardStyleSubject: BehaviorSubject<ResultCardStyle>;

    constructor() {
        const isMobile = screen.width < 600 || screen.height < 600;
        // Persistent during session
        this.showFilterBarSubject = new BehaviorSubject(
            sessionStorage.getItem('showFilterBar') === 'true',
        );
        // Persistent
        this.resultCardStyleSubject = new BehaviorSubject(
            (localStorage.getItem('resultCardStyle') as ResultCardStyle) ||
                (isMobile ? 'compact' : 'standard'),
        );
    }

    getShowFilterBar(): Observable<boolean> {
        return this.showFilterBarSubject.asObservable();
    }

    toggleShowFilterBar() {
        this.setShowFilterBar(!this.showFilterBarSubject.value);
    }

    setShowFilterBar(value: boolean) {
        this.showFilterBarSubject.next(value);
        sessionStorage.setItem('showFilterBar', value.toString());
    }

    getResultCardStyle(): Observable<ResultCardStyle> {
        return this.resultCardStyleSubject.asObservable();
    }

    setResultCardStyle(value: ResultCardStyle) {
        this.resultCardStyleSubject.next(value);
        localStorage.setItem('resultCardStyle', value);
    }
}
