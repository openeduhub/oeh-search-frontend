import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { SharedModule } from '../../shared/shared.module';
import { MdsWidget } from 'ngx-edu-sharing-api';

@Component({
    selector: 'app-page-structure-dialog',
    imports: [SharedModule, MatStepperModule],
    templateUrl: 'configure-page-variant-dialog.component.html',
    styleUrls: ['configure-page-variant-dialog.component.scss'],
})
export class ConfigurePageVariantDialogComponent implements OnInit {
    form: UntypedFormGroup;
    readonly i18nPrefix: string = 'TOPIC_PAGE.CONFIG_PAGE_VARIANT.';
    isOptionSelected: boolean = false;
    parameters: { [key: string]: string } = {};
    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    subscriptionActive: boolean = false;
    @ViewChild('stepper') stepper!: MatStepper;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            parameters: { [key: string]: string };
            selectDimensions: Map<string, MdsWidget>;
            subscriptionActive: boolean;
            title: string;
        },
        public dialogRef: MatDialogRef<ConfigurePageVariantDialogComponent>,
    ) {
        this.parameters = data.parameters;
        this.selectDimensions = data.selectDimensions;
        this.subscriptionActive = data.subscriptionActive;
    }

    /**
     * Initializes the dialog by defining the form based on the data input.
     */
    ngOnInit(): void {
        const formControls: { [key: string]: UntypedFormControl } = {
            title: new UntypedFormControl(this.data.title),
        };

        if (this.data.selectDimensions) {
            this.data.selectDimensions.forEach((widget: MdsWidget, key: string) => {
                if (widget.values && widget.values.length > 0) {
                    const matchingParameter = this.parameters[key];
                    let defaultValue = '';
                    if (matchingParameter) {
                        defaultValue = matchingParameter;
                    }
                    formControls[key] = new UntypedFormControl(defaultValue);
                }
            });
        }

        this.form = new UntypedFormGroup(formControls);
    }

    /**
     * Reacts to the selection of an option in the first step of the dialog.
     *
     * @param option
     */
    selectOption(option: 'editor' | 'form'): void {
        if (option === 'editor') {
            this.dialogRef.close({ mode: 'editor' });
        } else {
            this.isOptionSelected = true;
            // switch to the next step
            setTimeout(() => {
                this.stepper.next();
                this.isOptionSelected = false;
            });
        }
    }

    /**
     * Submits the form by closing the dialog with the mode and value of the form.
     */
    onSubmit() {
        this.dialogRef.close({ mode: 'form', value: this.form.value });
    }
}
