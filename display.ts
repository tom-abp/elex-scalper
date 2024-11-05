import _ from 'lodash';
import { input } from '@inquirer/prompts';
import { FullData } from ".";
import { electionMarkets } from './data/electionMarkets';
import { placeBets } from './markets/placeBets';
import { ExchangeApi } from '@b3t/betfair-ts';
import { ClobClient } from '@polymarket/clob-client';

function round(n: number, dec = 2){
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
}

export async function SUMMARY(data: FullData, reload: Function, pageNum: number, betfair: ExchangeApi, polymarket: ClobClient){
  const tableData = _.values(data).map((d, i) => {
    return{
      name: d.name,
      buyEdge: round(d.buyBets.edge),
      posEdge: round(d.position?.edgeInPosition || 0),
      sellEdge: round(d.sellBets?.edge || 0)
    }
  });
  
  console.log(new Date());
  console.table([undefined, ...tableData], ['name', 'buyEdge', 'posEdge', 'sellEdge']);

  const result = await input({message: 'r to reload, number to select'});
  const n = parseInt(result);
  if(result === 'r'){
    await reload();
    SUMMARY(data, reload, pageNum, betfair, polymarket);
  }
  else if(result === `${n}`){
    DETAILS(data, reload, n, betfair, polymarket);
  }
  else{
    SUMMARY(data, reload, pageNum, betfair, polymarket);
  }
};

export async function DETAILS(data: FullData, reload: Function, pageNum: number, betfair: ExchangeApi, polymarket: ClobClient){
  const e = electionMarkets[pageNum - 1];
  const market = data[e.name];
  if(!market) throw new Error('Page not found');

  console.log('---------------------------------------------');
  console.log(new Date());
  console.log(market.name);
  console.log();
  console.log('---------------------');
  console.log();
  console.log('BUY BETS')
  const [b1, b2] = market.buyBets.bets;
  const buyTable = {
    b1:{
      favour: b1.winsIf,
      location: b1.lookup.location,
      winChance: round(b1.winChance)
    },
    b2:{
      favour: b2.winsIf,
      location: b2.lookup.location,
      winChance: round(b2.winChance)
    } 
  }
  console.table(buyTable);
  console.log('EDGE', market.buyBets.edge);
  
  if(market.sellBets){
    console.log();
    console.log('---------------------');
    console.log();
    console.log('SELL BETS')
    const [b1, b2] = market.sellBets.bets;
    const sellTable = {
      b1:{
        favour: b1.winsIf,
        location: b1.lookup.location,
        winChance: b1.winChance
      },
      b2:{
        favour: b2.winsIf,
        location: b2.lookup.location,
        winChance: b2.winChance
      } 
    }

    console.table(sellTable);
    console.log('SELL EDGE', market.sellBets.edge);
  }


  const result = await input({message: 'r to reload, b to go back, b<gbp> to buy <gbp>, s<gbp> to sell <gbp>'});
  const char1 = result[0];
  const n = parseInt(result.slice(1));
  if(result === 'r'){
    await reload();
    DETAILS(data, reload, pageNum, betfair, polymarket);
  }
  else if(result === 'b'){
    SUMMARY(data, reload, 0, betfair, polymarket);
  }
  else if(char1 === 'b' && n >= 2){
    console.log('place buy bet', n, market.buyBets);
    console.log('placing...');
    const betsPlaced = await placeBets(market.buyBets, n, betfair, polymarket);
    console.log('result', betsPlaced);
    await reload();
    DETAILS(data, reload, pageNum, betfair, polymarket);
  }
  else if(char1 === 's' && n >= 2){
    console.log('place sell bet', n, market.sellBets);
    console.log('placing...');
    const betsPlaced = await placeBets(market.buyBets, n, betfair, polymarket);
    console.log('result', betsPlaced);
    await reload();
    DETAILS(data, reload, pageNum, betfair, polymarket);
  }
  else{
    SUMMARY(data, reload, pageNum, betfair, polymarket);
  }



};