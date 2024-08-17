import { Component, Input } from '@angular/core';
import { MdsValue, MdsWidget, Node, NodeEntries } from 'ngx-edu-sharing-api';
import { SharedModule } from '../../shared/shared.module';
import { workspaceSpacesStorePrefix } from '../custom-definitions';
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';

@Component({
    imports: [GridWidgetComponent, SharedModule],
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

    @Input() editMode: boolean;
    @Input() filterBarReady: boolean;
    @Input() grid: GridTile[];
    @Input() gridType: string = 'smallGutter';
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() topicCollectionID: string;
    @Input() topicWidgets: NodeEntries;

    protected readonly workspaceSpacesStorePrefix = workspaceSpacesStorePrefix;
}
