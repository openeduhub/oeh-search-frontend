import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkDragHandle, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgForOf, NgIf } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    OnInit,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { SwimlaneComponent } from './swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './swimlane-settings-dialog/swimlane-settings-dialog.component';
import { Swimlane } from './swimlane';
import { GridTile } from './grid-tile';
import { typeOptions } from './grid-type-definitions';
import { swimlanes } from './initial-values';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { SharedModule } from '../shared/shared.module';
import {
    ApiRequestConfiguration,
    AuthenticationService,
    MdsService,
    MdsValue,
    MdsWidget,
    Node,
    NodeEntries,
    NodeService,
} from 'ngx-edu-sharing-api';
import { AiTextPromptsService } from 'ngx-edu-sharing-z-api';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
    standalone: true,
    imports: [
        CdkAccordionModule,
        CdkDragHandle,
        DragDropModule,
        FilterBarComponent,
        MatGridListModule,
        MatIconModule,
        NgForOf,
        SharedModule,
        TemplateComponent,
        MatButtonModule,
        SwimlaneComponent,
        NgIf,
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private aiTextPromptsService: AiTextPromptsService,
        private authService: AuthenticationService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private mdsService: MdsService,
        private nodeApi: NodeService,
        private apiRequestConfig: ApiRequestConfiguration,
    ) {}
    @HostBinding('style.--topic-color') topicColor: string = '#182e5c';

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);
    generatedHeader: WritableSignal<string> = signal('');
    generatedJobText: WritableSignal<string> = signal('');
    jobsWidgetReady = false;

    swimlanes: Swimlane[] = [];
    editMode: boolean = false;

    private initialized: boolean = false;
    private currentlySupportedWidgetTypes = [
        'wlo-ai-text-widget',
        'wlo-collection-chips',
        'wlo-user-configurable',
    ];
    private parentWidgetConfigNodeId: string = '80bb0eab-d64f-466b-94c6-2eccc4045c6b';
    private mapType: string = 'ccm:map';
    private ioType: string = 'ccm:io';
    private collectionPrefix: string = 'COLLECTION_';
    topicConfigNode: Node;
    private widgetConfigAspect: string = 'ccm:widget';
    widgetConfigType: string = 'ccm:widget_config';
    collectionNode: Node;
    topicWidgets: NodeEntries;

    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    providedSelectDimensionKeys = [
        'virtual:ai_text_widget_intendedenduserrole',
        'virtual:ai_text_widget_target_language',
    ];
    selectedDimensionValues: MdsValue[] = [];
    selectDimensionsLoaded: boolean = false;

    typeOptions = typeOptions.concat([{ value: 'spacer', viewValue: 'Trennlinie' }]);

    ngOnInit(): void {
        this.apiRequestConfig.setLocale('de_DE');
        // set the topic based on the query params "topic" and "collectionID"
        this.route.queryParams
            .pipe(filter((params) => params.topic || params.collectionId))
            .subscribe(async (params) => {
                if (params.topic) {
                    this.topic.set(params.topic);
                    // set the background to some random (but deterministic) color, just for visuals
                    this.topicColor = this.stringToColour(this.topic());
                }
                if (params.collectionId && !this.initialized) {
                    this.topicCollectionID.set(params.collectionId);
                    this.initialized = true;
                    // fetch the collection name
                    await firstValueFrom(this.nodeApi.getNode(params.collectionId)).then(
                        (node: Node) => {
                            this.collectionNode = node;
                            this.topic.set(node.title);
                            // set the background to some random (but deterministic) color, just for visuals
                            this.topicColor = this.stringToColour(this.topic());
                        },
                    );

                    // retrieve children of widget config node and filter it by the collection ID
                    const nodeEntries: NodeEntries = await this.getNodeChildren(
                        this.parentWidgetConfigNodeId,
                    );
                    this.topicConfigNode = nodeEntries.nodes.find(
                        (node: Node) =>
                            node.type === this.mapType &&
                            node.name === this.collectionPrefix + params.collectionId,
                    );

                    // topic node does not exist
                    // -> (1) create node for topic
                    // -> (2) load template
                    // -> (3) generate children nodes for topic node
                    // -> (4) set config to nodes from template (TODO)
                    // -> (5) store config of existing children in topic node
                    if (!this.topicConfigNode) {
                        // (1) create node for topic as child of the widget config node
                        this.topicConfigNode = await this.createChild(
                            this.parentWidgetConfigNodeId,
                            this.mapType,
                            this.collectionPrefix + params.collectionId,
                        );
                        if (this.topicConfigNode) {
                            // TODO: This is currently necessary to set the correct permissions of the node
                            await this.setPermissions(this.topicConfigNode.ref.id);
                            // (2) load template (swimlanes)
                            // (3) generate children nodes for topic node
                            // forEach does not support async / await
                            // -> for ... of ... (https://stackoverflow.com/a/37576787)
                            for (const swimlane of swimlanes) {
                                if (swimlane.grid?.length > 0) {
                                    for (const widget of swimlane.grid) {
                                        if (
                                            this.currentlySupportedWidgetTypes.includes(widget.item)
                                        ) {
                                            // create child and add its ID as UUID to the swimlanes
                                            const childNode: Node = await this.createChild(
                                                this.topicConfigNode.ref.id,
                                                this.ioType,
                                                'WIDGET_' + uuidv4(),
                                            );
                                            // (4) (set properties on children)
                                            const nodeId = childNode.ref.id;
                                            const propertyValue = { searchMode: 'ngsearchword' };
                                            await this.setProperty(
                                                nodeId,
                                                JSON.stringify(propertyValue),
                                            );
                                            // (5a) store UUID in the config (swimlanes)
                                            widget.uuid = nodeId;
                                        }
                                    }
                                }
                            }
                            // (5b) store adjusted config (swimlanes) with correct UUIDs
                            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                                this.topicConfigNode.ref.id,
                                JSON.stringify(swimlanes),
                            );
                        }
                    }
                    // retrieve the list of stored widget nodes
                    this.topicWidgets = await this.getNodeChildren(this.topicConfigNode.ref.id);
                    // note: only the grid items of the swimlane should be represented as separate widget nodes
                    const existingSwimlanesString =
                        this.topicConfigNode.properties[this.widgetConfigType]?.[0] ?? '';
                    this.swimlanes = existingSwimlanesString
                        ? JSON.parse(existingSwimlanesString)
                        : [];
                    // sync both existing children (topicWidgets) and topic config (swimlanes)
                    await this.syncSwimlanes();
                }

                this.generateFromPrompt();
            });

        const username = environment?.eduSharingUsername;
        const password = environment?.eduSharingPassword;
        // TODO: This fix for local development currently only works in Firefox
        if (username && password) {
            this.authService.login(username, password).subscribe((data) => {
                console.log('login success', data);
                this.retrieveSelectDimensions();
            });
        } else {
            this.retrieveSelectDimensions();
        }

        if (this.swimlanes?.length === 0) {
            this.swimlanes = swimlanes;
        }
    }

    get filterBarReady() {
        const sameNumberOfValues =
            this.selectDimensions.size === this.selectedDimensionValues.length;
        return this.selectDimensionsLoaded && sameNumberOfValues;
    }

    get topicWidgetsIds(): string[] {
        return this.topicWidgets?.nodes?.map((node) => node.ref.id) ?? [];
    }

    async createChild(parentId: string, type: string, name: string): Promise<Node> {
        // const widgetConfigType = this.widgetConfigType;
        return await firstValueFrom(
            this.nodeApi.createChild({
                repository: '-home-',
                node: parentId,
                type,
                aspects: [this.widgetConfigAspect],
                body: {
                    'cm:name': [name],
                    // TODO: Setting this on creation does not yet work
                    'ccm:widget_config': [JSON.stringify(swimlanes)],
                },
            }),
        );
    }

    async setPermissions(nodeId: string): Promise<void> {
        return await firstValueFrom(
            this.nodeApi.setPermissions(nodeId, {
                inherited: true,
                permissions: [
                    {
                        authority: {
                            properties: null,
                            editable: false,
                            authorityName: 'GROUP_EVERYONE',
                            authorityType: 'EVERYONE',
                        },
                        permissions: ['Consumer', 'CCPublish'],
                    },
                ],
            }),
        );
    }

    async getNodeChildren(nodeId: string): Promise<NodeEntries> {
        // TODO: We could also use pagination here, if these number of items is getting too large
        return firstValueFrom(this.nodeApi.getChildren(nodeId, { maxItems: 500 }));
    }

    /**
     * Filter out grid items not yet persisted and store updated config in node.
     */
    private async syncSwimlanes() {
        let updateNecessary: boolean = false;
        this.swimlanes.forEach((swimlane: Swimlane) => {
            swimlane.grid?.forEach((widget: GridTile, index: number, object: GridTile[]) => {
                const idNecessary = this.currentlySupportedWidgetTypes.includes(widget.item);
                // ID necessary, but not included -> remove from config
                if (idNecessary && !this.topicWidgetsIds.includes(widget.uuid)) {
                    // https://stackoverflow.com/a/24813338
                    object.splice(index, 1);
                    updateNecessary = true;
                }
            });
        });

        // TODO: This should only be possible, if the user has the proper privileges
        if (updateNecessary) {
            // overwrite config
            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.topicConfigNode.ref.id,
                JSON.stringify(this.swimlanes),
            );
            // set value of swimlanes to updated property
            const existingSwimlanesString =
                this.topicConfigNode.properties[this.widgetConfigType]?.[0] ?? '';
            this.swimlanes = existingSwimlanesString ? JSON.parse(existingSwimlanesString) : [];
        }
    }

    async setProperty(nodeId: string, value: string): Promise<Node> {
        return firstValueFrom(
            this.nodeApi.setProperty('-home-', nodeId, 'ccm:widget_config', [value]),
        );
    }

    async setPropertyAndRetrieveUpdatedNode(nodeId: string, value: string) {
        await this.setProperty(nodeId, value);
        return firstValueFrom(this.nodeApi.getNode(nodeId));
    }

    retrieveSelectDimensions() {
        this.mdsService.getMetadataSet({ metadataSet: 'mds_oeh' }).subscribe((data) => {
            const filteredMdsWidgets: MdsWidget[] = data.widgets.filter((widget: MdsWidget) =>
                this.providedSelectDimensionKeys.includes(widget.id),
            );
            filteredMdsWidgets.forEach((mdsWidget: MdsWidget) => {
                // Note: The $ is added at this position to signal an existing placeholder
                this.selectDimensions.set('$' + mdsWidget.id + '$', mdsWidget);
            });
            this.selectDimensionsLoaded = true;
        });
    }

    selectValuesChanged(event: MdsValue[]) {
        this.selectedDimensionValues = event;
    }

    moveSwimlanePosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.swimlanes.length - 1) {
            moveItemInArray(this.swimlanes, oldIndex, newIndex);
        }
    }

    addSwimlane(type: string) {
        const newSwimlane: Swimlane = {
            uuid: uuidv4(),
            type,
        };
        if (type !== 'spacer') {
            newSwimlane.heading = 'Eine beispielhafte Überschrift';
            newSwimlane.grid = [];
        }
        this.swimlanes.push(newSwimlane);
    }

    editSwimlane(swimlane: Swimlane, index: number) {
        const dialogRef = this.dialog.open(SwimlaneSettingsDialogComponent, {
            data: swimlane,
        });

        // TODO: fix error when closing (ERROR TypeError: Cannot set properties of null (setting '_closeInteractionType'))
        // seems to be a known issue as of May 2023: https://stackoverflow.com/a/76273326
        dialogRef.afterClosed().subscribe((result) => {
            if (result.status === 'VALID') {
                const editedSwimlane = result.value;
                // TODO: Due to textual conversion, the grid must currently be parsed
                if (editedSwimlane.grid) {
                    editedSwimlane.grid = JSON.parse(editedSwimlane.grid);
                }
                this.swimlanes[index] = { ...swimlane, ...editedSwimlane };
            }
            console.log('Closed', result);
        });
    }

    deleteSwimlane(index: number) {
        if (
            this.swimlanes?.[index] &&
            confirm('Wollen Sie dieses Element wirklich löschen?') === true
        ) {
            this.swimlanes.splice(index, 1);
        }
    }

    /** calls the Z-API to invoke ChatGPT */
    private generateFromPrompt() {
        this.aiTextPromptsService
            .publicPrompt({
                widgetNodeId: 'c937cabf-5ffd-47f0-a5e8-ef0ed370baf0',
                contextNodeId: this.topicCollectionID(),
                body: {},
            })
            .subscribe(
                (result: any) => {
                    const response = result.responses[0];
                    console.log('RESPONSE: ', response);
                    this.generatedHeader.set(response);
                },
                (error: any) => {
                    console.log('An error occurred: ', error);
                    this.jobsWidgetReady = true;
                },
            );
        this.aiTextPromptsService
            .publicPrompt({
                widgetNodeId: 'a625a9d6-383d-4835-84f2-a8e2792ea13f',
                contextNodeId: this.topicCollectionID(),
                body: {},
            })
            .subscribe(
                (result: any) => {
                    const response = result.responses[0];
                    console.log('RESPONSE 2: ', response);
                    this.generatedJobText.set(response);
                    this.jobsWidgetReady = true;
                },
                (error: any) => {
                    console.log('An error occurred: ', error);
                    this.jobsWidgetReady = true;
                },
            );
    }

    // https://stackoverflow.com/a/16348977
    stringToColour(str: string) {
        let hash = 0;
        str.split('').forEach((char) => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash);
        });
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            colour += value.toString(16).padStart(2, '0');
        }
        return colour;
    }
}
