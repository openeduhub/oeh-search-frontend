import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';

@Injectable()
export class LanguageHeaderInterceptor implements HttpInterceptor {
    private readonly locale: string;

    constructor(@Inject(LOCALE_ID) locale: string) {
        this.locale = this.mapLocale(locale);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const reqClone = req.clone({
            headers: req.headers.set('locale', this.locale),
        });
        return next.handle(reqClone);
    }

    private mapLocale(locale: string): string {
        switch (locale) {
            case 'de':
                return 'de_DE';
            case 'en-US':
                return 'en_US';
            default:
                throw new Error(`unknown locale: ${locale}`);
        }
    }
}
