import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-menubar',
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent {
    readonly wordpressUrl = environment.wordpressUrl;
    mobileOpen: boolean;

    constructor() {}
}
