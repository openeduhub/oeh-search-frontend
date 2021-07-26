import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { PageModeService } from '../page-mode.service';

@Component({
    selector: 'app-footerbar',
    templateUrl: './footerbar.component.html',
    styleUrls: ['./footerbar.component.scss'],
})
export class FooterbarComponent {
    readonly wordpressUrl = environment.wordpressUrl;
    readonly footerStyle$ = this.pageMode.getPageConfig('footerStyle');

    constructor(private pageMode: PageModeService) {}
}
