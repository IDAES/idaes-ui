describe('flowsheet visualizer spec', () => {
  it('successfully loads', () => {
    cy.visit('/app?id=sample_visualization');
  });
  it('has jointjs diagram', () => {
    cy.visit('/app?id=sample_visualization');
    cy.get('#idaes-canvas div.joint-paper svg');
  });
})