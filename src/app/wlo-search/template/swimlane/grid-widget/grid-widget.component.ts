import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    IframeWidgetComponent,
    MediaRenderingComponent,
    TextWidgetComponent,
    StatisticNode,
    TopicsColumnBrowserComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';
import { SharedModule } from '../../../shared/shared.module';
import { retrieveCustomUrl } from '../../shared/custom-definitions';

@Component({
    selector: 'app-grid-widget',
    imports: [
        SharedModule,
        AiTextWidgetComponent,
        CollectionChipsComponent,
        IframeWidgetComponent,
        MediaRenderingComponent,
        TextWidgetComponent,
        TopicsColumnBrowserComponent,
        UserConfigurableComponent,
    ],
    templateUrl: './grid-widget.component.html',
    styleUrl: './grid-widget.component.scss',
})
export class GridWidgetComponent {
    @Input() backgroundColor?: string;
    @Input() contextNodeId: string;
    @Input() editMode: boolean;
    @Input() gridIndex: number;
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() widgetClasses: string;
    @Input() widgetNodeId: string;
    @Input() widgetType: string;
    @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() nodeStatisticsChanged: EventEmitter<StatisticNode[]> = new EventEmitter<
        StatisticNode[]
    >();
    @Output() totalSearchResultCountChanged: EventEmitter<number> = new EventEmitter<number>();

    constructor() {}

    /**
     * Pass through custom retrieveCustomUrl function to be input to the widgets.
     *
     * @param node
     */
    retrieveCustomUrl: (node: Node) => string = retrieveCustomUrl;

    /**
     * Called by wlo-user-configurable itemClickedEvent output event.
     * Emits the click event.
     * TODO: argument type Node is not assignable to parameter type Node
     *
     * @param node
     */
    clickedItem(node: any): void {
        this.nodeClicked.emit(node as Node);
    }

    /**
     * Called by wlo-user-configurable totalSearchResultCountChanged output event.
     * Emits the count.
     *
     * @param count
     */
    changeTotalSearchResultCount(count: number): void {
        this.totalSearchResultCountChanged.emit(count);
    }

    /**
     * Called by wlo-media-rendering and wlo-user-configurable nodeStatisticsChanged output event.
     * Emits the statistics.
     *
     * @param statistics
     */
    changeNodeStatistics(statistics: StatisticNode[]): void {
        this.nodeStatisticsChanged.emit(statistics);
    }
}
