import { CdkAccordionItem } from '@angular/cdk/accordion';
import { CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    Component,
    computed,
    HostBinding,
    OnInit,
    QueryList,
    Signal,
    signal,
    ViewChildren,
    WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
    TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
import { SpinnerComponent } from 'ngx-edu-sharing-ui';
import {
    ColorChangeEvent,
    EditableTextComponent,
    FilterBarComponent,
    SideMenuItemComponent,
    SideMenuWrapperComponent,
    StatisticChart,
    StatisticsSummaryComponent,
    TopicHeaderComponent,
    TopicsColumnBrowserComponent,
    WidgetNodeAddedEvent,
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
    widgetConfigAspect,
    workspaceSpacesStorePrefix,
} from './shared/custom-definitions';
import { GridTile } from './shared/types/grid-tile';
import { PageConfig } from './shared/types/page-config';
import { PageVariantConfig } from './shared/types/page-variant-config';
import { Swimlane } from './shared/types/swimlane';
import { getTopicColor } from './shared/utils/template-util';
import { SwimlaneComponent } from './swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';

@Component({
    standalone: true,
    imports: [
        AddSwimlaneBorderButtonComponent,
        CdkDragHandle,
        EditableTextComponent,
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
    private readonly SAVE_CONFIG_ACTION: string = 'Schließen';
    private readonly SAVE_CONFIG_MESSAGE: string = 'Ihre Änderungen werden gespeichert.';
    private readonly SAVE_CONFIG_ERROR_ACTION: string = 'Seite neuladen';
    private readonly SAVE_CONFIG_ERROR_MESSAGE: string =
        'Beim Laden einer Ressource ist ein Fehler aufgetreten. Bitte laden Sie die Seite neu.';

    constructor(
        private apiRequestConfig: ApiRequestConfiguration,
        private authService: AuthenticationService,
        private collectionService: CollectionService,
        private dialog: MatDialog,
        private nodeApi: NodeService,
        private route: ActivatedRoute,
        private router: Router,
        private searchService: SearchService,
        private snackbar: MatSnackBar,
        private viewService: ViewService,
    ) {}

    @HostBinding('style.--topic-color') topicColor: string = initialTopicColor;
    @ViewChildren('accordionItem') accordions: QueryList<CdkAccordionItem>;

    initialLoadSuccessfully: WritableSignal<boolean> = signal(false);
    requestInProgress: WritableSignal<boolean> = signal(false);
    private initializedWithParams: boolean = false;

    userHasEditRights: WritableSignal<boolean> = signal(false);
    editMode: boolean = false;

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);

    private collectionNode: Node;
    collectionNodeHasPageConfig: boolean = false;
    headerNodeId: WritableSignal<string> = signal(null);
    private pageConfigNode: Node;
    pageConfigCheckFailed: WritableSignal<boolean> = signal(false);
    pageVariantConfigs: NodeEntries;
    private pageVariantDefaultPosition: number = -1;
    pageVariantNode: Node;
    private selectedVariantPosition: number = -1;
    showLoadingScreen: Signal<boolean> = computed(
        (): boolean =>
            !this.pageConfigCheckFailed() &&
            (!this.initialLoadSuccessfully() || this.requestInProgress()),
    );
    swimlanes: Swimlane[] = [];
    topicWidgets: NodeEntries;

    latestParams: Params;
    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    selectedDimensionValues: MdsValue[] = [];
    selectDimensionsLoaded: boolean = false;

    selectedMenuItem: string = '';
    actionItems = {
        editMode: 'Seite bearbeiten',
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

    /**
     * Returns an array of IDs of currently selected dimension values (output by wlo-filter-bar).
     */
    private get selectedDimensionValueIds(): string[] {
        return this.selectedDimensionValues.map((value: MdsValue) => value.id);
    }

    /**
     * Initializes the component by setting general defaults and retrieving the collection node,
     * page config and statistics.
     */
    async ngOnInit(): Promise<void> {
        // retrieve the search URL
        this.searchUrl = this.retrieveSearchUrl();
        // set the default language for API requests
        this.apiRequestConfig.setLocale(initialLocaleString);
        // set the topic based on the query param "collectionID"
        this.route.queryParams
            .pipe(filter((params: Params) => params.collectionId))
            .subscribe(async (params: Params): Promise<void> => {
                this.latestParams = params;
                // due to reload with queryParams, this might be called twice, thus, initializedWithParams is important
                if (params.collectionId && !this.initializedWithParams) {
                    // set the topicCollectionID
                    this.topicCollectionID.set(params.collectionId);
                    this.initializedWithParams = true;
                    // login for local development
                    const username = environment?.eduSharingUsername;
                    const password = environment?.eduSharingPassword;
                    // TODO: This fix for local development currently only works in Firefox
                    if (username && password) {
                        await firstValueFrom(this.authService.login(username, password));
                    }
                    try {
                        // fetch the collection node to set the topic name, color and check the user access
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
                        this.topicColor = getTopicColor(this.topic());

                        // retrieve the page config node and select the proper variant to define the headerNodeId + swimlanes
                        await this.retrievePageConfigAndSelectVariant(params.variantId);

                        // initial load finished (page structure loaded)
                        this.initialLoadSuccessfully.set(true);

                        // post-load the statistics
                        await this.postLoadStatistics(params.collectionId);
                    } catch (err) {
                        this.commonCatchFunction();
                    }
                }
            });
    }

    // HELPERS FOR INITIALIZATION
    /**
     * Helper function to retrieve the page config node, select the proper variant and define the headerNodeId + swimlanes.
     *
     * @param variantId
     */
    private async retrievePageConfigAndSelectVariant(variantId?: string): Promise<void> {
        // retrieve the page config node either by checking the node itself or by iterating the parents of the collectionNode
        if (!this.pageConfigNode?.ref.id) {
            this.pageConfigNode = await this.retrievePageConfigNode(this.collectionNode);
            if (!this.pageConfigNode) {
                return;
            }
        }
        // parse the page config from the properties
        const pageConfig: PageConfig = this.pageConfigNode.properties[pageConfigType]?.[0]
            ? JSON.parse(this.pageConfigNode.properties[pageConfigType][0])
            : {};
        if (!pageConfig.variants) {
            console.error('pageConfig does not include variants', pageConfig);
            return;
        }
        // retrieve the page variant configs
        if (!this.pageVariantConfigs) {
            this.pageVariantConfigs = await this.getNodeChildren(this.pageConfigNode.ref.id);
        }
        // default the ID with the default or the first occurrence
        this.pageVariantDefaultPosition = pageConfig.variants.indexOf(pageConfig.default);
        // select the proper variant (initialize with default or first variant)
        let selectedVariantId: string = pageConfig.default ?? pageConfig.variants[0];
        selectedVariantId = selectedVariantId.split('/')?.[selectedVariantId.split('/').length - 1];
        // if a variantId is provided, override it
        if (variantId) {
            selectedVariantId = variantId;
        }
        // otherwise, iterate the variant configs and select the one with the most matching variables
        else {
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
                        if (this.selectedDimensionValueIds.includes(variantConfig.variables[key])) {
                            matchesCount += 1;
                        }
                    });
                    // select the variant with the most matches
                    if (matchesCount > highestNumberOfMatches) {
                        selectedVariantId = variantNode.ref.id;
                    }
                }
            });
        }
        // hold the position of the selected variant for later retrieval
        const newSelectedVariantPosition: number = pageConfig.variants.indexOf(
            workspaceSpacesStorePrefix + selectedVariantId,
        );
        const initialLoad: boolean = this.selectedVariantPosition === -1;
        const pageVariantChanged: boolean =
            !initialLoad && newSelectedVariantPosition !== this.selectedVariantPosition;
        // if the variant was not selected yet or was changed, reload the page structure
        if (initialLoad || pageVariantChanged) {
            this.selectedVariantPosition = newSelectedVariantPosition;
            // retrieve the variant config node of the page
            this.pageVariantNode = this.pageVariantConfigs.nodes?.find(
                (node: Node) => node.ref.id === selectedVariantId,
            );
            const pageVariant: PageVariantConfig = this.pageVariantNode.properties[
                pageVariantConfigType
            ]?.[0]
                ? JSON.parse(this.pageVariantNode.properties[pageVariantConfigType][0])
                : {};
            if (!pageVariant.structure) {
                console.error('No structure was found in pageVariant', this.pageVariantNode);
                return;
            }
            // if page config was retrieved from parent,
            // remove possible existing nodeIds from swimlane grids
            if (!this.collectionNode.properties[pageConfigRefType]?.[0]) {
                this.removeNodeIdsFromPageVariantConfig(pageVariant);
            }
            // set the headerNodeId + swimlanes
            this.headerNodeId.set(pageVariant.structure.headerNodeId);
            this.swimlanes = pageVariant.structure.swimlanes ?? [];
        }
    }

    /**
     * Helper function to post-load the statistics for a given collection ID.
     */
    private async postLoadStatistics(collectionId: string): Promise<void> {
        // retrieve the learning resource types for the statistics
        for (const statistic of this.statistics) {
            await this.retrieveAndSetLrtVocab(statistic);
        }
        // request the references of the collection (retrieved from wirlernenonline-theme/page-templates/template_themenseite.php L.135)
        const referenceEntries: ReferenceEntries = await firstValueFrom(
            this.collectionService.getReferences({
                repository: HOME_REPOSITORY,
                collection: collectionId,
                sortProperties: ['ccm:collection_ordered_position'],
                sortAscending: [true],
            }),
        );
        // filter out deleted references
        const nonDeletedReferences: CollectionReference[] = referenceEntries.references.filter(
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
                filteredReferences.filter((ref: CollectionReference) => this.isOer(ref))?.length ??
                0;
        });

        // subscribe to facets right before performing the search request to avoid conflicts with the user-configurable
        this.facets$.subscribe();
        // perform search to retrieve the number of search results
        const searchResult: SearchResultNode = await this.performSearch(this.topic());
        this.searchResultCount = searchResult.pagination.total;

        // use facets to retrieve the number of items for different learning resource types
        const facets: Value[] =
            searchResult.facets?.find((facet: Facet) => facet.property === defaultLrt)?.values ??
            [];
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
            async (e: CustomEvent<ColorChangeEvent>): Promise<void> => {
                console.log('DEBUG: colorChange event', e);
                const colorChangeDetails: ColorChangeEvent = e.detail;
                const color: string = colorChangeDetails?.color ?? '';
                const pageVariantNode: Node = colorChangeDetails?.pageVariantNode ?? null;
                const swimlaneIndex: number = colorChangeDetails?.swimlaneIndex ?? -1;

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
            async (e: CustomEvent<WidgetNodeAddedEvent>): Promise<void> => {
                console.log('DEBUG: widgetNodeAdded event', e);
                const widgetNodeDetails: WidgetNodeAddedEvent = e.detail;
                const pageVariantNode: Node = widgetNodeDetails?.pageVariantNode ?? null;
                const swimlaneIndex: number = widgetNodeDetails?.swimlaneIndex ?? -1;
                const gridIndex: number = widgetNodeDetails?.gridIndex ?? -1;
                const widgetNodeId: string = widgetNodeDetails?.widgetNodeId ?? '';
                const isHeaderNode: boolean = widgetNodeDetails?.isHeaderNode ?? false;

                const validWidgetNodeId: boolean = widgetNodeId && widgetNodeId !== '';
                const validParentVariant: boolean =
                    pageVariantNode && pageVariantNode.ref.id === this.pageVariantNode.ref.id;
                const validSwimlaneIndex: boolean = swimlaneIndex > -1;
                const validGridIndex: boolean = gridIndex > -1;

                const validInputs: boolean = validGridIndex && validSwimlaneIndex;

                let addedSuccessfully: boolean = false;
                if (validWidgetNodeId && validParentVariant && (validInputs || isHeaderNode)) {
                    // convert widget node ID, if necessary
                    const convertedWidgetNodeId: string = widgetNodeId.includes(
                        workspaceSpacesStorePrefix,
                    )
                        ? widgetNodeId
                        : workspaceSpacesStorePrefix + widgetNodeId;
                    // if no page configuration exists yet, a config has to be created and a reload of the page is necessary
                    // TODO: we currently assume that adding is successfully, when creating a new page node.
                    //       This might be improved by inputting validWidgetNodeId and deleting internally.
                    addedSuccessfully = await this.checkForCustomPageNodeExistence(
                        swimlaneIndex,
                        gridIndex,
                        convertedWidgetNodeId,
                        isHeaderNode,
                    );
                    // if no page node was created, the adding is not yet successfully, so updating is necessary
                    if (!addedSuccessfully) {
                        // TODO: reuse updatePageVariantConfig function, if possible
                        const pageVariant: PageVariantConfig = this.retrievePageVariant();
                        // modify header nodeId
                        if (isHeaderNode) {
                            pageVariant.structure.headerNodeId = convertedWidgetNodeId;
                            this.headerNodeId.set(pageVariant.structure.headerNodeId);
                            await this.setProperty(
                                this.pageVariantNode.ref.id,
                                pageVariantConfigType,
                                JSON.stringify(pageVariant),
                            );
                            addedSuccessfully = true;
                        }
                        // modify nodeId of swimlane grid tile
                        else if (
                            this.swimlanes?.[swimlaneIndex]?.grid?.[gridIndex] &&
                            pageVariant
                        ) {
                            this.swimlanes[swimlaneIndex].grid[gridIndex].nodeId =
                                convertedWidgetNodeId;
                            pageVariant.structure.swimlanes = this.swimlanes;
                            await this.setProperty(
                                this.pageVariantNode.ref.id,
                                pageVariantConfigType,
                                JSON.stringify(pageVariant),
                            );
                            addedSuccessfully = true;
                        }
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

    /**
     * Parses the page config ref of the collection and returns the proper page config node.
     * If no page config ref is set, check whether a parent propagates one.
     *
     * @param node
     */
    private async retrievePageConfigNode(node: Node): Promise<Node> {
        // check, whether the node itself has a pageConfigRef
        let pageRef: string = node.properties[pageConfigRefType]?.[0];
        this.collectionNodeHasPageConfig = !!pageRef;
        // otherwise, iterate the parents to retrieve the pageConfigRef, if pageConfigPropagate is set
        if (!pageRef) {
            const parents: ParentEntries = await firstValueFrom(
                this.nodeApi.getParents(node.ref.id, {
                    propertyFilter: ['-all-'],
                    fullPath: false,
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
                this.pageConfigCheckFailed.set(false);
                return await firstValueFrom(this.nodeApi.getNode(pageNodeId));
            }
        }
        this.pageConfigCheckFailed.set(true);
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
     * Called by app-swimlane gridUpdated output event.
     * Handles the update of the grid of a given swimlane.
     */
    async handleGridUpdate(grid: GridTile[], swimlaneIndex: number): Promise<void> {
        // overwrite swimlane grid
        this.swimlanes[swimlaneIndex].grid = grid;

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
        // iterate incoming select dimensions and insert new or overwrite existing ones
        event.forEach((value: MdsWidget, key: string): void => {
            this.selectDimensions.set(key, value);
        });
        this.selectDimensionsLoaded = true;
    }

    /**
     * Called by wlo-filter-bar selectValuesChanged output event.
     */
    selectValuesChanged(): void {
        if (!this.latestParams) {
            return;
        }
        // changes are detected using the URL params to also include values of different filterbars
        // convert both select dimension keys and params into the same format
        // Map<$virtual:key$, ...> => [key, ...]
        const convertedSelectDimensionKeys: string[] = Array.from(this.selectDimensions.keys())
            .map((key: string) => key.split('$')?.[1] ?? key)
            .map((key: string) => key.split('virtual:')?.[1] ?? key);
        const latestParamKeys: string[] = Object.keys(this.latestParams);
        const selectedDimensionValues: MdsValue[] = [];
        // iterate over select dimension keys to ensure correct positioning
        convertedSelectDimensionKeys.forEach((dimensionKey) => {
            if (latestParamKeys.includes(dimensionKey)) {
                selectedDimensionValues.push({
                    id: this.latestParams[dimensionKey],
                });
            } else {
                console.log(
                    'DEBUGGING: Not included in params -> push empty string',
                    this.latestParams,
                    dimensionKey,
                );
                selectedDimensionValues.push({
                    id: '',
                });
            }
        });
        this.selectedDimensionValues = selectedDimensionValues;
        // if necessary, reload the pageVariants
        if (this.initialLoadSuccessfully()) {
            void this.retrievePageConfigAndSelectVariant(this.latestParams.variantId);
        }
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
     * Helper function to add a possible non-existing page config node.
     */
    private async checkForCustomPageNodeExistence(
        swimlaneIndex?: number,
        gridIndex?: number,
        widgetNodeId?: string,
        isHeaderNode?: boolean,
    ): Promise<boolean> {
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
            const pageVariants: string[] = [];
            // iterate variant config nodes (of template) and create ccm:io child nodes for it
            if (this.pageVariantConfigs.nodes?.length > 0) {
                for (const variantNode of this.pageVariantConfigs.nodes) {
                    let pageConfigVariantNode: Node = await this.createChild(
                        this.pageConfigNode.ref.id,
                        ioType,
                        pageVariantConfigPrefix + uuidv4(),
                        pageVariantConfigAspect,
                    );
                    pageVariants.push(workspaceSpacesStorePrefix + pageConfigVariantNode.ref.id);
                    const variantConfig: PageVariantConfig = variantNode.properties[
                        pageVariantConfigType
                    ]?.[0]
                        ? JSON.parse(variantNode.properties[pageVariantConfigType][0])
                        : {};
                    this.removeNodeIdsFromPageVariantConfig(variantConfig);
                    this.updatePageVariantConfig(
                        variantConfig,
                        swimlaneIndex,
                        gridIndex,
                        widgetNodeId,
                        isHeaderNode,
                    );
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
            // for debugging purposes, hold the collection ID as well
            if (this.topicCollectionID()) {
                pageConfig.collectionId = workspaceSpacesStorePrefix + this.topicCollectionID();
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
            this.headerNodeId.set(pageVariant.structure.headerNodeId);
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
     * Adds a new swimlane to the page and persist it in the config.
     */
    async addSwimlane(newSwimlane: Swimlane, positionToAdd: number): Promise<void> {
        // TODO: Move into shared function
        this.requestInProgress.set(true);
        const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast();
        await this.checkForCustomPageNodeExistence();
        const pageVariant: PageVariantConfig = this.retrievePageVariant();
        if (!pageVariant) {
            this.closeToastWithDelay(toastContainer);
            this.requestInProgress.set(false);
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
        this.closeToastWithDelay(toastContainer);
        this.requestInProgress.set(false);
    }

    /**
     * Move the position of a swimlane on the page and persist it in the config.
     */
    async moveSwimlanePosition(oldIndex: number, newIndex: number) {
        if (newIndex >= 0 && newIndex <= this.swimlanes.length - 1) {
            this.requestInProgress.set(true);
            const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast();
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.closeToastWithDelay(toastContainer);
                this.requestInProgress.set(false);
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
            this.closeToastWithDelay(toastContainer);
            this.requestInProgress.set(false);
        }
    }

    /**
     * Reacts to wlo-editable-text textChange output event by persisting the changes in the page config.
     *
     * @param title
     * @param swimlane
     */
    async swimlaneTitleChanged(title: string, swimlane: Swimlane) {
        this.requestInProgress.set(true);
        const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast();
        await this.checkForCustomPageNodeExistence();
        const pageVariant: PageVariantConfig = this.retrievePageVariant();
        if (!pageVariant) {
            this.closeToastWithDelay(toastContainer);
            this.requestInProgress.set(false);
        }
        swimlane.heading = title;
        pageVariant.structure.swimlanes = this.swimlanes;
        await this.setProperty(
            this.pageVariantNode.ref.id,
            pageVariantConfigType,
            JSON.stringify(pageVariant),
        );
        this.closeToastWithDelay(toastContainer);
        this.requestInProgress.set(false);
    }

    editSwimlane(swimlane: Swimlane, index: number) {
        const dialogRef = this.dialog.open(SwimlaneSettingsDialogComponent, {
            data: {
                swimlane,
                // widgets: this.topicWidgets,
            },
            minWidth: '700px',
            maxWidth: '100%',
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
                this.requestInProgress.set(true);
                const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast();
                await this.checkForCustomPageNodeExistence();
                const pageVariant: PageVariantConfig = this.retrievePageVariant();
                if (!pageVariant) {
                    this.closeToastWithDelay(toastContainer);
                    this.requestInProgress.set(false);
                }
                // create a copy of the swimlanes
                const stringifiedSwimlanes: string = JSON.stringify(this.swimlanes ?? []);
                const swimlanesCopy = JSON.parse(stringifiedSwimlanes);
                // retrieve deleted widget node IDs (previously existing node IDs must still exist)
                const deletedWidgetNodeIds: string[] = [];
                const stringifiedEditedSwimlane: string = JSON.stringify(editedSwimlane);
                // iterate swimlane and detect potentially deleted node IDs
                swimlane?.grid?.forEach((gridItem: GridTile): void => {
                    // nodeId exists, but is no longer included in the edited swimlane
                    if (
                        !!gridItem.nodeId &&
                        gridItem.nodeId !== '' &&
                        !stringifiedEditedSwimlane.includes(gridItem.nodeId)
                    ) {
                        deletedWidgetNodeIds.push(gridItem.nodeId);
                    }
                });
                // store updated swimlane in config
                swimlanesCopy[index] = editedSwimlane;
                // overwrite swimlanes
                pageVariant.structure.swimlanes = swimlanesCopy;
                await this.setProperty(
                    this.pageVariantNode.ref.id,
                    pageVariantConfigType,
                    JSON.stringify(pageVariant),
                );
                // afterward, delete config nodes of removed widgets
                for (const nodeId of deletedWidgetNodeIds) {
                    // retrieve correct nodeId
                    const widgetNodeId: string = nodeId.includes(workspaceSpacesStorePrefix)
                        ? nodeId.split('/')?.[nodeId.split('/').length - 1]
                        : nodeId;
                    await firstValueFrom(this.nodeApi.deleteNode(widgetNodeId));
                }
                // visually change swimlanes
                console.log('DEBUG: Overwrite swimlanes', pageVariant.structure.swimlanes);
                this.swimlanes = pageVariant.structure.swimlanes;
                this.closeToastWithDelay(toastContainer);
                this.requestInProgress.set(false);
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
            this.requestInProgress.set(true);
            const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast();
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.closeToastWithDelay(toastContainer);
                this.requestInProgress.set(false);
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
            this.closeToastWithDelay(toastContainer);
            this.requestInProgress.set(false);
        }
    }

    /**
     * Creates a new page variant by cloning the currently selected one (without the node definitions) and navigates to it.
     */
    async createPageVariant(): Promise<void> {
        if (
            confirm(
                'Wollen Sie wirklich auf Grundlage der Seiten-Struktur der aktuell gewählten Variante eine neue Seiten-Variante erstellen?',
            )
        ) {
            // check for pageConfigNode existence
            if (!this.pageConfigNode?.ref.id) {
                return;
            }
            // parse the page config from the properties
            const pageConfig: PageConfig = this.pageConfigNode.properties[pageConfigType]?.[0]
                ? JSON.parse(this.pageConfigNode.properties[pageConfigType][0])
                : {};
            // check for pageConfig variant existence
            if (!pageConfig.variants) {
                console.error('pageConfig does not include variants', pageConfig);
                return;
            }
            // retrieve variant node
            const currentPageVariantId: string = pageConfig.variants[this.selectedVariantPosition];
            const variantNode: Node = this.pageVariantConfigs.nodes?.find((node) =>
                currentPageVariantId.includes(node.ref.id),
            );
            if (!variantNode) {
                return;
            }
            // create child for variant node
            this.requestInProgress.set(true);
            const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.openSaveConfigToast(
                'Eine neue Seiten-Variante wird erstellt und geladen.',
            );
            let pageConfigVariantNode: Node = await this.createChild(
                this.pageConfigNode.ref.id,
                ioType,
                pageVariantConfigPrefix + uuidv4(),
                pageVariantConfigAspect,
            );
            // push it to the existing variants
            pageConfig.variants.push(workspaceSpacesStorePrefix + pageConfigVariantNode.ref.id);
            // parse variant config and remove node IDs
            const variantConfig: PageVariantConfig = variantNode.properties[
                pageVariantConfigType
            ]?.[0]
                ? JSON.parse(variantNode.properties[pageVariantConfigType][0])
                : {};
            this.removeNodeIdsFromPageVariantConfig(variantConfig);
            // set properties of the created child
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
            // update ccm:page_config of page config node
            this.pageConfigNode = await this.setPropertyAndRetrieveUpdatedNode(
                this.pageConfigNode.ref.id,
                pageConfigType,
                JSON.stringify(pageConfig),
            );
            // reload page variant configs
            this.pageVariantConfigs = await this.getNodeChildren(this.pageConfigNode.ref.id);
            // navigate to the newly created variant
            await this.navigateToVariant(pageConfigVariantNode.ref.id);
            this.closeToastWithDelay(toastContainer);
            this.requestInProgress.set(false);
        }
    }

    /**
     * Navigates to a given variantId and reload the page structure accordingly.
     *
     * @param variantId
     */
    async navigateToVariant(variantId: string): Promise<void> {
        const queryParamsToAddOrOverwrite: Params = {
            variantId: variantId,
        };
        await this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParamsToAddOrOverwrite,
            queryParamsHandling: 'merge',
        });
        // retrieve the page config node and select the proper variant to define the headerNodeId + swimlanes
        await this.retrievePageConfigAndSelectVariant(variantId);
    }

    /**
     * Helper function to remove possible existing headerNodeId + nodeIds from page variant config.
     */
    private removeNodeIdsFromPageVariantConfig(pageVariant: PageVariantConfig): void {
        pageVariant.structure.swimlanes?.forEach((swimlane: Swimlane) => {
            swimlane.grid?.forEach((gridItem: GridTile) => {
                if (gridItem.nodeId) {
                    delete gridItem.nodeId;
                }
            });
        });
        if (pageVariant.structure.headerNodeId) {
            delete pageVariant.structure.headerNodeId;
        }
    }

    /**
     * Helper function to update the nodeId of given indexes or of the header within the structure of a page variant config.
     */
    private updatePageVariantConfig(
        pageVariant: PageVariantConfig,
        swimlaneIndex?: number,
        gridIndex?: number,
        widgetNodeId?: string,
        isHeaderNode?: boolean,
    ): void {
        // modify header nodeId
        if (isHeaderNode) {
            pageVariant.structure.headerNodeId = widgetNodeId;
        }
        // modify nodeId of swimlane grid tile
        else if (
            pageVariant.structure?.swimlanes?.[swimlaneIndex]?.grid?.[gridIndex] &&
            widgetNodeId
        ) {
            pageVariant.structure.swimlanes[swimlaneIndex].grid[gridIndex].nodeId = widgetNodeId;
        }
    }

    /**
     * Function to call on right wlo-side-menu-item itemClicked output.
     */
    collapsibleItemClicked(item: string): void {
        if (this.selectedMenuItem === item) {
            this.selectedMenuItem = '';
        } else {
            this.selectedMenuItem = item;
        }
    }

    /**
     * Function to call on left wlo-side-menu-item itemClicked output.
     */
    toggleEditMode(): void {
        this.editMode = !this.editMode;
        if (this.editMode) {
            // when switching into edit mode, open all accordions
            this.accordions?.forEach((accordion: CdkAccordionItem): void => {
                accordion.open();
            });
        }
    }

    /**
     * Helper function to open a toast for indicating that the config is being saved.
     */
    openSaveConfigToast(message?: string): MatSnackBarRef<TextOnlySnackBar> {
        const toastMessage: string = message ? message : this.SAVE_CONFIG_MESSAGE;
        return this.snackbar?.open(toastMessage, this.SAVE_CONFIG_ACTION);
    }

    /**
     * Helper function to close a given toast container with a delay.
     *
     * @param toastContainer
     */
    closeToastWithDelay(toastContainer: MatSnackBarRef<TextOnlySnackBar>): void {
        setTimeout((): void => {
            toastContainer.dismiss();
        }, 1000);
    }

    /**
     * Helper function to handle an error by opening a toast container for the error.
     */
    commonCatchFunction(): void {
        // display toast that an error occurred
        // this has to be done manually to also take the processing time into account
        const config: MatSnackBarConfig = {
            duration: 200000,
            panelClass: 'error-snackbar',
        };
        const errorToastContainer: MatSnackBarRef<TextOnlySnackBar> = this.snackbar?.open(
            this.SAVE_CONFIG_ERROR_MESSAGE,
            this.SAVE_CONFIG_ERROR_ACTION,
            config,
        );
        errorToastContainer.onAction().subscribe((): void => {
            window.location.reload();
        });
    }

    protected readonly defaultMds: string = defaultMds;
    protected readonly defaultTopicTextNodeId: string = defaultTopicTextNodeId;
    protected readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    protected readonly profilingFilterbarDimensionKeys: string[] = profilingFilterbarDimensionKeys;
    protected readonly retrieveCustomUrl = retrieveCustomUrl;
    protected readonly workspaceSpacesStorePrefix: string = workspaceSpacesStorePrefix;
}
