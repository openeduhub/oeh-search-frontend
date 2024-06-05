import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkDragHandle, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgForOf, NgIf } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    OnInit,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { ActivatedRoute } from '@angular/router';
import { ColumnGridComponent } from './column-grid/column-grid.component';
import { ColumnSettingsDialogComponent } from './column-settings-dialog/column-settings-dialog.component';
import { GridColumn } from './grid-column';
import { typeOptions } from './grid-type-definitions';
import { gridColumns } from './initial-values';
import { SharedModule } from '../shared/shared.module';
import { Node, NodeService } from 'ngx-edu-sharing-api';
import { AiTextPromptsService } from 'ngx-z-api';
import { filter } from 'rxjs/operators';

@Component({
    standalone: true,
    imports: [
        CdkAccordionModule,
        CdkDragHandle,
        DragDropModule,
        MatGridListModule,
        MatIconModule,
        NgForOf,
        SharedModule,
        TemplateComponent,
        MatIconModule,
        MatLegacyButtonModule,
        ColumnGridComponent,
        NgIf,
        MatIconModule,
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private aiTextPromptsService: AiTextPromptsService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private nodeApi: NodeService,
    ) {}
    @HostBinding('style.--topic-color') topicColor: string = '#182e5c';

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);
    generatedHeader: WritableSignal<string> = signal('');
    generatedJobText: WritableSignal<string> = signal('');
    // TODO: this is basically a workaround for widget components not updating when getting new
    //  config overrides for now; remove once they're able to do that
    jobsWidgetReady = true;

    gridColumns: GridColumn[] = [];

    editMode: boolean = false;
    myNode: Node;

    typeOptions = typeOptions.concat([{ value: 'spacer', viewValue: 'Trennlinie' }]);

    ngOnInit(): void {
        // set the topic based on the query params "topic" and "collectionID"
        this.route.queryParams
            .pipe(filter((params) => params.topic || params.collectionId))
            .subscribe((params) => {
                if (params.topic) {
                    this.topic.set(params.topic);
                    // set the background to some random (but deterministic) color, just for visuals
                    this.topicColor = this.stringToColour(this.topic());
                }
                if (params.collectionId) {
                    this.topicCollectionID.set(params.collectionId);
                    // fetch the collection name
                    this.nodeApi.getNode(params.collectionId).subscribe((node: Node) => {
                        this.myNode = node;
                        this.topic.set(node.title);
                        // set the background to some random (but deterministic) color, just for visuals
                        this.topicColor = this.stringToColour(this.topic());
                    });
                }

                this.generateFromPrompt();
            });

        if (this.gridColumns?.length === 0) {
            this.gridColumns = gridColumns;
        }
    }

    moveColumnPosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.gridColumns.length - 1) {
            moveItemInArray(this.gridColumns, oldIndex, newIndex);
        }
    }

    addColumn(type: string) {
        const newColumn: GridColumn = {
            uuid: crypto.randomUUID(),
            type,
        };
        if (type !== 'spacer') {
            newColumn.heading = 'Eine beispielhafte Überschrift';
            newColumn.grid = [];
        }
        this.gridColumns.push(newColumn);
    }

    editColumn(column: GridColumn, index: number) {
        const dialogRef = this.dialog.open(ColumnSettingsDialogComponent, {
            data: column,
        });

        // TODO: fix error when closing (ERROR TypeError: Cannot set properties of null (setting '_closeInteractionType'))
        // seems to be a known issue as of May 2023: https://stackoverflow.com/a/76273326/3623608
        dialogRef.afterClosed().subscribe((result) => {
            if (result.status === 'VALID') {
                const editedColumn = result.value;
                // TODO: Due to textual conversion, the grid must currently be parsed
                if (editedColumn.grid) {
                    editedColumn.grid = JSON.parse(editedColumn.grid);
                }
                this.gridColumns[index] = { ...column, ...editedColumn };
            }
            console.log('Closed', result);
        });
    }

    deleteColumn(index: number) {
        if (
            this.gridColumns?.[index] &&
            confirm('Wollen Sie dieses Element wirklich löschen?') === true
        ) {
            this.gridColumns.splice(index, 1);
        }
    }

    /** calls the Z-API to invoke ChatGPT */
    private generateFromPrompt() {
        this.aiTextPromptsService
            .publicPrompt({
                widgetNodeId: 'c937cabf-5ffd-47f0-a5e8-ef0ed370baf0',
                contextNodeId: this.topicCollectionID(),
            })
            .subscribe((result: any) => {
                const response = result.responses[0];
                console.log('RESPONSE: ', response);
                this.generatedHeader.set(response);
            });
        this.aiTextPromptsService
            .publicPrompt({
                widgetNodeId: 'a625a9d6-383d-4835-84f2-a8e2792ea13f',
                contextNodeId: this.topicCollectionID(),
            })
            .subscribe((result: any) => {
                const response = result.responses[0];
                console.log('RESPONSE 2: ', response);
                this.generatedJobText.set(response);
                // FIXME: the following is just a trick to re-instantiate the widgets for them to
                //  change to new override-configs
                this.jobsWidgetReady = false;
                setTimeout(() => {
                    this.jobsWidgetReady = true;
                    console.log('READY!');
                }, 2); // DEBUG
            });
    }

    // https://stackoverflow.com/a/16348977
    stringToColour(str: string) {
        let hash = 0;
        str.split('').forEach((char) => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash);
        });
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            colour += value.toString(16).padStart(2, '0');
        }
        return colour;
    }
}
