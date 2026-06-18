import { mount } from '@vue/test-utils';
import LoginPage from '@/modules/auth/pages/LoginPage.vue';
import { describe, expect, test, vi } from 'vitest';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe('LoginPage.vue', () => {
  test('renders the login form', () => {
    const wrapper = mount(LoginPage);

    expect(wrapper.text()).toContain('BovWeight');
    expect(wrapper.text()).toContain('Iniciar sesión');
    expect(wrapper.text()).toContain('Contactá al administrador');
  });
});
