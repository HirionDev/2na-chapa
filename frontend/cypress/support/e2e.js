Cypress.Commands.add('login', (username = 'admin', password = 'admin123') => {
  cy.visit('/');
  cy.get('input[aria-label="Usuário"]').type(username);
  cy.get('input[aria-label="Senha"]').type(password);
  cy.get('button').contains('Entrar').click();
});