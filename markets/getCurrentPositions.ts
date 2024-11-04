import { CurrentOrderSummary, ExchangeApi, ListCurrentOrdersRequest } from "@b3t/betfair-ts";
import _ from 'lodash';
import { ClobClient, Trade, Side } from "@polymarket/clob-client";
import { Bet, ExistingBet, PositionSummary } from "./types";
import { USD_GBP } from "../consts";
import { electionMarkets } from "../data/electionMarkets";

export async function getCurrentPositions(betfair: ExchangeApi, polymarket: ClobClient){
  const polyTrades = await polymarket.getTrades();
  const betfairTrades = await getBetfairOrders(betfair);

  const polyBets = _.compact(polyTrades.map(t => polyTradeToExistingBet(t)));
  const betfairBets = _.compact(betfairTrades.map(t => betfairTradeToExistingBet(t)));

  const existingBets = [...polyBets, ...betfairBets];
  const summary = summarisePositions(existingBets);
  
  return summary;
}

export function summarisePositions(bets: ExistingBet[]): PositionSummary[]{
  const mapped = bets.reduce<Record<string, PositionSummary>>((obj, bet) => {
    const current = obj[bet.name] || {
      name: bet.name,
      bets: [],
      profitBySelection: {}
    };

    current.bets.push(bet);

    return{
      ...obj,
      [bet.name]: current
    };
  }, {});

  return _.values(mapped).map(s => {
    s.profitBySelection = calcProfitPositionFromBets(s);
    return s;
  });
}

export function calcProfitPositionFromBets(summary: PositionSummary): PositionSummary['profitBySelection']{
  const market = electionMarkets.find(m => m.name === summary.name);
  if(!market) return {};

  const selections = market.options;
  const initObj = selections.reduce((o, s) => ({...o, [s]: 0}), {});

    return summary.bets.reduce<PositionSummary['profitBySelection']>((obj, bet) => {
      const {availableGBP, price, direction} = bet;
      const selectionResult = direction === 'BACK' ? availableGBP * (price - 1) : availableGBP * -1;
      const otherResult = direction === 'BACK' ? availableGBP * -1 : availableGBP * (price - 1);
      console.log(bet, selectionResult, otherResult);
      
      selections.forEach((selection) => {
        if(selection === bet.selection) obj[selection] += selectionResult;
        else obj[selection] += otherResult;
      });

      return obj;
    }, initObj);
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
  const {name, selection} = findBetfairSelectionAndName(trade.getSelectionId()) || {};
  if(!selection || !name) return null;


  return{
    name,
    price: trade.getAveragePriceMatched() || 0,
    availableGBP: trade.getSizeMatched() || 0,
    direction, 
    selection,
    lookup:{
      location: 'BETFAIR',
      selectionId: trade.getSelectionId(),
      marketId: trade.getMarketId(),
      direction,
      price: trade.getAveragePriceMatched() || 0,
      size: trade.getSizeMatched() || 0,
    },
  }
}

function polyTradeToExistingBet(trade: Trade): ExistingBet | null{
  const direction = trade.side === Side.BUY ? 'BACK' : 'LAY';
  const tokenId = trade.asset_id;
  const {name, selection} = findPolymarketSelectionAndName(tokenId) || {};

  if(!selection || !name) return null;

  console.log(trade.size, USD_GBP);
  return {
    name,
    price: 1 / parseFloat(trade.price),
    availableGBP: (parseFloat(trade.size) * parseFloat(trade.price)) * USD_GBP,
    direction,
    selection,
    lookup:{
      location: 'POLYMARKET',
      tokenId,
      side: trade.side === 'BUY' ? Side.BUY : Side.SELL,
      price: parseFloat(trade.price),
      size: parseFloat(trade.size)
    }
  };
}

type SelectionAndName = {
  name: string;
  selection: string
} | null;


function findPolymarketSelectionAndName(tokenId: string): SelectionAndName{
  return electionMarkets.reduce<SelectionAndName>((val, market) => {
    if(val) return val;

    const selection = _.values(market.marketsByOption).reduce<string | null>((v, o) => {
      if(v) return v;
      const match = o.polymarket.find(s => s.tokenId === tokenId);

      return match ? o.name : null;
    }, null);

    return selection ? {
      selection,
      name: market.name
    } : null;
  }, null);
}

function findBetfairSelectionAndName(selectionId: number){
  return electionMarkets.reduce<SelectionAndName>((val, market) => {
    if(val) return val;

    const selection = _.values(market.marketsByOption).reduce<string | null>((v, o) => {
      if(v) return v;
      const matches = o.betfair.selectionId === selectionId;

      return matches ? o.name : null;
    }, null);

    return selection ? {
      selection,
      name: market.name
    } : null;
  }, null);
}