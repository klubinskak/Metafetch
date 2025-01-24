const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { getScreenshot } = require("./getScreenshot"); 

const router = express.Router();

/**
 * @swagger
 * /api/metadata/batch:
 *   get:
 *     summary: Fetch metadata from a list of URLs
 *     parameters:
 *       - in: query
 *         name: urls
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com", "https://google.com"]
 *         required: true
 *         description: The URLs of the webpages to fetch metadata from
 *     responses:
 *       200:
 *         description: Successfully fetched metadata for multiple URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   url:
 *                     type: string
 *       400:
 *         description: Invalid or missing URLs parameter
 *       500:
 *         description: Failed to fetch metadata
 */

router.get("/batch", async (req, res) => {
  let urls;
  const { urls: rawUrls } = req.query;

  if (!rawUrls) {
    return res.status(400).json({ error: "Missing URLs parameter" });
  }

  // Case 1: JSON-encoded array (e.g., "%5B%22...%22%5D")(Rapidapi utility)
  if (typeof rawUrls === "string") {
    try {
      urls = JSON.parse(rawUrls);
      if (!Array.isArray(urls)) urls = [rawUrls]; 
    } catch {
      urls = [rawUrls]; 
    }
  }
  
  // Case 2: Multiple query params (e.g., urls=...&urls=...)
  else if (Array.isArray(rawUrls)) {
    urls = rawUrls;
  }
  else {
    return res.status(400).json({ error: "Invalid URLs format" });
  }
  // Validate URLs
  if (!urls.every((url) => isValidUrl(url))) {
    return res.status(400).json({ error: "Invalid URL detected" });
  }

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const metadata = {
          title: $("title").text(),
          description: $('meta[name="description"]').attr("content"),
          image: $('meta[property="og:image"]').attr("content") || null,
          url: $('meta[property="og:url"]').attr("content") || url,
        };

        if (!metadata.image) {
          try {
            const screenshot = await getScreenshot();
            metadata.image = screenshot;
          } catch (err) {
            console.error("Error while calling getScreenshot:", err);
          }
        }

        return { url, metadata };
      })
    );

    res.json(results);
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { url, error: "Failed to fetch metadata" };
  }
});

module.exports = router;


// Helper function to validate URLs (Rapidapi utility)
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
