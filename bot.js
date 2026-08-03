const { chromium } = require('playwright');
const fs = require('fs');

const PAGE = 'https://shoppingenie.in/c/swiggy-buzzstreak';
const links = fs.readFileSync('links.txt','utf8')
  .split(/\r?\n/)
  .map(x=>x.trim())
  .filter(Boolean);

(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();

  for (let i=0;i<links.length;i++){
    console.log(`Submitting ${i+1}/${links.length}`);
    await page.goto(PAGE,{waitUntil:'networkidle'});
    await page.fill('#swiggy-buzzstreak-link', links[i]);
    await page.getByRole('button',{name:'Submit'}).click();
    await page.waitForTimeout(5000);
  }

  await browser.close();
  console.log("Done!");
})();
