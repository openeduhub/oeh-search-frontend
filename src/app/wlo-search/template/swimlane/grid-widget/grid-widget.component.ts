import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    MediaRenderingComponent,
    TextWidgetComponent,
    TopicsColumnBrowserComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';
import { SharedModule } from '../../../shared/shared.module';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultMediaRenderingNodeId,
    defaultTextWidgetNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultUserConfigurableNodeId,
    retrieveCustomUrl,
} from '../../shared/custom-definitions';

@Component({
    selector: 'app-grid-widget',
    standalone: true,
    imports: [
        SharedModule,
        AiTextWidgetComponent,
        CollectionChipsComponent,
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
    @Output() totalSearchResultCountChanged: EventEmitter<number> = new EventEmitter<number>();

    readonly defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    readonly defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    readonly defaultMediaRenderingNodeId: string = defaultMediaRenderingNodeId;
    readonly defaultTextWidgetNodeId: string = defaultTextWidgetNodeId;
    readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    readonly defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;

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
}
