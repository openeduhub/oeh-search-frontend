import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../../shared/shared.module';
import { swimlaneGridOptions } from '../../shared/custom-definitions';
import { GridTile } from '../../shared/types/grid-tile';
import { SelectOption } from '../../shared/types/select-option';

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
        // if grid is already defined, a reconfiguration is necessary
        if (this.grid.length > 0) {
            this.reconfigureSwimlaneGrid(gridOptionValue);
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

    /**
     * Reconfigures the swimlane grid based on a selected grid option value.
     *
     * @param gridOptionValue
     */
    reconfigureSwimlaneGrid(gridOptionValue: string): void {
        // set the new grid length
        let newGridLength: number = 1;
        if (['two_columns', 'left_side_panel', 'right_side_panel'].includes(gridOptionValue)) {
            newGridLength = 2;
        } else if (gridOptionValue === 'three_columns') {
            newGridLength = 3;
        }
        // change copy of grid to avoid overwriting input
        let gridCopy: GridTile[] = JSON.parse(JSON.stringify(this.grid));
        // helper function to change the grid based on a given input
        const changeGrid = (
            firstCols: number,
            firstRows: number,
            secondCols?: number,
            secondRows?: number,
            thirdCols?: number,
            thirdRows?: number,
        ): void => {
            gridCopy[0].cols = firstCols;
            gridCopy[0].rows = firstRows;
            if (newGridLength > 1) {
                if (gridCopy.length === 1) {
                    gridCopy.push(new GridTile(secondCols, secondRows));
                } else {
                    gridCopy[1].cols = secondCols;
                    gridCopy[1].rows = secondRows;
                }
                if (newGridLength > 2) {
                    if (gridCopy.length === 2) {
                        gridCopy.push(new GridTile(thirdCols, thirdRows));
                    } else {
                        gridCopy[2].cols = thirdCols;
                        gridCopy[2].rows = thirdRows;
                    }
                }
            }
            if (gridCopy.length > newGridLength) {
                gridCopy = gridCopy.slice(0, newGridLength);
            }
        };
        // adjust the grid based on the selected grid option value
        const adjustGrid = (): void => {
            switch (gridOptionValue) {
                case 'one_column':
                    changeGrid(6, 1);
                    break;
                case 'two_columns':
                    changeGrid(3, 1, 3, 1);
                    break;
                case 'three_columns':
                    changeGrid(2, 1, 2, 1, 2, 1);
                    break;
                case 'left_side_panel':
                    changeGrid(2, 1, 4, 1);
                    break;
                case 'right_side_panel':
                    changeGrid(4, 1, 2, 1);
                    break;
                default:
                    changeGrid(6, 1);
            }
        };
        // check, whether the length of the grid decreases
        let warningConfirmNecessary: boolean = false;
        let dangerConfirmNecessary: boolean = false;
        if (newGridLength < gridCopy.length) {
            gridCopy.forEach((gridTile: GridTile, index: number): void => {
                // check, whether items on removed positions exist
                if (index >= newGridLength && gridTile.item) {
                    // check, whether those items additionally have a nodeId defined
                    if (!!gridTile.nodeId) {
                        dangerConfirmNecessary = true;
                    } else {
                        warningConfirmNecessary = true;
                    }
                }
            });
        }
        // depending on the type of action, display different warnings
        if (
            dangerConfirmNecessary &&
            confirm(
                'Mit dieser Anpassung löschen Sie ein bereits konfiguriertes Widget. Sind Sie sicher, dass Sie fortfahren wollen?',
            )
        ) {
            adjustGrid();
        }
        if (
            !dangerConfirmNecessary &&
            warningConfirmNecessary &&
            confirm(
                'Ein oder mehrere hinzugefügte, aber noch nicht konfigurierte Widgets gehen durch diese Anpassung verloren. Sind Sie sicher, dass Sie fortfahren wollen?',
            )
        ) {
            adjustGrid();
        }
        if (!dangerConfirmNecessary && !warningConfirmNecessary) {
            adjustGrid();
        }
        // emit the changes
        this.gridUpdated.emit(gridCopy);
    }

    protected readonly swimlaneGridOptions: SelectOption[] = swimlaneGridOptions;
}
