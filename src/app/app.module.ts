import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpHandler,
    HttpRequest,
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { inject, NgModule, Provider } from '@angular/core';
import { MAT_DIALOG_SCROLL_STRATEGY } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InMemoryCache } from '@apollo/client/core';
import { ApolloModule, APOLLO_NAMED_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ConfigService, EduSharingApiModule } from 'ngx-edu-sharing-api';
import { BApiModule } from 'ngx-edu-sharing-b-api';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
    OpenAnalyticsSessionGQL,
    ReportLifecycleEventGQL,
    ReportResultClickGQL,
    ReportSearchRequestGQL,
} from 'src/generated/graphql';
import { AppRoutingModule, ROOT_PATH, WLO_SEARCH_PATH_COMPONENT } from './app-routing.module';
import { AppComponent } from './app.component';
import { CachingInterceptor } from './caching.interceptor';
import { LanguageHeaderInterceptor } from './language-header.interceptor';
import { TelemetryApiWrapper } from './telemetry-api-wrapper';
import { TELEMETRY_API } from './wlo-search/telemetry-api';
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
    defaultAiConfigNodeId,
    defaultAiChatCompletionConfigNodeId,
    defaultAiImageCreateConfigNodeId,
    defaultAiClearCacheConfigNodeId,
    defaultAiTextWidgetNodeId,
    defaultBreadcrumbWidgetNodeId,
    defaultCollectionChipsNodeId,
    defaultMediaRenderingNodeId,
    defaultParentPageConfigNodeId,
    defaultParentWidgetConfigNodeId,
    defaultTextWidgetNodeId,
    defaultTopicHeaderImageNodeId,
    defaultTopicHeaderTextNodeId,
    defaultTopicsColumnBrowserNodeId,
    defaultUserConfigurableNodeId,
    eduSharingUrl,
} from './wlo-search/template/shared/custom-definitions';

const wloSearchConfig: WloSearchConfig = {
    routerPath: ROOT_PATH + WLO_SEARCH_PATH_COMPONENT,
    showExperiments: environment.showExperiments,
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

const telemetryProviders = environment.analyticsUrl
    ? [
          {
              provide: TELEMETRY_API,
              useFactory: () =>
                  new TelemetryApiWrapper(
                      inject(OpenAnalyticsSessionGQL),
                      inject(ReportLifecycleEventGQL),
                      inject(ReportResultClickGQL),
                      inject(ReportSearchRequestGQL),
                  ),
          },
          {
              provide: APOLLO_NAMED_OPTIONS,
              deps: [HttpLink],
              useFactory: (httpLink: HttpLink) => ({
                  analytics: {
                      link: httpLink.create({
                          uri: environment.analyticsUrl + '/graphql',
                      }),
                      cache: new InMemoryCache(),
                  },
                  analyticsBeacon: {
                      link: httpLinkBeacon.create({
                          uri: environment.analyticsUrl + '/graphql',
                      }),
                      cache: new InMemoryCache(),
                  },
              }),
          },
      ]
    : [];

const httpLinkBeacon = (() => {
    class BeaconHttpHandler implements HttpHandler {
        handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
            const headers = {
                type: 'application/json',
            };
            const blob = new Blob([JSON.stringify(req.body)], headers);
            const success = navigator.sendBeacon(req.url, blob);
            if (success) {
                return of({ type: HttpEventType.Sent });
            } else {
                return throwError({ message: 'Failed to queue request' });
            }
        }
    }
    const httpClient = new HttpClient(new BeaconHttpHandler());
    return new HttpLink(httpClient);
})();

const eduSharingApiModuleWithProviders = EduSharingApiModule.forRoot({
    rootUrl: environment.eduSharingApiUrl,
});

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        eduSharingApiModuleWithProviders,
        BApiModule.forRoot({ rootUrl: '/edu-sharing/rest/bapi' }),
        ApolloModule,
    ],
    providers: [
        httpInterceptorProviders,
        {
            provide: WLO_SEARCH_CONFIG,
            useValue: wloSearchConfig,
        },
        ...telemetryProviders,
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
        // global AI configs
        { provide: 'DEFAULT_AI_CONFIG_NODE_ID', useValue: defaultAiConfigNodeId },
        {
            provide: 'DEFAULT_AI_CHAT_COMPLETION_CONFIG_NODE_ID',
            useValue: defaultAiChatCompletionConfigNodeId,
        },
        {
            provide: 'DEFAULT_AI_IMAGE_CREATE_CONFIG_NODE_ID',
            useValue: defaultAiImageCreateConfigNodeId,
        },
        {
            provide: 'DEFAULT_AI_CLEAR_CACHE_CONFIG_NODE_ID',
            useValue: defaultAiClearCacheConfigNodeId,
        },
        // global widget configs
        { provide: 'PARENT_PAGE_CONFIG_NODE_ID', useValue: defaultParentPageConfigNodeId },
        { provide: 'PARENT_WIDGET_CONFIG_NODE_ID', useValue: defaultParentWidgetConfigNodeId },
        { provide: 'DEFAULT_AI_TEXT_WIDGET_NODE_ID', useValue: defaultAiTextWidgetNodeId },
        { provide: 'DEFAULT_BREADCRUMB_WIDGET_NODE_ID', useValue: defaultBreadcrumbWidgetNodeId },
        {
            provide: 'DEFAULT_COLLECTION_CHIPS_WIDGET_NODE_ID',
            useValue: defaultCollectionChipsNodeId,
        },
        {
            provide: 'DEFAULT_MEDIA_RENDERING_WIDGET_NODE_ID',
            useValue: defaultMediaRenderingNodeId,
        },
        { provide: 'DEFAULT_TEXT_WIDGET_NODE_ID', useValue: defaultTextWidgetNodeId },
        {
            provide: 'DEFAULT_TOPIC_HEADER_IMAGE_WIDGET_NODE_ID',
            useValue: defaultTopicHeaderImageNodeId,
        },
        {
            provide: 'DEFAULT_TOPIC_HEADER_TEXT_WIDGET_NODE_ID',
            useValue: defaultTopicHeaderTextNodeId,
        },
        {
            provide: 'DEFAULT_TOPICS_COLUMN_BROWSER_WIDGET_NODE_ID',
            useValue: defaultTopicsColumnBrowserNodeId,
        },
        {
            provide: 'DEFAULT_USER_CONFIGURABLE_WIDGET_NODE_ID',
            useValue: defaultUserConfigurableNodeId,
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
export class AppModule {}
