export const REDIS_CLIENT = 'REDIS_CLIENT';

export const CACHE_TTL = {
  PRODUCT: 600, // 10 dakika
  PRODUCT_LIST: 300, // 5 dakika
} as const;

export const CACHE_KEYS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_LIST: 'products:list',
} as const;
