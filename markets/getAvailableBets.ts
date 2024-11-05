import _ from 'lodash';
import { ElectionMarket, electionMarkets } from "../data/electionMarkets";
import { ClobClient, OrderSummary, Side } from "@polymarket/clob-client";
import { Bet, Direction } from "./types";
import { ExchangeApi, ListMarketBookRequest, PriceSize, Runner } from "@b3t/betfair-ts";
import { USD_GBP } from "../consts";
import { gatherMarketIds, gatherPolymarketSelections } from './lib';

export async function getAvailableBets(betfair: ExchangeApi, poly: ClobClient, market: ElectionMarket): Promise<Bet[]>{
  return [
    ...await getBetfairPrices(betfair, market),
    ...await getPolymarketPrices(poly, market)
  ]
}

export async function getAllAvailableBets(betfair: ExchangeApi, poly: ClobClient){
  const promises = electionMarkets.map(m => getAvailableBets(betfair, poly, m));
  const results = await Promise.all(promises)
  
  return results.reduce<Record<string, Bet[]>>((obj, v, i) => {
    return{
      ...obj,
      [electionMarkets[i].name]: v
    }
  }, {});
}

export async function getBetfairPrices(betfair: ExchangeApi, market: ElectionMarket): Promise<Bet[]>{
  const marketIds = gatherMarketIds(market);
  const books = await getMarketBooks(betfair, marketIds);

  const prices = market.options.flatMap((o, i, a) => {
    const thisRunner = o;
    const otherRunner = a[i === 0 ? 1 : 0];
    const {selectionId} = market.marketsByOption[o].betfair;
    const runner = books.getMarketBooks()?.reduce<Runner | null>((runner, marketBook) => {
      if(runner) return runner;
      return marketBook.getRunners()?.find(runner => {
        return runner.getSelectionId() === selectionId;
      }) || null;
    }, null);

    if(!runner) throw new Error('Cannot find selection');

    return [
      ...runner.getEx()?.getAvailableToBack()?.map(ps => bfToOption(ps, 'BACK', thisRunner, market)) || [],
      ...runner.getEx()?.getAvailableToLay()?.map(ps => bfToOption(ps, 'LAY', otherRunner, market)) || [],
    ];
  });

  return prices;
}

export async function getPolymarketPrices(poly: ClobClient, market: ElectionMarket): Promise<Bet[]>{
  const orderBooks = await getOrderBooks(poly, market);

  const prices = orderBooks.flatMap((o, i, a) => {
    const thisRunner = o.name;
    const otherRunner = a[i === 0 ? 1 : 0].name;

    return [
      ...o.orderBook.asks.map(ps => polyToOption(ps, Side.BUY, thisRunner, market.name, o.tokenId)),
      ...o.orderBook.bids.map(ps => polyToOption(ps, Side.SELL, otherRunner, market.name, o.tokenId))
    ];
  });

  return prices;
}


async function getOrderBooks(poly: ClobClient, market: ElectionMarket){
  const selections = gatherPolymarketSelections(market);
  const results = await poly.getOrderBooks(selections.map(s => {
    return{
      token_id: s.tokenId,
      side: Side.BUY
    };
  }));

  return _.compact(results.map((r) => {
    const selection = selections.find(s => s.tokenId === r.asset_id);
    if(!selection) return null;
    return{
      ...selection,
      orderBook: r
    };
  }));
}

async function getMarketBooks(betfair: ExchangeApi, marketIds: string[]){
  const params = new ListMarketBookRequest({
      marketIds,
      priceProjection:{
        priceData: ["EX_BEST_OFFERS"],
        exBestOffersOverrides: {
          bestPricesDepth: 5
        }
      }
  });

  return await betfair.listMarketBook(params);
}

function polyToOption<T extends string = string>(b: OrderSummary, side: Side, winsIf: T, market: string, tokenId: string): Bet{
  const quotePrice = parseFloat(b.price) * 100;
  const winChance = side === 'BUY' ? quotePrice : 100 - quotePrice;

  return{
    market,
    winChance,
    availableGBP: parseFloat(b.size) * USD_GBP,
    winsIf, 
    lookup:{
      location: 'POLYMARKET',
      tokenId,
      side,
      price: quotePrice,
      size: parseInt(b.size)
    },
  }
}


function bfToOption<T extends string = string>(b: PriceSize, direction: Direction, winsIf: T, market: ElectionMarket): Bet<T>{
  const quotePrice = b.getPrice();
  const decimalPrice = 100 / quotePrice;
  const winChance = direction === 'BACK' ? decimalPrice : 100 - decimalPrice;
  const size = b.getSize();
  const runners = market.options;
  const lookupKey = direction === 'BACK' ? winsIf : runners.find(r => r !== winsIf);

  if(!lookupKey) throw new Error('No Lookup Key');
  const {marketId, selectionId} = market.marketsByOption[lookupKey].betfair;


  return{
    market: market.name,
    winChance,
    availableGBP: b.getSize(),
    winsIf,
    lookup:{
      location: 'BETFAIR',
      selectionId,
      marketId,
      direction,
      price: quotePrice,
      size
    },
  };
}
