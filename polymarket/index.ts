import { AssetType, Chain, ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import {ethers} from 'ethers';
import { POLYMARKET_API_CREDS, POLYMARKET_CHAIN_ID, POLYMARKET_CLOB_HOST, POLYMARKET_PRIVATE_KEY } from "../consts";

export async function init(){
  const wallet = new ethers.Wallet(POLYMARKET_PRIVATE_KEY);
  const chainId = parseInt(POLYMARKET_CHAIN_ID) as Chain;

  const client = new ClobClient(POLYMARKET_CLOB_HOST, chainId, wallet, POLYMARKET_API_CREDS, SignatureType.POLY_GNOSIS_SAFE, "0x62d52c86A23196996c8fAE67b7706221F43a78D1");

  return client;
}

export async function getActiveMarkets(poly: ClobClient, markets: any[] = [], cursor = ""){
  const {data, next_cursor} = await poly.getMarkets(cursor);
  const nextMarkets = [...markets, ...data];
  if(next_cursor === "LTE=") return nextMarkets;

  return getActiveMarkets(poly, nextMarkets, next_cursor);
}

export async function getCurrentOrders(polymarket: ClobClient){
  return polymarket.getTrades();
}