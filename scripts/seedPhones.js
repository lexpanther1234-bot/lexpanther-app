const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
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

const PHONES = [
  {
    id: 's26u',
    name: 'Galaxy S26 Ultra',
    brand: 'Samsung',
    price: 199800,
    image: '',
    specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: '320MP', battery: '5000mAh', display: '6.9" AMOLED' },
    category: 'flagship',
    releaseYear: 2026,
    scores: { overall: 98, fps: 98, camera: 99, battery: 95 },
    weight: '220g',
    charge: '60W',
    shopUrl: '',
  },
  {
    id: 's26p',
    name: 'Galaxy S26+',
    brand: 'Samsung',
    price: 169800,
    image: '',
    specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: '50MP', battery: '5000mAh', display: '6.7" AMOLED' },
    category: 'flagship',
    releaseYear: 2026,
    scores: { overall: 93, fps: 96, camera: 91, battery: 93 },
    weight: '195g',
    charge: '45W',
    shopUrl: '',
  },
  {
    id: 'xi17u',
    name: 'Xiaomi 17 Ultra',
    brand: 'Xiaomi',
    price: 159800,
    image: '',
    specs: { cpu: 'SD 8 Elite Gen5', ram: '16GB', storage: '512GB', camera: 'Leica 1inch 50MP', battery: '6200mAh', display: '6.73" AMOLED' },
    category: 'flagship',
    releaseYear: 2026,
    scores: { overall: 99, fps: 97, camera: 100, battery: 99 },
    weight: '235g',
    charge: '100W',
    shopUrl: '',
  },
  {
    id: 'op15',
    name: 'OnePlus 15',
    brand: 'OnePlus',
    price: 109800,
    image: '',
    specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '6500mAh', display: '6.82" AMOLED' },
    category: 'flagship',
    releaseYear: 2026,
    scores: { overall: 92, fps: 96, camera: 90, battery: 99 },
    weight: '213g',
    charge: '100W',
    shopUrl: '',
  },
  {
    id: 's25u',
    name: 'Galaxy S25 Ultra',
    brand: 'Samsung',
    price: 189800,
    image: '',
    specs: { cpu: 'SD 8 Elite', ram: '12GB', storage: '256GB', camera: '200MP', battery: '5000mAh', display: '6.9" AMOLED' },
    category: 'flagship',
    releaseYear: 2025,
    scores: { overall: 96, fps: 97, camera: 97, battery: 94 },
    weight: '218g',
    charge: '45W',
    shopUrl: 'https://www.samsung.com/jp/smartphones/galaxy-s25-ultra/',
  },
  {
    id: 'xi15u',
    name: 'Xiaomi 15 Ultra',
    brand: 'Xiaomi',
    price: 149800,
    image: '',
    specs: { cpu: 'SD 8 Elite', ram: '16GB', storage: '512GB', camera: 'Leica 50MP', battery: '6000mAh', display: '6.73" AMOLED' },
    category: 'flagship',
    releaseYear: 2025,
    scores: { overall: 97, fps: 96, camera: 99, battery: 98 },
    weight: '233g',
    charge: '90W',
    shopUrl: '',
  },
  {
    id: 'op13',
    name: 'OnePlus 13',
    brand: 'OnePlus',
    price: 99800,
    image: '',
    specs: { cpu: 'SD 8 Elite', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '6000mAh', display: '6.82" AMOLED' },
    category: 'flagship',
    releaseYear: 2025,
    scores: { overall: 90, fps: 95, camera: 88, battery: 97 },
    weight: '210g',
    charge: '100W',
    shopUrl: '',
  },
  {
    id: 'ip16pm',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    price: 198800,
    image: '',
    specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB', camera: '48MP', battery: '4685mAh', display: '6.9" OLED' },
    category: 'flagship',
    releaseYear: 2024,
    scores: { overall: 95, fps: 99, camera: 96, battery: 88 },
    weight: '227g',
    charge: '30W',
    shopUrl: 'https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro',
  },
  {
    id: 'ip16p',
    name: 'iPhone 16 Pro',
    brand: 'Apple',
    price: 159800,
    image: '',
    specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB', camera: '48MP', battery: '3582mAh', display: '6.3" OLED' },
    category: 'flagship',
    releaseYear: 2024,
    scores: { overall: 93, fps: 98, camera: 95, battery: 83 },
    weight: '199g',
    charge: '27W',
    shopUrl: '',
  },
  {
    id: 'p9pxl',
    name: 'Pixel 9 Pro XL',
    brand: 'Google',
    price: 179800,
    image: '',
    specs: { cpu: 'Tensor G4', ram: '16GB', storage: '256GB', camera: '50MP', battery: '5060mAh', display: '6.8" OLED' },
    category: 'flagship',
    releaseYear: 2024,
    scores: { overall: 92, fps: 89, camera: 95, battery: 93 },
    weight: '221g',
    charge: '37W',
    shopUrl: 'https://store.google.com/jp/product/pixel_9_pro',
  },
  {
    id: 'xi14u',
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    price: 139800,
    image: '',
    specs: { cpu: 'SD 8 Gen 3', ram: '16GB', storage: '512GB', camera: 'Leica 50MP', battery: '5000mAh', display: '6.73" AMOLED' },
    category: 'flagship',
    releaseYear: 2024,
    scores: { overall: 93, fps: 94, camera: 98, battery: 93 },
    weight: '229g',
    charge: '90W',
    shopUrl: 'https://www.mi.com/global/product/xiaomi-14-ultra',
  },
  {
    id: 'xp1vi',
    name: 'Xperia 1 VI',
    brand: 'Sony',
    price: 189800,
    image: '',
    specs: { cpu: 'SD 8 Gen 3', ram: '12GB', storage: '256GB', camera: '52MP', battery: '5000mAh', display: '6.5" OLED' },
    category: 'flagship',
    releaseYear: 2024,
    scores: { overall: 87, fps: 90, camera: 91, battery: 89 },
    weight: '192g',
    charge: '30W',
    shopUrl: '',
  },
];

async function seed() {
  console.log('Seeding phones collection...');
  const phonesRef = collection(db, 'phones');
  for (const phone of PHONES) {
    const { id, ...data } = phone;
    await setDoc(doc(phonesRef, id), data);
    console.log(`  ✓ ${phone.name}`);
  }
  console.log(`Done! ${PHONES.length} phones seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
