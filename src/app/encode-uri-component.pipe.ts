import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'encodeUriComponent',
})
export class EncodeUriComponentPipe implements PipeTransform {
    transform(value: string): string {
        return encodeURIComponent(value);
    }
}
