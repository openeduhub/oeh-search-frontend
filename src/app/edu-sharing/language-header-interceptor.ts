import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, Language } from '../config.service';

@Injectable()
export class LanguageHeaderInterceptor implements HttpInterceptor {
    private readonly locale: string;

    constructor(config: ConfigService) {
        this.locale = this.mapLocale(config.getLanguage());
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const reqClone = req.clone({
            headers: req.headers.set('locale', this.locale),
        });
        return next.handle(reqClone);
    }

    private mapLocale(language: Language): string {
        switch (language) {
            case Language.De:
                return 'de_DE';
            case Language.En:
                return 'en_US';
        }
    }
}
