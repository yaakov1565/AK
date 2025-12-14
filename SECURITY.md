# Security Features

## Admin Authentication

The admin panel is protected with secure session-based authentication.

### Session Security Features

1. **Encrypted Session Tokens**
   - Sessions are encrypted using AES-256-CBC encryption
   - Each session has a unique initialization vector (IV)
   - Tokens cannot be forged or tampered with

2. **Session Timeout**
   - Sessions automatically expire after **4 hours** of inactivity
   - Expired sessions are automatically cleared
   - Users are redirected to login when session expires

3. **Secure Cookie Settings**
   - `httpOnly: true` - Prevents JavaScript access (XSS protection)
   - `secure: true` - HTTPS only in production
   - `sameSite: 'strict'` - CSRF protection
   - Scoped to admin paths only

4. **Session Status Indicator**
   - Displays remaining session time in the admin panel
   - Warning when less than 15 minutes remain
   - Allows user to refresh session before expiration

### Environment Variables

Required environment variables for authentication:

```env
# Admin password for login
ADMIN_PASSWORD="your-secure-admin-password"

# Secret key for session encryption (must be random and secure)
SESSION_SECRET="your-random-secret-key-for-session-encryption"
```

### Best Practices

1. **Use Strong Passwords**
   - Admin password should be long (16+ characters)
   - Include uppercase, lowercase, numbers, and symbols
   - Never commit passwords to version control

2. **Secure Session Secret**
   - Generate a random 32+ character string
   - Change it periodically
   - Never share or commit to version control

3. **HTTPS in Production**
   - Always use HTTPS in production
   - Session cookies are marked `secure` in production
   - Prevents man-in-the-middle attacks

4. **Regular Security Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Review access logs regularly

### Generating Secure Keys

Generate a secure session secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Code Validation Rate Limiting

The system includes rate limiting to prevent brute force attacks on code validation:

- IP-based tracking of failed attempts
- Automatic lockout after excessive failures
- Configurable thresholds and timeouts

See [`lib/rate-limit.ts`](lib/rate-limit.ts) for implementation details.

## Database Security

- SQLite database is stored locally
- Not directly accessible from the web
- All queries use Prisma ORM (prevents SQL injection)
- Parameterized queries throughout

## Additional Security Measures

1. **Input Validation**
   - All user inputs are validated
   - Code format validation (AK-XXXX-XXXX)
   - Email validation for code generation

2. **Error Handling**
   - Generic error messages to prevent information leakage
   - Detailed errors only in server logs
   - No stack traces exposed to users

3. **CORS Protection**
   - API routes are same-origin only
   - No CORS headers exposed

## Security Checklist for Production

- [ ] Set strong `ADMIN_PASSWORD` in environment
- [ ] Generate and set secure `SESSION_SECRET`
- [ ] Enable HTTPS on hosting platform
- [ ] Set `NODE_ENV=production`
- [ ] Review and update security dependencies
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular database backups
- [ ] Test session timeout behavior
- [ ] Verify rate limiting is working
