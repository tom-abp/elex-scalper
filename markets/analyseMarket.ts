import _ from 'lodash';
import { ElectionMarket, electionMarkets } from "../data/electionMarkets";
import { Analysis, Bet, SizedBet } from './types';
import { Side } from '@polymarket/clob-client';

export async function analyse(market: ElectionMarket, prices: Bet[]): Promise<Analysis>{
  const {buyPrices, sellPrices} = prices.reduce<{buyPrices: Bet[], sellPrices: Bet[]}>((obj, bet) => {
    if(!notPolymarketSell(bet)){
      return {
        ...obj,
        buyPrices: [...obj.buyPrices, bet]
      };
    }

    return{
      sellPrices: [...obj.sellPrices, bet],
      buyPrices: [...obj.buyPrices, bet],
    };
  }, {buyPrices: [], sellPrices: []});

  const buyBets = market.options.map(o => {
    const [bet] = buyPrices.sort(sortByBestPrice(o));
    return bet;
  });

  const sellBets = market.options.map(o => {
    return sellPrices.sort(sortByBestPrice(o));
  });

  if(!buyBets[0] || !buyBets[1]) throw new Error('No buy bets - purquoi?');
  if(!sellBets[0] || !sellBets[1]) throw new Error('No sell bets - purquoi?');

  const b1 = buyBets[0].direction === 'BACK' ? buyBets[0].price : invertLayPrice(buyBets[0].price);
  const b2 = buyBets[1].direction === 'BACK' ? buyBets[1].price : invertLayPrice(buyBets[1].price);
  const edge = 1 - ((1 / b1) + (1 / b2));

  const sizedBets: SizedBet[] = buyBets.map(b => ({
    ...b,
    arbSize: (1 / b.price) / (1 - edge)
  }));

  return {
    edge, sizedBets, name: market.name, sellBets
  }
}

export async function analyseAll(allMarkets: Bet[][]){
  const promises = electionMarkets.map((m, i) => analyse(m, allMarkets[i]));
  return await Promise.all(promises);
}

function notPolymarketSell<T extends string = string>(bet: Bet<T>){
  return !(bet.lookup.location === 'POLYMARKET' && bet.lookup.side === Side.SELL);
}

function sortByBestPrice<T extends string = string>(selection: T){
  return function sortByBestPriceInner(a: Bet<T>, b: Bet<T>){
    return (b.profitIf[selection] - a.profitIf[selection]);
  }
}
