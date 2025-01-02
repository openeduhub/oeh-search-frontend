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
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SelectOption } from './swimlane-settings-dialog/select-option';

@Component({
    imports: [GridWidgetComponent, SharedModule],
    selector: 'app-swimlane',
    templateUrl: './swimlane.component.html',
    styleUrls: ['./swimlane.component.scss'],
    standalone: true,
})
export class SwimlaneComponent implements AfterViewChecked {
    @Input() backgroundColor?: string;
    @Input() contextNodeId: string;
    @Input() editMode: boolean;
    @Input() grid: GridTile[] = [];
    @Input() gridType: string = 'smallGutter';
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() topicWidgets: NodeEntries;
    @Output() gridTileAdded: EventEmitter<GridTile> = new EventEmitter<GridTile>();
    @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();

    swimlaneColor: string;

    constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef) {}

    clickedNode(node: Node): void {
        this.nodeClicked.emit(node);
    }

    addGridTile(widgetItemName: string): void {
        const gridTile: GridTile = {
            item: widgetItemName,
            rows: 1,
            cols: 3,
        };
        this.gridTileAdded.emit(gridTile);
    }

    ngAfterViewChecked(): void {
        const swimlaneParent = this.elementRef.nativeElement?.offsetParent;
        if (
            swimlaneParent &&
            getComputedStyle(swimlaneParent).getPropertyValue('background-color')
        ) {
            this.swimlaneColor =
                getComputedStyle(swimlaneParent).getPropertyValue('background-color');
        }
        // it seems like the change detection is not happening automatically
        // related issue: https://stackoverflow.com/a/45300527
        this.cdr.detectChanges();
    }

    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
    protected readonly workspaceSpacesStorePrefix: string = workspaceSpacesStorePrefix;
}
