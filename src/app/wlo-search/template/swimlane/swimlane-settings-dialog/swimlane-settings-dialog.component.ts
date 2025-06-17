import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';
import { swimlaneTypeOptions, widgetTypeOptions } from '../../shared/custom-definitions';
import { GridTile } from '../../shared/types/grid-tile';
import { SelectOption } from '../../shared/types/select-option';
import { Swimlane } from '../../shared/types/swimlane';
import { ConfigureGridDialogComponent } from '../configure-grid-dialog/configure-grid-dialog.component';
import { SelectWidgetTypeDialogComponent } from '../select-widget-type-dialog/select-widget-type-dialog.component';

@Component({
    selector: 'app-swimlane-settings-dialog',
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
     * Removes a grid tile at a given index.
     *
     * @tileIndex
     */
    removeGridTile(tileIndex: number): void {
        const gridTile: GridTile = this.gridItems[tileIndex];
        const removeGridTile = (): void => {
            this.gridItems.splice(tileIndex, 1);
            // adjust grid accordingly
            // possible cases:
            // * 3 -> 2 (cols: 3)
            // * 2 -> 1 (cols: 6)
            this.gridItems?.forEach((tile: GridTile): void => {
                if (this.gridItems.length === 2) {
                    tile.cols = 3;
                } else {
                    tile.cols = 6;
                }
            });
            this.syncGridItemsWithFormData();
        };
        if (!!gridTile.nodeId) {
            if (
                confirm(
                    'Wollen Sie wirklich ein bereits konfiguriertes Widget löschen? Die Konfiguration dieses Widgets geht dabei verloren.',
                )
            ) {
                removeGridTile();
            }
        } else {
            removeGridTile();
        }
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
