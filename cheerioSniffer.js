import { CheerioCrawler } from "crawlee";
import { Sniffer } from "./sniffer.js";


export class CheerioSniffer extends Sniffer {
    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseElapsedSeconds(context) {
        const {
            response: {
                timings: {
                    end,
                    start
                }
            }
        } = context;

        return (end - start) / 1000;
    }

    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseRX(context) {
        return context.response._downloadedSize;
    }

    /**
     * 
     * @param {import("crawlee").CheerioCrawlingContext} context 
     */
    async _getResponseTX(context) {
        return context.response._uploadedSize;
    }

    _newCrawler(options, configuration) {
        return new CheerioCrawler(options, configuration);
    }
}
