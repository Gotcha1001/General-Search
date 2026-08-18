// convex/auth.config.ts
const authConfig = {
  providers: [
    {
      domain: "https://free-ibex-4256.clerk.accounts.dev",
      applicationID: "convex", // ← must be "convex", not a dynamic env var
    },
  ],
};

export default authConfig;
