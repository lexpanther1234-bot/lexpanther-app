const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc } = require('firebase/firestore');
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

// Helper: phone entry builder
const p = (id, name, brand, price, cpu, ram, storage, camera, battery, display, cat, year, scores, weight, charge, shopUrl = '') => ({
  id, name, brand, price, image: '',
  specs: { cpu, ram, storage, camera, battery, display },
  category: cat, releaseYear: year, scores, weight, charge, shopUrl,
});

const PHONES = [

  // ════════════════════════════════════════════════════════════
  //  APPLE
  // ════════════════════════════════════════════════════════════

  // 2020 — iPhone 12
  p('ip12',     'iPhone 12',          'Apple', 94380,  'A14 Bionic','4GB','64GB','12MP','2815mAh','6.1" OLED','flagship',2020,{overall:82,fps:84,camera:83,battery:70},'162g','20W'),
  p('ip12mini', 'iPhone 12 mini',     'Apple', 82280,  'A14 Bionic','4GB','64GB','12MP','2227mAh','5.4" OLED','flagship',2020,{overall:80,fps:84,camera:83,battery:60},'133g','20W'),
  p('ip12p',    'iPhone 12 Pro',      'Apple', 117480, 'A14 Bionic','6GB','128GB','12MP','2815mAh','6.1" OLED','flagship',2020,{overall:85,fps:86,camera:88,battery:72},'187g','20W'),
  p('ip12pm',   'iPhone 12 Pro Max',  'Apple', 129580, 'A14 Bionic','6GB','128GB','12MP','3687mAh','6.7" OLED','flagship',2020,{overall:87,fps:86,camera:90,battery:78},'226g','20W'),

  // 2021 — iPhone 13
  p('ip13',     'iPhone 13',          'Apple', 98800,  'A15 Bionic','4GB','128GB','12MP','3227mAh','6.1" OLED','flagship',2021,{overall:85,fps:88,camera:85,battery:78},'173g','20W'),
  p('ip13mini', 'iPhone 13 mini',     'Apple', 86800,  'A15 Bionic','4GB','128GB','12MP','2406mAh','5.4" OLED','flagship',2021,{overall:83,fps:88,camera:85,battery:65},'140g','20W'),
  p('ip13p',    'iPhone 13 Pro',      'Apple', 122800, 'A15 Bionic','6GB','128GB','12MP','3095mAh','6.1" OLED 120Hz','flagship',2021,{overall:89,fps:91,camera:91,battery:77},'203g','20W'),
  p('ip13pm',   'iPhone 13 Pro Max',  'Apple', 134800, 'A15 Bionic','6GB','128GB','12MP','4352mAh','6.7" OLED 120Hz','flagship',2021,{overall:91,fps:91,camera:92,battery:86},'238g','20W'),

  // 2022 — iPhone 14
  p('ip14',     'iPhone 14',          'Apple', 119800, 'A15 Bionic','6GB','128GB','12MP','3279mAh','6.1" OLED','flagship',2022,{overall:86,fps:88,camera:86,battery:79},'172g','20W'),
  p('ip14plus', 'iPhone 14 Plus',     'Apple', 134800, 'A15 Bionic','6GB','128GB','12MP','4325mAh','6.7" OLED','flagship',2022,{overall:87,fps:88,camera:86,battery:87},'203g','20W'),
  p('ip14p',    'iPhone 14 Pro',      'Apple', 149800, 'A16 Bionic','6GB','128GB','48MP','3200mAh','6.1" OLED 120Hz','flagship',2022,{overall:91,fps:93,camera:93,battery:78},'206g','20W'),
  p('ip14pm',   'iPhone 14 Pro Max',  'Apple', 164800, 'A16 Bionic','6GB','128GB','48MP','4323mAh','6.7" OLED 120Hz','flagship',2022,{overall:93,fps:94,camera:94,battery:87},'240g','20W'),

  // 2023 — iPhone 15
  p('ip15',     'iPhone 15',          'Apple', 124800, 'A16 Bionic','6GB','128GB','48MP','3349mAh','6.1" OLED','flagship',2023,{overall:88,fps:90,camera:89,battery:80},'171g','20W'),
  p('ip15plus', 'iPhone 15 Plus',     'Apple', 139800, 'A16 Bionic','6GB','128GB','48MP','4383mAh','6.7" OLED','flagship',2023,{overall:89,fps:90,camera:89,battery:88},'201g','20W'),
  p('ip15p',    'iPhone 15 Pro',      'Apple', 159800, 'A17 Pro','8GB','128GB','48MP','3274mAh','6.1" OLED 120Hz','flagship',2023,{overall:93,fps:96,camera:94,battery:80},'187g','20W'),
  p('ip15pm',   'iPhone 15 Pro Max',  'Apple', 189800, 'A17 Pro','8GB','256GB','48MP','4422mAh','6.7" OLED 120Hz','flagship',2023,{overall:95,fps:97,camera:95,battery:88},'221g','20W'),

  // 2024 — iPhone 16
  p('ip16',     'iPhone 16',          'Apple', 124800, 'A18','8GB','128GB','48MP','3561mAh','6.1" OLED','flagship',2024,{overall:90,fps:93,camera:90,battery:82},'170g','25W'),
  p('ip16plus', 'iPhone 16 Plus',     'Apple', 139800, 'A18','8GB','128GB','48MP','4674mAh','6.7" OLED','flagship',2024,{overall:91,fps:93,camera:90,battery:89},'199g','25W'),
  p('ip16p',    'iPhone 16 Pro',      'Apple', 159800, 'A18 Pro','8GB','256GB','48MP','3582mAh','6.3" OLED 120Hz','flagship',2024,{overall:93,fps:98,camera:95,battery:83},'199g','27W'),
  p('ip16pm',   'iPhone 16 Pro Max',  'Apple', 198800, 'A18 Pro','8GB','256GB','48MP','4685mAh','6.9" OLED 120Hz','flagship',2024,{overall:95,fps:99,camera:96,battery:88},'227g','30W','https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro'),

  // 2025 — iPhone 17
  p('ip17',     'iPhone 17',          'Apple', 124800, 'A19','8GB','128GB','48MP','3600mAh','6.1" OLED 120Hz','flagship',2025,{overall:91,fps:94,camera:91,battery:83},'170g','30W'),
  p('ip17air',  'iPhone 17 Air',      'Apple', 134800, 'A19','8GB','256GB','48MP','3000mAh','6.6" OLED 120Hz','flagship',2025,{overall:88,fps:92,camera:89,battery:72},'145g','30W'),
  p('ip17p',    'iPhone 17 Pro',      'Apple', 169800, 'A19 Pro','12GB','256GB','48MP','3700mAh','6.3" OLED 120Hz','flagship',2025,{overall:95,fps:98,camera:96,battery:85},'190g','30W'),
  p('ip17pm',   'iPhone 17 Pro Max',  'Apple', 209800, 'A19 Pro','12GB','256GB','48MP','4700mAh','6.9" OLED 120Hz','flagship',2025,{overall:97,fps:99,camera:97,battery:91},'220g','30W'),

  // 2026 — iPhone 17e
  p('ip17e',    'iPhone 17e',         'Apple', 99800,  'A18','8GB','128GB','48MP','3500mAh','6.1" OLED','flagship',2026,{overall:88,fps:90,camera:87,battery:80},'165g','25W'),

  // ════════════════════════════════════════════════════════════
  //  SAMSUNG Galaxy S series
  // ════════════════════════════════════════════════════════════

  // 2020 — S20
  p('s20',  'Galaxy S20',       'Samsung', 102960,'Exynos 990','12GB','128GB','12MP','4000mAh','6.2" AMOLED 120Hz','flagship',2020,{overall:82,fps:83,camera:84,battery:78},'163g','25W'),
  p('s20p', 'Galaxy S20+',      'Samsung', 114840,'Exynos 990','12GB','128GB','12MP','4500mAh','6.7" AMOLED 120Hz','flagship',2020,{overall:84,fps:83,camera:85,battery:82},'186g','25W'),
  p('s20u', 'Galaxy S20 Ultra',  'Samsung', 136620,'Exynos 990','12GB','128GB','108MP','5000mAh','6.9" AMOLED 120Hz','flagship',2020,{overall:86,fps:84,camera:89,battery:84},'220g','45W'),

  // 2021 — S21
  p('s21',  'Galaxy S21',       'Samsung', 99800, 'Exynos 2100','8GB','256GB','12MP','4000mAh','6.2" AMOLED 120Hz','flagship',2021,{overall:84,fps:86,camera:85,battery:79},'169g','25W'),
  p('s21p', 'Galaxy S21+',      'Samsung', 118800,'Exynos 2100','8GB','256GB','12MP','4800mAh','6.7" AMOLED 120Hz','flagship',2021,{overall:86,fps:86,camera:86,battery:84},'200g','25W'),
  p('s21u', 'Galaxy S21 Ultra',  'Samsung', 151800,'Exynos 2100','12GB','256GB','108MP','5000mAh','6.8" AMOLED 120Hz','flagship',2021,{overall:90,fps:88,camera:93,battery:86},'227g','25W'),

  // 2022 — S22
  p('s22',  'Galaxy S22',       'Samsung', 99800, 'Snapdragon 8 Gen 1','8GB','256GB','50MP','3700mAh','6.1" AMOLED 120Hz','flagship',2022,{overall:85,fps:88,camera:87,battery:74},'167g','25W'),
  p('s22p', 'Galaxy S22+',      'Samsung', 122800,'Snapdragon 8 Gen 1','8GB','256GB','50MP','4500mAh','6.6" AMOLED 120Hz','flagship',2022,{overall:87,fps:88,camera:88,battery:82},'195g','45W'),
  p('s22u', 'Galaxy S22 Ultra',  'Samsung', 159800,'Snapdragon 8 Gen 1','12GB','256GB','108MP','5000mAh','6.8" AMOLED 120Hz','flagship',2022,{overall:91,fps:90,camera:94,battery:86},'228g','45W'),

  // 2023 — S23
  p('s23',  'Galaxy S23',       'Samsung', 114800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','3900mAh','6.1" AMOLED 120Hz','flagship',2023,{overall:87,fps:91,camera:88,battery:78},'168g','25W'),
  p('s23p', 'Galaxy S23+',      'Samsung', 134800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','4700mAh','6.6" AMOLED 120Hz','flagship',2023,{overall:89,fps:91,camera:89,battery:85},'195g','45W'),
  p('s23u', 'Galaxy S23 Ultra',  'Samsung', 164800,'Snapdragon 8 Gen 2','12GB','256GB','200MP','5000mAh','6.8" AMOLED 120Hz','flagship',2023,{overall:93,fps:93,camera:96,battery:88},'233g','45W'),

  // 2024 — S24
  p('s24',  'Galaxy S24',       'Samsung', 124800,'Exynos 2400','8GB','256GB','50MP','4000mAh','6.2" AMOLED 120Hz','flagship',2024,{overall:88,fps:90,camera:89,battery:80},'167g','25W'),
  p('s24p', 'Galaxy S24+',      'Samsung', 144800,'Exynos 2400','12GB','256GB','50MP','4900mAh','6.7" AMOLED 120Hz','flagship',2024,{overall:90,fps:91,camera:90,battery:86},'196g','45W'),
  p('s24u', 'Galaxy S24 Ultra',  'Samsung', 189800,'Snapdragon 8 Gen 3','12GB','256GB','200MP','5000mAh','6.8" AMOLED 120Hz','flagship',2024,{overall:95,fps:95,camera:97,battery:90},'232g','45W'),

  // 2025 — S25
  p('s25',  'Galaxy S25',       'Samsung', 124800,'Snapdragon 8 Elite','12GB','256GB','50MP','4000mAh','6.2" AMOLED 120Hz','flagship',2025,{overall:90,fps:93,camera:90,battery:82},'162g','25W'),
  p('s25p', 'Galaxy S25+',      'Samsung', 154800,'Snapdragon 8 Elite','12GB','256GB','50MP','4900mAh','6.7" AMOLED 120Hz','flagship',2025,{overall:93,fps:95,camera:92,battery:88},'190g','45W'),
  p('s25u', 'Galaxy S25 Ultra',  'Samsung', 189800,'Snapdragon 8 Elite','12GB','256GB','200MP','5000mAh','6.9" AMOLED 120Hz','flagship',2025,{overall:96,fps:97,camera:97,battery:94},'218g','45W','https://www.samsung.com/jp/smartphones/galaxy-s25-ultra/'),

  // 2026 — S26
  p('s26',  'Galaxy S26',       'Samsung', 129800,'Snapdragon 8 Elite 2','12GB','256GB','50MP','4200mAh','6.2" AMOLED 120Hz','flagship',2026,{overall:92,fps:95,camera:92,battery:84},'160g','45W'),
  p('s26p', 'Galaxy S26+',      'Samsung', 169800,'Snapdragon 8 Elite 2','12GB','256GB','50MP','5000mAh','6.7" AMOLED 120Hz','flagship',2026,{overall:93,fps:96,camera:91,battery:93},'195g','45W'),
  p('s26u', 'Galaxy S26 Ultra',  'Samsung', 199800,'Snapdragon 8 Elite 2','12GB','512GB','200MP','5000mAh','6.9" AMOLED 120Hz','flagship',2026,{overall:98,fps:98,camera:99,battery:95},'220g','65W'),

  // Samsung Galaxy Z Fold/Flip (2025)
  p('zfold7', 'Galaxy Z Fold7',    'Samsung', 249800,'Snapdragon 8 Elite','12GB','256GB','50MP','4400mAh','7.6" AMOLED 120Hz','flagship',2025,{overall:90,fps:91,camera:88,battery:76},'239g','25W'),
  p('zflip7', 'Galaxy Z Flip7',    'Samsung', 159800,'Snapdragon 8 Elite','12GB','256GB','50MP','4000mAh','6.7" AMOLED 120Hz','flagship',2025,{overall:85,fps:90,camera:82,battery:73},'187g','25W'),
  p('zflip7fe','Galaxy Z Flip7 FE','Samsung', 119800,'Snapdragon 8 Gen 3','8GB','128GB','50MP','3700mAh','6.7" AMOLED 120Hz','flagship',2025,{overall:80,fps:85,camera:78,battery:68},'190g','25W'),

  // Samsung Galaxy A (midrange)
  p('a51',  'Galaxy A51',       'Samsung', 41800, 'Exynos 9611','6GB','128GB','48MP','4000mAh','6.5" AMOLED','midrange',2020,{overall:62,fps:52,camera:60,battery:75},'172g','15W'),
  p('a52',  'Galaxy A52',       'Samsung', 43800, 'Snapdragon 720G','6GB','128GB','64MP','4500mAh','6.5" AMOLED 90Hz','midrange',2021,{overall:65,fps:55,camera:65,battery:80},'189g','25W'),
  p('a52s', 'Galaxy A52s 5G',   'Samsung', 53800, 'Snapdragon 778G','6GB','128GB','64MP','4500mAh','6.5" AMOLED 120Hz','midrange',2021,{overall:70,fps:65,camera:66,battery:80},'189g','25W'),
  p('a53',  'Galaxy A53 5G',    'Samsung', 53800, 'Exynos 1280','6GB','128GB','64MP','5000mAh','6.5" AMOLED 120Hz','midrange',2022,{overall:67,fps:58,camera:64,battery:85},'189g','25W'),
  p('a54',  'Galaxy A54 5G',    'Samsung', 59800, 'Exynos 1380','6GB','128GB','50MP','5000mAh','6.4" AMOLED 120Hz','midrange',2023,{overall:70,fps:62,camera:68,battery:86},'202g','25W'),
  p('a55',  'Galaxy A55 5G',    'Samsung', 59800, 'Exynos 1480','8GB','128GB','50MP','5000mAh','6.6" AMOLED 120Hz','midrange',2024,{overall:73,fps:65,camera:70,battery:87},'213g','25W'),

  // ════════════════════════════════════════════════════════════
  //  GOOGLE Pixel
  // ════════════════════════════════════════════════════════════

  p('p5',    'Pixel 5',        'Google', 74800, 'Snapdragon 765G','8GB','128GB','12.2MP','4080mAh','6.0" OLED 90Hz','flagship',2020,{overall:78,fps:65,camera:85,battery:82},'151g','18W'),

  p('p6',    'Pixel 6',        'Google', 74800, 'Google Tensor','8GB','128GB','50MP','4614mAh','6.4" OLED 90Hz','flagship',2021,{overall:82,fps:72,camera:89,battery:82},'207g','30W'),
  p('p6p',   'Pixel 6 Pro',    'Google', 116600,'Google Tensor','12GB','128GB','50MP','5003mAh','6.7" OLED 120Hz','flagship',2021,{overall:85,fps:74,camera:92,battery:84},'210g','30W'),

  p('p7',    'Pixel 7',        'Google', 82500, 'Google Tensor G2','8GB','128GB','50MP','4355mAh','6.3" OLED 90Hz','flagship',2022,{overall:84,fps:75,camera:90,battery:80},'197g','30W'),
  p('p7p',   'Pixel 7 Pro',    'Google', 124300,'Google Tensor G2','12GB','128GB','50MP','5000mAh','6.7" OLED 120Hz','flagship',2022,{overall:87,fps:77,camera:93,battery:84},'212g','30W'),
  p('p7a',   'Pixel 7a',       'Google', 62700, 'Google Tensor G2','8GB','128GB','64MP','4385mAh','6.1" OLED 90Hz','midrange',2023,{overall:80,fps:72,camera:85,battery:79},'193g','18W'),

  p('p8',    'Pixel 8',        'Google', 112900,'Google Tensor G3','8GB','128GB','50MP','4575mAh','6.2" OLED 120Hz','flagship',2023,{overall:87,fps:80,camera:92,battery:83},'187g','27W'),
  p('p8p',   'Pixel 8 Pro',    'Google', 159900,'Google Tensor G3','12GB','128GB','50MP','5050mAh','6.7" OLED 120Hz','flagship',2023,{overall:90,fps:82,camera:94,battery:87},'213g','30W'),
  p('p8a',   'Pixel 8a',       'Google', 72600, 'Google Tensor G3','8GB','128GB','64MP','4492mAh','6.1" OLED 120Hz','midrange',2024,{overall:83,fps:76,camera:87,battery:81},'188g','18W'),

  p('p9',    'Pixel 9',        'Google', 128900,'Google Tensor G4','12GB','128GB','50MP','4700mAh','6.3" OLED 120Hz','flagship',2024,{overall:89,fps:84,camera:93,battery:86},'198g','27W'),
  p('p9p',   'Pixel 9 Pro',    'Google', 159900,'Google Tensor G4','16GB','128GB','50MP','4700mAh','6.3" OLED 120Hz','flagship',2024,{overall:91,fps:86,camera:95,battery:86},'199g','27W','https://store.google.com/jp/product/pixel_9_pro'),
  p('p9pxl', 'Pixel 9 Pro XL', 'Google', 179800,'Google Tensor G4','16GB','256GB','50MP','5060mAh','6.8" OLED 120Hz','flagship',2024,{overall:92,fps:89,camera:95,battery:93},'221g','37W','https://store.google.com/jp/product/pixel_9_pro'),

  // ════════════════════════════════════════════════════════════
  //  SONY Xperia
  // ════════════════════════════════════════════════════════════

  p('xp1iii', 'Xperia 1 III',  'Sony', 154000,'Snapdragon 888','12GB','256GB','12MP','4500mAh','6.5" OLED 120Hz','flagship',2021,{overall:85,fps:86,camera:88,battery:78},'186g','30W'),
  p('xp1iv',  'Xperia 1 IV',   'Sony', 174900,'Snapdragon 8 Gen 1','12GB','256GB','12MP','5000mAh','6.5" OLED 120Hz','flagship',2022,{overall:87,fps:88,camera:89,battery:82},'185g','30W'),
  p('xp1v',   'Xperia 1 V',    'Sony', 194700,'Snapdragon 8 Gen 2','12GB','256GB','52MP','5000mAh','6.5" OLED 120Hz','flagship',2023,{overall:89,fps:90,camera:92,battery:85},'187g','30W'),
  p('xp1vi',  'Xperia 1 VI',   'Sony', 189800,'Snapdragon 8 Gen 3','12GB','256GB','52MP','5000mAh','6.5" OLED 120Hz','flagship',2024,{overall:87,fps:90,camera:91,battery:89},'192g','30W'),

  p('xp5iii', 'Xperia 5 III',  'Sony', 114400,'Snapdragon 888','8GB','128GB','12MP','4500mAh','6.1" OLED 120Hz','flagship',2021,{overall:82,fps:84,camera:85,battery:80},'168g','30W'),
  p('xp5iv',  'Xperia 5 IV',   'Sony', 119900,'Snapdragon 8 Gen 1','8GB','128GB','12MP','5000mAh','6.1" OLED 120Hz','flagship',2022,{overall:84,fps:86,camera:86,battery:84},'172g','30W'),
  p('xp5v',   'Xperia 5 V',    'Sony', 139700,'Snapdragon 8 Gen 2','8GB','128GB','52MP','5000mAh','6.1" OLED 120Hz','flagship',2023,{overall:86,fps:88,camera:89,battery:86},'182g','30W'),

  p('xp10iv', 'Xperia 10 IV',  'Sony', 60500, 'Snapdragon 695','6GB','128GB','12MP','5000mAh','6.0" OLED','midrange',2022,{overall:60,fps:48,camera:58,battery:88},'159g','18W'),
  p('xp10v',  'Xperia 10 V',   'Sony', 67100, 'Snapdragon 695','6GB','128GB','48MP','5000mAh','6.1" OLED','midrange',2023,{overall:62,fps:50,camera:62,battery:89},'159g','18W'),
  p('xp10vi', 'Xperia 10 VI',  'Sony', 69300, 'Snapdragon 6 Gen 1','6GB','128GB','48MP','5000mAh','6.1" OLED','midrange',2024,{overall:65,fps:55,camera:63,battery:90},'164g','18W'),

  // ════════════════════════════════════════════════════════════
  //  XIAOMI (Mi → Xiaomi rebrand)
  // ════════════════════════════════════════════════════════════

  // 2021 — Mi 11 series
  p('mi11',     'Mi 11',          'Xiaomi', 79800, 'Snapdragon 888','8GB','128GB','108MP','4600mAh','6.81" AMOLED 120Hz','flagship',2021,{overall:84,fps:86,camera:86,battery:78},'196g','55W'),
  p('mi11u',    'Mi 11 Ultra',    'Xiaomi', 119800,'Snapdragon 888','12GB','256GB','50MP GN2','5000mAh','6.81" AMOLED 120Hz','flagship',2021,{overall:88,fps:87,camera:94,battery:82},'234g','67W'),
  p('mi11i',    'Mi 11i',         'Xiaomi', 59800, 'Snapdragon 888','8GB','128GB','108MP','4520mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:83,fps:86,camera:82,battery:76},'196g','33W'),
  p('mi11lite', 'Mi 11 Lite 5G',  'Xiaomi', 39800, 'Snapdragon 780G','6GB','128GB','64MP','4250mAh','6.55" AMOLED 90Hz','midrange',2021,{overall:70,fps:64,camera:66,battery:75},'159g','33W'),
  p('mi11t',    'Mi 11T',         'Xiaomi', 54800, 'Dimensity 1200','8GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:78,fps:80,camera:78,battery:82},'203g','67W'),
  p('mi11tp',   'Mi 11T Pro',     'Xiaomi', 69800, 'Snapdragon 888','8GB','256GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:82,fps:86,camera:82,battery:82},'204g','120W'),
  p('mimix4',   'Mi Mix 4',       'Xiaomi', 89800, 'Snapdragon 888+','8GB','128GB','108MP','4500mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:83,fps:86,camera:84,battery:76},'225g','120W'),

  // 2022 — Xiaomi 12 series
  p('xi12',     'Xiaomi 12',      'Xiaomi', 89800, 'Snapdragon 8 Gen 1','8GB','256GB','50MP','4500mAh','6.28" AMOLED 120Hz','flagship',2022,{overall:83,fps:86,camera:84,battery:78},'180g','67W'),
  p('xi12p',    'Xiaomi 12 Pro',  'Xiaomi', 109800,'Snapdragon 8 Gen 1','12GB','256GB','50MP','4600mAh','6.73" AMOLED 120Hz','flagship',2022,{overall:86,fps:88,camera:88,battery:79},'205g','120W'),
  p('xi12u',    'Xiaomi 12 Ultra','Xiaomi', 129800,'Snapdragon 8+ Gen 1','12GB','256GB','50MP 1inch','4860mAh','6.73" AMOLED 120Hz','flagship',2022,{overall:89,fps:90,camera:94,battery:82},'225g','67W'),
  p('xi12x',    'Xiaomi 12X',     'Xiaomi', 59800, 'Snapdragon 870','8GB','128GB','50MP','4500mAh','6.28" AMOLED 120Hz','flagship',2022,{overall:78,fps:80,camera:78,battery:78},'176g','67W'),
  p('xi12t',    'Xiaomi 12T',     'Xiaomi', 54800, 'Dimensity 8100','8GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:76,fps:78,camera:78,battery:83},'202g','120W'),
  p('xi12tp',   'Xiaomi 12T Pro', 'Xiaomi', 79800, 'Snapdragon 8+ Gen 1','8GB','256GB','200MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:84,fps:90,camera:86,battery:83},'205g','120W'),
  p('xi12su',   'Xiaomi 12S Ultra','Xiaomi',119800,'Snapdragon 8+ Gen 1','12GB','256GB','Leica 50MP 1inch','4860mAh','6.73" AMOLED 120Hz','flagship',2022,{overall:90,fps:90,camera:96,battery:82},'225g','67W'),
  p('xi12lite', 'Xiaomi 12 Lite', 'Xiaomi', 39800, 'Snapdragon 778G','6GB','128GB','108MP','4300mAh','6.55" AMOLED 120Hz','midrange',2022,{overall:68,fps:62,camera:68,battery:74},'173g','67W'),

  // 2023 — Xiaomi 13 series
  p('xi13',     'Xiaomi 13',      'Xiaomi', 99800, 'Snapdragon 8 Gen 2','8GB','256GB','Leica 50MP','4500mAh','6.36" AMOLED 120Hz','flagship',2023,{overall:88,fps:90,camera:90,battery:80},'185g','67W'),
  p('xi13p',    'Xiaomi 13 Pro',  'Xiaomi', 129800,'Snapdragon 8 Gen 2','12GB','256GB','Leica 50MP 1inch','4820mAh','6.73" AMOLED 120Hz','flagship',2023,{overall:91,fps:92,camera:95,battery:83},'229g','120W'),
  p('xi13u',    'Xiaomi 13 Ultra','Xiaomi', 149800,'Snapdragon 8 Gen 2','16GB','512GB','Leica 50MP 1inch','5000mAh','6.73" AMOLED 120Hz','flagship',2023,{overall:93,fps:92,camera:97,battery:86},'227g','90W'),
  p('xi13t',    'Xiaomi 13T',     'Xiaomi', 54800, 'Dimensity 8200','8GB','256GB','50MP','5000mAh','6.67" AMOLED 144Hz','flagship',2023,{overall:76,fps:74,camera:76,battery:84},'197g','67W'),
  p('xi13tp',   'Xiaomi 13T Pro', 'Xiaomi', 79800, 'Dimensity 9200+','12GB','256GB','Leica 50MP','5000mAh','6.67" AMOLED 144Hz','flagship',2023,{overall:84,fps:88,camera:88,battery:84},'206g','120W'),
  p('xi13lite', 'Xiaomi 13 Lite', 'Xiaomi', 44800, 'Snapdragon 7 Gen 1','8GB','128GB','50MP','4500mAh','6.55" AMOLED 120Hz','midrange',2023,{overall:68,fps:62,camera:66,battery:78},'171g','67W'),
  p('ximixf3',  'Xiaomi Mix Fold 3','Xiaomi',149800,'Snapdragon 8 Gen 2','16GB','512GB','Leica 50MP','5000mAh','8.03" AMOLED 120Hz','flagship',2023,{overall:90,fps:90,camera:92,battery:82},'259g','67W'),

  // 2024 — Xiaomi 14 series
  p('xi14',     'Xiaomi 14',      'Xiaomi', 109800,'Snapdragon 8 Gen 3','12GB','256GB','Leica 50MP','4610mAh','6.36" AMOLED 120Hz','flagship',2024,{overall:90,fps:93,camera:92,battery:82},'188g','90W'),
  p('xi14p',    'Xiaomi 14 Pro',  'Xiaomi', 129800,'Snapdragon 8 Gen 3','12GB','256GB','Leica 50MP','4880mAh','6.73" AMOLED 120Hz','flagship',2024,{overall:92,fps:94,camera:95,battery:84},'223g','120W'),
  p('xi14u',    'Xiaomi 14 Ultra','Xiaomi', 139800,'Snapdragon 8 Gen 3','16GB','512GB','Leica 50MP','5000mAh','6.73" AMOLED 120Hz','flagship',2024,{overall:93,fps:94,camera:98,battery:93},'229g','90W','https://www.mi.com/global/product/xiaomi-14-ultra'),
  p('xi14t',    'Xiaomi 14T',     'Xiaomi', 59800, 'Dimensity 8300','8GB','256GB','Leica 50MP','5000mAh','6.67" AMOLED 144Hz','flagship',2024,{overall:78,fps:76,camera:78,battery:85},'195g','67W'),
  p('xi14tp',   'Xiaomi 14T Pro', 'Xiaomi', 89800, 'Dimensity 9300+','12GB','256GB','Leica 50MP','5000mAh','6.67" AMOLED 144Hz','flagship',2024,{overall:88,fps:91,camera:90,battery:85},'209g','120W'),
  p('ximixf4',  'Xiaomi Mix Fold 4','Xiaomi',159800,'Snapdragon 8 Gen 3','16GB','512GB','Leica 50MP','5100mAh','7.98" AMOLED 120Hz','flagship',2024,{overall:92,fps:93,camera:93,battery:84},'226g','67W'),
  p('ximixflip','Xiaomi Mix Flip', 'Xiaomi', 99800, 'Snapdragon 8 Gen 3','12GB','256GB','Leica 50MP','4780mAh','6.86" AMOLED 120Hz','flagship',2024,{overall:86,fps:90,camera:86,battery:78},'192g','67W'),

  // 2025 — Xiaomi 15 series
  p('xi15',     'Xiaomi 15',      'Xiaomi', 109800,'Snapdragon 8 Elite','12GB','256GB','Leica 50MP','5400mAh','6.36" AMOLED 120Hz','flagship',2025,{overall:93,fps:95,camera:93,battery:90},'189g','90W'),
  p('xi15p',    'Xiaomi 15 Pro',  'Xiaomi', 129800,'Snapdragon 8 Elite','16GB','512GB','Leica 50MP','6100mAh','6.73" AMOLED 120Hz','flagship',2025,{overall:95,fps:96,camera:96,battery:95},'215g','90W'),
  p('xi15u',    'Xiaomi 15 Ultra','Xiaomi', 149800,'Snapdragon 8 Elite','16GB','512GB','Leica 50MP','6000mAh','6.73" AMOLED 120Hz','flagship',2025,{overall:97,fps:96,camera:99,battery:98},'233g','90W'),
  p('xi15t',    'Xiaomi 15T',     'Xiaomi', 59800, 'Dimensity 8400','8GB','256GB','Leica 50MP','5500mAh','6.67" AMOLED 144Hz','flagship',2025,{overall:80,fps:78,camera:80,battery:88},'193g','67W'),
  p('xi15tp',   'Xiaomi 15T Pro', 'Xiaomi', 89800, 'Dimensity 9400','12GB','256GB','Leica 50MP','5500mAh','6.67" AMOLED 144Hz','flagship',2025,{overall:90,fps:93,camera:92,battery:88},'205g','120W'),

  // ════════════════════════════════════════════════════════════
  //  REDMI
  // ════════════════════════════════════════════════════════════

  // Note 10 (2021)
  p('rn10',     'Redmi Note 10',       'Xiaomi', 19800,'Snapdragon 678','4GB','64GB','48MP','5000mAh','6.43" AMOLED','midrange',2021,{overall:55,fps:40,camera:54,battery:84},'178g','33W'),
  p('rn10p',    'Redmi Note 10 Pro',   'Xiaomi', 29800,'Snapdragon 732G','6GB','64GB','108MP','5020mAh','6.67" AMOLED 120Hz','midrange',2021,{overall:62,fps:50,camera:64,battery:85},'193g','33W'),
  p('rn10s',    'Redmi Note 10S',      'Xiaomi', 22800,'Helio G95','6GB','64GB','64MP','5000mAh','6.43" AMOLED','midrange',2021,{overall:58,fps:46,camera:58,battery:84},'178g','33W'),

  // Note 11 (2022)
  p('rn11',     'Redmi Note 11',       'Xiaomi', 24800,'Snapdragon 680','4GB','64GB','50MP','5000mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:55,fps:40,camera:55,battery:85},'179g','33W'),
  p('rn11p',    'Redmi Note 11 Pro',   'Xiaomi', 34800,'Helio G96','6GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2022,{overall:60,fps:48,camera:62,battery:85},'202g','67W'),
  p('rn11s',    'Redmi Note 11S',      'Xiaomi', 26800,'Helio G96','6GB','64GB','108MP','5000mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:58,fps:46,camera:60,battery:85},'179g','33W'),
  p('rn11pp',   'Redmi Note 11 Pro+',  'Xiaomi', 39800,'Dimensity 920','6GB','128GB','108MP','4500mAh','6.67" AMOLED 120Hz','midrange',2022,{overall:64,fps:55,camera:62,battery:78},'204g','120W'),

  // Note 12 (2023)
  p('rn12',     'Redmi Note 12',       'Xiaomi', 24800,'Snapdragon 685','4GB','128GB','50MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:57,fps:42,camera:56,battery:86},'188g','33W'),
  p('rn12p',    'Redmi Note 12 Pro',   'Xiaomi', 39800,'Dimensity 1080','6GB','128GB','50MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:65,fps:55,camera:66,battery:85},'187g','67W'),
  p('rn12pp',   'Redmi Note 12 Pro+',  'Xiaomi', 49800,'Dimensity 1080','8GB','256GB','200MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:68,fps:56,camera:72,battery:85},'210g','120W'),
  p('rn12s',    'Redmi Note 12S',      'Xiaomi', 26800,'Snapdragon 7s Gen 2','6GB','128GB','108MP','5000mAh','6.43" AMOLED 90Hz','midrange',2023,{overall:62,fps:52,camera:62,battery:85},'176g','33W'),

  // Note 13 (2024)
  p('rn13',     'Redmi Note 13',       'Xiaomi', 24800,'Snapdragon 685','6GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:60,fps:44,camera:60,battery:87},'188g','33W'),
  p('rn13p',    'Redmi Note 13 Pro',   'Xiaomi', 39800,'Snapdragon 7s Gen 2','8GB','256GB','200MP','5100mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:68,fps:60,camera:72,battery:86},'187g','67W'),
  p('rn13pp',   'Redmi Note 13 Pro+',  'Xiaomi', 49800,'Dimensity 7200','8GB','256GB','200MP','5000mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:72,fps:65,camera:74,battery:84},'204g','120W'),

  // Note 14 (2025)
  p('rn14',     'Redmi Note 14',       'Xiaomi', 24800,'Snapdragon 4 Gen 2','6GB','128GB','108MP','5500mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:62,fps:46,camera:62,battery:90},'190g','33W'),
  p('rn14p',    'Redmi Note 14 Pro',   'Xiaomi', 39800,'Dimensity 7300','8GB','256GB','200MP','5500mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:70,fps:62,camera:74,battery:90},'190g','45W'),
  p('rn14pp',   'Redmi Note 14 Pro+',  'Xiaomi', 49800,'Snapdragon 7s Gen 3','8GB','256GB','200MP','5110mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:75,fps:68,camera:76,battery:86},'205g','90W'),

  // Redmi K series
  p('rk40',     'Redmi K40',           'Xiaomi', 39800,'Snapdragon 870','6GB','128GB','48MP','4520mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:78,fps:82,camera:72,battery:78},'196g','33W'),
  p('rk40p',    'Redmi K40 Pro',       'Xiaomi', 49800,'Snapdragon 888','8GB','128GB','64MP','4520mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:82,fps:86,camera:76,battery:78},'196g','33W'),
  p('rk40pp',   'Redmi K40 Pro+',      'Xiaomi', 54800,'Snapdragon 888','8GB','256GB','108MP','4520mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:83,fps:86,camera:80,battery:78},'196g','33W'),
  p('rk50',     'Redmi K50',           'Xiaomi', 39800,'Dimensity 8100','8GB','128GB','48MP','5500mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:78,fps:78,camera:70,battery:88},'201g','67W'),
  p('rk50p',    'Redmi K50 Pro',       'Xiaomi', 54800,'Dimensity 9000','8GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:82,fps:86,camera:78,battery:84},'201g','120W'),
  p('rk50u',    'Redmi K50 Ultra',     'Xiaomi', 64800,'Snapdragon 8+ Gen 1','8GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:86,fps:90,camera:82,battery:84},'202g','120W'),
  p('rk60',     'Redmi K60',           'Xiaomi', 39800,'Snapdragon 8+ Gen 1','8GB','128GB','64MP','5500mAh','6.67" AMOLED 120Hz','flagship',2023,{overall:82,fps:86,camera:76,battery:88},'198g','67W'),
  p('rk60p',    'Redmi K60 Pro',       'Xiaomi', 54800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','flagship',2023,{overall:88,fps:92,camera:82,battery:84},'212g','120W'),
  p('rk60u',    'Redmi K60 Ultra',     'Xiaomi', 49800,'Dimensity 9200+','8GB','256GB','50MP','5000mAh','6.67" AMOLED 144Hz','flagship',2023,{overall:86,fps:90,camera:80,battery:84},'208g','120W'),
  p('rk70',     'Redmi K70',           'Xiaomi', 39800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','flagship',2024,{overall:84,fps:88,camera:78,battery:84},'209g','120W'),
  p('rk70p',    'Redmi K70 Pro',       'Xiaomi', 54800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','flagship',2024,{overall:90,fps:94,camera:84,battery:84},'209g','120W'),
  p('rk70u',    'Redmi K70 Ultra',     'Xiaomi', 49800,'Dimensity 9300+','12GB','256GB','50MP','5500mAh','6.67" AMOLED 144Hz','flagship',2024,{overall:90,fps:94,camera:82,battery:88},'211g','120W'),
  p('rk70pp',   'Redmi K70 Pro+',      'Xiaomi', 64800,'Snapdragon 8 Gen 3','16GB','512GB','50MP','5500mAh','6.67" AMOLED 120Hz','flagship',2024,{overall:92,fps:95,camera:86,battery:88},'215g','120W'),
  p('rk80',     'Redmi K80',           'Xiaomi', 39800,'Snapdragon 8 Gen 3','8GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:88,fps:92,camera:82,battery:88},'207g','90W'),
  p('rk80p',    'Redmi K80 Pro',       'Xiaomi', 54800,'Snapdragon 8 Elite','12GB','256GB','50MP','6000mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:93,fps:96,camera:88,battery:92},'213g','120W'),
  p('rk80u',    'Redmi K80 Ultra',     'Xiaomi', 49800,'Dimensity 9400','12GB','256GB','50MP','6500mAh','6.67" AMOLED 144Hz','flagship',2025,{overall:93,fps:96,camera:86,battery:94},'210g','120W'),

  // Redmi A series
  p('ra1',  'Redmi A1',  'Xiaomi', 9800,  'Helio A22','2GB','32GB','8MP','5000mAh','6.52" IPS','budget',2022,{overall:25,fps:15,camera:20,battery:82},'192g','10W'),
  p('ra2',  'Redmi A2',  'Xiaomi', 10800, 'Helio G36','2GB','32GB','8MP','5000mAh','6.52" IPS','budget',2023,{overall:27,fps:16,camera:22,battery:82},'192g','10W'),
  p('ra3',  'Redmi A3',  'Xiaomi', 12800, 'Helio G36','3GB','64GB','8MP','5000mAh','6.71" IPS 90Hz','budget',2024,{overall:30,fps:18,camera:24,battery:84},'197g','10W'),
  p('ra4',  'Redmi A4',  'Xiaomi', 14800, 'Helio G81','4GB','64GB','13MP','5160mAh','6.71" IPS 90Hz','budget',2024,{overall:32,fps:22,camera:28,battery:86},'193g','18W'),
  p('ra5',  'Redmi A5',  'Xiaomi', 14800, 'Snapdragon 4s Gen 2','4GB','64GB','50MP','5200mAh','6.88" IPS 120Hz','budget',2025,{overall:38,fps:28,camera:38,battery:88},'200g','18W'),

  // ════════════════════════════════════════════════════════════
  //  POCO
  // ════════════════════════════════════════════════════════════

  p('pocof3',   'POCO F3',         'Xiaomi', 39800,'Snapdragon 870','6GB','128GB','48MP','4520mAh','6.67" AMOLED 120Hz','flagship',2021,{overall:78,fps:82,camera:72,battery:78},'196g','33W'),
  p('pocof4',   'POCO F4',         'Xiaomi', 39800,'Snapdragon 870','6GB','128GB','64MP','4500mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:78,fps:82,camera:74,battery:78},'195g','67W'),
  p('pocof4gt', 'POCO F4 GT',      'Xiaomi', 69800,'Snapdragon 8 Gen 1','8GB','128GB','64MP','4700mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:84,fps:90,camera:74,battery:80},'210g','120W'),
  p('pocof5',   'POCO F5',         'Xiaomi', 39800,'Snapdragon 7+ Gen 2','8GB','256GB','64MP','5000mAh','6.67" AMOLED 120Hz','flagship',2023,{overall:80,fps:82,camera:74,battery:84},'181g','67W'),
  p('pocof5p',  'POCO F5 Pro',     'Xiaomi', 54800,'Snapdragon 8+ Gen 1','8GB','256GB','64MP','5160mAh','6.67" AMOLED 120Hz','flagship',2023,{overall:84,fps:88,camera:76,battery:86},'204g','67W'),
  p('pocof6',   'POCO F6',         'Xiaomi', 44800,'Snapdragon 8s Gen 3','8GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','flagship',2024,{overall:82,fps:86,camera:76,battery:84},'179g','90W'),
  p('pocof6p',  'POCO F6 Pro',     'Xiaomi', 59800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','flagship',2024,{overall:88,fps:92,camera:82,battery:84},'209g','120W'),
  p('pocof7',   'POCO F7',         'Xiaomi', 44800,'Snapdragon 8 Gen 3','8GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:86,fps:90,camera:80,battery:88},'185g','90W'),
  p('pocof7p',  'POCO F7 Pro',     'Xiaomi', 59800,'Snapdragon 8 Elite','12GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:92,fps:96,camera:86,battery:88},'213g','120W'),

  p('pocox3gt', 'POCO X3 GT',      'Xiaomi', 29800,'Dimensity 1100','8GB','128GB','64MP','5000mAh','6.6" IPS 120Hz','midrange',2021,{overall:68,fps:68,camera:62,battery:82},'193g','67W'),
  p('pocox4gt', 'POCO X4 GT',      'Xiaomi', 34800,'Dimensity 8100','8GB','128GB','64MP','5080mAh','6.6" IPS 144Hz','midrange',2022,{overall:72,fps:76,camera:62,battery:84},'200g','67W'),
  p('pocox4p',  'POCO X4 Pro',     'Xiaomi', 29800,'Snapdragon 695','6GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2022,{overall:62,fps:48,camera:64,battery:84},'205g','67W'),
  p('pocox5',   'POCO X5',         'Xiaomi', 24800,'Snapdragon 695','6GB','128GB','48MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:60,fps:48,camera:56,battery:84},'189g','33W'),
  p('pocox5p',  'POCO X5 Pro',     'Xiaomi', 34800,'Snapdragon 778G','8GB','256GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:68,fps:64,camera:68,battery:84},'181g','67W'),
  p('pocox6',   'POCO X6',         'Xiaomi', 29800,'Snapdragon 7s Gen 2','8GB','256GB','64MP','5100mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:68,fps:62,camera:64,battery:86},'181g','67W'),
  p('pocox6p',  'POCO X6 Pro',     'Xiaomi', 39800,'Dimensity 8300','8GB','256GB','64MP','5000mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:74,fps:72,camera:68,battery:84},'186g','67W'),
  p('pocox6neo','POCO X6 Neo',     'Xiaomi', 22800,'Dimensity 6080','6GB','128GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:56,fps:44,camera:58,battery:84},'192g','33W'),
  p('pocox7',   'POCO X7',         'Xiaomi', 29800,'Dimensity 7300','8GB','256GB','50MP','5110mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:70,fps:64,camera:66,battery:86},'185g','45W'),
  p('pocox7p',  'POCO X7 Pro',     'Xiaomi', 39800,'Dimensity 8400','8GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:78,fps:76,camera:72,battery:88},'190g','90W'),

  p('pocom3p',  'POCO M3 Pro',     'Xiaomi', 19800,'Dimensity 700','4GB','64GB','48MP','5000mAh','6.5" IPS 90Hz','budget',2021,{overall:48,fps:38,camera:46,battery:82},'190g','18W'),
  p('pocom4p',  'POCO M4 Pro',     'Xiaomi', 22800,'Dimensity 810','6GB','128GB','50MP','5000mAh','6.6" AMOLED 90Hz','budget',2022,{overall:52,fps:42,camera:50,battery:84},'179g','33W'),
  p('pocom5',   'POCO M5',         'Xiaomi', 17800,'Helio G99','4GB','64GB','50MP','5000mAh','6.58" IPS 90Hz','budget',2022,{overall:46,fps:38,camera:46,battery:84},'178g','18W'),
  p('pocom5s',  'POCO M5s',        'Xiaomi', 19800,'Helio G95','4GB','64GB','64MP','5000mAh','6.43" AMOLED','budget',2022,{overall:48,fps:40,camera:50,battery:84},'178g','33W'),
  p('pocom6p',  'POCO M6 Pro',     'Xiaomi', 19800,'Helio G99 Ultra','6GB','128GB','64MP','5000mAh','6.67" AMOLED 120Hz','budget',2024,{overall:54,fps:44,camera:54,battery:84},'179g','67W'),
  p('pocom6plus','POCO M6 Plus',   'Xiaomi', 16800,'Snapdragon 4 Gen 2','6GB','128GB','108MP','5030mAh','6.79" IPS 120Hz','budget',2024,{overall:46,fps:34,camera:52,battery:84},'198g','33W'),

  p('pococ40',  'POCO C40',        'Xiaomi', 12800,'JR510','3GB','32GB','13MP','6000mAh','6.71" IPS','budget',2022,{overall:22,fps:12,camera:18,battery:90},'204g','10W'),
  p('pococ55',  'POCO C55',        'Xiaomi', 11800,'Helio G36','4GB','64GB','50MP','5000mAh','6.71" IPS','budget',2023,{overall:28,fps:16,camera:28,battery:82},'192g','10W'),
  p('pococ65',  'POCO C65',        'Xiaomi', 13800,'Helio G85','6GB','128GB','50MP','5000mAh','6.74" IPS 90Hz','budget',2024,{overall:34,fps:22,camera:34,battery:84},'192g','18W'),
  p('pococ75',  'POCO C75',        'Xiaomi', 14800,'Snapdragon 4s Gen 2','6GB','128GB','50MP','5160mAh','6.88" IPS 120Hz','budget',2024,{overall:38,fps:28,camera:38,battery:86},'204g','18W'),

  // ════════════════════════════════════════════════════════════
  //  HONOR
  // ════════════════════════════════════════════════════════════

  // 2021
  p('hnmg3',    'Honor Magic 3',       'Honor', 79800,'Snapdragon 888','8GB','128GB','50MP','4600mAh','6.76" OLED 120Hz','flagship',2021,{overall:82,fps:84,camera:84,battery:78},'203g','66W'),
  p('hnmg3p',   'Honor Magic 3 Pro',   'Honor', 99800,'Snapdragon 888','8GB','256GB','50MP','4600mAh','6.76" OLED 120Hz','flagship',2021,{overall:84,fps:84,camera:88,battery:78},'213g','66W'),
  p('hnmg3pp',  'Honor Magic 3 Pro+',  'Honor', 119800,'Snapdragon 888+','12GB','256GB','50MP','4600mAh','6.76" OLED 120Hz','flagship',2021,{overall:86,fps:86,camera:90,battery:78},'236g','100W'),
  p('hn50',     'Honor 50',            'Honor', 49800,'Snapdragon 778G','8GB','128GB','108MP','4300mAh','6.57" OLED 120Hz','midrange',2021,{overall:68,fps:62,camera:68,battery:74},'175g','66W'),
  p('hn50p',    'Honor 50 Pro',        'Honor', 59800,'Snapdragon 778G','8GB','256GB','108MP','4000mAh','6.72" OLED 120Hz','midrange',2021,{overall:70,fps:62,camera:70,battery:72},'187g','100W'),
  p('hnx20',    'Honor X20',           'Honor', 29800,'Dimensity 900','8GB','128GB','64MP','4300mAh','6.67" IPS 120Hz','midrange',2021,{overall:60,fps:52,camera:58,battery:74},'189g','66W'),

  // 2022
  p('hnmg4',    'Honor Magic 4',       'Honor', 89800,'Snapdragon 8 Gen 1','8GB','128GB','50MP','4800mAh','6.81" OLED 120Hz','flagship',2022,{overall:84,fps:87,camera:86,battery:80},'199g','66W'),
  p('hnmg4p',   'Honor Magic 4 Pro',   'Honor', 109800,'Snapdragon 8 Gen 1','8GB','256GB','50MP','4600mAh','6.81" OLED 120Hz','flagship',2022,{overall:86,fps:87,camera:90,battery:78},'209g','100W'),
  p('hnmg4u',   'Honor Magic 4 Ultimate','Honor',139800,'Snapdragon 8 Gen 1','12GB','512GB','50MP','4600mAh','6.81" OLED 120Hz','flagship',2022,{overall:88,fps:88,camera:94,battery:78},'242g','100W'),
  p('hn70',     'Honor 70',            'Honor', 44800,'Snapdragon 778G+','8GB','128GB','54MP','4800mAh','6.67" OLED 120Hz','midrange',2022,{overall:68,fps:62,camera:66,battery:78},'178g','66W'),
  p('hn80',     'Honor 80',            'Honor', 44800,'Snapdragon 782G','8GB','256GB','160MP','4800mAh','6.67" OLED 120Hz','midrange',2022,{overall:70,fps:64,camera:72,battery:78},'180g','66W'),
  p('hnx40',    'Honor X40',           'Honor', 24800,'Snapdragon 695','6GB','128GB','50MP','5100mAh','6.67" OLED 120Hz','midrange',2022,{overall:58,fps:48,camera:54,battery:86},'172g','40W'),
  p('hnx8',     'Honor X8',            'Honor', 22800,'Snapdragon 680','6GB','128GB','64MP','4000mAh','6.7" IPS 90Hz','midrange',2022,{overall:50,fps:38,camera:52,battery:72},'177g','22.5W'),

  // 2023
  p('hnmg5',    'Honor Magic 5',       'Honor', 89800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5100mAh','6.73" OLED 120Hz','flagship',2023,{overall:88,fps:90,camera:88,battery:86},'189g','66W'),
  p('hnmg5p',   'Honor Magic 5 Pro',   'Honor', 109800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','5100mAh','6.81" OLED 120Hz','flagship',2023,{overall:91,fps:91,camera:94,battery:86},'219g','66W'),
  p('hnmg5u',   'Honor Magic 5 Ultimate','Honor',139800,'Snapdragon 8 Gen 2','16GB','512GB','50MP','5100mAh','6.81" OLED 120Hz','flagship',2023,{overall:92,fps:91,camera:96,battery:86},'230g','66W'),
  p('hnmgv2',   'Honor Magic V2',      'Honor', 179800,'Snapdragon 8 Gen 2','16GB','256GB','50MP','5000mAh','7.92" OLED 120Hz','flagship',2023,{overall:88,fps:88,camera:86,battery:80},'231g','66W'),
  p('hn90',     'Honor 90',            'Honor', 49800,'Snapdragon 7 Gen 1','8GB','256GB','200MP','5000mAh','6.7" AMOLED 120Hz','midrange',2023,{overall:72,fps:62,camera:74,battery:82},'183g','66W'),
  p('hn90p',    'Honor 90 Pro',        'Honor', 69800,'Snapdragon 8+ Gen 1','12GB','256GB','200MP','5000mAh','6.78" OLED 120Hz','midrange',2023,{overall:78,fps:80,camera:78,battery:82},'199g','100W'),
  p('hnx50',    'Honor X50',           'Honor', 22800,'Snapdragon 6 Gen 1','8GB','128GB','108MP','5800mAh','6.78" OLED 120Hz','midrange',2023,{overall:62,fps:50,camera:60,battery:92},'185g','35W'),
  p('hnx8a',    'Honor X8a',           'Honor', 19800,'Helio G88','6GB','128GB','100MP','4500mAh','6.7" IPS 90Hz','midrange',2023,{overall:48,fps:36,camera:52,battery:76},'179g','22.5W'),

  // 2024
  p('hnmg6',    'Honor Magic 6',       'Honor', 89800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5300mAh','6.78" OLED 120Hz','flagship',2024,{overall:90,fps:93,camera:90,battery:88},'199g','80W'),
  p('hnmg6p',   'Honor Magic 6 Pro',   'Honor', 119800,'Snapdragon 8 Gen 3','12GB','512GB','50MP','5600mAh','6.78" OLED 120Hz','flagship',2024,{overall:93,fps:94,camera:95,battery:90},'225g','80W'),
  p('hnmg6rsr', 'Honor Magic 6 RSR',   'Honor', 149800,'Snapdragon 8 Gen 3','16GB','1TB','50MP','5600mAh','6.78" OLED 120Hz','flagship',2024,{overall:94,fps:95,camera:96,battery:90},'237g','100W'),
  p('hnmgv3',   'Honor Magic V3',      'Honor', 199800,'Snapdragon 8 Gen 3','16GB','256GB','50MP','5150mAh','7.92" OLED 120Hz','flagship',2024,{overall:92,fps:93,camera:90,battery:82},'226g','66W'),
  p('hnmgvs3',  'Honor Magic Vs3',     'Honor', 149800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','5000mAh','7.92" OLED 120Hz','flagship',2024,{overall:86,fps:88,camera:84,battery:80},'229g','66W'),
  p('hn200',    'Honor 200',           'Honor', 54800,'Snapdragon 7 Gen 3','8GB','256GB','50MP','5200mAh','6.7" AMOLED 120Hz','midrange',2024,{overall:74,fps:66,camera:72,battery:86},'187g','100W'),
  p('hnx60',    'Honor X60',           'Honor', 22800,'Snapdragon 6 Gen 1','8GB','256GB','108MP','6000mAh','6.78" OLED 120Hz','midrange',2024,{overall:64,fps:52,camera:62,battery:94},'185g','35W'),
  p('hnx9b',    'Honor X9b',           'Honor', 29800,'Snapdragon 6 Gen 1','8GB','256GB','108MP','5800mAh','6.78" AMOLED 120Hz','midrange',2024,{overall:66,fps:54,camera:62,battery:92},'190g','35W'),

  // 2025
  p('hnmg7',    'Honor Magic 7',       'Honor', 89800,'Snapdragon 8 Elite','12GB','256GB','50MP','5650mAh','6.78" OLED 120Hz','flagship',2025,{overall:92,fps:95,camera:92,battery:90},'195g','100W'),
  p('hnmg7p',   'Honor Magic 7 Pro',   'Honor', 119800,'Snapdragon 8 Elite','12GB','512GB','50MP','5850mAh','6.82" OLED 120Hz','flagship',2025,{overall:95,fps:96,camera:96,battery:92},'222g','100W'),
  p('hnmg7rsr', 'Honor Magic 7 RSR',   'Honor', 169800,'Snapdragon 8 Elite','16GB','1TB','50MP','5850mAh','6.82" OLED 120Hz','flagship',2025,{overall:96,fps:97,camera:97,battery:92},'235g','100W'),
  p('hnmgvf',   'Honor Magic V Flip',  'Honor', 99800,'Snapdragon 7 Gen 3','8GB','256GB','50MP','4500mAh','6.8" AMOLED 120Hz','flagship',2025,{overall:76,fps:68,camera:74,battery:76},'193g','66W'),
  p('hn400',    'Honor 400',           'Honor', 54800,'Snapdragon 7+ Gen 3','8GB','256GB','50MP','5300mAh','6.7" AMOLED 120Hz','midrange',2025,{overall:76,fps:70,camera:74,battery:88},'185g','100W'),
  p('hnx70',    'Honor X70',           'Honor', 22800,'Snapdragon 6s Gen 3','8GB','256GB','108MP','6300mAh','6.78" OLED 120Hz','midrange',2025,{overall:66,fps:54,camera:64,battery:95},'185g','40W'),
  p('hnx9c',    'Honor X9c',           'Honor', 34800,'Snapdragon 6 Gen 3','8GB','256GB','108MP','6600mAh','6.78" AMOLED 120Hz','midrange',2025,{overall:68,fps:56,camera:64,battery:96},'194g','66W'),

  // ════════════════════════════════════════════════════════════
  //  REALME
  // ════════════════════════════════════════════════════════════

  // 2021
  p('rmgt',     'Realme GT',           'Realme', 39800,'Snapdragon 888','8GB','128GB','64MP','4500mAh','6.43" AMOLED 120Hz','flagship',2021,{overall:80,fps:86,camera:72,battery:76},'186g','65W'),
  p('rmgtme',   'Realme GT Master Ed.','Realme', 34800,'Snapdragon 778G','8GB','128GB','64MP','4300mAh','6.43" AMOLED 120Hz','midrange',2021,{overall:70,fps:64,camera:66,battery:74},'174g','65W'),
  p('rmgtneo',  'Realme GT Neo',       'Realme', 29800,'Dimensity 1200','8GB','128GB','64MP','4500mAh','6.43" AMOLED 120Hz','flagship',2021,{overall:76,fps:80,camera:66,battery:78},'179g','50W'),
  p('rmgtneo2', 'Realme GT Neo 2',     'Realme', 34800,'Snapdragon 870','8GB','128GB','64MP','5000mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:78,fps:82,camera:68,battery:82},'189g','65W'),
  p('rm8',      'Realme 8',            'Realme', 19800,'Helio G95','4GB','64GB','64MP','5000mAh','6.4" AMOLED','midrange',2021,{overall:52,fps:40,camera:54,battery:82},'177g','30W'),
  p('rm8p',     'Realme 8 Pro',        'Realme', 27800,'Snapdragon 720G','6GB','128GB','108MP','4500mAh','6.4" AMOLED','midrange',2021,{overall:58,fps:46,camera:62,battery:78},'176g','50W'),
  p('rm8s',     'Realme 8s 5G',        'Realme', 19800,'Dimensity 810','6GB','128GB','64MP','5000mAh','6.5" IPS 90Hz','midrange',2021,{overall:52,fps:42,camera:52,battery:82},'191g','33W'),
  p('rm8i',     'Realme 8i',           'Realme', 14800,'Helio G96','4GB','64GB','50MP','5000mAh','6.6" IPS 120Hz','budget',2021,{overall:46,fps:38,camera:46,battery:82},'194g','18W'),

  // 2022
  p('rmgt2',    'Realme GT 2',         'Realme', 44800,'Snapdragon 888','8GB','128GB','50MP','5000mAh','6.62" AMOLED 120Hz','flagship',2022,{overall:80,fps:84,camera:74,battery:82},'199g','65W'),
  p('rmgt2p',   'Realme GT 2 Pro',     'Realme', 64800,'Snapdragon 8 Gen 1','8GB','128GB','50MP','5000mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:84,fps:88,camera:80,battery:82},'189g','65W'),
  p('rmgtneo3', 'Realme GT Neo 3',     'Realme', 39800,'Dimensity 8100','8GB','128GB','50MP','4500mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:78,fps:78,camera:72,battery:76},'188g','150W'),
  p('rmgtneo3t','Realme GT Neo 3T',    'Realme', 34800,'Snapdragon 870','8GB','128GB','64MP','5000mAh','6.62" AMOLED 120Hz','flagship',2022,{overall:76,fps:80,camera:68,battery:82},'194g','80W'),
  p('rm9',      'Realme 9',            'Realme', 19800,'Snapdragon 680','4GB','64GB','108MP','5000mAh','6.4" AMOLED 90Hz','midrange',2022,{overall:52,fps:38,camera:56,battery:84},'178g','33W'),
  p('rm9p',     'Realme 9 Pro',        'Realme', 24800,'Snapdragon 695','6GB','128GB','64MP','5000mAh','6.6" IPS 120Hz','midrange',2022,{overall:58,fps:48,camera:56,battery:84},'195g','33W'),
  p('rm9pp',    'Realme 9 Pro+',       'Realme', 29800,'Dimensity 920','6GB','128GB','50MP','4500mAh','6.4" AMOLED 90Hz','midrange',2022,{overall:62,fps:52,camera:62,battery:78},'182g','60W'),
  p('rmnz50',   'Realme Narzo 50',     'Realme', 14800,'Helio G96','4GB','64GB','50MP','5000mAh','6.6" IPS 120Hz','budget',2022,{overall:46,fps:38,camera:46,battery:82},'195g','33W'),

  // 2023
  p('rmgt3',    'Realme GT 3',         'Realme', 54800,'Snapdragon 8+ Gen 1','8GB','256GB','50MP','4600mAh','6.74" AMOLED 144Hz','flagship',2023,{overall:84,fps:88,camera:76,battery:78},'199g','240W'),
  p('rmgtneo5', 'Realme GT Neo 5',     'Realme', 44800,'Snapdragon 8+ Gen 1','8GB','256GB','50MP','4600mAh','6.74" AMOLED 144Hz','flagship',2023,{overall:82,fps:86,camera:74,battery:78},'199g','150W'),
  p('rmgtneo5se','Realme GT Neo 5 SE', 'Realme', 29800,'Snapdragon 7+ Gen 2','8GB','256GB','64MP','5500mAh','6.74" AMOLED 120Hz','midrange',2023,{overall:76,fps:78,camera:66,battery:88},'193g','100W'),
  p('rmgt5',    'Realme GT 5',         'Realme', 59800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','5240mAh','6.74" AMOLED 144Hz','flagship',2023,{overall:88,fps:92,camera:80,battery:86},'205g','150W'),
  p('rmgt5p',   'Realme GT 5 Pro',     'Realme', 69800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5400mAh','6.78" AMOLED 144Hz','flagship',2023,{overall:92,fps:94,camera:88,battery:88},'210g','100W'),
  p('rm11',     'Realme 11',           'Realme', 22800,'Helio G99','8GB','128GB','108MP','5000mAh','6.4" IPS 90Hz','midrange',2023,{overall:54,fps:42,camera:56,battery:84},'187g','33W'),
  p('rm11p',    'Realme 11 Pro',       'Realme', 29800,'Dimensity 7050','8GB','128GB','100MP','5000mAh','6.7" OLED 120Hz','midrange',2023,{overall:66,fps:56,camera:68,battery:84},'175g','67W'),
  p('rm11pp',   'Realme 11 Pro+',      'Realme', 39800,'Dimensity 7050','8GB','256GB','200MP','5000mAh','6.7" OLED 120Hz','midrange',2023,{overall:68,fps:56,camera:74,battery:84},'189g','100W'),

  // 2024
  p('rmgt6',    'Realme GT 6',         'Realme', 54800,'Snapdragon 8s Gen 3','8GB','256GB','50MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:84,fps:86,camera:80,battery:88},'199g','120W'),
  p('rmgtneo6', 'Realme GT Neo 6',     'Realme', 39800,'Snapdragon 8s Gen 3','8GB','256GB','50MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:82,fps:84,camera:76,battery:88},'195g','120W'),
  p('rmgtneo6se','Realme GT Neo 6 SE', 'Realme', 29800,'Snapdragon 7+ Gen 3','8GB','256GB','50MP','5500mAh','6.78" AMOLED 120Hz','midrange',2024,{overall:76,fps:76,camera:70,battery:88},'185g','100W'),
  p('rmgt7p',   'Realme GT 7 Pro',     'Realme', 69800,'Snapdragon 8 Elite','12GB','256GB','50MP','6500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:92,fps:96,camera:86,battery:94},'222g','120W'),
  p('rm12',     'Realme 12',           'Realme', 24800,'Helio G99','8GB','128GB','108MP','5000mAh','6.72" IPS 120Hz','midrange',2024,{overall:56,fps:44,camera:58,battery:84},'187g','45W'),
  p('rm13',     'Realme 13',           'Realme', 27800,'Dimensity 6300','8GB','128GB','108MP','5000mAh','6.72" AMOLED 120Hz','midrange',2024,{overall:58,fps:46,camera:60,battery:84},'185g','45W'),
  p('rmnz70',   'Realme Narzo 70',     'Realme', 17800,'Dimensity 7050','6GB','128GB','50MP','5000mAh','6.67" AMOLED 120Hz','budget',2024,{overall:58,fps:48,camera:52,battery:84},'185g','45W'),

  // 2025
  p('rmgt7',    'Realme GT 7',         'Realme', 49800,'Snapdragon 8 Gen 3','8GB','256GB','50MP','7000mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:88,fps:92,camera:82,battery:96},'228g','120W'),
  p('rmgt7pro', 'Realme GT 7 Pro',     'Realme', 69800,'Snapdragon 8 Elite','12GB','256GB','50MP','6500mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:93,fps:96,camera:88,battery:94},'220g','120W'),
  p('rmgtneo7', 'Realme GT Neo 7',     'Realme', 34800,'Dimensity 9300+','8GB','256GB','50MP','7000mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:86,fps:90,camera:78,battery:96},'215g','120W'),
  p('rmgtneo7se','Realme GT Neo 7 SE', 'Realme', 24800,'Dimensity 8400','8GB','256GB','50MP','7000mAh','6.78" AMOLED 120Hz','midrange',2025,{overall:80,fps:78,camera:72,battery:96},'210g','80W'),
  p('rm14',     'Realme 14',           'Realme', 24800,'Dimensity 7300','8GB','256GB','50MP','6000mAh','6.72" AMOLED 120Hz','midrange',2025,{overall:64,fps:54,camera:60,battery:92},'190g','45W'),
  p('rm15',     'Realme 15',           'Realme', 29800,'Dimensity 7400','8GB','256GB','108MP','6000mAh','6.78" AMOLED 120Hz','midrange',2025,{overall:68,fps:58,camera:66,battery:92},'188g','80W'),

  // ════════════════════════════════════════════════════════════
  //  iQOO
  // ════════════════════════════════════════════════════════════

  // 2021
  p('iqoo7',    'iQOO 7',             'iQOO', 54800,'Snapdragon 888','8GB','128GB','48MP','4000mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:82,fps:88,camera:72,battery:72},'209g','120W'),
  p('iqoo7l',   'iQOO 7 Legend',      'iQOO', 59800,'Snapdragon 888','12GB','256GB','48MP','4000mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:83,fps:88,camera:74,battery:72},'209g','120W'),
  p('iqoo8',    'iQOO 8',             'iQOO', 64800,'Snapdragon 888','8GB','128GB','48MP','4350mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:84,fps:88,camera:76,battery:76},'199g','120W'),
  p('iqoo8p',   'iQOO 8 Pro',         'iQOO', 79800,'Snapdragon 888+','12GB','256GB','50MP','4500mAh','6.78" AMOLED 120Hz','flagship',2021,{overall:86,fps:88,camera:82,battery:78},'203g','120W'),
  p('iqooneo5', 'iQOO Neo 5',         'iQOO', 34800,'Snapdragon 870','8GB','128GB','48MP','4400mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:76,fps:82,camera:68,battery:76},'196g','66W'),
  p('iqooneo5s','iQOO Neo 5S',        'iQOO', 34800,'Snapdragon 888','8GB','128GB','48MP','4500mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:78,fps:86,camera:68,battery:78},'197g','66W'),

  // 2022
  p('iqoo9',    'iQOO 9',             'iQOO', 54800,'Snapdragon 8 Gen 1','8GB','128GB','50MP','4700mAh','6.56" AMOLED 120Hz','flagship',2022,{overall:84,fps:90,camera:78,battery:80},'206g','120W'),
  p('iqoo9p',   'iQOO 9 Pro',         'iQOO', 69800,'Snapdragon 8 Gen 1','12GB','256GB','50MP','4700mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:86,fps:90,camera:84,battery:80},'210g','120W'),
  p('iqoo9se',  'iQOO 9 SE',          'iQOO', 39800,'Snapdragon 888','8GB','128GB','48MP','4500mAh','6.62" AMOLED 120Hz','flagship',2022,{overall:78,fps:86,camera:72,battery:78},'195g','66W'),
  p('iqoo10',   'iQOO 10',            'iQOO', 59800,'Snapdragon 8+ Gen 1','8GB','128GB','50MP','4700mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:86,fps:90,camera:80,battery:80},'197g','120W'),
  p('iqoo10p',  'iQOO 10 Pro',        'iQOO', 79800,'Snapdragon 8+ Gen 1','12GB','256GB','50MP','4700mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:88,fps:92,camera:84,battery:80},'213g','200W'),
  p('iqooneo6', 'iQOO Neo 6',         'iQOO', 34800,'Snapdragon 8 Gen 1','8GB','128GB','64MP','4700mAh','6.62" AMOLED 120Hz','flagship',2022,{overall:80,fps:88,camera:68,battery:80},'197g','80W'),
  p('iqooneo7', 'iQOO Neo 7',         'iQOO', 34800,'Dimensity 9000+','8GB','128GB','50MP','5000mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:82,fps:86,camera:72,battery:84},'197g','120W'),
  p('iqooz6',   'iQOO Z6',            'iQOO', 19800,'Snapdragon 778G+','6GB','128GB','64MP','4500mAh','6.64" IPS 120Hz','midrange',2022,{overall:62,fps:60,camera:56,battery:78},'194g','44W'),

  // 2023
  p('iqoo11',   'iQOO 11',            'iQOO', 64800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5000mAh','6.78" AMOLED 144Hz','flagship',2023,{overall:90,fps:94,camera:82,battery:84},'207g','120W'),
  p('iqoo11p',  'iQOO 11 Pro',        'iQOO', 79800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','4700mAh','6.78" AMOLED 144Hz','flagship',2023,{overall:91,fps:94,camera:86,battery:80},'208g','200W'),
  p('iqoo11s',  'iQOO 11S',           'iQOO', 54800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','4700mAh','6.78" AMOLED 144Hz','flagship',2023,{overall:89,fps:92,camera:80,battery:80},'205g','120W'),
  p('iqooneo8', 'iQOO Neo 8',         'iQOO', 34800,'Snapdragon 8+ Gen 1','8GB','256GB','50MP','5000mAh','6.78" AMOLED 120Hz','flagship',2023,{overall:82,fps:88,camera:74,battery:84},'190g','120W'),
  p('iqooneo8p','iQOO Neo 8 Pro',     'iQOO', 44800,'Dimensity 9200+','8GB','256GB','50MP','5000mAh','6.78" AMOLED 144Hz','flagship',2023,{overall:86,fps:90,camera:76,battery:84},'194g','120W'),
  p('iqooz7',   'iQOO Z7',            'iQOO', 17800,'Snapdragon 782G','6GB','128GB','64MP','5000mAh','6.64" IPS 120Hz','midrange',2023,{overall:64,fps:62,camera:58,battery:84},'193g','44W'),
  p('iqooz8',   'iQOO Z8',            'iQOO', 22800,'Dimensity 8200','8GB','128GB','50MP','5000mAh','6.64" AMOLED 120Hz','midrange',2023,{overall:70,fps:68,camera:62,battery:84},'190g','120W'),

  // 2024
  p('iqoo12',   'iQOO 12',            'iQOO', 64800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5000mAh','6.78" AMOLED 144Hz','flagship',2024,{overall:92,fps:96,camera:84,battery:84},'207g','120W'),
  p('iqoo12p',  'iQOO 12 Pro',        'iQOO', 79800,'Snapdragon 8 Gen 3','16GB','256GB','50MP','5100mAh','6.78" AMOLED 144Hz','flagship',2024,{overall:94,fps:97,camera:88,battery:84},'213g','120W'),
  p('iqoo13',   'iQOO 13',            'iQOO', 64800,'Snapdragon 8 Elite','12GB','256GB','50MP','6150mAh','6.82" AMOLED 144Hz','flagship',2024,{overall:94,fps:97,camera:86,battery:92},'213g','120W'),
  p('iqooneo9', 'iQOO Neo 9',         'iQOO', 34800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5160mAh','6.78" AMOLED 144Hz','flagship',2024,{overall:86,fps:90,camera:76,battery:86},'190g','120W'),
  p('iqooneo9p','iQOO Neo 9 Pro',     'iQOO', 44800,'Snapdragon 8 Gen 3','8GB','256GB','50MP','5160mAh','6.78" AMOLED 144Hz','flagship',2024,{overall:90,fps:94,camera:80,battery:86},'194g','120W'),
  p('iqooneo9sp','iQOO Neo 9s Pro',   'iQOO', 39800,'Dimensity 9300+','8GB','256GB','50MP','5160mAh','6.78" AMOLED 144Hz','flagship',2024,{overall:88,fps:92,camera:78,battery:86},'190g','120W'),
  p('iqooz9',   'iQOO Z9',            'iQOO', 19800,'Dimensity 7200','6GB','128GB','50MP','5000mAh','6.64" AMOLED 120Hz','midrange',2024,{overall:66,fps:58,camera:60,battery:84},'186g','44W'),

  // 2025
  p('iqooneo10',  'iQOO Neo 10',      'iQOO', 34800,'Dimensity 9400','8GB','256GB','50MP','6100mAh','6.78" AMOLED 144Hz','flagship',2025,{overall:90,fps:94,camera:80,battery:92},'195g','120W'),
  p('iqooneo10p', 'iQOO Neo 10 Pro',  'iQOO', 44800,'Snapdragon 8 Elite','12GB','256GB','50MP','6100mAh','6.78" AMOLED 144Hz','flagship',2025,{overall:93,fps:96,camera:84,battery:92},'198g','120W'),
  p('iqooneo10pp','iQOO Neo 10 Pro+', 'iQOO', 54800,'Snapdragon 8 Elite','12GB','512GB','50MP','6500mAh','6.82" AMOLED 144Hz','flagship',2025,{overall:94,fps:97,camera:86,battery:94},'210g','120W'),
  p('iqooz10',    'iQOO Z10',         'iQOO', 22800,'Dimensity 8300','8GB','256GB','50MP','6000mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:72,fps:68,camera:64,battery:92},'192g','80W'),

  // ════════════════════════════════════════════════════════════
  //  MOTOROLA
  // ════════════════════════════════════════════════════════════

  // 2021
  p('me20',     'Motorola Edge 20',    'Motorola', 49800,'Snapdragon 778G','8GB','128GB','108MP','4000mAh','6.7" OLED 144Hz','flagship',2021,{overall:72,fps:64,camera:72,battery:72},'163g','30W'),
  p('me20p',    'Motorola Edge 20 Pro','Motorola', 69800,'Snapdragon 870','12GB','256GB','108MP','4500mAh','6.7" OLED 144Hz','flagship',2021,{overall:78,fps:80,camera:76,battery:76},'190g','30W'),
  p('me20l',    'Motorola Edge 20 Lite','Motorola',34800,'Dimensity 720','6GB','128GB','108MP','5000mAh','6.7" OLED 90Hz','midrange',2021,{overall:60,fps:46,camera:62,battery:82},'185g','30W'),
  p('mg50',     'Moto G50',            'Motorola', 22800,'Snapdragon 480','4GB','64GB','48MP','5000mAh','6.5" IPS 90Hz','budget',2021,{overall:42,fps:32,camera:42,battery:84},'192g','15W'),
  p('mg60',     'Moto G60',            'Motorola', 19800,'Snapdragon 732G','6GB','128GB','108MP','6000mAh','6.8" IPS 120Hz','midrange',2021,{overall:58,fps:48,camera:62,battery:90},'225g','20W'),
  p('mg100',    'Moto G100',           'Motorola', 49800,'Snapdragon 870','8GB','128GB','64MP','5000mAh','6.7" IPS 90Hz','flagship',2021,{overall:74,fps:80,camera:68,battery:82},'207g','20W'),
  p('mrazr5g',  'Motorola Razr 5G',   'Motorola', 179800,'Snapdragon 765G','8GB','256GB','48MP','2800mAh','6.2" OLED','flagship',2021,{overall:62,fps:58,camera:58,battery:48},'192g','15W'),

  // 2022
  p('me30',     'Motorola Edge 30',    'Motorola', 44800,'Snapdragon 778G+','8GB','128GB','50MP','4020mAh','6.5" OLED 144Hz','flagship',2022,{overall:72,fps:66,camera:70,battery:72},'155g','33W'),
  p('me30p',    'Motorola Edge 30 Pro','Motorola', 69800,'Snapdragon 8 Gen 1','12GB','256GB','50MP','4800mAh','6.7" OLED 144Hz','flagship',2022,{overall:80,fps:85,camera:78,battery:80},'196g','68W'),
  p('me30u',    'Motorola Edge 30 Ultra','Motorola',89800,'Snapdragon 8+ Gen 1','12GB','256GB','200MP','4610mAh','6.67" OLED 144Hz','flagship',2022,{overall:83,fps:87,camera:82,battery:78},'198g','125W'),
  p('me30neo',  'Motorola Edge 30 Neo','Motorola', 34800,'Snapdragon 695','6GB','128GB','64MP','4020mAh','6.28" OLED 120Hz','midrange',2022,{overall:62,fps:48,camera:58,battery:72},'155g','68W'),
  p('mx30p',    'Motorola X30 Pro',    'Motorola', 79800,'Snapdragon 8+ Gen 1','12GB','256GB','200MP','4610mAh','6.67" OLED 144Hz','flagship',2022,{overall:84,fps:88,camera:84,battery:78},'198g','125W'),
  p('mrazr22',  'Motorola Razr 2022',  'Motorola', 129800,'Snapdragon 8+ Gen 1','8GB','256GB','50MP','3500mAh','6.7" OLED 144Hz','flagship',2022,{overall:74,fps:82,camera:72,battery:60},'200g','33W'),
  p('mg22',     'Moto G22',            'Motorola', 17800,'Helio G37','4GB','64GB','50MP','5000mAh','6.5" IPS 90Hz','budget',2022,{overall:35,fps:22,camera:38,battery:82},'185g','20W'),
  p('mg32',     'Moto G32',            'Motorola', 19800,'Snapdragon 680','4GB','64GB','50MP','5000mAh','6.5" IPS 90Hz','budget',2022,{overall:42,fps:32,camera:42,battery:82},'184g','30W'),
  p('mg52',     'Moto G52',            'Motorola', 24800,'Snapdragon 680','4GB','128GB','50MP','5000mAh','6.6" AMOLED 90Hz','midrange',2022,{overall:48,fps:34,camera:46,battery:84},'169g','30W'),
  p('mg62',     'Moto G62',            'Motorola', 27800,'Snapdragon 695','4GB','128GB','50MP','5000mAh','6.5" IPS 120Hz','midrange',2022,{overall:56,fps:46,camera:50,battery:84},'185g','20W'),
  p('mg72',     'Moto G72',            'Motorola', 24800,'Helio G99','6GB','128GB','108MP','5000mAh','6.6" AMOLED 120Hz','midrange',2022,{overall:54,fps:42,camera:56,battery:84},'166g','33W'),
  p('mg82',     'Moto G82',            'Motorola', 34800,'Snapdragon 695','6GB','128GB','50MP','5000mAh','6.6" AMOLED 120Hz','midrange',2022,{overall:58,fps:48,camera:55,battery:85},'173g','30W'),

  // 2023
  p('me40',     'Motorola Edge 40',    'Motorola', 64800,'Dimensity 8020','8GB','256GB','50MP','4400mAh','6.55" OLED 144Hz','flagship',2023,{overall:78,fps:78,camera:76,battery:76},'167g','68W'),
  p('me40p',    'Motorola Edge 40 Pro','Motorola', 89800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','4600mAh','6.67" OLED 165Hz','flagship',2023,{overall:86,fps:90,camera:82,battery:78},'199g','125W'),
  p('me40neo',  'Motorola Edge 40 Neo','Motorola', 39800,'Dimensity 7030','8GB','256GB','50MP','5000mAh','6.55" OLED 144Hz','midrange',2023,{overall:68,fps:58,camera:62,battery:84},'170g','68W'),
  p('mrazr40',  'Motorola Razr 40',    'Motorola', 89800,'Snapdragon 7 Gen 1','8GB','256GB','64MP','4200mAh','6.9" OLED 144Hz','flagship',2023,{overall:74,fps:68,camera:70,battery:72},'188g','33W'),
  p('mrazr40u', 'Motorola Razr 40 Ultra','Motorola',149800,'Snapdragon 8+ Gen 1','8GB','256GB','12MP','3800mAh','6.9" OLED 165Hz','flagship',2023,{overall:78,fps:82,camera:74,battery:64},'188g','33W'),
  p('mthinkph', 'Motorola ThinkPhone', 'Motorola', 89800,'Snapdragon 8+ Gen 1','8GB','256GB','50MP','5000mAh','6.6" OLED 144Hz','flagship',2023,{overall:82,fps:86,camera:76,battery:84},'188g','68W'),
  p('mg13',     'Moto G13',            'Motorola', 14800,'Helio G85','4GB','64GB','50MP','5000mAh','6.5" IPS 90Hz','budget',2023,{overall:35,fps:24,camera:36,battery:82},'184g','20W'),
  p('mg23',     'Moto G23',            'Motorola', 17800,'Helio G85','4GB','64GB','50MP','5000mAh','6.5" IPS 90Hz','budget',2023,{overall:36,fps:24,camera:38,battery:82},'184g','30W'),
  p('mg53',     'Moto G53',            'Motorola', 22800,'Snapdragon 480+','4GB','128GB','50MP','5000mAh','6.5" IPS 120Hz','midrange',2023,{overall:48,fps:38,camera:44,battery:84},'183g','18W'),
  p('mg73',     'Moto G73',            'Motorola', 29800,'Dimensity 930','8GB','128GB','50MP','5000mAh','6.5" IPS 120Hz','midrange',2023,{overall:58,fps:50,camera:50,battery:84},'181g','30W'),
  p('mg84',     'Moto G84',            'Motorola', 39800,'Snapdragon 695','8GB','256GB','50MP','5000mAh','6.55" OLED 120Hz','midrange',2023,{overall:60,fps:50,camera:57,battery:86},'168g','33W'),

  // 2024
  p('me50',     'Motorola Edge 50',    'Motorola', 54800,'Snapdragon 7 Gen 1','8GB','256GB','50MP','5000mAh','6.7" OLED 120Hz','flagship',2024,{overall:74,fps:68,camera:74,battery:84},'171g','68W'),
  p('me50p',    'Motorola Edge 50 Pro','Motorola', 79800,'Snapdragon 7 Gen 3','12GB','256GB','50MP','4500mAh','6.67" OLED 144Hz','flagship',2024,{overall:80,fps:76,camera:80,battery:78},'186g','125W'),
  p('me50u',    'Motorola Edge 50 Ultra','Motorola',99800,'Snapdragon 8s Gen 3','12GB','256GB','50MP','4500mAh','6.67" OLED 144Hz','flagship',2024,{overall:84,fps:86,camera:84,battery:78},'197g','125W'),
  p('me50f',    'Motorola Edge 50 Fusion','Motorola',44800,'Snapdragon 7s Gen 2','8GB','256GB','50MP','5000mAh','6.7" OLED 144Hz','midrange',2024,{overall:70,fps:60,camera:68,battery:84},'174g','68W'),
  p('me50neo',  'Motorola Edge 50 Neo','Motorola', 39800,'Dimensity 7300','8GB','256GB','50MP','4310mAh','6.4" OLED 120Hz','midrange',2024,{overall:68,fps:58,camera:66,battery:76},'171g','68W'),
  p('mrazr50',  'Motorola Razr 50',    'Motorola', 89800,'Dimensity 7300X','8GB','256GB','50MP','4200mAh','6.9" OLED 120Hz','flagship',2024,{overall:74,fps:60,camera:72,battery:72},'188g','33W'),
  p('mrazr50u', 'Motorola Razr 50 Ultra','Motorola',149800,'Snapdragon 8s Gen 3','12GB','256GB','50MP','4000mAh','6.9" OLED 165Hz','flagship',2024,{overall:82,fps:84,camera:80,battery:68},'189g','45W'),
  p('mg04',     'Moto G04',            'Motorola', 12800,'UNISOC T606','4GB','64GB','16MP','5000mAh','6.6" IPS','budget',2024,{overall:25,fps:14,camera:20,battery:82},'179g','10W'),
  p('mg24',     'Moto G24',            'Motorola', 14800,'Helio G85','4GB','64GB','50MP','5000mAh','6.6" IPS 90Hz','budget',2024,{overall:36,fps:24,camera:38,battery:82},'181g','30W'),
  p('mg34',     'Moto G34',            'Motorola', 17800,'Snapdragon 695','4GB','64GB','50MP','5000mAh','6.5" IPS 120Hz','budget',2024,{overall:48,fps:38,camera:42,battery:84},'179g','18W'),
  p('mg54',     'Moto G54',            'Motorola', 24800,'Dimensity 7020','8GB','128GB','50MP','5000mAh','6.5" IPS 120Hz','midrange',2024,{overall:56,fps:48,camera:50,battery:84},'182g','30W'),
  p('mg64',     'Moto G64',            'Motorola', 24800,'Dimensity 7025','8GB','128GB','50MP','6000mAh','6.5" IPS 120Hz','midrange',2024,{overall:58,fps:50,camera:52,battery:90},'190g','33W'),
  p('mg75',     'Moto G75',            'Motorola', 34800,'Snapdragon 6s Gen 3','8GB','128GB','50MP','5000mAh','6.78" IPS 120Hz','midrange',2024,{overall:62,fps:54,camera:56,battery:84},'198g','30W'),
  p('mg85',     'Moto G85',            'Motorola', 29800,'Snapdragon 6s Gen 3','8GB','256GB','50MP','5000mAh','6.67" OLED 120Hz','midrange',2024,{overall:64,fps:54,camera:58,battery:84},'173g','33W'),

  // 2025
  p('me60',     'Motorola Edge 60',    'Motorola', 59800,'Dimensity 8400','8GB','256GB','50MP','5500mAh','6.7" OLED 120Hz','flagship',2025,{overall:78,fps:76,camera:76,battery:88},'178g','68W'),
  p('me60p',    'Motorola Edge 60 Pro','Motorola', 89800,'Snapdragon 8 Elite','12GB','256GB','50MP','5000mAh','6.78" OLED 165Hz','flagship',2025,{overall:90,fps:94,camera:86,battery:84},'195g','125W'),
  p('me60f',    'Motorola Edge 60 Fusion','Motorola',49800,'Dimensity 7300','8GB','256GB','50MP','5500mAh','6.7" OLED 120Hz','midrange',2025,{overall:72,fps:64,camera:70,battery:88},'176g','68W'),
  p('me60sty',  'Motorola Edge 60 Stylus','Motorola',69800,'Dimensity 8400','8GB','256GB','50MP','5500mAh','6.78" OLED 120Hz','flagship',2025,{overall:78,fps:76,camera:76,battery:88},'195g','68W'),
  p('mrazr60',  'Motorola Razr 60',    'Motorola', 99800,'Dimensity 8400','8GB','256GB','50MP','4500mAh','6.9" OLED 120Hz','flagship',2025,{overall:78,fps:74,camera:76,battery:76},'190g','45W'),
  p('mrazr60u', 'Motorola Razr 60 Ultra','Motorola',159800,'Snapdragon 8 Elite','12GB','256GB','50MP','4200mAh','6.9" OLED 165Hz','flagship',2025,{overall:86,fps:90,camera:84,battery:72},'189g','68W'),
  p('mthinkph25','Motorola ThinkPhone 25','Motorola',99800,'Dimensity 9300','12GB','256GB','50MP','5500mAh','6.36" OLED 120Hz','flagship',2025,{overall:84,fps:88,camera:80,battery:88},'185g','68W'),
  p('mg05',     'Moto G05',            'Motorola', 12800,'Helio G81','4GB','64GB','50MP','5200mAh','6.67" IPS 90Hz','budget',2025,{overall:32,fps:20,camera:34,battery:86},'188g','18W'),
  p('mg15',     'Moto G15',            'Motorola', 14800,'Helio G81','4GB','128GB','50MP','5200mAh','6.72" IPS 90Hz','budget',2025,{overall:34,fps:22,camera:36,battery:86},'192g','18W'),
  p('mg35',     'Moto G35',            'Motorola', 19800,'UNISOC T760','4GB','128GB','50MP','5000mAh','6.72" AMOLED 120Hz','budget',2025,{overall:40,fps:30,camera:40,battery:84},'180g','18W'),
  p('mg45',     'Moto G45',            'Motorola', 22800,'Snapdragon 6s Gen 3','4GB','128GB','50MP','5000mAh','6.5" IPS 120Hz','midrange',2025,{overall:54,fps:44,camera:48,battery:84},'177g','20W'),
  p('mg55',     'Moto G55',            'Motorola', 24800,'Dimensity 7025','6GB','128GB','50MP','5000mAh','6.49" AMOLED 120Hz','midrange',2025,{overall:58,fps:48,camera:52,battery:84},'170g','30W'),
  p('mg86',     'Moto G86',            'Motorola', 34800,'Snapdragon 7s Gen 3','8GB','256GB','50MP','5000mAh','6.67" OLED 120Hz','midrange',2025,{overall:68,fps:60,camera:64,battery:84},'172g','68W'),

  // ════════════════════════════════════════════════════════════
  //  ZTE / Nubia
  // ════════════════════════════════════════════════════════════

  // ZTE Axon
  p('ztea30',   'ZTE Axon 30',        'ZTE', 49800,'Snapdragon 870','8GB','128GB','64MP','4200mAh','6.92" AMOLED 120Hz','flagship',2021,{overall:74,fps:80,camera:68,battery:74},'189g','55W'),
  p('ztea30u',  'ZTE Axon 30 Ultra',  'ZTE', 69800,'Snapdragon 888','8GB','256GB','64MP','4600mAh','6.67" AMOLED 144Hz','flagship',2021,{overall:80,fps:86,camera:76,battery:78},'188g','65W'),
  p('ztea40',   'ZTE Axon 40',        'ZTE', 49800,'Snapdragon 870','8GB','128GB','64MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:74,fps:80,camera:68,battery:82},'189g','55W'),
  p('ztea40u',  'ZTE Axon 40 Ultra',  'ZTE', 79800,'Snapdragon 8 Gen 1','12GB','256GB','64MP','5000mAh','6.8" AMOLED 120Hz','flagship',2022,{overall:82,fps:88,camera:78,battery:82},'204g','65W'),
  p('ztea40p',  'ZTE Axon 40 Pro',    'ZTE', 59800,'Snapdragon 870','8GB','256GB','108MP','5000mAh','6.67" AMOLED 120Hz','flagship',2022,{overall:76,fps:80,camera:72,battery:82},'195g','55W'),
  p('ztea50',   'ZTE Axon 50',        'ZTE', 49800,'Snapdragon 7 Gen 1','8GB','256GB','108MP','5000mAh','6.67" AMOLED 120Hz','midrange',2023,{overall:72,fps:66,camera:68,battery:84},'192g','33W'),
  p('ztea50u',  'ZTE Axon 50 Ultra',  'ZTE', 89800,'Snapdragon 8 Gen 2','12GB','256GB','64MP','5000mAh','6.73" AMOLED 120Hz','flagship',2023,{overall:88,fps:90,camera:82,battery:84},'200g','80W'),
  p('ztea60',   'ZTE Axon 60',        'ZTE', 54800,'Snapdragon 7 Gen 3','8GB','256GB','108MP','5500mAh','6.78" AMOLED 120Hz','midrange',2024,{overall:74,fps:68,camera:70,battery:88},'195g','33W'),
  p('ztea60u',  'ZTE Axon 60 Ultra',  'ZTE', 99800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:90,fps:94,camera:86,battery:88},'210g','80W'),

  // Nubia Red Magic
  p('nbrm6',    'Red Magic 6',        'Nubia', 69800,'Snapdragon 888','8GB','128GB','64MP','5050mAh','6.8" AMOLED 165Hz','flagship',2021,{overall:82,fps:94,camera:66,battery:82},'220g','66W'),
  p('nbrm6p',   'Red Magic 6 Pro',    'Nubia', 84800,'Snapdragon 888','16GB','256GB','64MP','4500mAh','6.8" AMOLED 165Hz','flagship',2021,{overall:84,fps:96,camera:66,battery:76},'220g','120W'),
  p('nbrm6r',   'Red Magic 6R',       'Nubia', 49800,'Snapdragon 888','8GB','128GB','64MP','4200mAh','6.67" AMOLED 144Hz','flagship',2021,{overall:78,fps:90,camera:62,battery:72},'186g','30W'),
  p('nbrm7',    'Red Magic 7',        'Nubia', 79800,'Snapdragon 8 Gen 1','12GB','128GB','64MP','4500mAh','6.8" AMOLED 165Hz','flagship',2022,{overall:84,fps:96,camera:66,battery:76},'215g','120W'),
  p('nbrm7p',   'Red Magic 7 Pro',    'Nubia', 99800,'Snapdragon 8 Gen 1','16GB','256GB','64MP','5000mAh','6.8" AMOLED 120Hz','flagship',2022,{overall:86,fps:97,camera:68,battery:82},'235g','135W'),
  p('nbrm7sp',  'Red Magic 7S Pro',   'Nubia', 99800,'Snapdragon 8+ Gen 1','12GB','256GB','64MP','5000mAh','6.8" AMOLED 120Hz','flagship',2022,{overall:88,fps:98,camera:68,battery:82},'235g','135W'),
  p('nbrm8p',   'Red Magic 8 Pro',    'Nubia', 89800,'Snapdragon 8 Gen 2','12GB','256GB','50MP','6000mAh','6.8" AMOLED 120Hz','flagship',2023,{overall:90,fps:98,camera:72,battery:90},'228g','80W'),
  p('nbrm8sp',  'Red Magic 8S Pro',   'Nubia', 89800,'Snapdragon 8 Gen 2 Leading','12GB','256GB','50MP','6000mAh','6.8" AMOLED 120Hz','flagship',2023,{overall:91,fps:99,camera:72,battery:90},'228g','80W'),
  p('nbrm9p',   'Red Magic 9 Pro',    'Nubia', 89800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','6500mAh','6.8" AMOLED 120Hz','flagship',2024,{overall:92,fps:99,camera:74,battery:92},'229g','80W'),
  p('nbrm9pp',  'Red Magic 9 Pro+',   'Nubia', 109800,'Snapdragon 8 Gen 3','16GB','512GB','50MP','6500mAh','6.8" AMOLED 120Hz','flagship',2024,{overall:93,fps:99,camera:76,battery:92},'229g','80W'),
  p('nbrm9sp',  'Red Magic 9S Pro',   'Nubia', 89800,'Snapdragon 8 Gen 3 Leading','12GB','256GB','50MP','6500mAh','6.8" AMOLED 120Hz','flagship',2024,{overall:93,fps:99,camera:76,battery:92},'229g','80W'),
  p('nbrm10p',  'Red Magic 10 Pro',   'Nubia', 89800,'Snapdragon 8 Elite','12GB','256GB','50MP','7050mAh','6.85" AMOLED 120Hz','flagship',2025,{overall:95,fps:99,camera:78,battery:96},'229g','100W'),
  p('nbrm10pp', 'Red Magic 10 Pro+',  'Nubia', 109800,'Snapdragon 8 Elite','16GB','512GB','50MP','7050mAh','6.85" AMOLED 120Hz','flagship',2025,{overall:96,fps:99,camera:80,battery:96},'229g','100W'),

  // Nubia Z series
  p('nbz50',    'Nubia Z50',          'Nubia', 54800,'Snapdragon 8 Gen 2','8GB','128GB','64MP','5000mAh','6.67" AMOLED 120Hz','flagship',2023,{overall:86,fps:90,camera:78,battery:84},'196g','80W'),
  p('nbz50u',   'Nubia Z50 Ultra',    'Nubia', 79800,'Snapdragon 8 Gen 2','8GB','256GB','64MP','5000mAh','6.73" AMOLED 120Hz','flagship',2023,{overall:88,fps:92,camera:82,battery:84},'228g','80W'),
  p('nbz50sp',  'Nubia Z50S Pro',     'Nubia', 64800,'Snapdragon 8 Gen 2','8GB','256GB','50MP','5100mAh','6.78" AMOLED 120Hz','flagship',2023,{overall:87,fps:90,camera:80,battery:86},'204g','80W'),
  p('nbz60u',   'Nubia Z60 Ultra',    'Nubia', 89800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','6000mAh','6.85" AMOLED 120Hz','flagship',2024,{overall:92,fps:96,camera:86,battery:90},'246g','80W'),
  p('nbz70u',   'Nubia Z70 Ultra',    'Nubia', 89800,'Snapdragon 8 Elite','12GB','256GB','50MP','6150mAh','6.85" AMOLED 120Hz','flagship',2025,{overall:95,fps:98,camera:90,battery:92},'238g','80W'),

  // Nubia Flip
  p('nbflip',   'Nubia Flip',         'Nubia', 49800,'Snapdragon 7 Gen 1','8GB','256GB','50MP','4310mAh','6.9" AMOLED 120Hz','midrange',2024,{overall:66,fps:58,camera:62,battery:74},'209g','33W'),
  p('nbflip2',  'Nubia Flip 2',       'Nubia', 54800,'Snapdragon 7s Gen 3','8GB','256GB','50MP','4500mAh','6.9" AMOLED 120Hz','midrange',2025,{overall:70,fps:62,camera:66,battery:76},'203g','33W'),

  // ════════════════════════════════════════════════════════════
  //  LENOVO Gaming
  // ════════════════════════════════════════════════════════════

  p('lenld2',   'Legion Phone Duel 2','Lenovo', 89800,'Snapdragon 888','12GB','256GB','64MP','5500mAh','6.92" AMOLED 144Hz','flagship',2021,{overall:82,fps:94,camera:66,battery:86},'259g','90W'),
  p('leny90',   'Legion Y90',         'Lenovo', 99800,'Snapdragon 8 Gen 1','18GB','640GB','64MP','5600mAh','6.92" AMOLED 144Hz','flagship',2022,{overall:84,fps:96,camera:66,battery:88},'252g','68W'),

  // ════════════════════════════════════════════════════════════
  //  OPPO
  // ════════════════════════════════════════════════════════════

  // Find X3 (2021)
  p('opfx3',    'OPPO Find X3',       'OPPO', 89800,'Snapdragon 870','8GB','128GB','50MP','4500mAh','6.7" AMOLED 120Hz','flagship',2021,{overall:80,fps:80,camera:82,battery:78},'190g','65W'),
  p('opfx3p',   'OPPO Find X3 Pro',   'OPPO', 119800,'Snapdragon 888','12GB','256GB','50MP','4500mAh','6.7" AMOLED 120Hz','flagship',2021,{overall:86,fps:86,camera:90,battery:78},'193g','65W'),
  p('opfx3neo', 'OPPO Find X3 Neo',   'OPPO', 64800,'Snapdragon 865','12GB','256GB','50MP','4500mAh','6.55" AMOLED 90Hz','flagship',2021,{overall:78,fps:80,camera:78,battery:78},'184g','65W'),
  p('opfx3l',   'OPPO Find X3 Lite',  'OPPO', 44800,'Snapdragon 765G','8GB','128GB','64MP','4300mAh','6.43" AMOLED 90Hz','midrange',2021,{overall:68,fps:60,camera:64,battery:74},'172g','65W'),

  // Find X5 (2022)
  p('opfx5',    'OPPO Find X5',       'OPPO', 89800,'Snapdragon 888','8GB','256GB','50MP','4800mAh','6.55" AMOLED 120Hz','flagship',2022,{overall:82,fps:84,camera:86,battery:80},'196g','80W'),
  p('opfx5p',   'OPPO Find X5 Pro',   'OPPO', 119800,'Snapdragon 8 Gen 1','12GB','256GB','Hasselblad 50MP','5000mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:86,fps:87,camera:90,battery:84},'218g','80W'),
  p('opfx5l',   'OPPO Find X5 Lite',  'OPPO', 49800,'Dimensity 900','8GB','256GB','64MP','4500mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:66,fps:54,camera:62,battery:78},'173g','65W'),
  p('opfn',     'OPPO Find N',        'OPPO', 149800,'Snapdragon 888','8GB','256GB','50MP','4500mAh','7.1" AMOLED 120Hz','flagship',2022,{overall:82,fps:84,camera:80,battery:74},'275g','33W'),

  // Find X6/N2 (2023)
  p('opfx6',    'OPPO Find X6',       'OPPO', 99800,'Dimensity 9200','8GB','256GB','50MP','4800mAh','6.74" AMOLED 120Hz','flagship',2023,{overall:88,fps:88,camera:92,battery:82},'207g','80W'),
  p('opfx6p',   'OPPO Find X6 Pro',   'OPPO', 129800,'Dimensity 9200','16GB','256GB','Hasselblad 50MP 1inch','5000mAh','6.82" AMOLED 120Hz','flagship',2023,{overall:90,fps:89,camera:95,battery:85},'216g','100W'),
  p('opfn2',    'OPPO Find N2',       'OPPO', 149800,'Dimensity 9000+','12GB','256GB','50MP','4520mAh','7.1" AMOLED 120Hz','flagship',2023,{overall:86,fps:88,camera:84,battery:76},'233g','67W'),
  p('opfn2f',   'OPPO Find N2 Flip',  'OPPO', 99800,'Dimensity 9000+','8GB','256GB','50MP','4300mAh','6.8" AMOLED 120Hz','flagship',2023,{overall:80,fps:84,camera:76,battery:74},'191g','44W'),
  p('opfn3',    'OPPO Find N3',       'OPPO', 169800,'Snapdragon 8 Gen 2','16GB','256GB','Hasselblad 48MP','4805mAh','7.82" AMOLED 120Hz','flagship',2023,{overall:90,fps:90,camera:90,battery:78},'239g','67W'),
  p('opfn3f',   'OPPO Find N3 Flip',  'OPPO', 109800,'Dimensity 9200','12GB','256GB','50MP','4300mAh','6.8" AMOLED 120Hz','flagship',2023,{overall:82,fps:86,camera:80,battery:74},'198g','44W'),

  // Find X7/X8 (2024)
  p('opfx7',    'OPPO Find X7',       'OPPO', 109800,'Dimensity 9300','12GB','256GB','Hasselblad 50MP','5000mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:90,fps:92,camera:93,battery:85},'209g','100W'),
  p('opfx7u',   'OPPO Find X7 Ultra', 'OPPO', 149800,'Snapdragon 8 Gen 3','16GB','512GB','Hasselblad 50MP dual periscope','5000mAh','6.82" AMOLED 120Hz','flagship',2024,{overall:94,fps:94,camera:98,battery:86},'221g','100W'),
  p('opfx8',    'OPPO Find X8',       'OPPO', 109800,'Dimensity 9400','12GB','256GB','Hasselblad 50MP','5630mAh','6.59" AMOLED 120Hz','flagship',2024,{overall:92,fps:94,camera:94,battery:90},'193g','80W'),
  p('opfx8p',   'OPPO Find X8 Pro',   'OPPO', 139800,'Dimensity 9400','16GB','256GB','Hasselblad 50MP','5910mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:94,fps:95,camera:97,battery:92},'215g','80W'),

  // Find X8/X9/N5 (2025)
  p('opfx8u',   'OPPO Find X8 Ultra', 'OPPO', 169800,'Snapdragon 8 Elite','16GB','512GB','Hasselblad 50MP','5910mAh','6.82" AMOLED 120Hz','flagship',2025,{overall:96,fps:97,camera:99,battery:92},'225g','100W'),
  p('opfx8s',   'OPPO Find X8s',      'OPPO', 99800,'Dimensity 9400','12GB','256GB','50MP','6000mAh','6.59" AMOLED 120Hz','flagship',2025,{overall:92,fps:94,camera:92,battery:92},'190g','80W'),
  p('opfx9',    'OPPO Find X9',       'OPPO', 119800,'Dimensity 9400','12GB','256GB','Hasselblad 50MP','5800mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:94,fps:96,camera:96,battery:92},'198g','100W'),
  p('opfx9p',   'OPPO Find X9 Pro',   'OPPO', 149800,'Snapdragon 8 Elite','16GB','512GB','Hasselblad 50MP','6000mAh','6.82" AMOLED 120Hz','flagship',2025,{overall:96,fps:97,camera:98,battery:94},'218g','100W'),
  p('opfn5',    'OPPO Find N5',       'OPPO', 179800,'Snapdragon 8 Elite','12GB','256GB','50MP','5600mAh','8.0" AMOLED 120Hz','flagship',2025,{overall:92,fps:94,camera:88,battery:86},'226g','80W'),

  // Find X9 Ultra / N6 (2026)
  p('opfx9u',   'OPPO Find X9 Ultra', 'OPPO', 179800,'Snapdragon 8 Elite 2','16GB','512GB','Hasselblad 50MP','6000mAh','6.82" AMOLED 120Hz','flagship',2026,{overall:98,fps:98,camera:99,battery:95},'225g','100W'),
  p('opfn6',    'OPPO Find N6',       'OPPO', 189800,'Snapdragon 8 Elite 2','16GB','512GB','50MP','5800mAh','8.0" AMOLED 120Hz','flagship',2026,{overall:94,fps:96,camera:90,battery:88},'220g','80W'),

  // Reno series
  p('oprn5',    'OPPO Reno5',         'OPPO', 39800,'Snapdragon 765G','8GB','128GB','64MP','4300mAh','6.43" AMOLED 90Hz','midrange',2021,{overall:64,fps:56,camera:62,battery:74},'172g','65W'),
  p('oprn5p',   'OPPO Reno5 Pro',     'OPPO', 54800,'Dimensity 1000+','8GB','128GB','64MP','4350mAh','6.55" AMOLED 90Hz','midrange',2021,{overall:68,fps:64,camera:64,battery:74},'173g','65W'),
  p('oprn6',    'OPPO Reno6',         'OPPO', 39800,'Dimensity 900','8GB','128GB','64MP','4300mAh','6.43" AMOLED 90Hz','midrange',2021,{overall:64,fps:54,camera:62,battery:74},'182g','65W'),
  p('oprn6p',   'OPPO Reno6 Pro',     'OPPO', 54800,'Dimensity 1200','12GB','256GB','50MP','4500mAh','6.55" AMOLED 90Hz','midrange',2021,{overall:72,fps:66,camera:68,battery:76},'177g','65W'),
  p('oprn7',    'OPPO Reno7',         'OPPO', 39800,'Snapdragon 778G','8GB','128GB','64MP','4500mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:66,fps:60,camera:64,battery:78},'175g','33W'),
  p('oprn7p',   'OPPO Reno7 Pro',     'OPPO', 49800,'Dimensity 1200-Max','8GB','256GB','50MP','4500mAh','6.55" AMOLED 90Hz','midrange',2022,{overall:70,fps:66,camera:68,battery:78},'180g','65W'),
  p('oprn8',    'OPPO Reno8',         'OPPO', 49800,'Dimensity 1300','8GB','128GB','50MP','4500mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:65,fps:58,camera:64,battery:78},'179g','80W'),
  p('oprn8p',   'OPPO Reno8 Pro',     'OPPO', 69800,'Dimensity 8100-Max','8GB','256GB','50MP','4500mAh','6.62" AMOLED 120Hz','midrange',2022,{overall:72,fps:68,camera:70,battery:79},'183g','80W'),
  p('oprn9',    'OPPO Reno9',         'OPPO', 44800,'Snapdragon 778G','8GB','256GB','64MP','4500mAh','6.7" AMOLED 120Hz','midrange',2023,{overall:66,fps:60,camera:65,battery:79},'174g','67W'),
  p('oprn9p',   'OPPO Reno9 Pro',     'OPPO', 59800,'Dimensity 8100','12GB','256GB','50MP','4500mAh','6.7" AMOLED 120Hz','midrange',2023,{overall:72,fps:68,camera:71,battery:80},'174g','67W'),
  p('oprn10p',  'OPPO Reno10 Pro',    'OPPO', 59800,'Snapdragon 778G','8GB','256GB','50MP','4600mAh','6.7" AMOLED 120Hz','midrange',2023,{overall:68,fps:62,camera:67,battery:80},'185g','80W'),
  p('oprn10pp', 'OPPO Reno10 Pro+',   'OPPO', 79800,'Snapdragon 8+ Gen 1','12GB','256GB','50MP','4700mAh','6.74" AMOLED 120Hz','midrange',2023,{overall:78,fps:80,camera:76,battery:82},'194g','100W'),
  p('oprn11',   'OPPO Reno11',        'OPPO', 49800,'Dimensity 7050','8GB','256GB','64MP','5000mAh','6.7" AMOLED 120Hz','midrange',2024,{overall:68,fps:58,camera:66,battery:85},'182g','67W'),
  p('oprn11p',  'OPPO Reno11 Pro',    'OPPO', 69800,'Dimensity 8200','12GB','256GB','50MP','4600mAh','6.74" AMOLED 120Hz','midrange',2024,{overall:74,fps:70,camera:73,battery:81},'186g','80W'),
  p('oprn12p',  'OPPO Reno12 Pro',    'OPPO', 64800,'Dimensity 7300 Energy','12GB','256GB','50MP','5000mAh','6.7" AMOLED 120Hz','midrange',2024,{overall:72,fps:62,camera:70,battery:86},'180g','80W'),
  p('oprn13',   'OPPO Reno13',        'OPPO', 54800,'Dimensity 8350','8GB','256GB','50MP','5600mAh','6.59" AMOLED 120Hz','midrange',2025,{overall:74,fps:68,camera:72,battery:88},'181g','80W'),
  p('oprn13p',  'OPPO Reno13 Pro',    'OPPO', 69800,'Dimensity 8350','12GB','256GB','50MP','5800mAh','6.83" AMOLED 120Hz','midrange',2025,{overall:78,fps:72,camera:76,battery:90},'197g','80W'),
  p('oprn14',   'OPPO Reno14',        'OPPO', 54800,'Dimensity 8400','8GB','256GB','50MP','6000mAh','6.7" AMOLED 120Hz','midrange',2025,{overall:76,fps:72,camera:74,battery:92},'182g','80W'),
  p('oprn14p',  'OPPO Reno14 Pro',    'OPPO', 74800,'Dimensity 8400','12GB','256GB','50MP','6200mAh','6.83" AMOLED 120Hz','midrange',2025,{overall:80,fps:76,camera:78,battery:94},'195g','100W'),

  // ════════════════════════════════════════════════════════════
  //  vivo
  // ════════════════════════════════════════════════════════════

  // X60 (2021)
  p('vivx60',   'vivo X60',           'vivo', 54800,'Exynos 1080','8GB','128GB','ZEISS 48MP','4300mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:74,fps:72,camera:78,battery:74},'175g','33W'),
  p('vivx60p',  'vivo X60 Pro',       'vivo', 69800,'Exynos 1080','12GB','256GB','ZEISS 48MP','4200mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:76,fps:72,camera:82,battery:72},'177g','33W'),
  p('vivx60pp', 'vivo X60 Pro+',      'vivo', 89800,'Snapdragon 888','12GB','256GB','ZEISS 50MP','4200mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:82,fps:84,camera:88,battery:72},'190g','55W'),
  p('vivx70',   'vivo X70',           'vivo', 54800,'Exynos 1080','8GB','128GB','ZEISS 40MP','4400mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:74,fps:72,camera:80,battery:76},'181g','44W'),
  p('vivx70p',  'vivo X70 Pro',       'vivo', 69800,'Exynos 1080','12GB','256GB','ZEISS 50MP','4450mAh','6.56" AMOLED 120Hz','flagship',2021,{overall:78,fps:74,camera:86,battery:76},'185g','44W'),
  p('vivx70pp', 'vivo X70 Pro+',      'vivo', 99800,'Snapdragon 888+','12GB','256GB','ZEISS 50MP','4500mAh','6.78" AMOLED 120Hz','flagship',2021,{overall:84,fps:86,camera:92,battery:78},'213g','55W'),

  // X80 (2022)
  p('vivx80',   'vivo X80',           'vivo', 79800,'Dimensity 9000','12GB','256GB','ZEISS 50MP','4500mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:84,fps:86,camera:88,battery:78},'206g','80W'),
  p('vivx80p',  'vivo X80 Pro',       'vivo', 109800,'Snapdragon 8 Gen 1','12GB','256GB','ZEISS 50MP','4700mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:86,fps:87,camera:92,battery:80},'215g','80W'),
  p('vivx80pp', 'vivo X80 Pro+',      'vivo', 129800,'Snapdragon 8+ Gen 1','12GB','256GB','ZEISS 50MP','4700mAh','6.78" AMOLED 120Hz','flagship',2022,{overall:88,fps:90,camera:94,battery:80},'215g','80W'),
  p('vivxnote', 'vivo X Note',        'vivo', 79800,'Snapdragon 8 Gen 1','8GB','256GB','ZEISS 50MP','5000mAh','7.0" AMOLED 120Hz','flagship',2022,{overall:82,fps:86,camera:84,battery:82},'229g','80W'),
  p('vivxfold', 'vivo X Fold',        'vivo', 149800,'Snapdragon 8 Gen 1','12GB','256GB','ZEISS 50MP','4600mAh','8.03" AMOLED 120Hz','flagship',2022,{overall:84,fps:86,camera:84,battery:76},'311g','66W'),

  // X90 (2023)
  p('vivx90',   'vivo X90',           'vivo', 79800,'Dimensity 9200','12GB','256GB','ZEISS 50MP','4810mAh','6.78" AMOLED 120Hz','flagship',2023,{overall:86,fps:88,camera:90,battery:82},'196g','120W'),
  p('vivx90p',  'vivo X90 Pro',       'vivo', 119800,'Dimensity 9200','12GB','256GB','ZEISS 50MP 1inch','4870mAh','6.78" AMOLED 120Hz','flagship',2023,{overall:89,fps:90,camera:95,battery:82},'214g','120W'),
  p('vivx90pp', 'vivo X90 Pro+',      'vivo', 139800,'Snapdragon 8 Gen 2','12GB','256GB','ZEISS 50MP 1inch','4700mAh','6.78" AMOLED 120Hz','flagship',2023,{overall:91,fps:92,camera:97,battery:80},'221g','80W'),
  p('vivxfold2','vivo X Fold2',       'vivo', 149800,'Snapdragon 8 Gen 2','12GB','256GB','ZEISS 50MP','4800mAh','8.03" AMOLED 120Hz','flagship',2023,{overall:88,fps:90,camera:86,battery:78},'279g','120W'),
  p('vivxflip', 'vivo X Flip',        'vivo', 99800,'Snapdragon 8+ Gen 1','8GB','256GB','ZEISS 50MP','4400mAh','6.75" AMOLED 120Hz','flagship',2023,{overall:80,fps:82,camera:78,battery:74},'198g','44W'),

  // X100 (2024)
  p('vivx100',  'vivo X100',          'vivo', 99800,'Dimensity 9300','12GB','256GB','ZEISS 50MP','5000mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:90,fps:92,camera:94,battery:84},'206g','120W'),
  p('vivx100p', 'vivo X100 Pro',      'vivo', 129800,'Dimensity 9300','16GB','256GB','ZEISS 50MP','5400mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:92,fps:93,camera:96,battery:88},'225g','100W'),
  p('vivx100s', 'vivo X100s',         'vivo', 79800,'Dimensity 9300+','12GB','256GB','ZEISS 50MP','5100mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:90,fps:92,camera:92,battery:86},'198g','100W'),
  p('vivx100u', 'vivo X100 Ultra',    'vivo', 149800,'Snapdragon 8 Gen 3','16GB','512GB','ZEISS 200MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:94,fps:94,camera:98,battery:89},'229g','100W'),
  p('vivxfold3','vivo X Fold3',       'vivo', 129800,'Snapdragon 8 Gen 3','12GB','256GB','ZEISS 50MP','5700mAh','8.03" AMOLED 120Hz','flagship',2024,{overall:90,fps:92,camera:88,battery:86},'236g','100W'),
  p('vivxfold3p','vivo X Fold3 Pro',  'vivo', 159800,'Snapdragon 8 Gen 3','16GB','512GB','ZEISS 50MP','5700mAh','8.03" AMOLED 120Hz','flagship',2024,{overall:94,fps:94,camera:92,battery:88},'236g','100W'),

  // X200 (2025)
  p('vivx200',  'vivo X200',          'vivo', 99800,'Dimensity 9400','12GB','256GB','ZEISS 50MP','5800mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:93,fps:94,camera:95,battery:90},'197g','90W'),
  p('vivx200p', 'vivo X200 Pro',      'vivo', 129800,'Dimensity 9400','16GB','256GB','ZEISS 200MP','6000mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:96,fps:96,camera:98,battery:93},'223g','90W'),
  p('vivx200s', 'vivo X200s',         'vivo', 79800,'Dimensity 9400','12GB','256GB','ZEISS 50MP','6000mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:92,fps:94,camera:92,battery:92},'192g','90W'),
  p('vivx200u', 'vivo X200 Ultra',    'vivo', 159800,'Snapdragon 8 Elite','16GB','512GB','ZEISS 200MP','6100mAh','6.82" AMOLED 120Hz','flagship',2025,{overall:97,fps:97,camera:99,battery:94},'233g','100W'),
  p('vivx200fe','vivo X200 FE',       'vivo', 69800,'Dimensity 9300','12GB','256GB','ZEISS 50MP','5500mAh','6.67" AMOLED 120Hz','flagship',2025,{overall:88,fps:90,camera:88,battery:88},'190g','80W'),
  p('vivxfold5','vivo X Fold5',       'vivo', 149800,'Snapdragon 8 Elite','16GB','512GB','ZEISS 50MP','6000mAh','8.03" AMOLED 120Hz','flagship',2025,{overall:94,fps:96,camera:92,battery:90},'230g','100W'),

  // V series
  p('vivv21',   'vivo V21',           'vivo', 34800,'Dimensity 800U','8GB','128GB','64MP','4000mAh','6.44" AMOLED 90Hz','midrange',2021,{overall:60,fps:50,camera:62,battery:72},'176g','33W'),
  p('vivv23',   'vivo V23',           'vivo', 39800,'Dimensity 920','8GB','128GB','64MP','4200mAh','6.44" AMOLED 90Hz','midrange',2022,{overall:62,fps:52,camera:62,battery:74},'179g','44W'),
  p('vivv25p',  'vivo V25 Pro',       'vivo', 49800,'Dimensity 1300','8GB','128GB','64MP','4830mAh','6.56" AMOLED 120Hz','midrange',2022,{overall:66,fps:58,camera:65,battery:80},'190g','66W'),
  p('vivv27p',  'vivo V27 Pro',       'vivo', 49800,'Dimensity 8200','8GB','256GB','50MP','4600mAh','6.78" AMOLED 120Hz','midrange',2023,{overall:70,fps:65,camera:68,battery:78},'182g','66W'),
  p('vivv29p',  'vivo V29 Pro',       'vivo', 54800,'Snapdragon 778G','8GB','256GB','50MP','4600mAh','6.78" AMOLED 120Hz','midrange',2023,{overall:68,fps:62,camera:67,battery:78},'186g','80W'),
  p('vivv30p',  'vivo V30 Pro',       'vivo', 59800,'Snapdragon 7 Gen 3','8GB','256GB','ZEISS 50MP','5000mAh','6.78" AMOLED 120Hz','midrange',2024,{overall:73,fps:66,camera:72,battery:84},'187g','80W'),
  p('vivv40',   'vivo V40',           'vivo', 49800,'Snapdragon 7 Gen 3','8GB','256GB','ZEISS 50MP','5500mAh','6.78" AMOLED 120Hz','midrange',2024,{overall:74,fps:66,camera:74,battery:88},'190g','80W'),

  // Y series
  p('vivy72',   'vivo Y72 5G',        'vivo', 24800,'Dimensity 700','8GB','128GB','64MP','5000mAh','6.58" IPS 60Hz','budget',2021,{overall:48,fps:36,camera:50,battery:82},'193g','18W'),
  p('vivy75',   'vivo Y75 5G',        'vivo', 22800,'Dimensity 700','8GB','128GB','50MP','5000mAh','6.58" IPS','budget',2022,{overall:46,fps:36,camera:46,battery:82},'185g','18W'),
  p('vivy76',   'vivo Y76 5G',        'vivo', 29800,'Dimensity 700','8GB','128GB','50MP','4100mAh','6.58" IPS','budget',2022,{overall:48,fps:38,camera:48,battery:72},'175g','18W'),
  p('vivy78p',  'vivo Y78+',          'vivo', 24800,'Dimensity 7020','8GB','128GB','50MP','5000mAh','6.64" AMOLED 120Hz','budget',2023,{overall:52,fps:42,camera:50,battery:84},'190g','44W'),
  p('vivy100',  'vivo Y100 5G',       'vivo', 29800,'Dimensity 6300','8GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','budget',2024,{overall:55,fps:44,camera:52,battery:86},'186g','44W'),
  p('vivy200',  'vivo Y200',          'vivo', 29800,'Snapdragon 4 Gen 2','8GB','128GB','50MP','5000mAh','6.67" AMOLED 120Hz','budget',2024,{overall:54,fps:40,camera:50,battery:86},'190g','44W'),

  // ════════════════════════════════════════════════════════════
  //  ONEPLUS
  // ════════════════════════════════════════════════════════════

  // 2021
  p('op9',      'OnePlus 9',          'OnePlus', 74800,'Snapdragon 888','8GB','128GB','Hasselblad 48MP','4500mAh','6.55" AMOLED 120Hz','flagship',2021,{overall:82,fps:86,camera:82,battery:78},'192g','65W'),
  p('op9p',     'OnePlus 9 Pro',      'OnePlus', 89800,'Snapdragon 888','8GB','256GB','Hasselblad 48MP','4500mAh','6.7" AMOLED 120Hz','flagship',2021,{overall:86,fps:86,camera:88,battery:78},'197g','65W'),
  p('op9r',     'OnePlus 9R',         'OnePlus', 44800,'Snapdragon 870','8GB','128GB','48MP','4500mAh','6.55" AMOLED 120Hz','flagship',2021,{overall:76,fps:82,camera:72,battery:78},'189g','65W'),
  p('op9rt',    'OnePlus 9RT',        'OnePlus', 49800,'Snapdragon 888','8GB','128GB','50MP','4500mAh','6.62" AMOLED 120Hz','flagship',2021,{overall:80,fps:86,camera:76,battery:78},'198g','65W'),
  p('opnord2',  'OnePlus Nord 2',     'OnePlus', 39800,'Dimensity 1200','8GB','128GB','50MP','4500mAh','6.43" AMOLED 90Hz','midrange',2021,{overall:72,fps:68,camera:70,battery:78},'189g','65W'),
  p('opnordce', 'OnePlus Nord CE',    'OnePlus', 29800,'Snapdragon 750G','8GB','128GB','64MP','4500mAh','6.43" AMOLED 90Hz','midrange',2021,{overall:64,fps:56,camera:60,battery:78},'170g','30W'),
  p('opnordn100','OnePlus Nord N100', 'OnePlus', 19800,'Snapdragon 460','4GB','64GB','13MP','5000mAh','6.52" IPS 90Hz','budget',2021,{overall:34,fps:22,camera:26,battery:84},'188g','18W'),
  p('opnordn200','OnePlus Nord N200', 'OnePlus', 24800,'Snapdragon 480','4GB','64GB','13MP','5000mAh','6.49" IPS 90Hz','budget',2021,{overall:38,fps:28,camera:28,battery:84},'189g','18W'),

  // 2022
  p('op10p',    'OnePlus 10 Pro',     'OnePlus', 89800,'Snapdragon 8 Gen 1','12GB','256GB','Hasselblad 48MP','5000mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:85,fps:88,camera:86,battery:86},'200g','80W'),
  p('op10r',    'OnePlus 10R',        'OnePlus', 44800,'Dimensity 8100','8GB','128GB','50MP','5000mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:78,fps:78,camera:72,battery:84},'186g','150W'),
  p('op10t',    'OnePlus 10T',        'OnePlus', 79800,'Snapdragon 8+ Gen 1','16GB','256GB','50MP','4800mAh','6.7" AMOLED 120Hz','flagship',2022,{overall:84,fps:90,camera:80,battery:83},'203g','150W'),
  p('opnord2t', 'OnePlus Nord 2T',    'OnePlus', 39800,'Dimensity 1300','8GB','128GB','50MP','4500mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:72,fps:66,camera:70,battery:78},'190g','80W'),
  p('opnordce2','OnePlus Nord CE 2',  'OnePlus', 29800,'Dimensity 900','8GB','128GB','64MP','4500mAh','6.43" AMOLED 90Hz','midrange',2022,{overall:64,fps:54,camera:60,battery:78},'173g','65W'),
  p('opnordce2l','OnePlus Nord CE 2 Lite','OnePlus',24800,'Snapdragon 695','6GB','128GB','64MP','5000mAh','6.59" IPS 120Hz','midrange',2022,{overall:58,fps:48,camera:54,battery:84},'195g','33W'),
  p('opnordn20','OnePlus Nord N20',   'OnePlus', 29800,'Snapdragon 695','6GB','128GB','64MP','4500mAh','6.43" AMOLED 60Hz','midrange',2022,{overall:56,fps:46,camera:54,battery:78},'173g','33W'),
  p('opnordn300','OnePlus Nord N300', 'OnePlus', 19800,'Dimensity 810','4GB','64GB','48MP','5000mAh','6.56" IPS 90Hz','budget',2022,{overall:42,fps:34,camera:38,battery:82},'190g','33W'),

  // 2023
  p('op11',     'OnePlus 11',         'OnePlus', 89800,'Snapdragon 8 Gen 2','16GB','256GB','Hasselblad 50MP','5000mAh','6.7" AMOLED 120Hz','flagship',2023,{overall:89,fps:93,camera:88,battery:87},'205g','100W'),
  p('op11r',    'OnePlus 11R',        'OnePlus', 49800,'Snapdragon 8+ Gen 1','8GB','128GB','50MP','5000mAh','6.74" AMOLED 120Hz','flagship',2023,{overall:82,fps:86,camera:76,battery:84},'204g','100W'),
  p('opnord3',  'OnePlus Nord 3',     'OnePlus', 39800,'Dimensity 9000','8GB','128GB','50MP','5000mAh','6.74" AMOLED 120Hz','midrange',2023,{overall:76,fps:76,camera:72,battery:84},'193g','80W'),
  p('opnordce3','OnePlus Nord CE 3',  'OnePlus', 29800,'Snapdragon 782G','8GB','128GB','50MP','5000mAh','6.7" AMOLED 120Hz','midrange',2023,{overall:66,fps:60,camera:62,battery:84},'184g','80W'),
  p('opnordce3l','OnePlus Nord CE 3 Lite','OnePlus',22800,'Snapdragon 695','8GB','128GB','108MP','5000mAh','6.72" IPS 120Hz','midrange',2023,{overall:56,fps:48,camera:56,battery:84},'195g','67W'),
  p('opnordn30','OnePlus Nord N30',   'OnePlus', 29800,'Snapdragon 695','8GB','128GB','108MP','5000mAh','6.72" IPS 120Hz','midrange',2023,{overall:58,fps:48,camera:58,battery:84},'195g','50W'),
  p('opopen',   'OnePlus Open',       'OnePlus', 249800,'Snapdragon 8 Gen 2','16GB','512GB','Hasselblad 48MP','4805mAh','7.82" AMOLED 120Hz','flagship',2023,{overall:90,fps:90,camera:90,battery:78},'245g','67W'),

  // 2024
  p('op12',     'OnePlus 12',         'OnePlus', 99800,'Snapdragon 8 Gen 3','16GB','256GB','Hasselblad 50MP','5400mAh','6.82" AMOLED 120Hz','flagship',2024,{overall:92,fps:95,camera:91,battery:92},'220g','100W'),
  p('op12r',    'OnePlus 12R',        'OnePlus', 49800,'Snapdragon 8 Gen 2','8GB','128GB','50MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:84,fps:88,camera:78,battery:88},'207g','100W'),
  p('opnord4',  'OnePlus Nord 4',     'OnePlus', 39800,'Snapdragon 7+ Gen 3','8GB','256GB','50MP','5500mAh','6.74" AMOLED 120Hz','midrange',2024,{overall:78,fps:76,camera:72,battery:88},'199g','100W'),
  p('opnordce4','OnePlus Nord CE 4',  'OnePlus', 29800,'Snapdragon 7 Gen 3','8GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:70,fps:64,camera:66,battery:88},'184g','100W'),
  p('opnordce4l','OnePlus Nord CE 4 Lite','OnePlus',22800,'Snapdragon 695','8GB','128GB','50MP','5500mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:58,fps:48,camera:52,battery:88},'191g','80W'),
  p('opnordn40','OnePlus Nord N40',   'OnePlus', 22800,'Dimensity 7025','6GB','128GB','108MP','5000mAh','6.56" AMOLED 120Hz','midrange',2024,{overall:56,fps:46,camera:56,battery:84},'187g','33W'),

  // 2025
  p('op13',     'OnePlus 13',         'OnePlus', 99800,'Snapdragon 8 Elite','12GB','256GB','Hasselblad 50MP','6000mAh','6.82" AMOLED 120Hz','flagship',2025,{overall:90,fps:95,camera:88,battery:97},'210g','100W'),
  p('op13r',    'OnePlus 13R',        'OnePlus', 59800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','6000mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:88,fps:92,camera:82,battery:92},'206g','80W'),
  p('op13t',    'OnePlus 13T',        'OnePlus', 79800,'Snapdragon 8 Elite','12GB','256GB','Hasselblad 50MP','6000mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:92,fps:96,camera:90,battery:94},'205g','100W'),
  p('op13s',    'OnePlus 13s',        'OnePlus', 69800,'Dimensity 9400','8GB','256GB','50MP','6200mAh','6.78" AMOLED 120Hz','flagship',2025,{overall:88,fps:90,camera:84,battery:94},'198g','100W'),
  p('opnord5',  'OnePlus Nord 5',     'OnePlus', 44800,'Snapdragon 8 Gen 3','8GB','256GB','50MP','5500mAh','6.74" AMOLED 120Hz','midrange',2025,{overall:82,fps:84,camera:78,battery:88},'195g','80W'),
  p('opnordce5','OnePlus Nord CE 5',  'OnePlus', 29800,'Dimensity 8400','8GB','256GB','50MP','5500mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:76,fps:74,camera:70,battery:88},'186g','80W'),

  // 2026 — OnePlus 15 (speculative)
  p('op15',     'OnePlus 15',         'OnePlus', 109800,'Snapdragon 8 Elite 2','12GB','256GB','Hasselblad 50MP','6500mAh','6.82" AMOLED','flagship',2026,{overall:92,fps:96,camera:90,battery:99},'213g','100W'),

  // ════════════════════════════════════════════════════════════
  //  NOTHING / CMF
  // ════════════════════════════════════════════════════════════

  p('np1',      'Nothing Phone (1)',   'Nothing', 69800,'Snapdragon 778G+','8GB','256GB','50MP','4500mAh','6.55" OLED 120Hz','midrange',2022,{overall:72,fps:65,camera:68,battery:79},'193g','33W'),
  p('np2',      'Nothing Phone (2)',   'Nothing', 79800,'Snapdragon 8+ Gen 1','12GB','256GB','50MP','4700mAh','6.7" OLED 120Hz','flagship',2023,{overall:80,fps:82,camera:76,battery:80},'201g','45W'),
  p('np2a',     'Nothing Phone (2a)', 'Nothing', 49800,'Dimensity 7200 Pro','8GB','128GB','50MP','5000mAh','6.7" AMOLED 120Hz','midrange',2024,{overall:70,fps:62,camera:66,battery:84},'190g','45W'),
  p('np2ap',    'Nothing Phone (2a) Plus','Nothing',54800,'Dimensity 7350 Pro','8GB','256GB','50MP','5000mAh','6.7" AMOLED 120Hz','midrange',2024,{overall:72,fps:64,camera:68,battery:84},'190g','50W'),
  p('np3a',     'Nothing Phone (3a)', 'Nothing', 49800,'Snapdragon 7s Gen 3','8GB','256GB','50MP','5000mAh','6.8" AMOLED 120Hz','midrange',2025,{overall:74,fps:66,camera:72,battery:84},'192g','45W'),
  p('np3ap',    'Nothing Phone (3a) Pro','Nothing',59800,'Snapdragon 7s Gen 3','8GB','256GB','50MP','5000mAh','6.8" AMOLED 120Hz','midrange',2025,{overall:76,fps:68,camera:76,battery:84},'195g','50W'),
  p('np3',      'Nothing Phone (3)',   'Nothing', 89800,'Snapdragon 8 Elite','12GB','256GB','50MP','5500mAh','6.75" AMOLED 120Hz','flagship',2025,{overall:90,fps:94,camera:86,battery:88},'198g','65W'),
  p('cmf1',     'CMF Phone 1',        'Nothing', 29800,'Dimensity 7300','8GB','128GB','50MP','5000mAh','6.67" AMOLED 120Hz','midrange',2024,{overall:66,fps:58,camera:62,battery:84},'197g','33W'),
  p('cmf2p',    'CMF Phone 2 Pro',    'Nothing', 39800,'Dimensity 7300','8GB','256GB','50MP','5000mAh','6.67" AMOLED 120Hz','midrange',2025,{overall:70,fps:62,camera:66,battery:84},'195g','80W'),

  // ════════════════════════════════════════════════════════════
  //  HUAWEI
  // ════════════════════════════════════════════════════════════

  // P series
  p('hwp40',    'HUAWEI P40',         'HUAWEI', 89800,'Kirin 990 5G','8GB','128GB','50MP','3800mAh','6.1" OLED','flagship',2020,{overall:80,fps:78,camera:88,battery:72},'175g','22.5W'),
  p('hwp40p',   'HUAWEI P40 Pro',     'HUAWEI', 119800,'Kirin 990 5G','8GB','256GB','50MP Leica','4200mAh','6.58" OLED 90Hz','flagship',2020,{overall:85,fps:80,camera:94,battery:78},'209g','40W'),
  p('hwp40pp',  'HUAWEI P40 Pro+',    'HUAWEI', 159800,'Kirin 990 5G','8GB','512GB','50MP Leica','4200mAh','6.58" OLED 90Hz','flagship',2020,{overall:87,fps:80,camera:96,battery:78},'226g','40W'),
  p('hwp50p',   'HUAWEI P50 Pro',     'HUAWEI', 119800,'Snapdragon 888 (4G)','8GB','256GB','50MP','4360mAh','6.6" OLED 120Hz','flagship',2021,{overall:83,fps:82,camera:93,battery:76},'195g','66W'),
  p('hwp60p',   'HUAWEI P60 Pro',     'HUAWEI', 129800,'Snapdragon 8+ Gen 1 (4G)','8GB','256GB','48MP XMAGE','4815mAh','6.67" OLED 120Hz','flagship',2023,{overall:85,fps:82,camera:94,battery:82},'200g','88W'),

  // Pura 70 (2024)
  p('hwpura70', 'HUAWEI Pura 70',     'HUAWEI', 99800,'Kirin 9010','8GB','256GB','50MP XMAGE','4900mAh','6.6" OLED 120Hz','flagship',2024,{overall:82,fps:74,camera:88,battery:84},'199g','66W'),
  p('hwpura70p','HUAWEI Pura 70 Pro', 'HUAWEI', 139800,'Kirin 9010','12GB','256GB','50MP XMAGE','5050mAh','6.8" OLED 120Hz','flagship',2024,{overall:85,fps:76,camera:92,battery:86},'220g','100W'),
  p('hwpura70pp','HUAWEI Pura 70 Pro+','HUAWEI',159800,'Kirin 9010','16GB','512GB','50MP XMAGE','5050mAh','6.8" OLED 120Hz','flagship',2024,{overall:87,fps:78,camera:95,battery:86},'225g','100W'),
  p('hwpura70u','HUAWEI Pura 70 Ultra','HUAWEI', 179800,'Kirin 9010','16GB','512GB','50MP XMAGE 1inch','5200mAh','6.8" OLED 120Hz','flagship',2024,{overall:89,fps:78,camera:97,battery:88},'226g','100W'),

  // Pura 80 (2025)
  p('hwpura80', 'HUAWEI Pura 80',     'HUAWEI', 109800,'Kirin 9020','12GB','256GB','50MP XMAGE','5100mAh','6.6" OLED 120Hz','flagship',2025,{overall:86,fps:80,camera:92,battery:86},'195g','100W'),
  p('hwpura80p','HUAWEI Pura 80 Pro', 'HUAWEI', 149800,'Kirin 9020','12GB','512GB','50MP XMAGE','5500mAh','6.8" OLED 120Hz','flagship',2025,{overall:89,fps:82,camera:96,battery:90},'218g','100W'),
  p('hwpura80u','HUAWEI Pura 80 Ultra','HUAWEI', 189800,'Kirin 9020','16GB','1TB','50MP XMAGE 1inch','5500mAh','6.8" OLED 120Hz','flagship',2025,{overall:91,fps:84,camera:98,battery:90},'228g','100W'),

  // Mate series
  p('hwm40p',   'HUAWEI Mate 40 Pro', 'HUAWEI', 139800,'Kirin 9000','8GB','256GB','50MP Leica','4400mAh','6.76" OLED 90Hz','flagship',2020,{overall:86,fps:84,camera:93,battery:78},'212g','66W'),
  p('hwm50p',   'HUAWEI Mate 50 Pro', 'HUAWEI', 149800,'Snapdragon 8+ Gen 1 (4G)','8GB','256GB','50MP XMAGE','4700mAh','6.74" OLED 120Hz','flagship',2022,{overall:85,fps:83,camera:94,battery:80},'205g','66W'),
  p('hwm60p',   'HUAWEI Mate 60 Pro', 'HUAWEI', 159800,'Kirin 9000S','12GB','512GB','48MP XMAGE','5000mAh','6.82" OLED 120Hz','flagship',2023,{overall:84,fps:75,camera:90,battery:86},'225g','88W'),
  p('hwmxt',    'HUAWEI Mate XT',     'HUAWEI', 299800,'Kirin 9010','16GB','512GB','50MP XMAGE','5600mAh','10.2" OLED 120Hz','flagship',2024,{overall:86,fps:74,camera:88,battery:82},'298g','66W'),
  p('hwm70',    'HUAWEI Mate 70',     'HUAWEI', 129800,'Kirin 9020','12GB','256GB','50MP XMAGE','5300mAh','6.7" OLED 120Hz','flagship',2024,{overall:86,fps:78,camera:90,battery:88},'203g','66W'),
  p('hwm70p',   'HUAWEI Mate 70 Pro', 'HUAWEI', 159800,'Kirin 9020','12GB','512GB','50MP XMAGE','5500mAh','6.9" OLED 120Hz','flagship',2024,{overall:88,fps:80,camera:94,battery:90},'220g','100W'),
  p('hwm70pp',  'HUAWEI Mate 70 Pro+','HUAWEI', 189800,'Kirin 9020','16GB','512GB','50MP XMAGE','5900mAh','6.9" OLED 120Hz','flagship',2024,{overall:90,fps:82,camera:96,battery:92},'230g','100W'),
  p('hwm70rs',  'HUAWEI Mate 70 RS',  'HUAWEI', 229800,'Kirin 9020','16GB','1TB','50MP XMAGE','5900mAh','6.9" OLED 120Hz','flagship',2024,{overall:91,fps:82,camera:97,battery:92},'245g','100W'),

  // nova
  p('hwnv9',    'HUAWEI nova 9',      'HUAWEI', 49800,'Snapdragon 778G (4G)','8GB','128GB','50MP','4300mAh','6.57" OLED 120Hz','midrange',2021,{overall:65,fps:60,camera:66,battery:75},'175g','66W'),
  p('hwnv10',   'HUAWEI nova 10',     'HUAWEI', 49800,'Snapdragon 778G (4G)','8GB','128GB','50MP','4000mAh','6.67" OLED','midrange',2022,{overall:64,fps:58,camera:64,battery:72},'168g','66W'),
  p('hwnv10p',  'HUAWEI nova 10 Pro', 'HUAWEI', 64800,'Snapdragon 778G (4G)','8GB','256GB','50MP','4500mAh','6.78" OLED 120Hz','midrange',2022,{overall:68,fps:60,camera:66,battery:76},'191g','100W'),
  p('hwnv11',   'HUAWEI nova 11',     'HUAWEI', 49800,'Snapdragon 778G (4G)','8GB','256GB','50MP','4500mAh','6.7" OLED 120Hz','midrange',2023,{overall:66,fps:60,camera:66,battery:77},'171g','66W'),
  p('hwnv12',   'HUAWEI nova 12 Pro', 'HUAWEI', 59800,'Kirin 8000','8GB','256GB','50MP','4600mAh','6.7" OLED 120Hz','midrange',2024,{overall:68,fps:58,camera:68,battery:79},'183g','100W'),

  // ════════════════════════════════════════════════════════════
  //  ASUS
  // ════════════════════════════════════════════════════════════

  p('rog6',  'ROG Phone 6',         'ASUS', 129800,'Snapdragon 8+ Gen 1','16GB','512GB','50MP','6000mAh','6.78" AMOLED 165Hz','flagship',2022,{overall:87,fps:97,camera:72,battery:90},'239g','65W'),
  p('rog6p', 'ROG Phone 6 Pro',     'ASUS', 159800,'Snapdragon 8+ Gen 1','18GB','512GB','50MP','6000mAh','6.78" AMOLED 165Hz','flagship',2022,{overall:88,fps:98,camera:72,battery:90},'239g','65W'),
  p('rog7',  'ROG Phone 7',         'ASUS', 129800,'Snapdragon 8 Gen 2','16GB','512GB','50MP','6000mAh','6.78" AMOLED 165Hz','flagship',2023,{overall:90,fps:98,camera:74,battery:91},'239g','65W'),
  p('rog7u', 'ROG Phone 7 Ultimate','ASUS', 179800,'Snapdragon 8 Gen 2','16GB','512GB','50MP','6000mAh','6.78" AMOLED 165Hz','flagship',2023,{overall:91,fps:99,camera:74,battery:91},'246g','65W'),
  p('rog8',  'ROG Phone 8',         'ASUS', 129800,'Snapdragon 8 Gen 3','16GB','256GB','50MP','5500mAh','6.78" AMOLED 165Hz','flagship',2024,{overall:92,fps:98,camera:80,battery:88},'225g','65W'),
  p('rog8p', 'ROG Phone 8 Pro',     'ASUS', 159800,'Snapdragon 8 Gen 3','24GB','1TB','50MP','5500mAh','6.78" AMOLED 165Hz','flagship',2024,{overall:94,fps:99,camera:82,battery:88},'225g','65W'),

  p('zf9',   'Zenfone 9',           'ASUS', 99800, 'Snapdragon 8+ Gen 1','8GB','128GB','50MP','4300mAh','5.9" AMOLED 120Hz','flagship',2022,{overall:84,fps:88,camera:82,battery:78},'169g','30W'),
  p('zf10',  'Zenfone 10',          'ASUS', 99800, 'Snapdragon 8 Gen 2','8GB','256GB','50MP','4300mAh','5.9" AMOLED 144Hz','flagship',2023,{overall:87,fps:91,camera:84,battery:79},'172g','30W'),
  p('zf11u', 'Zenfone 11 Ultra',    'ASUS', 119800,'Snapdragon 8 Gen 3','12GB','256GB','50MP','5500mAh','6.78" AMOLED 120Hz','flagship',2024,{overall:90,fps:93,camera:86,battery:88},'225g','65W'),

  // ════════════════════════════════════════════════════════════
  //  SHARP AQUOS
  // ════════════════════════════════════════════════════════════

  p('aqr7',  'AQUOS R7',            'Sharp', 189800,'Snapdragon 8 Gen 1','12GB','256GB','Leica 47.2MP 1inch','5000mAh','6.6" Pro IGZO OLED 240Hz','flagship',2022,{overall:82,fps:84,camera:88,battery:82},'208g','18W'),
  p('aqr8p', 'AQUOS R8 Pro',        'Sharp', 189800,'Snapdragon 8 Gen 2','12GB','256GB','Leica 47.2MP 1inch','5000mAh','6.6" Pro IGZO OLED 240Hz','flagship',2023,{overall:85,fps:88,camera:90,battery:84},'203g','18W'),
  p('aqr8',  'AQUOS R8',            'Sharp', 137800,'Snapdragon 8 Gen 2','8GB','256GB','50.3MP','4570mAh','6.39" Pro IGZO OLED 240Hz','flagship',2023,{overall:83,fps:86,camera:84,battery:80},'179g','18W'),
  p('aqr9',  'AQUOS R9',            'Sharp', 99800, 'Snapdragon 7+ Gen 3','8GB','256GB','50.3MP Leica','5000mAh','6.5" Pro IGZO OLED 240Hz','flagship',2024,{overall:80,fps:78,camera:82,battery:86},'195g','18W'),
  p('aqr9p', 'AQUOS R9 Pro',        'Sharp', 164800,'Snapdragon 8 Gen 3','12GB','512GB','50.3MP Leica 1inch','5000mAh','6.7" Pro IGZO OLED 240Hz','flagship',2024,{overall:88,fps:90,camera:92,battery:86},'229g','65W'),

  p('aqs7',  'AQUOS sense7',        'Sharp', 49800, 'Snapdragon 695','6GB','128GB','50.3MP','4570mAh','6.1" IGZO OLED','midrange',2022,{overall:58,fps:45,camera:58,battery:82},'158g','18W'),
  p('aqs7p', 'AQUOS sense7 plus',   'Sharp', 59800, 'Snapdragon 695','6GB','128GB','50.3MP','5050mAh','6.4" IGZO OLED 120Hz','midrange',2022,{overall:60,fps:48,camera:58,battery:86},'172g','18W'),
  p('aqs8',  'AQUOS sense8',        'Sharp', 56800, 'Snapdragon 6 Gen 1','6GB','128GB','50.3MP','5000mAh','6.1" IGZO OLED 90Hz','midrange',2023,{overall:62,fps:52,camera:62,battery:87},'159g','18W'),

  // ════════════════════════════════════════════════════════════
  //  FCNT (arrows)
  // ════════════════════════════════════════════════════════════

  p('arwn',   'arrows N',            'FCNT', 49800, 'Snapdragon 695','8GB','128GB','50MP','4600mAh','6.24" OLED','midrange',2023,{overall:56,fps:45,camera:54,battery:80},'171g','18W'),
  p('arwe2',  'arrows We2',          'FCNT', 22000, 'Dimensity 7025','4GB','64GB','50MP','4500mAh','6.1" IPS','budget',2024,{overall:42,fps:32,camera:40,battery:78},'168g','18W'),
  p('arwe2p', 'arrows We2 Plus',     'FCNT', 59800, 'Snapdragon 7s Gen 2','8GB','256GB','50.3MP','5000mAh','6.6" OLED','midrange',2024,{overall:64,fps:55,camera:60,battery:84},'182g','18W'),

  // ════════════════════════════════════════════════════════════
  //  Xiaomi 17 Ultra (2026 speculative, kept from before)
  // ════════════════════════════════════════════════════════════

  p('xi17u', 'Xiaomi 17 Ultra','Xiaomi', 159800,'SD 8 Elite Gen5','16GB','512GB','Leica 1inch 50MP','6200mAh','6.73" AMOLED','flagship',2026,{overall:99,fps:97,camera:100,battery:99},'235g','100W'),
];

async function seed() {
  console.log(`Seeding ${PHONES.length} phones into Firestore (skipping existing)...`);
  const phonesRef = collection(db, 'phones');
  let created = 0, skipped = 0;
  for (const phone of PHONES) {
    const { id, ...data } = phone;
    const existing = await getDoc(doc(phonesRef, id));
    if (existing.exists()) {
      skipped++;
      continue;
    }
    await setDoc(doc(phonesRef, id), data);
    created++;
    if (created % 20 === 0) console.log(`  ... created ${created} so far`);
  }
  console.log(`Done! Created: ${created}, Skipped (existing): ${skipped}, Total in script: ${PHONES.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
