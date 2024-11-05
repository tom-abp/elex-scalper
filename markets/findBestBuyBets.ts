import _ from 'lodash';
import { ElectionMarket, electionMarkets } from "../data/electionMarkets";
import { BestBetsForMarket, Bet } from './types';
import { getWinChance } from './lib';

export function findBestBuyBets(market: ElectionMarket, prices: Bet[]): BestBetsForMarket{
  // Can't open polymarket with a sell.
  const availableToBuy = prices.filter(p => p.lookup.location === 'BETFAIR' || p.lookup.side === 'BUY');

  const o1 = availableToBuy.filter(b => b.winsIf === market.options[0]);
  const o2 = availableToBuy.filter(b => b.winsIf === market.options[1]);

  const o1Min = _.minBy(o1, getWinChance);
  const o2Min = _.minBy(o2, getWinChance);

  if(!o1Min || !o2Min) throw new Error('No bets found.')

  const edge = 100 - Math.abs(o1Min.winChance + o2Min.winChance);
  return {
    edge,
    bets: [o1Min, o2Min],
    market: market.name
  };
}

export function findBestBuyBetsForAllMarkets(allMarkets: Bet[][]): Record<string, BestBetsForMarket>{
  return electionMarkets.reduce((obj, m, i) => {
    return{
      ...obj,
      [m.name]: findBestBuyBets(m, allMarkets[i])
    };
  }, {});
}