export function decimalToPercent(dec: number){
  return 1 + (1 / dec);
}

export function invertLayPrice(layPrice: number){
  return 1 / (1 - (1 / layPrice));
}