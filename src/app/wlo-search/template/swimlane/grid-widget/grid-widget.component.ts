import { Component, Input } from '@angular/core';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultUserConfigurableNodeId,
    parentWidgetConfigNodeId,
} from '../../custom-definitions';
import { SharedModule } from '../../../shared/shared.module';
import { MdsValue, MdsWidget, Node } from 'ngx-edu-sharing-api';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    UserConfigurableComponent,
} from 'ngx-edu-sharing-wlo-pages';

@Component({
    selector: 'app-grid-widget',
    standalone: true,
    imports: [
        AiTextWidgetComponent,
        CollectionChipsComponent,
        UserConfigurableComponent,
        SharedModule,
    ],
    templateUrl: './grid-widget.component.html',
    styleUrl: './grid-widget.component.scss',
})
export class GridWidgetComponent {
    @Input() backgroundColor: string;
    @Input() editMode: boolean;
    @Input() filterBarReady: boolean;
    @Input() gridIndex: number;
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() topicCollectionID: string;
    @Input() widgetClasses: string;
    @Input() widgetNodeId: string;
    @Input() widgetType: string;

    defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;
    parentWidgetConfigNodeId: string = parentWidgetConfigNodeId;

    retrieveCustomUrl(node: Node) {
        const collectionId = node.properties?.['sys:node-uuid']?.[0];
        if (collectionId) {
            return window.location.origin + '/template?collectionId=' + collectionId;
        }
        return '';
    }
}
