import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { PreviewImage } from './preview-image.component';

@Component({
    // Augment the built-in <img> element.
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[appPreviewImageInner]',
    template: '',
})
export class PreviewImageInnerComponent implements OnInit {
    // Use an alias for a property input that is equal to the component selector.
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('appPreviewImageInner')
    get previewImage() {
        return this.previewImage_;
    }
    set previewImage(value: PreviewImage) {
        this.previewImage_ = value;
        this.setPreviewImage();
        this.loadHighResImageIfWanted();
    }
    private previewImage_: PreviewImage;

    @Input()
    get loadHighResImage() {
        return this._loadHighResImage;
    }
    set loadHighResImage(value) {
        this._loadHighResImage = value;
        this.loadHighResImageIfWanted();
    }
    private _loadHighResImage = false;

    constructor(private elementRef: ElementRef<HTMLImageElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.alt = '';
    }

    private setPreviewImage() {
        this.elementRef.nativeElement.src = this.getThumbnail(this.previewImage);
    }

    private loadHighResImageIfWanted(): void {
        if (this.loadHighResImage && this.previewImage) {
            // Wait a tick, so the browser will load and display the lower-res thumbnail instead of
            // waiting for the high-res image before displaying anything.
            setTimeout(() => {
                this.elementRef.nativeElement.src = this.previewImage.url;
            });
        }
    }

    private getThumbnail(previewImage: PreviewImage): string {
        if (previewImage.data) {
            return `data:${previewImage.mimetype || 'image/*'};base64,${previewImage.data}`;
        } else {
            return previewImage.url;
        }
    }
}
