const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Extract novel info
app.post('/extract', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('h1').first().text() || 'Unknown Title';
    const author = $('.author').first().text() || 'Unknown';
    const description = $('meta[name="description"]').attr('content') || '';

    res.json({ title, author, description, source: url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract novel' });
  }
});

// Generate PDF
app.post('/download-pdf', async (req, res) => {
  const { title, author, description } = req.body;

  const doc = new PDFDocument();
  let filename = title.replace(/\s/g, '_') + '.pdf';
  res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);
  doc.fontSize(20).text(title, { align: 'center' });
  doc.fontSize(14).text(`Author: ${author}\n\n${description}`, { align: 'left' });
  doc.end();
});

app.listen(PORT, () => {
  console.log(`✅ WebNovel Extractor backend is running on http://localhost:${PORT}`);
});
