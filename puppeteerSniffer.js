import { PuppeteerCrawler } from "crawlee";
import { Sniffer } from "./sniffer.js";


export class PuppeteerSniffer extends Sniffer {
    /**
     * 
     * @param {import("crawlee").PuppeteerCrawlingContext} context 
     */
    _getResponseElapsedSeconds(context) {
        try {
            const {
                receiveHeadersEnd,
                sendEnd
            } = context.response.timing();


            return (receiveHeadersEnd - sendEnd) / 1000;
        } catch (e) { }

        return -1;
    }

    /**
     * 
     * @param {import("crawlee").PuppeteerCrawlingContext} context 
     */
    async _getResponseRX(context) {
        try {
            const buffer = await context.response.buffer();

            return buffer.length;
        } catch (e) { }

        return -1;
    }

    _newCrawler(options, configuration) {
        return new PuppeteerCrawler(options, configuration);
    }
}
