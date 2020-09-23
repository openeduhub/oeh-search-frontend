import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Experiments, ViewService } from '../view.service';

@Component({
    selector: 'app-experiments-toggles',
    templateUrl: './experiments-toggles.component.html',
    styleUrls: ['./experiments-toggles.component.scss'],
})
export class ExperimentsTogglesComponent implements OnInit {
    experiments$: Observable<Experiments>;

    constructor(private view: ViewService) {
        this.experiments$ = view.getExperiments();
    }

    ngOnInit(): void {}

    getType(value: any): string {
        return typeof value;
    }

    setValue(key: string, value: any): void;
    setValue(key: keyof Experiments, value: Experiments[typeof key]): void {
        this.view.setExperiment(key, value);
    }
}
