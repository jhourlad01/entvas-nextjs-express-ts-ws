const { app, server } = require('../server');

describe('Server', () => {
  afterAll((done) => {
    server.close(done);
  });

  test('should be defined', () => {
    expect(app).toBeDefined();
  });
}); 