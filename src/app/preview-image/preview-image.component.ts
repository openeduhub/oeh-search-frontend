import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { PreviewImage, Thumbnail } from '../../generated/graphql';

@Component({
    // Augment the built-in <img> element.
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[appPreviewImage]',
    template: '',
})
export class PreviewImageComponent implements OnInit {
    // Use an alias for a property input that is equal to the component selector.
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('appPreviewImage')
    set previewImage(value: PreviewImage) {
        this.previewImage_ = value;
        this.setPreviewImage(value);
    }
    get previewImage() {
        return this.previewImage_;
    }
    private previewImage_: PreviewImage;
    @Input() loadHighResImage = false;

    constructor(private elementRef: ElementRef<HTMLImageElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.alt = '';
    }

    private setPreviewImage(value: PreviewImage) {
        this.elementRef.nativeElement.src = this.getThumbnail(value.thumbnail);
        if (this.loadHighResImage) {
            // Wait a tick, so the browser will load and display the lower-res thumbnail instead of
            // waiting for the high-res image before displaying anything.
            setTimeout(() => {
                this.elementRef.nativeElement.src = value.url;
            });
        }
    }

    private getThumbnail(thumbnail: Thumbnail): string {
        switch (thumbnail.__typename) {
            case 'EmbeddedThumbnail':
                return `data:${thumbnail.mimetype};base64,${thumbnail.image}`;
            case 'ExternalThumbnail':
                return thumbnail.url;
        }
    }
}
