import { CheerioCrawler } from "crawlee";
import { Sniffer } from "./sniffer.js";


export class CheerioSniffer extends Sniffer {
    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseElapsedSeconds(context) {
        try {
            const {
                response: {
                    timings: {
                        end,
                        start
                    }
                }
            } = context;

            return (end - start) / 1000;
        } catch (e) { }

        return -1;
    }

    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseRX(context) {
        try {
            return context.response._downloadedSize;
        } catch (e) { }

        return -1;
    }

    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseTX(context) {
        try {
            return context.response._uploadedSize;
        } catch (e) { }

        return -1;
    }

    _newCrawler(options, configuration) {
        return new CheerioCrawler(options, configuration);
    }
}
