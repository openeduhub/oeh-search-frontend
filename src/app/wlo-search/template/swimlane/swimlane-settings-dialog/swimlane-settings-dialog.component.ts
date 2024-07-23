import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';
import { gridTypeOptions, typeOptions, widgetTypeOptions } from '../../grid-type-definitions';
import { GridTile } from '../grid-tile';
import { Swimlane } from '../swimlane';
import { SelectOption } from './select-option';
import { TileDimension } from './tile-dimension';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-swimlane-settings-dialog',
    templateUrl: './swimlane-settings-dialog.component.html',
    styleUrls: ['./swimlane-settings-dialog.component.scss'],
    standalone: true,
    imports: [FormsModule, MatDialogModule, ReactiveFormsModule, SharedModule],
})
export class SwimlaneSettingsDialogComponent implements OnInit {
    form: UntypedFormGroup;
    typeOptions: SelectOption[] = typeOptions;
    gridTypeOptions: SelectOption[] = gridTypeOptions;
    widgetTypeOptions: SelectOption[] = widgetTypeOptions;
    gridItems: GridTile[];
    tileDimensions: TileDimension[] = [
        new TileDimension(1, 1),
        new TileDimension(1, 2),
        new TileDimension(1, 3),
        new TileDimension(2, 1),
        new TileDimension(2, 2),
        new TileDimension(2, 3),
        new TileDimension(3, 1),
        new TileDimension(3, 2),
        new TileDimension(3, 3),
    ];

    constructor(@Inject(MAT_DIALOG_DATA) public data: Swimlane) {}

    ngOnInit() {
        this.form = new UntypedFormGroup({
            type: new UntypedFormControl(this.data.type),
            heading: new UntypedFormControl(this.data.heading),
            description: new UntypedFormControl(this.data.description),
            gridType: new UntypedFormControl(this.data.gridType),
            backgroundColor: new UntypedFormControl(
                this.initializeBackgroundColor(this.data.backgroundColor),
            ),
            grid: new UntypedFormControl(JSON.stringify(this.data.grid)),
        });
        // note: using a copy is essentially at the point to not overwrite the parent data
        this.gridItems = JSON.parse(JSON.stringify(this.data.grid));
    }

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
            // https://stackoverflow.com/a/35663683
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

    // https://stackoverflow.com/a/5624139
    componentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    rgbToHex(r: number, g: number, b: number) {
        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    addGridTile(widgetItemName: string) {
        const gridTile: GridTile = {
            uuid: uuidv4(),
            item: widgetItemName,
            rows: 1,
            cols: 3,
        };
        this.gridItems.push(gridTile);
        this.syncGridItemsWithFormData();
    }

    async moveGridTilePosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.gridItems.length - 1) {
            moveItemInArray(this.gridItems, oldIndex, newIndex);
            this.syncGridItemsWithFormData();
        }
    }

    removeGridTile(index: number) {
        if (confirm('Wollen Sie dieses Element wirklich löschen?') === true) {
            this.gridItems.splice(index, 1);
            this.syncGridItemsWithFormData();
        }
    }

    patchDimensions(index: number, rows: number, cols: number) {
        this.gridItems[index].rows = rows;
        this.gridItems[index].cols = cols;
        this.syncGridItemsWithFormData();
    }

    private syncGridItemsWithFormData() {
        this.form.get('grid').setValue(JSON.stringify(this.gridItems));
    }
}
