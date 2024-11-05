import _ from 'lodash';
import { ElectionMarket } from '../data/electionMarkets';
import { Bet } from './types';

export function decimalToPercent(dec: number){
  return 1 + (1 / dec);
}

export function percentToDecimal(percent: number){
  return 100 / percent;
}

export function invertLayPrice(layPrice: number){
  return 1 / (1 - (1 / layPrice));
}

export function invertBackPrice(backPrice: number){
  return backPrice / (backPrice - 1);
}

export function gatherMarketIds(market: ElectionMarket){
  return _.uniq(_.valuesIn(market.marketsByOption).flatMap(v => v.betfair.marketId));
}

export function gatherPolymarketSelections(market: ElectionMarket){
  return _.valuesIn(market.marketsByOption).flatMap(v => v.polymarket.map(p => ({
    name: v.name,
    ...p,
  })));
}

export function sortBetsByWinChance(bets: Bet[]){
  return _.sortBy(bets, bet => bet.winChance);
}

export function getWinChance(bet: Bet){
  return bet.winChance;
}