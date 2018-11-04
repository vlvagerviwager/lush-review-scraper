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

1. Configure ESLint 💀
1. Add tests 💔
1. Store in a database
1. Automate entire process to run once a day/week/whenever new products are added, etc.
1. Let user choose between countries (as it defaults to UK right now) - IF ratings vary in each store
1. Add category filter
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

  // Prune duplicates
  const uniqueCategoryURLsArray = Array.from(new Set(categoryURLs));
  writeCategoryURLsToFile(uniqueCategoryURLsArray);

  // Now, go through each category URL and get all product links. Put them into a Set
  // TODO: Don't hardcode URI, loop through ./data/categoryUrls.json
  await page.goto('https://uk.lush.com/products/bath-bombs');
  await page.waitForSelector('div.body-wrapper');
  const productImageSelector = 'div.product-module-product-image';

  const productURLs = await page.evaluate((productImageSelector) => {
    const productImages = document.querySelectorAll(productImageSelector);

    const productURLs = (Array.from(productImages)).map((image) => {
      const imageAnchor = image.childNodes[1];
      productHref = imageAnchor.getAttribute('href');

      const productBaseURI = imageAnchor.baseURI;

      return productHref.includes('https://uk.lush.com') ? productHref : `https://uk.lush.com${productHref}`;
    });

    return productURLs;
  }, productImageSelector);

  // Prune duplicates
  const uniqueProductURLsArray = Array.from(new Set(productURLs));
  writeProductURLsToFile(uniqueProductURLsArray);

  // Go through each product URL and get all review scores. Store in ./data/productRatings.json
  // TODO: What if there are no reviews?
  // TODO: Don't hardcode URI, loop through ./data/productUrls.json
  await page.goto('https://uk.lush.com/products/intergalactic');
  await page.waitForSelector('div.body-wrapper');
  const reviewSelector = '[class=object-review-product-rating-right]';

  const productRating = await page.evaluate((reviewSelector) => {
    const productRatingInfo = document.querySelector(reviewSelector);

    // TODO
    const productNameSelector = 'h1.product-title';
    let productName = document.querySelector(productNameSelector).innerHTML;
    productName = productName.replace(/\n/g, '');
    const averageRating = productRatingInfo.children[0].innerHTML;


    return {
      'name': productName,
      averageRating: averageRating,
    };
  }, reviewSelector);

  console.log('productRating', productRating);

  writeProductRatingsToFile([productRating]);

  browser.close();
}

/*
 * Takes an Array of category URLs to be written to file as JSON
 */
const writeCategoryURLsToFile = (categoryURLsArray) => {
  // Turn to JSON and save to ./data/categoryUrls.json
  fs.writeFileSync('./data/categoryUrls.json', '');
  fs.writeFileSync('./data/categoryUrls.json', JSON.stringify(categoryURLsArray, null, 2));
};

/*
 * Takes an Array of product URLs to be written to file as JSON
 */
const writeProductURLsToFile = (productURLsArray) => {
  // Turn to JSON and save to ./data/productUrls.json
  fs.writeFileSync('./data/productUrls.json', '');
  fs.writeFileSync('./data/productUrls.json', JSON.stringify(productURLsArray, null, 2));
};

const writeProductRatingsToFile = (productRatingsArray) => {
  // Turn to JSON and save to ./data/productUrls.json
  fs.writeFileSync('./data/productRatings.json', '');
  fs.writeFileSync('./data/productRatings.json', JSON.stringify(productRatingsArray, null, 2));
};

run();

