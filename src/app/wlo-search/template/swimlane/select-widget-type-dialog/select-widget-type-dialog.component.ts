import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../../shared/shared.module';
import { widgetTypeOptions } from '../../shared/custom-definitions';
import { GridTile } from '../../shared/types/grid-tile';
import { SelectOption } from '../../shared/types/select-option';

@Component({
    selector: 'app-select-widget-type-dialog',
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
     * @param tileIndex
     */
    selectWidgetType(widgetType: string, tileIndex: number): void {
        // change copy of grid to avoid overwriting input
        const gridCopy: GridTile[] = JSON.parse(JSON.stringify(this.grid));
        const gridTile: GridTile = gridCopy[tileIndex];
        const changeType = (): void => {
            if (!!gridTile.nodeId) {
                delete gridTile.nodeId;
            }
            gridTile.item = widgetType;
        };
        // nodeId does already exist, confirm overwrite
        if (!!gridTile.nodeId) {
            if (
                confirm(
                    'Wollen Sie wirklich ein bereits konfiguriertes Widget austauschen? Die Konfiguration dieses Widgets geht dabei verloren.',
                )
            ) {
                changeType();
            }
        } else {
            changeType();
        }
        this.gridUpdated.emit(gridCopy);
    }

    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
}
