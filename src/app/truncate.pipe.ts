import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
    transform(value: string, limit: number): string {
        if (!value || value.length <= limit) {
            return value;
        } else {
            const truncated = value.slice(0, limit);
            // Remove cut off word at the end of the string.
            return truncated.replace(/\s\S*$/, '...');
        }
    }
}
