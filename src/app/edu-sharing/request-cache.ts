import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RequestCache {
    private readonly cache = new Map<string, HttpResponse<any>>();

    get(req: HttpRequest<any>): HttpResponse<any> | null {
        return this.cache.get(this.getMappingKey(req)) ?? null;
    }

    put(req: HttpRequest<any>, res: HttpResponse<any>): void {
        this.cache.set(this.getMappingKey(req), res);
    }

    private getMappingKey(req: HttpRequest<any>): string {
        return req.method + ' ' + req.urlWithParams + ' ' + req.serializeBody();
    }
}
