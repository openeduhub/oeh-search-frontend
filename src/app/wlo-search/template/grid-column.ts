import { GridTile } from './grid-tile';

export interface GridColumn {
    uuid: string;
    type?: string;
    heading?: string;
    description?: string;
    gridType?: string;
    grid?: GridTile[];
    backgroundColor?: string;
}
