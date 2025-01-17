import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';
import { swimlaneTypeOptions, widgetTypeOptions } from '../../custom-definitions';
import { ConfigureGridDialogComponent } from '../configure-grid-dialog/configure-grid-dialog.component';
import { GridTile } from '../grid-tile';
import { SelectOption } from './select-option';
import { SelectWidgetTypeDialogComponent } from '../select-widget-type-dialog/select-widget-type-dialog.component';
import { Swimlane } from '../swimlane';

@Component({
    selector: 'app-swimlane-settings-dialog',
    standalone: true,
    imports: [
        ConfigureGridDialogComponent,
        DragDropModule,
        SelectWidgetTypeDialogComponent,
        SharedModule,
    ],
    templateUrl: './swimlane-settings-dialog.component.html',
    styleUrls: ['./swimlane-settings-dialog.component.scss'],
})
export class SwimlaneSettingsDialogComponent implements OnInit {
    form: UntypedFormGroup;
    gridItems: GridTile[];
    widgetTypeToTextMap: Map<string, string> = new Map<string, string>();

    constructor(@Inject(MAT_DIALOG_DATA) public data: { swimlane: Swimlane }) {}

    ngOnInit(): void {
        this.form = new UntypedFormGroup({
            type: new UntypedFormControl(this.data.swimlane.type),
            heading: new UntypedFormControl(this.data.swimlane.heading),
            description: new UntypedFormControl(this.data.swimlane.description),
            backgroundColor: new UntypedFormControl(
                this.initializeBackgroundColor(this.data.swimlane.backgroundColor),
            ),
            grid: new UntypedFormControl(JSON.stringify(this.data.swimlane.grid ?? '[]')),
        });
        // note: using a copy is essentially at the point to not overwrite the parent data
        this.gridItems = JSON.parse(JSON.stringify(this.data.swimlane.grid ?? '[]'));
        this.syncGridItemsWithFormData();
        // store matching between widget type and its text
        this.widgetTypeOptions.forEach((option: SelectOption): void => {
            if (!this.widgetTypeToTextMap.get(option.value)) {
                this.widgetTypeToTextMap.set(option.value, option.viewValue);
            }
        });
    }

    /**
     * Ensure that a given colorString is converted into a valid hex string.
     *
     * @param colorString
     */
    private initializeBackgroundColor(colorString: string) {
        // TODO: Input default value based on theme type
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
    private componentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    private rgbToHex(r: number, g: number, b: number) {
        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    /**
     * Handles the drop event by moving a grid item from one to another position.
     *
     * @param event
     */
    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.gridItems, event.previousIndex, event.currentIndex);
        this.syncGridItemsWithFormData();
    }

    /**
     * Called by app-configure-grid-dialog and app-select-widget-type-dialog gridUpdated output event.
     * Updates the grid items and sync them with the form data.
     *
     * @param grid
     */
    updatedGrid(grid: GridTile[]): void {
        this.gridItems = grid;
        this.syncGridItemsWithFormData();
    }

    /**
     * Helper function to sync the grid items with the grid form data.
     */
    private syncGridItemsWithFormData(): void {
        this.form.get('grid').setValue(JSON.stringify(this.gridItems));
    }

    protected readonly swimlaneTypeOptions: SelectOption[] = swimlaneTypeOptions;
    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
}
