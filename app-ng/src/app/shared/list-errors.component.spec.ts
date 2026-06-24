import { TestBed } from '@angular/core/testing';
import { ListErrorsComponent } from './list-errors.component';

describe('ListErrorsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListErrorsComponent] }).compileComponents();
  });

  it('renders nothing when errors is null', () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('ul')).toBeNull();
  });

  it('renders one line per field/message as "<field> <message>"', () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.componentInstance.errors = {
      email: ['is invalid', 'is required'],
      password: ['is too short'],
    };
    fixture.detectChanges();
    const items = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('li'),
    ).map((li) => li.textContent?.trim());
    expect(items).toContain('email is invalid');
    expect(items).toContain('email is required');
    expect(items).toContain('password is too short');
    expect(items.length).toBe(3);
  });
});
