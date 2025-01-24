const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const sharp = require('sharp'); 

async function getScreenshot() {
  try {
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      executablePath: executablePath, 
      args: chromium.args,           // Ensure serverless args are included
      headless: true,              
    });

    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com');

    const screenshot = await page.screenshot();

    await browser.close();

    const compressedImage = await sharp(screenshot)
      .resize(200) // resitze to 200px
      .jpeg({ quality: 50 }) // convert to JPEG with 50% quality
      .toBuffer(); 

    const base64Screenshot = compressedImage.toString('base64');
    
    return base64Screenshot;
  } catch (error) {
    console.error('Error during browser setup or screenshot generation:', error);
    throw error; 
  }
}

module.exports = { getScreenshot };
