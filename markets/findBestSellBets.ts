import _ from 'lodash';
import { AllPositions, BestBetsForMarket, Bet, ExistingBet, SellMethod, TotalisedPosition } from './types';
import { ElectionMarket, electionMarkets } from '../data/electionMarkets';
import { findExposure, totalisePositions } from './getCurrentPositions';
import { Side } from '@polymarket/clob-client';

type PositionByLocation = {
  BETFAIR?: TotalisedPosition;
  POLYMARKET?: TotalisedPosition;
}

export function findBestSellBets(marketBets: ExistingBet[], availableBets: Bet[], marketName: string): BestBetsForMarket | null{
  const market = electionMarkets.find(m => m.name === marketName);
  if(!market) throw new Error('Nay market');

  const betsByLocation = _.groupBy(marketBets, s => s.lookup.location);
  const criteriaByLocation = {
    BETFAIR: getBetfairSellCriteria(betsByLocation.BETFAIR || [], market),
    POLYMARKET: getPolymarketSellCriteria(betsByLocation.POLYMARKET || [], market)
  };

  console.log(criteriaByLocation);

  const betByLocation = {
    BETFAIR: findBetfairSellBet(criteriaByLocation.BETFAIR, availableBets),
    POLYMARKET: findPolymarketSellBet(criteriaByLocation.POLYMARKET, availableBets),
  }

  if(!betByLocation.BETFAIR || !betByLocation.POLYMARKET) return null;


  const edge = 100 - Math.abs(betByLocation.BETFAIR.winChance + betByLocation.POLYMARKET.winChance);

  return {
    edge,
    bets: [betByLocation.BETFAIR, betByLocation.POLYMARKET],
    market: market.name
  };
}

export function findBetfairSellBet(c: SellMethod<'BETFAIR'>[], availableBets: Bet[]){
  const matchingBets = availableBets.filter(b => {
    if(b.lookup.location !== 'BETFAIR') return false;

    const d = b.lookup.location === 'BETFAIR' && b.lookup.direction;
    const s = b.lookup.location === 'BETFAIR' && b.lookup.selectionId;

    return !!c.find(m => m.direction === d && m.selection === s);
  });

  return _.minBy(matchingBets, b => b.winChance) || null;
}

export function findPolymarketSellBet(c: SellMethod<'POLYMARKET'>[], availableBets: Bet[]){
  const matchingBets = availableBets.filter(b => {
    if(b.lookup.location !== 'POLYMARKET') return false;

    const d = b.lookup.location === 'POLYMARKET' && b.lookup.side;
    const s = b.lookup.location === 'POLYMARKET' && b.lookup.tokenId;

    return !!c.find(m => m.direction === d && m.selection === s);
  });

  return _.minBy(matchingBets, b => b.winChance) || null;
}


export function getBetfairSellCriteria(bets: ExistingBet[], market: ElectionMarket): SellMethod<'BETFAIR'>[]{
  const bySelection = _.groupBy(bets, b => b.lookup.location === 'BETFAIR' && b.lookup.selectionId);
  return Object.keys(bySelection).flatMap(selectionId => {
    const selectionBets = bySelection[selectionId];
    return _.uniq(_.compact(selectionBets.map(b => b.lookup.location === 'BETFAIR' && b.lookup.direction))).map(oDir => {
      const direction = oDir === 'BACK' ? 'LAY' : 'BACK';
      return {
        selection: Number(selectionId),
        direction
      }
    });
  });
}

export function getPolymarketSellCriteria(bets: ExistingBet[], market: ElectionMarket): SellMethod<'POLYMARKET'>[]{
  return _.uniq(_.compact(bets.map(b => b.lookup.location === 'POLYMARKET' && b.lookup.tokenId))).map(selection => {
    return {
      selection,
      direction: Side.SELL
    };
  })
}


export function findBestSellBetsForAllMarkets(positions: AllPositions, availableBets: Record<string, Bet[]>){
  return _.mapValues(positions, p => findBestSellBets(p.bets, availableBets[p.market], p.market));
}