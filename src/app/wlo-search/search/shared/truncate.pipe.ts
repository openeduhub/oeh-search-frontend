import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate',
    standalone: false,
})
export class TruncatePipe implements PipeTransform {
    transform(value: string, limit: number): string {
        if (!value || value.length <= limit || limit === -1) {
            return value;
        } else {
            const truncated = value.slice(0, limit);
            // Remove cut off word at the end of the string.
            return truncated.replace(/\s\S*$/, '...');
        }
    }
}
