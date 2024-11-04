import _ from 'lodash';
import { Analysis, Bet, CurrentPositionGrouping, PositionSummary, SizedBet } from "./types";
import { electionMarkets } from '../data/electionMarkets';

export function findSellBets(positions: PositionSummary[], analyses: Analysis[]): SizedBet[]{
  return _.compact(positions.map(p => {
    const analysis = analyses.find(a => a.name === p.name);
    const market = electionMarkets.find(a => a.name === p.name);
    if(!analysis || !market) return null;

    /*
     * In fact, we should ALWAYS do the opposite of the planned one?
     * Depends, if it's a lay bet, a back won't cover but vice versa will.
     * So for Betfair, it needs to be the opposite direction (cross-matching exists so is fine anyway).
     * For Polymarket, it needs to be a sell of the same token.
    */

    const bestPolySell = analysis.sellBets.map(a => a.find(b => b.lookup.location === 'POLYMARKET' && b.direction === 'LAY'));
    const bestBetfairSell = analysis.sellBets.map(a => a.find(b => b.lookup.location === 'BETFAIR' && p.bets.find(p => p.direction !== b.direction)));
    console.log(bestBetfairSell);
    return null;
  }));
}