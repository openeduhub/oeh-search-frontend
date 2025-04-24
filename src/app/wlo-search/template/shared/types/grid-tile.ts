import { StatisticNode } from 'ngx-edu-sharing-wlo-pages';

export class GridTile {
    item?: string;
    classNames?: string;
    cols: number;
    rows: number;
    nodeId?: string;
    searchCount?: number;
    statistics?: StatisticNode[];

    constructor(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
    }
}
