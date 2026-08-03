const { chromium } = require("playwright");
const fs = require("fs");

const PAGE = "https://shoppingenie.in/c/swiggy-buzzstreak";
const WAIT_AFTER_SUBMIT = 5000;
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

  // Log API responses
  page.on("response", async (response) => {
    try {
      const request = response.request();

      if (
        request.method() === "POST" ||
        request.resourceType() === "xhr" ||
        request.resourceType() === "fetch"
      ) {
        console.log("------------ API RESPONSE ------------");
        console.log("URL     :", response.url());
        console.log("METHOD  :", request.method());
        console.log("STATUS  :", response.status());
        console.log("--------------------------------------");
      }
    } catch {}
  });

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    let success = false;

    console.log(`\n========== ${i + 1}/${links.length} ==========`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt}`);

        await page.goto(PAGE, {
          waitUntil: "networkidle",
        });

        await page.waitForSelector("#swiggy-buzzstreak-link");

        await page.fill("#swiggy-buzzstreak-link", link);

        await page.getByRole("button", {
          name: "Submit",
        }).click();

        console.log("Submit clicked.");

        await page.waitForTimeout(WAIT_AFTER_SUBMIT);

        console.log(`Finished waiting ${WAIT_AFTER_SUBMIT / 1000}s`);

        success = true;
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

    if (success) {
      console.log("✅ Completed");
    } else {
      console.log("❌ Failed");
    }
  }

  await browser.close();

  console.log("\n========================================");
  console.log("BOT FINISHED");
  console.log("========================================");
})();