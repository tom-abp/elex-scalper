import _ from 'lodash';
import 'dotenv/config';
import { getActiveMarkets, init as initPoly} from './polymarket';
import { init as initBetfair } from './betfair';
import { BestBetsForMarket, Bet, findBestBuyBetsForAllMarkets, findBestSellBets, findBestSellBetsForAllMarkets, getAllAvailableBets, getCurrentPositions, MarketPosition } from './markets';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ClobClient, Side } from '@polymarket/clob-client';
import { ExchangeApi } from '@b3t/betfair-ts';
import { electionMarkets } from './data/electionMarkets';
import { SUMMARY } from './display';
import { placeBets } from './markets/placeBets';

export type MarketData = {
  name: string;
  buyBets: BestBetsForMarket,
  sellBets: BestBetsForMarket | null;
  position: MarketPosition | null;
}

export type FullData = Record<string, MarketData>;

type State = {
  isReady: false;
} | {
  isReady: true;
  pageNum: number;
  betfair: ExchangeApi;
  polymarket: ClobClient;
  page: string;
  data: FullData | null;
}

let STATE: State = {
  isReady: false,
};

async function saveMarketJS(polymarket: ClobClient){
  const result = await getActiveMarkets(polymarket);
  const matches = result.filter(r => r.enable_order_book);
  writeFileSync(path.join(__dirname, 'data', 'markets.json'), `module.exports = ${JSON.stringify(matches, null, 2)}`);
}

async function init(){
  const [betfair, polymarket] = await Promise.all([
    initBetfair(),
    initPoly()
  ]);

  STATE = {
    page: 'SUMMARY',
    pageNum: -1,
    data: null,
    isReady: true,
    betfair,
    polymarket
  }
}

async function debug(){
  await init();
  const testBet: BestBetsForMarket = {
    edge: 3.1879699248120232,
    bets: [
      {
        market: 'Popular Vote',
        winChance: 24.812030075187977,
        availableGBP: 406.87,
        winsIf: 'TRUMP',
        lookup: {
          location: 'BETFAIR',
          selectionId: 12126964,
          marketId: '1.178165812',
          direction: 'LAY',
          price: 1.33,
          size: 406.87
        }
      },
      {
        market: 'Popular Vote',
        winChance: 72,
        availableGBP: 59.40296204875039,
        winsIf: 'HARRIS',
        lookup: {
          location: 'POLYMARKET',
          tokenId: '52646153159016006621189163812433115969858888637703551736022048114666679879653',
          side: Side.BUY,
          price: 72,
          size: 77
        }
      }
    ],
    market: 'Popular Vote'
}
  if(!STATE.isReady) throw new Error('Not ready');
  await placeBets(testBet, 100, STATE.betfair, STATE.polymarket);
  // const r = await getAvailableMarkets();
  // r.forEach(s => console.log(s.name, s.edge * 100));
}

function setPage(page: string, pageNum?: number){
  if(!STATE.isReady) return null;
  STATE.page = page;

  if(pageNum) STATE.pageNum = pageNum;
}

const displays: Record<string, (data: FullData, reload: Function, pageNum: number, betfair: ExchangeApi, polymarket: ClobClient) => void> = {
  SUMMARY: SUMMARY
}

async function display(){
  await loop();
  if(!STATE.isReady || !STATE.data) return null;

  const fn = displays[STATE.page];
  fn(STATE.data, loop, STATE.pageNum || 0, STATE.betfair, STATE.polymarket);
}

async function run(){
  await loop();
  display();
}

async function loop(){
  await init();
  if(!STATE.isReady) throw new Error('Init Failed');

  const availableBets = await getAllAvailableBets(STATE.betfair, STATE.polymarket);
  const buyBets = findBestBuyBetsForAllMarkets(_.values(availableBets));

  const currentPositions = await getCurrentPositions(STATE.betfair, STATE.polymarket);
  const sellBets = findBestSellBetsForAllMarkets(currentPositions, availableBets)
  
  STATE.data = electionMarkets.reduce<FullData>((obj, market) => {
    return{
      ...obj,
      [market.name]:{
        name: market.name,
        buyBets: buyBets[market.name],
        sellBets: sellBets[market.name] || null,
        position: currentPositions[market.name] || null
      }
    }
  }, {});
}

const args = process.argv.slice(2);
if(args.includes('--debug')){
  debug();
}
else{
  run();
}
