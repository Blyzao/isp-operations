# Local Email Configuration Setup Guide

This guide explains how to configure email sending for local development with Firebase Functions.

## Current Email Configuration

### Production Configuration
The production environment uses Firebase Functions configuration:
```bash
firebase functions:config:get
```
Returns:
```json
{
  "email": {
    "support": "support@nexion.com",
    "pass": "cipk uggq lruq xxqm",
    "service": "gmail", 
    "user": "siisps2022@gmail.com"
  },
  "frontend": {
    "url": "http://localhost:5173"
  }
}
```

### Local Development Configuration

#### Problem
Firebase Functions configuration (`functions.config()`) returns an empty object `{}` when running locally with the emulator. This prevents email sending from working in the local environment.

#### Solution
Create a `.env.local` file in the `functions/` directory with the following environment variables:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=siisps2022@gmail.com
EMAIL_PASS=cipk uggq lruq xxqm
EMAIL_SUPPORT=support@nexion.com
FRONTEND_URL=http://localhost:5173
```

## File Structure

```
functions/
├── api/
│   ├── auth.js              # User authentication email handlers
│   ├── password.js          # Password reset email handlers
│   └── utils/
│       ├── emailConfig.js   # Email transporter configuration
│       └── emailTemplate.js # Email template generator
├── index.js                 # Main Firebase Functions (legacy)
├── test-email.js           # Email configuration test script
├── .env.local              # Local environment variables
└── package.json
```

## Email Functions

### Available Email Functions

1. **Account Activation Email** (`sendActivationEmail`)
   - Triggered on new user creation
   - Sends email verification link
   - Template: activation

2. **Password Reset Email** (`sendPasswordResetEmail`)
   - Triggered by Firestore document creation in `passwordResetRequests`
   - Sends password reset link
   - Template: reset

3. **Email Verification** (`sendEmailVerification`)
   - Triggered by Firestore document creation in `emailVerificationRequests`
   - Sends email verification link
   - Template: activation

4. **Password Change Confirmation** (`sendPasswordChangeConfirmation`)
   - Triggered by Firestore document creation in `passwordChanges`
   - Sends confirmation email
   - Template: confirmation

### Email Configuration Issues

#### Issue 1: Configuration Method Mismatch
- **Problem**: The main `index.js` uses `functions.config()` which doesn't work locally
- **Solution**: Updated API files use `process.env` to read environment variables

#### Issue 2: Missing Environment Variables
- **Problem**: Local emulator doesn't have access to production configuration
- **Solution**: Create `.env.local` file with required variables

#### Issue 3: Import Path Issues
- **Problem**: The API files try to import from `./utils/` but the path may be incorrect
- **Solution**: Ensure correct relative paths for imports

## Testing Email Configuration

### Run Email Test
```bash
cd functions
node test-email.js
```

Expected output:
```
✅ SMTP connection successful!
✅ Test email sent successfully!
Message ID: <...>
```

### Start Local Emulator
```bash
cd functions
npm run serve
# or
firebase emulators:start --only functions
```

### Test Configuration Endpoint
```bash
curl http://localhost:5001/isp-operations/us-central1/testConfig
```

## Gmail Configuration

### App Password Setup
The current configuration uses Gmail with an app password:
- **Service**: Gmail
- **Username**: siisps2022@gmail.com
- **App Password**: cipk uggq lruq xxqm

### Security Notes
- The app password is stored in plain text in configuration
- Consider using environment variables for production
- The password should be rotated regularly

## Common Issues and Solutions

### 1. "functions.config() returns empty object"
**Solution**: Use environment variables instead of `functions.config()` for local development.

### 2. "nodemailer.createTransporter is not a function"
**Solution**: Use `nodemailer.createTransport()` (without 'r' at the end).

### 3. "Email not sending in localhost"
**Solutions**:
- Ensure `.env.local` file exists with correct variables
- Verify Gmail app password is correct
- Check that the email service is not blocked by firewall
- Test with the provided `test-email.js` script

### 4. "Module not found: ./utils/emailConfig"
**Solution**: Ensure the file structure matches the import paths in the code.

## Environment Variables Required

### For Local Development (.env.local)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=siisps2022@gmail.com
EMAIL_PASS=cipk uggq lruq xxqm
EMAIL_SUPPORT=support@nexion.com
FRONTEND_URL=http://localhost:5173
```

### For Production (Firebase Functions Config)
```bash
firebase functions:config:set email.service="gmail"
firebase functions:config:set email.user="siisps2022@gmail.com"
firebase functions:config:set email.pass="cipk uggq lruq xxqm"
firebase functions:config:set email.support="support@nexion.com"
firebase functions:config:set frontend.url="http://localhost:5173"
```

## Development Workflow

1. **Setup Local Environment**:
   ```bash
   cd functions
   echo "EMAIL_SERVICE=gmail" > .env.local
   echo "EMAIL_USER=siisps2022@gmail.com" >> .env.local
   echo "EMAIL_PASS=cipk uggq lruq xxqm" >> .env.local
   echo "EMAIL_SUPPORT=support@nexion.com" >> .env.local
   echo "FRONTEND_URL=http://localhost:5173" >> .env.local
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Test Email Configuration**:
   ```bash
   node test-email.js
   ```

4. **Start Development Server**:
   ```bash
   npm run serve
   ```

5. **Test Functions**:
   - Create test documents in Firestore collections
   - Monitor function logs for email sending confirmation
   - Check inbox for received emails

## Security Considerations

- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use environment variables in production
- Rotate app passwords regularly
- Monitor email usage for abuse

## Additional Notes

- The current email template uses a modern design with Nexion branding
- Email templates are responsive and work on mobile devices
- All emails include security notices and support contact information
- The system supports multiple email types with different templates