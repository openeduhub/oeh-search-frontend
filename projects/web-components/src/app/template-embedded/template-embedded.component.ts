import { Component, Input, OnInit } from '@angular/core';
import { GlobalWidgetConfigService } from 'ngx-edu-sharing-wlo-pages';
import { CoreService } from '../../../../../src/app/wlo-search/core/core.service';

@Component({
    selector: 'app-template-embedded',
    templateUrl: './template-embedded.component.html',
    styleUrls: ['./template-embedded.component.scss'],
    standalone: false,
})
export class TemplateEmbeddedComponent implements OnInit {
    @Input() collectionId: string;
    // global template + widget configuration
    @Input() cdnLink?: string;
    @Input() defaultAiConfigId?: string;
    @Input() defaultAiChatCompletionConfigId?: string;
    @Input() defaultAiImageCreateConfigId?: string;
    @Input() defaultAiClearCacheConfigId?: string;
    @Input() defaultAiTextWidgetConfigId?: string;
    @Input() defaultTopicHeaderImageWidgetNodeId?: string;
    @Input() defaultTopicHeaderTextWidgetNodeId?: string;
    @Input() defaultUserConfigurableWidgetNodeId?: string;
    @Input() eduRepoUrl?: string;
    @Input() imagePath?: string;
    @Input() persistFilters?: boolean;

    constructor(
        private coreService: CoreService,
        private globalWidgetConfigService: GlobalWidgetConfigService,
    ) {}

    /**
     * Sets the global widget configuration on component initialization.
     */
    ngOnInit(): void {
        if (this.cdnLink) {
            this.globalWidgetConfigService.cdnLink = this.cdnLink;
        }
        if (this.defaultAiConfigId) {
            this.globalWidgetConfigService.defaultAiConfigId = this.defaultAiConfigId;
        }
        if (this.defaultAiChatCompletionConfigId) {
            this.globalWidgetConfigService.defaultAiChatCompletionConfigId =
                this.defaultAiChatCompletionConfigId;
        }
        if (this.defaultAiImageCreateConfigId) {
            this.globalWidgetConfigService.defaultAiImageCreateConfigId =
                this.defaultAiImageCreateConfigId;
        }
        if (this.defaultAiClearCacheConfigId) {
            this.globalWidgetConfigService.defaultAiClearCacheConfigId =
                this.defaultAiClearCacheConfigId;
        }
        if (this.defaultAiTextWidgetConfigId) {
            this.globalWidgetConfigService.defaultAiTextWidgetConfigId =
                this.defaultAiTextWidgetConfigId;
        }
        if (this.defaultTopicHeaderImageWidgetNodeId) {
            this.globalWidgetConfigService.defaultTopicHeaderImageWidgetNodeId =
                this.defaultTopicHeaderImageWidgetNodeId;
        }
        if (this.defaultTopicHeaderTextWidgetNodeId) {
            this.globalWidgetConfigService.defaultTopicHeaderTextWidgetNodeId =
                this.defaultTopicHeaderTextWidgetNodeId;
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
        if (this.persistFilters !== undefined) {
            this.globalWidgetConfigService.persistFilters = this.persistFilters;
        }
        // call the core service setup
        this.coreService.setUp();
    }
}
