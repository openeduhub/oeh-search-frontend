import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-footerbar',
    templateUrl: './footerbar.component.html',
    styleUrls: ['./footerbar.component.scss'],
})
export class FooterbarComponent {
    readonly wordpressUrl = environment.wordpressUrl;

    constructor() {}
}
