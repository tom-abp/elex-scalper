import { Side } from "@polymarket/clob-client";

export type Direction = 'BACK' | 'LAY';

export type BetfairLookup = {
  location: 'BETFAIR';
  selectionId: number;
  marketId: string;
  direction: Direction;
  price: number;
  size: number
}

export type PolymarketLookup = {
  location: 'POLYMARKET';
  tokenId: string;
  side: Side;
  price: number;
  size: number;
}

export type Bet<T1 extends string = string, T2 extends string = string> = {
  market: string;
  winChance: number;
  availableGBP: number;
  winsIf: T1 | T2;
  lookup: PolymarketLookup | BetfairLookup;
}

export type ExistingBet<T1 extends string = string, T2 extends string = string> = Omit<Bet<T1, T2>, 'availableGBP'> & {
  sizeGBP: number;
}

export type TotalisedPosition<T1 extends string = string, T2 extends string = string> = {
  market: string;
  avgWinChance: number;
  sizeGBP: number;
  winsIf: T1 | T2;
}

export type BestBetsForMarket = {
  market: string;
  edge: number;
  bets: Bet[];
};

export type Exposure<T1 extends string = string, T2 extends string = string> = Record<T1 | T2, number>

export type MarketPosition<T1 extends string = string, T2 extends string = string> = {
  market: string;
  bets: ExistingBet[];
  edgeInPosition: number;
  positionSummary: [TotalisedPosition, TotalisedPosition];
  exposure: Exposure<T1, T2>;
};

export type AllPositions = Record<string, MarketPosition>;

export type SellMethod<T extends 'BETFAIR' | 'POLYMARKET'> = {
  direction: T extends 'BETFAIR' ? Direction : Side;
  selection: T extends 'BETFAIR' ? number : string;
}