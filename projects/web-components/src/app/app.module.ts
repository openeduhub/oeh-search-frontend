import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MissingTranslationHandler,
    TranslateLoader,
    TranslateModule,
    TranslateService,
    TranslateStore,
} from '@ngx-translate/core';
import { ConfigService, EduSharingApiModule } from 'ngx-edu-sharing-api';
import {
    EduSharingUiConfiguration,
    EduSharingUiModule,
    FallbackTranslationHandler,
    OptionsHelperService as OptionsHelperServiceAbstract,
    Toast as ToastAbstract,
    TranslationLoader,
} from 'ngx-edu-sharing-ui';
import {
    GlobalWidgetConfigService,
    OptionsHelperService,
    TicketService,
    ToastService,
} from 'ngx-edu-sharing-wlo-pages';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SearchModule } from 'src/app/wlo-search/search/search.module';
import { WloSearchConfig, WLO_SEARCH_CONFIG } from 'src/app/wlo-search/wlo-search-config';
import { GlobalTemplateConfigService } from '../../../../src/app/wlo-search/template/shared/services/global-template-config.service';
import { TemplateComponent } from '../../../../src/app/wlo-search/template/template.component';
import { environment } from '../environments/environment';
import { DetailsEmbeddedComponent } from './details-embedded/details-embedded.component';
import { TemplateEmbeddedComponent } from './template-embedded/template-embedded.component';
import { MaterialCssVarsModule } from 'angular-material-css-vars';

const wloSearchConfig: WloSearchConfig = {
    routerPath: '',
    wordpressUrl: '',
};

const eduSharingApiModuleWithProviders = environment.production
    ? EduSharingApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl })
    : EduSharingApiModule.forRoot();

@NgModule({
    declarations: [DetailsEmbeddedComponent, TemplateEmbeddedComponent],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        MaterialCssVarsModule.forRoot({ isAutoContrast: true }),
        eduSharingApiModuleWithProviders,
        TemplateComponent,
        SearchModule,
    ],
    providers: [
        {
            provide: WLO_SEARCH_CONFIG,
            useValue: wloSearchConfig,
        },
        // from here on dependencies of wlo-pages (edu-sharing web-components)
        { provide: 'IMAGE_PATH', useValue: 'assets/images/' },
        { provide: 'PERSIST_FILTERS', useValue: false },
        GlobalTemplateConfigService,
        GlobalWidgetConfigService,
        eduSharingApiModuleWithProviders.providers,
        EduSharingUiModule.forRoot({
            production: true,
        }).providers,
        {
            provide: OptionsHelperServiceAbstract,
            useClass: OptionsHelperService,
        },
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: TranslationLoader.create,
                deps: [HttpClient, ConfigService, EduSharingUiConfiguration],
            },
            missingTranslationHandler: {
                provide: MissingTranslationHandler,
                useClass: FallbackTranslationHandler,
            },
        }).providers,
        { provide: ToastAbstract, useClass: ToastService },
        TicketService,
        TranslateStore,
        TranslateService,
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AppModule implements DoBootstrap {
    constructor(injector: Injector) {
        const detailsEmbeddedElement = createCustomElement(DetailsEmbeddedComponent, { injector });
        customElements.define('app-details-embedded', detailsEmbeddedElement);
        const templateElement = createCustomElement(TemplateEmbeddedComponent, { injector });
        customElements.define('app-template-embedded', templateElement);
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngDoBootstrap() {
        // Do nothing.
    }
}
