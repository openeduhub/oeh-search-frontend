import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EduSharingApiModule } from 'ngx-edu-sharing-api';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SearchModule } from 'src/app/wlo-search/search/search.module';
import { WloSearchConfig, WLO_SEARCH_CONFIG } from 'src/app/wlo-search/wlo-search-config';
import { environment } from '../environments/environment';
import { DetailsEmbeddedComponent } from './details-embedded/details-embedded.component';

const wloSearchConfig: WloSearchConfig = {
    routerPath: '',
    showExperiments: false,
    wordpressUrl: '',
};

@NgModule({
    declarations: [DetailsEmbeddedComponent],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        EduSharingApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl }),
        SearchModule,
    ],
    providers: [
        {
            provide: WLO_SEARCH_CONFIG,
            useValue: wloSearchConfig,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AppModule implements DoBootstrap {
    constructor(injector: Injector) {
        const detailsEmbeddedElement = createCustomElement(DetailsEmbeddedComponent, { injector });
        customElements.define('oeh-details-embedded', detailsEmbeddedElement);
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngDoBootstrap() {
        // Do nothing.
    }
}
