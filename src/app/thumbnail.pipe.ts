import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Thumbnail } from '../generated/graphql';

@Pipe({
    name: 'thumbnail',
})
export class ThumbnailPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(thumbnail: Thumbnail): SafeResourceUrl {
        switch (thumbnail.__typename) {
            case 'EmbeddedThumbnail':
                return this.sanitizer.bypassSecurityTrustResourceUrl(
                    `data:${thumbnail.mimetype};base64,${thumbnail.image}`,
                );
            case 'ExternalThumbnail':
                return thumbnail.url;
        }
    }
}
