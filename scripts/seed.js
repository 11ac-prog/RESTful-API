/**
 * Windows-safe seeder for ./data/dogdata.json
 * Usage:
 *   npm run seed
 *   # or specify a custom file:
 *   npm run seed -- --file="C:\\Users\\you\\Desktop\\dogdata.json"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dog from '../dog-api/models/dataModel.js';

dotenv.config();

// Resolve file paths correctly on Windows/macOS/Linux
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support an override via --file=...
const argFile = process.argv.find(a => a.startsWith('--file='))?.split('=')[1];

// Default to project-root/data/dogdata.json
const defaultJson = path.resolve(__dirname, '..', 'data', 'dogdata.json');
const jsonPath = path.resolve(argFile || defaultJson);

const uri = "mongodb+srv://cavalcante1andre_db_user:7FeZAVCio47IvCQl@cluster0.0phdlop.mongodb.net/dogdb?appName=Cluster0";

(async () => {
  try {
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Could not find JSON file at:', jsonPath);
      console.error('   Tip: place your file at ./data/dogdata.json or pass --file="C:\\full\\path\\dogdata.json"');
      process.exit(1);
    }

    console.log('📄 Using JSON:', jsonPath);

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) {
      console.error('❌ Expected an array of dog objects in the JSON.');
      process.exit(1);
    }

    console.log('🔌 Connecting to:', uri);
    await mongoose.connect(uri);

    await Dog.deleteMany({});
    const result = await Dog.insertMany(rows);
    console.log(`✅ Seeded ${result.length} dogs`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
