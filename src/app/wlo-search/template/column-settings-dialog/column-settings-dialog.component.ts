import { Component, Inject } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { GridColumn } from '../grid-column';
import { gridTypeOptions, typeOptions } from '../grid-type-definitions';

@Component({
    selector: 'app-column-settings-dialog',
    templateUrl: './column-settings-dialog.component.html',
    styleUrls: ['./column-settings-dialog.component.scss'],
    standalone: true,
    imports: [FormsModule, MatDialogModule, ReactiveFormsModule, SharedModule],
})
export class ColumnSettingsDialogComponent {
    form = new UntypedFormGroup({
        type: new UntypedFormControl(this.data.type),
        heading: new UntypedFormControl(this.data.heading),
        description: new UntypedFormControl(this.data.description),
        gridType: new UntypedFormControl(this.data.gridType),
        backgroundColor: new UntypedFormControl(
            this.initializeBackgroundColor(this.data.backgroundColor),
        ),
        grid: new UntypedFormControl(JSON.stringify(this.data.grid)),
    });
    typeOptions = typeOptions;
    gridTypeOptions = gridTypeOptions;

    constructor(@Inject(MAT_DIALOG_DATA) public data: GridColumn) {}

    /**
     * Ensure that a given colorString is converted into a valid hex string.
     *
     * @param colorString
     */
    initializeBackgroundColor(colorString: string) {
        if (!colorString || colorString === '') {
            return '#f4f4f4';
        }
        if (colorString.includes('rgb')) {
            // https://stackoverflow.com/a/35663683/3623608
            const values = colorString
                .replace(/rgba?\(/, '')
                .replace(/rgb?\(/, '')
                .replace(/\)/, '')
                .replace(/[\s+]/g, '')
                .split(',');
            if (values.length > 2) {
                return this.rgbToHex(parseInt(values[0]), parseInt(values[1]), parseInt(values[2]));
            }
        }
        return colorString;
    }

    // https://stackoverflow.com/a/5624139/3623608
    componentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    rgbToHex(r: number, g: number, b: number) {
        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
}
