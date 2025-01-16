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
import { swimlaneGridOptions, workspaceSpacesStorePrefix } from '../custom-definitions';
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SelectOption } from './swimlane-settings-dialog/select-option';

@Component({
    selector: 'app-swimlane',
    standalone: true,
    imports: [GridWidgetComponent, SharedModule],
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

    /**
     * Called by app-grid-widget widgetTypeUpdated output event.
     * Handles the update of the type of the grid tile of a given index.
     *
     * @param widgetType
     * @param gridTileIndex
     */
    updateWidgetType(widgetType: string, gridTileIndex: number): void {
        const gridCopy: GridTile[] = JSON.parse(JSON.stringify(this.grid));
        gridCopy[gridTileIndex].item = widgetType;
        this.gridUpdated.emit(gridCopy);
    }

    protected readonly swimlaneGridOptions: SelectOption[] = swimlaneGridOptions;
    protected readonly workspaceSpacesStorePrefix: string = workspaceSpacesStorePrefix;
}
