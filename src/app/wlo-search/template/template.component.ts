import { CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnInit, signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
    ApiRequestConfiguration,
    AuthenticationService,
    CollectionReference,
    CollectionService,
    FacetsDict,
    HOME_REPOSITORY,
    MdsValue,
    MdsWidget,
    Node,
    NodeEntries,
    NodeService,
    ReferenceEntries,
    SearchService,
} from 'ngx-edu-sharing-api';
import { Facet } from 'ngx-edu-sharing-api/lib/api/models/facet';
import { ParentEntries } from 'ngx-edu-sharing-api/lib/api/models/parent-entries';
import { SearchResultNode } from 'ngx-edu-sharing-api/lib/api/models/search-result-node';
import { Value } from 'ngx-edu-sharing-api/lib/api/models/value';
import { EduSharingUiCommonModule, SpinnerComponent } from 'ngx-edu-sharing-ui';
import {
    FilterBarComponent,
    SideMenuItemComponent,
    SideMenuWrapperComponent,
    StatisticChart,
    StatisticsSummaryComponent,
    TopicHeaderComponent,
    TopicsColumnBrowserComponent,
} from 'ngx-edu-sharing-wlo-pages';
import { firstValueFrom, Observable } from 'rxjs';
import { filter, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { ViewService } from '../core/view.service';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { AddSwimlaneBorderButtonComponent } from './add-swimlane-button/add-swimlane-border-button.component';
import {
    defaultLrt,
    defaultMds,
    defaultTopicTextNodeId,
    defaultTopicsColumnBrowserNodeId,
    initialLocaleString,
    initialTopicColor,
    ioType,
    lrtBaseUrl,
    lrtIdsEvents,
    lrtIdsLessonPlanning,
    lrtIdsMedia,
    lrtIdsPracticeMaterials,
    lrtIdsSources,
    lrtIdsTools,
    mapType,
    pageConfigPropagateType,
    pageConfigRefType,
    pageConfigType,
    retrieveCustomUrl,
    pageVariantConfigType,
    parentPageConfigNodeId,
    pageConfigPrefix,
    pageConfigAspect,
    pageVariantConfigPrefix,
    pageVariantConfigAspect,
    pageVariantIsTemplateType,
    profilingFilterbarDimensionKeys,
    verticalFilterbarDimensionKeys,
    widgetConfigAspect,
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
        AddSwimlaneBorderButtonComponent,
        CdkDragHandle,
        EduSharingUiCommonModule,
        FilterBarComponent,
        SearchModule,
        SharedModule,
        SideMenuItemComponent,
        SideMenuWrapperComponent,
        SpinnerComponent,
        StatisticsSummaryComponent,
        SwimlaneComponent,
        TemplateComponent,
        TopicHeaderComponent,
        TopicsColumnBrowserComponent,
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    private readonly facets$: Observable<FacetsDict> = this.searchService
        .observeFacets([defaultLrt], { includeActiveFilters: true })
        .pipe(shareReplay(1));

    constructor(
        private apiRequestConfig: ApiRequestConfiguration,
        private authService: AuthenticationService,
        private collectionService: CollectionService,
        private dialog: MatDialog,
        private nodeApi: NodeService,
        private route: ActivatedRoute,
        private searchService: SearchService,
        private viewService: ViewService,
    ) {
        // Subscribe early, so required data will be fetched with search requests.
        this.facets$.subscribe();
    }

    @HostBinding('style.--topic-color') topicColor: string = initialTopicColor;

    initialLoadSuccessfully: boolean = false;
    requestInProgress: boolean = false;
    private initializedWithParams: boolean = false;

    userHasEditRights: WritableSignal<boolean> = signal(false);
    editMode: boolean = false;

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);

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

    selectedMenuItem: string = '';
    actionItems = {
        editMode: 'Bearbeitungsmodus',
        previewMode: 'Zurück zur Vorschau',
    };

    menuItems = {
        feedback: 'Feedback',
        profiling: 'Profilierung',
        statistics: 'Statistiken',
        topicTree: 'Themenbaum',
    };

    // statistics related variables
    searchResultCount: number = 0;
    searchUrl: string = '';
    lrtMapping: Map<string, string[]> = new Map<string, string[]>();
    // TODO: find better option for line breaks than <br>
    statistics: StatisticChart[] = [
        new StatisticChart('Medien', 'collections', lrtIdsMedia),
        new StatisticChart('Unterrichts<br>planung', 'import_contacts', lrtIdsLessonPlanning),
        new StatisticChart(
            'Praxis<br>materialien',
            'sentiment_satisfied_alt',
            lrtIdsPracticeMaterials,
        ),
        new StatisticChart('Quellen', 'language', lrtIdsSources),
        new StatisticChart('Tools', 'home_repair_service', lrtIdsTools),
        new StatisticChart('Bildungs<br>angebote', 'school', lrtIdsEvents),
    ];
    statisticsLoaded: boolean = false;

    get filterBarReady(): boolean {
        const sameNumberOfValues =
            this.selectDimensions.size === this.selectedDimensionValues.length;
        return this.selectDimensionsLoaded && sameNumberOfValues;
    }

    private get selectedDimensionValueIds(): string[] {
        return this.selectedDimensionValues.map((value: MdsValue) => value.id);
    }

    async ngOnInit(): Promise<void> {
        // retrieve the learning resource types for the statistics
        for (const statistic of this.statistics) {
            await this.retrieveAndSetLrtVocab(statistic);
        }
        // retrieve the search URL
        this.searchUrl = this.retrieveSearchUrl();
        // set the default language for API requests
        this.apiRequestConfig.setLocale(initialLocaleString);
        // set the topic based on the query param "collectionID"
        this.route.queryParams
            .pipe(filter((params) => params.topic || params.collectionId))
            .subscribe(async (params) => {
                // due to reconnect with queryParams, this might be called twice, thus, initializedWithParams is important
                if (params.collectionId && !this.initializedWithParams) {
                    // request the references of the collection (retrieved from wirlernenonline-theme/page-templates/template_themenseite.php L.135)
                    const referenceEntries: ReferenceEntries = await firstValueFrom(
                        this.collectionService.getReferences({
                            repository: HOME_REPOSITORY,
                            collection: params.collectionId,
                            sortProperties: ['ccm:collection_ordered_position'],
                            sortAscending: [true],
                        }),
                    );
                    // filter out deleted references
                    const nonDeletedReferences: CollectionReference[] =
                        referenceEntries.references.filter(
                            (ref: CollectionReference) => !!ref.originalId,
                        );
                    // post process those
                    this.statistics.forEach((statistic: StatisticChart) => {
                        const filteredReferences: CollectionReference[] = this.filterContents(
                            nonDeletedReferences,
                            statistic.vocab,
                        );
                        statistic.data.editorialCount = filteredReferences.length;
                        statistic.data.oerCount =
                            filteredReferences.filter((ref: CollectionReference) => this.isOer(ref))
                                ?.length ?? 0;
                    });
                    // set the topicCollectionID
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
                    // perform search to retrieve the number of search results
                    const searchResult: SearchResultNode = await this.performSearch(this.topic());
                    this.searchResultCount = searchResult.pagination.total;

                    // use facets to retrieve the number of items for different learning resource types
                    const facets: Value[] =
                        searchResult.facets?.find((facet: Facet) => facet.property === defaultLrt)
                            ?.values ?? [];
                    this.statistics.forEach((statistic: StatisticChart) => {
                        let count: number = 0;
                        facets.forEach((facet: Value) => {
                            if (statistic.vocab.includes(facet.value)) {
                                count += facet.count;
                            }
                        });
                        statistic.data.totalCount = count;
                        // TODO: This is caused by the use of different methods to calculate these counts.
                        //       This workaround should not be necessary, if a reliable solution does exist.
                        if (statistic.data.totalCount < statistic.data.editorialCount) {
                            statistic.data.totalCount = statistic.data.editorialCount;
                        }
                    });
                    this.statisticsLoaded = true;

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
                    // 6) everything loaded
                    this.initialLoadSuccessfully = true;
                }
            });
    }

    /**
     * Helper function to request a learning resource type with a given ID.
     *
     * @param lrtId
     */
    private async getNewLrtList(lrtId: string): Promise<string[]> {
        let newLrtList: string[] = [];
        if (!this.lrtMapping.get(lrtId)) {
            const url: string = lrtBaseUrl + lrtId + '.json';
            try {
                const response: Response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const vocabJson = await response.json();
                newLrtList.push(vocabJson.id);

                if (vocabJson.narrower?.length > 0) {
                    vocabJson.narrower.forEach((narrow) => {
                        newLrtList.push(narrow.id);
                    });
                }
                this.lrtMapping.set(lrtId, newLrtList);
            } catch (error) {
                console.error(error.message);
            }
        }

        return this.lrtMapping.get(lrtId) ?? [];
    }

    /**
     * Helper function to retrieve the learning resource types including narrow elements and store them into the given statistic object.
     *
     * @param statistic
     */
    private async retrieveAndSetLrtVocab(statistic: StatisticChart): Promise<void> {
        let vocab: string[] = [];

        for (const lrtId of statistic.relatedLrtIds) {
            const lrtVocab: string[] = await this.getNewLrtList(lrtId);
            vocab = vocab.concat(lrtVocab);
        }

        statistic.vocab = vocab;
    }

    /**
     * Helper function to filter a given content array with given vocab IDs.
     *
     * @param contentArray
     * @param vocabIds
     */
    private filterContents(
        contentArray: CollectionReference[],
        vocabIds: string[],
    ): CollectionReference[] {
        const filteredContent: CollectionReference[] = [];
        contentArray.forEach((content: CollectionReference) => {
            if (
                content.properties?.[defaultLrt]?.some((lrtId: string) => vocabIds.includes(lrtId))
            ) {
                filteredContent.push(content);
            }
        });
        return filteredContent;
    }

    /**
     * Helper function to decide, whether a given node contains OER content or not.
     *
     * @param node
     */
    private isOer(node: CollectionReference): boolean {
        const oerLicenses: string[] = ['CC_0', 'CC_BY', 'CC_BY_SA', 'PDM'];
        const nodeLicense: string = node.properties?.['ccm:commonlicense_key']?.[0] ?? '';
        return oerLicenses.includes(nodeLicense);
    }

    /**
     * Helper function to retrieve the search URL.
     */
    private retrieveSearchUrl(): string {
        // take into account potential sub-paths, e.g., due to language switch
        const pathNameArray: string[] = window.location.pathname.split('/');
        // example pathNameArray = [ "", "de", "template" ]
        const suffix: string =
            pathNameArray.length > 2 && pathNameArray[1] !== '' ? '/' + pathNameArray[1] : '';
        return window.location.origin + suffix + '/search';
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

    /**
     * Helper function to perform a search for a given search term and max items.
     *
     * @param searchTerm
     * @param maxItems
     */
    private async performSearch(
        searchTerm: string,
        maxItems: number = 0,
    ): Promise<SearchResultNode> {
        const criteria = [
            {
                property: 'ngsearchword',
                values: [searchTerm],
            },
        ];
        return this.searchService
            .search({
                query: 'ngsearch',
                repository: HOME_REPOSITORY,
                maxItems,
                contentType: 'ALL',
                metadataset: this.defaultMds,
                body: {
                    criteria,
                    resolveCollections: true,
                },
            })
            .toPromise();
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
     * Called by app-swimlane gridTileAdded output event.
     * Handles the addition of a tile to the grid of a specified swimlane.
     */
    async handleAddGridTile(gridTile: GridTile, swimlaneIndex: number): Promise<void> {
        // change the swimlane first
        if (!this.swimlanes[swimlaneIndex].grid) {
            this.swimlanes[swimlaneIndex].grid = [];
        }
        this.swimlanes[swimlaneIndex].grid.push(gridTile);

        // persist the state afterward
        await this.checkForCustomPageNodeExistence();
        const pageVariant: PageVariantConfig = this.retrievePageVariant();
        if (!pageVariant) {
            // TODO: rollback necessary
        }
        pageVariant.structure.swimlanes = this.swimlanes;
        await this.setProperty(
            this.pageVariantNode.ref.id,
            pageVariantConfigType,
            JSON.stringify(pageVariant),
        );
        // TODO: rollback necessary, if the request is not successful
    }

    /**
     * Called by app-swimlane nodeClicked output event.
     * Handles the unselection of the current node and the selection of the clicked node.
     */
    handleNodeChange(node: Node): void {
        // TODO: there might be better ways to work with the Observable, however, using
        //       subscribe resulted in circulation
        firstValueFrom(this.viewService.getSelectedItem()).then((currentNode: Node) => {
            let selectedNode: Node;
            // no node was selected yet
            if (!currentNode) {
                this.viewService.selectItem(node);
                selectedNode = node;
            }
            // another node was selected
            else if (currentNode !== node) {
                this.viewService.unselectItem();
                this.viewService.selectItem(node);
                selectedNode = node;
            }
            // the same node was selected again
            else {
                this.viewService.unselectItem();
                selectedNode = null;
            }
            // send CustomEvent back as acknowledgement
            const customEvent = new CustomEvent('selectedNodeUpdated', {
                detail: {
                    selectedNode,
                },
            });
            // dispatch the event
            document.getElementsByTagName('body')[0].dispatchEvent(customEvent);
        });
    }

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
    async addSwimlane(type: string, positionToAdd: number): Promise<void> {
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
        swimlanesCopy.splice(positionToAdd, 0, newSwimlane);
        pageVariant.structure.swimlanes = swimlanesCopy;
        await this.setProperty(
            this.pageVariantNode.ref.id,
            pageVariantConfigType,
            JSON.stringify(pageVariant),
        );
        // add swimlane visually as soon as the requests are done
        this.swimlanes.splice(positionToAdd, 0, newSwimlane);
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
     * Function to call on wlo-side-menu-item itemClicked output.
     */
    collapsibleItemClicked(item: string) {
        if (this.selectedMenuItem === item) {
            this.selectedMenuItem = '';
        } else {
            this.selectedMenuItem = item;
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
    protected readonly defaultTopicTextNodeId: string = defaultTopicTextNodeId;
    protected readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    protected readonly profilingFilterbarDimensionKeys: string[] = profilingFilterbarDimensionKeys;
    protected readonly retrieveCustomUrl = retrieveCustomUrl;
    protected readonly verticalFilterbarDimensionKeys: string[] = verticalFilterbarDimensionKeys;
}
