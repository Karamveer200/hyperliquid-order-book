/**
 * Hyperliquid WebSocket types (l2Book / order book)
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */

export interface WsLevel {
  px: string; // price
  sz: string; // size
  n: number;  // number of orders
}

export interface WsBook {
  coin: string;
  levels: [WsLevel[], WsLevel[]]; // [bids, asks]
  time: number;
}

export interface OrderBookState {
  bids: WsLevel[];
  asks: WsLevel[];
  coin: string;
  time: number;
}
