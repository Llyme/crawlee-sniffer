import { v4 as uuidv4 } from "uuid";
import { BasicCrawler } from "crawlee";


export class Sniffer {
    constructor(kwargs = {}) {
        this.startTime = performance.now();
        this.kwargs = kwargs;
        this.datasets = {};
        this.requests = [];

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
        return 0;
    }

    /**
     * 
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _getResponseRX(context) {
        return 0;
    }

    /**
     * 
     * @param {import("crawlee").CrawlingContext} context 
     */
    async _getResponseTX(context) {
        return 0;
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
                loadedUrl
            }
        } = context;

        const {
            kwargs
        } = sniffer;

        const elapsedSeconds = await sniffer._getResponseElapsedSeconds(context);
        const rx = await sniffer._getResponseRX(context);
        const tx = await sniffer._getResponseTX(context);

        log.info(`Crawling URL '${loadedUrl}'...`);

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
            `[${elapsedSeconds.toFixed(2)}/${sniffer.lifetime.toFixed(2)}s] URL '${loadedUrl}' done.`
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
     * @returns {import("crawlee").BasicCrawlerOptions}
     */
    _getCrawlerOptions() {
        return {};
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
     * @returns {BasicCrawler} 
     */
    _newCrawler(options) {
        return new CheerioCrawler(options);
    }

    /**
     * @param {string} uniqueKey The key of the request.
     */
    getDataset(uniqueKey) {
        return this.datasets[uniqueKey];
    }

    /**
     * 
     * @param {string} label 
     * @param {string} url 
     * @param {*} payload 
     * @returns {import('crawlee').Source}
     */
    _newRequest(label, url, payload) {
        const uniqueKey = uuidv4();
        const request = {
            label,
            url,
            uniqueKey,
            userData: {
                label,
                url,
                payload,
                uniqueKey
            }
        };

        return request;
    }

    /**
     * 
     * @param {string} label 
     * @param {string} url 
     */
    addRequest(label, url, payload, dataset = {}) {
        const request = this._newRequest(
            label,
            url,
            payload
        );

        this.datasets[request.uniqueKey] = dataset;

        this.requests.push(request);

        return request;
    }

    async _afterRun() {

    }

    async run() {
        if (this.requests.length == 0)
            return;

        const self = this;

        const crawler = this._newCrawler({
            async requestHandler(context) {
                await self.#requestHandler(self, context);
            },

            ...this._getCrawlerOptions()
        });

        await crawler.addRequests(
            this.requests,
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
