// 2023-2026 主要スマートフォン一括登録スクリプト
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: 'AIzaSyBpW6oL6ibve1SecZeMT4w94AFTSIVvENI',
  authDomain: 'lexpanther-74408.firebaseapp.com',
  projectId: 'lexpanther-74408',
  storageBucket: 'lexpanther-74408.firebasestorage.app',
  messagingSenderId: '647042172746',
  appId: '1:647042172746:web:50e304246edcba99e563b3',
});
const db = getFirestore(app);

const phones = [
  // ═══════════════════════════════════════
  // 2026 — Samsung
  // ═══════════════════════════════════════
  {
    id: 's26u', name: 'Galaxy S26 Ultra', brand: 'Samsung', price: 229900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '16GB', storage: '256GB/512GB/1TB', camera: '200MP+50MP+50MP+50MP', battery: '6000mAh', display: '6.9" LTPO AMOLED 120Hz' },
    scores: { overall: 97, fps: 96, camera: 98, battery: 93 },
    benchmarks: { antutu: 2650000, geekbench_single: 3400, geekbench_multi: 9800, dmark: 16000 },
    weight: '218g', charge: '65W有線 / 15W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's26plus', name: 'Galaxy S26+', brand: 'Samsung', price: 179900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '12GB', storage: '256GB/512GB', camera: '50MP+12MP+10MP', battery: '4900mAh', display: '6.7" LTPO AMOLED 120Hz' },
    scores: { overall: 91, fps: 92, camera: 88, battery: 90 },
    benchmarks: { antutu: 2600000, geekbench_single: 3350, geekbench_multi: 9600, dmark: 15500 },
    weight: '190g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's26', name: 'Galaxy S26', brand: 'Samsung', price: 144900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '12GB', storage: '128GB/256GB', camera: '50MP+12MP+10MP', battery: '4200mAh', display: '6.2" LTPO AMOLED 120Hz' },
    scores: { overall: 88, fps: 90, camera: 85, battery: 87 },
    benchmarks: { antutu: 2580000, geekbench_single: 3300, geekbench_multi: 9500, dmark: 15000 },
    weight: '167g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 12, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2026 — Apple
  {
    id: 'iphone17promax', name: 'iPhone 17 Pro Max', brand: 'Apple', price: 249800, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'A20 Pro', ram: '12GB', storage: '256GB/512GB/1TB', camera: '48MP+48MP+48MP', battery: '4800mAh', display: '6.9" ProMotion OLED 120Hz' },
    scores: { overall: 97, fps: 97, camera: 97, battery: 92 },
    benchmarks: { antutu: 2700000, geekbench_single: 3600, geekbench_multi: 9900, dmark: 17000 },
    weight: '227g', charge: '45W有線 / 25W MagSafe', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone17pro', name: 'iPhone 17 Pro', brand: 'Apple', price: 194800, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'A20 Pro', ram: '12GB', storage: '256GB/512GB/1TB', camera: '48MP+48MP+12MP', battery: '4500mAh', display: '6.3" ProMotion OLED 120Hz' },
    scores: { overall: 95, fps: 96, camera: 95, battery: 89 },
    benchmarks: { antutu: 2680000, geekbench_single: 3580, geekbench_multi: 9800, dmark: 16800 },
    weight: '199g', charge: '45W有線 / 25W MagSafe', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone17', name: 'iPhone 17', brand: 'Apple', price: 142800, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'A20', ram: '8GB', storage: '128GB/256GB/512GB', camera: '48MP+12MP', battery: '4200mAh', display: '6.1" OLED 60Hz' },
    scores: { overall: 86, fps: 88, camera: 83, battery: 85 },
    benchmarks: { antutu: 2400000, geekbench_single: 3300, geekbench_multi: 8800, dmark: 14000 },
    weight: '170g', charge: '30W有線 / 15W MagSafe', shopUrl: '', stock: 15, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2026 — Google
  {
    id: 'pixel10pro', name: 'Pixel 10 Pro', brand: 'Google', price: 159900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Tensor G5', ram: '16GB', storage: '128GB/256GB/512GB', camera: '50MP+48MP+48MP', battery: '5200mAh', display: '6.8" LTPO OLED 120Hz' },
    scores: { overall: 93, fps: 88, camera: 96, battery: 91 },
    benchmarks: { antutu: 2200000, geekbench_single: 3000, geekbench_multi: 8500, dmark: 13000 },
    weight: '210g', charge: '37W有線 / 23W無線', shopUrl: '', stock: 6, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel10', name: 'Pixel 10', brand: 'Google', price: 109900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Tensor G5', ram: '12GB', storage: '128GB/256GB', camera: '50MP+12MP', battery: '4700mAh', display: '6.3" OLED 120Hz' },
    scores: { overall: 87, fps: 84, camera: 90, battery: 88 },
    benchmarks: { antutu: 2100000, geekbench_single: 2900, geekbench_multi: 8200, dmark: 12000 },
    weight: '185g', charge: '33W有線 / 21W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2026 — Xiaomi
  {
    id: 'xiaomi15ultra', name: 'Xiaomi 15 Ultra', brand: 'Xiaomi', price: 149900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '16GB', storage: '256GB/512GB/1TB', camera: '200MP+50MP+50MP+50MP', battery: '6000mAh', display: '6.73" LTPO AMOLED 120Hz' },
    scores: { overall: 96, fps: 95, camera: 98, battery: 94 },
    benchmarks: { antutu: 2680000, geekbench_single: 3400, geekbench_multi: 9700, dmark: 16500 },
    weight: '225g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'xiaomi15pro', name: 'Xiaomi 15 Pro', brand: 'Xiaomi', price: 109900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '12GB', storage: '256GB/512GB', camera: '50MP+50MP+50MP', battery: '5500mAh', display: '6.67" LTPO AMOLED 120Hz' },
    scores: { overall: 92, fps: 93, camera: 93, battery: 92 },
    benchmarks: { antutu: 2620000, geekbench_single: 3350, geekbench_multi: 9500, dmark: 15500 },
    weight: '209g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 6, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'xiaomi15', name: 'Xiaomi 15', brand: 'Xiaomi', price: 79900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '12GB', storage: '256GB/512GB', camera: '50MP+50MP+12MP', battery: '5100mAh', display: '6.36" LTPO AMOLED 120Hz' },
    scores: { overall: 89, fps: 91, camera: 88, battery: 90 },
    benchmarks: { antutu: 2580000, geekbench_single: 3300, geekbench_multi: 9300, dmark: 15000 },
    weight: '185g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2026 — OnePlus
  {
    id: 'oneplus14', name: 'OnePlus 14', brand: 'OnePlus', price: 129900, category: 'flagship', releaseYear: 2026,
    specs: { cpu: 'Snapdragon 8 Elite 2', ram: '16GB', storage: '256GB/512GB', camera: '50MP+50MP+50MP', battery: '6000mAh', display: '6.8" LTPO AMOLED 120Hz' },
    scores: { overall: 94, fps: 95, camera: 92, battery: 95 },
    benchmarks: { antutu: 2650000, geekbench_single: 3380, geekbench_multi: 9600, dmark: 15800 },
    weight: '212g', charge: '100W有線 / 50W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // ═══════════════════════════════════════
  // 2025 — Samsung
  // ═══════════════════════════════════════
  {
    id: 's25u', name: 'Galaxy S25 Ultra', brand: 'Samsung', price: 204800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB/512GB/1TB', camera: '200MP+50MP+10MP+50MP', battery: '5000mAh', display: '6.9" LTPO AMOLED 120Hz' },
    scores: { overall: 95, fps: 94, camera: 96, battery: 90 },
    benchmarks: { antutu: 2400000, geekbench_single: 3200, geekbench_multi: 9200, dmark: 14500 },
    weight: '218g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's25plus', name: 'Galaxy S25+', brand: 'Samsung', price: 159800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB/512GB', camera: '50MP+12MP+10MP', battery: '4900mAh', display: '6.7" LTPO AMOLED 120Hz' },
    scores: { overall: 89, fps: 90, camera: 86, battery: 88 },
    benchmarks: { antutu: 2350000, geekbench_single: 3150, geekbench_multi: 9000, dmark: 14000 },
    weight: '190g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's25', name: 'Galaxy S25', brand: 'Samsung', price: 124800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '128GB/256GB', camera: '50MP+12MP+10MP', battery: '4000mAh', display: '6.2" LTPO AMOLED 120Hz' },
    scores: { overall: 86, fps: 88, camera: 83, battery: 83 },
    benchmarks: { antutu: 2300000, geekbench_single: 3100, geekbench_multi: 8800, dmark: 13500 },
    weight: '162g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 15, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'zfold6', name: 'Galaxy Z Fold 6', brand: 'Samsung', price: 249800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB/1TB', camera: '50MP+12MP+10MP', battery: '4400mAh', display: '7.6"+6.3" AMOLED 120Hz' },
    scores: { overall: 88, fps: 87, camera: 84, battery: 78 },
    benchmarks: { antutu: 2100000, geekbench_single: 2900, geekbench_multi: 8200, dmark: 12500 },
    weight: '239g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: false, tecApproved: true,
  },
  {
    id: 'zflip6', name: 'Galaxy Z Flip 6', brand: 'Samsung', price: 169800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB', camera: '50MP+12MP', battery: '4000mAh', display: '6.7"+3.4" AMOLED 120Hz' },
    scores: { overall: 82, fps: 84, camera: 80, battery: 75 },
    benchmarks: { antutu: 2050000, geekbench_single: 2850, geekbench_multi: 8000, dmark: 12000 },
    weight: '187g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: false, tecApproved: true,
  },
  {
    id: 'a56', name: 'Galaxy A56', brand: 'Samsung', price: 52800, category: 'midrange', releaseYear: 2025,
    specs: { cpu: 'Exynos 1580', ram: '8GB', storage: '128GB/256GB', camera: '50MP+12MP+5MP', battery: '5000mAh', display: '6.7" Super AMOLED 120Hz' },
    scores: { overall: 68, fps: 60, camera: 65, battery: 82 },
    benchmarks: { antutu: 850000, geekbench_single: 1200, geekbench_multi: 4000, dmark: 4500 },
    weight: '190g', charge: '25W有線', shopUrl: '', stock: 20, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2025 — Apple
  {
    id: 'iphone16promax', name: 'iPhone 16 Pro Max', brand: 'Apple', price: 224800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB/512GB/1TB', camera: '48MP+48MP+12MP', battery: '4685mAh', display: '6.9" ProMotion OLED 120Hz' },
    scores: { overall: 96, fps: 96, camera: 96, battery: 91 },
    benchmarks: { antutu: 2500000, geekbench_single: 3500, geekbench_multi: 9500, dmark: 16000 },
    weight: '227g', charge: '40W有線 / 25W MagSafe', shopUrl: '', stock: 6, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone16pro', name: 'iPhone 16 Pro', brand: 'Apple', price: 174800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'A18 Pro', ram: '8GB', storage: '256GB/512GB/1TB', camera: '48MP+48MP+12MP', battery: '4274mAh', display: '6.3" ProMotion OLED 120Hz' },
    scores: { overall: 94, fps: 95, camera: 95, battery: 87 },
    benchmarks: { antutu: 2480000, geekbench_single: 3480, geekbench_multi: 9400, dmark: 15800 },
    weight: '199g', charge: '40W有線 / 25W MagSafe', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone16', name: 'iPhone 16', brand: 'Apple', price: 124800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'A18', ram: '8GB', storage: '128GB/256GB/512GB', camera: '48MP+12MP', battery: '3561mAh', display: '6.1" OLED 60Hz' },
    scores: { overall: 84, fps: 86, camera: 82, battery: 80 },
    benchmarks: { antutu: 2200000, geekbench_single: 3100, geekbench_multi: 8500, dmark: 13000 },
    weight: '170g', charge: '30W有線 / 15W MagSafe', shopUrl: '', stock: 15, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone16e', name: 'iPhone 16e', brand: 'Apple', price: 84800, category: 'midrange', releaseYear: 2025,
    specs: { cpu: 'A18', ram: '8GB', storage: '128GB/256GB', camera: '48MP', battery: '3561mAh', display: '6.1" OLED 60Hz' },
    scores: { overall: 78, fps: 82, camera: 72, battery: 78 },
    benchmarks: { antutu: 2100000, geekbench_single: 3000, geekbench_multi: 8200, dmark: 12500 },
    weight: '163g', charge: '20W有線 / 15W MagSafe', shopUrl: '', stock: 20, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2025 — Google
  {
    id: 'pixel9proxl', name: 'Pixel 9 Pro XL', brand: 'Google', price: 177900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Tensor G4', ram: '16GB', storage: '128GB/256GB/512GB/1TB', camera: '50MP+48MP+48MP', battery: '5060mAh', display: '6.8" LTPO OLED 120Hz' },
    scores: { overall: 91, fps: 85, camera: 95, battery: 89 },
    benchmarks: { antutu: 1850000, geekbench_single: 2800, geekbench_multi: 7500, dmark: 11000 },
    weight: '221g', charge: '37W有線 / 23W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel9pro', name: 'Pixel 9 Pro', brand: 'Google', price: 144900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Tensor G4', ram: '16GB', storage: '128GB/256GB/512GB/1TB', camera: '50MP+48MP+48MP', battery: '4700mAh', display: '6.3" LTPO OLED 120Hz' },
    scores: { overall: 90, fps: 84, camera: 94, battery: 87 },
    benchmarks: { antutu: 1830000, geekbench_single: 2780, geekbench_multi: 7400, dmark: 10800 },
    weight: '199g', charge: '37W有線 / 23W無線', shopUrl: '', stock: 7, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel9', name: 'Pixel 9', brand: 'Google', price: 114900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Tensor G4', ram: '12GB', storage: '128GB/256GB', camera: '50MP+48MP', battery: '4700mAh', display: '6.3" OLED 120Hz' },
    scores: { overall: 85, fps: 80, camera: 89, battery: 86 },
    benchmarks: { antutu: 1800000, geekbench_single: 2750, geekbench_multi: 7200, dmark: 10500 },
    weight: '198g', charge: '33W有線 / 21W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel9a', name: 'Pixel 9a', brand: 'Google', price: 72600, category: 'midrange', releaseYear: 2025,
    specs: { cpu: 'Tensor G4', ram: '8GB', storage: '128GB/256GB', camera: '48MP+13MP', battery: '5100mAh', display: '6.3" OLED 120Hz' },
    scores: { overall: 78, fps: 72, camera: 82, battery: 88 },
    benchmarks: { antutu: 1600000, geekbench_single: 2500, geekbench_multi: 6500, dmark: 8500 },
    weight: '186g', charge: '23W有線 / 7.5W無線', shopUrl: '', stock: 15, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2025 — Xiaomi
  {
    id: 'xiaomi14ultra', name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: 139900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB/1TB', camera: '50MP(LYT-900)+50MP+50MP+50MP', battery: '5300mAh', display: '6.73" LTPO AMOLED 120Hz' },
    scores: { overall: 94, fps: 93, camera: 97, battery: 91 },
    benchmarks: { antutu: 2150000, geekbench_single: 2900, geekbench_multi: 8300, dmark: 13000 },
    weight: '227g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'xiaomi14tpro', name: 'Xiaomi 14T Pro', brand: 'Xiaomi', price: 89900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Dimensity 9300+', ram: '12GB', storage: '256GB/512GB/1TB', camera: '50MP+50MP+12MP', battery: '5000mAh', display: '6.67" AMOLED 144Hz' },
    scores: { overall: 87, fps: 88, camera: 86, battery: 85 },
    benchmarks: { antutu: 2050000, geekbench_single: 2600, geekbench_multi: 7800, dmark: 11500 },
    weight: '209g', charge: '120W有線', shopUrl: '', stock: 6, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2025 — OnePlus
  {
    id: 'oneplus13', name: 'OnePlus 13', brand: 'OnePlus', price: 119900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP+50MP+50MP', battery: '6000mAh', display: '6.82" LTPO AMOLED 120Hz' },
    scores: { overall: 93, fps: 94, camera: 91, battery: 95 },
    benchmarks: { antutu: 2400000, geekbench_single: 3200, geekbench_multi: 9100, dmark: 14000 },
    weight: '213g', charge: '100W有線 / 50W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'oneplus13r', name: 'OnePlus 13R', brand: 'OnePlus', price: 69900, category: 'midrange', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', camera: '50MP+8MP+50MP', battery: '6000mAh', display: '6.78" LTPO AMOLED 120Hz' },
    scores: { overall: 82, fps: 85, camera: 78, battery: 93 },
    benchmarks: { antutu: 2050000, geekbench_single: 2800, geekbench_multi: 8000, dmark: 12000 },
    weight: '206g', charge: '80W有線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2025 — Sony
  {
    id: 'xperia1vii', name: 'Xperia 1 VII', brand: 'Sony', price: 189800, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB/512GB', camera: '52MP+52MP+48MP', battery: '5500mAh', display: '6.5" LTPO OLED 120Hz' },
    scores: { overall: 90, fps: 89, camera: 93, battery: 86 },
    benchmarks: { antutu: 2350000, geekbench_single: 3100, geekbench_multi: 8800, dmark: 13500 },
    weight: '187g', charge: '30W有線 / 15W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2025 — Others
  {
    id: 'nothing3', name: 'Nothing Phone 3', brand: 'Nothing', price: 79900, category: 'midrange', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8s Gen 4', ram: '12GB', storage: '256GB/512GB', camera: '50MP+50MP', battery: '5500mAh', display: '6.7" LTPO AMOLED 120Hz' },
    scores: { overall: 82, fps: 80, camera: 80, battery: 88 },
    benchmarks: { antutu: 1800000, geekbench_single: 2500, geekbench_multi: 7000, dmark: 9500 },
    weight: '195g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 6, hasCase: false, hasGlass: true, tecApproved: false,
  },
  {
    id: 'findx8pro', name: 'Find X8 Pro', brand: 'OPPO', price: 149900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Dimensity 9400', ram: '16GB', storage: '256GB/512GB', camera: '50MP+50MP+50MP+50MP', battery: '5910mAh', display: '6.78" LTPO AMOLED 120Hz' },
    scores: { overall: 92, fps: 90, camera: 95, battery: 93 },
    benchmarks: { antutu: 2400000, geekbench_single: 3000, geekbench_multi: 8800, dmark: 14000 },
    weight: '215g', charge: '80W有線 / 50W無線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'magic7pro', name: 'Magic 7 Pro', brand: 'Honor', price: 129900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB/512GB', camera: '50MP+50MP+200MP', battery: '5850mAh', display: '6.8" LTPO AMOLED 120Hz' },
    scores: { overall: 91, fps: 92, camera: 93, battery: 92 },
    benchmarks: { antutu: 2380000, geekbench_single: 3150, geekbench_multi: 9000, dmark: 14200 },
    weight: '223g', charge: '100W有線 / 80W無線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'vivox200pro', name: 'vivo X200 Pro', brand: 'vivo', price: 134900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Dimensity 9400', ram: '16GB', storage: '256GB/512GB', camera: '50MP+50MP+200MP', battery: '6000mAh', display: '6.78" LTPO AMOLED 120Hz' },
    scores: { overall: 91, fps: 89, camera: 94, battery: 93 },
    benchmarks: { antutu: 2350000, geekbench_single: 2950, geekbench_multi: 8700, dmark: 13800 },
    weight: '228g', charge: '90W有線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'rog9', name: 'ROG Phone 9', brand: 'ASUS', price: 159900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '16GB/24GB', storage: '512GB/1TB', camera: '50MP+13MP+5MP', battery: '5800mAh', display: '6.78" LTPO AMOLED 185Hz' },
    scores: { overall: 90, fps: 98, camera: 78, battery: 88 },
    benchmarks: { antutu: 2500000, geekbench_single: 3250, geekbench_multi: 9300, dmark: 15000 },
    weight: '227g', charge: '65W有線', shopUrl: '', stock: 3, hasCase: true, hasGlass: false, tecApproved: false,
  },
  {
    id: 'realmegt7pro', name: 'Realme GT 7 Pro', brand: 'Realme', price: 69900, category: 'flagship', releaseYear: 2025,
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB/512GB', camera: '50MP+8MP+50MP', battery: '6500mAh', display: '6.78" LTPO AMOLED 120Hz' },
    scores: { overall: 86, fps: 90, camera: 82, battery: 95 },
    benchmarks: { antutu: 2380000, geekbench_single: 3100, geekbench_multi: 8800, dmark: 13500 },
    weight: '222g', charge: '120W有線', shopUrl: '', stock: 6, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // ═══════════════════════════════════════
  // 2024 — Samsung
  // ═══════════════════════════════════════
  {
    id: 's24u', name: 'Galaxy S24 Ultra', brand: 'Samsung', price: 189800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB/1TB', camera: '200MP+12MP+10MP+50MP', battery: '5000mAh', display: '6.8" LTPO AMOLED 120Hz' },
    scores: { overall: 93, fps: 92, camera: 94, battery: 88 },
    benchmarks: { antutu: 2100000, geekbench_single: 2900, geekbench_multi: 8500, dmark: 13000 },
    weight: '232g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's24plus', name: 'Galaxy S24+', brand: 'Samsung', price: 149800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB', camera: '50MP+12MP+10MP', battery: '4900mAh', display: '6.7" LTPO AMOLED 120Hz' },
    scores: { overall: 87, fps: 88, camera: 84, battery: 86 },
    benchmarks: { antutu: 2050000, geekbench_single: 2850, geekbench_multi: 8200, dmark: 12500 },
    weight: '196g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 7, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's24', name: 'Galaxy S24', brand: 'Samsung', price: 124800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Exynos 2400', ram: '8GB', storage: '128GB/256GB', camera: '50MP+12MP+10MP', battery: '4000mAh', display: '6.2" AMOLED 120Hz' },
    scores: { overall: 83, fps: 82, camera: 81, battery: 80 },
    benchmarks: { antutu: 1850000, geekbench_single: 2400, geekbench_multi: 7200, dmark: 10500 },
    weight: '167g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'a55', name: 'Galaxy A55', brand: 'Samsung', price: 48800, category: 'midrange', releaseYear: 2024,
    specs: { cpu: 'Exynos 1480', ram: '8GB', storage: '128GB/256GB', camera: '50MP+12MP+5MP', battery: '5000mAh', display: '6.6" Super AMOLED 120Hz' },
    scores: { overall: 65, fps: 58, camera: 62, battery: 82 },
    benchmarks: { antutu: 750000, geekbench_single: 1100, geekbench_multi: 3600, dmark: 3800 },
    weight: '213g', charge: '25W有線', shopUrl: '', stock: 20, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2024 — Apple
  {
    id: 'iphone15promax', name: 'iPhone 15 Pro Max', brand: 'Apple', price: 189800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'A17 Pro', ram: '8GB', storage: '256GB/512GB/1TB', camera: '48MP+12MP+12MP', battery: '4422mAh', display: '6.7" ProMotion OLED 120Hz' },
    scores: { overall: 94, fps: 94, camera: 94, battery: 88 },
    benchmarks: { antutu: 2200000, geekbench_single: 3300, geekbench_multi: 8700, dmark: 14500 },
    weight: '221g', charge: '27W有線 / 15W MagSafe', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone15pro', name: 'iPhone 15 Pro', brand: 'Apple', price: 159800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'A17 Pro', ram: '8GB', storage: '128GB/256GB/512GB/1TB', camera: '48MP+12MP+12MP', battery: '3274mAh', display: '6.1" ProMotion OLED 120Hz' },
    scores: { overall: 92, fps: 93, camera: 93, battery: 82 },
    benchmarks: { antutu: 2180000, geekbench_single: 3280, geekbench_multi: 8600, dmark: 14300 },
    weight: '187g', charge: '27W有線 / 15W MagSafe', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'iphone15', name: 'iPhone 15', brand: 'Apple', price: 124800, category: 'midrange', releaseYear: 2024,
    specs: { cpu: 'A16 Bionic', ram: '6GB', storage: '128GB/256GB/512GB', camera: '48MP+12MP', battery: '3349mAh', display: '6.1" OLED 60Hz' },
    scores: { overall: 81, fps: 82, camera: 80, battery: 77 },
    benchmarks: { antutu: 1650000, geekbench_single: 2600, geekbench_multi: 6800, dmark: 10000 },
    weight: '171g', charge: '27W有線 / 15W MagSafe', shopUrl: '', stock: 12, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2024 — Google
  {
    id: 'pixel8pro', name: 'Pixel 8 Pro', brand: 'Google', price: 159900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Tensor G3', ram: '12GB', storage: '128GB/256GB/512GB/1TB', camera: '50MP+48MP+48MP', battery: '5050mAh', display: '6.7" LTPO OLED 120Hz' },
    scores: { overall: 88, fps: 80, camera: 93, battery: 86 },
    benchmarks: { antutu: 1450000, geekbench_single: 2400, geekbench_multi: 6800, dmark: 9500 },
    weight: '213g', charge: '30W有線 / 23W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel8', name: 'Pixel 8', brand: 'Google', price: 109900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Tensor G3', ram: '8GB', storage: '128GB/256GB', camera: '50MP+12MP', battery: '4575mAh', display: '6.2" OLED 120Hz' },
    scores: { overall: 83, fps: 76, camera: 88, battery: 83 },
    benchmarks: { antutu: 1400000, geekbench_single: 2350, geekbench_multi: 6500, dmark: 9000 },
    weight: '187g', charge: '27W有線 / 18W無線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'pixel8a', name: 'Pixel 8a', brand: 'Google', price: 72600, category: 'midrange', releaseYear: 2024,
    specs: { cpu: 'Tensor G3', ram: '8GB', storage: '128GB/256GB', camera: '64MP+13MP', battery: '4492mAh', display: '6.1" OLED 120Hz' },
    scores: { overall: 76, fps: 70, camera: 80, battery: 80 },
    benchmarks: { antutu: 1350000, geekbench_single: 2200, geekbench_multi: 6200, dmark: 8500 },
    weight: '188g', charge: '18W有線 / 7.5W無線', shopUrl: '', stock: 12, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2024 — Xiaomi
  {
    id: 'xiaomi14', name: 'Xiaomi 14', brand: 'Xiaomi', price: 89900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB', camera: '50MP(LYT-700)+50MP+50MP', battery: '4610mAh', display: '6.36" LTPO AMOLED 120Hz' },
    scores: { overall: 89, fps: 90, camera: 90, battery: 84 },
    benchmarks: { antutu: 2050000, geekbench_single: 2800, geekbench_multi: 8000, dmark: 12000 },
    weight: '193g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'redminote13pro', name: 'Redmi Note 13 Pro+', brand: 'Xiaomi', price: 39900, category: 'budget', releaseYear: 2024,
    specs: { cpu: 'Dimensity 7200 Ultra', ram: '8GB/12GB', storage: '256GB/512GB', camera: '200MP+8MP+2MP', battery: '5000mAh', display: '6.67" AMOLED 120Hz' },
    scores: { overall: 62, fps: 55, camera: 65, battery: 80 },
    benchmarks: { antutu: 650000, geekbench_single: 950, geekbench_multi: 3200, dmark: 3000 },
    weight: '204g', charge: '120W有線', shopUrl: '', stock: 15, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2024 — OnePlus
  {
    id: 'oneplus12', name: 'OnePlus 12', brand: 'OnePlus', price: 109900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP+64MP+48MP', battery: '5400mAh', display: '6.82" LTPO AMOLED 120Hz' },
    scores: { overall: 91, fps: 92, camera: 89, battery: 90 },
    benchmarks: { antutu: 2100000, geekbench_single: 2850, geekbench_multi: 8200, dmark: 12500 },
    weight: '220g', charge: '100W有線 / 50W無線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2024 — Sony
  {
    id: 'xperia1vi', name: 'Xperia 1 VI', brand: 'Sony', price: 179800, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB', camera: '52MP+12MP+12MP', battery: '5000mAh', display: '6.5" LTPO OLED 120Hz' },
    scores: { overall: 88, fps: 87, camera: 91, battery: 84 },
    benchmarks: { antutu: 2050000, geekbench_single: 2800, geekbench_multi: 8000, dmark: 12000 },
    weight: '192g', charge: '30W有線 / 15W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2024 — Others
  {
    id: 'nothing2a', name: 'Nothing Phone 2a', brand: 'Nothing', price: 44900, category: 'midrange', releaseYear: 2024,
    specs: { cpu: 'Dimensity 7200 Pro', ram: '8GB/12GB', storage: '128GB/256GB', camera: '50MP+50MP', battery: '5000mAh', display: '6.7" AMOLED 120Hz' },
    scores: { overall: 68, fps: 62, camera: 68, battery: 82 },
    benchmarks: { antutu: 700000, geekbench_single: 1000, geekbench_multi: 3400, dmark: 3500 },
    weight: '190g', charge: '45W有線', shopUrl: '', stock: 8, hasCase: false, hasGlass: true, tecApproved: false,
  },
  {
    id: 'honormagicv3', name: 'Magic V3', brand: 'Honor', price: 229900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP+40MP+50MP', battery: '5150mAh', display: '7.92"+6.43" LTPO AMOLED 120Hz' },
    scores: { overall: 89, fps: 88, camera: 86, battery: 82 },
    benchmarks: { antutu: 2100000, geekbench_single: 2850, geekbench_multi: 8200, dmark: 12500 },
    weight: '226g', charge: '66W有線', shopUrl: '', stock: 2, hasCase: true, hasGlass: false, tecApproved: false,
  },
  {
    id: 'findx7ultra', name: 'Find X7 Ultra', brand: 'OPPO', price: 139900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '256GB/512GB/1TB', camera: '50MP+50MP+50MP+50MP', battery: '5000mAh', display: '6.82" LTPO AMOLED 120Hz' },
    scores: { overall: 92, fps: 91, camera: 96, battery: 85 },
    benchmarks: { antutu: 2100000, geekbench_single: 2850, geekbench_multi: 8200, dmark: 12500 },
    weight: '221g', charge: '100W有線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // ═══════════════════════════════════════
  // 2023 — Samsung
  // ═══════════════════════════════════════
  {
    id: 's23u', name: 'Galaxy S23 Ultra', brand: 'Samsung', price: 164800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB/12GB', storage: '256GB/512GB/1TB', camera: '200MP+12MP+10MP+10MP', battery: '5000mAh', display: '6.8" LTPO AMOLED 120Hz' },
    scores: { overall: 90, fps: 89, camera: 92, battery: 85 },
    benchmarks: { antutu: 1600000, geekbench_single: 2400, geekbench_multi: 7000, dmark: 10500 },
    weight: '234g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's23plus', name: 'Galaxy S23+', brand: 'Samsung', price: 129800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '256GB/512GB', camera: '50MP+12MP+10MP', battery: '4700mAh', display: '6.6" AMOLED 120Hz' },
    scores: { overall: 84, fps: 85, camera: 82, battery: 82 },
    benchmarks: { antutu: 1550000, geekbench_single: 2350, geekbench_multi: 6800, dmark: 10000 },
    weight: '195g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 5, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 's23', name: 'Galaxy S23', brand: 'Samsung', price: 99800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '128GB/256GB', camera: '50MP+12MP+10MP', battery: '3900mAh', display: '6.1" AMOLED 120Hz' },
    scores: { overall: 81, fps: 83, camera: 79, battery: 77 },
    benchmarks: { antutu: 1500000, geekbench_single: 2300, geekbench_multi: 6600, dmark: 9500 },
    weight: '168g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 8, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'zfold5', name: 'Galaxy Z Fold 5', brand: 'Samsung', price: 249800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB/512GB/1TB', camera: '50MP+12MP+10MP', battery: '4400mAh', display: '7.6"+6.2" AMOLED 120Hz' },
    scores: { overall: 85, fps: 84, camera: 82, battery: 74 },
    benchmarks: { antutu: 1550000, geekbench_single: 2350, geekbench_multi: 6800, dmark: 10000 },
    weight: '253g', charge: '25W有線 / 15W無線', shopUrl: '', stock: 2, hasCase: true, hasGlass: false, tecApproved: true,
  },

  // 2023 — Apple
  {
    id: 'iphone15promax2023', name: 'iPhone 15 Pro Max', brand: 'Apple', price: 189800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'A17 Pro', ram: '8GB', storage: '256GB/512GB/1TB', camera: '48MP+12MP+12MP', battery: '4422mAh', display: '6.7" ProMotion OLED 120Hz' },
    scores: { overall: 94, fps: 94, camera: 94, battery: 88 },
    benchmarks: { antutu: 2200000, geekbench_single: 3300, geekbench_multi: 8700, dmark: 14500 },
    weight: '221g', charge: '27W有線 / 15W MagSafe', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2023 — Google
  {
    id: 'pixel7a', name: 'Pixel 7a', brand: 'Google', price: 62700, category: 'midrange', releaseYear: 2023,
    specs: { cpu: 'Tensor G2', ram: '8GB', storage: '128GB', camera: '64MP+13MP', battery: '4385mAh', display: '6.1" OLED 90Hz' },
    scores: { overall: 72, fps: 65, camera: 78, battery: 76 },
    benchmarks: { antutu: 1050000, geekbench_single: 1800, geekbench_multi: 5000, dmark: 6500 },
    weight: '193g', charge: '18W有線 / 7.5W無線', shopUrl: '', stock: 10, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2023 — Xiaomi
  {
    id: 'xiaomi13ultra', name: 'Xiaomi 13 Ultra', brand: 'Xiaomi', price: 119900, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB/16GB', storage: '256GB/512GB/1TB', camera: '50MP(IMX989)+50MP+50MP+50MP', battery: '5000mAh', display: '6.73" LTPO AMOLED 120Hz' },
    scores: { overall: 91, fps: 90, camera: 95, battery: 84 },
    benchmarks: { antutu: 1600000, geekbench_single: 2400, geekbench_multi: 7000, dmark: 10500 },
    weight: '227g', charge: '90W有線 / 50W無線', shopUrl: '', stock: 2, hasCase: true, hasGlass: true, tecApproved: false,
  },
  {
    id: 'xiaomi13pro', name: 'Xiaomi 13 Pro', brand: 'Xiaomi', price: 89900, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB/512GB', camera: '50MP(IMX989)+50MP+50MP', battery: '4820mAh', display: '6.73" LTPO AMOLED 120Hz' },
    scores: { overall: 88, fps: 88, camera: 92, battery: 82 },
    benchmarks: { antutu: 1550000, geekbench_single: 2350, geekbench_multi: 6900, dmark: 10200 },
    weight: '210g', charge: '120W有線 / 50W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2023 — OnePlus
  {
    id: 'oneplus11', name: 'OnePlus 11', brand: 'OnePlus', price: 89900, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB/16GB', storage: '256GB', camera: '50MP+48MP+32MP', battery: '5000mAh', display: '6.7" LTPO AMOLED 120Hz' },
    scores: { overall: 87, fps: 88, camera: 85, battery: 84 },
    benchmarks: { antutu: 1550000, geekbench_single: 2350, geekbench_multi: 6800, dmark: 10000 },
    weight: '205g', charge: '100W有線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },

  // 2023 — Sony
  {
    id: 'xperia1v', name: 'Xperia 1 V', brand: 'Sony', price: 159800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB/512GB', camera: '52MP+12MP+12MP', battery: '5000mAh', display: '6.5" OLED 120Hz' },
    scores: { overall: 86, fps: 85, camera: 90, battery: 82 },
    benchmarks: { antutu: 1550000, geekbench_single: 2350, geekbench_multi: 6800, dmark: 10000 },
    weight: '187g', charge: '30W有線 / 15W無線', shopUrl: '', stock: 2, hasCase: true, hasGlass: true, tecApproved: true,
  },
  {
    id: 'xperia5v', name: 'Xperia 5 V', brand: 'Sony', price: 119800, category: 'flagship', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8GB', storage: '128GB/256GB', camera: '48MP+12MP', battery: '5000mAh', display: '6.1" OLED 120Hz' },
    scores: { overall: 82, fps: 83, camera: 84, battery: 83 },
    benchmarks: { antutu: 1500000, geekbench_single: 2300, geekbench_multi: 6600, dmark: 9500 },
    weight: '182g', charge: '30W有線 / 15W無線', shopUrl: '', stock: 3, hasCase: true, hasGlass: true, tecApproved: true,
  },

  // 2023 — Nothing
  {
    id: 'nothing2', name: 'Nothing Phone 2', brand: 'Nothing', price: 79900, category: 'midrange', releaseYear: 2023,
    specs: { cpu: 'Snapdragon 8+ Gen 1', ram: '8GB/12GB', storage: '128GB/256GB', camera: '50MP+50MP', battery: '4700mAh', display: '6.7" LTPO OLED 120Hz' },
    scores: { overall: 76, fps: 78, camera: 74, battery: 80 },
    benchmarks: { antutu: 1200000, geekbench_single: 2000, geekbench_multi: 5500, dmark: 7500 },
    weight: '201g', charge: '45W有線 / 15W無線', shopUrl: '', stock: 5, hasCase: false, hasGlass: true, tecApproved: false,
  },

  // 2023 — Motorola
  {
    id: 'edge50ultra', name: 'Edge 50 Ultra', brand: 'Motorola', price: 109900, category: 'flagship', releaseYear: 2024,
    specs: { cpu: 'Snapdragon 8s Gen 3', ram: '16GB', storage: '512GB/1TB', camera: '50MP+64MP+50MP', battery: '4500mAh', display: '6.7" LTPO OLED 144Hz' },
    scores: { overall: 84, fps: 86, camera: 84, battery: 78 },
    benchmarks: { antutu: 1800000, geekbench_single: 2500, geekbench_multi: 7000, dmark: 9500 },
    weight: '197g', charge: '125W有線 / 50W無線', shopUrl: '', stock: 4, hasCase: true, hasGlass: true, tecApproved: false,
  },
];

(async () => {
  console.log(`\n📱 ${phones.length}機種を登録開始...\n`);
  let success = 0;
  let fail = 0;

  for (const phone of phones) {
    const { id, ...data } = phone;
    try {
      await setDoc(doc(db, 'phones', id), data);
      console.log(`  ✅ ${data.name} (${id})`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${data.name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n完了: ${success}件成功 / ${fail}件失敗 (全${phones.length}件)\n`);
  process.exit(0);
})();
