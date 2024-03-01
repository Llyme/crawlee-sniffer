import { PuppeteerCrawler } from "crawlee";
import { Sniffer } from "./sniffer.js";


export class PuppeteerSniffer extends Sniffer {
    /**
     * 
     * @param {import("crawlee").PuppeteerCrawlingContext} context 
     */
    _getResponseElapsedSeconds(context) {
        const {
            startTime,
            responseEnd
        } = context.response.timing();


        return (responseEnd - startTime) / 1000;
    }

    /**
     * 
     * @param {import("crawlee").PuppeteerCrawlingContext} context 
     */
    async _getResponseRX(context) {
        const buffer = await context.response.buffer();

        return buffer.length;
    }

    _newCrawler(options) {
        return new PuppeteerCrawler(options);
    }
}
