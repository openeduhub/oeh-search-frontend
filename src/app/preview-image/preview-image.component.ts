import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Thumbnail } from '../../../elasticsearch-relay/src/generated/graphql';
import { PreviewImage } from '../../generated/graphql';

@Component({
    // Augment the built-in <img> element.
    // tslint:disable-next-line:component-selector
    selector: '[appPreviewImage]',
    template: '',
})
export class PreviewImageComponent implements OnChanges {
    // Use an alias for a property input that is equal to the component selector.
    // tslint:disable-next-line:no-input-rename
    @Input('appPreviewImage') previewImage: PreviewImage;
    @Input() loadHighResImage = false;
    @HostBinding('alt') readonly alt = '';
    @HostBinding('src') src: SafeResourceUrl;

    constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.previewImage) {
            this.src = this.getThumbnail(changes.previewImage.currentValue.thumbnail);
        }
        if ((changes.previewImage || changes.loadHighResImage) && this.loadHighResImage) {
            this.loadImage(this.previewImage.url).subscribe((objectUrl) => (this.src = objectUrl));
        }
    }

    private getThumbnail(thumbnail: Thumbnail): SafeResourceUrl {
        switch (thumbnail.__typename) {
            case 'EmbeddedThumbnail':
                return this.domSanitizer.bypassSecurityTrustResourceUrl(
                    `data:${thumbnail.mimetype};base64,${thumbnail.image}`,
                );
            case 'ExternalThumbnail':
                return thumbnail.url;
        }
    }

    private loadImage(url: string): Observable<SafeResourceUrl> {
        return this.httpClient
            .get(url, { responseType: 'blob' })
            .pipe(
                map((blob) => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob))),
            );
    }
}
