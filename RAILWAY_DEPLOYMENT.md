# Railway Deployment Guide

This guide will help you deploy the AI-Powered Fitness App to Railway platform.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account
- OpenAI API key
- Repository pushed to GitHub

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select the `FitnessAPP` repository

### 3. Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL database
4. Copy the `DATABASE_URL` connection string (you'll need this later)

### 4. Deploy Backend Service

1. In Railway project, click "New" → "GitHub Repo"
2. Select your repository again
3. Configure the service:
   - **Service Name**: `fitness-backend`
   - **Root Directory**: `/backend`
   - **Build Command**: Leave empty (Railway auto-detects)
   - **Start Command**: `npm start`

4. Add environment variables (click on service → Variables):
   ```
   DATABASE_URL=<paste-from-postgresql-service>
   JWT_SECRET=<generate-strong-random-secret>
   OPENAI_API_KEY=<your-openai-api-key>
   OPENAI_MODEL=gpt-3.5-turbo
   ADMIN_PASSWORD=<choose-strong-password>
   FRONTEND_URL=<will-add-after-frontend-deployed>
   NODE_ENV=production
   PORT=5000
   ```

5. Click "Deploy"
6. Once deployed, copy the service URL (e.g., `https://fitness-backend-production.up.railway.app`)

### 5. Initialize Database

After backend is deployed:

1. Click on the backend service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"
5. In another tab, go to Settings → Connect
6. Use the Railway CLI to run database initialization:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run database initialization
railway run --service fitness-backend npm run init-db
```

Alternatively, you can use the Railway web terminal or run it locally with production DATABASE_URL.

### 6. Deploy Frontend Service

1. In Railway project, click "New" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Service Name**: `fitness-frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add environment variables:
   ```
   VITE_API_URL=<backend-service-url>/api
   ```
   Example: `VITE_API_URL=https://fitness-backend-production.up.railway.app/api`

5. Click "Deploy"
6. Once deployed, copy the frontend service URL

### 7. Update Backend CORS Configuration

1. Go back to backend service
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=<frontend-service-url>
   ```
   Example: `FRONTEND_URL=https://fitness-frontend-production.up.railway.app`

3. Redeploy the backend service (it will automatically redeploy when you update variables)

### 8. Configure Custom Domains (Optional)

#### Backend Domain
1. Click on backend service → Settings → Networking
2. Click "Generate Domain" or "Add Custom Domain"
3. If using custom domain, add CNAME record in your DNS:
   - Type: CNAME
   - Name: api (or your subdomain)
   - Value: <provided-by-railway>

#### Frontend Domain
1. Click on frontend service → Settings → Networking
2. Click "Generate Domain" or "Add Custom Domain"
3. If using custom domain, add CNAME record in your DNS:
   - Type: CNAME
   - Name: @ or www
   - Value: <provided-by-railway>

4. Update environment variables with new domains

### 9. Verify Deployment

1. Visit your frontend URL
2. Try creating an account
3. Complete the intake form
4. Generate a workout plan
5. Test PDF download
6. Verify admin login works

## Environment Variables Reference

### Backend Required Variables
```env
DATABASE_URL=          # From PostgreSQL service
JWT_SECRET=           # Strong random string (min 32 characters)
OPENAI_API_KEY=       # Your OpenAI API key
ADMIN_PASSWORD=       # Strong password for admin account
FRONTEND_URL=         # Frontend service URL (for CORS)
NODE_ENV=production
PORT=5000
```

### Backend Optional Variables
```env
OPENAI_MODEL=gpt-3.5-turbo  # Or gpt-4 if you have access
```

### Frontend Required Variables
```env
VITE_API_URL=  # Backend service URL + /api
```

## Post-Deployment Tasks

### 1. Test All Features
- User signup and login
- Workout generation
- PDF download
- Goals management
- Profile updates

### 2. Monitor Logs
- Check Railway dashboard for any errors
- Monitor OpenAI API usage
- Watch for rate limiting triggers

### 3. Set Up Alerts (Optional)
- Configure Railway to send alerts on deployment failures
- Set up error monitoring (e.g., Sentry)

### 4. Backup Database
Railway provides automatic backups, but you can also:
```bash
# Export database
railway run --service postgres pg_dump > backup.sql
```

## Scaling Considerations

### Database
- Railway offers database scaling options
- Consider upgrading if you expect high traffic
- Monitor connection pool usage

### Backend
- Railway auto-scales based on traffic
- Monitor response times
- Consider caching for frequently accessed data

### Frontend
- Static files are served efficiently
- Consider CDN for assets if needed
- Railway handles caching automatically

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure network policies allow connection

### CORS Errors
- Verify FRONTEND_URL matches exactly (no trailing slash)
- Check frontend is using correct VITE_API_URL
- Look for typos in URLs

### OpenAI API Errors
- Verify API key is valid
- Check you have credits available
- Monitor rate limits

### Build Failures
- Check build logs in Railway dashboard
- Verify all dependencies are in package.json
- Ensure Node version compatibility (18+)

### Cannot Access Admin Account
- Verify ADMIN_PASSWORD is set
- Run init-db again if needed
- Check database for admin user existence

## Cost Estimation

Railway pricing (as of 2024):
- **Free Tier**: $5 credit/month
  - Good for development/testing
  - Limited resources

- **Pro Tier**: $20/month + usage
  - Better for production
  - Unlimited projects
  - Priority support

Estimated monthly cost for this app:
- Database: ~$5-10
- Backend: ~$5-10
- Frontend: ~$5
- Total: ~$15-25/month

OpenAI API costs:
- GPT-3.5-turbo: ~$0.002 per workout generation
- GPT-4: ~$0.06 per workout generation

## Maintenance

### Regular Tasks
1. Monitor error logs weekly
2. Check OpenAI usage monthly
3. Update dependencies quarterly
4. Review rate limiting logs
5. Backup database monthly

### Updates
To deploy updates:
1. Push changes to GitHub
2. Railway auto-deploys from main branch
3. Monitor deployment logs
4. Verify changes in production

### Rolling Back
If issues occur:
1. Go to Railway dashboard
2. Click on service → Deployments
3. Click "Rollback" on previous working deployment

## Security Checklist

- [ ] Strong JWT_SECRET set (32+ random characters)
- [ ] Strong ADMIN_PASSWORD set
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Railway)
- [ ] Environment variables secured
- [ ] Database credentials not exposed
- [ ] Rate limiting active
- [ ] OpenAI API key secured

## Support

For Railway-specific issues:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app

For app-specific issues:
- GitHub Issues: https://github.com/JonSvitna/FitnessAPP/issues
