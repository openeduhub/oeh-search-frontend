import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
    HttpClient,
    HttpClientModule,
    HttpEvent,
    HttpEventType,
    HttpHandler,
    HttpRequest,
    HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { inject, NgModule, Provider } from '@angular/core';
import { MAT_DIALOG_SCROLL_STRATEGY } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InMemoryCache } from '@apollo/client/core';
import { ApolloModule, APOLLO_NAMED_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { EduSharingApiModule } from 'ngx-edu-sharing-api';
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

const wloSearchConfig: WloSearchConfig = {
    routerPath: ROOT_PATH + WLO_SEARCH_PATH_COMPONENT,
    showExperiments: environment.showExperiments,
    wordpressUrl: environment.wordpressUrl,
};

const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: LanguageHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
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

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        EduSharingApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl }),
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
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
