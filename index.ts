import 'dotenv/config';
import { getActiveMarkets, init as initPoly} from './polymarket';
import { init as initBetfair } from './betfair';
import { analyseAll } from './markets';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ClobClient } from '@polymarket/clob-client';
import { ExchangeApi } from '@b3t/betfair-ts';
import { getCurrentPositions } from './markets/getCurrentPositions';
import { getAllAvailableBets } from './markets/getAvailableBets';
import { findSellBets } from './markets/findSellBets';

type State = {
  isReady: false;
} | {
  isReady: true;
  betfair: ExchangeApi;
  polymarket: ClobClient;
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
    isReady: true,
    betfair,
    polymarket
  }
}

async function debug(){
  await init();
  // const r = await getAvailableMarkets();
  // r.forEach(s => console.log(s.name, s.edge * 100));
}

async function run(){
  await loop();
}

async function loop(){
  await init();
  if(!STATE.isReady) throw new Error('Init Failed');

  const availableBets = await getAllAvailableBets(STATE.betfair, STATE.polymarket);
  const arbOptions = await analyseAll(availableBets);

  console.log(arbOptions.map(a => [a.edge * 100, a.name]))

  // const positions = await getCurrentPositions(STATE.betfair, STATE.polymarket);
  // const availableSells = findSellBets(positions, arbOptions);
  // console.log(availableSells);
}

const args = process.argv.slice(2);
if(args.includes('--debug')){
  debug();
}
else{
  run();
}
