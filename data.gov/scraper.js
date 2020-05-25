const puppeteer = require("puppeteer");

async function Scrape(scraperUrl) {
    console.log(`scraping ${scraperUrl}`);
    let browser = await puppeteer.launch({ headless: true });
    try {
        let page = await browser.newPage();
        await page.goto(scraperUrl);
        await page.waitForSelector('#dataset-resources > ul > li > div.btn-group > a');

        // get metadata for a single DataSet/Package
        let result = await page.evaluate(() => {
            try {
                return {
                    packageTitle: document.querySelector('#content > div.row.wrapper > div > article > section:nth-child(1) > h1').innerText,
                    resources: Array.from(document.querySelectorAll('#dataset-resources > ul > li > div.btn-group > a'), el => el.href),
                    organizationTitle: document.querySelector('h1.heading').innerText.trim(),
                    //organizationTitle: document.querySelector('#content > div.row.wrapper > aside > section.module.module-narrow.publisher > p > a').innerText,
                    //organizationDescription not always available on data.gov
                    organizationImageUrl: document.querySelector('#content > div.row.wrapper > aside > div.org_type > div > section > div > a > img').src,
                };
            } catch (e) {
                console.log(e);
                return null;
            }
        });

        await browser.close()
        result.sourceUrl = scraperUrl;
        return result;

    } catch (err) {
        await browser.close();
        console.log(err);
    }
}

module.exports.Scrape = Scrape;