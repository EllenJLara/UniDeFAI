import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'coinstatsopenapi/1.0 (api/6.1.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of cryptocurrencies supported by
   * CoinStats.</hr>
   *
   */
  getCoins(metadata?: types.GetCoinsMetadataParam): Promise<FetchResponse<200, types.GetCoinsResponse200>> {
    return this.core.fetch('/coins', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve detailed information about a specific
   * cryptocurrency based on its unique identifier.</hr>
   *
   */
  getCoinById(metadata: types.GetCoinByIdMetadataParam): Promise<FetchResponse<200, types.GetCoinByIdResponse200>> {
    return this.core.fetch('/coins/{coinId}', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve chart data for a specific cryptocurrency
   * based on its unique identifier, specifying different time ranges.</hr>
   *
   */
  getCoinChartById(metadata: types.GetCoinChartByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/coins/{coinId}/charts', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the historical average price for a specific
   * cryptocurrency based on its unique identifier and a specific date.</hr>
   *
   */
  getCoinAvgPrice(metadata: types.GetCoinAvgPriceMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/coins/price/avg', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the historical price data for a specific
   * cryptocurrency on a particular exchange.</hr>
   *
   */
  getCoinExchangePrice(metadata: types.GetCoinExchangePriceMetadataParam): Promise<FetchResponse<200, types.GetCoinExchangePriceResponse200>> {
    return this.core.fetch('/coins/price/exchange', 'get', metadata);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of supported exchanges</hr>
   *
   */
  getTickerExchanges(): Promise<FetchResponse<200, types.GetTickerExchangesResponse200>> {
    return this.core.fetch('/tickers/exchanges', 'get');
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of tickers for a specific
   * cryptocurrency across different exchanges.</hr>
   *
   */
  getTickerMarkets(metadata?: types.GetTickerMarketsMetadataParam): Promise<FetchResponse<200, types.GetTickerMarketsResponse200>> {
    return this.core.fetch('/tickers/markets', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of supported blockchains by
   * CoinStats</hr>
   *
   */
  getBlockchains(): Promise<FetchResponse<200, types.GetBlockchainsResponse200>> {
    return this.core.fetch('/wallet/blockchains', 'get');
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the balance data for a provided wallet
   * address on a specific blockchain network</hr>
   *
   */
  getWalletBalance(metadata: types.GetWalletBalanceMetadataParam): Promise<FetchResponse<200, types.GetWalletBalanceResponse200>> {
    return this.core.fetch('/wallet/balance', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         Credits 40 per network, This endpoint allows you to retrieve the balance data
   * for a provided wallet address on an all CoinStats Supported networks</hr>
   *
   */
  getWalletBalances(metadata: types.GetWalletBalancesMetadataParam): Promise<FetchResponse<200, types.GetWalletBalancesResponse200>> {
    return this.core.fetch('/wallet/balances', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the syncing status of the wallet with the
   * blockchain network</hr>
   *
   */
  getWalletSyncStatus(metadata: types.GetWalletSyncStatusMetadataParam): Promise<FetchResponse<200, types.GetWalletSyncStatusResponse200>> {
    return this.core.fetch('/wallet/status', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve transaction data for a specific wallet.
   * Ensure transactions are synced by calling PATCH /transactions first.</hr>
   *
   */
  getWalletTransactions(metadata: types.GetWalletTransactionsMetadataParam): Promise<FetchResponse<200, types.GetWalletTransactionsResponse200>> {
    return this.core.fetch('/wallet/transactions', 'get', metadata);
  }

  /**
   * <b> 80 credits per request </b>
   *             <hr>
   *         This endpoint initiates the syncing process to update transaction data for a
   * specific wallet. By making a PATCH request to this endpoint and providing the wallet
   * address as a parameter, you can trigger the syncing process and retrieve the latest
   * transaction data for the wallet.</hr>
   *
   */
  transactionsSync(metadata: types.TransactionsSyncMetadataParam): Promise<FetchResponse<200, types.TransactionsSyncResponse200>> {
    return this.core.fetch('/wallet/transactions', 'patch', metadata);
  }

  /**
   * <b> 50 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve wallet chart data by time ranges displayed
   * on the CoinStats website. Ensure transactions are synced by calling PATCH /transactions
   * first.</hr>
   *
   */
  walletChart(metadata: types.WalletChartMetadataParam): Promise<FetchResponse<200, types.WalletChartResponse200>> {
    return this.core.fetch('/wallet/chart', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of supported exchange portfolio
   * connections by CoinStats</hr>
   *
   */
  getExchanges(): Promise<FetchResponse<200, types.GetExchangesResponse200>> {
    return this.core.fetch('/exchange/support', 'get');
  }

  /**
   * <b> 10 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the balance data for a provided by
   * Exchange</hr>
   *
   */
  getExchangeBalance(body: types.GetExchangeBalanceBodyParam): Promise<FetchResponse<200, types.GetExchangeBalanceResponse200>> {
    return this.core.fetch('/exchange/balance', 'post', body);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve the syncing status of the exchange
   * portfolio</hr>
   *
   */
  getExchangeSyncStatus(metadata: types.GetExchangeSyncStatusMetadataParam): Promise<FetchResponse<200, types.GetExchangeSyncStatusResponse200>> {
    return this.core.fetch('/exchange/status', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve transaction data for a specific
   * exchange</hr>
   *
   */
  getExchangeTransactions(metadata: types.GetExchangeTransactionsMetadataParam): Promise<FetchResponse<200, types.GetExchangeTransactionsResponse200>> {
    return this.core.fetch('/exchange/transactions', 'get', metadata);
  }

  /**
   * <b> 50 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve transaction data for a specific
   * exchange</hr>
   *
   */
  getExchangeChart(metadata: types.GetExchangeChartMetadataParam): Promise<FetchResponse<200, types.GetExchangeChartResponse200>> {
    return this.core.fetch('/exchange/chart', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of fiat currencies supported by
   * CoinStats</hr>
   *
   */
  getFiatCurrencies(): Promise<FetchResponse<200, types.GetFiatCurrenciesResponse200>> {
    return this.core.fetch('/fiats', 'get');
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of trending Non-Fungible Tokens
   * (NFTs) in the marketplace. Trending NFTs typically represent the most popular or highly
   * sought-after digital assets based on sales volume</hr>
   *
   */
  getTrendingNfts(metadata?: types.GetTrendingNftsMetadataParam): Promise<FetchResponse<200, types.GetTrendingNftsResponse200>> {
    return this.core.fetch('/nft/trending', 'get', metadata);
  }

  /**
   * <b> 40 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of NFT assets owned by a specific
   * wallet address.</hr>
   *
   */
  getNftsByWallet(metadata: types.GetNftsByWalletMetadataParam): Promise<FetchResponse<200, types.GetNftsByWalletResponse200>> {
    return this.core.fetch('/nft/wallet/{address}/assets', 'get', metadata);
  }

  /**
   * <b> 3 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve an NFT collection info with a specific
   * collection address.</hr>
   *
   */
  getNftCollectionByAddress(metadata: types.GetNftCollectionByAddressMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionByAddressResponse200>> {
    return this.core.fetch('/nft/collection/{collectionAddress}', 'get', metadata);
  }

  /**
   * <b> 8 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of NFT assets associated with a
   * specific NFT collection address.</hr>
   *
   */
  getNftCollectionAssetsByAddress(metadata: types.GetNftCollectionAssetsByAddressMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionAssetsByAddressResponse200>> {
    return this.core.fetch('/nft/{collectionAddress}/assets', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve information about a specific NFT asset
   * based on the NFT collection address and token ID</hr>
   *
   */
  getNftCollectionAssetByTokenid(metadata: types.GetNftCollectionAssetByTokenidMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionAssetByTokenidResponse200>> {
    return this.core.fetch('/nft/{collectionAddress}/asset/{tokenId}', 'get', metadata);
  }

  /**
   * <b> 2 credits per request </b>
   *             <hr>
   *         This endpoint allows you to get news sources.</hr>
   *
   */
  getNewsSources(): Promise<FetchResponse<200, types.GetNewsSourcesResponse200>> {
    return this.core.fetch('/news/sources', 'get');
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         This endpoint allows you to get news articles with pagination</hr>
   *
   */
  getNews(metadata?: types.GetNewsMetadataParam): Promise<FetchResponse<200, types.GetNewsResponse200>> {
    return this.core.fetch('/news', 'get', metadata);
  }

  /**
   * <b> 5 credits per request </b>
   *             <hr>
   *         This endpoint allows you to get news articles based on a type.</hr>
   *
   */
  getNewsByType(metadata: types.GetNewsByTypeMetadataParam): Promise<FetchResponse<200, types.GetNewsByTypeResponse200>> {
    return this.core.fetch('/news/type/{type}', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to get news by id.</hr>
   *
   */
  getNewsById(metadata: types.GetNewsByIdMetadataParam): Promise<FetchResponse<200, types.GetNewsByIdResponse200>> {
    return this.core.fetch('/news/{id}', 'get', metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         The endpoint allows you to retrieve global market data.</hr>
   *
   */
  getMarketCap(): Promise<FetchResponse<200, types.GetMarketCapResponse200>> {
    return this.core.fetch('/markets', 'get');
  }

  /**
   * <b> 8 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of portfolio coins with P/L and
   * other data displayed on CoinStats web</hr>
   *
   */
  getPortfolioCoins(metadata?: types.GetPortfolioCoinsMetadataParam): Promise<FetchResponse<200, types.GetPortfolioCoinsResponse200>> {
    return this.core.fetch('/portfolio/coins', 'get', metadata);
  }

  /**
   * <b> 10 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve portfolio chart data by time ranges
   * displayed on the CoinStats website.</hr>
   *
   */
  getPortfolioChart(metadata: types.GetPortfolioChartMetadataParam): Promise<FetchResponse<200, types.GetPortfolioChartResponse200>> {
    return this.core.fetch('/portfolio/chart', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of portfolio Transactions</hr>
   *
   */
  getPortfolioTransactions(metadata: types.GetPortfolioTransactionsMetadataParam): Promise<FetchResponse<200, types.GetPortfolioTransactionsResponse200>> {
    return this.core.fetch('/portfolio/transactions', 'get', metadata);
  }

  /**
   * <b> 4 credits per request </b>
   *             <hr>
   *         This endpoint allows you to add a transaction to a manual portfolio</hr>
   *
   */
  addPortfolioTransaction(body: types.AddPortfolioTransactionBodyParam, metadata?: types.AddPortfolioTransactionMetadataParam): Promise<FetchResponse<200, types.AddPortfolioTransactionResponse200>> {
    return this.core.fetch('/portfolio/transaction', 'post', body, metadata);
  }

  /**
   * <b> 1 credits per request </b>
   *             <hr>
   *         This endpoint allows you to retrieve a list of fiat currencies supported by
   * CoinStats.</hr>
   *
   */
  getCurrencies(): Promise<FetchResponse<200, types.GetCurrenciesResponse200>> {
    return this.core.fetch('/currencies', 'get');
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { AddPortfolioTransactionBodyParam, AddPortfolioTransactionMetadataParam, AddPortfolioTransactionResponse200, GetBlockchainsResponse200, GetCoinAvgPriceMetadataParam, GetCoinByIdMetadataParam, GetCoinByIdResponse200, GetCoinChartByIdMetadataParam, GetCoinExchangePriceMetadataParam, GetCoinExchangePriceResponse200, GetCoinsMetadataParam, GetCoinsResponse200, GetCurrenciesResponse200, GetExchangeBalanceBodyParam, GetExchangeBalanceResponse200, GetExchangeChartMetadataParam, GetExchangeChartResponse200, GetExchangeSyncStatusMetadataParam, GetExchangeSyncStatusResponse200, GetExchangeTransactionsMetadataParam, GetExchangeTransactionsResponse200, GetExchangesResponse200, GetFiatCurrenciesResponse200, GetMarketCapResponse200, GetNewsByIdMetadataParam, GetNewsByIdResponse200, GetNewsByTypeMetadataParam, GetNewsByTypeResponse200, GetNewsMetadataParam, GetNewsResponse200, GetNewsSourcesResponse200, GetNftCollectionAssetByTokenidMetadataParam, GetNftCollectionAssetByTokenidResponse200, GetNftCollectionAssetsByAddressMetadataParam, GetNftCollectionAssetsByAddressResponse200, GetNftCollectionByAddressMetadataParam, GetNftCollectionByAddressResponse200, GetNftsByWalletMetadataParam, GetNftsByWalletResponse200, GetPortfolioChartMetadataParam, GetPortfolioChartResponse200, GetPortfolioCoinsMetadataParam, GetPortfolioCoinsResponse200, GetPortfolioTransactionsMetadataParam, GetPortfolioTransactionsResponse200, GetTickerExchangesResponse200, GetTickerMarketsMetadataParam, GetTickerMarketsResponse200, GetTrendingNftsMetadataParam, GetTrendingNftsResponse200, GetWalletBalanceMetadataParam, GetWalletBalanceResponse200, GetWalletBalancesMetadataParam, GetWalletBalancesResponse200, GetWalletSyncStatusMetadataParam, GetWalletSyncStatusResponse200, GetWalletTransactionsMetadataParam, GetWalletTransactionsResponse200, TransactionsSyncMetadataParam, TransactionsSyncResponse200, WalletChartMetadataParam, WalletChartResponse200 } from './types';
