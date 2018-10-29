import fs from 'fs';
import puppeteer from 'puppeteer';

const COUNTRY = 'uk';
const URL = `https://${COUNTRY}.lush.com/`;

/*
## MVP

Steps to scrape the ratings for all products:

1. Using Puppeteer, run a function to get all URLs from site matching these patterns:
    https://uk.lush.com/products/<CATEGORY>/<PRODUCT_NAME>/
    https://uk.lush.com/products/<PRODUCT_NAME>/
1. Store above in ./data/urls.json, maybe use page.title() to get product name
1. Go through each and grab this element:
    <div class="object-review-product-rating-right">
    <span class="size-4 bold">4.2</span>
    <span class="size-9">Average rating</span>
    </div>
1. In ./data/result.json, add the product name and average rating.
1. Present using GH pages

## Future

1. Store in a database
2. Automate entire process to run once a day/week/whenever new products are added, etc.
*/

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({
    width: 1269,
    height: 718,
  });

  await page.goto(URL);
  await page.click('a.no-link.products');
  // Test
  await page.screenshot({ path: './screenshots/page.png' });

  browser.close();
}

run();

