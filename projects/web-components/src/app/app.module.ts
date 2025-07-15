import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { PlatformLocation } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DoBootstrap, Inject, Injector, NgModule, Optional, Provider } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_SCROLL_STRATEGY } from '@angular/material/dialog';
import {
    MissingTranslationHandler,
    TranslateLoader,
    TranslateModule,
    TranslateService,
    TranslateStore,
} from '@ngx-translate/core';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { ConfigService, EduSharingApiModule } from 'ngx-edu-sharing-api';
import { BApiModule } from 'ngx-edu-sharing-b-api';
import {
    ADDITIONAL_I18N_PROVIDER,
    ASSETS_BASE_PATH,
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
import {
    cdnLink,
    defaultAiChatCompletionConfigId,
    defaultAiClearCacheConfigId,
    defaultAiConfigId,
    defaultAiImageCreateConfigId,
    defaultAiTextWidgetConfigId,
    defaultTopicHeaderDescriptionConfigId,
    defaultTopicHeaderImageConfigId,
    defaultTopicHeaderTextConfigId,
    defaultUserConfigurableConfigId,
    eduSharingUrl,
} from '../../../../src/app/wlo-search/template/shared/custom-definitions';
import { TemplateComponent } from '../../../../src/app/wlo-search/template/template.component';
import { environment } from '../environments/environment';
import { DetailsEmbeddedComponent } from './details-embedded/details-embedded.component';
import { TemplateEmbeddedComponent } from './template-embedded/template-embedded.component';

const wloSearchConfig: WloSearchConfig = {
    routerPath: '',
    wordpressUrl: '',
};

const eduSharingApiModuleWithProviders = environment.production
    ? EduSharingApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl })
    : EduSharingApiModule.forRoot();

const eduSharingBapiModuleWithProviders = environment.production
    ? BApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl + '/bapi' })
    : BApiModule.forRoot({ rootUrl: '/edu-sharing/rest/bapi' });

@NgModule({
    declarations: [DetailsEmbeddedComponent, TemplateEmbeddedComponent],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        MaterialCssVarsModule.forRoot({ isAutoContrast: true }),
        eduSharingApiModuleWithProviders,
        eduSharingBapiModuleWithProviders,
        TemplateComponent,
        SearchModule,
    ],
    providers: [
        {
            provide: WLO_SEARCH_CONFIG,
            useValue: wloSearchConfig,
        },
        ((): Provider => {
            // From
            // https://stackoverflow.com/questions/7944460/detect-safari-browser/23522755#23522755
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (isSafari) {
                // There is a bug in Safari since version 15 that shifts interaction areas away from
                // visible elements when scrolling of the main page is blocked, making it ignore
                // button clicks. So we disable scroll blocking for Safari for now.
                return {
                    provide: MAT_DIALOG_SCROLL_STRATEGY,
                    useFactory: (scrollStrategyOptions: ScrollStrategyOptions) =>
                        scrollStrategyOptions.noop,
                    deps: [ScrollStrategyOptions],
                };
            } else {
                return [];
            }
        })(),
        // from here on dependencies of wlo-pages (edu-sharing web-components)
        { provide: 'CDN_LINK', useValue: cdnLink },
        { provide: 'EDU_REPO_URL', useValue: eduSharingUrl },
        { provide: 'IMAGE_PATH', useValue: 'assets/images/' },
        { provide: 'PERSIST_FILTERS', useValue: false },
        // global AI default configs
        { provide: 'DEFAULT_AI_CONFIG_ID', useValue: defaultAiConfigId },
        {
            provide: 'DEFAULT_AI_CHAT_COMPLETION_CONFIG_ID',
            useValue: defaultAiChatCompletionConfigId,
        },
        {
            provide: 'DEFAULT_AI_IMAGE_CREATE_CONFIG_ID',
            useValue: defaultAiImageCreateConfigId,
        },
        {
            provide: 'DEFAULT_AI_CLEAR_CACHE_CONFIG_ID',
            useValue: defaultAiClearCacheConfigId,
        },
        // global widget default configs
        { provide: 'DEFAULT_AI_TEXT_WIDGET_CONFIG_ID', useValue: defaultAiTextWidgetConfigId },
        {
            provide: 'DEFAULT_TOPIC_HEADER_DESCRIPTION_WIDGET_CONFIG_ID',
            useValue: defaultTopicHeaderDescriptionConfigId,
        },
        {
            provide: 'DEFAULT_TOPIC_HEADER_IMAGE_WIDGET_CONFIG_ID',
            useValue: defaultTopicHeaderImageConfigId,
        },
        {
            provide: 'DEFAULT_TOPIC_HEADER_TEXT_WIDGET_CONFIG_ID',
            useValue: defaultTopicHeaderTextConfigId,
        },
        {
            provide: 'DEFAULT_USER_CONFIGURABLE_WIDGET_CONFIG_ID',
            useValue: defaultUserConfigurableConfigId,
        },
        {
            provide: ADDITIONAL_I18N_PROVIDER,
            useFactory: (platformLocation: PlatformLocation) => {
                return (lang: string) => {
                    return [
                        (platformLocation.getBaseHrefFromDOM()
                            ? platformLocation.getBaseHrefFromDOM()?.replace(/\/$/, '')
                            : '') +
                            '/assets/i18n/' +
                            lang +
                            '.json',
                    ];
                };
            },
            deps: [PlatformLocation],
        },
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
                deps: [
                    HttpClient,
                    ConfigService,
                    EduSharingUiConfiguration,
                    [new Inject(ASSETS_BASE_PATH), new Optional()],
                    [new Inject(ADDITIONAL_I18N_PROVIDER), new Optional()],
                ],
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
