import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    TopicsColumnBrowserComponent,
    TopicsTreeTableComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';
import { SharedModule } from '../../../shared/shared.module';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultTopicsTreeTableNodeId,
    defaultUserConfigurableNodeId,
    parentWidgetConfigNodeId,
    retrieveCustomUrl,
} from '../../custom-definitions';

@Component({
    standalone: true,
    imports: [
        AiTextWidgetComponent,
        CollectionChipsComponent,
        SharedModule,
        TopicsColumnBrowserComponent,
        TopicsTreeTableComponent,
        UserConfigurableComponent,
    ],
    selector: 'app-grid-widget',
    templateUrl: './grid-widget.component.html',
    styleUrl: './grid-widget.component.scss',
})
export class GridWidgetComponent {
    @Input() backgroundColor: string;
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

    readonly defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    readonly defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    readonly defaultTopicsTreeTableNodeId: string = defaultTopicsTreeTableNodeId;
    readonly defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;
    readonly parentWidgetConfigNodeId: string = parentWidgetConfigNodeId;

    constructor() {}

    retrieveCustomUrl: (node: Node) => string = retrieveCustomUrl;

    // TODO: argument type Node is not assignable to parameter type Node
    clickedItem(node: any): void {
        this.nodeClicked.emit(node as Node);
    }
}
