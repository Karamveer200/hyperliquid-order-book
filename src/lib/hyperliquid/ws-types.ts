export interface WsLevel {
  px: string; // price
  sz: string; // size
  n: number; // number of orders
}

export interface WsBook {
  coin: string;
  levels: [WsLevel[], WsLevel[]]; // [bids, asks]
  time: number;
  spread: string; // NOT listed in official docs, but is returned by the API
}

export interface OrderBookState {
  bids: WsLevel[];
  asks: WsLevel[];
  coin: string;
  time: number;
  spread: string;
}
