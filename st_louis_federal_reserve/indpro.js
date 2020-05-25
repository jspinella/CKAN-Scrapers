const puppeteer = require("puppeteer");
const scraperUrl = 'https://fred.stlouisfed.org/series/INDPRO'; // Industrial Production Index

async function Scrape() {
    console.log(`scraping ${scraperUrl}`);
    let browser = await puppeteer.launch({ headless: true });
    try {
        let page = await browser.newPage();
        await page.goto(scraperUrl);
        await page.waitForSelector('button[id=download-button]');
        await page.click('button[id=download-button]'); // click on Downloads button to populate DOM with CSV/XLSX URLs
        await page.waitForSelector('a.fg-csv-gtm'); // wait for resource download button to appear on DOM

        // get metadata for a single DataSet/Package
        let result = await page.evaluate(() => {
            return {
                title: document.getElementsByName('citation_title')[0].content,
                author: document.getElementsByClassName('fg-source-link-gtm')[0].innerHTML.split('<')[0].trim(), //TODO: wont work in cases where there are multiple Sources
                resource: document.querySelector('a.fg-csv-gtm').href, // Resource (eventually an array of urls to represent many Resources)
            };
        });

        await browser.close()
        result.url = scraperUrl;
        return result;

    } catch (err) {
        await browser.close();
        console.log(err);
    }
}

module.exports.Scrape = Scrape;
