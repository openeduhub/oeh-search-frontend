import { Component, Input, OnInit } from '@angular/core';
import { GlobalWidgetConfigService } from 'ngx-edu-sharing-wlo-pages';
import { CoreService } from '../../../../../src/app/wlo-search/core/core.service';
import { GlobalTemplateConfigService } from '../../../../../src/app/wlo-search/template/shared/services/global-template-config.service';

@Component({
    selector: 'app-template-embedded',
    templateUrl: './template-embedded.component.html',
    styleUrls: ['./template-embedded.component.scss'],
})
export class TemplateEmbeddedComponent implements OnInit {
    @Input() collectionId: string;
    // global template + widget configuration
    @Input() cdnLink?: string;
    @Input() defaultAiTextWidgetNodeId?: string;
    @Input() defaultBreadcrumbWidgetNodeId?: string;
    @Input() defaultCollectionChipsWidgetNodeId?: string;
    @Input() defaultMediaRenderingWidgetNodeId?: string;
    @Input() defaultTextWidgetNodeId?: string;
    @Input() defaultTopicHeaderImageWidgetNodeId?: string;
    @Input() defaultTopicHeaderTextWidgetNodeId?: string;
    @Input() defaultTopicsColumnBrowserWidgetNodeId?: string;
    @Input() defaultUserConfigurableWidgetNodeId?: string;
    @Input() eduRepoUrl?: string;
    @Input() imagePath?: string;
    @Input() parentPageConfigNodeId?: string;
    @Input() parentWidgetConfigNodeId?: string;
    @Input() persistFilters?: boolean;

    constructor(
        private coreService: CoreService,
        private globalTemplateConfigService: GlobalTemplateConfigService,
        private globalWidgetConfigService: GlobalWidgetConfigService,
    ) {}

    /**
     * Sets the global widget configuration on component initialization.
     */
    ngOnInit(): void {
        if (this.cdnLink) {
            this.globalWidgetConfigService.cdnLink = this.cdnLink;
        }
        if (this.defaultAiTextWidgetNodeId) {
            this.globalWidgetConfigService.defaultAiTextWidgetNodeId =
                this.defaultAiTextWidgetNodeId;
        }
        if (this.defaultBreadcrumbWidgetNodeId) {
            this.globalWidgetConfigService.defaultBreadcrumbWidgetNodeId =
                this.defaultBreadcrumbWidgetNodeId;
        }
        if (this.defaultCollectionChipsWidgetNodeId) {
            this.globalWidgetConfigService.defaultCollectionChipsWidgetNodeId =
                this.defaultCollectionChipsWidgetNodeId;
        }
        if (this.defaultMediaRenderingWidgetNodeId) {
            this.globalWidgetConfigService.defaultMediaRenderingWidgetNodeId =
                this.defaultMediaRenderingWidgetNodeId;
        }
        if (this.defaultTextWidgetNodeId) {
            this.globalWidgetConfigService.defaultTextWidgetNodeId = this.defaultTextWidgetNodeId;
        }
        if (this.defaultTopicHeaderImageWidgetNodeId) {
            this.globalWidgetConfigService.defaultTopicHeaderImageWidgetNodeId =
                this.defaultTopicHeaderImageWidgetNodeId;
        }
        if (this.defaultTopicHeaderTextWidgetNodeId) {
            this.globalWidgetConfigService.defaultTopicHeaderTextWidgetNodeId =
                this.defaultTopicHeaderTextWidgetNodeId;
        }
        if (this.defaultTopicsColumnBrowserWidgetNodeId) {
            this.globalWidgetConfigService.defaultTopicsColumnBrowserWidgetNodeId =
                this.defaultTopicsColumnBrowserWidgetNodeId;
        }
        if (this.defaultUserConfigurableWidgetNodeId) {
            this.globalWidgetConfigService.defaultUserConfigurableWidgetNodeId =
                this.defaultUserConfigurableWidgetNodeId;
        }
        if (this.eduRepoUrl) {
            this.globalWidgetConfigService.eduRepoUrl = this.eduRepoUrl;
        }
        if (this.imagePath) {
            this.globalWidgetConfigService.imagePath = this.imagePath;
        }
        if (this.parentPageConfigNodeId) {
            this.globalTemplateConfigService.parentPageConfigNodeId = this.parentPageConfigNodeId;
        }
        if (this.parentWidgetConfigNodeId) {
            this.globalWidgetConfigService.parentWidgetConfigNodeId = this.parentWidgetConfigNodeId;
        }
        if (this.persistFilters !== undefined) {
            this.globalWidgetConfigService.persistFilters = this.persistFilters;
        }
        // call the core service setup
        this.coreService.setUp();
    }
}
