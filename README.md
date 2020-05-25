# ExecutiveScrapers
 Scrapers for use with the Central Executive

## What is an Executive Scraper?
An Executive Scraper is just a web scraper that sends metadata (data about data sets) to the CentralExecutive via RabbitMQ. At the moment I am using Google's Puppeteer node package to perform the scraping (rather than Cheerio) mostly because it is more cpaable (e.g. we can automate logging into a website, going to a page behind that, and then scraping data) and I think it is more likely to "win" the battle against Cheerio long-term.

#### Scraper -> RabbitMQ -> CentralExecutive -> CKAN

Again, the scraper itself is merely responsible for sending *metadata* to the CentralExecutive. Things like the name of a data set, its author, description, last updated date, and most-importantly, the URL for the CSV/XLS file that contains the data itself. CentralExecutive will actually download the file and pair it with the metadata when sending to CKAN. Why? Message-queueing does not lend itself to transferring large files. They can do it if the file is a blob/binary array, but it's bad practice and there's no telling what snags we'll run into, especially if the file is "large" (> 100MB?). Personally I like the idea of keeping a scraper a scraper, and not a scraper/file-downloader (there may one day be a case where this is necessary - the CE can't download the file as it is behind a paywall or something like that - we'll cross that bridge if/when we come to it).

We can send over whatever metadata we'd like, but it requires updating the CentralExecutive so it knows to add it (in niche cases where a property is very specific to a single scraper, we should be able to leverage C#'s dynamic type to dynamically handle unexpected properties in the JSON Rabbit sends it, and then just put those properties in the "other data" array in the POST to CKAN).

## Scrapers and Crawlers
We want to use crawlers wherever possible. These would be more like crawlers than scrapers in that they recursively traverse entire websites and scrape each page they find that matches certain criteria (e.g. has a certain element on the page). From a dev perspective, it amounts to writing effetively one scraper to cover an entire website rather than just a single page on a website. Suffice to say, this is a BIG deal for a company that wants to scrape 10-100+ websites and will save us a lot of time, in regards to both dev maintenance and code execution time (albeit with increased risk of being 403'd). It will not always be possible to scrape datasets from a website with a crawler.

## Determine whether it is feasible to write a Crawler for a website
The number one roadblock to being able to crawl a website is the ability to navigate through the site with hyperlinks (aka links, anchor tags). Crawlers (like those used by Google, Bing and other search engines) are typically used to index websites so that we can search these websites via Google or the like, and so not all websites are all that indexable by Google's crawlers. Sometimes all Google can get is the home page. Some websites, like Facebook, put in great effort to prevent people like us from crawling and scraping users' Facebook profiles. 

Fortunately for us, government websites probably don't have time to implement such measures. Most probably don't even implement rate-limiting. Good for us!

So how do we know if we can crawl a site to find all its datasets? I like to browse the site for a bit, see just how far I can get without using their search box. Am I able to navigate to each dataset's page, one by one? If I can do it, a crawler can too. Data.gov is crawlable (and that will probably be the site I use for the crawler example). From data.gov, we can click on the hyperlink "250,795 DATASETS", and then click on "Federal Government", and then "Department of Agriculture", and then loop through each dataset (e.g. Fruit and Vegetable Prices). In this example, we are 3 loops deep. Loops within loops within a loop. Loops within loops are always a performance concern, but in this case they are necessary and probably the better choice versus recursion.

## How to make a Crawler
This is done with the aid of the npm package [headless-chrome-crawler](https://www.npmjs.com/package/headless-chrome-crawler).

## How to make a Scraper
Because puppeteer has files > 100MB in size (it is Chrome, after all), and GitHub doesn't allow files > 100MB, the node_modules folder is in the gitignore file. There are other arguments to be made for excluding the node_modules folder from Git repositories, [ultimately for cleanliness and performance reasons](https://flaviocopes.com/should-commit-node-modules-git/).  

This means that when you pull a scraper, you'll have to install the dependencies, including Puppeteer (run `npm install` in the root of the project (where package.json is).  

CKAN websites will put a Dataset/Resource's metadata in `meta` HTML tags. This makes scraping the metadata very convenient. The FRED scraper does this.  

Often a piece of data can be scraped from multiple places on a web page and it isn't immediately clear which one to use. Does it even matter which one you use? A good rule of thumb is to use the one that is easiest to scrape. For example, if you are looking for the title, and it is inside a `<div>` with `id="title"` but also in a `p.data-point > span`, you probably want to use the `<div>` with `id="title"`. The less-complex the selector/Xpath you need to use, the better.  

I think if we are going to have multiple scraper.js files (e.g. index.js now) for a single website (e.g. FRED), keeping a single scraper as terse as possible is important.

## Helpful Tips
- You can get the Xpath of an element on a page via Chrome Dev Tools by right-clicking the element in Chrome Dev Tools' Elements tab and then selecting Copy -> Copy Full Xpath. You can also get the selector from this menu.
- Websites in general are imperfect. I've seen websites that use the same id on multiple elements and so they need to be scraped via a different selector (if you getElementById but it's not what you expect, this is probably why).
