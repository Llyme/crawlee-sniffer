import { v4 as uuidv4 } from "uuid";
import { BasicCrawler, Configuration } from "crawlee";


export class Sniffer {
    preventDuplicateURLs = false;

    #datasets = {};
    #payloads = {};
    #requests = [];
    #urls = [];

    constructor(kwargs = {}) {
        this.startTime = performance.now();
        this.kwargs = kwargs;

        this._initialize();
    }

    /**
     * Uses the `startTime` field.
     * 
     * @returns Seconds since the sniffer was created.
     */
    get lifetime() {
        return (performance.now() - this.startTime) / 1000;
    }

    _initialize() {
    }

    /**
     * 
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _getResponseElapsedSeconds(context) {
        return -1;
    }

    /**
     * 
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _getResponseRX(context) {
        return -1;
    }

    /**
     * 
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _getResponseTX(context) {
        return -1;
    }

    /**
     * For `preventDuplicateURLs`.
     * 
     * This will allow handled URLs to be handled again.
     */
    forgetURLs() {
        this.#urls = [];
    }

    /**
     * 
     * @param {Sniffer} sniffer
     * @param {import("crawlee").CrawlingContext} context 
     */
    async #requestHandler(sniffer, context) {
        const {
            log,
            request: {
                url
            }
        } = context;

        const {
            kwargs
        } = sniffer;

        if (sniffer.preventDuplicateURLs) {
            if (this.#urls.includes(url))
                return;

            this.#urls.push(url);
        }

        const elapsedSeconds = await sniffer._getResponseElapsedSeconds(context);
        const rx = await sniffer._getResponseRX(context);
        const tx = await sniffer._getResponseTX(context);

        log.info(`Crawling URL '${url}'...`);

        await sniffer._requestHandler({
            ...context,
            ...kwargs,
            sniffer,
            elapsedSeconds,
            rx,
            tx,
            startTime: performance.now()
        });

        log.info(
            `[${elapsedSeconds.toFixed(2)}/${sniffer.lifetime.toFixed(2)}s] URL '${url}' done.`
        );

        console.log('');
    }

    /**
     * 
     * @param {Sniffer} sniffer
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _requestHandler(context) {
    }

    /**
     * 
     * @param {Error} error 
     */
    async _crashHandler(error) {

    }

    /**
     * 
     * @returns {import("crawlee").HttpCrawlerOptions}
     */
    _getCrawlerOptions() {
        return {};
    }

    /**
     * 
     * @returns {Configuration}
     */
    _getCrawlerConfiguration() {
        return undefined;
    }

    /**
     * 
     * @returns {import("crawlee").CrawlerAddRequestsOptions}
     */
    _getCrawlerRequestOptions() {
        return {};
    }

    /**
     * @param {import("crawlee").BasicCrawlerOptions} options 
     * @param {Configuration} configuration 
     * @returns {BasicCrawler} 
     */
    _newCrawler(options, configuration) {
    }

    /**
     * @param {string} uniqueKey The key of the request.
     */
    getDataset(uniqueKey) {
        return this.#datasets[uniqueKey];
    }

    /**
     * @param {string} uniqueKey The key of the request.
     */
    getPayload(uniqueKey) {
        return this.#payloads[uniqueKey];
    }

    /**
     * 
     * @param {string} label 
     * @param {string} url 
     */
    addRequest(label, url, payload, dataset = {}) {
        const uniqueKey = uuidv4();
        const request = {
            label,
            url,
            uniqueKey,
            userData: {
                label,
                url,
                uniqueKey
            }
        };

        this.#datasets[uniqueKey] = dataset;
        this.#payloads[uniqueKey] = payload;

        this.#requests.push(request);

        return request;
    }

    async _afterRun() {

    }

    async run() {
        if (this.#requests.length == 0)
            return;

        const sniffer = this;

        const rawOptions = this._getCrawlerOptions();
        const {
            errorHandler,
            failedRequestHandler
        } = rawOptions;
        const options = {
            async requestHandler(context) {
                await sniffer.#requestHandler(sniffer, context);
            },

            ...rawOptions,

            async errorHandler(context, e) {
                if (errorHandler == null)
                    return;

                return await errorHandler(
                    {
                        ...context,
                        ...sniffer.kwargs,
                        sniffer
                    },
                    e
                );
            },

            async failedRequestHandler(context, e) {
                if (failedRequestHandler == null)
                    return;

                return await failedRequestHandler(
                    {
                        ...context,
                        ...sniffer.kwargs,
                        sniffer
                    },
                    e
                );
            }
        };

        function hookWrapper(hook) {
            return async function (context, ...args) {
                return await hook(
                    {
                        ...context,
                        ...sniffer.kwargs,
                        sniffer
                    },
                    ...args
                );
            };
        }

        if (options.preNavigationHooks != null)
            options.preNavigationHooks =
                options.preNavigationHooks.map(hookWrapper);

        if (options.postNavigationHooks != null)
            options.postNavigationHooks =
                options.postNavigationHooks.map(hookWrapper);

        const crawler = this._newCrawler(
            options,
            this._getCrawlerConfiguration()
        );

        await crawler.addRequests(
            this.#requests,
            this._getCrawlerRequestOptions()
        );

        try {
            const result = await crawler.run();

            await this._afterRun();

            return result;
        } catch (e) {
            this._crashHandler(e);
        }
    }
}
