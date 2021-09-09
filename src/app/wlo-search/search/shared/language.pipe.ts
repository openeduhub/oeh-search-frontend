import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'language',
})
export class LanguagePipe implements PipeTransform {
    transform(value: string): string {
        switch (value.toLocaleLowerCase()) {
            case 'de':
            case 'deutsch':
            case 'de-de':
                return $localize`German`;
            case 'en':
                return $localize`English`;
            case 'fr':
                return $localize`France`;
            default:
                return value;
        }
    }
}
