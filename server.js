import fs from 'fs';
import puppeteer from 'puppeteer';

const COUNTRY = 'uk';
const baseURI = `https://${COUNTRY}.lush.com/`;

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
1. Automate entire process to run once a day/week/whenever new products are added, etc.
1. Let user choose between countries (as it defaults to UK right now) - IF ratings vary in each store
*/

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({
    width: 1269,
    height: 718,
  });

  await page.goto(baseURI);
  // Open Products menu
  await page.click('a.no-link.products');
  // Check that the click worked
  // await page.screenshot({ path: './screenshots/page.png' });

  await page.waitForSelector('li.menu-mlid-64996');

  // Listen for console.logs in browser
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });

  const submenusSelector = 'li.first.expanded.active.menu-mlid-64996 > ul.children';

  // Get all category submenu heading nodes (e.g. "Bath & Shower")
  const categoryURLs = await page.evaluate((submenusSelector) => {
    // Submenu heading and list nodes
    const submenuLists = document.querySelectorAll(submenusSelector)[0].children;

    const submenuCategoryLists = Array.from(submenuLists).map(submenu => {
      // Each list - e.g. list of links below "Bath & Shower"
      return submenu.childNodes[1];
    });

    const categoryURLsPerList = Array.from(submenuCategoryLists).map(submenuCategoryList => {
      // Get URLs
      const urls = Array.from(submenuCategoryList.children).map(listItem => {
        // Get the category URL (e.g. https://uk.lush.com/products/bath-bombs)
        const hrefValue = listItem.firstChild.getAttribute('href');

        return hrefValue.includes('https://uk.lush.com') ? hrefValue : `https://uk.lush.com${hrefValue}`;
      });

      return urls;
    });

    // Flatten categoryURLsPerList - it is an array of arrays (top level = category)
    return categoryURLsPerList.flat();
  }, submenusSelector);

  console.info('categoryURLs', categoryURLs);

  // Prune duplicates
  const uniqueCategoryURLsSet = new Set(categoryURLs);
  const uniqueCategoryURLs = Array.from(uniqueCategoryURLsSet);

  // Turn to JSON and save to ./data/categories.json
  fs.writeFileSync('./data/categoryUrls.json', '');
  fs.writeFileSync('./data/categoryUrls.json', JSON.stringify(uniqueCategoryURLs, null, 2));

  // TODO: Now, go through each category URL and get all product links. Put them into a Set

  browser.close();
}

run();

