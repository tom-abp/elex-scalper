import _ from 'lodash';
import { ElectionMarket, electionMarkets } from "../data/electionMarkets";
import { ClobClient, OrderSummary, Side } from "@polymarket/clob-client";
import { Bet, Direction Polarity } from "./types";
import { ExchangeApi, ListMarketBookRequest, PriceSize, Runner } from "@b3t/betfair-ts";
import { DEFAULT_BETFAIR_PROFIT_RATE, USD_GBP } from "../consts";

export async function getAvailableBets(betfair: ExchangeApi, poly: ClobClient, market: ElectionMarket){
  return [
    ...await getBetfairPrices(betfair, market),
    ...await getPolymarketPrices(poly, market)
  ]
}

export async function getAllAvailableBets(betfair: ExchangeApi, poly: ClobClient){
  const promises = electionMarkets.map(m => getAvailableBets(betfair, poly, m));
  return Promise.all(promises)
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
      ...o.orderBook.asks.map(ps => polyToOption(ps, Side.BUY, thisRunner, market, o.tokenId)),
      ...o.orderBook.bids.map(ps => polyToOption(ps, Side.SELL, otherRunner, market, o.tokenId))
    ];
  });

  return prices;
}

function gatherMarketIds(market: ElectionMarket){
  return _.uniq(_.valuesIn(market.marketsByOption).flatMap(v => v.betfair.marketId));
}

function gatherPolymarketSelections(market: ElectionMarket){
  return _.valuesIn(market.marketsByOption).flatMap(v => v.polymarket.map(p => ({
    name: v.name,
    ...p,
  })));
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

function polyToOption<T extends string = string>(b: OrderSummary, side: Side, selection: T, market: ElectionMarket, tokenId: string): Bet{
  const price = 1 / parseFloat(b.price);
  const liability = price - 1;
  const direction = side === Side.BUY ? 'BACK' : 'LAY';
  const layRatio = 1 / liability;
  const profitOnSelection = direction === 'BACK' ? liability : layRatio * -1;
  const profitOnRest = direction === 'BACK' ? -1 : layRatio;  
  const comparisonPrice = direction === 'BACK' ? price : 1 / price;

  return{
    price: comparisonPrice,
    availableGBP: parseFloat(b.size) * USD_GBP,
    selection,
    lookup:{
      location: 'POLYMARKET',
      tokenId,
      side,
      price: parseInt(b.price),
      size: parseInt(b.size)
    },
    profitIf: _.keysIn(market.marketsByOption).reduce<Bet['profitIf']>((obj, outcome) => {
      const profit = outcome === selection ? profitOnSelection : profitOnRest;
      return{
        ...obj,
        [outcome]: profit > 0 ? profit * DEFAULT_BETFAIR_PROFIT_RATE : profit
      };
    }, {})
  }
}


function bfToOption<T extends string = string>(b: PriceSize, direction: Direction, selection: T, market: ElectionMarket): Bet<T>{
  const price = b.getPrice();
  const comparisonPrice = direction === 'BACK' ? price : (1 / (1 - (1 / price)));
  const size = b.getSize();
  const liability = price - 1;
  const layRatio = 1 / liability;
  const profitOnSelection = direction === 'BACK' ? liability : layRatio * -1;
  const profitOnRest = direction === 'BACK' ? -1 : layRatio;  
  const {marketId, selectionId} = market.marketsByOption[selection].betfair;


  return{
    price,
    availableGBP: b.getSize(),
    direction,
    selection,
    lookup:{
      location: 'BETFAIR',
      selectionId,
      marketId,
      direction,
      price,
      size
    },
    profitIf: _.keysIn(market.marketsByOption).reduce<Bet['profitIf']>((obj, outcome) => {
      const profit = outcome === selection ? profitOnSelection : profitOnRest;
      return{
        ...obj,
        [outcome]: profit > 0 ? profit * DEFAULT_BETFAIR_PROFIT_RATE : profit
      };
    }, {})
  };
}
