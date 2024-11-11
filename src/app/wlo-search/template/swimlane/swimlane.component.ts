import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MdsValue, MdsWidget, Node, NodeEntries } from 'ngx-edu-sharing-api';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../shared/shared.module';
import { widgetTypeOptions, workspaceSpacesStorePrefix } from '../custom-definitions';
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SelectOption } from './swimlane-settings-dialog/select-option';

@Component({
    imports: [GridWidgetComponent, EduSharingUiCommonModule, SharedModule],
    selector: 'app-swimlane',
    templateUrl: './swimlane.component.html',
    styleUrls: ['./swimlane.component.scss'],
    standalone: true,
})
export class SwimlaneComponent {
    // https://stackoverflow.com/a/56006046
    private _backgroundColor = '#f4f4f4';
    @Input() get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(value) {
        this._backgroundColor = value ?? '#f4f4f4';
    }

    @Input() contextNodeId: string;
    @Input() editMode: boolean;
    @Input() filterBarReady: boolean;
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

    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
    protected readonly workspaceSpacesStorePrefix: string = workspaceSpacesStorePrefix;
}
