const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("http://localhost/zamowienie");
  await page.waitForSelector(".delivery-options", { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: "checkout.png", fullPage: false });
  console.log("Screenshot saved");
  const html = await page.locator(".delivery-options").innerHTML();
  require("fs").writeFileSync("delivery-options.html", html);
  await browser.close();
})();
