import {
    CdkDragEnter,
    CdkDragHandle,
    CdkDropList,
    DragDropModule,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { CustomizationDialogComponent } from './customization-dialog/customization-dialog.component';
import { CustomTile } from './custom-tile';
import { SharedModule } from '../shared/shared.module';
import { TemplateComponent } from '../template/template.component';
import * as uuid from 'uuid';

@Component({
    selector: 'app-customizable-dashboard',
    templateUrl: './customizable-dashboard.component.html',
    styleUrls: ['./customizable-dashboard.component.scss'],
    standalone: true,
    imports: [CdkDragHandle, DragDropModule, MatGridListModule, SharedModule, TemplateComponent],
})
export class CustomizableDashboardComponent implements AfterViewInit, OnInit {
    tiles: CustomTile[] = [];
    // drag & drop snippet found here: https://stackblitz.com/edit/drag-drop-dashboard-97r6zb
    drops: CdkDropList[];
    @ViewChildren(CdkDropList) dropsQuery: QueryList<CdkDropList>;

    constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog) {}

    ngAfterViewInit() {
        this.dropsQuery.changes.subscribe(() => {
            this.drops = this.dropsQuery.toArray();
            // manually trigger change detection: https://stackoverflow.com/a/35243106/3623608
            this.cdr.detectChanges();
        });
        Promise.resolve().then(() => {
            this.drops = this.dropsQuery.toArray();
        });
    }

    ngOnInit() {
        this.addComponent();
    }

    addComponent() {
        this.tiles.push({
            uuid: uuid.v4(),
            cols: 1,
            rows: 1,
            topic: this.getRandomTopic(),
        });
    }

    configureComponent(tile: CustomTile, index: number) {
        const dialogRef = this.dialog.open(CustomizationDialogComponent, {
            data: {
                count: this.tiles.length,
                currentIndex: index,
                currentCols: tile.cols,
                currentRows: tile.rows,
                title: tile.topic,
            },
        });

        // TODO: fix error when closing (ERROR TypeError: Cannot set properties of null (setting '_closeInteractionType'))
        // seems to be a known issue as of May 2023: https://stackoverflow.com/a/76273326/3623608
        dialogRef.afterClosed().subscribe((result) => {
            // set specified cols and rows
            const invalidRowsNumber = result.value.rows < 1 || result.value.rows > 3;
            const invalidColsNumber = result.value.cols < 1 || result.value.cols > 3;
            if (invalidRowsNumber || invalidColsNumber) {
                return;
            }
            tile.cols = result.value.cols;
            tile.rows = result.value.rows;
            // move element to potentially changed position
            // -1 is necessary to convert the user understandable index back into the normal index
            const newTileIndex: number =
                result.value.position - 1 >= 0 ? result.value.position - 1 : 0;
            const oldTileIndex: number = this.tiles.indexOf(
                this.tiles.find((t) => t.uuid === tile.uuid),
            );
            // check, whether a move action is necessary
            if (newTileIndex !== oldTileIndex && newTileIndex < this.tiles.length) {
                // util function from @angular/cdk/drag-drop: https://github.com/angular/components/blob/main/src/cdk/drag-drop/drag-utils.ts#L15
                moveItemInArray(this.tiles, oldTileIndex, newTileIndex);
            }
        });
    }

    getRandomTopic() {
        const items: string[] = [
            'Biologie',
            'Chemie',
            'Deutsch',
            'Englisch',
            'Französisch',
            'Geografie',
            'Mathematik',
            'Physik',
            'Religion',
            'Sport',
        ];
        return items[Math.floor(Math.random() * items.length)];
    }

    entered($event: CdkDragEnter) {
        moveItemInArray(this.tiles, $event.item.data, $event.container.data);
    }
}
