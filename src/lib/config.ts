const domain = process.env.FOMOFEED_DOMAIN ?? "fomofeed.f3l1x.app";

export function baseUrl(): string {
  return `https://${domain}`;
}
