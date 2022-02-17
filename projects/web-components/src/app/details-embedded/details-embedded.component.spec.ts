import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEmbeddedComponent } from './details-embedded.component';

describe('DetailsEmbeddedComponent', () => {
    let component: DetailsEmbeddedComponent;
    let fixture: ComponentFixture<DetailsEmbeddedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailsEmbeddedComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailsEmbeddedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
