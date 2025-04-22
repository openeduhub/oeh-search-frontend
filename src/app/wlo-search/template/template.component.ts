import { CdkAccordionItem } from '@angular/cdk/accordion';
import { Clipboard } from '@angular/cdk/clipboard';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
    Component,
    computed,
    HostBinding,
    Input,
    OnInit,
    QueryList,
    Signal,
    signal,
    ViewChildren,
    WritableSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MdsValue, MdsWidget, Node, NodeEntries } from 'ngx-edu-sharing-api';
import { ParentEntries } from 'ngx-edu-sharing-api/lib/api/models/parent-entries';
import { SpinnerComponent } from 'ngx-edu-sharing-ui';
import {
    BreadcrumbComponent,
    checkUserAccess,
    ColorChangeEvent,
    EditableTextComponent,
    FilterBarComponent,
    GlobalWidgetConfigService,
    SearchWidgetComponent,
    SideMenuItemComponent,
    SideMenuWrapperComponent,
    StatisticChart,
    StatisticsSummaryComponent,
    TopicHeaderComponent,
    TopicsColumnBrowserComponent,
    VarDirective,
    WidgetNodeAddedEvent,
} from 'ngx-edu-sharing-wlo-pages';
import { filter } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '../core/config.service';
import { Filters } from '../core/edu-sharing.service';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { AddSwimlaneBorderButtonComponent } from './add-swimlane-button/add-swimlane-border-button.component';
import {
    actionItems,
    defaultMds,
    defaultTopicsColumnBrowserNodeId,
    disciplineKey,
    initialTopicColor,
    ioType,
    mapType,
    menuItems,
    pageConfigRefType,
    pageConfigType,
    pageVariantConfigType,
    pageConfigPrefix,
    pageConfigAspect,
    pageVariantConfigPrefix,
    pageVariantConfigAspect,
    pageVariantIsTemplateType,
    profilingFilterbarDimensionKeys,
    retrieveCustomUrl,
    statistics,
} from './shared/custom-definitions';
import { FilterSwimlaneTypePipe } from './shared/pipes/filter-swimlane-type.pipe';
import { SwimlaneSearchCountPipe } from './shared/pipes/swimlane-search-count.pipe';
import { GlobalTemplateConfigService } from './shared/services/global-template-config.service';
import { StatisticsHelperService } from './shared/services/statistics-helper.service';
import { TemplateHelperService } from './shared/services/template-helper.service';
import { GridSearchCount } from './shared/types/grid-search-count';
import { GridTile } from './shared/types/grid-tile';
import { PageConfig } from './shared/types/page-config';
import { PageVariantConfig } from './shared/types/page-variant-config';
import { Swimlane } from './shared/types/swimlane';
import {
    checkPageConfigPropagate,
    closeToastWithDelay,
    convertNodeRefIntoNodeId,
    getTopicColor,
    prependWorkspacePrefix,
    removeNodeIdsFromPageVariantConfig,
    retrieveNodeId,
    retrievePageConfig,
    retrievePageConfigRef,
    retrievePageVariantConfig,
    retrieveSearchUrl,
    updatePageVariantConfig,
} from './shared/utils/template-util';
import { SwimlaneComponent } from './swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';

@Component({
    standalone: true,
    imports: [
        AddSwimlaneBorderButtonComponent,
        BreadcrumbComponent,
        EditableTextComponent,
        FilterBarComponent,
        FilterSwimlaneTypePipe,
        SearchModule,
        SearchWidgetComponent,
        SharedModule,
        SideMenuItemComponent,
        SideMenuWrapperComponent,
        SpinnerComponent,
        StatisticsSummaryComponent,
        SwimlaneComponent,
        SwimlaneSearchCountPipe,
        TemplateComponent,
        TopicHeaderComponent,
        TopicsColumnBrowserComponent,
        VarDirective,
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    private readonly CONFIRM_CREATE_PAGE_VARIANT: string =
        'Wollen Sie wirklich auf Grundlage der Seiten-Struktur der aktuell gewählten Variante eine neue Seiten-Variante erstellen?';
    private readonly PAGE_VARIANT_CREATION_STARTED: string =
        'Eine neue Seiten-Variante wird erstellt und geladen.';
    readonly SWIMLANE_ID_PREFIX: string = 'swimlane-';

    constructor(
        private clipboard: Clipboard,
        private config: ConfigService,
        private dialog: MatDialog,
        private globalTemplateConfigService: GlobalTemplateConfigService,
        private globalWidgetConfigService: GlobalWidgetConfigService,
        private route: ActivatedRoute,
        private router: Router,
        private statisticsHelperService: StatisticsHelperService,
        private templateHelperService: TemplateHelperService,
    ) {}

    @Input() set collectionId(value: string) {
        // retrieve the search URL
        this.searchUrl = retrieveSearchUrl();
        // set the default language for API requests
        this.templateHelperService.setDefaultLocale();
        // set the collection ID
        this.topicCollectionID.set(value);
        // initialize the component
        void this.initializeComponent();
    }
    @HostBinding('style.--topic-color') topicColor: string = initialTopicColor;
    @ViewChildren('accordionItem') accordions: QueryList<CdkAccordionItem>;

    initialLoadSuccessfully: WritableSignal<boolean> = signal(false);
    requestInProgress: WritableSignal<boolean> = signal(false);
    private initializedWithParams: boolean = false;

    userHasEditRights: WritableSignal<boolean> = signal(false);
    editMode: boolean = false;

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);

    collectionNode: Node;
    collectionNodeHasPageConfig: boolean = false;
    convertedBreadcrumbNodeId: Signal<string> = computed((): string =>
        convertNodeRefIntoNodeId(this.breadcrumbNodeId()),
    );
    convertedHeaderNodeId: Signal<string> = computed((): string =>
        convertNodeRefIntoNodeId(this.headerNodeId()),
    );
    breadcrumbNodeId: WritableSignal<string> = signal(null);
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
    anchorTrigger: number = 1;
    swimlanes: Swimlane[] = [];
    topicWidgets: NodeEntries;

    latestParams: Params;
    private latestUrlFragment: string;
    selectDimensions: Map<string, MdsWidget> = new Map<string, MdsWidget>();
    selectedDimensionValues: MdsValue[] = [];
    selectDimensionsLoaded: boolean = false;

    selectedMenuItem: string = '';
    actionItems = actionItems;
    menuItems = menuItems;

    // statistics related variables
    searchResultCount: number = 0;
    searchCountTrigger: number = 1;
    searchUrl: string = '';
    statistics: StatisticChart[] = statistics;
    statisticsLoaded: WritableSignal<boolean> = signal(false);

    /**
     * Returns an array of IDs of the currently selected dimension values (output by wlo-filter-bar).
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
        this.searchUrl = retrieveSearchUrl();
        // set the default language for API requests
        this.templateHelperService.setDefaultLocale();
        // set the topic based on the query param "collectionID"
        this.route.queryParams
            .pipe(filter((params: Params) => params.collectionId))
            .subscribe(async (params: Params): Promise<void> => {
                this.latestParams = params;
                // due to reload with queryParams, this might be called twice, thus, initializedWithParams is important
                if (params.collectionId && !this.initializedWithParams) {
                    // set the topicCollectionID
                    this.topicCollectionID.set(params.collectionId);
                    // initialize the component
                    await this.initializeComponent(params.variantId);
                }
                // TODO: The scrolling depends on the widgets being fully loaded, so using setTimeout is only a workaround.
                //       A better solution would be to wait until all widgets are loaded, which is currently not possible.
                setTimeout((): void => {
                    this.scrollElementIntoView();
                }, 1000);
            });
    }

    /**
     * Initializes the component with an optionally given variant ID.
     *
     * @param variantId
     */
    private async initializeComponent(variantId?: string): Promise<void> {
        this.initializedWithParams = true;
        // login for local development
        await this.templateHelperService.localLogin();
        try {
            // fetch the collection node to set the topic name, color and check the user access
            this.collectionNode = await this.templateHelperService.getNode(
                this.topicCollectionID(),
            );
            this.topic.set(this.collectionNode.title ?? 'No topic defined');
            // check the user privileges for the collection node and initialize custom listeners
            this.userHasEditRights.set(checkUserAccess(this.collectionNode));
            if (this.userHasEditRights()) {
                this.initializeCustomEventListeners();
            }
            // TODO: use a color from the palette defined in the collection
            // set the background to some random (but deterministic) color, just for visuals
            this.topicColor = getTopicColor(this.topic());

            // retrieve the page config node and select the proper variant to define the breadcrumbNodeId, headerNodeId + swimlanes
            await this.retrievePageConfigAndSelectVariant(variantId);

            // initial load finished (page structure loaded)
            this.initialLoadSuccessfully.set(true);

            // listen to fragment changes to scroll given swimlane ID into view
            // note: setTimeout is necessary for view being loaded first
            this.initializeFragmentListener();

            // post-load the statistics
            this.searchResultCount = await this.statisticsHelperService.postLoadStatistics(
                this.topicCollectionID(),
                this.topic(),
                this.statistics,
            );
            this.statisticsLoaded.set(true);
        } catch (err) {
            console.error(err);
            this.templateHelperService.displayErrorToast();
        }
    }

    /**
     * Initializes custom event listeners to react to events sent by the widgets (color change, widget node added).
     */
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
                    retrieveNodeId(pageVariantNode) === retrieveNodeId(this.pageVariantNode) &&
                    swimlaneIndex > -1
                ) {
                    let changesNecessary: boolean =
                        this.swimlanes[swimlaneIndex]?.backgroundColor !== color;
                    if (changesNecessary) {
                        try {
                            // check, whether a new page node has to be created
                            const pageNodeCreated: boolean =
                                await this.checkForCustomPageNodeExistence();
                            console.log('DEBUG: change necessary', pageNodeCreated);
                            const pageVariant: PageVariantConfig = this.retrievePageVariant();
                            this.swimlanes[swimlaneIndex].backgroundColor = color;
                            pageVariant.structure.swimlanes = this.swimlanes;
                            await this.templateHelperService.setProperty(
                                retrieveNodeId(this.pageVariantNode),
                                pageVariantConfigType,
                                JSON.stringify(pageVariant),
                            );
                        } catch (err) {
                            console.error(err);
                            this.templateHelperService.displayErrorToast();
                        }
                    }
                }
            },
            false,
        );

        // listen to custom colorChange event dispatched by wlo-user-configurable
        // note: do not use try catch to be able to revert changes
        document.getElementsByTagName('body')[0].addEventListener(
            'widgetNodeAdded',
            async (e: CustomEvent<WidgetNodeAddedEvent>): Promise<void> => {
                console.log('DEBUG: widgetNodeAdded event', e);
                const widgetNodeDetails: WidgetNodeAddedEvent = e.detail;
                const pageVariantNode: Node = widgetNodeDetails?.pageVariantNode ?? null;
                const swimlaneIndex: number = widgetNodeDetails?.swimlaneIndex ?? -1;
                const gridIndex: number = widgetNodeDetails?.gridIndex ?? -1;
                const widgetNodeId: string = widgetNodeDetails?.widgetNodeId ?? '';
                const isBreadcrumbNode: boolean = widgetNodeDetails?.isBreadcrumbNode ?? false;
                const isHeaderNode: boolean = widgetNodeDetails?.isHeaderNode ?? false;

                const validWidgetNodeId: boolean = widgetNodeId && widgetNodeId !== '';
                const validParentVariant: boolean =
                    pageVariantNode &&
                    retrieveNodeId(pageVariantNode) === retrieveNodeId(this.pageVariantNode);
                const validSwimlaneIndex: boolean = swimlaneIndex > -1;
                const validGridIndex: boolean = gridIndex > -1;

                const validInputs: boolean = validGridIndex && validSwimlaneIndex;

                let addedSuccessfully: boolean = false;
                if (
                    validWidgetNodeId &&
                    validParentVariant &&
                    (validInputs || isBreadcrumbNode || isHeaderNode)
                ) {
                    // convert widget node ID, if necessary
                    const convertedWidgetNodeId: string = prependWorkspacePrefix(widgetNodeId);
                    // if no page configuration exists yet, a config has to be created and a reload of the page is necessary
                    addedSuccessfully = await this.checkForCustomPageNodeExistence(
                        swimlaneIndex,
                        gridIndex,
                        convertedWidgetNodeId,
                        isHeaderNode,
                    );
                    // if no page node was created, the adding is not yet successfully, so updating is necessary
                    if (!addedSuccessfully) {
                        const pageVariant: PageVariantConfig = this.retrievePageVariant();
                        // modify breadcrumb nodeId
                        if (isBreadcrumbNode) {
                            pageVariant.structure.breadcrumbNodeId = convertedWidgetNodeId;
                            this.breadcrumbNodeId.set(pageVariant.structure.breadcrumbNodeId);
                            await this.templateHelperService.setProperty(
                                retrieveNodeId(this.pageVariantNode),
                                pageVariantConfigType,
                                JSON.stringify(pageVariant),
                            );
                            addedSuccessfully = true;
                        }
                        // modify header nodeId
                        else if (isHeaderNode) {
                            pageVariant.structure.headerNodeId = convertedWidgetNodeId;
                            this.headerNodeId.set(pageVariant.structure.headerNodeId);
                            await this.templateHelperService.setProperty(
                                retrieveNodeId(this.pageVariantNode),
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
                            await this.templateHelperService.setProperty(
                                retrieveNodeId(this.pageVariantNode),
                                pageVariantConfigType,
                                JSON.stringify(pageVariant),
                            );
                            addedSuccessfully = true;
                        }
                    }
                }
                // note: if it exists, but cannot be added in the grid, we might want to delete the node again
                if (validWidgetNodeId && !addedSuccessfully) {
                    const nodeIdToDelete: string = convertNodeRefIntoNodeId(widgetNodeId);
                    await this.templateHelperService.deleteNode(nodeIdToDelete);
                    this.templateHelperService.displayErrorToast();
                }
            },
            false,
        );
    }

    /**
     * Initializes a listener for the fragment part of the current route.
     * If the fragment part changes, the corresponding element is scrolled into view.
     */
    private initializeFragmentListener(): void {
        this.route.fragment.subscribe((urlFragment: string): void => {
            this.latestUrlFragment = urlFragment;
            this.scrollElementIntoView();
        });
    }

    /**
     * Scrolls the latest URL fragment into view, if it exists.
     */
    private scrollElementIntoView(fragment?: string): void {
        if (!fragment && !this.latestUrlFragment) {
            return;
        }
        const element: HTMLElement = document.getElementById(fragment || this.latestUrlFragment);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // PAGE CONFIG + VARIANT SPECIFIC FUNCTIONS
    /**
     * Retrieves the page config node, selects the proper variant and defines the breadcrumbNodeId, headerNodeId + swimlanes.
     *
     * @param variantId
     */
    private async retrievePageConfigAndSelectVariant(variantId?: string): Promise<void> {
        // idea: if "collectionNode" already has a page config, there is no need to search further
        if (this.collectionNode.properties[pageConfigType]) {
            this.pageConfigNode = this.collectionNode;
            this.collectionNodeHasPageConfig = true;
        }
        // retrieve the page config node either by checking the node itself or by iterating the parents of the collectionNode
        else if (!retrieveNodeId(this.pageConfigNode)) {
            this.pageConfigNode = await this.retrievePageConfigNode(this.collectionNode);
            if (!this.pageConfigNode) {
                return;
            }
        }
        // parse the page config from the properties
        const pageConfig: PageConfig = retrievePageConfig(this.pageConfigNode);
        if (!pageConfig.variants) {
            console.error('pageConfig does not include variants', pageConfig);
            return;
        }
        // retrieve the (potentially updated) page variant configs
        this.pageVariantConfigs = await this.templateHelperService.getNodeChildren(
            retrieveNodeId(this.pageConfigNode),
        );
        // default the ID with the default or the first occurrence
        this.pageVariantDefaultPosition = pageConfig.variants.indexOf(pageConfig.default);
        // select the proper variant (initialize with default or first variant)
        let selectedVariantId: string = pageConfig.default ?? pageConfig.variants[0];
        selectedVariantId = convertNodeRefIntoNodeId(selectedVariantId);
        // if a variantId is provided, override it
        if (variantId) {
            selectedVariantId = variantId;
        }
        // otherwise, iterate the variant configs and select the one with the most matching variables
        else {
            let highestNumberOfMatches: number = 0;
            this.pageVariantConfigs.nodes?.forEach((variantNode: Node): void => {
                const variantConfig: PageVariantConfig = retrievePageVariantConfig(variantNode);
                if (variantConfig?.variables) {
                    let matchesCount: number = 0;
                    Object.keys(variantConfig.variables)?.forEach((key: string): void => {
                        // TODO: Replace by a more consistent check of both key and value
                        if (this.selectedDimensionValueIds.includes(variantConfig.variables[key])) {
                            matchesCount += 1;
                        }
                    });
                    // select the variant with the most matches
                    if (matchesCount > highestNumberOfMatches) {
                        selectedVariantId = retrieveNodeId(variantNode);
                    }
                }
            });
        }
        // hold the position of the selected variant for later retrieval
        const newSelectedVariantPosition: number = pageConfig.variants.indexOf(
            prependWorkspacePrefix(selectedVariantId),
        );
        const initialLoad: boolean = this.selectedVariantPosition === -1;
        const pageVariantChanged: boolean =
            !initialLoad && newSelectedVariantPosition !== this.selectedVariantPosition;
        // if the variant was not selected yet or was changed, reload the page structure
        if (initialLoad || pageVariantChanged) {
            this.selectedVariantPosition = newSelectedVariantPosition;
            // retrieve the variant config node of the page
            this.pageVariantNode = this.pageVariantConfigs.nodes?.find(
                (node: Node): boolean => retrieveNodeId(node) === selectedVariantId,
            );
            if (!this.pageVariantNode) {
                console.error(
                    'No pageVariantNode was found.',
                    selectedVariantId,
                    this.pageVariantConfigs.nodes,
                );
                return;
            }
            const pageVariant: PageVariantConfig = retrievePageVariantConfig(this.pageVariantNode);
            if (!pageVariant || !pageVariant.structure) {
                console.error(
                    'Either no pageVariant or no structure in it was found.',
                    pageVariant,
                );
                return;
            }
            // if page config was retrieved from parent,
            // remove possible existing nodeIds from swimlane grids
            if (!retrievePageConfigRef(this.collectionNode)) {
                removeNodeIdsFromPageVariantConfig(pageVariant);
            }
            // set the breadcrumbNodeId, headerNodeId + swimlanes
            this.breadcrumbNodeId.set(pageVariant.structure.breadcrumbNodeId);
            this.headerNodeId.set(pageVariant.structure.headerNodeId);
            this.swimlanes = pageVariant.structure.swimlanes ?? [];
        }
    }

    /**
     * Creates a new page variant by cloning the currently selected one (without the node definitions) and navigates to it.
     */
    async createPageVariant(): Promise<void> {
        if (confirm(this.CONFIRM_CREATE_PAGE_VARIANT)) {
            // check for pageConfigNode existence
            if (!retrieveNodeId(this.pageConfigNode)) {
                return;
            }
            // parse the page config from the properties
            const pageConfig: PageConfig = retrievePageConfig(this.pageConfigNode);
            // check for pageConfig variant existence
            if (!pageConfig.variants) {
                console.error('pageConfig does not include variants', pageConfig);
                return;
            }
            // retrieve variant node
            const currentPageVariantId: string = pageConfig.variants[this.selectedVariantPosition];
            const variantNode: Node = this.pageVariantConfigs.nodes?.find((node: Node) =>
                currentPageVariantId.includes(retrieveNodeId(node)),
            );
            if (!variantNode) {
                return;
            }
            try {
                // create child for variant node
                const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing(
                    this.PAGE_VARIANT_CREATION_STARTED,
                );
                let pageConfigVariantNode: Node = await this.templateHelperService.createChild(
                    retrieveNodeId(this.pageConfigNode),
                    ioType,
                    pageVariantConfigPrefix + uuidv4(),
                    pageVariantConfigAspect,
                );
                // push it to the existing variants
                pageConfig.variants.push(
                    prependWorkspacePrefix(retrieveNodeId(pageConfigVariantNode)),
                );
                // parse variant config and remove node IDs
                const variantConfig: PageVariantConfig = retrievePageVariantConfig(variantNode);
                removeNodeIdsFromPageVariantConfig(variantConfig);
                // set properties of the created child
                await this.templateHelperService.setProperty(
                    retrieveNodeId(pageConfigVariantNode),
                    pageVariantConfigType,
                    JSON.stringify(variantConfig),
                );
                await this.templateHelperService.setProperty(
                    retrieveNodeId(pageConfigVariantNode),
                    pageVariantIsTemplateType,
                    'false',
                );
                // update ccm:page_config of page config node
                this.pageConfigNode =
                    await this.templateHelperService.setPropertyAndRetrieveUpdatedNode(
                        retrieveNodeId(this.pageConfigNode),
                        pageConfigType,
                        JSON.stringify(pageConfig),
                    );
                // reload page variant configs
                this.pageVariantConfigs = await this.templateHelperService.getNodeChildren(
                    retrieveNodeId(this.pageConfigNode),
                );
                // navigate to the newly created variant
                await this.navigateToVariant(retrieveNodeId(pageConfigVariantNode));
                this.endEditing(toastContainer);
            } catch (err) {
                console.error(err);
                this.templateHelperService.displayErrorToast();
            }
        }
    }

    /**
     * Navigates to a given variantId and reloads the page structure accordingly.
     *
     * @param variantId
     */
    async navigateToVariant(variantId: string): Promise<void> {
        const queryParamsToAddOrOverwrite: Params = {
            variantId: variantId,
        };
        // on variant change, do not keep the fragments
        await this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParamsToAddOrOverwrite,
            queryParamsHandling: 'merge',
        });
        // retrieve the page config node and select the proper variant to define the breadcrumbNodeId, headerNodeId + swimlanes
        try {
            await this.retrievePageConfigAndSelectVariant(variantId);
        } catch (err) {
            console.error(err);
            this.templateHelperService.displayErrorToast();
        }
    }

    /**
     * Navigates to a given fragment by appending it to the url.
     *
     * @param fragment
     */
    async navigateToFragment(fragment: string): Promise<void> {
        // workaround: scroll into view first and change URL afterward
        this.scrollElementIntoView(fragment);
        setTimeout(async (): Promise<void> => {
            await this.router.navigate([], { queryParamsHandling: 'merge', fragment });
        }, 250);
    }

    // SWIMLANE SPECIFIC FUNCTIONS
    /**
     * Adds a new swimlane to the page and persists it in the config.
     */
    async addSwimlane(newSwimlane: Swimlane, positionToAdd: number): Promise<void> {
        const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing();
        try {
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.endEditing(toastContainer);
                return;
            }
            const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
            swimlanesCopy.splice(positionToAdd, 0, newSwimlane);
            pageVariant.structure.swimlanes = swimlanesCopy;
            await this.templateHelperService.setProperty(
                retrieveNodeId(this.pageVariantNode),
                pageVariantConfigType,
                JSON.stringify(pageVariant),
            );
            // add swimlane visually as soon as the requests are done
            this.swimlanes.splice(positionToAdd, 0, newSwimlane);
            this.endEditing(toastContainer);
        } catch (err) {
            console.error(err);
            this.endEditing(toastContainer);
            this.templateHelperService.displayErrorToast();
        }
    }

    /**
     * Moves the position of a swimlane on the page and persists it in the config.
     */
    async moveSwimlanePosition(oldIndex: number, newIndex: number): Promise<void> {
        if (newIndex >= 0 && newIndex <= this.swimlanes.length - 1) {
            const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing();
            try {
                await this.checkForCustomPageNodeExistence();
                const pageVariant: PageVariantConfig = this.retrievePageVariant();
                if (!pageVariant) {
                    this.endEditing(toastContainer);
                    return;
                }
                const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
                moveItemInArray(swimlanesCopy, oldIndex, newIndex);
                pageVariant.structure.swimlanes = swimlanesCopy;
                await this.templateHelperService.setProperty(
                    retrieveNodeId(this.pageVariantNode),
                    pageVariantConfigType,
                    JSON.stringify(pageVariant),
                );
                // move swimlane position visually as soon as the requests are done
                moveItemInArray(this.swimlanes, oldIndex, newIndex);
                this.endEditing(toastContainer);
            } catch (err) {
                console.error(err);
                this.endEditing(toastContainer);
                this.templateHelperService.displayErrorToast();
            }
        }
    }

    /**
     * Reacts to wlo-editable-text copyClicked output event by saving the link to the swimlane in the clipboard.
     *
     * @param copy
     * @param swimlaneIndex
     */
    async copySwimlaneLink(copy: boolean, swimlaneIndex: number): Promise<void> {
        if (copy) {
            // similar to copying links in GitHub issues, the target is first set to the URL and then copied
            await this.navigateToFragment(
                this.SWIMLANE_ID_PREFIX + this.swimlanes[swimlaneIndex].id,
            );
            // workaround: setTimeout is necessary, as navigateToFragment  includes a delay
            setTimeout((): void => {
                this.clipboard.copy(window.location.href);
                // inform user about URL being copied successfully
                this.templateHelperService.openSaveConfigToast(
                    'Der Link wurde in Ihre Zwischenablage kopiert.',
                );
            }, 300);
        }
    }

    /**
     * Reacts to wlo-editable-text textChange output event by persisting the changes in the page config.
     *
     * @param title
     * @param index
     */
    async swimlaneTitleChanged(title: string, index: number): Promise<void> {
        const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing();
        try {
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                this.endEditing(toastContainer);
                return;
            }
            this.swimlanes[index].heading = title;
            pageVariant.structure.swimlanes = this.swimlanes;
            await this.templateHelperService.setProperty(
                retrieveNodeId(this.pageVariantNode),
                pageVariantConfigType,
                JSON.stringify(pageVariant),
            );
            this.endEditing(toastContainer);
        } catch (err) {
            console.error(err);
            this.endEditing(toastContainer);
            this.templateHelperService.displayErrorToast();
        }
    }

    /**
     * Starts editing a swimlane by opening a dialog and handling the result status.
     *
     * @param swimlane
     * @param index
     */
    editSwimlane(swimlane: Swimlane, index: number): void {
        const dialogRef = this.dialog.open(SwimlaneSettingsDialogComponent, {
            data: {
                swimlane,
            },
            minWidth: '700px',
            maxWidth: '100%',
        });

        // TODO: fix error when closing (ERROR TypeError: Cannot set properties of null (setting '_closeInteractionType'))
        // seems to be a known issue as of May 2023: https://stackoverflow.com/a/76273326
        dialogRef.afterClosed().subscribe(async (result): Promise<void> => {
            if (result?.status === 'VALID') {
                const editedSwimlane = result.value;
                if (!editedSwimlane) {
                    return;
                }
                // restore swimlane ID + background color
                editedSwimlane.id = swimlane.id;
                if (swimlane.backgroundColor) {
                    editedSwimlane.backgroundColor = swimlane.backgroundColor;
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
                const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing();
                try {
                    await this.checkForCustomPageNodeExistence();
                    const pageVariant: PageVariantConfig = this.retrievePageVariant();
                    if (!pageVariant) {
                        this.endEditing(toastContainer);
                        return;
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
                    await this.templateHelperService.setProperty(
                        retrieveNodeId(this.pageVariantNode),
                        pageVariantConfigType,
                        JSON.stringify(pageVariant),
                    );
                    // afterward, delete config nodes of removed widgets
                    for (const nodeId of deletedWidgetNodeIds) {
                        // retrieve correct nodeId
                        const widgetNodeId: string = convertNodeRefIntoNodeId(nodeId);
                        await this.templateHelperService.deleteNode(widgetNodeId);
                    }
                    // visually change swimlanes
                    console.log('DEBUG: Overwrite swimlanes', pageVariant.structure.swimlanes);
                    this.swimlanes = pageVariant.structure.swimlanes;
                    this.endEditing(toastContainer);
                } catch (err) {
                    console.error(err);
                    this.endEditing(toastContainer);
                    this.templateHelperService.displayErrorToast();
                }
            }
            console.log('Closed', result?.value);
        });
    }

    /**
     * Deletes a swimlane from the page with possible widget nodes and persists it in the config.
     *
     * @param index
     */
    async deleteSwimlane(index: number): Promise<void> {
        if (
            this.swimlanes?.[index] &&
            confirm('Wollen Sie dieses Element wirklich löschen?') === true
        ) {
            const toastContainer: MatSnackBarRef<TextOnlySnackBar> = this.startEditing();
            try {
                await this.checkForCustomPageNodeExistence();
                const pageVariant: PageVariantConfig = this.retrievePageVariant();
                if (!pageVariant) {
                    this.endEditing(toastContainer);
                    return;
                }
                // delete possible nodes defined in the swimlane
                // forEach does not support async / await
                // -> for ... of ... (https://stackoverflow.com/a/37576787)
                if (this.swimlanes[index].grid) {
                    for (const widget of this.swimlanes[index].grid) {
                        if (widget.nodeId) {
                            const nodeId: string =
                                widget.nodeId.split('/')?.[widget.nodeId.split('/').length - 1];
                            await this.templateHelperService.deleteNode(nodeId);
                        }
                    }
                }
                const swimlanesCopy = JSON.parse(JSON.stringify(this.swimlanes ?? []));
                swimlanesCopy.splice(index, 1);
                pageVariant.structure.swimlanes = swimlanesCopy;
                await this.templateHelperService.setProperty(
                    retrieveNodeId(this.pageVariantNode),
                    pageVariantConfigType,
                    JSON.stringify(pageVariant),
                );
                // delete swimlane visually as soon as the requests are done
                this.swimlanes.splice(index, 1);
                this.endEditing(toastContainer);
            } catch (err) {
                console.error(err);
                this.endEditing(toastContainer);
                this.templateHelperService.displayErrorToast();
            }
        }
    }

    // REACT TO FURTHER OUTPUT EVENTS
    /**
     * Called by app-swimlane gridUpdated output event.
     * Handles the update of the grid of a given swimlane.
     *
     * @param grid
     * @param swimlaneIndex
     */
    async handleGridUpdate(grid: GridTile[], swimlaneIndex: number): Promise<void> {
        try {
            // overwrite swimlane grid
            this.swimlanes[swimlaneIndex].grid = grid;

            // persist the state afterward
            await this.checkForCustomPageNodeExistence();
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            if (!pageVariant) {
                // TODO: rollback necessary
            }
            pageVariant.structure.swimlanes = this.swimlanes;
            await this.templateHelperService.setProperty(
                retrieveNodeId(this.pageVariantNode),
                pageVariantConfigType,
                JSON.stringify(pageVariant),
            );
            // TODO: rollback necessary, if the request is not successful
        } catch (err) {
            console.error(err);
            this.templateHelperService.displayErrorToast();
        }
    }

    /**
     * Called by app-swimlane nodeClicked output event.
     *
     * @param node
     */
    handleNodeChange(node: Node): void {
        this.templateHelperService.handleNodeChange(node);
    }

    /**
     * Called by app-swimlane nodeClicked output event.
     *
     * @param event
     * @param swimlaneIndex
     */
    updateGridItemSearchCount(event: GridSearchCount, swimlaneIndex: number): void {
        console.log('updateGridItemSearchCount', event);
        this.swimlanes[swimlaneIndex].grid[event.gridIndex].searchCount = event.count;
        this.searchCountTrigger++;
    }

    /**
     * Called by wlo-filter-bar selectDimensionsChanged output event.
     *
     * @param event
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
     *
     * @param latestSelectValues
     */
    selectValuesChanged(latestSelectValues: MdsValue[]): void {
        const persistFilters: boolean = this.globalWidgetConfigService.persistFilters;
        if (!this.latestParams && persistFilters) {
            return;
        }
        // changes are detected using the URL params to also include values of different filterbars
        // convert both select dimension keys and params into the same format
        // Map<$virtual:key$, ...> => [key, ...]
        const convertedSelectDimensionKeys: string[] = Array.from(this.selectDimensions.keys())
            .map((key: string) => key.split('$')?.[1] ?? key)
            .map((key: string) => key.split('virtual:')?.[1] ?? key);
        const selectedDimensionValues: MdsValue[] = [];
        if (persistFilters) {
            const latestParamKeys: string[] = Object.keys(this.latestParams);
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
        }
        // without params, it is not guaranteed that the input of multiple filter bars works properly
        else {
            // iterate over (unconverted) select dimension keys to ensure correct positioning
            Array.from(this.selectDimensions.keys()).forEach((dimensionKey: string): void => {
                // we use both selectDimensions and latestSelectValues to find the matching values
                const dimensionValueIds: string[] = this.selectDimensions
                    .get(dimensionKey)
                    ?.values?.map((val: MdsValue) => val.id);
                // iterate over latestSelectValues and find a matching value
                const matchingValue: MdsValue = latestSelectValues.find((selectValue: MdsValue) => {
                    let selectedIds: string[];
                    if (Array.isArray(selectValue)) {
                        selectedIds = selectValue.filter((val) => val.checked).map((val) => val.id);
                    } else {
                        selectedIds = [selectValue.id];
                    }
                    // check, if a matching value is found (at least one selected ID and all selected IDs are included in the dimension value IDs)
                    // reference: https://stackoverflow.com/a/53606357
                    return (
                        selectedIds.length > 0 &&
                        selectedIds.every((v: string) => dimensionValueIds.includes(v))
                    );
                });
                if (matchingValue) {
                    const id: string = Array.isArray(matchingValue)
                        ? matchingValue
                              .filter((val) => val.checked)
                              .map((val) => val.id)
                              .join(',')
                        : matchingValue.id;
                    selectedDimensionValues.push({
                        id,
                    });
                } else {
                    console.log('DEBUGGING: No matching value found', matchingValue, dimensionKey);
                    selectedDimensionValues.push({
                        id: '',
                    });
                }
            });
        }
        // Expected format of selectedDimensionValues:
        // [
        //   {
        //     "id": "http://w3id.org/openeduhub/vocabs/educationalContext/elementarbereich,http://w3id.org/openeduhub/vocabs/educationalContext/grundschule"
        //   },
        //   {
        //     "id": "learn"
        //   }
        // ]
        this.selectedDimensionValues = selectedDimensionValues;
        // if necessary, reload the pageVariants
        if (this.initialLoadSuccessfully()) {
            try {
                void this.retrievePageConfigAndSelectVariant(this.latestParams.variantId);
            } catch (err) {
                console.error(err);
                this.templateHelperService.displayErrorToast();
            }
        }
    }

    /**
     * Called by right wlo-side-menu-item itemClicked output event.
     */
    collapsibleItemClicked(item: string): void {
        if (this.selectedMenuItem === item) {
            this.selectedMenuItem = '';
        } else {
            this.selectedMenuItem = item;
        }
    }

    /**
     * Called by left wlo-side-menu-item itemClicked output event.
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
     * Called by wlo-search-widget searchTermChanged output event.
     * Opens a new tab with the search results of a given search term and discipline filter of the current collection.
     *
     * @param searchString
     */
    searchTermChanged(searchString: any): void {
        const filters: Filters = {};
        filters.discipline = this.collectionNode.properties[disciplineKey] ?? [];
        // reference for opening in new tab: https://stackoverflow.com/a/57631718
        // note: use base router path instead of /search, as /search is missing the i18n path
        const url: string = this.router.serializeUrl(
            this.router.createUrlTree([this.config.get().routerPath], {
                queryParams: {
                    q: searchString,
                    filters:
                        Object.entries(filters).length > 0 ? JSON.stringify(filters) : undefined,
                    pageIndex: undefined,
                },
            }),
        );
        window.open(url, '_blank');
    }

    // HELPER FUNCTIONS
    /**
     * Helper function to parse the page config ref of the collection and return the proper page config node.
     * If no page config ref is set, check whether a parent propagates one.
     *
     * @param node
     */
    private async retrievePageConfigNode(node: Node): Promise<Node> {
        // check, whether the node itself has a pageConfigRef
        let pageRef: string = retrievePageConfigRef(node);
        this.collectionNodeHasPageConfig = !!pageRef;
        // otherwise, iterate the parents to retrieve the pageConfigRef, if pageConfigPropagate is set
        if (!pageRef) {
            const parents: ParentEntries = await this.templateHelperService.getNodeParents(
                retrieveNodeId(node),
            );
            const propagatingParent: Node = parents.nodes.find((parent: Node) =>
                checkPageConfigPropagate(parent),
            );
            if (propagatingParent) {
                pageRef = retrievePageConfigRef(propagatingParent);
            }
        }
        if (pageRef) {
            const pageNodeId: string = convertNodeRefIntoNodeId(pageRef);
            if (pageNodeId) {
                this.pageConfigCheckFailed.set(false);
                return await this.templateHelperService.getNode(pageNodeId);
            }
        }
        this.pageConfigCheckFailed.set(true);
        return null;
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
            this.pageConfigNode = await this.templateHelperService.createChild(
                this.globalTemplateConfigService.parentPageConfigNodeId,
                mapType,
                pageConfigPrefix + uuidv4(),
                pageConfigAspect,
            );
            const pageVariants: string[] = [];
            // iterate variant config nodes (of template) and create ccm:io child nodes for it
            if (this.pageVariantConfigs.nodes?.length > 0) {
                for (const variantNode of this.pageVariantConfigs.nodes) {
                    let pageConfigVariantNode: Node = await this.templateHelperService.createChild(
                        retrieveNodeId(this.pageConfigNode),
                        ioType,
                        pageVariantConfigPrefix + uuidv4(),
                        pageVariantConfigAspect,
                    );
                    pageVariants.push(
                        prependWorkspacePrefix(retrieveNodeId(pageConfigVariantNode)),
                    );
                    const variantConfig: PageVariantConfig = retrievePageVariantConfig(variantNode);
                    removeNodeIdsFromPageVariantConfig(variantConfig);
                    updatePageVariantConfig(
                        variantConfig,
                        swimlaneIndex,
                        gridIndex,
                        widgetNodeId,
                        isHeaderNode,
                    );
                    await this.templateHelperService.setProperty(
                        retrieveNodeId(pageConfigVariantNode),
                        pageVariantConfigType,
                        JSON.stringify(variantConfig),
                    );
                    await this.templateHelperService.setProperty(
                        retrieveNodeId(pageConfigVariantNode),
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
                pageConfig.collectionId = prependWorkspacePrefix(this.topicCollectionID());
            }
            // update ccm:page_config of page config node
            this.pageConfigNode =
                await this.templateHelperService.setPropertyAndRetrieveUpdatedNode(
                    retrieveNodeId(this.pageConfigNode),
                    pageConfigType,
                    JSON.stringify(pageConfig),
                );
            // get page variant configs
            this.pageVariantConfigs = await this.templateHelperService.getNodeChildren(
                retrieveNodeId(this.pageConfigNode),
            );
            // parse the page config ref again
            const pageVariant: PageVariantConfig = this.retrievePageVariant();
            this.breadcrumbNodeId.set(pageVariant.structure.breadcrumbNodeId);
            this.headerNodeId.set(pageVariant.structure.headerNodeId);
            this.swimlanes = pageVariant.structure.swimlanes ?? [];
            // set ccm:page_config_ref in collection
            await this.templateHelperService.setProperty(
                retrieveNodeId(this.collectionNode),
                pageConfigRefType,
                prependWorkspacePrefix(retrieveNodeId(this.pageConfigNode)),
            );
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
        const pageConfig: PageConfig = retrievePageConfig(this.pageConfigNode);
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
        selectedVariantId = convertNodeRefIntoNodeId(selectedVariantId);
        this.pageVariantNode = this.pageVariantConfigs.nodes?.find(
            (node: Node) => retrieveNodeId(node) === selectedVariantId,
        );
        if (!this.pageVariantNode) {
            console.error(
                'No pageVariantNode was found.',
                selectedVariantId,
                this.pageVariantConfigs.nodes,
            );
            return null;
        }
        const pageVariant: PageVariantConfig = retrievePageVariantConfig(this.pageVariantNode);
        if (!pageVariant || !pageVariant.structure) {
            console.error('Either no pageVariant or no structure in it was found.', pageVariant);
            return null;
        }
        return pageVariant;
    }

    /**
     * Helper function to start an editing process by setting requestInProgress to true and opening a toast to inform the user about it.
     *
     * @param msg
     */
    private startEditing(msg?: string): MatSnackBarRef<TextOnlySnackBar> {
        this.requestInProgress.set(true);
        return this.templateHelperService.openSaveConfigToast(msg);
    }

    /**
     * Helper function to end an editing process by closing a toast and setting requestInProgress to false.
     *
     * @param toastContainer
     */
    private endEditing(toastContainer: MatSnackBarRef<TextOnlySnackBar>): void {
        closeToastWithDelay(toastContainer);
        this.anchorTrigger++;
        this.requestInProgress.set(false);
    }

    protected readonly defaultMds: string = defaultMds;
    protected readonly defaultTopicsColumnBrowserNodeId: string = defaultTopicsColumnBrowserNodeId;
    protected readonly profilingFilterbarDimensionKeys: string[] = profilingFilterbarDimensionKeys;
    protected readonly retrieveCustomUrl = retrieveCustomUrl;
    protected readonly wordpressUrl: string = this.config.get().wordpressUrl;
}
