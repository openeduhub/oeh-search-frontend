import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestCache } from './request-cache';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
    constructor(private cache: RequestCache) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // continue if not cacheable.
        if (!isCacheable(req)) {
            return next.handle(req);
        }
        const cachedResponse = this.cache.get(req);
        return cachedResponse ? of(cachedResponse) : sendRequest(req, next, this.cache);
    }
}

function isCacheable(req: HttpRequest<any>): boolean {
    return (
        !req.url?.includes('/edu-sharing/rest/node/v1/nodes/') &&
        !req.url?.includes('/ai/prompt/image/public/') &&
        !req.url?.includes('/ai/prompt/text/public/')
    );
}

/**
 * Get server response observable by sending request to `next()`.
 * Will add the response to the cache on the way out.
 */
function sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: RequestCache,
): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
        tap((event) => {
            // There may be other events besides the response.
            if (event instanceof HttpResponse) {
                cache.put(req, event); // Update the cache.
            }
        }),
    );
}
