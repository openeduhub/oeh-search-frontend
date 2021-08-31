import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CollectionPropertyPipe } from './collection-property.pipe';
import { DisplayNamePipe } from './display-name.pipe';
import { InCollectionWithTypePipe } from './in-collection-with-type.pipe';
import { IsOerPipe } from './is-oer.pipe';
import { NodePropertyPipe } from './nodeProperty.pipe';

@NgModule({
    declarations: [
        InCollectionWithTypePipe,
        IsOerPipe,
        NodePropertyPipe,
        CollectionPropertyPipe,
        DisplayNamePipe,
    ],
    imports: [CommonModule],
    exports: [
        CommonModule,
        InCollectionWithTypePipe,
        IsOerPipe,
        NodePropertyPipe,
        CollectionPropertyPipe,
        DisplayNamePipe,
    ],
})
export class SharedModule {}
