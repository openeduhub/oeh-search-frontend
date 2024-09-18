import { CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnInit, signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
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
import { ParentEntries } from 'ngx-edu-sharing-api/lib/api/models/parent-entries';
import { SpinnerComponent } from 'ngx-edu-sharing-ui';
import { FilterBarComponent } from 'ngx-edu-sharing-wlo-pages';
import { AiTextPromptsService, TextPromptEntity } from 'ngx-edu-sharing-z-api';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { SharedModule } from '../shared/shared.module';
import {
    defaultMds,
    defaultTopicTextNodeId,
    initialLocaleString,
    initialTopicColor,
    ioType,
    mapType,
    pageConfigPropagateType,
    pageConfigRefType,
    pageConfigType,
    providedSelectDimensionKeys,
    swimlaneTypeOptions,
    widgetConfigAspect,
    pageVariantConfigType,
    parentPageConfigNodeId,
    pageConfigPrefix,
    pageConfigAspect,
    pageVariantConfigPrefix,
    pageVariantConfigAspect,
    pageVariantIsTemplateType,
    workspaceSpacesStorePrefix,
} from './custom-definitions';
import { PageConfig } from './page-config';
import { PageVariantConfig } from './page-variant-config';
import { GridTile } from './swimlane/grid-tile';
import { SwimlaneComponent } from './swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';
import { Swimlane } from './swimlane/swimlane';

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

    initialLoadSuccessfully: boolean = false;
    requestInProgress: boolean = false;
    private initializedWithParams: boolean = false;

    userHasEditRights: WritableSignal<boolean> = signal(false);
    editMode: boolean = false;

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);
    generatedHeader: WritableSignal<string> = signal('');

    private collectionNode: Node;
    private collectionNodeHasPageConfig: boolean = false;
    private pageConfigNode: Node;
    pageConfigCheckFailed: boolean = false;
    private pageVariantConfigs: NodeEntries;
    private pageVariantDefaultPosition: number = -1;
    pageVariantNode: Node;
    private selectedVariantPosition: number = -1;
    topicWidgets: NodeEntries;
    swimlanes: Swimlane[] = [];

    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    selectedDimensionValues: MdsValue[] = [];
    selectDimensionsLoaded: boolean = false;

    swimlaneTypeOptions = swimlaneTypeOptions.concat([
        { value: 'spacer', viewValue: 'Trennlinie' },
    ]);

    get filterBarReady(): boolean {
        const sameNumberOfValues =
            this.selectDimensions.size === this.selectedDimensionValues.length;
        return this.selectDimensionsLoaded && sameNumberOfValues;
    }

    private get selectedDimensionValueIds(): string[] {
        return this.selectedDimensionValues.map((value: MdsValue) => value.id);
    }

    ngOnInit(): void {
        // set the default language for API requests
        this.apiRequestConfig.setLocale(initialLocaleString);
        // set the topic based on the query param "collectionID"
        this.route.queryParams
            .pipe(filter((params) => params.topic || params.collectionId))
            .subscribe(async (params) => {
                // due to reconnect with queryParams, this might be called twice, thus, initializedWithParams is important
                if (params.collectionId && !this.initializedWithParams) {
                    this.topicCollectionID.set(params.collectionId);
                    this.initializedWithParams = true;
                    // 0) login for local development
                    const username = environment?.eduSharingUsername;
                    const password = environment?.eduSharingPassword;
                    // TODO: This fix for local development currently only works in Firefox
                    if (username && password) {
                        await firstValueFrom(this.authService.login(username, password));
                    }
                    // 1) fetch the collection node to set the topic name, color and check the user access
                    this.collectionNode = await firstValueFrom(
                        this.nodeApi.getNode(params.collectionId),
                    );
                    this.topic.set(this.collectionNode.title);
                    // check the user privileges for the collection node and initialize custom listeners
                    this.checkUserAccess(this.collectionNode);
                    if (this.userHasEditRights()) {
                        this.initializeCustomEventListeners();
                    }
                    // TODO: use a color from the palette defined in the collection
                    // set the background to some random (but deterministic) color, just for visuals
                    this.topicColor = this.stringToColour(this.topic());

                    // 2) retrieve the page config node either by checking the node itself or by iterating the parents of the collectionNode
                    this.pageConfigNode = await this.retrievePageConfigNode(this.collectionNode);
                    if (!this.pageConfigNode) {
                        return;
                    }
                    // parse the page config from the properties
                    const pageConfig: PageConfig = this.pageConfigNode.properties[
                        pageConfigType
                    ]?.[0]
                        ? JSON.parse(this.pageConfigNode.properties[pageConfigType][0])
                        : {};
                    if (!pageConfig.variants) {
                        console.error('pageConfig does not include variants', pageConfig);
                        return;
                    }
                    this.pageVariantConfigs = await this.getNodeChildren(
                        this.pageConfigNode.ref.id,
                    );
                    // default the ID with the default or the first occurrence
                    this.pageVariantDefaultPosition = pageConfig.variants.indexOf(
                        pageConfig.default,
                    );
                    let selectedVariantId = pageConfig.default ?? pageConfig.variants[0];
                    selectedVariantId =
                        selectedVariantId.split('/')?.[selectedVariantId.split('/').length - 1];
                    // iterate variant configs and check, whether the variables of one occurrence match
                    let highestNumberOfMatches: number = 0;
                    this.pageVariantConfigs.nodes?.forEach((variantNode: Node) => {
                        const variantConfig: PageVariantConfig = variantNode.properties[
                            pageVariantConfigType
                        ]?.[0]
                            ? JSON.parse(variantNode.properties[pageVariantConfigType][0])
                            : {};
                        if (variantConfig.variables) {
                            let matchesCount: number = 0;
                            Object.keys(variantConfig.variables)?.forEach((key: string) => {
                                // TODO: Replace by a more consistent check of both key and value
                                if (
                                    this.selectedDimensionValueIds.includes(
                                        variantConfig.variables[key],
                                    )
                                ) {
                                    matchesCount += 1;
                                }
                            });
                            // select the variant with the most matches
                            if (matchesCount > highestNumberOfMatches) {
                                selectedVariantId = variantNode.ref.id;
                            }
                        }
                    });
                    this.selectedVariantPosition = pageConfig.variants.indexOf(
                        workspaceSpacesStorePrefix + selectedVariantId,
                    );
                    // 3) retrieve the variant config node of the page
                    this.pageVariantNode = this.pageVariantConfigs.nodes?.find(
                        (node: Node) => node.ref.id === selectedVariantId,
                    );
                    const pageVariant: PageVariantConfig = this.pageVariantNode.properties[
                        pageVariantConfigType
                    ]?.[0]
                        ? JSON.parse(this.pageVariantNode.properties[pageVariantConfigType][0])
                        : {};
                    if (!pageVariant.structure) {
                        console.error(
                            'No structure was found in pageVariant',
                            this.pageVariantNode,
                        );
                        return;
                    }
                    // 4) if page config was retrieved from parent,
                    //    remove possible existing nodeIds from swimlane grids
                    if (!this.collectionNode.properties[pageConfigRefType]?.[0]) {
                        this.removeNodeIdsFromPageVariantConfig(pageVariant);
                    }
                    // 5) set the swimlanes
                    this.swimlanes = pageVariant.structure.swimlanes ?? [];
                    // 6) generate the header text
                    await this.generateFromPrompt();
                    // 7) everything loaded?
                    this.initialLoadSuccessfully = true;
                }
            });
    }

    private checkUserAccess(node: Node): void {
        this.userHasEditRights.set(node.access.includes('Write'));
    }

    private initializeCustomEventListeners(): void {
        // listen to custom colorChange event dispatched by wlo-user-configurable
        document.getElementsByTagName('body')[0].addEventListener(
            'colorChange',
            async (e: CustomEvent) => {
                console.log('DEBUG: colorChange event', e);
                const color: string = e.detail?.color ?? '';
                const pageVariantNode: Node = e.detail?.pageVariantNode ?? null;
                const swimlaneIndex: number = e.detail?.swimlaneIndex ?? -1;

                if (
                    color !== '' &&
                    pageVariantNode &&
                    pageVariantNode.ref.id === this.pageVariantNode.ref.id &&
                    swimlaneIndex > -1
                ) {
                    let changesNecessary: boolean =
                        this.swimlanes[swimlaneIndex]?.backgroundColor !== color;
                    if (changesNecessary) {
                        // check, whether a new "direct" node has to be created
                        const pageNodeCreated: boolean =
                            await this.checkForCustomPageNodeExistence();
                        console.log('DEBUG: change necessary', pageNodeCreated);
                        const pageVariant: PageVariantConfig = this.retrievePageVariant();
                        this.swimlanes[swimlaneIndex].backgroundColor = color;
                        pageVariant.structure.swimlanes = this.swimlanes;
                        await this.setProperty(
                            this.pageVariantNode.ref.id,
                            pageVariantConfigType,
                            JSON.stringify(pageVariant),
                        );
                    }
                }
            },
            false,
        );

        // listen to custom colorChange event dispatched by wlo-user-configurable
        document.getElementsByTagName('body')[0].addEventListener(
            'widgetNodeAdded',
            async (e: CustomEvent) => {
                console.log('DEBUG: widgetNodeAdded event', e);
                const pageVariantNode: Node = e.detail?.pageVariantNode ?? null;
                const swimlaneIndex: number = e.detail?.swimlaneIndex ?? -1;
                const gridIndex: number = e.detail?.gridIndex ?? -1;
                const widgetNodeId: string = e.detail?.widgetNodeId ?? '';

                const validParentVariant: boolean =
                    pageVariantNode && pageVariantNode.ref.id === this.pageVariantNode.ref.id;
                const validSwimlaneIndex: boolean = swimlaneIndex > -1;
                const validGridIndex: boolean = gridIndex > -1;
                const validWidgetNodeId: boolean = widgetNodeId && widgetNodeId !== '';

                let addedSuccessfully: boolean = false;
                if (
                    validParentVariant &&
                    validGridIndex &&
                    validSwimlaneIndex &&
                    validWidgetNodeId
                ) {
                    const pageNodeCreated: boolean = await this.checkForCustomPageNodeExistence();
                    console.log('DEBUG: change necessary', pageNodeCreated);
                    const pageVariant: PageVariantConfig = this.retrievePageVariant();
                    if (this.swimlanes?.[swimlaneIndex]?.grid?.[gridIndex] && pageVariant) {
                        this.swimlanes[swimlaneIndex].grid[gridIndex].nodeId =
                            widgetNodeId.includes(workspaceSpacesStorePrefix)
                                ? widgetNodeId
                                : workspaceSpacesStorePrefix + widgetNodeId;
                        pageVariant.structure.swimlanes = this.swimlanes;
                        await this.setProperty(
                            this.pageVariantNode.ref.id,
                            pageVariantConfigType,
                            JSON.stringify(pageVariant),
                        );
                        addedSuccessfully = true;
                    }
                }
                // note: if it exists, but cannot be added in the grid, we might want to delete the node again
                if (validWidgetNodeId && !addedSuccessfully) {
                    const nodeIdToDelete: string = widgetNodeId.includes(workspaceSpacesStorePrefix)
                        ? widgetNodeId.split('/')?.[widgetNodeId.split('/').length - 1]
                        : widgetNodeId;
                    await firstValueFrom(this.nodeApi.deleteNode(nodeIdToDelete));
                }
            },
            false,
        );

        // TODO: Add created config nodes to the swimlane
    }

    private async retrievePageConfigNode(node: Node): Promise<Node> {
        // check, whether the node itself has a pageConfigRef
        let pageRef = node.properties[pageConfigRefType]?.[0];
        this.collectionNodeHasPageConfig = !!pageRef;
        // otherwise, iterate the parents to retrieve the pageConfigRef, if pageConfigPropagate is set
        if (!pageRef) {
            const parents: ParentEntries = await firstValueFrom(
                this.nodeApi.getParents(node.ref.id, {
                    propertyFilter: ['-all-'],
                    fullPath: true,
                }),
            );
            pageRef = parents.nodes.find(
                (parent: Node) => !!parent.properties[pageConfigPropagateType]?.[0],
            )?.properties[pageConfigRefType]?.[0];
        }
        if (pageRef) {
            // workspace://SpacesStore/UUID -> UUID
            const pageNodeId: string = pageRef.split('/')?.[pageRef.split('/').length - 1];
            if (pageNodeId) {
                this.pageConfigCheckFailed = false;
                return await firstValueFrom(this.nodeApi.getNode(pageNodeId));
            }
        }
        this.pageConfigCheckFailed = true;
        return null;
    }

    /**
     * Helper function to retrieve the children of a given node.
     */
    private async getNodeChildren(nodeId: string): Promise<NodeEntries> {
        // TODO: Pagination vs. large maxItems number
        return firstValueFrom(this.nodeApi.getChildren(nodeId, { maxItems: 500 }));
    }

    // REACT TO OUTPUT EVENTS //

    /**
     * Called by wlo-filter-bar selectDimensionsChanged output event.
     */
    selectDimensionsChanged(event: Map<string, MdsWidget>): void {
        this.selectDimensions = event;
        this.selectDimensionsLoaded = true;
    }

    /**
     * Called by wlo-filter-bar selectValuesChanged output event.
     */
    selectValuesChanged(event: MdsValue[]): void {
        this.selectedDimensionValues = event;
    }

    // MODIFICATIONS OF THE PAGE //
    /**
     * Helper function to create a child for an existing node.
     */
    private async createChild(
        parentId: string,
        type: string,
        name: string,
        aspect?: string,
    ): Promise<Node> {
        const aspects: string[] = aspect ? [aspect] : [widgetConfigAspect];
        return await firstValueFrom(
            this.nodeApi.createChild({
                repository: '-home-',
                node: parentId,
                type,
                aspects,
                body: {
                    'cm:name': [name],
                },
            }),
        );
    }

    /**
     * Helper function to set a property to an existing node.
     */
    private async setProperty(nodeId: string, propertyName: string, value: string): Promise<Node> {
        return firstValueFrom(this.nodeApi.setProperty('-home-', nodeId, propertyName, [value]));
    }

    /**
     * Another helper function due to setProperty not returning a node currently.
     */
    private async setPropertyAndRetrieveUpdatedNode(
        nodeId: string,
        propertyName: string,
        value: string,
    ): Promise<Node> {
        await this.setProperty(nodeId, propertyName, value);
        return firstValueFrom(this.nodeApi.getNode(nodeId));
    }

    /**
     * Helper function to set the correct permissions for a given node.
     */
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

    /**
     * Helper function to add a possible non-existing page config node.
     */
    private async checkForCustomPageNodeExistence(): Promise<boolean> {
        console.log('checkForCustomPageNodeExistence');
        if (!this.collectionNodeHasPageConfig) {
            console.log('checkForCustomPageNodeExistence no page config');
            // page ccm:map for page config node
            this.pageConfigNode = await this.createChild(
                parentPageConfigNodeId,
                mapType,
                pageConfigPrefix + uuidv4(),
                pageConfigAspect,
            );
            // TODO: remove, if not necessary
            await this.setPermissions(this.pageConfigNode.ref.id);
            const pageVariants: string[] = [];
            // iterate variant config nodes and create ccm:io child nodes for it
            if (this.pageVariantConfigs.nodes?.length > 0) {
                for (const variantNode of this.pageVariantConfigs.nodes) {
                    let pageConfigVariantNode: Node = await this.createChild(
                        this.pageConfigNode.ref.id,
                        ioType,
                        pageVariantConfigPrefix + uuidv4(),
                        pageVariantConfigAspect,
                    );
                    // TODO: remove, if not necessary
                    await this.setPermissions(pageConfigVariantNode.ref.id);
                    pageVariants.push(workspaceSpacesStorePrefix + pageConfigVariantNode.ref.id);
                    const variantConfig: PageVariantConfig = variantNode.properties[
                        pageVariantConfigType
                    ]?.[0]
                        ? JSON.parse(variantNode.properties[pageVariantConfigType][0])
                        : {};
                    this.removeNodeIdsFromPageVariantConfig(variantConfig);
                    await this.setProperty(
                        pageConfigVariantNode.ref.id,
                        pageVariantConfigType,
                        JSON.stringify(variantConfig),
                    );
                    await this.setProperty(
                        pageConfigVariantNode.ref.id,
                        pageVariantIsTemplateType,
                        'false',
                    );
                }
            }
            const defaultVariant: string =
                this.pageVariantDefaultPosition >= 0
                    ? pageVariants?.[this.pageVariantDefaultPosition] ?? pageVariants[0]
                    : undefined;
            const pageConfig: PageConfig = {
                variants: pageVariants,
            };
            if (defaultVariant) {
                pageConfig.default = defaultVariant;
            }
            // update ccm:page_config of page config node
            this.pageConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.pageConfigNode.ref.id,
                pageConfigType,
                JSON.stringify(pageConfig),
            );
            // get page variant configs
            this.pageVariantConfigs = await this.getNodeChildren(this.pageConfigNode.ref.id);
            // parse the page config ref again
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            this.swimlanes = pageVariant.structure.swimlanes ?? [];
            // set ccm:page_config_ref in collection
            await firstValueFrom(
                this.nodeApi.setProperty('-home-', this.collectionNode.ref.id, pageConfigRefType, [
                    workspaceSpacesStorePrefix + this.pageConfigNode.ref.id,
                ]),
            );
            // set this.collectionNodeHasPageConfig to true
            this.collectionNodeHasPageConfig = true;
            return true;
        }
        return false;
    }

    /**
     * Helper function to retrieve the page variant of an existing page config node.
     */
    private retrievePageVariant(): PageVariantConfig {
        // parse the page config from the properties
        const pageConfig: PageConfig = this.pageConfigNode.properties[pageConfigType]?.[0]
            ? JSON.parse(this.pageConfigNode.properties[pageConfigType][0])
            : {};
        if (!pageConfig.variants) {
            console.error('pageConfig does not include variants.', pageConfig);
            return null;
        }
        let selectedVariantId: string = pageConfig.variants?.[this.selectedVariantPosition];
        if (!selectedVariantId) {
            console.error(
                'No selectedVariantId was found.',
                pageConfig.variants,
                this.selectedVariantPosition,
            );
            return null;
        }
        selectedVariantId = selectedVariantId.split('/')?.[selectedVariantId.split('/').length - 1];
        this.pageVariantNode = this.pageVariantConfigs.nodes?.find(
            (node: Node) => node.ref.id === selectedVariantId,
        );
        if (!this.pageVariantNode) {
            console.error(
                'No pageVariantNode was found.',
                selectedVariantId,
                this.pageVariantConfigs.nodes,
            );
            return null;
        }
        const pageVariant: PageVariantConfig = this.pageVariantNode.properties[
            pageVariantConfigType
        ]?.[0]
            ? JSON.parse(this.pageVariantNode.properties[pageVariantConfigType][0])
            : null;
        if (!pageVariant || !pageVariant.structure) {
            console.error('Either no pageVariant or no structure in it was found.', pageVariant);
            return null;
        }
        return pageVariant;
    }

    /**
     * Add a new swimlane to the page and persist it in the config.
     */
    async addSwimlane(type: string): Promise<void> {
        this.requestInProgress = true;
        await this.checkForCustomPageNodeExistence();
        const pageVariant: PageVariantConfig = this.retrievePageVariant();
        if (!pageVariant) {
            this.requestInProgress = false;
        }
        const newSwimlane: Swimlane = {
            type,
        };
        if (type !== 'spacer') {
            newSwimlane.heading = 'Eine beispielhafte Überschrift';
            newSwimlane.grid = [];
        }
        const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
        swimlanesCopy.push(newSwimlane);
        pageVariant.structure.swimlanes = swimlanesCopy;
        await this.setProperty(
            this.pageVariantNode.ref.id,
            pageVariantConfigType,
            JSON.stringify(pageVariant),
        );
        // add swimlane visually as soon as the requests are done
        this.swimlanes.push(newSwimlane);
        this.requestInProgress = false;
    }

    /**
     * Move the position of a swimlane on the page and persist it in the config.
     */
    async moveSwimlanePosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.swimlanes.length - 1) {
            this.requestInProgress = true;
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.requestInProgress = false;
            }
            const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
            moveItemInArray(swimlanesCopy, oldIndex, newIndex);
            pageVariant.structure.swimlanes = swimlanesCopy;
            await this.setProperty(
                this.pageVariantNode.ref.id,
                pageVariantConfigType,
                JSON.stringify(pageVariant),
            );
            // move swimlane position visually as soon as the requests are done
            moveItemInArray(this.swimlanes, oldIndex, newIndex);
            this.requestInProgress = false;
        }
    }

    editSwimlane(swimlane: Swimlane, index: number) {
        const dialogRef = this.dialog.open(SwimlaneSettingsDialogComponent, {
            data: {
                swimlane,
                // widgets: this.topicWidgets,
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
                // parse grid string
                if (editedSwimlane.grid) {
                    editedSwimlane.grid = JSON.parse(editedSwimlane.grid);
                }
                // TODO: detect, whether a change was made
                if (JSON.stringify(editedSwimlane) === JSON.stringify(swimlane)) {
                    console.log('DEBUG: Return, because no change was made.');
                    return;
                }
                this.requestInProgress = true;
                await this.checkForCustomPageNodeExistence();
                const pageVariant: PageVariantConfig = this.retrievePageVariant();
                if (!pageVariant) {
                    this.requestInProgress = false;
                }
                // create a copy of the swimlanes
                const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
                // store updated swimlane in config
                swimlanesCopy[index] = editedSwimlane;
                // overwrite swimlanes
                pageVariant.structure.swimlanes = swimlanesCopy;
                await this.setProperty(
                    this.pageVariantNode.ref.id,
                    pageVariantConfigType,
                    JSON.stringify(pageVariant),
                );
                // visually change swimlanes
                console.log('DEBUG: Overwrite swimlanes', pageVariant.structure.swimlanes);
                this.swimlanes = pageVariant.structure.swimlanes;
                this.requestInProgress = false;
            }
            console.log('Closed', result?.value);
        });
    }

    /**
     * Delete a swimlane from the page with possible widget nodes and persist it in the config.
     */
    async deleteSwimlane(index: number) {
        if (
            this.swimlanes?.[index] &&
            confirm('Wollen Sie dieses Element wirklich löschen?') === true
        ) {
            this.requestInProgress = true;
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.requestInProgress = false;
            }
            // delete possible nodes defined in the swimlane
            // forEach does not support async / await
            // -> for ... of ... (https://stackoverflow.com/a/37576787)
            if (this.swimlanes[index].grid) {
                for (const widget of this.swimlanes[index].grid) {
                    if (widget.nodeId) {
                        const nodeId: string =
                            widget.nodeId.split('/')?.[widget.nodeId.split('/').length - 1];
                        await firstValueFrom(this.nodeApi.deleteNode(nodeId)).then(
                            () => {
                                console.log('Deleted child node');
                            },
                            () => {
                                console.log('Error deleting node');
                            },
                        );
                    }
                }
            }
            const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
            swimlanesCopy.splice(index, 1);
            pageVariant.structure.swimlanes = swimlanesCopy;
            await this.setProperty(
                this.pageVariantNode.ref.id,
                pageVariantConfigType,
                JSON.stringify(pageVariant),
            );
            // delete swimlane visually as soon as the requests are done
            this.swimlanes.splice(index, 1);
            this.requestInProgress = false;
        }
    }

    /**
     * Helper function to remove possible existing nodeIds from page variant config.
     */
    private removeNodeIdsFromPageVariantConfig(pageVariant: PageVariantConfig): void {
        pageVariant.structure.swimlanes?.forEach((swimlane: Swimlane) => {
            swimlane.grid?.forEach((gridItem: GridTile) => {
                if (gridItem.nodeId) {
                    delete gridItem.nodeId;
                }
            });
        });
    }

    /**
     * Calls the z-API to invoke ChatGPT.
     */
    private async generateFromPrompt(): Promise<void> {
        const result: TextPromptEntity = await firstValueFrom(
            this.aiTextPromptsService.publicPrompt({
                widgetNodeId: defaultTopicTextNodeId,
                contextNodeId: this.topicCollectionID(),
                body: {},
            }),
        );
        const response = result?.responses[0];
        if (response) {
            this.generatedHeader.set(response);
        }
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

    protected readonly defaultMds: string = defaultMds;
    protected readonly providedSelectDimensionKeys: string[] = providedSelectDimensionKeys;
}
