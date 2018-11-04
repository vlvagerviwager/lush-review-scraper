import fs from 'fs';

/*
 * Takes an Array of category URLs to be written to file as JSON
 */
export const writeCategoryURLsToFile = (categoryURLsArray) => {
  // Turn to JSON and save to ./data/categoryUrls.json
  fs.writeFileSync('./data/categoryUrls.json', '');
  fs.writeFileSync('./data/categoryUrls.json', JSON.stringify(categoryURLsArray, null, 2));
};

/*
 * Takes an Array of product URLs to be written to file as JSON
 */
export const writeProductURLsToFile = (productURLsArray) => {
  // Turn to JSON and save to ./data/productUrls.json
  fs.writeFileSync('./data/productUrls.json', '');
  fs.writeFileSync('./data/productUrls.json', JSON.stringify(productURLsArray, null, 2));
};

/*
 * Takes an Array of product rating info to be written to file as JSON
 */
export const writeProductRatingsToFile = (productRatingsArray) => {
  // Turn to JSON and save to ./data/productUrls.json
  fs.writeFileSync('./data/productRatings.json', '');
  fs.writeFileSync('./data/productRatings.json', JSON.stringify(productRatingsArray, null, 2));
};
