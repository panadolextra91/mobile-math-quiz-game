# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 1. `ci.yml` - Combined CI Pipeline
Runs on every push and pull request to `main` and `develop` branches.

**Backend Job:**
- Sets up PostgreSQL 16 service
- Installs dependencies
- Generates Prisma client
- Runs database migrations
- Lints code
- Builds TypeScript

**Frontend Job:**
- Installs dependencies
- Lints code
- Type checks TypeScript

### 2. `backend-ci.yml` - Backend CI (Path-based)
Runs only when backend files change.

### 3. `frontend-ci.yml` - Frontend CI (Path-based)
Runs only when frontend files change.

### 4. `backend-cd.yml` - Backend CD
Runs on pushes to `main` branch when backend files change.
- Builds the backend
- Creates deployment package
- Uploads build artifacts
- **Note:** Add your deployment steps (Heroku, AWS, etc.) in this workflow

### 5. `frontend-cd.yml` - Frontend CD
Runs on pushes to `main` branch when frontend files change.
- Type checks
- Builds for iOS and Android using EAS
- **Note:** Requires `EXPO_TOKEN` secret for EAS builds

## Required Secrets

For the workflows to work properly, you may need to set up the following secrets in your GitHub repository:

1. **EXPO_TOKEN** (for frontend CD)
   - Get your Expo access token from: https://expo.dev/accounts/[your-account]/settings/access-tokens
   - Add it in: Repository Settings → Secrets and variables → Actions

2. **Deployment Secrets** (for backend CD)
   - Add secrets for your deployment platform (e.g., `HEROKU_API_KEY`, AWS credentials, etc.)

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the required secrets

## Customization

### Backend Deployment
Edit `.github/workflows/backend-cd.yml` to add your deployment steps. Examples:
- Heroku: Use `akhileshns/heroku-deploy@v3.12.12`
- AWS: Use AWS CLI or specific AWS actions
- Docker: Build and push Docker images

### Frontend Deployment
Edit `.github/workflows/frontend-cd.yml` to:
- Configure EAS build profiles
- Add App Store/Play Store submission steps
- Deploy to web hosting if needed

## Testing Locally

You can test the workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run a workflow
act -j backend
act -j frontend
```

## Workflow Status

Check workflow status:
- In the **Actions** tab of your GitHub repository
- Via the status badge (add to README):
  ```markdown
  ![CI](https://github.com/your-username/your-repo/workflows/CI/badge.svg)
  ```

