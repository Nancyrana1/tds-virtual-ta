// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeDiscourse(startDate, endDate) {
  const baseUrl = 'https://discourse.onlinedegree.iitm.ac.in';
  const category = '/c/tools-in-data-science'; // Modify if needed
  const results = [];

  for (let page = 0; page < 3; page++) {
    const url = `${baseUrl}${category}?page=${page}`;
    console.log(`Scraping ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('a.title').each((_, el) => {
      const title = $(el).text().trim();
      const link = baseUrl + $(el).attr('href');
      results.push({ title, link });
    });
  }

  fs.writeFileSync('discourse.json', JSON.stringify(results, null, 2));
  console.log('Scraping complete. Data saved to discourse.json');
}

scrapeDiscourse('2025-01-01', '2025-04-14');
