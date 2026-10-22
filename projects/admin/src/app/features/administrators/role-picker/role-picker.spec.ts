import { TestBed } from '@angular/core/testing';
import { RolePicker } from './role-picker';

describe('RolePicker', () => {
  it('marca y desmarca roles y respeta los bloqueados', async () => {
    const fixture = TestBed.createComponent(RolePicker);
    fixture.componentRef.setInput('roles', [
      {
        role: 'SUPER_ADMIN',
        label: 'Superadministración',
        permissions: ['admin.access', 'users.manage'],
      },
      { role: 'FINANCE', label: 'Finanzas', permissions: ['admin.access', 'payments.read'] },
    ]);
    fixture.componentRef.setInput('value', ['SUPER_ADMIN']);
    fixture.componentRef.setInput('locked', ['SUPER_ADMIN']);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const [superAdmin, finance] = [...host.querySelectorAll<HTMLInputElement>('input')];

    expect(superAdmin.disabled).toBe(true);
    expect(host.textContent).toContain('Gestionar administradores');
    finance.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['SUPER_ADMIN', 'FINANCE']);
    finance.click();
    expect(fixture.componentInstance.value()).toEqual(['SUPER_ADMIN']);
  });
});
