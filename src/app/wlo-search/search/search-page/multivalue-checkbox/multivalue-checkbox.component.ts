import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import { FacetValue } from 'ngx-edu-sharing-api';

@Component({
    selector: 'app-multivalue-checkbox',
    templateUrl: './multivalue-checkbox.component.html',
    styleUrls: ['./multivalue-checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => MultivalueCheckboxComponent),
        },
    ],
})
export class MultivalueCheckboxComponent implements ControlValueAccessor {
    @Input() buckets: FacetValue[];
    @Input() showCount = true;
    @Input() columns = 1;
    values: string[] = [];

    constructor() {}

    propagateChange = (_: any) => {};

    registerOnChange(fn: (_: any) => {}): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: (_: any) => {}): void {}

    writeValue(obj: any): void {
        this.values = obj || [];
    }

    toggleValue(key: string, value: MatCheckboxChange) {
        if (value.checked) {
            this.values.push(key);
        } else {
            this.values.splice(this.values.indexOf(key), 1);
        }
        this.propagateChange(this.values);
    }
}
