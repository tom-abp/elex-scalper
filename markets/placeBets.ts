import _ from 'lodash';
import { BestBetsForMarket, Bet } from "./types";
import { ExchangeApi, PlaceOrdersRequest } from '@b3t/betfair-ts';
import { ClobClient, Side, UserOrder } from '@polymarket/clob-client';
import { invertLayPrice } from './lib';

export async function placeBets(bestBets: BestBetsForMarket, size: number, betfair: ExchangeApi, polymarket: ClobClient){
  const betsInExecutionOrder = _.sortBy(bestBets.bets, b => b.lookup.location);
  const results = [];
  for(const bet of betsInExecutionOrder){
    const ratio = bet.winChance / (100 - bestBets.edge);
    const risk = size * ratio;
    if(bet.lookup.location === 'BETFAIR'){
      console.log(risk);
      const size = bet.lookup.direction === 'BACK' ? risk : risk / (bet.lookup.price - 1);
      const betSize = Math.max(size, 2);
      const b = await executeBetBetfair(bet, betSize, betfair);
      results.push(b);
    }
    else if(bet.lookup.location === 'POLYMARKET'){
      const size = bet.lookup.side === Side.BUY ? risk : invertLayPrice(risk);
      const b = await executeBetPolymarket(bet, size, polymarket);
      results.push(b);
    }
  }

  console.log(results);
}

async function executeBetBetfair(bet: Bet, size: number, betfair: ExchangeApi){
  if(bet.lookup.location !== 'BETFAIR') throw new Error('NOT A BF BET');
  const b = new PlaceOrdersRequest({
    marketId: bet.lookup.marketId,
    instructions:[{
      orderType: 'LIMIT',
      selectionId: bet.lookup.selectionId,
      side: bet.lookup.direction,
      limitOrder:{
        size: Math.max(size, 2),
        price: bet.lookup.price,
        persistenceType: 'PERSIST',
        minFillSize: size,
        timeInForce: 'FILL_OR_KILL'
      }
    }]
  });

  return await betfair.placeOrders(b);
}

async function executeBetPolymarket(bet: Bet, size: number, polymarket: ClobClient){
  if(bet.lookup.location !== 'POLYMARKET') throw new Error('NOT A POLY BET');

  const order: UserOrder = {
    tokenID: bet.lookup.tokenId,
    price: bet.lookup.price / 100,
    size: size,
    side: bet.lookup.side,
  };

  return await polymarket.createOrder(order);
}