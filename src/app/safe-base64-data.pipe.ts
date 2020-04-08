import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeBase64Data',
})
export class SafeBase64DataPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: string, mimetype: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`data:${mimetype};base64,${value}`);
    }
}
