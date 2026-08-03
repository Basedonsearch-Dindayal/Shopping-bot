# GitHub Actions Shopping Bot

Summary
-------

Automates visiting a list of URLs on a schedule using GitHub Actions. The repository contains `bot.js` which reads `links.txt` (one URL per line) and performs the configured action for each link. The workflow is intended to run on a schedule (hourly by default).

Prerequisites
-------------

- Node.js (14+ recommended)
- A GitHub repository with Actions enabled

Setup
-----

1. Edit `links.txt` and add one URL per line. Example:

	https://example.com/product-1
	https://example.com/product-2

2. Commit and push the repository to GitHub.
3. Open the repository on GitHub and go to the **Actions** tab.
4. Enable Actions for the repository if prompted.
5. Use **Run workflow** to test the workflow once; afterward it will run automatically on the schedule.

Run locally
-----------

Install dependencies and run the bot locally to verify behavior:

```bash
npm install
node bot.js
```

Scheduling
----------

The default schedule used by the workflow is `0 * * * *` (at the top of every hour). To change the frequency, update the `cron` expression in your workflow file under `.github/workflows/`.

Notes
-----

- Keep any secrets out of the repository; use GitHub Actions secrets when needed.
- This project does not require any third party backend server.
- If you want a different schedule or manual triggers, edit the workflow file in `.github/workflows/`.
