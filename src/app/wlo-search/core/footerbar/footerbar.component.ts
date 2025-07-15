import { Component } from '@angular/core';
import { ConfigService } from '../config.service';
import { PageModeService } from '../page-mode.service';

@Component({
    selector: 'app-footerbar',
    templateUrl: './footerbar.component.html',
    styleUrls: ['./footerbar.component.scss'],
    standalone: false,
})
export class FooterbarComponent {
    readonly wordpressUrl = this.config.get().wordpressUrl;
    readonly footerStyle$ = this.pageMode.getPageConfig('footerStyle');

    constructor(private pageMode: PageModeService, private config: ConfigService) {}
}
