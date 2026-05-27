export function isSubscriptionActive(privateMetadata: Record<string, unknown>): boolean {
  if (process.env.BYPASS_SUBSCRIPTION === "true") return true;
  return (
    typeof privateMetadata.stripeSubscriptionId === "string" &&
    typeof privateMetadata.stripePlan === "string"
  );
}
