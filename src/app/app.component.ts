import { Component, DoCheck, NgZone } from '@angular/core';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { TranslationsService } from 'ngx-edu-sharing-ui';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements DoCheck {
    private static readonly CHECKS_PER_SECOND_WARNING_THRESHOLD = 0;
    private static readonly CONSECUTIVE_TRANSGRESSION_THRESHOLD = 10;

    private numberOfChecks = 0;
    private consecutiveTransgression = 0;
    private checksMonitorInterval: number;

    constructor(
        private materialCssVarsService: MaterialCssVarsService,
        private ngZone: NgZone,
        private translationsService: TranslationsService,
    ) {
        this.ngZone.runOutsideAngular(() => {
            this.checksMonitorInterval = window.setInterval(() => this.monitorChecks(), 1000);
        });
        // initialize the translationsService
        this.translationsService.initialize().subscribe(() => {});
        // initialize the materialCssVarsService
        this.materialCssVarsService.setPrimaryColor('#003b7c');
        this.materialCssVarsService.setAccentColor('#003b7c');
        // this.materialCssVarsService.setDarkTheme(true);
        // this.themeService.setColor(Variable.Primary, '#003b7c');
        // this.themeService.setColor(Variable.Accent, '#e4f700');
    }

    ngDoCheck(): void {
        this.numberOfChecks++;
    }

    private monitorChecks(): void {
        // console.log('Change detections run in the past second:', this.numberOfChecks);
        if (this.numberOfChecks > AppComponent.CHECKS_PER_SECOND_WARNING_THRESHOLD) {
            this.consecutiveTransgression++;
            if (this.consecutiveTransgression >= AppComponent.CONSECUTIVE_TRANSGRESSION_THRESHOLD) {
                console.warn(
                    'Change detection triggered more than ' +
                        AppComponent.CHECKS_PER_SECOND_WARNING_THRESHOLD +
                        ' times per second for the past ' +
                        AppComponent.CONSECUTIVE_TRANSGRESSION_THRESHOLD +
                        ' seconds consecutively.' +
                        ' Not showing any more warnings.',
                );
                window.clearInterval(this.checksMonitorInterval);
            }
        } else {
            this.consecutiveTransgression = 0;
        }
        this.numberOfChecks = 0;
    }
}
