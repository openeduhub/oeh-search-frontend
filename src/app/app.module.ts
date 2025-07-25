import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { PlatformLocation } from '@angular/common';
import {
    HttpClient,
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { Inject, NgModule, Optional, Provider } from '@angular/core';
import { MAT_DIALOG_SCROLL_STRATEGY } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { ConfigService, EduSharingApiModule } from 'ngx-edu-sharing-api';
import { BApiModule } from 'ngx-edu-sharing-b-api';
import { environment } from 'src/environments/environment';
import { AppRoutingModule, ROOT_PATH, WLO_SEARCH_PATH_COMPONENT } from './app-routing.module';
import { AppComponent } from './app.component';
import { CachingInterceptor } from './caching.interceptor';
import { LanguageHeaderInterceptor } from './language-header.interceptor';
import { WloSearchConfig, WLO_SEARCH_CONFIG } from './wlo-search/wlo-search-config';
import {
    MissingTranslationHandler,
    TranslateLoader,
    TranslateModule,
    TranslateService,
    TranslateStore,
} from '@ngx-translate/core';
import {
    EduSharingUiConfiguration,
    EduSharingUiModule,
    FallbackTranslationHandler,
    TranslationLoader,
    Toast as ToastAbstract,
    OptionsHelperService as OptionsHelperServiceAbstract,
    ADDITIONAL_I18N_PROVIDER,
    ASSETS_BASE_PATH,
} from 'ngx-edu-sharing-ui';
import {
    GlobalWidgetConfigService,
    OptionsHelperService,
    TicketAuthInterceptor,
    TicketService,
    ToastService,
} from 'ngx-edu-sharing-wlo-pages';
import {
    cdnLink,
    defaultAiConfigId,
    defaultAiChatCompletionConfigId,
    defaultAiImageCreateConfigId,
    defaultAiClearCacheConfigId,
    defaultAiTextWidgetConfigId,
    defaultTopicHeaderDescriptionConfigId,
    defaultTopicHeaderImageConfigId,
    defaultTopicHeaderTextConfigId,
    defaultUserConfigurableConfigId,
    eduSharingUrlDev,
    eduSharingUrlProd,
} from './wlo-search/template/shared/custom-definitions';

const wloSearchConfig: WloSearchConfig = {
    routerPath: ROOT_PATH + WLO_SEARCH_PATH_COMPONENT,
    wordpressUrl: environment.wordpressUrl,
};

const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: LanguageHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: TicketAuthInterceptor,
        multi: true,
    },
];

const eduSharingApiModuleWithProviders = environment.production
    ? EduSharingApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl })
    : EduSharingApiModule.forRoot();

const eduSharingUrl = environment.production ? eduSharingUrlProd : eduSharingUrlDev;

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        MaterialCssVarsModule.forRoot({ isAutoContrast: true }),
        eduSharingApiModuleWithProviders,
        BApiModule.forRoot({ rootUrl: '/edu-sharing/rest/bapi' }),
    ],
    providers: [
        httpInterceptorProviders,
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
        // global configurations
        { provide: 'CDN_LINK', useValue: cdnLink },
        { provide: 'EDU_REPO_URL', useValue: eduSharingUrl },
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
export class AppModule {}
