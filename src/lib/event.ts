import { LindaWeb } from '../lindaweb.js';
import { NodeProvider } from '../types/LindaWeb.js';
import utils from '../utils/index.js';
import { HttpProvider } from './providers/index.js';
import type { GetEventResultOptions, EventResponse } from '../types/Event.js';

export class Event {
    private lindaWeb: LindaWeb;

    constructor(lindaWeb: LindaWeb) {
        if (!lindaWeb || !(lindaWeb instanceof LindaWeb)) throw new Error('Expected instance of LindaWeb');
        this.lindaWeb = lindaWeb;
    }

    setServer(eventServer: NodeProvider, healthcheck = 'healthcheck') {
        if (!eventServer) return (this.lindaWeb.eventServer = undefined);

        if (utils.isString(eventServer)) eventServer = new HttpProvider(eventServer);

        if (!this.lindaWeb.isValidProvider(eventServer)) throw new Error('Invalid event server provided');

        this.lindaWeb.eventServer = eventServer;
        this.lindaWeb.eventServer.isConnected = () =>
            this.lindaWeb
                .eventServer!.request(healthcheck)
                .then(() => true)
                .catch(() => false);
    }

    async getEventsByContractAddress(contractAddress: string, options: GetEventResultOptions = {}) {
        const newOptions = Object.assign(
            {
                limit: 20,
            },
            options
        );
        const {
            eventName,
            blockNumber,
            onlyUnconfirmed,
            onlyConfirmed,
            minBlockTimestamp,
            maxBlockTimestamp,
            orderBy,
            fingerprint,
        } = newOptions;
        let { limit } = newOptions;

        if (!this.lindaWeb.eventServer) {
            throw new Error('No event server configured');
        }

        if (!this.lindaWeb.isAddress(contractAddress)) {
            throw new Error('Invalid contract address provided');
        }

        if (typeof minBlockTimestamp !== 'undefined' && !utils.isInteger(minBlockTimestamp)) {
            throw new Error('Invalid minBlockTimestamp provided');
        }

        if (typeof maxBlockTimestamp !== 'undefined' && !utils.isInteger(maxBlockTimestamp)) {
            throw new Error('Invalid maxBlockTimestamp provided');
        }

        if (utils.isInteger(limit) && limit > 200) {
            console.warn('Defaulting to maximum accepted limit: 200');
            limit = 200;
        }

        const qs = {} as any;

        if (eventName) qs.event_name = eventName;
        if (blockNumber) qs.block_number = blockNumber;
        if (typeof onlyUnconfirmed === 'boolean') qs.only_unconfirmed = onlyUnconfirmed;
        if (typeof onlyConfirmed === 'boolean') qs.only_confirmed = onlyConfirmed;
        if (minBlockTimestamp) qs.min_block_timestamp = minBlockTimestamp;
        if (maxBlockTimestamp) qs.max_block_timestamp = maxBlockTimestamp;
        if (orderBy) qs.order_by = orderBy;
        if (fingerprint) qs.fingerprint = fingerprint;
        if (utils.isInteger(limit)) qs.limit = limit;

        const res = await this.lindaWeb.eventServer.request<EventResponse>(
            `v1/contracts/${this.lindaWeb.address.fromHex(contractAddress)}/events?${new URLSearchParams(qs).toString()}`
        );
        if (res.success) {
            return res;
        }
        throw new Error(res.error);
    }

    async getEventsByTransactionID(
        transactionID: string,
        options: {
            only_unconfirmed?: boolean;
            only_confirmed?: boolean;
        } = {}
    ) {
        if (!this.lindaWeb.eventServer) {
            throw new Error('No event server configured');
        }

        const qs = {} as any;

        if (typeof options.only_unconfirmed === 'boolean') {
            qs.only_unconfirmed = options.only_unconfirmed;
        }

        if (typeof options.only_confirmed === 'boolean') {
            qs.only_confirmed = options.only_confirmed;
        }

        return this.lindaWeb.eventServer
            .request<EventResponse>(`v1/transactions/${transactionID}/events?${new URLSearchParams(qs).toString()}`)
            .then((res) => {
                if (res.success) {
                    return res;
                }
                throw new Error(JSON.parse(res.error!).message);
            });
    }

    async getEventsByBlockNumber(
        blockNumber: number | string,
        options: {
            only_confirmed?: boolean;
            limit?: number;
            fingerprint?: string;
        } = {}
    ) {
        if (!this.lindaWeb.eventServer) {
            throw new Error('No event server configured');
        }

        const qs = {} as any;

        if (typeof options.only_confirmed === 'boolean') {
            qs.only_confirmed = options.only_confirmed;
        }

        if (options.limit) {
            qs.limit = options.limit;
        }

        if (options.fingerprint) {
            qs.fingerprint = options.fingerprint;
        }

        return this.lindaWeb.eventServer
            .request<EventResponse>(`v1/blocks/${blockNumber}/events?${new URLSearchParams(qs).toString()}`)
            .then((res) => {
                if (res.success) {
                    return res;
                }
                throw new Error(res.error);
            });
    }

    async getEventsOfLatestBlock(
        options: {
            only_confirmed?: boolean;
        } = {}
    ) {
        if (!this.lindaWeb.eventServer) {
            throw new Error('No event server configured');
        }

        const qs = {} as any;

        if (typeof options.only_confirmed === 'boolean') {
            qs.only_confirmed = options.only_confirmed;
        }

        return this.lindaWeb.eventServer
            .request<EventResponse>(`v1/blocks/latest/events?${new URLSearchParams(qs).toString()}`)
            .then((res) => {
                if (res.success) {
                    return res;
                }
                throw new Error(res.error);
            });
    }
}
