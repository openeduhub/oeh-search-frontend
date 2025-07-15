import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'duration',
    standalone: false,
})
export class DurationPipe implements PipeTransform {
    transform(seconds: number): string {
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        let hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        let result = '';
        if (hours) {
            result += hours + ':';
        }
        result += `${padWithZeroes(minutes, 2)}:`;
        result += `${padWithZeroes(seconds, 2)} `;
        if (hours) {
            result += $localize`h`;
        } else {
            result += $localize`min`;
        }
        return result;
    }
}

function padWithZeroes(n: number, size: number): string {
    let result = n.toString();
    while (result.length < size) {
        result = '0' + result;
    }
    return result;
}
