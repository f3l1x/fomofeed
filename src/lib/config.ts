export const config = {
  domain: process.env.FOMOFEED_DOMAIN ?? "fomofeed.f3l1x.app",
  port: parseInt(process.env.FOMOFEED_PORT ?? "3000", 10),
};

export function baseUrl(): string {
  return `https://${config.domain}`;
}
