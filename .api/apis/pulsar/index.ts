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
    this.core = new APICore(this.spec, 'pulsar/0.1.0 (api/6.1.2)');
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
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Fetch wallet timeseries data for a given wallet address and chain.
   *
   * ### Parameters:
   * - `address` (str): The wallet address to fetch the timeseries data for.
   * - `chain` (str): The chain the wallet is on.
   * - `tier` (str): The tier of the timeseries data to fetch.
   *
   * ### Returns:
   * The wallet timeseries data.
   *
   * @summary Get Wallet Timeseries
   * @throws FetchError<422, types.GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetResponse422> Validation Error
   */
  get_wallet_timeseries_v1_thirdparty_wallet__address__timeseries_get(metadata: types.GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetMetadataParam): Promise<FetchResponse<200, types.GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/wallet/{address}/timeseries', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Fetches extended information about the token identified by the specified `token_type`,
   * `chain`, and `address`.
   *
   * Parameters:
   * - `token_type`: The type of token to fetch information for (`TokenType`).
   * - `chain`: The chain on which the token is located (`ChainKeys`).
   * - `address`: The address of the token (`str`).
   *
   * ### Returns:
   * - Information about the token, if found.
   *
   * @summary Get Token Info
   * @throws FetchError<422, types.GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetResponse422> Validation Error
   */
  get_token_info_v1_thirdparty_token__token_type___address__get(metadata: types.GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetMetadataParam): Promise<FetchResponse<200, types.GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/token/{token_type}/{address}', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve information about a token with a given id.
   *
   * ### Parameters:
   * - `token_id` (str): The id of the token to retrieve information about.
   *
   * ### Returns:
   * - Information about the token, if found.
   *
   * @summary Get Token Info By Id
   * @throws FetchError<422, types.GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetResponse422> Validation Error
   */
  get_token_info_by_id_v1_thirdparty_token__token_id__get(metadata: types.GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetMetadataParam): Promise<FetchResponse<200, types.GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/token/{token_id}', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve a paginated list of tokens that match the given text filters and chain,
   * sorted by the specified criteria.
   *
   * ### Parameters:
   * - `text` (str, optional): A text filter to match against the token name or
   *   symbol.
   * - `chain` (list[ChainKeys], optional): A list of chains to filter by.
   * - `minimum_liquidity` (int, optiona): The minimum liquidity the filtered tokens should
   * have.
   * - `sort_by` (TokenSort, optional): The criteria to sort the tokens by.
   * - `offset` (int, optional): The number of items to skip before starting to
   *   collect the result set.
   * - `limit` (int, optional): The maximum number of items to return to the result
   *   set.
   *
   * ### Returns:
   * - A dictionary with a list of tokenS matching the given filters and sorted by
   *   the specified criteria and the total number of items matching the given filters.
   *
   * @summary List Tokens
   * @throws FetchError<422, types.ListTokensV1ThirdpartyTokensGetResponse422> Validation Error
   */
  list_tokens_v1_thirdparty_tokens_get(metadata?: types.ListTokensV1ThirdpartyTokensGetMetadataParam): Promise<FetchResponse<200, types.ListTokensV1ThirdpartyTokensGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/tokens', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve price of token over a period of time with a given id.
   *
   * ### Parameters:
   * - `token_id` (str): The id of the token to retrieve information about.
   * - `tier_name` (TierKeys): The period of time to return
   *
   * ### Returns:
   * - Price of the token over a period of time, if found.
   *
   * @summary Get Token Timeseries
   * @throws FetchError<422, types.GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetResponse422> Validation Error
   */
  get_token_timeseries_v1_thirdparty_tokens__token_id__timeseries_get(metadata: types.GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetMetadataParam): Promise<FetchResponse<200, types.GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/tokens/{token_id}/timeseries', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve protocol information for protocols from a given chain.
   *
   * ### Parameters:
   * - `chain` (ChainKeys): The chain to fetch protocols from.
   *
   * ### Returns:
   * - The protocol information for protocols from a given chain.
   *
   * @summary List Protocols
   * @throws FetchError<422, types.ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetResponse422> Validation Error
   */
  list_protocols_v1_thirdparty_protocols_all_protocols_get(metadata?: types.ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetMetadataParam): Promise<FetchResponse<200, types.ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/protocols/all-protocols', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">0 credits</span>.
   *   </p>
   * </div>
   *
   * Retrieve number of protocols available in Pulsar.
   *
   * ### Returns:
   * - Number of protocols available in Pulsar.
   *
   * @summary Get Number Protocols
   */
  get_number_protocols_v1_thirdparty_protocols_total_protocols_get(): Promise<FetchResponse<200, types.GetNumberProtocolsV1ThirdpartyProtocolsTotalProtocolsGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/protocols/total-protocols', 'get');
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve a paginated list of protocols that match the given filters and sorted by
   * specified criteria.
   *
   * ### Parameters:
   * - `name` (str, optional): A name filter to match against the protocol name.
   * - `chain` (list[ChainKeys], optional): A list of chains to filter by.
   * - `tvl` (str, optional): The minimum TVL to return in the result set
   * - `sort_by` (ProtocolSort, optional): The criteria to sort the protocols by.
   * - `offset` (int, optional): The number of items to skip before starting to
   *   collect the result set.
   * - `limit` (int, optional): The maximum number of items to return in the result
   *   set.
   *
   * ### Returns:
   * - A dictionary with a list of protocols matching the given filters and sorted by
   *   the specified criteria and the total number of items matching the given filters.
   *
   * @summary Get Filtered Protocols
   * @throws FetchError<422, types.GetFilteredProtocolsV1ThirdpartyProtocolsGetResponse422> Validation Error
   */
  get_filtered_protocols_v1_thirdparty_protocols_get(metadata?: types.GetFilteredProtocolsV1ThirdpartyProtocolsGetMetadataParam): Promise<FetchResponse<200, types.GetFilteredProtocolsV1ThirdpartyProtocolsGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/protocols', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve metrics of a protocol over a period of time with a given id.
   *
   * ### Parameters:
   * - `protocol_key` (str): The id of the protocol to retrieve information about.
   * - `tier_name` (TierKeys): The period of time to return.
   *
   * ### Returns:
   * - Returns metrics of the protocol over a period of time.
   *
   * @summary Get Protocol Timeseries
   * @throws FetchError<422, types.GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetResponse422> Validation Error
   */
  get_protocol_timeseries_v1_thirdparty_protocols__protocol_key__timeseries_get(metadata: types.GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetMetadataParam): Promise<FetchResponse<200, types.GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/protocols/{protocol_key}/timeseries', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve the main name, address and service of the given name.
   *
   * ### Parameters:
   * - `name` (str): The name to resolve.
   *
   * ### Returns:
   * - `main_name` (str): The main name associated with the given name.
   * - `main_address` (str): The main address associated with the given name.
   * - `service` (str): The service associated with the given name.
   *
   * @summary Resolve Name
   * @throws FetchError<422, types.ResolveNameV1ThirdpartyNameServiceResolveNameGetResponse422> Validation Error
   */
  resolve_name_v1_thirdparty_name_service_resolve_name_get(metadata: types.ResolveNameV1ThirdpartyNameServiceResolveNameGetMetadataParam): Promise<FetchResponse<200, types.ResolveNameV1ThirdpartyNameServiceResolveNameGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/name-service/resolve-name', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve the main name and service of the given address.
   *
   * ### Parameters:
   * - `name` (str): The name to resolve.
   *
   * ### Returns:
   * - `main_name` (str): The main name associated with the given name.
   * - `service` (str): The service associated with the given name.
   *
   * @summary Resolve Address
   * @throws FetchError<422, types.ResolveAddressV1ThirdpartyNameServiceResolveAddressGetResponse422> Validation Error
   */
  resolve_address_v1_thirdparty_name_service_resolve_address_get(metadata: types.ResolveAddressV1ThirdpartyNameServiceResolveAddressGetMetadataParam): Promise<FetchResponse<200, types.ResolveAddressV1ThirdpartyNameServiceResolveAddressGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/name-service/resolve-address', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Fetch an NFT Item by the collection chain and address, and the NFT token id.
   *
   * ### Parameters:
   * - `chain`: The collections chain.
   * - `collection_address`: The collections address.
   * - `token_id`: The NFT's token ID.
   *
   * ### Returns:
   * The NFT Item.
   *
   * @summary Fetch Nft By Address
   * @throws FetchError<422, types.FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetResponse422> Validation Error
   */
  fetch_nft_by_address_v1_thirdparty_nfts_collections__chain___collection_address__nfts_get(metadata: types.FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetMetadataParam): Promise<FetchResponse<200, types.FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts/collections/{chain}/{collection_address}/nfts', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Fetch an NFT Item by the collection id and the NFT token id.
   *
   * ### Parameters:
   * - `collection_id` (str): The id of the collection to fetch the NFT from.
   * - `token_id` (str): The NFT's token ID.
   *
   * ### Returns:
   * The NFT Item.
   *
   * @summary Fetch Nft
   * @throws FetchError<422, types.FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetResponse422> Validation Error
   */
  fetch_nft_v1_thirdparty_nfts_collections__collection_id__nfts__token_id__get(metadata: types.FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetMetadataParam): Promise<FetchResponse<200, types.FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts/collections/{collection_id}/nfts/{token_id}', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * List NFT collection for a given chain and collection address
   *
   * ### Parameters:
   * - `collection_address` (str): The address of the collection to list the NFTs for.
   * - `chain` (ChainKeys): The chain of the collection to fetch.
   *
   * ### Returns:
   * The list of NFTs from the given collection_id.
   *
   * @summary Fetch Collection By Address
   * @throws FetchError<422, types.FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetResponse422> Validation Error
   */
  fetch_collection_by_address_v1_thirdparty_nfts_collections__chain___collection_address__get(metadata: types.FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetMetadataParam): Promise<FetchResponse<200, types.FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts/collections/{chain}/{collection_address}', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * List NFTs for a given collection id, optionally filtering by rarity score, rank, traits
   * and sorting the result.
   *
   * ### Parameters:
   * - `collection_id` (str): The id of the collection to list the NFTs for.
   * - `rarity_score` (str, optional): The minimum rarity score the NFTs should have.
   * - `rank_minumum` (str, optional): The minimum rank the NFTs should have.
   * - `rank_maximum` (str, optional): The maximum rank the NFTs should have.
   * - `traits` (NFTTraitsFilter, optional): The traits to filter by.
   * - `sort_by` (NFTItemSort, optional): The criteria to sort the NFTs by.
   * - `offset` (int, optional): The number of items to skip before starting to collect the
   * result set.
   * - `limit` (int, optional): The maximum number of items to return in the result set.
   *
   * ### Returns:
   * The list of NFTs matching the given filters and sorted by the specified criteria.
   *
   * @summary List Collection Nfts
   * @throws FetchError<422, types.ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostResponse422> Validation Error
   */
  list_collection_nfts_v1_thirdparty_nfts_collections__collection_id__nfts_post(body: types.ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostBodyParam, metadata: types.ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostMetadataParam): Promise<FetchResponse<200, types.ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts/collections/{collection_id}/nfts', 'post', body, metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * List NFT collection for a given collection id.
   *
   * ### Parameters:
   * - `collection_id` (str): The id of the collection to list the NFTs for.
   *
   * ### Returns:
   * The list of NFTs from the given collection_id.
   *
   * @summary Fetch Collection
   * @throws FetchError<422, types.FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetResponse422> Validation Error
   */
  fetch_collection_v1_thirdparty_nfts_collections__collection_id__get(metadata: types.FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetMetadataParam): Promise<FetchResponse<200, types.FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts/collections/{collection_id}', 'get', metadata);
  }

  /**
   * <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px;
   * background-color: #f7f8fa; margin: 20px 0;">
   *   <strong style="color: #4a4a4a; font-size: 16px;">Usage Costs:</strong>
   *   <p style="color: #4a4a4a; font-size: 15px; margin: 5px 0;">
   *     This route costs <span style="color: #EA5F25; font-weight: bold;">1 credit</span>.
   *   </p>
   * </div>
   *
   * Retrieve a paginated list of NFT collections matching the given name and chains, sorted
   * by the specified criteria.
   *
   * ### Parameters:
   * - `name` (str, optional): A name filter to match against the NFT collection name.
   * - `chains` (list[ChainKeys], optional): A list of chains to filter by.
   * - `sort_by` (NFTCollectionSort, optional): The criteria to sort the NFT collections by.
   * - `offset` (int, optional): The number of items to skip before starting to collect the
   * result set.
   * - `limit` (int, optional): The maximum number of items to return in the result set.
   * - `floor_minimum` (float): minimum allowed floor price.
   * - `floor_maximum` (float): maximum allowed floor price.
   *
   * ### Returns:
   * - A paginated list of NFT collections matching the given filters and sorted by the
   * specified criteria.
   *
   * @summary List Nfts
   * @throws FetchError<422, types.ListNftsV1ThirdpartyNftsGetResponse422> Validation Error
   */
  list_nfts_v1_thirdparty_nfts_get(metadata?: types.ListNftsV1ThirdpartyNftsGetMetadataParam): Promise<FetchResponse<200, types.ListNftsV1ThirdpartyNftsGetResponse200>> {
    return this.core.fetch('/v1/thirdparty/nfts', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetMetadataParam, FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetResponse200, FetchCollectionByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressGetResponse422, FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetMetadataParam, FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetResponse200, FetchCollectionV1ThirdpartyNftsCollectionsCollectionIdGetResponse422, FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetMetadataParam, FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetResponse200, FetchNftByAddressV1ThirdpartyNftsCollectionsChainCollectionAddressNftsGetResponse422, FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetMetadataParam, FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetResponse200, FetchNftV1ThirdpartyNftsCollectionsCollectionIdNftsTokenIdGetResponse422, GetFilteredProtocolsV1ThirdpartyProtocolsGetMetadataParam, GetFilteredProtocolsV1ThirdpartyProtocolsGetResponse200, GetFilteredProtocolsV1ThirdpartyProtocolsGetResponse422, GetNumberProtocolsV1ThirdpartyProtocolsTotalProtocolsGetResponse200, GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetMetadataParam, GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetResponse200, GetProtocolTimeseriesV1ThirdpartyProtocolsProtocolKeyTimeseriesGetResponse422, GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetMetadataParam, GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetResponse200, GetTokenInfoByIdV1ThirdpartyTokenTokenIdGetResponse422, GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetMetadataParam, GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetResponse200, GetTokenInfoV1ThirdpartyTokenTokenTypeAddressGetResponse422, GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetMetadataParam, GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetResponse200, GetTokenTimeseriesV1ThirdpartyTokensTokenIdTimeseriesGetResponse422, GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetMetadataParam, GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetResponse200, GetWalletTimeseriesV1ThirdpartyWalletAddressTimeseriesGetResponse422, ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostBodyParam, ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostMetadataParam, ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostResponse200, ListCollectionNftsV1ThirdpartyNftsCollectionsCollectionIdNftsPostResponse422, ListNftsV1ThirdpartyNftsGetMetadataParam, ListNftsV1ThirdpartyNftsGetResponse200, ListNftsV1ThirdpartyNftsGetResponse422, ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetMetadataParam, ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetResponse200, ListProtocolsV1ThirdpartyProtocolsAllProtocolsGetResponse422, ListTokensV1ThirdpartyTokensGetMetadataParam, ListTokensV1ThirdpartyTokensGetResponse200, ListTokensV1ThirdpartyTokensGetResponse422, ResolveAddressV1ThirdpartyNameServiceResolveAddressGetMetadataParam, ResolveAddressV1ThirdpartyNameServiceResolveAddressGetResponse200, ResolveAddressV1ThirdpartyNameServiceResolveAddressGetResponse422, ResolveNameV1ThirdpartyNameServiceResolveNameGetMetadataParam, ResolveNameV1ThirdpartyNameServiceResolveNameGetResponse200, ResolveNameV1ThirdpartyNameServiceResolveNameGetResponse422 } from './types';
