import { Component, computed, Input, signal, Signal, WritableSignal } from '@angular/core';
import { widgetConfigType } from '../../custom-definitions';
import { SharedModule } from '../../../shared/shared.module';
import { WidgetConfig } from './widget-config';
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
    @Input() generatedJobText: string;
    @Input() jobsWidgetReady: boolean;
    @Input() selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    @Input() selectedDimensionValues: MdsValue[] = [];
    @Input() topic: string;
    @Input() topicCollectionID: string;
    @Input() widgetClasses: string;
    // https://stackoverflow.com/a/56006046
    private _widgetNode: Node;
    @Input() get widgetNode(): Node {
        return this._widgetNode;
    }

    set widgetNode(value: Node) {
        this._widgetNode = value;
        this.setContentConfig(value);
    }

    @Input() widgetNodeId: string;
    @Input() widgetType: string;

    contentConfig: WritableSignal<WidgetConfig> = signal({});
    contentConfigAsString: Signal<string> = computed(() => {
        return JSON.stringify(this.contentConfig());
    });

    setContentConfig(widgetNode: Node) {
        const widgetConfig = widgetNode?.properties?.[widgetConfigType]?.[0];
        if (widgetConfig && JSON.parse(widgetConfig)?.config) {
            const contentConfig: WidgetConfig = JSON.parse(widgetConfig).config;
            // extend config by default values
            if (!contentConfig.chosenColor || contentConfig.chosenColor === '') {
                contentConfig.chosenColor = this.backgroundColor;
            }
            if (!contentConfig.collectionId || contentConfig.collectionId === '') {
                contentConfig.collectionId = this.topicCollectionID;
            }
            this.contentConfig.set(contentConfig);
        }
    }

    retrieveCustomUrl(node: Node) {
        const collectionId = node.properties?.['sys:node-uuid']?.[0];
        if (collectionId) {
            return window.location.origin + '/template?collectionId=' + collectionId;
        }
        return '';
    }
}
