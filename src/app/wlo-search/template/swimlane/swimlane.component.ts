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
import { StatisticNode } from 'ngx-edu-sharing-wlo-pages';
import { SharedModule } from '../../shared/shared.module';
import { widgetTypeOptions, workspaceSpacesStorePrefix } from '../shared/custom-definitions';
import { GridSearchCount } from '../shared/types/grid-search-count';
import { GridTileToStatisticsMapping } from '../shared/types/grid-tile-to-statistics-mapping';
import { GridTile } from '../shared/types/grid-tile';
import { SelectOption } from '../shared/types/select-option';
import { ConfigureGridDialogComponent } from './configure-grid-dialog/configure-grid-dialog.component';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SelectWidgetTypeDialogComponent } from './select-widget-type-dialog/select-widget-type-dialog.component';

@Component({
    selector: 'app-swimlane',
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
    @Output() nodeStatisticsChanged: EventEmitter<GridTileToStatisticsMapping> =
        new EventEmitter<GridTileToStatisticsMapping>();
    @Output() totalSearchResultCountChanged: EventEmitter<GridSearchCount> =
        new EventEmitter<GridSearchCount>();

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
     * Called by app-grid-widget nodeStatisticsChanged output event.
     * Emits the statistics.
     *
     * @param statistics
     * @param gridIndex
     */
    changeNodeStatistics(statistics: StatisticNode[], gridIndex: number): void {
        this.nodeStatisticsChanged.emit({ statistics, gridIndex });
    }

    /**
     * Called by app-grid-widget totalSearchResultCountChanged output event.
     * Emits the count.
     *
     * @param count
     * @param gridIndex
     */
    changeTotalSearchResultCount(count: number, gridIndex: number): void {
        this.totalSearchResultCountChanged.emit({ count, gridIndex });
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
