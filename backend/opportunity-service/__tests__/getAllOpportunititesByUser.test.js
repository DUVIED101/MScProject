const request = require('supertest');
const app = require('../index'); 
beforeAll(() => {
    console.log = jest.fn();
  });
  
  afterAll(() => {
    console.log.mockRestore();
  });
jest.mock('@google-cloud/spanner');

describe('GET /api/opportunities', () => {
  it('should return all opportunities posted by a user', async () => {
    const res = await request(app)
      .get('/api/opportunities')
      .set('Authorization', 'Bearer validToken');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should return 500 if fetching opportunities fails', async () => {
    const res = await request(app)
      .get('/api/opportunities')
      .set('Authorization', 'Bearer invalidToken');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Failed to fetch opportunities' });
  });
});
