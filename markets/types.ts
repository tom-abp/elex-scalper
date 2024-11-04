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

export type Bet<T extends string = string> = {
  pricePercent: number;
  sizeAvailable: number;
  availableGBP: number;
  winsIf: T;
  lookup: PolymarketLookup | BetfairLookup;
}

export type PositionSummary = {
  name: string;
  profitBySelection: Record<string, number>;
  bets: Bet[];
}
export type Analysis = {
  edge: number;
  bets: Bet[];
  name: string;
  sellBets: Bet[][];
};

export type CurrentPositionGrouping<T extends string = string> = {
  BETFAIR: Record<T, number>;
  POLYMARKET: Record<string, Record<T, number>>;
}