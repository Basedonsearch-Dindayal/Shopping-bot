const { chromium } = require("playwright");
const fs = require("fs");

const PAGE = "https://shoppingenie.in/c/swiggy-buzzstreak";
const API_ENDPOINT = "https://shoppingenie.in/api/collect/swiggy-buzzstreak";

const WAIT_AFTER_SUCCESS = 2000;
const MAX_RETRIES = 3;

const links = fs
  .readFileSync("links.txt", "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

(async () => {
  console.log("========================================");
  console.log("Shopping Genie Bot Started");
  console.log(`Total Links : ${links.length}`);
  console.log("========================================");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1366,
      height: 768,
    },
  });

  page.setDefaultTimeout(30000);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    console.log(`\n========== ${i + 1}/${links.length} ==========`);

    let success = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt}`);

        await page.goto(PAGE, {
          waitUntil: "networkidle",
        });

        await page.waitForSelector("#swiggy-buzzstreak-link");

        await page.fill("#swiggy-buzzstreak-link", link);

        // Wait for the exact POST request
        const responsePromise = page.waitForResponse((response) => {
          return (
            response.url() === API_ENDPOINT &&
            response.request().method() === "POST"
          );
        });

        await page.getByRole("button", {
          name: "Submit",
        }).click();

        const response = await responsePromise;

        if (response.status() !== 200) {
          throw new Error(
            `Submission failed. Server returned ${response.status()}`
          );
        }

        console.log("✅ Submission Accepted (HTTP 200)");

        success = true;
        successCount++;

        await page.waitForTimeout(WAIT_AFTER_SUCCESS);

        break;
      } catch (err) {
        console.log(`❌ Attempt ${attempt} failed`);
        console.log(err.message);

        if (attempt < MAX_RETRIES) {
          console.log("Retrying in 2 seconds...");
          await page.waitForTimeout(2000);
        }
      }
    }

    if (!success) {
      failedCount++;
      console.log("❌ Failed after all retries");
      console.log(link);
    }
  }

  console.log("\n========================================");
  console.log("BOT FINISHED");
  console.log("========================================");
  console.log(`✅ Successful : ${successCount}`);
  console.log(`❌ Failed     : ${failedCount}`);

  await browser.close();
})();