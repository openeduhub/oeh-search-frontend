/**
 * Helper function to retrieve the search URL.
 */
export const retrieveSearchUrl = (): string => {
    // take into account potential sub-paths, e.g., due to language switch
    const pathNameArray: string[] = window.location.pathname.split('/');
    // example pathNameArray = [ "", "de", "template" ]
    const suffix: string =
        pathNameArray.length > 2 && pathNameArray[1] !== '' ? '/' + pathNameArray[1] : '';
    return window.location.origin + suffix + '/search';
};

/**
 * Retrieves a background color for a given topic name (just for visuals).
 *
 * @param topicName
 */
export const getTopicColor = (topicName: string): string => {
    let topicColor: string = stringToColour(topicName);

    // TODO: later, this will be stored as variable that can be changed by the user
    // check, if dark mode is preferred (https://stackoverflow.com/a/57795495)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // check, if the color is too light
        // https://stackoverflow.com/a/12043228
        const c: string = topicColor.substring(1); // strip #
        const rgb: number = parseInt(c, 16); // convert rrggbb to decimal
        const r: number = (rgb >> 16) & 0xff; // extract red
        const g: number = (rgb >> 8) & 0xff; // extract green
        const b: number = (rgb >> 0) & 0xff; // extract blue

        const luma: number = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        if (luma > 100) {
            // darken the color
            topicColor = shadeColor(topicColor, -60);
        }
    }
    return topicColor;
};

/**
 * Creates a hexadecimal color based on a string.
 * Reference: https://stackoverflow.com/a/16348977
 *
 * @param str
 */
const stringToColour = (str: string): string => {
    let hash = 0;
    str.split('').forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += value.toString(16).padStart(2, '0');
    }
    return colour;
};

/**
 * Shades a given color code by a given percentage number.
 * Reference: https://stackoverflow.com/a/13532993
 *
 * @param color
 * @param percent
 */
const shadeColor = (color: string, percent: number): string => {
    let r: number = parseInt(color.substring(1, 3), 16);
    let g: number = parseInt(color.substring(3, 5), 16);
    let b: number = parseInt(color.substring(5, 7), 16);

    r = Math.round((r * (100 + percent)) / 100);
    g = Math.round((g * (100 + percent)) / 100);
    b = Math.round((b * (100 + percent)) / 100);

    r = r < 255 ? r : 255;
    g = g < 255 ? g : 255;
    b = b < 255 ? b : 255;

    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    const RR: string = r.toString(16).length == 1 ? '0' + r.toString(16) : r.toString(16);
    const GG: string = g.toString(16).length == 1 ? '0' + g.toString(16) : g.toString(16);
    const BB: string = b.toString(16).length == 1 ? '0' + b.toString(16) : b.toString(16);

    return '#' + RR + GG + BB;
};
