# Production Deployment Policy

This repository enforces a production deployment process that keeps production releases tied to a dedicated production branch.

## Policy

- Only merge code into your designated production Git branch for production releases.
- Do not deploy production from feature branches, forks, or local CLI/API pushes.
- Use Netlify CLI, Netlify API, MCP, or local deploy tools only for preview deploys, branch deploys, or non-production testing.
- In your hosting provider, configure the production deployment branch explicitly (for example, `production`).
- Use branch deploys or deploy previews for development, staging, or QA.

## Process

1. Create or update your production branch name in the provider settings.
2. Push production-ready changes only to that branch.
3. Use the production deploy workflow in `.github/workflows/production-deploy-policy.yml` as the canonical release gate.
4. Keep all sensitive environment variables configured in the production host provider, not in source control.

## Notes

- If your actual production branch is not named `production`, update `PRODUCTION_DEPLOY_BRANCH` in the workflow file.
- This policy is intentionally strict to prevent accidental production deploys from non-production branches.
