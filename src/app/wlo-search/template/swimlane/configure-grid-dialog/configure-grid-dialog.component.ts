import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../../shared/shared.module';
import { swimlaneGridOptions } from '../../custom-definitions';
import { GridTile } from '../grid-tile';
import { SelectOption } from '../swimlane-settings-dialog/select-option';

@Component({
    selector: 'app-configure-grid-dialog',
    standalone: true,
    imports: [EduSharingUiCommonModule, SharedModule],
    templateUrl: './configure-grid-dialog.component.html',
    styleUrls: ['./configure-grid-dialog.component.scss'],
})
export class ConfigureGridDialogComponent {
    @Input() grid: GridTile[] = [];
    @Output() gridUpdated: EventEmitter<GridTile[]> = new EventEmitter<GridTile[]>();

    /**
     * Configures the swimlane grid based a selected grid option value.
     *
     * @param gridOptionValue
     */
    configureSwimlaneGrid(gridOptionValue: string): void {
        // return, if grid already defined
        if (this.grid.length > 0) {
            return;
        }
        // add tiles depending on the grid option value
        // note: we use a 6 column grid in order to display all possible options
        switch (gridOptionValue) {
            case 'one_column':
                this.gridUpdated.emit([new GridTile(6, 1)]);
                break;
            case 'two_columns':
                this.gridUpdated.emit([new GridTile(3, 1), new GridTile(3, 1)]);
                break;
            case 'three_columns':
                this.gridUpdated.emit([new GridTile(2, 1), new GridTile(2, 1), new GridTile(2, 1)]);
                break;
            case 'left_side_panel':
                this.gridUpdated.emit([new GridTile(2, 1), new GridTile(4, 1)]);
                break;
            case 'right_side_panel':
                this.gridUpdated.emit([new GridTile(4, 1), new GridTile(2, 1)]);
                break;
            default:
                this.gridUpdated.emit([new GridTile(6, 1)]);
        }
    }

    protected readonly swimlaneGridOptions: SelectOption[] = swimlaneGridOptions;
}
