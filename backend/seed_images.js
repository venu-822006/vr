import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/vrveg' });

const seedProducts = [
  { name: 'Onion', image: '/images/onion_1783693545934.png' },
  { name: 'Potato', image: '/images/potato_1783693556029.png' },
  { name: 'Tomato', image: '/images/tomato_1783693568358.png' },
  { name: 'Green Brinjal', image: '/images/green_brinjal_1783693579886.png' },
  { name: 'Lady\'s Finger', image: '/images/okra_1783693590479.png' },
  { name: 'Okra', image: '/images/okra_1783693590479.png' },
  { name: 'Carrot', image: '/images/carrot_1783693603450.png' },
  { name: 'Radish', image: '/images/radish_1783693614459.png' },
  { name: 'Beetroot', image: '/images/beetroot_1783693624043.png' },
  { name: 'Cabbage', image: '/images/cabbage_1783693634635.png' },
  { name: 'Cauliflower', image: '/images/cauliflower_1783693645566.png' },
  { name: 'Cucumber', image: '/images/cucumber_1783693669259.png' },
  { name: 'Bitter Gourd', image: '/images/bitter_gourd_1783693681822.png' },
  { name: 'Ridge Gourd', image: '/images/ridge_gourd_1783693695256.png' },
  { name: 'Bottle Gourd', image: '/images/bottle_gourd_1783693706956.png' },
  { name: 'Beans', image: '/images/green_beans_1783693716685.png' },
  { name: 'Green Beans', image: '/images/green_beans_1783693716685.png' },
  { name: 'Drumstick', image: '/images/drumstick_1783693728016.png' },
  { name: 'Green Chillies', image: '/images/green_chillies_1783693739070.png' }
];

async function update() {
  for (const p of seedProducts) {
    try {
      await pool.query('UPDATE products SET image = $1 WHERE name = $2', [p.image, p.name]);
    } catch(err) { console.error(err); }
  }
  console.log('Done');
  process.exit(0);
}
update();
