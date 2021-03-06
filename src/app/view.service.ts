import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ResultCardStyle = 'standard' | 'compact';

class AvailableExperiments {
    newSearchField = true;
}

export type Experiments = Partial<AvailableExperiments>;

@Injectable({
    providedIn: 'root',
})
export class ViewService {
    private showFilterBarSubject: BehaviorSubject<boolean>;
    private resultCardStyleSubject: BehaviorSubject<ResultCardStyle>;
    private experimentsSubject: BehaviorSubject<Experiments>;

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
        this.experimentsSubject = new BehaviorSubject({
            ...new AvailableExperiments(),
            ...((localStorage.getItem('experiments') &&
                (JSON.parse(localStorage.getItem('experiments')) as Experiments)) ||
                {}),
        });
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

    getExperiment(
        key: keyof AvailableExperiments,
    ): Observable<AvailableExperiments[typeof key] | undefined> {
        return this.experimentsSubject.pipe(map((experiments) => experiments[key]));
    }

    getExperiments(): Observable<Experiments> {
        return this.experimentsSubject.asObservable();
    }

    setExperiment(key: keyof AvailableExperiments, value: AvailableExperiments[typeof key]): void {
        const experiments = this.experimentsSubject.value;
        experiments[key] = value;
        this.experimentsSubject.next(experiments);
        localStorage.setItem('experiments', JSON.stringify(experiments));
    }
}
