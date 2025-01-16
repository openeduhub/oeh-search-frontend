import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeService } from 'ngx-edu-sharing-api';
import { firstValueFrom } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import {
    swimlaneTypeOptions,
    widgetTypeOptions,
    workspaceSpacesStorePrefix,
} from '../../custom-definitions';
import { GridTile } from '../grid-tile';
import { Swimlane } from '../swimlane';
import { SelectOption } from './select-option';
import { TileDimension } from './tile-dimension';

@Component({
    selector: 'app-swimlane-settings-dialog',
    templateUrl: './swimlane-settings-dialog.component.html',
    styleUrls: ['./swimlane-settings-dialog.component.scss'],
    standalone: true,
    imports: [SharedModule],
})
export class SwimlaneSettingsDialogComponent implements OnInit {
    form: UntypedFormGroup;
    swimlaneTypeOptions: SelectOption[] = swimlaneTypeOptions;
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

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { swimlane: Swimlane },
        private nodeApi: NodeService,
    ) {}

    ngOnInit() {
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

    addGridTile(widgetItemName: string) {
        const gridTile: GridTile = {
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

    async removeGridTile(index: number) {
        // Only ask for elements with nodeId, as those will result in lost configs
        // use randomId assignment in order to track movements of elements
        if (
            !this.gridItems[index].nodeId ||
            confirm(
                'Wollen Sie dieses Element wirklich löschen? Damit geht die gespeicherte Konfiguration des Widgets verloren.',
            ) === true
        ) {
            if (this.gridItems[index].nodeId) {
                const nodeId: string = this.gridItems[index].nodeId.includes(
                    workspaceSpacesStorePrefix,
                )
                    ? this.gridItems[index].nodeId.split('/')?.[
                          this.gridItems[index].nodeId.split('/').length - 1
                      ]
                    : this.gridItems[index].nodeId;
                await firstValueFrom(this.nodeApi.deleteNode(nodeId));
            }
            this.gridItems.splice(index, 1);
            this.syncGridItemsWithFormData();
        }
    }

    setDimensions(index: number, rows: number, cols: number) {
        this.gridItems[index].rows = rows;
        this.gridItems[index].cols = cols;
        this.syncGridItemsWithFormData();
    }

    syncGridItemsWithFormData() {
        this.form.get('grid').setValue(JSON.stringify(this.gridItems));
    }
}
