import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectDimension } from '../select-dimension';
import { SharedModule } from '../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';

@Component({
    imports: [SharedModule],
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss'],
    standalone: true,
})
export class FilterBarComponent implements OnInit {
    @Input() selectDimensions: Map<string, SelectDimension[]> = new Map<
        string,
        SelectDimension[]
    >();
    @Output() selectValuesChanged = new EventEmitter<SelectDimension[]>();

    form: FormGroup;
    selectDimensionsProcessed: boolean = false;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            dimensions: this.fb.array([]),
        });

        // listen for value changes in the form dimensions: https://stackoverflow.com/a/54205373
        // this fills the buffer with an initial value, and it will emit immediately on value change
        this.form
            .get('dimensions')
            .valueChanges.pipe(startWith(null as string), pairwise())
            .subscribe(([, next]: [any, any]) => {
                this.selectValuesChanged.emit(next);
            });

        this.setSelectFields();
    }

    /**
     * Return all available selection fields for the dimensions.
     */
    get dimensions(): FormArray {
        return this.form.get('dimensions') as FormArray;
    }

    /**
     * Return all available select dimensions that were input.
     */
    get availableSelectDimensionKeys(): string[] {
        return Array.from(this.selectDimensions.keys());
    }

    setSelectFields() {
        this.selectDimensionsProcessed = false;
        // reset the dimensions to be always up-to-date
        this.dimensions.clear();
        // create select fields for all available dimensions
        this.availableSelectDimensionKeys.forEach((dimensionKey) => {
            const firstSelectOptionId = this.selectDimensions.get(dimensionKey)?.[0]?.id ?? '';
            const item = this.fb.group({
                id: [firstSelectOptionId],
            });
            this.dimensions.push(item);
        });
        this.selectDimensionsProcessed = true;
    }
}
