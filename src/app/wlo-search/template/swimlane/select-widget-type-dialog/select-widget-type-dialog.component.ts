import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../../shared/shared.module';
import { widgetTypeOptions } from '../../custom-definitions';
import { GridTile } from '../grid-tile';
import { SelectOption } from '../swimlane-settings-dialog/select-option';

@Component({
    selector: 'app-select-widget-type-dialog',
    standalone: true,
    imports: [EduSharingUiCommonModule, SharedModule],
    templateUrl: './select-widget-type-dialog.component.html',
    styleUrls: ['./select-widget-type-dialog.component.scss'],
})
export class SelectWidgetTypeDialogComponent {
    @Input() grid: GridTile[] = [];
    @Input() tileIndex: number;
    @Output() gridUpdated: EventEmitter<GridTile[]> = new EventEmitter<GridTile[]>();

    /**
     * Selects the widget type for a grid tile at a given index.
     *
     * @param widgetType
     * @param gridTileIndex
     */
    selectWidgetType(widgetType: string, gridTileIndex: number): void {
        const gridCopy: GridTile[] = JSON.parse(JSON.stringify(this.grid));
        gridCopy[gridTileIndex].item = widgetType;
        this.gridUpdated.emit(gridCopy);
    }

    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
}
