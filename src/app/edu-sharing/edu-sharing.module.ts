import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiModule } from '../api/api.module';
import { CachingInterceptor } from './caching-interceptor';
import { EduSharingService } from './edu-sharing.service';
import { LanguageHeaderInterceptor } from './language-header-interceptor';
import { RequestCache } from './request-cache';
import { ValueMappingService } from './value-mapping.service';

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: LanguageHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
];

@NgModule({
    declarations: [],
    imports: [HttpClientModule, ApiModule.forRoot({ rootUrl: environment.eduSharingApiUrl })],
    providers: [EduSharingService, ValueMappingService, RequestCache, httpInterceptorProviders],
})
export class EduSharingModule {}
