import https from 'node:https';
import fs from 'node:fs';
import axios, { AxiosError, toFormData } from 'axios';
import { BETFAIR_PASSWORD, BETFAIR_USERNAME, BETFAIR_APP_KEY, BETFAIR_CERT_LOCATION } from '../consts';
import { ExchangeApi } from '@b3t/betfair-ts';

export async function init(){
  const api = new ExchangeApi(BETFAIR_APP_KEY);
  await api.login(BETFAIR_USERNAME, BETFAIR_PASSWORD);

  return api;
} 

export async function login(){
  const BASE_URL = 'https://identitysso-cert.betfair.com/api/certlogin';
  const data = {
    username: BETFAIR_USERNAME,
    password: BETFAIR_PASSWORD
  };

  const httpsAgent = new https.Agent({
    cert: fs.readFileSync(`${BETFAIR_CERT_LOCATION}.crt`),
    key: fs.readFileSync(`${BETFAIR_CERT_LOCATION}.key`),
  })

  try{
    const res = await axios.post(BASE_URL, data, {
      headers:{
        'X-Application': BETFAIR_APP_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent,
    });

    return res.data;
  }
  catch(e){
    if(axios.isAxiosError(e)){
      console.log(e.response?.data, e.response?.status, e.response?.statusText);
    }
    return null;
  }
}

export async function getPrices(sessionToken: string, ...marketIds: string[]){
  const params = {
    marketIds: marketIds,
    priceProjection:{
      priceData: ['EX_BEST_OFFERS'],
      exBestOffsetsOverrides: {
        bestPricesDepth: 5
      }
    }
  };

  const headers = {
    'X-Authentication': sessionToken,
    'X-Application': BETFAIR_APP_KEY,
    'Accept': 'application/json',
    'Content-type' : 'application/json',
  };

  console.log(headers, params);

  try{
    const res = await axios.post("https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/", params, {headers});
    return res.data[0];
  }
  catch(e){
    if(axios.isAxiosError(e)){
      console.log(e.response?.data, e.response?.status, e.response?.statusText);
    }

    return null;
  }
}