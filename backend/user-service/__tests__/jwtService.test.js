const jwt = require('jsonwebtoken');

describe('JWT Token Generation', () => {
  it('should generate a valid token for a user', () => {
    const userId = 'user-123';
    const secret = 'test-secret';

    const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    expect(decoded.userId).toBe(userId);
  });

  it('should throw an error for an invalid token', () => {
    const invalidToken = 'invalid-token';
    const secret = 'test-secret';

    expect(() => jwt.verify(invalidToken, secret)).toThrow();
  });
});
