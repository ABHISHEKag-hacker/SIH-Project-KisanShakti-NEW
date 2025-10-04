// server/server.js (Corrected with proper Jimp import)

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';
import { convert } from 'pdf-poppler';
import * as Jimp from 'jimp'; // CORRECTED: Import all of 'jimp' as Jimp

const app = express();
const port = 5174;

const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3';

const getOllamaResponse = async (prompt) => {
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json',
        }),
    });
    if (!response.ok) throw new Error(`Ollama API responded with status: ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.response);
};

app.post('/api/analyze-soil-report', upload.single('soilReport'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    let imagePath = req.file.path;
    let text = '';

    try {
        if (req.file.mimetype === 'application/pdf') {
            console.log('PDF detected. Converting to image...');
            const outputPngPath = `${req.file.path}.png`;
            
            const opts = {
                format: 'png',
                out_dir: path.dirname(outputPngPath),
                out_prefix: path.basename(outputPngPath, '.png'),
                page: 1,
                scale_to: 2048
            };

            await convert(req.file.path, opts);
            imagePath = outputPngPath;
            console.log('PDF converted successfully to:', imagePath);
        }
        
        const image = await Jimp.read(imagePath);
        await image.greyscale().contrast(0.5).writeAsync(imagePath);
        console.log('Image pre-processing complete.');

        console.log(`Performing OCR on: ${imagePath}`);
        const { data } = await Tesseract.recognize(imagePath, 'eng');
        text = data.text;

        if (!text || text.trim().length < 10) {
          return res.status(400).json({ error: 'Could not extract meaningful text.' });
        }
        console.log("Extracted Text:", text);

        console.log("Sending text to Ollama for data extraction...");
        const promptForDataExtraction = `
            You are an expert agricultural soil scientist...
            Extracted text: """${text}"""
        `;
        const parsedData = await getOllamaResponse(promptForDataExtraction);
        console.log("Parsed Soil Data from Ollama:", parsedData);

        console.log("Sending data to Ollama for recommendations...");
        const promptForRecommendations = `
            Based on the following structured soil data...
            Soil data: ${JSON.stringify(parsedData.soilData, null, 2)}
        `;
        const parsedRecommendations = await getOllamaResponse(promptForRecommendations);
        console.log("Generated Recommendations from Ollama:", parsedRecommendations);

        res.json({
            soilData: parsedData.soilData,
            recommendations: parsedRecommendations.recommendations,
        });

    } catch (error) {
        console.error('Error in /api/analyze-soil-report:', error);
        res.status(500).json({ error: 'An error occurred during analysis. Check server logs.' });

    } finally {
        console.log("Cleaning up temporary files...");
        await fs.unlink(req.file.path).catch(e => console.error("Couldn't unlink original file", e));
        if (imagePath !== req.file.path) {
            await fs.unlink(imagePath).catch(e => console.error("Couldn't unlink converted image", e));
        }
    }
});

app.listen(port, () => {
    console.log(`✅ Server for Kisan Shakti listening at http://localhost:${port}`);
});