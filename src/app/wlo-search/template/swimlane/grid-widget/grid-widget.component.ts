import { Component, Input } from '@angular/core';
import {
    defaultAiTextWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultUserConfigurableNodeId,
    parentWidgetConfigNodeId,
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
    @Input() filterBarReady: boolean;
    @Input() gridIndex: number;
    @Input() pageVariantNode: Node;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() swimlaneIndex: number;
    @Input() topic: string;
    @Input() widgetClasses: string;
    @Input() widgetNodeId: string;
    @Input() widgetType: string;

    defaultAiTextWidgetNodeId: string = defaultAiTextWidgetNodeId;
    defaultCollectionChipsNodeId: string = defaultCollectionChipsNodeId;
    defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    defaultUserConfigurableNodeId: string = defaultUserConfigurableNodeId;
    parentWidgetConfigNodeId: string = parentWidgetConfigNodeId;

    constructor() {}

    retrieveCustomUrl(node: Node) {
        const collectionId = node.properties?.['sys:node-uuid']?.[0];
        if (collectionId) {
            // take into account potential sub-paths, e.g., due to language switch
            const pathNameArray: string[] = window.location.pathname.split('/');
            // example pathNameArray = [ "", "de", "template" ]
            const suffix: string =
                pathNameArray.length > 2 && pathNameArray[1] !== '' ? '/' + pathNameArray[1] : '';
            return window.location.origin + suffix + '/template?collectionId=' + collectionId;
        }
        return '';
    }

    // TODO: argument type Node is not assignable to parameter type Node
    clickedItem(node: any) {
        let clickableUrl: string = node.properties['ccm:wwwurl']?.[0];
        if (!clickableUrl) {
            clickableUrl = node.content.url;
        }
        if (clickableUrl) {
            window.open(clickableUrl, '_blank');
        }
    }
}
