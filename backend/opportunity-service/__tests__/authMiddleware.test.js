const axios = require('axios');
const { authenticateToken } = require('../index');

jest.mock('axios');
beforeAll(() => {
    console.log = jest.fn();
  });
  
  afterAll(() => {
    console.log.mockRestore();
  });

describe('authenticateToken Middleware', () => {
  const req = {
    headers: {
      authorization: 'Bearer validToken',
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  it('should proceed when token is valid', async () => {
    axios.get.mockResolvedValue({
      data: { userId: '12345' },
    });

    await authenticateToken(req, res, next);

    expect(req.user).toEqual({ userId: '12345' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is missing', async () => {
    req.headers.authorization = '';
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token is required' });
  });

  it('should return 403 if token is invalid', async () => {
    axios.get.mockRejectedValue(new Error('Invalid token'));
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });
});
