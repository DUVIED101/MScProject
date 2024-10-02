const bcrypt = require('bcrypt');

describe('Password Hashing', () => {
  it('should hash a password correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    expect(hashedPassword).not.toBe(password);
    const isValid = await bcrypt.compare(password, hashedPassword);
    expect(isValid).toBe(true);
  });
});
