describe('Pedidos Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/pedidos');
  });

  it('should create a new pedido', () => {
    cy.get('a').contains('Novo Pedido').click();
    cy.get('input[aria-label="Nome do Cliente"]').type('João');
    cy.get('select[aria-label="Tipo"]').select('balcao');
    cy.get('select').eq(1).select('Hambúrguer');
    cy.get('textarea[aria-label="Observações"]').type('Sem cebola');
    cy.get('button').contains('Criar Pedido').click();

    cy.url().should('include', '/pedidos');
    cy.get('.bg-gray-800').should('contain', 'João');
  });

  it('should print a pedido', () => {
    cy.get('.bg-gray-800').first().find('button').contains('Imprimir').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Impressão enviada!');
    });
  });
});

describe('WhatsApp Integration', () => {
  it('should display WhatsApp QR code', () => {
    cy.login();
    cy.visit('/whatsapp');
    cy.get('img[alt="QR Code"]').should('be.visible');
  });
});