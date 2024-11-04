export const POLYMARKET_PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY || "";
export const POLYMARKET_CLOB_HOST = process.env.POLYMARKET_CLOB_HOST || "";
export const POLYMARKET_CHAIN_ID = process.env[`POLYMARKET_CHAIN_ID_${process.env.MODE}`] || "";
export const POLYMARKET_API_CREDS = process.env.POLYMARKET_API_KEY ? {
  key: process.env.POLYMARKET_API_KEY || "",
  secret: process.env.POLYMARKET_API_SECRET || "",
  passphrase: process.env.POLYMARKET_API_PASSPHRASE || ""
} : undefined;

export const BETFAIR_USERNAME = process.env.BETFAIR_USERNAME || "";
export const BETFAIR_PASSWORD = process.env.BETFAIR_PASSWORD || "";
export const BETFAIR_APP_KEY = process.env[`BETFAIR_APP_KEY_${process.env.MODE}`] || "";
export const BETFAIR_CERT_LOCATION = process.env.BETFAIR_CERT_LOCATION || "";

export const GBP_USD = 1.2964;
export const USD_GBP = 1 / GBP_USD;

export const DEFAULT_BETFAIR_PROFIT_RATE = 0.95;
