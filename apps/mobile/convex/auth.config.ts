// Convex verifies Clerk-issued JWTs using this config. Set CLERK_JWT_ISSUER_DOMAIN
// in the Convex dashboard (Settings → Environment Variables) to your Clerk
// frontend API URL, e.g. https://your-app.clerk.accounts.dev
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
