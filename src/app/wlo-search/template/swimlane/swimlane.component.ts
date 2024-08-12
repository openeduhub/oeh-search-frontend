import { Component, Input } from '@angular/core';
import { MdsValue, MdsWidget, Node, NodeEntries } from 'ngx-edu-sharing-api';
import { GridTile } from './grid-tile';
import { GridWidgetComponent } from './grid-widget/grid-widget.component';
import { SharedModule } from '../../shared/shared.module';

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
    @Input() generatedJobText: string;
    @Input() grid: GridTile[];
    @Input() gridType: string = 'smallGutter';
    @Input() jobsWidgetReady: boolean;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() topic: string;
    @Input() topicCollectionID: string;
    @Input() topicWidgets: NodeEntries;

    get topicWidgetIdMap(): Map<string, Node> {
        const widgetMap = new Map<string, Node>();
        this.topicWidgets.nodes?.forEach((node: Node) => {
            widgetMap.set(node.ref.id, node);
        });
        return widgetMap;
    }
}
