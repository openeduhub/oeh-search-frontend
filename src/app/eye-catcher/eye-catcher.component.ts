import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EyeCatcherMode, ViewService } from '../view.service';

@Component({
    selector: 'app-eye-catcher',
    templateUrl: './eye-catcher.component.html',
    styleUrls: ['./eye-catcher.component.scss'],
})
export class EyeCatcherComponent implements OnInit {
    readonly wordpressUrl = environment.wordpressUrl;
    mode$: Observable<EyeCatcherMode>;

    constructor(private view: ViewService) {
        this.mode$ = view.getEyeCatcherMode();
    }

    ngOnInit(): void {}

    setMode(mode: EyeCatcherMode): void {
        this.view.setEyeCatcherMode(mode);
    }
}
