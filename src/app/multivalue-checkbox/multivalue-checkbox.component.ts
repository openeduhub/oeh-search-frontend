import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bucket } from '../../generated/graphql';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-multivalue-checkbox',
  templateUrl: './multivalue-checkbox.component.html',
  styleUrls: ['./multivalue-checkbox.component.scss'],
  providers: [
      {
          provide: NG_VALUE_ACCESSOR,
          multi: true,
          useExisting: forwardRef(() => MultivalueCheckboxComponent),
      }
  ]
})
export class MultivalueCheckboxComponent implements ControlValueAccessor {
    @Input() options: Bucket[];
    values: string[] = [];

    constructor() { }
    propagateChange = (_: any) => {};

    registerOnChange(fn: (_: any) => {}): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: (_: any) => {}): void {
    }

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
