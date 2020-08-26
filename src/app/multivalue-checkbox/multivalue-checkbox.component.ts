import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Bucket, Type } from '../../generated/graphql';

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
    @Input() buckets: Bucket[];
    @Input() showCount = true;
    @Input() columns = 1;
    values: string[] = [];
    readonly Type = Type;

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
