import { Component, computed, Input, OnInit, Signal } from '@angular/core';
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
export class GridWidgetComponent implements OnInit {
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
    @Input() widgetConfigType: string;
    @Input() widgetNode: Node;
    @Input() widgetNodeId: string;
    @Input() widgetType: string;

    jobsContentConfig: Signal<string>;

    retrieveCustomUrl(node: Node) {
        const collectionId = node.properties?.['sys:node-uuid']?.[0];
        if (collectionId) {
            return window.location.origin + '/template?collectionId=' + collectionId;
        }
        return '';
    }

    get parsedWidgetNodeProperties() {
        const properties = this.widgetNode?.properties?.[this.widgetConfigType]?.[0];
        if (properties && JSON.parse(properties)) {
            return JSON.parse(properties);
        }
        return {};
    }

    get newestContentConfig() {
        return JSON.stringify({
            headline: 'Neueste Inhalte zum Thema ' + this.topic,
            layout: 'carousel',
            description: '',
            searchMode: this.parsedWidgetNodeProperties.searchMode ?? 'collection',
            chosenColor: this.backgroundColor,
            collectionId: this.topicCollectionID,
        });
    }

    ngOnInit() {
        this.jobsContentConfig = computed(() => {
            return JSON.stringify({
                headline: 'Das sind Berufe zum Thema ' + this.topic,
                layout: 'carousel',
                description: this.generatedJobText,
                searchMode: 'ngsearchword',
                chosenColor: this.backgroundColor,
                searchText: 'Berufe mit ' + this.topic,
            });
        });
    }
}
