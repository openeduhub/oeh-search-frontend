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
    // global widget configuration
    @Input() cdnLink?: string;
    @Input() eduRepoUrl?: string;
    @Input() iconPath?: string;
    @Input() imagePath?: string;
    @Input() parentWidgetConfigNodeId?: string;

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
        if (this.eduRepoUrl) {
            this.globalWidgetConfigService.eduRepoUrl = this.eduRepoUrl;
        }
        if (this.iconPath) {
            this.globalTemplateConfigService.iconPath = this.iconPath;
            this.globalWidgetConfigService.iconPath = this.iconPath;
        }
        if (this.imagePath) {
            this.globalWidgetConfigService.imagePath = this.imagePath;
        }
        if (this.parentWidgetConfigNodeId) {
            this.globalWidgetConfigService.parentWidgetConfigNodeId = this.parentWidgetConfigNodeId;
        }
        // call the core service setup
        this.coreService.setUp();
    }
}
