import { returnParams, safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it('solo acepta rutas internas del Portal', () => {
    expect(safeReturnUrl('/inscripcion/eco?accion=APPLY_SCHOLARSHIP')).toBe(
      '/inscripcion/eco?accion=APPLY_SCHOLARSHIP',
    );
    expect(safeReturnUrl('//evil.com')).toBeNull();
    expect(safeReturnUrl('https://evil.com')).toBeNull();
    expect(safeReturnUrl(undefined)).toBeNull();
    expect(returnParams('/becas')).toEqual({ returnUrl: '/becas' });
    expect(returnParams('https://evil.com')).toEqual({});
  });
});
