import { GenerateFiltersPipe } from './generate-filters.pipe';

describe('GenerateFiltersPipe', () => {
    it('create an instance', () => {
        const pipe = new GenerateFiltersPipe();
        expect(pipe).toBeTruthy();
    });

    it('add a filter', () => {
        const pipe = new GenerateFiltersPipe();
        const result = pipe.transform(['foo', ['bar', 'baz']], { bazing: ['bazong'] });
        expect(result).toEqual({
            filters: JSON.stringify({
                bazing: ['bazong'],
                foo: ['bar', 'baz'],
            }),
        });
    });
});
