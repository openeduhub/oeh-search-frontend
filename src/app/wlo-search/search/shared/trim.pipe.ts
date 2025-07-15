import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'trim',
    standalone: false,
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
