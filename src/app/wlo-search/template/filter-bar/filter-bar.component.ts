import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MdsValue, MdsWidget } from 'ngx-edu-sharing-api';
import { firstValueFrom } from 'rxjs';
import { pairwise, startWith } from 'rxjs/operators';

@Component({
    imports: [SharedModule],
    selector: 'app-filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss'],
    standalone: true,
})
export class FilterBarComponent implements OnInit {
    private _requestInProgress: boolean;
    @Input() set requestInProgress(value: boolean) {
        this._requestInProgress = value;
        if (!this.form) {
            return;
        }
        if (value) {
            this.form.disable();
        } else {
            this.form.enable();
        }
    }
    get requestInProgress(): boolean {
        return this._requestInProgress;
    }
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Output() selectValuesChanged = new EventEmitter<MdsValue[]>();

    form: FormGroup;
    selectDimensionsProcessed: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {}

    async ngOnInit() {
        this.form = this.fb.group({
            dimensions: this.fb.array([]),
        });

        // create the select fields
        await this.setSelectFields();

        // listen for value changes in the form dimensions: https://stackoverflow.com/a/54205373
        // this fills the buffer with an initial value, and it will emit immediately on value change
        this.form
            .get('dimensions')
            .valueChanges.pipe(startWith(null as string), pairwise())
            .subscribe(([, next]: [any, any]) => {
                // set the selected values into the query parameters:
                // https://stackoverflow.com/a/43706998
                const queryParams: Params = {};
                next?.forEach((selection: any, index: number) => {
                    const mdsWidgetId = this.filteredMdsWidgetIds[index];
                    if (mdsWidgetId) {
                        queryParams[mdsWidgetId] = selection.id;
                    }
                });
                void this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                    queryParams,
                    queryParamsHandling: 'merge',
                });
                this.selectValuesChanged.emit(next);
            });
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

    /**
     * Return a list of reduced / filtered mds widget IDs.
     */
    get filteredMdsWidgetIds(): string[] {
        return this.availableSelectDimensionKeys.map(
            (k) => this.selectDimensions.get(k).id?.split('virtual:')?.[1] ?? '',
        );
    }

    /**
     * Create the select fields based on the query parameters.
     */
    async setSelectFields() {
        this.selectDimensionsProcessed = false;
        // reset the dimensions to be always up-to-date
        this.dimensions.clear();
        // create select fields for all available dimensions
        // set the selections based on the query parameters
        await firstValueFrom(this.activatedRoute.queryParams).then((params) => {
            const paramKeys = Object.keys(params);
            const queryParamsToAdd: Params = {};
            this.filteredMdsWidgetIds.forEach((widgetId) => {
                if (paramKeys.includes(widgetId)) {
                    const item = this.fb.group({
                        id: [params[widgetId]],
                    });
                    this.dimensions.push(item);
                } else {
                    const firstSelectOptionId =
                        this.selectDimensions.get('$virtual:' + widgetId + '$')?.values?.[0]?.id ??
                        '';
                    const item = this.fb.group({
                        id: [firstSelectOptionId],
                    });
                    this.dimensions.push(item);
                    queryParamsToAdd[widgetId] = firstSelectOptionId;
                }
            });
            // add missing query parameters
            if (Object.keys(queryParamsToAdd).length > 0) {
                void this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                    queryParams: queryParamsToAdd,
                    queryParamsHandling: 'merge',
                });
            }
            this.selectValuesChanged.emit(this.dimensions.value);
            this.selectDimensionsProcessed = true;
        });
    }
}
