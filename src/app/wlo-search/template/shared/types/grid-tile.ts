export class GridTile {
    item?: string;
    classNames?: string;
    cols: number;
    rows: number;
    nodeId?: string;

    constructor(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
    }
}
