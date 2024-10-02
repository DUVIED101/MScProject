const request = require('supertest');
const app = require('../index');

beforeAll(() => {
    console.log = jest.fn();
  });
  
  afterAll(() => {
    console.log.mockRestore();
  });
jest.mock('uuid');
const { Spanner } = require('@google-cloud/spanner');
const { Storage } = require('@google-cloud/storage');

jest.mock('@google-cloud/spanner', () => {
  return {
    Spanner: jest.fn().mockImplementation(() => {
      return {
        instance: jest.fn().mockReturnValue({
          database: jest.fn().mockReturnValue({
            runTransactionAsync: jest.fn().mockResolvedValue([
              {
                runUpdate: jest.fn().mockResolvedValue(1),
                commit: jest.fn().mockResolvedValue(),
              },
            ]),
          }),
        }),
      };
    }),
  };
});


jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => {
      return {
        bucket: jest.fn().mockReturnValue({
          file: jest.fn().mockReturnValue({
            createWriteStream: jest.fn().mockReturnValue({
              on: jest.fn(),
              end: jest.fn(),
            }),
          }),
        }),
      };
    }),
  };
});



describe('DELETE /api/opportunities/:id', () => {
  it('should delete an opportunity', async () => {
    const opportunityID = 'test-opportunity-id';

    const res = await request(app)
      .delete(`/api/opportunities/${opportunityID}`)
      .set('Authorization', 'Bearer validToken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Opportunity deleted successfully!' });
  });

  it('should return 500 if deletion fails', async () => {
    const opportunityID = 'invalid-opportunity-id';

    const res = await request(app)
      .delete(`/api/opportunities/${opportunityID}`)
      .set('Authorization', 'Bearer invalidToken');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete opportunity' });
  });
});
