const request = require('supertest');
const app = require('../index');
const { v4: uuidv4 } = require('uuid');
beforeAll(() => {
    console.log = jest.fn();
  });
  
  afterAll(() => {
    console.log.mockRestore();
  });
jest.mock('uuid');
jest.mock('@google-cloud/spanner');

describe('POST /api/opportunities', () => {
  it('should create a new opportunity', async () => {
    uuidv4.mockReturnValue('test-opportunity-id');

    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', 'Bearer validToken')
      .send({
        title: 'New Opportunity',
        description: 'Opportunity Description',
        location: 'Location',
        deadline: '2024-10-30',
        educationLevel: 'Bachelor',
        subjectFilters: 'Engineering',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Opportunity posted successfully!',
      opportunityID: 'test-opportunity-id',
    });
  });

  it('should return 400 if title or description or deadline is missing', async () => {
    const res = await request(app)
      .post('/api/opportunities')
      .set('Authorization', 'Bearer validToken')
      .send({
        description: 'Opportunity Description',
        deadline: '2024-10-30',
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Title, description, and deadline are required' });
  });
});
