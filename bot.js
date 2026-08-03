const { chromium } = require("playwright");
const fs = require("fs");

const PAGE = "https://shoppingenie.in/c/swiggy-buzzstreak";

const WAIT_AFTER_SUBMIT = 5000;
const MAX_RETRIES = 3;

const links = fs
  .readFileSync("links.txt", "utf8")
  .split(/\r?\n/)
  .map(l => l.trim())
  .filter(Boolean);

(async () => {
  console.log("========================================");
  console.log("Shopping Genie Bot Started");
  console.log(`Total Links : ${links.length}`);
  console.log("========================================");

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1366,
      height: 768
    }
  });

  page.setDefaultTimeout(30000);

  for (let i = 0; i < links.length; i++) {

    const link = links[i];
    let submitted = false;

    console.log("");
    console.log(`========== ${i + 1}/${links.length} ==========`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

      try {

        console.log(`Attempt ${attempt}`);

        await page.goto(PAGE, {
          waitUntil: "networkidle"
        });

        await page.waitForSelector("#swiggy-buzzstreak-link");

        await page.fill("#swiggy-buzzstreak-link", "");

        await page.fill("#swiggy-buzzstreak-link", link);

        await page.getByRole("button", {
          name: "Submit"
        }).click();

        console.log("Submitted. Waiting 5 seconds...");

        await page.waitForTimeout(WAIT_AFTER_SUBMIT);

        console.log(`SUCCESS : ${link}`);

        submitted = true;

        break;

      } catch (err) {

        console.log(`Attempt ${attempt} failed`);

        console.log(err.message);

        if (attempt < MAX_RETRIES) {

          console.log("Retrying...");

          await page.waitForTimeout(2000);

        }

      }

    }

    if (!submitted) {

      console.log("FAILED");

      console.log(link);

    }

  }

  await browser.close();

  console.log("");
  console.log("========================================");
  console.log("BOT FINISHED");
  console.log("========================================");

})();