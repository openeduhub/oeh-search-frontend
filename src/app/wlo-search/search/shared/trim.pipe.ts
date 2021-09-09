import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'trim',
})
export class TrimPipe implements PipeTransform {
    transform(value: string): string {
        if (typeof value !== 'string') {
            return value;
        } else {
            return value.trim();
        }
    }
}
