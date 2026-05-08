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
  // ──────────────────────────────────────────────
  // Apple iPhone
  // ──────────────────────────────────────────────

  // 2020 — iPhone 12 series
  { id: 'ip12', name: 'iPhone 12', brand: 'Apple', price: 94380, image: '', specs: { cpu: 'A14 Bionic', ram: '4GB', storage: '64GB', camera: '12MP', battery: '2815mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2020, scores: { overall: 82, fps: 84, camera: 83, battery: 70 }, weight: '162g', charge: '20W', shopUrl: '' },
  { id: 'ip12mini', name: 'iPhone 12 mini', brand: 'Apple', price: 82280, image: '', specs: { cpu: 'A14 Bionic', ram: '4GB', storage: '64GB', camera: '12MP', battery: '2227mAh', display: '5.4" OLED' }, category: 'flagship', releaseYear: 2020, scores: { overall: 80, fps: 84, camera: 83, battery: 60 }, weight: '133g', charge: '20W', shopUrl: '' },
  { id: 'ip12p', name: 'iPhone 12 Pro', brand: 'Apple', price: 117480, image: '', specs: { cpu: 'A14 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '2815mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2020, scores: { overall: 85, fps: 86, camera: 88, battery: 72 }, weight: '187g', charge: '20W', shopUrl: '' },
  { id: 'ip12pm', name: 'iPhone 12 Pro Max', brand: 'Apple', price: 129580, image: '', specs: { cpu: 'A14 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '3687mAh', display: '6.7" OLED' }, category: 'flagship', releaseYear: 2020, scores: { overall: 87, fps: 86, camera: 90, battery: 78 }, weight: '226g', charge: '20W', shopUrl: '' },

  // 2021 — iPhone 13 series
  { id: 'ip13', name: 'iPhone 13', brand: 'Apple', price: 98800, image: '', specs: { cpu: 'A15 Bionic', ram: '4GB', storage: '128GB', camera: '12MP', battery: '3227mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2021, scores: { overall: 85, fps: 88, camera: 85, battery: 78 }, weight: '173g', charge: '20W', shopUrl: '' },
  { id: 'ip13mini', name: 'iPhone 13 mini', brand: 'Apple', price: 86800, image: '', specs: { cpu: 'A15 Bionic', ram: '4GB', storage: '128GB', camera: '12MP', battery: '2406mAh', display: '5.4" OLED' }, category: 'flagship', releaseYear: 2021, scores: { overall: 83, fps: 88, camera: 85, battery: 65 }, weight: '140g', charge: '20W', shopUrl: '' },
  { id: 'ip13p', name: 'iPhone 13 Pro', brand: 'Apple', price: 122800, image: '', specs: { cpu: 'A15 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '3095mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 89, fps: 91, camera: 91, battery: 77 }, weight: '203g', charge: '20W', shopUrl: '' },
  { id: 'ip13pm', name: 'iPhone 13 Pro Max', brand: 'Apple', price: 134800, image: '', specs: { cpu: 'A15 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '4352mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 91, fps: 91, camera: 92, battery: 86 }, weight: '238g', charge: '20W', shopUrl: '' },

  // 2022 — iPhone 14 series
  { id: 'ip14', name: 'iPhone 14', brand: 'Apple', price: 119800, image: '', specs: { cpu: 'A15 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '3279mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2022, scores: { overall: 86, fps: 88, camera: 86, battery: 79 }, weight: '172g', charge: '20W', shopUrl: '' },
  { id: 'ip14plus', name: 'iPhone 14 Plus', brand: 'Apple', price: 134800, image: '', specs: { cpu: 'A15 Bionic', ram: '6GB', storage: '128GB', camera: '12MP', battery: '4325mAh', display: '6.7" OLED' }, category: 'flagship', releaseYear: 2022, scores: { overall: 87, fps: 88, camera: 86, battery: 87 }, weight: '203g', charge: '20W', shopUrl: '' },
  { id: 'ip14p', name: 'iPhone 14 Pro', brand: 'Apple', price: 149800, image: '', specs: { cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', camera: '48MP', battery: '3200mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 91, fps: 93, camera: 93, battery: 78 }, weight: '206g', charge: '20W', shopUrl: '' },
  { id: 'ip14pm', name: 'iPhone 14 Pro Max', brand: 'Apple', price: 164800, image: '', specs: { cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', camera: '48MP', battery: '4323mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 93, fps: 94, camera: 94, battery: 87 }, weight: '240g', charge: '20W', shopUrl: '' },

  // 2023 — iPhone 15 series
  { id: 'ip15', name: 'iPhone 15', brand: 'Apple', price: 124800, image: '', specs: { cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', camera: '48MP', battery: '3349mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2023, scores: { overall: 88, fps: 90, camera: 89, battery: 80 }, weight: '171g', charge: '20W', shopUrl: '' },
  { id: 'ip15plus', name: 'iPhone 15 Plus', brand: 'Apple', price: 139800, image: '', specs: { cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', camera: '48MP', battery: '4383mAh', display: '6.7" OLED' }, category: 'flagship', releaseYear: 2023, scores: { overall: 89, fps: 90, camera: 89, battery: 88 }, weight: '201g', charge: '20W', shopUrl: '' },
  { id: 'ip15p', name: 'iPhone 15 Pro', brand: 'Apple', price: 159800, image: '', specs: { cpu: 'A17 Pro', ram: '8GB', storage: '128GB', camera: '48MP', battery: '3274mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 93, fps: 96, camera: 94, battery: 80 }, weight: '187g', charge: '20W', shopUrl: '' },
  { id: 'ip15pm', name: 'iPhone 15 Pro Max', brand: 'Apple', price: 189800, image: '', specs: { cpu: 'A17 Pro', ram: '8GB', storage: '256GB', camera: '48MP', battery: '4422mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 95, fps: 97, camera: 95, battery: 88 }, weight: '221g', charge: '20W', shopUrl: '' },

  // 2024 — iPhone 16 series
  { id: 'ip16', name: 'iPhone 16', brand: 'Apple', price: 124800, image: '', specs: { cpu: 'A18', ram: '8GB', storage: '128GB', camera: '48MP', battery: '3561mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2024, scores: { overall: 90, fps: 93, camera: 90, battery: 82 }, weight: '170g', charge: '25W', shopUrl: '' },
  { id: 'ip16plus', name: 'iPhone 16 Plus', brand: 'Apple', price: 139800, image: '', specs: { cpu: 'A18', ram: '8GB', storage: '128GB', camera: '48MP', battery: '4674mAh', display: '6.7" OLED' }, category: 'flagship', releaseYear: 2024, scores: { overall: 91, fps: 93, camera: 90, battery: 89 }, weight: '199g', charge: '25W', shopUrl: '' },
  { id: 'ip16p', name: 'iPhone 16 Pro', brand: 'Apple', price: 159800, image: '', specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB', camera: '48MP', battery: '3582mAh', display: '6.3" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 93, fps: 98, camera: 95, battery: 83 }, weight: '199g', charge: '27W', shopUrl: '' },
  { id: 'ip16pm', name: 'iPhone 16 Pro Max', brand: 'Apple', price: 198800, image: '', specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB', camera: '48MP', battery: '4685mAh', display: '6.9" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 95, fps: 99, camera: 96, battery: 88 }, weight: '227g', charge: '30W', shopUrl: 'https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro' },

  // ──────────────────────────────────────────────
  // Samsung Galaxy S series
  // ──────────────────────────────────────────────

  // 2020 — Galaxy S20 series
  { id: 's20', name: 'Galaxy S20', brand: 'Samsung', price: 102960, image: '', specs: { cpu: 'Exynos 990', ram: '12GB', storage: '128GB', camera: '12MP', battery: '4000mAh', display: '6.2" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 82, fps: 83, camera: 84, battery: 78 }, weight: '163g', charge: '25W', shopUrl: '' },
  { id: 's20p', name: 'Galaxy S20+', brand: 'Samsung', price: 114840, image: '', specs: { cpu: 'Exynos 990', ram: '12GB', storage: '128GB', camera: '12MP', battery: '4500mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 84, fps: 83, camera: 85, battery: 82 }, weight: '186g', charge: '25W', shopUrl: '' },
  { id: 's20u', name: 'Galaxy S20 Ultra', brand: 'Samsung', price: 136620, image: '', specs: { cpu: 'Exynos 990', ram: '12GB', storage: '128GB', camera: '108MP', battery: '5000mAh', display: '6.9" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 86, fps: 84, camera: 89, battery: 84 }, weight: '220g', charge: '45W', shopUrl: '' },

  // 2021 — Galaxy S21 series
  { id: 's21', name: 'Galaxy S21', brand: 'Samsung', price: 99800, image: '', specs: { cpu: 'Exynos 2100', ram: '8GB', storage: '256GB', camera: '12MP', battery: '4000mAh', display: '6.2" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 84, fps: 86, camera: 85, battery: 79 }, weight: '169g', charge: '25W', shopUrl: '' },
  { id: 's21p', name: 'Galaxy S21+', brand: 'Samsung', price: 118800, image: '', specs: { cpu: 'Exynos 2100', ram: '8GB', storage: '256GB', camera: '12MP', battery: '4800mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 86, fps: 86, camera: 86, battery: 84 }, weight: '200g', charge: '25W', shopUrl: '' },
  { id: 's21u', name: 'Galaxy S21 Ultra', brand: 'Samsung', price: 151800, image: '', specs: { cpu: 'Exynos 2100', ram: '12GB', storage: '256GB', camera: '108MP', battery: '5000mAh', display: '6.8" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 90, fps: 88, camera: 93, battery: 86 }, weight: '227g', charge: '25W', shopUrl: '' },

  // 2022 — Galaxy S22 series
  { id: 's22', name: 'Galaxy S22', brand: 'Samsung', price: 99800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '8GB', storage: '256GB', camera: '50MP', battery: '3700mAh', display: '6.1" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 85, fps: 88, camera: 87, battery: 74 }, weight: '167g', charge: '25W', shopUrl: '' },
  { id: 's22p', name: 'Galaxy S22+', brand: 'Samsung', price: 122800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.6" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 87, fps: 88, camera: 88, battery: 82 }, weight: '195g', charge: '45W', shopUrl: '' },
  { id: 's22u', name: 'Galaxy S22 Ultra', brand: 'Samsung', price: 159800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: '108MP', battery: '5000mAh', display: '6.8" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 91, fps: 90, camera: 94, battery: 86 }, weight: '228g', charge: '45W', shopUrl: '' },

  // 2023 — Galaxy S23 series
  { id: 's23', name: 'Galaxy S23', brand: 'Samsung', price: 114800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB', camera: '50MP', battery: '3900mAh', display: '6.1" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 87, fps: 91, camera: 88, battery: 78 }, weight: '168g', charge: '25W', shopUrl: '' },
  { id: 's23p', name: 'Galaxy S23+', brand: 'Samsung', price: 134800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4700mAh', display: '6.6" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 89, fps: 91, camera: 89, battery: 85 }, weight: '195g', charge: '45W', shopUrl: '' },
  { id: 's23u', name: 'Galaxy S23 Ultra', brand: 'Samsung', price: 164800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: '200MP', battery: '5000mAh', display: '6.8" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 93, fps: 93, camera: 96, battery: 88 }, weight: '233g', charge: '45W', shopUrl: '' },

  // 2024 — Galaxy S24 series
  { id: 's24', name: 'Galaxy S24', brand: 'Samsung', price: 124800, image: '', specs: { cpu: 'Exynos 2400', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4000mAh', display: '6.2" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 88, fps: 90, camera: 89, battery: 80 }, weight: '167g', charge: '25W', shopUrl: '' },
  { id: 's24p', name: 'Galaxy S24+', brand: 'Samsung', price: 144800, image: '', specs: { cpu: 'Exynos 2400', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4900mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 90, fps: 91, camera: 90, battery: 86 }, weight: '196g', charge: '45W', shopUrl: '' },
  { id: 's24u', name: 'Galaxy S24 Ultra', brand: 'Samsung', price: 189800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: '200MP', battery: '5000mAh', display: '6.8" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 95, fps: 95, camera: 97, battery: 90 }, weight: '232g', charge: '45W', shopUrl: '' },

  // 2025 — Galaxy S25 series
  { id: 's25', name: 'Galaxy S25', brand: 'Samsung', price: 124800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4000mAh', display: '6.2" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 90, fps: 93, camera: 90, battery: 82 }, weight: '162g', charge: '25W', shopUrl: '' },
  { id: 's25p', name: 'Galaxy S25+', brand: 'Samsung', price: 154800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4900mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 93, fps: 95, camera: 92, battery: 88 }, weight: '190g', charge: '45W', shopUrl: '' },
  { id: 's25u', name: 'Galaxy S25 Ultra', brand: 'Samsung', price: 189800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', camera: '200MP', battery: '5000mAh', display: '6.9" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 96, fps: 97, camera: 97, battery: 94 }, weight: '218g', charge: '45W', shopUrl: 'https://www.samsung.com/jp/smartphones/galaxy-s25-ultra/' },

  // 2026 — Galaxy S26 series (speculative)
  { id: 's26u', name: 'Galaxy S26 Ultra', brand: 'Samsung', price: 199800, image: '', specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: '320MP', battery: '5000mAh', display: '6.9" AMOLED' }, category: 'flagship', releaseYear: 2026, scores: { overall: 98, fps: 98, camera: 99, battery: 95 }, weight: '220g', charge: '60W', shopUrl: '' },
  { id: 's26p', name: 'Galaxy S26+', brand: 'Samsung', price: 169800, image: '', specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: '50MP', battery: '5000mAh', display: '6.7" AMOLED' }, category: 'flagship', releaseYear: 2026, scores: { overall: 93, fps: 96, camera: 91, battery: 93 }, weight: '195g', charge: '45W', shopUrl: '' },

  // Samsung Galaxy A series (midrange)
  { id: 'a51', name: 'Galaxy A51', brand: 'Samsung', price: 41800, image: '', specs: { cpu: 'Exynos 9611', ram: '6GB', storage: '128GB', camera: '48MP', battery: '4000mAh', display: '6.5" AMOLED' }, category: 'midrange', releaseYear: 2020, scores: { overall: 62, fps: 52, camera: 60, battery: 75 }, weight: '172g', charge: '15W', shopUrl: '' },
  { id: 'a52', name: 'Galaxy A52', brand: 'Samsung', price: 43800, image: '', specs: { cpu: 'Snapdragon 720G', ram: '6GB', storage: '128GB', camera: '64MP', battery: '4500mAh', display: '6.5" AMOLED 90Hz' }, category: 'midrange', releaseYear: 2021, scores: { overall: 65, fps: 55, camera: 65, battery: 80 }, weight: '189g', charge: '25W', shopUrl: '' },
  { id: 'a52s', name: 'Galaxy A52s 5G', brand: 'Samsung', price: 53800, image: '', specs: { cpu: 'Snapdragon 778G', ram: '6GB', storage: '128GB', camera: '64MP', battery: '4500mAh', display: '6.5" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2021, scores: { overall: 70, fps: 65, camera: 66, battery: 80 }, weight: '189g', charge: '25W', shopUrl: '' },
  { id: 'a53', name: 'Galaxy A53 5G', brand: 'Samsung', price: 53800, image: '', specs: { cpu: 'Exynos 1280', ram: '6GB', storage: '128GB', camera: '64MP', battery: '5000mAh', display: '6.5" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 67, fps: 58, camera: 64, battery: 85 }, weight: '189g', charge: '25W', shopUrl: '' },
  { id: 'a54', name: 'Galaxy A54 5G', brand: 'Samsung', price: 59800, image: '', specs: { cpu: 'Exynos 1380', ram: '6GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.4" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 70, fps: 62, camera: 68, battery: 86 }, weight: '202g', charge: '25W', shopUrl: '' },
  { id: 'a55', name: 'Galaxy A55 5G', brand: 'Samsung', price: 59800, image: '', specs: { cpu: 'Exynos 1480', ram: '8GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.6" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 73, fps: 65, camera: 70, battery: 87 }, weight: '213g', charge: '25W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Google Pixel
  // ──────────────────────────────────────────────

  // 2020 — Pixel 5
  { id: 'p5', name: 'Pixel 5', brand: 'Google', price: 74800, image: '', specs: { cpu: 'Snapdragon 765G', ram: '8GB', storage: '128GB', camera: '12.2MP', battery: '4080mAh', display: '6.0" OLED 90Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 78, fps: 65, camera: 85, battery: 82 }, weight: '151g', charge: '18W', shopUrl: '' },

  // 2021 — Pixel 6 series
  { id: 'p6', name: 'Pixel 6', brand: 'Google', price: 74800, image: '', specs: { cpu: 'Google Tensor', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4614mAh', display: '6.4" OLED 90Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 82, fps: 72, camera: 89, battery: 82 }, weight: '207g', charge: '30W', shopUrl: '' },
  { id: 'p6p', name: 'Pixel 6 Pro', brand: 'Google', price: 116600, image: '', specs: { cpu: 'Google Tensor', ram: '12GB', storage: '128GB', camera: '50MP', battery: '5003mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 85, fps: 74, camera: 92, battery: 84 }, weight: '210g', charge: '30W', shopUrl: '' },

  // 2022 — Pixel 7 series
  { id: 'p7', name: 'Pixel 7', brand: 'Google', price: 82500, image: '', specs: { cpu: 'Google Tensor G2', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4355mAh', display: '6.3" OLED 90Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 84, fps: 75, camera: 90, battery: 80 }, weight: '197g', charge: '30W', shopUrl: '' },
  { id: 'p7p', name: 'Pixel 7 Pro', brand: 'Google', price: 124300, image: '', specs: { cpu: 'Google Tensor G2', ram: '12GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 87, fps: 77, camera: 93, battery: 84 }, weight: '212g', charge: '30W', shopUrl: '' },
  { id: 'p7a', name: 'Pixel 7a', brand: 'Google', price: 62700, image: '', specs: { cpu: 'Google Tensor G2', ram: '8GB', storage: '128GB', camera: '64MP', battery: '4385mAh', display: '6.1" OLED 90Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 80, fps: 72, camera: 85, battery: 79 }, weight: '193g', charge: '18W', shopUrl: '' },

  // 2023 — Pixel 8 series
  { id: 'p8', name: 'Pixel 8', brand: 'Google', price: 112900, image: '', specs: { cpu: 'Google Tensor G3', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4575mAh', display: '6.2" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 87, fps: 80, camera: 92, battery: 83 }, weight: '187g', charge: '27W', shopUrl: '' },
  { id: 'p8p', name: 'Pixel 8 Pro', brand: 'Google', price: 159900, image: '', specs: { cpu: 'Google Tensor G3', ram: '12GB', storage: '128GB', camera: '50MP', battery: '5050mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 90, fps: 82, camera: 94, battery: 87 }, weight: '213g', charge: '30W', shopUrl: '' },
  { id: 'p8a', name: 'Pixel 8a', brand: 'Google', price: 72600, image: '', specs: { cpu: 'Google Tensor G3', ram: '8GB', storage: '128GB', camera: '64MP', battery: '4492mAh', display: '6.1" OLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 83, fps: 76, camera: 87, battery: 81 }, weight: '188g', charge: '18W', shopUrl: '' },

  // 2024 — Pixel 9 series
  { id: 'p9', name: 'Pixel 9', brand: 'Google', price: 128900, image: '', specs: { cpu: 'Google Tensor G4', ram: '12GB', storage: '128GB', camera: '50MP', battery: '4700mAh', display: '6.3" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 89, fps: 84, camera: 93, battery: 86 }, weight: '198g', charge: '27W', shopUrl: '' },
  { id: 'p9p', name: 'Pixel 9 Pro', brand: 'Google', price: 159900, image: '', specs: { cpu: 'Google Tensor G4', ram: '16GB', storage: '128GB', camera: '50MP', battery: '4700mAh', display: '6.3" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 91, fps: 86, camera: 95, battery: 86 }, weight: '199g', charge: '27W', shopUrl: 'https://store.google.com/jp/product/pixel_9_pro' },
  { id: 'p9pxl', name: 'Pixel 9 Pro XL', brand: 'Google', price: 179800, image: '', specs: { cpu: 'Google Tensor G4', ram: '16GB', storage: '256GB', camera: '50MP', battery: '5060mAh', display: '6.8" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 92, fps: 89, camera: 95, battery: 93 }, weight: '221g', charge: '37W', shopUrl: 'https://store.google.com/jp/product/pixel_9_pro' },

  // ──────────────────────────────────────────────
  // Sony Xperia
  // ──────────────────────────────────────────────

  // Xperia 1 series (flagship)
  { id: 'xp1iii', name: 'Xperia 1 III', brand: 'Sony', price: 154000, image: '', specs: { cpu: 'Snapdragon 888', ram: '12GB', storage: '256GB', camera: '12MP', battery: '4500mAh', display: '6.5" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 85, fps: 86, camera: 88, battery: 78 }, weight: '186g', charge: '30W', shopUrl: '' },
  { id: 'xp1iv', name: 'Xperia 1 IV', brand: 'Sony', price: 174900, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: '12MP', battery: '5000mAh', display: '6.5" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 87, fps: 88, camera: 89, battery: 82 }, weight: '185g', charge: '30W', shopUrl: '' },
  { id: 'xp1v', name: 'Xperia 1 V', brand: 'Sony', price: 194700, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: '52MP', battery: '5000mAh', display: '6.5" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 89, fps: 90, camera: 92, battery: 85 }, weight: '187g', charge: '30W', shopUrl: '' },
  { id: 'xp1vi', name: 'Xperia 1 VI', brand: 'Sony', price: 189800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: '52MP', battery: '5000mAh', display: '6.5" OLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 87, fps: 90, camera: 91, battery: 89 }, weight: '192g', charge: '30W', shopUrl: '' },

  // Xperia 5 series (compact flagship)
  { id: 'xp5iii', name: 'Xperia 5 III', brand: 'Sony', price: 114400, image: '', specs: { cpu: 'Snapdragon 888', ram: '8GB', storage: '128GB', camera: '12MP', battery: '4500mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 82, fps: 84, camera: 85, battery: 80 }, weight: '168g', charge: '30W', shopUrl: '' },
  { id: 'xp5iv', name: 'Xperia 5 IV', brand: 'Sony', price: 119900, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '8GB', storage: '128GB', camera: '12MP', battery: '5000mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 84, fps: 86, camera: 86, battery: 84 }, weight: '172g', charge: '30W', shopUrl: '' },
  { id: 'xp5v', name: 'Xperia 5 V', brand: 'Sony', price: 139700, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '128GB', camera: '52MP', battery: '5000mAh', display: '6.1" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 86, fps: 88, camera: 89, battery: 86 }, weight: '182g', charge: '30W', shopUrl: '' },

  // Xperia 10 series (midrange)
  { id: 'xp10iv', name: 'Xperia 10 IV', brand: 'Sony', price: 60500, image: '', specs: { cpu: 'Snapdragon 695', ram: '6GB', storage: '128GB', camera: '12MP', battery: '5000mAh', display: '6.0" OLED' }, category: 'midrange', releaseYear: 2022, scores: { overall: 60, fps: 48, camera: 58, battery: 88 }, weight: '159g', charge: '18W', shopUrl: '' },
  { id: 'xp10v', name: 'Xperia 10 V', brand: 'Sony', price: 67100, image: '', specs: { cpu: 'Snapdragon 695', ram: '6GB', storage: '128GB', camera: '48MP', battery: '5000mAh', display: '6.1" OLED' }, category: 'midrange', releaseYear: 2023, scores: { overall: 62, fps: 50, camera: 62, battery: 89 }, weight: '159g', charge: '18W', shopUrl: '' },
  { id: 'xp10vi', name: 'Xperia 10 VI', brand: 'Sony', price: 69300, image: '', specs: { cpu: 'Snapdragon 6 Gen 1', ram: '6GB', storage: '128GB', camera: '48MP', battery: '5000mAh', display: '6.1" OLED' }, category: 'midrange', releaseYear: 2024, scores: { overall: 65, fps: 55, camera: 63, battery: 90 }, weight: '164g', charge: '18W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Xiaomi (flagship)
  // ──────────────────────────────────────────────

  // Xiaomi 12 series (2022)
  { id: 'xi12', name: 'Xiaomi 12', brand: 'Xiaomi', price: 89800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.28" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 83, fps: 86, camera: 84, battery: 78 }, weight: '180g', charge: '67W', shopUrl: '' },
  { id: 'xi12p', name: 'Xiaomi 12 Pro', brand: 'Xiaomi', price: 109800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 86, fps: 88, camera: 88, battery: 79 }, weight: '205g', charge: '120W', shopUrl: '' },

  // Xiaomi 13 series (2023)
  { id: 'xi13', name: 'Xiaomi 13', brand: 'Xiaomi', price: 99800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB', camera: 'Leica 50MP', battery: '4500mAh', display: '6.36" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 88, fps: 90, camera: 90, battery: 80 }, weight: '185g', charge: '67W', shopUrl: '' },
  { id: 'xi13p', name: 'Xiaomi 13 Pro', brand: 'Xiaomi', price: 129800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: 'Leica 50MP 1inch', battery: '4820mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 91, fps: 92, camera: 95, battery: 83 }, weight: '229g', charge: '120W', shopUrl: '' },
  { id: 'xi13u', name: 'Xiaomi 13 Ultra', brand: 'Xiaomi', price: 149800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '16GB', storage: '512GB', camera: 'Leica 50MP 1inch', battery: '5000mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 93, fps: 92, camera: 97, battery: 86 }, weight: '227g', charge: '90W', shopUrl: '' },

  // Xiaomi 14 series (2024)
  { id: 'xi14', name: 'Xiaomi 14', brand: 'Xiaomi', price: 109800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: 'Leica 50MP', battery: '4610mAh', display: '6.36" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 90, fps: 93, camera: 92, battery: 82 }, weight: '188g', charge: '90W', shopUrl: '' },
  { id: 'xi14p', name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 129800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: 'Leica 50MP', battery: '4880mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 92, fps: 94, camera: 95, battery: 84 }, weight: '223g', charge: '120W', shopUrl: '' },
  { id: 'xi14u', name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: 139800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB', camera: 'Leica 50MP', battery: '5000mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 93, fps: 94, camera: 98, battery: 93 }, weight: '229g', charge: '90W', shopUrl: 'https://www.mi.com/global/product/xiaomi-14-ultra' },

  // Xiaomi 15 series (2025)
  { id: 'xi15', name: 'Xiaomi 15', brand: 'Xiaomi', price: 109800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', camera: 'Leica 50MP', battery: '5400mAh', display: '6.36" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 93, fps: 95, camera: 93, battery: 90 }, weight: '189g', charge: '90W', shopUrl: '' },
  { id: 'xi15p', name: 'Xiaomi 15 Pro', brand: 'Xiaomi', price: 129800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '16GB', storage: '512GB', camera: 'Leica 50MP', battery: '6100mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 95, fps: 96, camera: 96, battery: 95 }, weight: '215g', charge: '90W', shopUrl: '' },
  { id: 'xi15u', name: 'Xiaomi 15 Ultra', brand: 'Xiaomi', price: 149800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '16GB', storage: '512GB', camera: 'Leica 50MP', battery: '6000mAh', display: '6.73" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 97, fps: 96, camera: 99, battery: 98 }, weight: '233g', charge: '90W', shopUrl: '' },

  // Xiaomi 17 Ultra (2026 speculative)
  { id: 'xi17u', name: 'Xiaomi 17 Ultra', brand: 'Xiaomi', price: 159800, image: '', specs: { cpu: 'SD 8 Elite Gen5', ram: '16GB', storage: '512GB', camera: 'Leica 1inch 50MP', battery: '6200mAh', display: '6.73" AMOLED' }, category: 'flagship', releaseYear: 2026, scores: { overall: 99, fps: 97, camera: 100, battery: 99 }, weight: '235g', charge: '100W', shopUrl: '' },

  // Redmi Note series (midrange)
  { id: 'rn11', name: 'Redmi Note 11', brand: 'Xiaomi', price: 24800, image: '', specs: { cpu: 'Snapdragon 680', ram: '4GB', storage: '64GB', camera: '50MP', battery: '5000mAh', display: '6.43" AMOLED 90Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 55, fps: 40, camera: 55, battery: 85 }, weight: '179g', charge: '33W', shopUrl: '' },
  { id: 'rn11p', name: 'Redmi Note 11 Pro', brand: 'Xiaomi', price: 34800, image: '', specs: { cpu: 'MediaTek Helio G96', ram: '6GB', storage: '128GB', camera: '108MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 60, fps: 48, camera: 62, battery: 85 }, weight: '202g', charge: '67W', shopUrl: '' },
  { id: 'rn12', name: 'Redmi Note 12', brand: 'Xiaomi', price: 24800, image: '', specs: { cpu: 'Snapdragon 685', ram: '4GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 57, fps: 42, camera: 56, battery: 86 }, weight: '188g', charge: '33W', shopUrl: '' },
  { id: 'rn12p', name: 'Redmi Note 12 Pro', brand: 'Xiaomi', price: 39800, image: '', specs: { cpu: 'MediaTek Dimensity 1080', ram: '6GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 65, fps: 55, camera: 66, battery: 85 }, weight: '187g', charge: '67W', shopUrl: '' },
  { id: 'rn13', name: 'Redmi Note 13', brand: 'Xiaomi', price: 24800, image: '', specs: { cpu: 'Snapdragon 685', ram: '6GB', storage: '128GB', camera: '108MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 60, fps: 44, camera: 60, battery: 87 }, weight: '188g', charge: '33W', shopUrl: '' },
  { id: 'rn13p', name: 'Redmi Note 13 Pro', brand: 'Xiaomi', price: 39800, image: '', specs: { cpu: 'Snapdragon 7s Gen 2', ram: '8GB', storage: '256GB', camera: '200MP', battery: '5100mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 68, fps: 60, camera: 72, battery: 86 }, weight: '187g', charge: '67W', shopUrl: '' },
  { id: 'rn13pp', name: 'Redmi Note 13 Pro+', brand: 'Xiaomi', price: 49800, image: '', specs: { cpu: 'MediaTek Dimensity 7200', ram: '8GB', storage: '256GB', camera: '200MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 72, fps: 65, camera: 74, battery: 84 }, weight: '204g', charge: '120W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // OPPO
  // ──────────────────────────────────────────────

  // Find X series (flagship)
  { id: 'opfx5', name: 'OPPO Find X5 Pro', brand: 'OPPO', price: 119800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 86, fps: 87, camera: 90, battery: 84 }, weight: '218g', charge: '80W', shopUrl: '' },
  { id: 'opfx6p', name: 'OPPO Find X6 Pro', brand: 'OPPO', price: 129800, image: '', specs: { cpu: 'Dimensity 9200', ram: '16GB', storage: '256GB', camera: 'Hasselblad 50MP 1inch', battery: '5000mAh', display: '6.82" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 90, fps: 89, camera: 95, battery: 85 }, weight: '216g', charge: '100W', shopUrl: '' },
  { id: 'opfx7', name: 'OPPO Find X7', brand: 'OPPO', price: 109800, image: '', specs: { cpu: 'Dimensity 9300', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '5000mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 90, fps: 92, camera: 93, battery: 85 }, weight: '209g', charge: '100W', shopUrl: '' },
  { id: 'opfx7u', name: 'OPPO Find X7 Ultra', brand: 'OPPO', price: 149800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB', camera: 'Hasselblad 50MP dual periscope', battery: '5000mAh', display: '6.82" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 94, fps: 94, camera: 98, battery: 86 }, weight: '221g', charge: '100W', shopUrl: '' },

  // Reno series (midrange)
  { id: 'oprn8', name: 'OPPO Reno8', brand: 'OPPO', price: 49800, image: '', specs: { cpu: 'Dimensity 1300', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4500mAh', display: '6.43" AMOLED 90Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 65, fps: 58, camera: 64, battery: 78 }, weight: '179g', charge: '80W', shopUrl: '' },
  { id: 'oprn8p', name: 'OPPO Reno8 Pro', brand: 'OPPO', price: 69800, image: '', specs: { cpu: 'Dimensity 8100-Max', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.62" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 72, fps: 68, camera: 70, battery: 79 }, weight: '183g', charge: '80W', shopUrl: '' },
  { id: 'oprn9', name: 'OPPO Reno9', brand: 'OPPO', price: 44800, image: '', specs: { cpu: 'Snapdragon 778G', ram: '8GB', storage: '256GB', camera: '64MP', battery: '4500mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 66, fps: 60, camera: 65, battery: 79 }, weight: '174g', charge: '67W', shopUrl: '' },
  { id: 'oprn9p', name: 'OPPO Reno9 Pro', brand: 'OPPO', price: 59800, image: '', specs: { cpu: 'Dimensity 8100', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 72, fps: 68, camera: 71, battery: 80 }, weight: '174g', charge: '67W', shopUrl: '' },
  { id: 'oprn10', name: 'OPPO Reno10 Pro', brand: 'OPPO', price: 59800, image: '', specs: { cpu: 'Snapdragon 778G', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 68, fps: 62, camera: 67, battery: 80 }, weight: '185g', charge: '80W', shopUrl: '' },
  { id: 'oprn10pp', name: 'OPPO Reno10 Pro+', brand: 'OPPO', price: 79800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4700mAh', display: '6.74" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 78, fps: 80, camera: 76, battery: 82 }, weight: '194g', charge: '100W', shopUrl: '' },
  { id: 'oprn11', name: 'OPPO Reno11', brand: 'OPPO', price: 49800, image: '', specs: { cpu: 'Dimensity 7050', ram: '8GB', storage: '256GB', camera: '64MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 68, fps: 58, camera: 66, battery: 85 }, weight: '182g', charge: '67W', shopUrl: '' },
  { id: 'oprn11p', name: 'OPPO Reno11 Pro', brand: 'OPPO', price: 69800, image: '', specs: { cpu: 'Dimensity 8200', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.74" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 74, fps: 70, camera: 73, battery: 81 }, weight: '186g', charge: '80W', shopUrl: '' },
  { id: 'oprn12', name: 'OPPO Reno12 Pro', brand: 'OPPO', price: 64800, image: '', specs: { cpu: 'Dimensity 7300 Energy', ram: '12GB', storage: '256GB', camera: '50MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 72, fps: 62, camera: 70, battery: 86 }, weight: '180g', charge: '80W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // OnePlus
  // ──────────────────────────────────────────────

  { id: 'op10p', name: 'OnePlus 10 Pro', brand: 'OnePlus', price: 89800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: 'Hasselblad 48MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 85, fps: 88, camera: 86, battery: 86 }, weight: '200g', charge: '80W', shopUrl: '' },
  { id: 'op10t', name: 'OnePlus 10T', brand: 'OnePlus', price: 79800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '16GB', storage: '256GB', camera: '50MP', battery: '4800mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 84, fps: 90, camera: 80, battery: 83 }, weight: '203g', charge: '150W', shopUrl: '' },
  { id: 'op11', name: 'OnePlus 11', brand: 'OnePlus', price: 89800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '16GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 89, fps: 93, camera: 88, battery: 87 }, weight: '205g', charge: '100W', shopUrl: '' },
  { id: 'op12', name: 'OnePlus 12', brand: 'OnePlus', price: 99800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '5400mAh', display: '6.82" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 92, fps: 95, camera: 91, battery: 92 }, weight: '220g', charge: '100W', shopUrl: '' },
  { id: 'op13', name: 'OnePlus 13', brand: 'OnePlus', price: 99800, image: '', specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '6000mAh', display: '6.82" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2025, scores: { overall: 90, fps: 95, camera: 88, battery: 97 }, weight: '210g', charge: '100W', shopUrl: '' },

  // OnePlus 15 (2026 speculative)
  { id: 'op15', name: 'OnePlus 15', brand: 'OnePlus', price: 109800, image: '', specs: { cpu: 'SD 8 Elite Gen5', ram: '12GB', storage: '256GB', camera: 'Hasselblad 50MP', battery: '6500mAh', display: '6.82" AMOLED' }, category: 'flagship', releaseYear: 2026, scores: { overall: 92, fps: 96, camera: 90, battery: 99 }, weight: '213g', charge: '100W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // HUAWEI
  // ──────────────────────────────────────────────

  // P series
  { id: 'hwp40', name: 'HUAWEI P40', brand: 'HUAWEI', price: 89800, image: '', specs: { cpu: 'Kirin 990 5G', ram: '8GB', storage: '128GB', camera: '50MP', battery: '3800mAh', display: '6.1" OLED' }, category: 'flagship', releaseYear: 2020, scores: { overall: 80, fps: 78, camera: 88, battery: 72 }, weight: '175g', charge: '22.5W', shopUrl: '' },
  { id: 'hwp40p', name: 'HUAWEI P40 Pro', brand: 'HUAWEI', price: 119800, image: '', specs: { cpu: 'Kirin 990 5G', ram: '8GB', storage: '256GB', camera: '50MP Leica', battery: '4200mAh', display: '6.58" OLED 90Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 85, fps: 80, camera: 94, battery: 78 }, weight: '209g', charge: '40W', shopUrl: '' },
  { id: 'hwp40pp', name: 'HUAWEI P40 Pro+', brand: 'HUAWEI', price: 159800, image: '', specs: { cpu: 'Kirin 990 5G', ram: '8GB', storage: '512GB', camera: '50MP Leica', battery: '4200mAh', display: '6.58" OLED 90Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 87, fps: 80, camera: 96, battery: 78 }, weight: '226g', charge: '40W', shopUrl: '' },
  { id: 'hwp50p', name: 'HUAWEI P50 Pro', brand: 'HUAWEI', price: 119800, image: '', specs: { cpu: 'Snapdragon 888 (4G)', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4360mAh', display: '6.6" OLED 120Hz' }, category: 'flagship', releaseYear: 2021, scores: { overall: 83, fps: 82, camera: 93, battery: 76 }, weight: '195g', charge: '66W', shopUrl: '' },
  { id: 'hwp60p', name: 'HUAWEI P60 Pro', brand: 'HUAWEI', price: 129800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1 (4G)', ram: '8GB', storage: '256GB', camera: '48MP XMAGE', battery: '4815mAh', display: '6.67" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 85, fps: 82, camera: 94, battery: 82 }, weight: '200g', charge: '88W', shopUrl: '' },

  // Mate series
  { id: 'hwm40p', name: 'HUAWEI Mate 40 Pro', brand: 'HUAWEI', price: 139800, image: '', specs: { cpu: 'Kirin 9000', ram: '8GB', storage: '256GB', camera: '50MP Leica', battery: '4400mAh', display: '6.76" OLED 90Hz' }, category: 'flagship', releaseYear: 2020, scores: { overall: 86, fps: 84, camera: 93, battery: 78 }, weight: '212g', charge: '66W', shopUrl: '' },
  { id: 'hwm50p', name: 'HUAWEI Mate 50 Pro', brand: 'HUAWEI', price: 149800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1 (4G)', ram: '8GB', storage: '256GB', camera: '50MP XMAGE', battery: '4700mAh', display: '6.74" OLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 85, fps: 83, camera: 94, battery: 80 }, weight: '205g', charge: '66W', shopUrl: '' },
  { id: 'hwm60p', name: 'HUAWEI Mate 60 Pro', brand: 'HUAWEI', price: 159800, image: '', specs: { cpu: 'Kirin 9000S', ram: '12GB', storage: '512GB', camera: '48MP XMAGE', battery: '5000mAh', display: '6.82" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 84, fps: 75, camera: 90, battery: 86 }, weight: '225g', charge: '88W', shopUrl: '' },

  // nova series (midrange)
  { id: 'hwnv9', name: 'HUAWEI nova 9', brand: 'HUAWEI', price: 49800, image: '', specs: { cpu: 'Snapdragon 778G (4G)', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4300mAh', display: '6.57" OLED 120Hz' }, category: 'midrange', releaseYear: 2021, scores: { overall: 65, fps: 60, camera: 66, battery: 75 }, weight: '175g', charge: '66W', shopUrl: '' },
  { id: 'hwnv10', name: 'HUAWEI nova 10', brand: 'HUAWEI', price: 49800, image: '', specs: { cpu: 'Snapdragon 778G (4G)', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4000mAh', display: '6.67" OLED' }, category: 'midrange', releaseYear: 2022, scores: { overall: 64, fps: 58, camera: 64, battery: 72 }, weight: '168g', charge: '66W', shopUrl: '' },
  { id: 'hwnv10p', name: 'HUAWEI nova 10 Pro', brand: 'HUAWEI', price: 64800, image: '', specs: { cpu: 'Snapdragon 778G (4G)', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.78" OLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 68, fps: 60, camera: 66, battery: 76 }, weight: '191g', charge: '100W', shopUrl: '' },
  { id: 'hwnv11', name: 'HUAWEI nova 11', brand: 'HUAWEI', price: 49800, image: '', specs: { cpu: 'Snapdragon 778G (4G)', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.7" OLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 66, fps: 60, camera: 66, battery: 77 }, weight: '171g', charge: '66W', shopUrl: '' },
  { id: 'hwnv12', name: 'HUAWEI nova 12 Pro', brand: 'HUAWEI', price: 59800, image: '', specs: { cpu: 'Kirin 8000', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.7" OLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 68, fps: 58, camera: 68, battery: 79 }, weight: '183g', charge: '100W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // vivo
  // ──────────────────────────────────────────────

  // X series (flagship)
  { id: 'vivx80p', name: 'vivo X80 Pro', brand: 'vivo', price: 109800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: 'ZEISS 50MP', battery: '4700mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 86, fps: 87, camera: 92, battery: 80 }, weight: '215g', charge: '80W', shopUrl: '' },
  { id: 'vivx90p', name: 'vivo X90 Pro', brand: 'vivo', price: 119800, image: '', specs: { cpu: 'Dimensity 9200', ram: '12GB', storage: '256GB', camera: 'ZEISS 50MP 1inch', battery: '4870mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 89, fps: 90, camera: 95, battery: 82 }, weight: '214g', charge: '120W', shopUrl: '' },
  { id: 'vivx90pp', name: 'vivo X90 Pro+', brand: 'vivo', price: 139800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: 'ZEISS 50MP 1inch', battery: '4700mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 91, fps: 92, camera: 97, battery: 80 }, weight: '221g', charge: '80W', shopUrl: '' },
  { id: 'vivx100p', name: 'vivo X100 Pro', brand: 'vivo', price: 129800, image: '', specs: { cpu: 'Dimensity 9300', ram: '16GB', storage: '256GB', camera: 'ZEISS 50MP', battery: '5400mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 92, fps: 93, camera: 96, battery: 88 }, weight: '225g', charge: '100W', shopUrl: '' },
  { id: 'vivx100u', name: 'vivo X100 Ultra', brand: 'vivo', price: 149800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB', camera: 'ZEISS 200MP', battery: '5500mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 94, fps: 94, camera: 98, battery: 89 }, weight: '229g', charge: '100W', shopUrl: '' },

  // V series (midrange)
  { id: 'vivv25p', name: 'vivo V25 Pro', brand: 'vivo', price: 49800, image: '', specs: { cpu: 'Dimensity 1300', ram: '8GB', storage: '128GB', camera: '64MP', battery: '4830mAh', display: '6.56" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 66, fps: 58, camera: 65, battery: 80 }, weight: '190g', charge: '66W', shopUrl: '' },
  { id: 'vivv27p', name: 'vivo V27 Pro', brand: 'vivo', price: 49800, image: '', specs: { cpu: 'Dimensity 8200', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.78" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 70, fps: 65, camera: 68, battery: 78 }, weight: '182g', charge: '66W', shopUrl: '' },
  { id: 'vivv29p', name: 'vivo V29 Pro', brand: 'vivo', price: 54800, image: '', specs: { cpu: 'Snapdragon 778G', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.78" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 68, fps: 62, camera: 67, battery: 78 }, weight: '186g', charge: '80W', shopUrl: '' },
  { id: 'vivv30p', name: 'vivo V30 Pro', brand: 'vivo', price: 59800, image: '', specs: { cpu: 'Snapdragon 7 Gen 3', ram: '8GB', storage: '256GB', camera: 'ZEISS 50MP', battery: '5000mAh', display: '6.78" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 73, fps: 66, camera: 72, battery: 84 }, weight: '187g', charge: '80W', shopUrl: '' },

  // Y series (budget/entry)
  { id: 'vivy76', name: 'vivo Y76 5G', brand: 'vivo', price: 29800, image: '', specs: { cpu: 'Dimensity 700', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4100mAh', display: '6.58" IPS' }, category: 'budget', releaseYear: 2022, scores: { overall: 48, fps: 38, camera: 48, battery: 72 }, weight: '175g', charge: '18W', shopUrl: '' },
  { id: 'vivy78p', name: 'vivo Y78+', brand: 'vivo', price: 24800, image: '', specs: { cpu: 'Dimensity 7020', ram: '8GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.64" AMOLED 120Hz' }, category: 'budget', releaseYear: 2023, scores: { overall: 52, fps: 42, camera: 50, battery: 84 }, weight: '190g', charge: '44W', shopUrl: '' },
  { id: 'vivy100', name: 'vivo Y100 5G', brand: 'vivo', price: 29800, image: '', specs: { cpu: 'Dimensity 6300', ram: '8GB', storage: '256GB', camera: '50MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' }, category: 'budget', releaseYear: 2024, scores: { overall: 55, fps: 44, camera: 52, battery: 86 }, weight: '186g', charge: '44W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // ASUS
  // ──────────────────────────────────────────────

  // ROG Phone (gaming)
  { id: 'rog6', name: 'ROG Phone 6', brand: 'ASUS', price: 129800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '16GB', storage: '512GB', camera: '50MP', battery: '6000mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 87, fps: 97, camera: 72, battery: 90 }, weight: '239g', charge: '65W', shopUrl: '' },
  { id: 'rog6p', name: 'ROG Phone 6 Pro', brand: 'ASUS', price: 159800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '18GB', storage: '512GB', camera: '50MP', battery: '6000mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 88, fps: 98, camera: 72, battery: 90 }, weight: '239g', charge: '65W', shopUrl: '' },
  { id: 'rog7', name: 'ROG Phone 7', brand: 'ASUS', price: 129800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '16GB', storage: '512GB', camera: '50MP', battery: '6000mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 90, fps: 98, camera: 74, battery: 91 }, weight: '239g', charge: '65W', shopUrl: '' },
  { id: 'rog7u', name: 'ROG Phone 7 Ultimate', brand: 'ASUS', price: 179800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '16GB', storage: '512GB', camera: '50MP', battery: '6000mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 91, fps: 99, camera: 74, battery: 91 }, weight: '246g', charge: '65W', shopUrl: '' },
  { id: 'rog8', name: 'ROG Phone 8', brand: 'ASUS', price: 129800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '256GB', camera: '50MP', battery: '5500mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 92, fps: 98, camera: 80, battery: 88 }, weight: '225g', charge: '65W', shopUrl: '' },
  { id: 'rog8p', name: 'ROG Phone 8 Pro', brand: 'ASUS', price: 159800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '24GB', storage: '1TB', camera: '50MP', battery: '5500mAh', display: '6.78" AMOLED 165Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 94, fps: 99, camera: 82, battery: 88 }, weight: '225g', charge: '65W', shopUrl: '' },

  // Zenfone
  { id: 'zf9', name: 'Zenfone 9', brand: 'ASUS', price: 99800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4300mAh', display: '5.9" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 84, fps: 88, camera: 82, battery: 78 }, weight: '169g', charge: '30W', shopUrl: '' },
  { id: 'zf10', name: 'Zenfone 10', brand: 'ASUS', price: 99800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4300mAh', display: '5.9" AMOLED 144Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 87, fps: 91, camera: 84, battery: 79 }, weight: '172g', charge: '30W', shopUrl: '' },
  { id: 'zf11u', name: 'Zenfone 11 Ultra', brand: 'ASUS', price: 119800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: '50MP', battery: '5500mAh', display: '6.78" AMOLED 120Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 90, fps: 93, camera: 86, battery: 88 }, weight: '225g', charge: '65W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Motorola
  // ──────────────────────────────────────────────

  // Edge series
  { id: 'me30u', name: 'Motorola Edge 30 Ultra', brand: 'Motorola', price: 89800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '12GB', storage: '256GB', camera: '200MP', battery: '4610mAh', display: '6.67" OLED 144Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 83, fps: 87, camera: 82, battery: 78 }, weight: '198g', charge: '125W', shopUrl: '' },
  { id: 'me30p', name: 'Motorola Edge 30 Pro', brand: 'Motorola', price: 69800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4800mAh', display: '6.7" OLED 144Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 80, fps: 85, camera: 78, battery: 80 }, weight: '196g', charge: '68W', shopUrl: '' },
  { id: 'me40p', name: 'Motorola Edge 40 Pro', brand: 'Motorola', price: 89800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4600mAh', display: '6.67" OLED 165Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 86, fps: 90, camera: 82, battery: 78 }, weight: '199g', charge: '125W', shopUrl: '' },
  { id: 'me40', name: 'Motorola Edge 40', brand: 'Motorola', price: 64800, image: '', specs: { cpu: 'Dimensity 8020', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4400mAh', display: '6.55" OLED 144Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 78, fps: 78, camera: 76, battery: 76 }, weight: '167g', charge: '68W', shopUrl: '' },

  // Moto G series (midrange)
  { id: 'mg82', name: 'Moto G82', brand: 'Motorola', price: 34800, image: '', specs: { cpu: 'Snapdragon 695', ram: '6GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.6" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 58, fps: 48, camera: 55, battery: 85 }, weight: '173g', charge: '30W', shopUrl: '' },
  { id: 'mg84', name: 'Moto G84', brand: 'Motorola', price: 39800, image: '', specs: { cpu: 'Snapdragon 695', ram: '8GB', storage: '256GB', camera: '50MP', battery: '5000mAh', display: '6.55" OLED 120Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 60, fps: 50, camera: 57, battery: 86 }, weight: '168g', charge: '33W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Nothing
  // ──────────────────────────────────────────────

  { id: 'np1', name: 'Nothing Phone (1)', brand: 'Nothing', price: 69800, image: '', specs: { cpu: 'Snapdragon 778G+', ram: '8GB', storage: '256GB', camera: '50MP', battery: '4500mAh', display: '6.55" OLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 72, fps: 65, camera: 68, battery: 79 }, weight: '193g', charge: '33W', shopUrl: '' },
  { id: 'np2', name: 'Nothing Phone (2)', brand: 'Nothing', price: 79800, image: '', specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '12GB', storage: '256GB', camera: '50MP', battery: '4700mAh', display: '6.7" OLED 120Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 80, fps: 82, camera: 76, battery: 80 }, weight: '201g', charge: '45W', shopUrl: '' },
  { id: 'np2a', name: 'Nothing Phone (2a)', brand: 'Nothing', price: 49800, image: '', specs: { cpu: 'Dimensity 7200 Pro', ram: '8GB', storage: '128GB', camera: '50MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' }, category: 'midrange', releaseYear: 2024, scores: { overall: 70, fps: 62, camera: 66, battery: 84 }, weight: '190g', charge: '45W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Sharp AQUOS
  // ──────────────────────────────────────────────

  // AQUOS R series (flagship)
  { id: 'aqr7', name: 'AQUOS R7', brand: 'Sharp', price: 189800, image: '', specs: { cpu: 'Snapdragon 8 Gen 1', ram: '12GB', storage: '256GB', camera: 'Leica 47.2MP 1inch', battery: '5000mAh', display: '6.6" Pro IGZO OLED 240Hz' }, category: 'flagship', releaseYear: 2022, scores: { overall: 82, fps: 84, camera: 88, battery: 82 }, weight: '208g', charge: '18W', shopUrl: '' },
  { id: 'aqr8', name: 'AQUOS R8 Pro', brand: 'Sharp', price: 189800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', camera: 'Leica 47.2MP 1inch', battery: '5000mAh', display: '6.6" Pro IGZO OLED 240Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 85, fps: 88, camera: 90, battery: 84 }, weight: '203g', charge: '18W', shopUrl: '' },
  { id: 'aqr8s', name: 'AQUOS R8', brand: 'Sharp', price: 137800, image: '', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB', camera: '50.3MP', battery: '4570mAh', display: '6.39" Pro IGZO OLED 240Hz' }, category: 'flagship', releaseYear: 2023, scores: { overall: 83, fps: 86, camera: 84, battery: 80 }, weight: '179g', charge: '18W', shopUrl: '' },
  { id: 'aqr9', name: 'AQUOS R9', brand: 'Sharp', price: 99800, image: '', specs: { cpu: 'Snapdragon 7+ Gen 3', ram: '8GB', storage: '256GB', camera: '50.3MP Leica', battery: '5000mAh', display: '6.5" Pro IGZO OLED 240Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 80, fps: 78, camera: 82, battery: 86 }, weight: '195g', charge: '18W', shopUrl: '' },
  { id: 'aqr9p', name: 'AQUOS R9 Pro', brand: 'Sharp', price: 164800, image: '', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '512GB', camera: '50.3MP Leica 1inch', battery: '5000mAh', display: '6.7" Pro IGZO OLED 240Hz' }, category: 'flagship', releaseYear: 2024, scores: { overall: 88, fps: 90, camera: 92, battery: 86 }, weight: '229g', charge: '65W', shopUrl: '' },

  // AQUOS sense series (midrange)
  { id: 'aqs7', name: 'AQUOS sense7', brand: 'Sharp', price: 49800, image: '', specs: { cpu: 'Snapdragon 695', ram: '6GB', storage: '128GB', camera: '50.3MP', battery: '4570mAh', display: '6.1" IGZO OLED' }, category: 'midrange', releaseYear: 2022, scores: { overall: 58, fps: 45, camera: 58, battery: 82 }, weight: '158g', charge: '18W', shopUrl: '' },
  { id: 'aqs7p', name: 'AQUOS sense7 plus', brand: 'Sharp', price: 59800, image: '', specs: { cpu: 'Snapdragon 695', ram: '6GB', storage: '128GB', camera: '50.3MP', battery: '5050mAh', display: '6.4" IGZO OLED 120Hz' }, category: 'midrange', releaseYear: 2022, scores: { overall: 60, fps: 48, camera: 58, battery: 86 }, weight: '172g', charge: '18W', shopUrl: '' },
  { id: 'aqs8', name: 'AQUOS sense8', brand: 'Sharp', price: 56800, image: '', specs: { cpu: 'Snapdragon 6 Gen 1', ram: '6GB', storage: '128GB', camera: '50.3MP', battery: '5000mAh', display: '6.1" IGZO OLED 90Hz' }, category: 'midrange', releaseYear: 2023, scores: { overall: 62, fps: 52, camera: 62, battery: 87 }, weight: '159g', charge: '18W', shopUrl: '' },

  // ──────────────────────────────────────────────
  // Fujitsu / arrows
  // ──────────────────────────────────────────────

  { id: 'arwn', name: 'arrows N', brand: 'FCNT', price: 49800, image: '', specs: { cpu: 'Snapdragon 695', ram: '8GB', storage: '128GB', camera: '50MP', battery: '4600mAh', display: '6.24" OLED' }, category: 'midrange', releaseYear: 2023, scores: { overall: 56, fps: 45, camera: 54, battery: 80 }, weight: '171g', charge: '18W', shopUrl: '' },
  { id: 'arwe2', name: 'arrows We2', brand: 'FCNT', price: 22000, image: '', specs: { cpu: 'Dimensity 7025', ram: '4GB', storage: '64GB', camera: '50MP', battery: '4500mAh', display: '6.1" IPS' }, category: 'budget', releaseYear: 2024, scores: { overall: 42, fps: 32, camera: 40, battery: 78 }, weight: '168g', charge: '18W', shopUrl: '' },
  { id: 'arwe2p', name: 'arrows We2 Plus', brand: 'FCNT', price: 59800, image: '', specs: { cpu: 'Snapdragon 7s Gen 2', ram: '8GB', storage: '256GB', camera: '50.3MP', battery: '5000mAh', display: '6.6" OLED' }, category: 'midrange', releaseYear: 2024, scores: { overall: 64, fps: 55, camera: 60, battery: 84 }, weight: '182g', charge: '18W', shopUrl: '' },
];

async function seed() {
  console.log(`Seeding ${PHONES.length} phones into Firestore...`);
  const phonesRef = collection(db, 'phones');
  let count = 0;
  for (const phone of PHONES) {
    const { id, ...data } = phone;
    await setDoc(doc(phonesRef, id), data);
    count++;
    if (count % 10 === 0) console.log(`  ... ${count}/${PHONES.length}`);
  }
  console.log(`Done! ${count} phones seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
