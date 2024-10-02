const request = require('supertest');
const app = require('../index'); // Import your Express app
const { Spanner } = require('@google-cloud/spanner');

// Mock Spanner and database interactions
jest.mock('@google-cloud/spanner', () => {
  return {
    Spanner: jest.fn().mockImplementation(() => {
      return {
        instance: jest.fn().mockReturnValue({
          database: jest.fn().mockReturnValue({
            run: jest.fn(),
          }),
        }),
      };
    }),
  };
});

describe('Search Service API Tests', () => {

  // Test: Get all opportunities
  it('should return all opportunities', async () => {
    const mockOpportunities = [
      { OpportunityID: '1', Title: 'Software Developer', Description: 'A great job', Deadline: '2024-12-01' },
      { OpportunityID: '2', Title: 'Data Scientist', Description: 'Analyze data', Deadline: '2024-11-01' },
    ];

    Spanner.mock.instances[0].instance.mockReturnValue({
      database: () => ({
        run: jest.fn().mockResolvedValue([mockOpportunities.map(row => ({
          toJSON: () => row
        }))]),
      }),
    });

    const response = await request(app).get('/api/opportunities');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].Title).toBe('Software Developer');
    expect(response.body[1].Title).toBe('Data Scientist');
  });

  // Test: Search with filters
  it('should return opportunities filtered by title', async () => {
    const mockOpportunities = [
      { OpportunityID: '1', Title: 'Software Developer', Description: 'A great job', Deadline: '2024-12-01' },
    ];

    Spanner.mock.instances[0].instance.mockReturnValue({
      database: () => ({
        run: jest.fn().mockResolvedValue([mockOpportunities.map(row => ({
          toJSON: () => row
        }))]),
      }),
    });

    const response = await request(app).get('/api/opportunities/search').query({ title: 'developer' });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].Title).toBe('Software Developer');
  });

  // Test: Return 404 if no opportunities match the search filters
  it('should return 404 when no matching opportunities are found', async () => {
    Spanner.mock.instances[0].instance.mockReturnValue({
      database: () => ({
        run: jest.fn().mockResolvedValue([[]]),
      }),
    });

    const response = await request(app).get('/api/opportunities/search').query({ title: 'non-existent' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No matching opportunities found');
  });

  // Test: Get opportunity details by ID
  it('should return opportunity details for a specific ID', async () => {
    const mockOpportunity = {
      OpportunityID: '1',
      Title: 'Software Developer',
      Description: 'A great job',
      Location: 'Remote',
      Deadline: '2024-12-01',
      EducationLevel: 'Bachelor',
      SubjectFilters: ['Computer Science', 'Software Engineering'],
    };

    Spanner.mock.instances[0].instance.mockReturnValue({
      database: () => ({
        run: jest.fn().mockResolvedValue([[{
          toJSON: () => mockOpportunity,
        }]]),
      }),
    });

    const response = await request(app).get('/api/opportunities/1');
    expect(response.status).toBe(200);
    expect(response.body.Title).toBe('Software Developer');
    expect(response.body.Location).toBe('Remote');
  });

  // Test: Return 404 for a non-existent opportunity ID
  it('should return 404 for non-existent opportunity ID', async () => {
    Spanner.mock.instances[0].instance.mockReturnValue({
      database: () => ({
        run: jest.fn().mockResolvedValue([[]]),
      }),
    });

    const response = await request(app).get('/api/opportunities/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Opportunity not found');
  });
});
