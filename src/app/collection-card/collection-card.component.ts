import { Component, Input, OnInit } from '@angular/core';
import { Collection } from '../search.service';

@Component({
    selector: 'app-collection-card',
    templateUrl: './collection-card.component.html',
    styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent {
    @Input() collection: Collection;
    backgroundColor: string;
    backgroundType: 'dark' | 'light';

    constructor() {}

    // ngOnInit(): void {
    //     this.setCollectionBackgroundColor();
    // }

    // private setCollectionBackgroundColor() {
    //     const rgb = this.getRgbColor(this.collection.color);
    //     if (rgb) {
    //         this.backgroundColor = this.collection.color;
    //         this.backgroundType = this.getIsDark(rgb) ? 'dark' : 'light';
    //     }
    // }

    // private getIsDark(rgb: number[]): boolean {
    //     return this.getLuminance(rgb) < 0.5;
    // }

    // private getLuminance(rgb: number[]): number {
    //     return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    // }

    // private getRgbColor(hexColor: string): number[] | null {
    //     const match = hexColor.match(/^#([0-9a-f]{6})$/i)[1];
    //     if (match) {
    //         return [
    //             parseInt(match.substr(0, 2), 16) / 255,
    //             parseInt(match.substr(2, 2), 16) / 255,
    //             parseInt(match.substr(4, 2), 16) / 255,
    //         ];
    //     } else {
    //         return null;
    //     }
    // }
}
