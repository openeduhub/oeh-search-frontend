import { CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnInit, signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import {
    collectionPrefix,
    currentlySupportedWidgetTypesWithConfig,
    currentlySupportedWidgetTypes,
    default_mds,
    initialLocaleString,
    initialSwimlanes,
    initialTopicColor,
    ioType,
    mapType,
    parentWidgetConfigNodeId,
    providedSelectDimensionKeys,
    swimlaneTypeOptions,
    topicPrompt,
    topicTemplateWidgetId,
    widgetConfigAspect,
    widgetConfigType,
    widgetPrefix,
} from './custom-definitions';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { GridTile } from './swimlane/grid-tile';
import { NodeConfig } from './swimlane/grid-widget/node-config';
import { WidgetConfig } from './swimlane/grid-widget/widget-config';
import { SwimlaneComponent } from './swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';
import { Swimlane } from './swimlane/swimlane';
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
import { SpinnerComponent } from 'ngx-edu-sharing-ui';
import { AiTextPromptsService } from 'ngx-edu-sharing-z-api';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
    standalone: true,
    imports: [
        CdkDragHandle,
        FilterBarComponent,
        SharedModule,
        TemplateComponent,
        SpinnerComponent,
        SwimlaneComponent,
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    constructor(
        private aiTextPromptsService: AiTextPromptsService,
        private apiRequestConfig: ApiRequestConfiguration,
        private authService: AuthenticationService,
        private dialog: MatDialog,
        private mdsService: MdsService,
        private nodeApi: NodeService,
        private route: ActivatedRoute,
    ) {}

    @HostBinding('style.--topic-color') topicColor: string = initialTopicColor;

    loadedSuccessfully: boolean = false;
    requestInProgress: boolean = false;
    private initializedWithParams: boolean = false;

    userHasEditRights: WritableSignal<boolean> = signal(false);
    editMode: boolean = false;

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);
    generatedHeader: WritableSignal<string> = signal('');
    generatedJobText: WritableSignal<string> = signal('');
    jobsWidgetReady: boolean = false;

    private topicConfigNode: Node;
    topicWidgets: NodeEntries;
    swimlanes: Swimlane[] = [];

    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    selectedDimensionValues: MdsValue[] = [];
    selectDimensionsLoaded: boolean = false;

    swimlaneTypeOptions = swimlaneTypeOptions.concat([
        { value: 'spacer', viewValue: 'Trennlinie' },
    ]);

    ngOnInit(): void {
        this.initializeCustomEventListeners();
        this.apiRequestConfig.setLocale(initialLocaleString);
        // set the topic based on the query param "collectionID"
        this.route.queryParams
            .pipe(filter((params) => params.topic || params.collectionId))
            .subscribe(async (params) => {
                // the queryParams might be called twice, thus, initializedWithParams is important
                if (params.collectionId && !this.initializedWithParams) {
                    this.topicCollectionID.set(params.collectionId);
                    this.initializedWithParams = true;
                    // fetch the collection node to set the topic name and topic color
                    await firstValueFrom(this.nodeApi.getNode(params.collectionId)).then(
                        (node: Node) => {
                            this.topic.set(node.title);
                            // set the background to some random (but deterministic) color, just for visuals
                            this.topicColor = this.stringToColour(this.topic());
                        },
                    );

                    const username = environment?.eduSharingUsername;
                    const password = environment?.eduSharingPassword;
                    // TODO: This fix for local development currently only works in Firefox
                    if (username && password) {
                        await firstValueFrom(this.authService.login(username, password));
                    }
                    await this.retrieveSelectDimensions();

                    // retrieve children of widget config node and check, whether a topic node exists
                    const nodeEntries: NodeEntries = await this.getNodeChildren(
                        parentWidgetConfigNodeId,
                    );
                    this.topicConfigNode = nodeEntries.nodes.find(
                        (node: Node) =>
                            node.type === mapType &&
                            node.name === collectionPrefix + params.collectionId,
                    );
                    // if no topic node exists, create it
                    if (!this.topicConfigNode) {
                        await this.createTopicNodeWithChildren(params.collectionId);
                    }
                    // check the user privileges for the topic config node
                    this.checkUserAccess(this.topicConfigNode);
                    // retrieve the list of stored widget nodes
                    this.topicWidgets = await this.getNodeChildren(this.topicConfigNode.ref.id);
                    // note: only the grid items of the swimlane should be represented as separate widget nodes
                    this.swimlanes = this.topicNodeConfig.swimlanes ?? [];
                    // sync both existing children (topicWidgets) and topic config (swimlanes)
                    await this.syncSwimlanes();
                    // generate header text
                    this.generateFromPrompt();
                    this.loadedSuccessfully = true;
                }
            });
    }

    private initializeCustomEventListeners() {
        // listen to custom colorChange event dispatched by the wlo-user-configurable
        document.getElementsByTagName('body')[0].addEventListener(
            'colorChange',
            async (e: CustomEvent) => {
                const color = e.detail?.color ?? '';
                const nodeId = e.detail?.node ?? '';

                if (color !== '' && nodeId !== '') {
                    // do not use a copy of swimlanes in order to avoid loading effects
                    let changesMade: boolean = false;
                    this.swimlanes.forEach((swimlane) => {
                        swimlane.grid?.forEach((gridItem: GridTile) => {
                            if (
                                gridItem &&
                                gridItem.uuid === nodeId &&
                                swimlane.backgroundColor !== color
                            ) {
                                swimlane.backgroundColor = color;
                                changesMade = true;
                            }
                        });
                    });

                    if (changesMade) {
                        const topicConfig: NodeConfig = this.topicNodeConfig;
                        topicConfig.swimlanes = this.swimlanes;
                        this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                            this.topicConfigNode.ref.id,
                            JSON.stringify(topicConfig),
                        );
                    }
                }
            },
            false,
        );
    }

    /**
     * Create topic node with its children, if it does not exist.
     * (1) create node for topic
     * (2) load template
     * (3) generate children nodes for topic node
     * (4) set config to nodes from template (TODO)
     * (5) store config of existing children in topic node
     *
     * @param collectionId
     */
    private async createTopicNodeWithChildren(collectionId: string) {
        // (1) create node for topic as child of the widget config node
        this.topicConfigNode = await this.createChild(
            parentWidgetConfigNodeId,
            mapType,
            collectionPrefix + collectionId,
        );
        if (this.topicConfigNode) {
            // TODO: This is currently necessary to set the correct permissions of the node
            await this.setPermissions(this.topicConfigNode.ref.id);
            // (2) load template (swimlanes)
            // (3) generate children nodes for topic node
            // forEach does not support async / await
            // -> for ... of ... (https://stackoverflow.com/a/37576787)
            for (const swimlane of initialSwimlanes) {
                if (swimlane.grid?.length > 0) {
                    for (const gridTile of swimlane.grid) {
                        if (currentlySupportedWidgetTypes.includes(gridTile.item)) {
                            // create child and add its ref.id as UUID to the swimlanes
                            const childNode: Node = await this.createChild(
                                this.topicConfigNode.ref.id,
                                ioType,
                                widgetPrefix + uuidv4(),
                            );
                            const nodeId = childNode.ref.id;
                            // (4) set widget / gridTile config that might be set in the grid on children nodes
                            if (currentlySupportedWidgetTypesWithConfig.includes(gridTile.item)) {
                                const widgetConfig: WidgetConfig = gridTile.config ?? {};
                                await this.setProperty(
                                    nodeId,
                                    JSON.stringify({ config: widgetConfig }),
                                );
                            }
                            // (5a) store UUID in the config (swimlanes)
                            gridTile.uuid = nodeId;
                            // (5b) delete gridTile config (we do not want to store the widget configs in the main node)
                            if (gridTile.config) {
                                delete gridTile.config;
                            }
                        }
                    }
                }
            }
            // (5c) store adjusted config (swimlanes) with correct UUIDs
            const topicConfig: NodeConfig = {
                prompt: topicPrompt,
                templateWidgetId: topicTemplateWidgetId,
                swimlanes: initialSwimlanes,
            };
            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.topicConfigNode.ref.id,
                JSON.stringify(topicConfig),
            );
        }
    }

    get filterBarReady() {
        const sameNumberOfValues =
            this.selectDimensions.size === this.selectedDimensionValues.length;
        return this.selectDimensionsLoaded && sameNumberOfValues;
    }

    private get topicNodeConfig(): NodeConfig {
        const topicConfig = this.topicConfigNode.properties[widgetConfigType]?.[0];
        if (!topicConfig) {
            return {};
        }
        return JSON.parse(topicConfig) ?? {};
    }

    private get topicWidgetsIds(): string[] {
        return this.topicWidgets?.nodes?.map((node) => node.ref.id) ?? [];
    }

    private checkUserAccess(node: Node) {
        this.userHasEditRights.set(node.access.includes('Write'));
    }

    private async createChild(parentId: string, type: string, name: string): Promise<Node> {
        return await firstValueFrom(
            this.nodeApi.createChild({
                repository: '-home-',
                node: parentId,
                type,
                aspects: [widgetConfigAspect],
                body: {
                    'cm:name': [name],
                },
            }),
        );
    }

    private async setPermissions(nodeId: string): Promise<void> {
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

    private async getNodeChildren(nodeId: string): Promise<NodeEntries> {
        // TODO: Pagination vs. large maxItems number
        return firstValueFrom(this.nodeApi.getChildren(nodeId, { maxItems: 500 }));
    }

    /**
     * Filter out grid items not yet persisted and store updated config in node.
     */
    private async syncSwimlanes() {
        let updateNecessary: boolean = false;
        this.swimlanes.forEach((swimlane: Swimlane) => {
            swimlane.grid?.forEach((widget: GridTile, index: number, object: GridTile[]) => {
                const idNecessary = currentlySupportedWidgetTypes.includes(widget.item);
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
            const topicConfig: NodeConfig = this.topicNodeConfig;
            topicConfig.swimlanes = this.swimlanes;
            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.topicConfigNode.ref.id,
                JSON.stringify(topicConfig),
            );
            // set value of swimlanes to updated property
            this.swimlanes = this.topicNodeConfig.swimlanes ?? [];
        }
    }

    private async setProperty(nodeId: string, value: string): Promise<Node> {
        return firstValueFrom(
            this.nodeApi.setProperty('-home-', nodeId, widgetConfigType, [value]),
        );
    }

    private async setPropertyAndRetrieveUpdatedNode(nodeId: string, value: string): Promise<Node> {
        await this.setProperty(nodeId, value);
        return firstValueFrom(this.nodeApi.getNode(nodeId));
    }

    private async retrieveSelectDimensions(): Promise<void> {
        await firstValueFrom(this.mdsService.getMetadataSet({ metadataSet: default_mds })).then(
            (data) => {
                const filteredMdsWidgets: MdsWidget[] = data.widgets.filter((widget: MdsWidget) =>
                    providedSelectDimensionKeys.includes(widget.id),
                );
                filteredMdsWidgets.forEach((mdsWidget: MdsWidget) => {
                    // Note: The $ is added at this position to signal an existing placeholder
                    this.selectDimensions.set('$' + mdsWidget.id + '$', mdsWidget);
                });
                this.selectDimensionsLoaded = true;
            },
        );
    }

    selectValuesChanged(event: MdsValue[]) {
        this.selectedDimensionValues = event;
    }

    async moveSwimlanePosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.swimlanes.length - 1) {
            this.requestInProgress = true;
            // TODO: is it worse the experience that the calculation is done twice?
            const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes));
            moveItemInArray(swimlanesCopy, oldIndex, newIndex);
            // TODO: move the update functionality into separate function
            const topicConfig: NodeConfig = this.topicNodeConfig;
            topicConfig.swimlanes = swimlanesCopy;
            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.topicConfigNode.ref.id,
                JSON.stringify(topicConfig),
            );
            // update swimlane visually as soon as the requests are done
            moveItemInArray(this.swimlanes, oldIndex, newIndex);
            this.requestInProgress = false;
        }
    }

    async addSwimlane(type: string) {
        this.requestInProgress = true;
        const newSwimlane: Swimlane = {
            uuid: uuidv4(),
            type,
        };
        if (type !== 'spacer') {
            newSwimlane.heading = 'Eine beispielhafte Überschrift';
            newSwimlane.grid = [];
        }
        // TODO: is it worse the experience that the calculation is done twice?
        const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes));
        swimlanesCopy.push(newSwimlane);
        // TODO: move the update functionality into separate function
        const topicConfig: NodeConfig = this.topicNodeConfig;
        topicConfig.swimlanes = swimlanesCopy;
        this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
            this.topicConfigNode.ref.id,
            JSON.stringify(topicConfig),
        );
        // display swimlane visually as soon as the requests are done
        this.swimlanes.push(newSwimlane);
        this.requestInProgress = false;
    }

    editSwimlane(swimlane: Swimlane, index: number) {
        const dialogRef = this.dialog.open(SwimlaneSettingsDialogComponent, {
            data: {
                swimlane,
                widgets: this.topicWidgets,
            },
        });

        // TODO: fix error when closing (ERROR TypeError: Cannot set properties of null (setting '_closeInteractionType'))
        // seems to be a known issue as of May 2023: https://stackoverflow.com/a/76273326
        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.status === 'VALID') {
                const editedSwimlane = result.value;
                if (!editedSwimlane) {
                    return;
                }
                this.requestInProgress = true;
                // parse grid string
                if (editedSwimlane.grid) {
                    editedSwimlane.grid = JSON.parse(editedSwimlane.grid);
                }
                // create a copy of the swimlanes
                const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes));
                // actions related to edited swimlane
                const editedSwimlaneUUIDs =
                    editedSwimlane.grid?.map((gridItem: GridTile) => gridItem.uuid) ?? [];
                // sync updated grid items with existing swimlane grid
                // (1) remove deleted grid elements
                // iterate existing grid and check, if items still exist
                if (swimlane.grid?.length > 0) {
                    for (const gridTile of swimlane.grid) {
                        // relevant type, but not included anymore -> delete
                        if (
                            currentlySupportedWidgetTypes.includes(gridTile.item) &&
                            !editedSwimlaneUUIDs.includes(gridTile.uuid)
                        ) {
                            await firstValueFrom(this.nodeApi.deleteNode(gridTile.uuid)).then(
                                () => {
                                    console.log('Deleted node');
                                },
                                () => {
                                    console.log('Error deleting node');
                                },
                            );
                        }
                    }
                }
                const existingSwimlaneUUIDs =
                    swimlane.grid?.map((gridItem: GridTile) => gridItem.uuid) ?? [];
                // iterate swimlane grid
                if (editedSwimlane.grid?.length > 0) {
                    for (const gridTile of editedSwimlane.grid) {
                        // relevant type
                        if (currentlySupportedWidgetTypes.includes(gridTile.item)) {
                            // (2) not yet included -> create child and add its ID as UUID to the swimlanes
                            if (!existingSwimlaneUUIDs.includes(gridTile.uuid)) {
                                const childNode: Node = await this.createChild(
                                    this.topicConfigNode.ref.id,
                                    ioType,
                                    widgetPrefix + uuidv4(),
                                );
                                const nodeId = childNode.ref.id;
                                // set empty properties on children to be extended later
                                if (
                                    currentlySupportedWidgetTypesWithConfig.includes(gridTile.item)
                                ) {
                                    const widgetConfig: WidgetConfig = gridTile.config ?? {};
                                    await this.setProperty(
                                        nodeId,
                                        JSON.stringify({ config: widgetConfig }),
                                    );
                                }
                                // store UUID in the config (swimlanes)
                                gridTile.uuid = nodeId;
                            }
                            // included -> update properties, if necessary
                            else {
                                const existingNode = this.topicWidgets.nodes.find(
                                    (node: Node) => node.ref.id === gridTile.uuid,
                                );
                                if (existingNode) {
                                    const existingNodeConfigString =
                                        existingNode.properties[widgetConfigType]?.[0];
                                    if (
                                        existingNodeConfigString &&
                                        JSON.parse(existingNodeConfigString)
                                    ) {
                                        const parsedConfig: WidgetConfig =
                                            JSON.parse(existingNodeConfigString).config ?? {};
                                        // check, whether the config is not equal
                                        if (
                                            !this.compareTwoObjects(parsedConfig, gridTile.config)
                                        ) {
                                            // overwrite ".config"-value of existing property in order to keep existing attributes
                                            const updatedConfig =
                                                JSON.parse(existingNodeConfigString);
                                            updatedConfig.config = gridTile.config;
                                            await this.setProperty(
                                                existingNode.ref.id,
                                                JSON.stringify(updatedConfig),
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // TODO: check, if modifications were made
                // (3) do not store config twice in topic config and widget config
                editedSwimlane.grid?.forEach((gridTile: GridTile) => {
                    if (gridTile.config) {
                        delete gridTile.config;
                    }
                });
                // (4) store updated swimlanes in node config
                swimlanesCopy[index] = editedSwimlane;
                // (5) change updated swimlanes in the topic node
                // TODO: move the update functionality into separate function
                const topicConfig: NodeConfig = this.topicNodeConfig;
                topicConfig.swimlanes = swimlanesCopy;
                this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                    this.topicConfigNode.ref.id,
                    JSON.stringify(topicConfig),
                );
                // (6) sync with server state
                this.topicWidgets = await this.getNodeChildren(this.topicConfigNode.ref.id);
                // note: only the grid items of the swimlane should be represented as separate widget nodes
                this.swimlanes = this.topicNodeConfig.swimlanes ?? [];

                this.requestInProgress = false;
            }
            console.log('Closed', result?.value);
        });
    }

    async deleteSwimlane(index: number) {
        if (
            this.swimlanes?.[index] &&
            confirm('Wollen Sie dieses Element wirklich löschen?') === true
        ) {
            // delete possible nodes defined in the swimlane
            // forEach does not support async / await
            // -> for ... of ... (https://stackoverflow.com/a/37576787)
            this.requestInProgress = true;
            if (this.swimlanes[index].grid) {
                for (const widget of this.swimlanes[index].grid) {
                    if (currentlySupportedWidgetTypes.includes(widget.item)) {
                        await firstValueFrom(this.nodeApi.deleteNode(widget.uuid)).then(
                            () => {
                                console.log('Deleted node');
                            },
                            () => {
                                console.log('Error deleting node');
                            },
                        );
                    }
                }
            }
            const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes));
            // TODO: is it worse the experience that the calculation is done twice?
            swimlanesCopy.splice(index, 1);
            // TODO: move the update functionality into separate function
            const topicConfig: NodeConfig = this.topicNodeConfig;
            topicConfig.swimlanes = swimlanesCopy;
            this.topicConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.topicConfigNode.ref.id,
                JSON.stringify(topicConfig),
            );
            // remove swimlane visually as soon as the requests are done
            this.swimlanes.splice(index, 1);
            this.requestInProgress = false;
        }
    }

    /** calls the Z-API to invoke ChatGPT */
    private generateFromPrompt() {
        this.aiTextPromptsService
            .publicPrompt({
                widgetNodeId: this.topicConfigNode.ref.id,
                contextNodeId: this.topicCollectionID(),
                body: {},
            })
            .subscribe(
                (result: any) => {
                    const response = result.responses[0];
                    console.log('RESPONSE: ', response);
                    this.generatedHeader.set(response);
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

    // TODO: there might be better ways to compare objects
    // https://stackoverflow.com/a/75974855
    private compareTwoObjects(object1: any, object2: any): boolean {
        let compareRes = true;
        if (object1 && object2 && Object.keys(object1).length === Object.keys(object2).length) {
            Object.keys(object1).forEach((key) => {
                if (object1[key] !== object2[key]) {
                    compareRes = false;
                }
            });
        } else {
            compareRes = false;
        }
        return compareRes;
    }
}
