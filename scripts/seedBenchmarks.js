const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 主要機種のベンチマークデータ（実測値ベース）
const BENCHMARKS = {
  // Apple 2024-2025
  ip16:     { antutu: 1650000, geekbench_single: 3400, geekbench_multi: 8400, dmark: 11500 },
  ip16plus: { antutu: 1650000, geekbench_single: 3400, geekbench_multi: 8400, dmark: 11500 },
  ip16p:    { antutu: 1850000, geekbench_single: 3600, geekbench_multi: 9200, dmark: 14500 },
  ip16pm:   { antutu: 1850000, geekbench_single: 3600, geekbench_multi: 9200, dmark: 14500 },
  ip17:     { antutu: 1900000, geekbench_single: 3700, geekbench_multi: 9500, dmark: 13000 },
  ip17air:  { antutu: 1900000, geekbench_single: 3700, geekbench_multi: 9500, dmark: 13000 },
  ip17p:    { antutu: 2100000, geekbench_single: 3900, geekbench_multi: 10500, dmark: 16000 },
  ip17pm:   { antutu: 2100000, geekbench_single: 3900, geekbench_multi: 10500, dmark: 16000 },

  // Samsung 2024-2025
  s24:      { antutu: 1700000, geekbench_single: 2250, geekbench_multi: 7100, dmark: 11000 },
  s24p:     { antutu: 1700000, geekbench_single: 2250, geekbench_multi: 7100, dmark: 11000 },
  s24u:     { antutu: 2100000, geekbench_single: 2300, geekbench_multi: 7300, dmark: 14200 },
  s25:      { antutu: 2400000, geekbench_single: 3100, geekbench_multi: 9800, dmark: 15500 },
  s25p:     { antutu: 2400000, geekbench_single: 3100, geekbench_multi: 9800, dmark: 15500 },
  s25u:     { antutu: 2500000, geekbench_single: 3200, geekbench_multi: 10200, dmark: 16500 },
  zfold7:   { antutu: 2400000, geekbench_single: 3100, geekbench_multi: 9800, dmark: 15500 },
  a55:      { antutu: 550000,  geekbench_single: 1100, geekbench_multi: 3200, dmark: 2200 },

  // Google Pixel
  p9:       { antutu: 1250000, geekbench_single: 1950, geekbench_multi: 5200, dmark: 7500 },
  p9p:      { antutu: 1350000, geekbench_single: 2000, geekbench_multi: 5500, dmark: 8000 },
  p8a:      { antutu: 1050000, geekbench_single: 1700, geekbench_multi: 4300, dmark: 5500 },

  // OnePlus
  op13:     { antutu: 2600000, geekbench_single: 3100, geekbench_multi: 9500, dmark: 16000 },
  op13r:    { antutu: 2400000, geekbench_single: 3000, geekbench_multi: 9200, dmark: 15000 },
  op12:     { antutu: 2100000, geekbench_single: 2300, geekbench_multi: 7200, dmark: 14000 },

  // Xiaomi
  xi15u:    { antutu: 2700000, geekbench_single: 3200, geekbench_multi: 9800, dmark: 16500 },
  xi15p:    { antutu: 2500000, geekbench_single: 3100, geekbench_multi: 9500, dmark: 15500 },
  xi15:     { antutu: 2400000, geekbench_single: 3000, geekbench_multi: 9200, dmark: 15000 },
  xi14u:    { antutu: 2100000, geekbench_single: 2300, geekbench_multi: 7200, dmark: 14200 },
  xi14:     { antutu: 1900000, geekbench_single: 2200, geekbench_multi: 7000, dmark: 13000 },
  rn14p:    { antutu: 700000,  geekbench_single: 1200, geekbench_multi: 3500, dmark: 3000 },

  // Sony
  xp1vi:    { antutu: 2100000, geekbench_single: 2300, geekbench_multi: 7200, dmark: 14200 },

  // Nothing
  np3a:     { antutu: 750000,  geekbench_single: 1100, geekbench_multi: 3400, dmark: 3500 },
  np2a:     { antutu: 600000,  geekbench_single: 1000, geekbench_multi: 2800, dmark: 2500 },

  // Honor
  hnmg7p:   { antutu: 2500000, geekbench_single: 3100, geekbench_multi: 9500, dmark: 16000 },
  hnmg6p:   { antutu: 2100000, geekbench_single: 2300, geekbench_multi: 7200, dmark: 14200 },

  // ASUS
  rog8p:    { antutu: 2200000, geekbench_single: 2400, geekbench_multi: 7500, dmark: 15000 },

  // Realme
  rmgt7p:   { antutu: 2500000, geekbench_single: 3100, geekbench_multi: 9500, dmark: 15500 },

  // OPPO
  opfx8u:   { antutu: 2500000, geekbench_single: 3100, geekbench_multi: 9500, dmark: 15500 },

  // Motorola
  me60p:    { antutu: 2400000, geekbench_single: 3000, geekbench_multi: 9200, dmark: 15000 },
};

async function seed() {
  const entries = Object.entries(BENCHMARKS);
  console.log(`Seeding benchmarks for ${entries.length} phones...`);

  let success = 0;
  let failed = 0;

  for (const [id, benchmarks] of entries) {
    try {
      await updateDoc(doc(db, 'phones', id), { benchmarks });
      success++;
      process.stdout.write('.');
    } catch (err) {
      failed++;
      console.error(`\nFailed ${id}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${success} updated, ${failed} failed`);
  process.exit(0);
}

seed();
