describe('Authentication', () => {
  it('Visits the login screen', () => {
    cy.visit('/');
    cy.contains('Bienvenido de nuevo');
    cy.contains('Iniciar Sesion');
  });
});
