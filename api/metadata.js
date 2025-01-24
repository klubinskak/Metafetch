const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { getScreenshot } = require('./getScreenshot'); 

const router = express.Router();

/**
 * @swagger
 * /api/metadata:
 *   get:
 *     summary: Fetch metadata from a given URL
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *           example: https://example.com
 *         required: true
 *         description: The URL of the webpage to fetch metadata from
 *     responses:
 *       200:
 *         description: Successfully fetched metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: Invalid or missing URL parameter
 *       500:
 *         description: Failed to fetch metadata
 */
router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || null,
      image: $('meta[property="og:image"]').attr('content') || null,
      url: $('meta[property="og:url"]').attr('content') || url,
    };

    if (!metadata.image) {
      try {
        const screenshot = await getScreenshot();
        metadata.image = screenshot;

      } catch (err) {
        console.error('Error while calling getScreenshot:', err);
      }      
    }

    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});


module.exports = router;
