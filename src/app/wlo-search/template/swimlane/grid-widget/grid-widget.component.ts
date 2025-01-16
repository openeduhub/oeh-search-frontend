import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    TopicsColumnBrowserComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';
import { SharedModule } from '../../../shared/shared.module';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultUserConfigurableNodeId,
    parentWidgetConfigNodeId,
    retrieveCustomUrl,
    widgetTypeOptions,
} from '../../custom-definitions';
import { SelectOption } from '../swimlane-settings-dialog/select-option';

@Component({
    selector: 'app-grid-widget',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AiTextWidgetComponent,
        CollectionChipsComponent,
        SharedModule,
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
    @Output() widgetTypeUpdated: EventEmitter<string> = new EventEmitter<string>();

    readonly defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    readonly defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    readonly defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;
    readonly parentWidgetConfigNodeId: string = parentWidgetConfigNodeId;

    constructor() {}

    /**
     * Selects a widget type for the grid tile by emitting an update.
     *
     * @param widgetItemName
     */
    selectWidgetType(widgetItemName: string): void {
        this.widgetTypeUpdated.emit(widgetItemName);
    }

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

    protected readonly widgetTypeOptions: SelectOption[] = widgetTypeOptions;
}
