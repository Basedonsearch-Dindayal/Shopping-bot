const { chromium } = require("playwright");
const fs = require("fs");

const PAGE = "https://shoppingenie.in/c/swiggy-buzzstreak";

const links = fs
  .readFileSync("links.txt", "utf8")
  .split(/\r?\n/)
  .map((x) => x.trim())
  .filter(Boolean);

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1366,
      height: 768,
    },
  });

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    console.log(`\n==========`);
    console.log(`Submitting ${i + 1}/${links.length}`);
    console.log(link);

    let success = false;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Attempt ${attempt}`);

        await page.goto(PAGE, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        await page.waitForSelector("#swiggy-buzzstreak-link", {
          timeout: 10000,
        });

        await page.fill("#swiggy-buzzstreak-link", link);

        await page.getByRole("button", {
          name: "Submit",
        }).click();

        // Wait for Thank You text
        await page.getByText(/thank/i).waitFor({
          timeout: 7000,
        });

        console.log("✅ SUCCESS");

        await page.screenshot({
          path: `success-${i + 1}.png`,
          fullPage: true,
        });

        success = true;
        break;
      } catch (err) {
        console.log("❌ Failed");

        if (attempt === 2) {
          await page.screenshot({
            path: `failed-${i + 1}.png`,
            fullPage: true,
          });

          console.log(err.message);
        } else {
          console.log("Retrying...");
        }
      }
    }

    if (!success) {
      console.log(`Skipping link ${i + 1}`);
    }

    await page.waitForTimeout(3000);
  }

  await browser.close();

  console.log("\n========================");
  console.log("BOT FINISHED");
})();