import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import { MdsValue, MdsWidget, Node, NodeEntries } from 'ngx-edu-sharing-api';
import { SharedModule } from '../../shared/shared.module';
import { widgetTypeOptions, workspaceSpacesStorePrefix } from '../custom-definitions';
import { ConfigureGridDialogComponent } from './configure-grid-dialog/configure-grid-dialog.component';
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SelectWidgetTypeDialogComponent } from './select-widget-type-dialog/select-widget-type-dialog.component';
import { SelectOption } from './swimlane-settings-dialog/select-option';

@Component({
    selector: 'app-swimlane',
    standalone: true,
    imports: [
        ConfigureGridDialogComponent,
        GridWidgetComponent,
        SelectWidgetTypeDialogComponent,
        SharedModule,
    ],
    templateUrl: './swimlane.component.html',
    styleUrls: ['./swimlane.component.scss'],
})
export class SwimlaneComponent implements AfterViewChecked {
    @Input() backgroundColor?: string;
    @Input() contextNodeId: string;
    @Input() editMode: boolean;
    @Input() grid: GridTile[] = [];
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() topicWidgets: NodeEntries;
    @Output() gridUpdated: EventEmitter<GridTile[]> = new EventEmitter<GridTile[]>();
    @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();

    swimlaneColor: string;

    constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef) {}

    /**
     * After the view was checked, retrieve the swimlane color from the computed styles
     */
    ngAfterViewChecked(): void {
        const swimlaneParent = this.elementRef.nativeElement?.offsetParent;
        if (
            swimlaneParent &&
            getComputedStyle(swimlaneParent).getPropertyValue('background-color') &&
            !this.swimlaneColor
        ) {
            this.swimlaneColor =
                getComputedStyle(swimlaneParent).getPropertyValue('background-color');
            // it seems like the change detection is not happening automatically
            // related issue: https://stackoverflow.com/a/45300527
            this.cdr.detectChanges();
        }
    }

    /**
     * Called by app-grid-widget nodeClicked output event.
     * Emits the click event.
     *
     * @param node
     */
    clickedNode(node: Node): void {
        this.nodeClicked.emit(node);
    }

    /**
     * Called by app-configure-grid-dialog and app-select-widget-type-dialog gridUpdated output event.
     * Emits the updated grid.
     *
     * @param grid
     */
    updatedGrid(grid: GridTile[]): void {
        this.gridUpdated.emit(grid);
    }

    protected readonly supportedWidgetTypes: string[] = widgetTypeOptions.map(
        (option: SelectOption) => option.value,
    );
    protected readonly workspaceSpacesStorePrefix: string = workspaceSpacesStorePrefix;
}
