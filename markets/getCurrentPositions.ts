import { CurrentOrderSummary, ExchangeApi, ListCurrentOrdersRequest } from "@b3t/betfair-ts";
import _ from 'lodash';
import { ClobClient, Trade, Side } from "@polymarket/clob-client";
import { AllPositions, Bet, ExistingBet, Exposure, TotalisedPosition } from "./types";
import { USD_GBP } from "../consts";
import { ElectionMarket, electionMarkets } from "../data/electionMarkets";
import { percentToDecimal } from "./lib";
import { findBestSellBets } from "./findBestSellBets";

export async function getCurrentPositions(betfair: ExchangeApi, polymarket: ClobClient): Promise<AllPositions>{
  const polyTrades = await polymarket.getTrades();
  const betfairTrades = await getBetfairOrders(betfair);

  const polyBets = _.compact(polyTrades.map(t => polyTradeToExistingBet(t)));
  const betfairBets = _.compact(betfairTrades.map(t => betfairTradeToExistingBet(t)));

  const allBets = [...polyBets, ...betfairBets];
  const byMarket = _.groupBy(allBets, bet => bet.market);

  return _.mapValues(byMarket, bets => {
    if(!bets.length) throw new Error('Whaaaat?');

    const market = electionMarkets.find(m => m.name === bets[0].market);
    if(!market) throw new Error('No market');

    const positionSummary = totalisePositions(allBets, market);
    const exposure = findExposure(positionSummary, market);

    return{
      market: market.name,
      bets,
      positionSummary,
      edgeInPosition: 100 - (positionSummary[0].avgWinChance + positionSummary[1].avgWinChance),
      exposure,
    };
  });
}

export function findExposure([s1, s2]: [TotalisedPosition, TotalisedPosition], market: ElectionMarket): Exposure{
  const [o1, o2] = market.options;
  const [p1, p2] = [percentToDecimal(s1.avgWinChance) - 1, percentToDecimal(s2.avgWinChance) - 1];

  const e1 = (s2.sizeGBP * -1) + (p1 * s1.sizeGBP);
  const e2 = (s1.sizeGBP * -1) + (p2 * s2.sizeGBP);

  return{
    [o1]: Number.isNaN(e1) ? 0 : e1,
    [o2]: Number.isNaN(e2) ? 0 : e2
  };
}

export function totalisePositions(bets: ExistingBet[], market: ElectionMarket): [TotalisedPosition, TotalisedPosition]{
  const [w1, w2] = market.options;
  const DEFAULT_OBJ = {
    [w1]:{
      totalSize: 0,
      winChanceProduct: 0,
    },
    [w2]:{
      totalSize: 0,
      winChanceProduct: 0,
    }
  };

  const summary = bets.reduce<typeof DEFAULT_OBJ>((obj, bet) => {
    obj[bet.winsIf].totalSize += bet.sizeGBP;
    obj[bet.winsIf].winChanceProduct += (bet.sizeGBP * bet.winChance);

    return obj;
  }, DEFAULT_OBJ);

  return[
    {
      market: market.name,
      winsIf: w1,
      sizeGBP: summary[w1].totalSize,
      avgWinChance: summary[w1].winChanceProduct / summary[w1].totalSize
    },
    {
      market: market.name,
      winsIf: w2,
      sizeGBP: summary[w2].totalSize,
      avgWinChance: summary[w2].winChanceProduct / summary[w2].totalSize
    },
  ];
}


export async function getBetfairOrders(betfair: ExchangeApi, existing: CurrentOrderSummary[] = []){
  const params = new ListCurrentOrdersRequest({
    fromRecord: existing.length
  });

  const orders = await betfair.listCurrentOrders(params);
  const currentOrders = orders.getCurrentOrders() || [];
  const nextValue = [...existing, ...currentOrders];
  if(!orders.getMoreAvailable()) return nextValue;
  
  return getBetfairOrders(betfair, nextValue);
}

function betfairTradeToExistingBet(trade: CurrentOrderSummary): ExistingBet | null{
  const direction = trade.getSide().getValue() === 'BACK' ? 'BACK' : 'LAY';
  const {market, selection} = findBetfairSelectionAndMarket(trade.getSelectionId()) || {};
  const electionMarket = electionMarkets.find(m => m.name === market);
  const winsIf = selection === 'BACK' ? selection : electionMarket?.options.find(v => v !== selection);
  const price = trade.getAveragePriceMatched();

  if(!selection || !market || !price || !electionMarket || !winsIf) return null;

  const pricePercent = 100 / price;
  const winChance = direction === 'BACK' ? pricePercent : 100 - pricePercent;

  return{
    market,
    winChance,
    sizeGBP: trade.getSizeMatched() || 0, 
    winsIf,
    lookup:{
      location: 'BETFAIR',
      selectionId: trade.getSelectionId(),
      marketId: trade.getMarketId(),
      direction,
      price: price,
      size: trade.getSizeMatched() || 0,
    },
  }
}

function polyTradeToExistingBet(trade: Trade): ExistingBet | null{
  const tokenId = trade.asset_id;
  const {market, selection} = findPolymarketSelectionAndMarket(tokenId) || {};
  const electionMarket = electionMarkets.find(m => m.name === market);
  const winsIf = selection === 'BACK' ? selection : electionMarket?.options.find(v => v !== selection);

  if(!selection || !market || !electionMarket || !winsIf) return null;

  const quotePrice = parseFloat(trade.price);
  const pricePercent = 100 * quotePrice;
  const winChance = trade.side === Side.BUY ? pricePercent : 100 - pricePercent;

  return {
    market,
    winChance,
    sizeGBP: parseFloat(trade.size) * quotePrice * USD_GBP,
    winsIf,
    lookup:{
      location: 'POLYMARKET',
      tokenId,
      side: trade.side === 'BUY' ? Side.BUY : Side.SELL,
      price: parseFloat(trade.price),
      size: parseFloat(trade.size)
    }
  };
}

type SelectionAndMarket = {
  selection: string;
  market: string
} | null;


function findPolymarketSelectionAndMarket(tokenId: string): SelectionAndMarket{
  return electionMarkets.reduce<SelectionAndMarket>((val, market) => {
    if(val) return val;

    const selection = _.values(market.marketsByOption).reduce<string | null>((v, o) => {
      if(v) return v;
      const match = o.polymarket.find(s => s.tokenId === tokenId);

      return match ? o.name : null;
    }, null);

    return selection ? {
      selection,
      market: market.name
    } : null;
  }, null);
}

function findBetfairSelectionAndMarket(selectionId: number){
  return electionMarkets.reduce<SelectionAndMarket>((val, market) => {
    if(val) return val;

    const selection = _.values(market.marketsByOption).reduce<string | null>((v, o) => {
      if(v) return v;
      const matches = o.betfair.selectionId === selectionId;

      return matches ? o.name : null;
    }, null);

    return selection ? {
      selection,
      market: market.name
    } : null;
  }, null);
}