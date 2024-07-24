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
import {
    currentlySupportedWidgetTypesWithConfig,
    gridTypeOptions,
    typeOptions,
    widgetConfigType,
    widgetConfigTypes,
    widgetTypeOptions,
} from '../../grid-type-definitions';
import { GridTile } from '../grid-tile';
import { WidgetConfig } from '../grid-widget/widget-config';
import { Swimlane } from '../swimlane';
import { SelectOption } from './select-option';
import { TileDimension } from './tile-dimension';
import { Node, NodeEntries } from 'ngx-edu-sharing-api';
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
    supportedWidgetTypesWithConfig: string[] = currentlySupportedWidgetTypesWithConfig;
    availableWidgetConfigTypes: Array<keyof WidgetConfig> = widgetConfigTypes;
    configHints: Map<string, string> = new Map<string, string>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { swimlane: Swimlane; widgets: NodeEntries },
    ) {}

    ngOnInit() {
        this.form = new UntypedFormGroup({
            type: new UntypedFormControl(this.data.swimlane.type),
            heading: new UntypedFormControl(this.data.swimlane.heading),
            description: new UntypedFormControl(this.data.swimlane.description),
            gridType: new UntypedFormControl(this.data.swimlane.gridType),
            backgroundColor: new UntypedFormControl(
                this.initializeBackgroundColor(this.data.swimlane.backgroundColor),
            ),
            grid: new UntypedFormControl(JSON.stringify(this.data.swimlane.grid)),
        });
        // note: using a copy is essentially at the point to not overwrite the parent data
        const dataGrid: GridTile[] = JSON.parse(JSON.stringify(this.data.swimlane.grid));
        // note: as we need a structure to work with, the idea is that we fill the dataGrid
        //       with the configs of the existing widget nodes and sync them on close with
        //       the widget nodes itself, while not keeping them on the main topic node config.
        this.data.widgets.nodes?.forEach((node: Node) => {
            const widgetConfig = node?.properties?.[widgetConfigType]?.[0];
            if (widgetConfig && JSON.parse(widgetConfig)?.config) {
                const relatedGridTile: GridTile =
                    dataGrid.find((gridTile: GridTile) => gridTile.uuid === node.ref.id) ?? null;
                if (relatedGridTile) {
                    relatedGridTile.config = JSON.parse(widgetConfig).config;
                }
            }
        });
        // iterate to set missing configs in the GridTiles
        dataGrid?.forEach((gridTile: GridTile) => {
            if (
                currentlySupportedWidgetTypesWithConfig.includes(gridTile.item) &&
                !gridTile.config
            ) {
                gridTile.config = {};
            }
        });
        this.gridItems = dataGrid;
        this.syncGridItemsWithFormData();
        this.configHints.set(
            'headline',
            'The headline of the content teaser, which is later extended by the topic name.',
        );
        this.configHints.set('layout', 'The layout of the content teaser, e.g., carousel');
        this.configHints.set('description', 'The description used by the content teaser.');
        this.configHints.set(
            'searchMode',
            'The search mode used by the content teaser, e.g, collection or ngsearchword.',
        );
        this.configHints.set(
            'searchText',
            'The search text used by the content teaser, which is later extended by the topic name.',
        );
        this.configHints.set(
            'chosenColor',
            'Optional background color used by the content teaser, which defaults to the swimlane background.',
        );
        this.configHints.set(
            'collectionId',
            'Optional collectionId used by the content teaser, which defaults to the collectionID of the page.',
        );
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
            config: {},
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

    setConfigValue(index: number, configItem: keyof WidgetConfig, configValue: any) {
        if (this.gridItems[index].config && this.availableWidgetConfigTypes.includes(configItem)) {
            // https://stackoverflow.com/a/69198602
            this.gridItems[index].config[configItem] = configValue;
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
