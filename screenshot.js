const express = require("express");
const puppeteer = require('puppeteer-extra');
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// Function to extract and sanitize the page name from the URL
const getPageName = (url) => {
    // Extract the last segment from the URL path
    const segments = new URL(url).pathname.split('/');
    const pageName = segments.pop(); // Get the last segment

    // Replace any remaining non-alphanumeric characters with dashes
    return pageName.replace(/[^\w.-]/g, '-');
};

const app = express();

app.get("/screenshot", async (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send("No URL provided.");
        return;
    }

    const timeout = 5000;

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeout });
        await page.setViewport({ width: 1080, height: 1024, deviceScaleFactor: 1 });

        await page.waitForTimeout(timeout);

        const filename = '${getPageName(url)}.png';

        await page.screenshot({ path: filename, fullPage: true });

        await browser.close();

        res.status(200).send('Screenshot saved as ${filename}');
    } catch (error) {
        res.status(500).send('Error: ${error.message}');
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});