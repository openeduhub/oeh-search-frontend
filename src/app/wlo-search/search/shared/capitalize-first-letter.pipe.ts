import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalizeFirstLetter',
    standalone: false,
})
export class CapitalizeFirstLetterPipe implements PipeTransform {
    transform(value: string): string {
        if (value?.[0]) {
            return value[0].toUpperCase() + value.substr(1);
        } else {
            return value;
        }
    }
}
