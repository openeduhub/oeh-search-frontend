import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultUserConfigurableNodeId,
    parentWidgetConfigNodeId,
    retrieveCustomUrl,
} from '../../custom-definitions';
import { SharedModule } from '../../../shared/shared.module';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    TopicsColumnBrowserComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';

@Component({
    selector: 'app-grid-widget',
    standalone: true,
    imports: [
        AiTextWidgetComponent,
        CollectionChipsComponent,
        TopicsColumnBrowserComponent,
        UserConfigurableComponent,
        SharedModule,
    ],
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

    defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;
    parentWidgetConfigNodeId: string = parentWidgetConfigNodeId;

    constructor() {}

    retrieveCustomUrl: (node: Node) => string = retrieveCustomUrl;

    // TODO: argument type Node is not assignable to parameter type Node
    clickedItem(node: any): void {
        this.nodeClicked.emit(node as Node);
    }
}
