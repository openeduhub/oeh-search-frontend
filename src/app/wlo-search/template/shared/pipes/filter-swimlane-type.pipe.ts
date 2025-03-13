import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterSwimlaneType',
    standalone: true,
    pure: true,
})
export class FilterSwimlaneTypePipe implements PipeTransform {
    transform(swimlanes: any[], type: string, trigger: number): any[] {
        if (!swimlanes?.length || !trigger) {
            return [];
        }
        return swimlanes.filter((swimlane) => swimlane.type === type);
    }
}
