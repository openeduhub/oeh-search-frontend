import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';

export type PreviewImage = Node['preview'];

@Component({
    selector: 'app-preview-image',
    templateUrl: './preview-image.component.html',
    styleUrls: ['./preview-image.component.scss'],
    standalone: false,
})
export class PreviewImageComponent {
    @Input() previewImage: PreviewImage;
    @Input() showBlurredBackground = false;
    @Input() playAnimation = false;
    @Input() objectFit: 'cover' | 'contain' = 'contain';

    @ViewChild('image') imageRef: ElementRef<HTMLImageElement>;
    @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;
    // @ViewChild('backdropCanvas') backdropCanvasRef: ElementRef<HTMLCanvasElement>;

    showCanvas: boolean = false;
    replacedWithStatic: boolean = false;

    constructor() {}
    onImageLoad(event: Event): void {
        if (this.isVideo()) {
            const image = event.target as HTMLImageElement;
            this.showCanvas = true;
            setTimeout(() => {
                this.initCanvas(image, this.canvasRef.nativeElement);
                // this.initCanvas(image, this.backdropCanvasRef.nativeElement);
                this.replacedWithStatic = true;
            });
        }
    }

    private initCanvas(image: HTMLImageElement, canvas: HTMLCanvasElement): void {
        var width = image.naturalWidth;
        var height = image.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    }

    private isVideo(): boolean {
        // We get preview images that set 'mimetype: image/jpeg' in metadata but point to a gif
        // anyway. Just wrap all images for now.
        return true;
        // FIXME: Switch to something like this.
        //
        // return ['image/gif'].includes(this.previewImage.mimetype);
    }
}
