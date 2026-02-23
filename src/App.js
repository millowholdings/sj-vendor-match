import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Food & Beverage", "Jewelry & Accessories", "Art & Prints", "Candles & Home Decor",
  "Clothing & Apparel", "Beauty & Skincare", "Plants & Floral", "Crafts & Handmade",
  "Health & Wellness", "Kids & Baby", "Pet Products", "Photography & Media",
  "Wedding & Bridal", "Baby & Maternity", "Party & Event Decor", "Personalized Gifts",
  "Vintage & Thrift", "Spiritual & Metaphysical"
];

const SUBCATEGORIES = {
  "Food & Beverage": ["Baked Goods", "Snacks & Jerky", "Sauces & Condiments", "Beverages & Juices", "Candy & Chocolates", "Meal Prep & Catering"],
  "Jewelry & Accessories": ["Earrings", "Necklaces & Pendants", "Bracelets & Bangles", "Rings", "Hair Accessories", "Bags & Purses"],
  "Art & Prints": ["Illustrations & Drawing", "Paintings", "Digital Prints", "Custom Portraits", "Stickers & Postcards", "Mixed Media"],
  "Candles & Home Decor": ["Soy Candles", "Wax Melts", "Diffusers & Oils", "Wall Art", "Throw Pillows", "Seasonal Decor"],
  "Clothing & Apparel": ["T-Shirts & Hoodies", "Dresses & Skirts", "Kids Clothing", "Hats & Beanies", "Activewear", "Custom/Personalized"],
  "Beauty & Skincare": ["Skincare & Serums", "Body Butters & Lotions", "Lip Care", "Hair Care", "Bath Products", "Makeup & Cosmetics"],
  "Plants & Floral": ["Succulents & Cacti", "Tropical Plants", "Floral Arrangements", "Dried Florals", "Seeds & Bulbs", "Terrariums"],
  "Crafts & Handmade": ["Woodwork", "Ceramics & Pottery", "Knit & Crochet", "Resin Art", "Macrame", "Paper Crafts"],
  "Health & Wellness": ["Supplements & Vitamins", "Essential Oils", "Crystals & Spiritual", "Teas & Herbal", "Fitness Products", "Mental Wellness"],
  "Kids & Baby": ["Toys & Games", "Clothing", "Nursery Decor", "Books", "Personalized Gifts", "Educational"],
  "Pet Products": ["Treats & Food", "Toys", "Collars & Leashes", "Grooming", "Apparel", "Beds & Accessories"],
  "Photography & Media": ["Event Photography", "Portrait Sessions", "Digital Downloads", "Prints & Albums", "Video Services", "Headshots"],
  "Wedding & Bridal": ["Bridal Accessories", "Wedding Favors", "Bridesmaid Gifts", "Vow Books & Stationery", "Bridal Robes & Apparel", "Wedding Decor", "Custom Veils & Hair Accessories"],
  "Baby & Maternity": ["Baby Shower Favors", "Nursery Decor", "Baby Clothing & Accessories", "Maternity Apparel", "Gender Reveal Items", "Milestone Keepsakes", "Custom Baby Gifts"],
  "Party & Event Decor": ["Balloon Arrangements", "Table Centerpieces", "Backdrops & Banners", "Custom Signage", "Party Favors", "Themed Decorations", "Photo Booth Props"],
  "Personalized Gifts": ["Custom Tumblers & Cups", "Engraved Items", "Embroidered Goods", "Custom Jewelry", "Monogrammed Gifts", "Photo Gifts", "Name & Word Art"],
  "Vintage & Thrift": ["Vintage Clothing", "Antiques & Collectibles", "Vintage Jewelry", "Upcycled Goods", "Retro Home Decor", "Vinyl & Media"],
  "Spiritual & Metaphysical": ["Crystals & Gemstones", "Tarot & Oracle Cards", "Sage & Cleansing", "Spiritual Jewelry", "Meditation & Mindfulness", "Altar Supplies"]
};

const EVENT_TYPES = [
  "Pop-Up Market", "Corporate Event", "Birthday Party", "Wedding Reception",
  "Wedding Ceremony", "Bridal Shower", "Baby Shower", "Gender Reveal",
  "Community Festival", "Farmers Market", "Fundraiser", "Grand Opening",
  "Holiday Market", "Block Party", "Private Party", "Sip & Shop",
  "Girls Night Out", "Bachelorette Party", "Anniversary Celebration"
];

const RADIUS_OPTIONS = [5, 10, 15, 20, 30, 50];

// Zip code lat/lng for South Jersey distance calculation
const ZIP_COORDS = {
  "08002":[39.934,-75.014],"08003":[39.901,-74.974],"08004":[39.793,-74.760],
  "08007":[39.868,-75.061],"08009":[39.788,-74.947],"08012":[39.778,-75.044],
  "08021":[39.810,-75.018],"08026":[39.821,-74.977],"08029":[39.809,-75.057],
  "08030":[39.889,-75.122],"08033":[39.893,-75.036],"08034":[39.913,-74.997],
  "08035":[39.884,-75.052],"08036":[39.957,-74.836],"08043":[39.855,-74.971],
  "08045":[39.857,-75.037],"08048":[39.951,-74.804],"08052":[39.946,-74.999],
  "08053":[39.896,-74.919],"08054":[39.952,-74.936],"08055":[39.827,-74.772],
  "08057":[39.956,-74.951],"08059":[39.903,-75.055],"08060":[40.019,-74.800],
  "08063":[39.821,-75.220],"08065":[39.950,-75.050],"08075":[40.025,-74.950],
  "08077":[39.977,-75.017],"08078":[39.849,-75.065],"08080":[39.804,-75.115],
  "08081":[39.741,-74.992],"08083":[39.840,-75.020],"08086":[39.851,-75.180],
  "08088":[39.889,-74.697],"08089":[39.776,-74.870],"08090":[39.832,-75.117],
  "08091":[39.771,-74.972],"08093":[39.871,-75.140],"08094":[39.729,-74.982],
  "08096":[39.825,-75.127],"08097":[39.849,-75.137],"08101":[39.931,-75.120],
  "08102":[39.945,-75.112],"08103":[39.931,-75.100],"08104":[39.922,-75.090],
  "08105":[39.937,-75.082],"08106":[39.910,-75.047],"08107":[39.920,-75.062],
  "08108":[39.910,-75.027],"08109":[39.945,-75.070],"08110":[39.965,-75.037],
  "08226":[39.297,-74.592],"08232":[39.386,-74.526],"08244":[39.506,-74.454],
  "08401":[39.364,-74.423],"08402":[39.327,-74.511],"08406":[39.341,-74.451]
};

function getCoords(zip) { return ZIP_COORDS[zip] || null; }

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Returns distance in miles between two zip codes, null if either unknown
function distanceMiles(zip1, zip2) {
  const c1 = getCoords(zip1), c2 = getCoords(zip2);
  if (!c1 || !c2) return null;
  return haversine(c1[0], c1[1], c2[0], c2[1]);
}

function isValidZip(zip) { return /^\d{5}$/.test(zip); }
function isKnownZip(zip) { return !!ZIP_COORDS[zip]; }

// ─── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_VENDORS = [
  { id:1, name:"Subtle Boujee",           category:"Jewelry & Accessories", homeZip:"08033", radius:20, emoji:"💎", tags:["Handmade","Luxury","Custom"],              price:"$150–$300/day", matchScore:98, description:"Elevated handmade jewelry and accessories for every occasion.", insurance:true },
  { id:2, name:"Ian's Essentials",        category:"Health & Wellness",     homeZip:"08107", radius:15, emoji:"🌿", tags:["Organic","Self-care","Local"],              price:"$100–$200/day", matchScore:95, description:"Curated wellness and essential products made with care.", insurance:true },
  { id:3, name:"Shore Thing Candles",     category:"Candles & Home Decor",  homeZip:"08226", radius:30, emoji:"🕯️", tags:["Hand-poured","Shore-inspired","Gift-ready"], price:"$75–$150/day", matchScore:91, description:"Hand-poured soy candles inspired by South Jersey's shoreline.", insurance:false },
  { id:4, name:"Rooted & Raw Botanicals", category:"Plants & Floral",       homeZip:"08033", radius:20, emoji:"🌸", tags:["Sustainable","Seasonal","Local"],            price:"$200–$400/day", matchScore:88, description:"Locally grown plants, floral arrangements, and botanical wellness.", insurance:true },
  { id:5, name:"The Dough Collective",    category:"Food & Beverage",       homeZip:"08057", radius:15, emoji:"🥐", tags:["Baked goods","Allergen-friendly","Custom"],  price:"$125–$250/day", matchScore:84, description:"Artisan baked goods with allergen-friendly options for every crowd.", insurance:true },
  { id:6, name:"Pine Barrens Print Co.",  category:"Art & Prints",          homeZip:"08055", radius:25, emoji:"🎨", tags:["NJ-inspired","Photography","Custom framing"], price:"$80–$180/day", matchScore:79, description:"Photography and art prints celebrating New Jersey's landscapes.", insurance:false },
];


// ─── Sample Opportunities ─────────────────────────────────────────────────────
const SAMPLE_OPPS = [
  { id:1, eventName:"Collingswood Spring Pop-Up Market", eventType:"Pop-Up Market", zip:"08107", date:"2026-04-12", startTime:"10:00", endTime:"16:00", boothFee:"$50/vendor", spots:20, categoriesNeeded:["Food & Beverage","Jewelry & Accessories","Art & Prints","Candles & Home Decor"], contactName:"Maria Lopez", contactEmail:"maria@collmarkets.com", contactPhone:"(856) 555-0101", fbLink:"https://facebook.com/events/", deadline:"2026-04-01", notes:"Outdoor market in Knight Park. Tables not provided. Electric available for 5 spots.", source:"Facebook Group" },
  { id:2, eventName:"Haddonfield Summer Artisan Fair", eventType:"Community Festival", zip:"08033", date:"2026-06-07", startTime:"09:00", endTime:"17:00", boothFee:"Free (vendors keep all sales)", spots:35, categoriesNeeded:["Art & Prints","Crafts & Handmade","Jewelry & Accessories","Plants & Floral"], contactName:"Haddonfield Events Committee", contactEmail:"events@haddonfield.com", contactPhone:"(856) 555-0202", fbLink:"https://facebook.com/events/", deadline:"2026-05-15", notes:"Annual summer fair on Kings Highway. High foot traffic. Tents required.", source:"Facebook Group" },
  { id:3, eventName:"Voorhees Wellness & Self-Care Expo", eventType:"Pop-Up Market", zip:"08043", date:"2026-03-29", startTime:"11:00", endTime:"15:00", boothFee:"$75/vendor", spots:12, categoriesNeeded:["Health & Wellness","Beauty & Skincare","Candles & Home Decor","Plants & Floral"], contactName:"Jasmine Reed", contactEmail:"jasmine@wellnessexpo.com", contactPhone:"(856) 555-0303", fbLink:"https://facebook.com/events/", deadline:"2026-03-20", notes:"Indoor venue. Tables provided. Insured vendors preferred.", source:"Host Submitted" },
];

function fmtDate(d){ if(!d) return ""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"}); }
function fmtTime(t){ if(!t) return ""; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; }
function isUrgent(d){ if(!d) return false; return (new Date(d+"T12:00:00")-new Date())/86400000<=7; }

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f0ea; color: #1a1410; min-height: 100vh; }
  .app { min-height: 100vh; }
  .nav { background: #1a1410; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 8px; }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; color: #e8c97a; letter-spacing: 1px; }
  .nav-logo span { color: #fff; font-style: italic; }
  .nav-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
  .nav-tab { background: none; border: 1px solid transparent; color: #a89a8a; padding: 8px 18px; border-radius: 4px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.2s; }
  .nav-tab:hover { color: #e8c97a; border-color: #e8c97a30; }
  .nav-tab.active { background: #e8c97a; color: #1a1410; border-color: #e8c97a; }
  .hero { background: linear-gradient(135deg, #1a1410 0%, #2d2118 50%, #1a1410 100%); padding: 90px 40px 80px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 50%, #e8c97a15, transparent); }
  .hero-eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #e8c97a; margin-bottom: 20px; position: relative; }
  .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(38px, 6vw, 68px); color: #fff; line-height: 1.1; margin-bottom: 20px; position: relative; }
  .hero h1 em { color: #e8c97a; font-style: italic; }
  .hero > p { color: #a89a8a; font-size: 17px; max-width: 560px; margin: 0 auto 40px; line-height: 1.7; position: relative; }
  .hero-btns { display: flex; gap: 16px; justify-content: center; position: relative; flex-wrap: wrap; }
  .btn-primary { background: #e8c97a; color: #1a1410; border: none; padding: 14px 32px; border-radius: 4px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #f0d88a; transform: translateY(-1px); }
  .btn-outline { background: none; color: #fff; border: 1px solid #ffffff40; padding: 14px 32px; border-radius: 4px; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .btn-outline:hover { border-color: #e8c97a; color: #e8c97a; }
  .stats-bar { background: #e8c97a; padding: 20px 40px; display: flex; justify-content: center; gap: 60px; flex-wrap: wrap; }
  .stat { text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #1a1410; }
  .stat-label { font-size: 12px; color: #4a3a28; letter-spacing: 1px; text-transform: uppercase; }
  .section { padding: 70px 40px; max-width: 960px; margin: 0 auto; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 36px; margin-bottom: 8px; color: #1a1410; }
  .section-sub { color: #7a6a5a; font-size: 16px; margin-bottom: 40px; }
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 60px; }
  .pricing-card { background: #fff; border: 1px solid #e8ddd0; border-radius: 8px; padding: 32px 28px; position: relative; }
  .pricing-card.featured { background: #1a1410; color: #fff; border-color: #1a1410; }
  .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #e8c97a; color: #1a1410; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }
  .pricing-type { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #a89a8a; margin-bottom: 8px; }
  .pricing-card.featured .pricing-type { color: #e8c97a; }
  .pricing-name { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 4px; }
  .pricing-card.featured .pricing-name { color: #fff; }
  .pricing-price { font-size: 36px; font-weight: 700; margin: 16px 0 4px; }
  .pricing-card.featured .pricing-price { color: #e8c97a; }
  .pricing-period { font-size: 13px; color: #a89a8a; margin-bottom: 20px; }
  .pricing-features { list-style: none; }
  .pricing-features li { font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f0e8dc; display: flex; align-items: center; gap: 8px; }
  .pricing-card.featured .pricing-features li { border-color: #2d2118; color: #c8b898; }
  .pricing-features li::before { content: "✓"; color: #e8c97a; font-weight: 700; flex-shrink: 0; }
  .form-card { background: #fff; border: 1px solid #e8ddd0; border-radius: 12px; padding: 48px; box-shadow: 0 4px 40px #1a141008; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 13px; font-weight: 600; color: #4a3a28; letter-spacing: 0.5px; text-transform: uppercase; }
  input, select, textarea { border: 1.5px solid #e0d5c5; border-radius: 6px; padding: 11px 14px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: #1a1410; background: #fdf9f5; transition: border-color 0.2s; outline: none; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: #e8c97a; background: #fff; }
  textarea { resize: vertical; min-height: 100px; }
  .zip-feedback { font-size: 12px; margin-top: 3px; font-weight: 600; }
  .zip-ok { color: #1a6b3a; }
  .zip-warn { color: #7a5a10; }
  .zip-bad { color: #8b0000; }
  .radius-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .radius-btn { background: #fdf9f5; border: 1.5px solid #e0d5c5; border-radius: 20px; padding: 7px 18px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; color: #1a1410; }
  .radius-btn:hover { border-color: #e8c97a; }
  .radius-btn.sel { background: #fdf4dc; border-color: #e8c97a; color: #7a5a10; font-weight: 700; }
  .checkbox-section { margin-bottom: 24px; }
  .checkbox-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
  .checkbox-section-label { font-size: 13px; font-weight: 600; color: #4a3a28; letter-spacing: 0.5px; text-transform: uppercase; }
  .btn-select-all { background: #1a1410; color: #e8c97a; border: none; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; transition: all 0.2s; white-space: nowrap; }
  .btn-select-all:hover { background: #2d2118; }
  .btn-select-all.all-on { background: #e8c97a; color: #1a1410; }
  .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
  .checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; padding: 8px 12px; border: 1.5px solid #e0d5c5; border-radius: 6px; transition: all 0.15s; background: #fdf9f5; text-transform: none; font-weight: 400; letter-spacing: 0; }
  .checkbox-item:hover { border-color: #e8c97a; }
  .checkbox-item.checked { border-color: #e8c97a; background: #fdf4dc; font-weight: 500; }
  .checkbox-item input { display: none; }
  .subcat-block { background: #fdf9f5; border: 1px solid #e8ddd0; border-radius: 8px; padding: 20px; margin-top: 12px; margin-bottom: 24px; }
  .subcat-cat { margin-bottom: 20px; }
  .subcat-cat:last-of-type { margin-bottom: 0; }
  .subcat-cat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #ede5d8; flex-wrap: wrap; gap: 6px; }
  .subcat-cat-name { font-size: 12px; font-weight: 700; color: #e8c97a; text-transform: uppercase; letter-spacing: 1px; }
  .selected-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #ede5d8; }
  .sel-tag { background: #fdf4dc; border: 1px solid #e8c97a; border-radius: 20px; padding: 3px 12px; font-size: 12px; color: #7a5a10; font-weight: 500; }
  .upload-zone { border: 2px dashed #d4c4a8; border-radius: 8px; padding: 32px; text-align: center; cursor: pointer; background: #fdf9f5; transition: all 0.2s; color: #7a6a5a; font-size: 14px; }
  .upload-zone:hover { border-color: #e8c97a; background: #fdf4dc; }
  .upload-icon { font-size: 28px; margin-bottom: 8px; }
  .form-divider { border: none; border-top: 1px solid #e8ddd0; margin: 32px 0; }
  .form-section-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 20px; color: #1a1410; display: flex; align-items: center; gap: 10px; }
  .form-section-title .dot { width: 8px; height: 8px; background: #e8c97a; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .range-display { font-size: 18px; font-weight: 600; color: #e8c97a; text-align: center; margin-top: 6px; }
  input[type=range] { width: 100%; accent-color: #e8c97a; padding: 0; border: none; background: none; }
  .form-submit { margin-top: 32px; text-align: center; }
  .btn-submit { background: #1a1410; color: #e8c97a; border: none; padding: 16px 48px; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px; transition: all 0.2s; }
  .btn-submit:hover { background: #2d2118; transform: translateY(-1px); }
  .match-filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; padding: 24px; background: #fff; border-radius: 10px; border: 1px solid #e8ddd0; }
  .match-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
  .match-filter-group label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7a6a5a; font-weight: 600; }
  .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
  .results-count { font-size: 14px; color: #7a6a5a; }
  .results-count strong { color: #1a1410; }
  .vendor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .vendor-card { background: #fff; border: 1px solid #e8ddd0; border-radius: 10px; overflow: hidden; transition: all 0.2s; }
  .vendor-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px #1a141015; }
  .vendor-card-top { height: 100px; background: linear-gradient(135deg, #1a1410, #2d2118); display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative; }
  .match-score { position: absolute; top: 12px; right: 12px; background: #e8c97a; color: #1a1410; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .vendor-card-body { padding: 20px; }
  .vendor-name { font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 4px; }
  .vendor-category { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #a89a8a; margin-bottom: 12px; }
  .vendor-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .vendor-tag { background: #f5f0ea; border: 1px solid #e8ddd0; padding: 3px 10px; border-radius: 20px; font-size: 12px; color: #5a4a3a; }
  .vendor-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f0e8dc; margin-bottom: 6px; }
  .vendor-price { font-size: 14px; font-weight: 600; color: #1a1410; }
  .vendor-location { font-size: 12px; color: #a89a8a; }
  .vendor-distance { font-size: 13px; font-weight: 600; color: #1a6b3a; text-align: right; margin-bottom: 2px; }
  .vendor-no-match { font-size: 12px; color: #c0392b; text-align: right; margin-bottom: 2px; }
  .contact-btn { width: 100%; background: #1a1410; color: #e8c97a; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
  .contact-btn:hover { background: #2d2118; }
  .empty-state { text-align: center; padding: 60px 20px; color: #a89a8a; }
  .empty-state .big { font-size: 48px; margin-bottom: 16px; }
  .success-banner { background: linear-gradient(135deg, #1a1410, #2d2118); color: #fff; padding: 48px; border-radius: 12px; text-align: center; margin-bottom: 40px; }
  .success-icon { font-size: 48px; margin-bottom: 16px; }
  .success-banner h2 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; }
  .success-banner p { color: #a89a8a; font-size: 16px; }
  .success-highlight { color: #e8c97a; font-weight: 600; }
  .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .admin-stat { background: #fff; border: 1px solid #e8ddd0; border-radius: 8px; padding: 24px; }
  .admin-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; color: #e8c97a; }
  .admin-stat-label { font-size: 13px; color: #7a6a5a; margin-top: 4px; }
  .admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e8ddd0; }
  .admin-table th { background: #1a1410; color: #e8c97a; padding: 14px 18px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  .admin-table td { padding: 14px 18px; border-bottom: 1px solid #f0e8dc; font-size: 14px; }
  .admin-table tr:last-child td { border-bottom: none; }
  .status-pill { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .status-active { background: #d4f4e0; color: #1a6b3a; }
  .status-pending { background: #fdf4dc; color: #7a5a10; }
  .info-box { background: #fdf9f5; border: 1px solid #e8ddd0; border-left: 3px solid #e8c97a; border-radius: 6px; padding: 14px 18px; font-size: 14px; color: #7a6a5a; margin-bottom: 20px; }
  .nav-group { display: flex; flex-direction: column; border-left: 1px solid rgba(255,255,255,.1); padding-left: 12px; margin-left: 4px; }
  .nav-group-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #e8c97a; padding: 2px 6px; margin-bottom: 2px; font-weight: 600; }
  .nav-group-items { display: flex; gap: 2px; flex-wrap: wrap; }
    @media (max-width: 640px) {
    .nav { padding: 14px 20px; }
    .nav-tabs { gap: 2px; }
    .nav-tab { padding: 6px 12px; font-size: 12px; }
    .hero { padding: 60px 20px; }
    .section { padding: 50px 20px; }
    .form-card { padding: 28px 18px; }
    .form-grid { grid-template-columns: 1fr; }
    .stats-bar { gap: 30px; }
  }
`;

// ─── Zip Input ────────────────────────────────────────────────────────────────
function ZipInput({ label, value, onChange, hint }) {
  const len5  = value.length === 5;
  const valid = len5 && isValidZip(value);
  const known = len5 && isKnownZip(value);
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        placeholder="e.g. 08033"
        value={value}
        maxLength={5}
        onChange={e => onChange(e.target.value.replace(/\D/g,'').slice(0,5))}
        style={{ borderColor: len5 ? (known ? '#1a6b3a' : valid ? '#b8860b' : '#c0392b') : undefined }}
      />
      {!len5 && hint && <div className="zip-feedback" style={{ color:'#a89a8a', fontWeight:400 }}>{hint}</div>}
      {len5 && known   && <div className="zip-feedback zip-ok">&#10003; Zip recognized</div>}
      {len5 && valid && !known && <div className="zip-feedback zip-warn">&#9888; Zip entered — distance matching limited</div>}
      {len5 && !valid && <div className="zip-feedback zip-bad">&#10007; Please enter a valid 5-digit zip</div>}
    </div>
  );
}

// ─── Checkbox Group with Select All ──────────────────────────────────────────
function CheckboxGroup({ label, options, selected, onChange }) {
  const allOn  = options.length > 0 && options.every(o => selected.includes(o));
  const toggle = val => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  const toggleAll = () => onChange(allOn ? selected.filter(s => !options.includes(s)) : [...new Set([...selected, ...options])]);
  return (
    <div className="checkbox-section">
      <div className="checkbox-section-header">
        {label && <div className="checkbox-section-label">{label}</div>}
        <button className={`btn-select-all${allOn ? ' all-on' : ''}`} onClick={toggleAll}>
          {allOn ? '✓ All Selected' : 'Select All'}
        </button>
      </div>
      <div className="checkbox-grid">
        {options.map(opt => (
          <label key={opt} className={`checkbox-item${selected.includes(opt) ? ' checked' : ''}`}>
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Category + Subcategory Picker ────────────────────────────────────────────
function CategorySubcategoryPicker({ categories, subcategories, onCategoriesChange, onSubcategoriesChange }) {
  const handleCatChange = newCats => {
    const valid = subcategories.filter(s => newCats.some(cat => (SUBCATEGORIES[cat]||[]).includes(s)));
    onCategoriesChange(newCats);
    onSubcategoriesChange(valid);
  };
  const toggleSubAll = (cat, catSubs) => {
    const allOn  = catSubs.every(s => subcategories.includes(s));
    const others = subcategories.filter(s => !catSubs.includes(s));
    onSubcategoriesChange(allOn ? others : [...others, ...catSubs]);
  };
  const toggleSub = sub => {
    onSubcategoriesChange(subcategories.includes(sub) ? subcategories.filter(s => s !== sub) : [...subcategories, sub]);
  };
  return (
    <>
      <CheckboxGroup label="Your Categories *" options={CATEGORIES} selected={categories} onChange={handleCatChange} />
      {categories.length > 0 && (
        <div className="subcat-block">
          <div style={{ fontSize:12, fontWeight:700, color:'#7a6a5a', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>
            Subcategories — select all that apply
          </div>
          {categories.map(cat => {
            const catSubs = SUBCATEGORIES[cat] || [];
            const allOn   = catSubs.length > 0 && catSubs.every(s => subcategories.includes(s));
            return (
              <div key={cat} className="subcat-cat">
                <div className="subcat-cat-header">
                  <span className="subcat-cat-name">{cat}</span>
                  <button className={`btn-select-all${allOn ? ' all-on' : ''}`} onClick={() => toggleSubAll(cat, catSubs)}>
                    {allOn ? '✓ All' : 'Select All'}
                  </button>
                </div>
                <div className="checkbox-grid">
                  {catSubs.map(sub => (
                    <label key={sub} className={`checkbox-item${subcategories.includes(sub) ? ' checked' : ''}`}>
                      <input type="checkbox" checked={subcategories.includes(sub)} onChange={() => toggleSub(sub)} />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          {subcategories.length > 0 && (
            <div className="selected-tags">
              {subcategories.map(s => <span key={s} className="sel-tag">{s}</span>)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function UploadZone({ label, hint }) {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="upload-zone" onClick={() => setUploaded(u => !u)}>
      <div className="upload-icon">{uploaded ? '✅' : '📎'}</div>
      <div style={{ fontWeight:600, marginBottom:4 }}>{uploaded ? `${label} uploaded!` : `Upload ${label}`}</div>
      <div style={{ fontSize:13, color:'#a89a8a' }}>{hint}</div>
    </div>
  );
}

// ─── Vendor Form ──────────────────────────────────────────────────────────────
function VendorForm({ onSubmit }) {
  const [form, setForm] = useState({
    businessName:'', ownerName:'', email:'', phone:'',
    homeZip:'', radius:20,
    categories:[], subcategories:[],
    description:'', website:'',
    eventTypes:[],
    priceMin:75, priceMax:300,
    setupTime:30, tableSize:'6ft', needsElectric:false,
    yearsActive:''
  });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  return (
    <div className="form-card">
      <h2 className="form-section-title"><span className="dot" />Vendor Profile</h2>
      <p style={{ color:'#7a6a5a', marginBottom:32, fontSize:15 }}>
        Join South Jersey's premier vendor network. Get matched with events and hosts looking for exactly what you offer.
      </p>
      <div className="form-grid">
        <div className="form-group"><label>Business Name *</label><input placeholder="e.g. Subtle Boujee" value={form.businessName} onChange={e=>set('businessName',e.target.value)} /></div>
        <div className="form-group"><label>Owner Name *</label><input placeholder="Your full name" value={form.ownerName} onChange={e=>set('ownerName',e.target.value)} /></div>
        <div className="form-group"><label>Email Address *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
        <div className="form-group"><label>Phone Number</label><input placeholder="(609) 555-0000" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
        <ZipInput label="Home Base Zip Code *" value={form.homeZip} onChange={v=>set('homeZip',v)} hint="Your primary location — used to calculate travel distance to events" />
        <div className="form-group"><label>Years in Business</label><input placeholder="e.g. 3" value={form.yearsActive} onChange={e=>set('yearsActive',e.target.value)} /></div>
        <div className="form-group full"><label>Business Description *</label><textarea placeholder="Tell hosts what makes your business special..." value={form.description} onChange={e=>set('description',e.target.value)} /></div>
        <div className="form-group full"><label>Website / Instagram / Social Link</label><input placeholder="https://instagram.com/yourbusiness" value={form.website} onChange={e=>set('website',e.target.value)} /></div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Travel Radius</h3>
      <div className="info-box">
        How far will you travel from zip code <strong>{form.homeZip || '—'}</strong> to vend at an event?
        Hosts within this radius will see you as a potential match.
      </div>
      <div className="form-group">
        <label>Max Travel Distance</label>
        <div className="radius-group">
          {RADIUS_OPTIONS.map(r => (
            <button key={r} className={`radius-btn${form.radius===r?' sel':''}`} onClick={()=>set('radius',r)}>{r} miles</button>
          ))}
        </div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Categories & Specialties</h3>
      <CategorySubcategoryPicker
        categories={form.categories} subcategories={form.subcategories}
        onCategoriesChange={v=>set('categories',v)} onSubcategoriesChange={v=>set('subcategories',v)}
      />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Event Fit</h3>
      <CheckboxGroup label="Event Types You're Open To" options={EVENT_TYPES} selected={form.eventTypes} onChange={v=>set('eventTypes',v)} />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Booth & Logistics</h3>
      <div className="form-grid">
        <div className="form-group"><label>Daily Booth Fee — Min (${form.priceMin})</label><input type="range" min={25} max={500} step={25} value={form.priceMin} onChange={e=>set('priceMin',+e.target.value)} /></div>
        <div className="form-group"><label>Daily Booth Fee — Max (${form.priceMax})</label><input type="range" min={25} max={1000} step={25} value={form.priceMax} onChange={e=>set('priceMax',+e.target.value)} /><div className="range-display">${form.priceMin} – ${form.priceMax}/day</div></div>
        <div className="form-group"><label>Setup Time Needed ({form.setupTime} min)</label><input type="range" min={10} max={120} step={5} value={form.setupTime} onChange={e=>set('setupTime',+e.target.value)} /></div>
        <div className="form-group"><label>Table / Space Size</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
        <div className="form-group"><label>Need Electrical Access?</label><select value={form.needsElectric?'yes':'no'} onChange={e=>set('needsElectric',e.target.value==='yes')}><option value="no">No</option><option value="yes">Yes</option></select></div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Documents & Photos</h3>
      <div className="form-grid">
        <div className="form-group"><label>Business Photos</label><UploadZone label="Photos" hint="JPG, PNG — products, booth setup, branding" /></div>
        <div className="form-group"><label>Certificate of Insurance</label><UploadZone label="Insurance COI" hint="PDF or image — required for many events" /></div>
        <div className="form-group full"><label>Price Menu / Lookbook (Optional)</label><UploadZone label="Price Sheet / Lookbook" hint="PDF — helps hosts understand your offerings" /></div>
      </div>

      <div className="form-submit">
        <button className="btn-submit" onClick={()=>onSubmit(form)}>Submit Vendor Profile →</button>
        <p style={{ fontSize:13, color:'#a89a8a', marginTop:12 }}>Your profile will be reviewed within 24 hours. Monthly fee: <strong style={{ color:'#1a1410' }}>$15/month</strong></p>
      </div>
    </div>
  );
}

// ─── Host Form ────────────────────────────────────────────────────────────────
function HostForm({ onSubmit }) {
  const [form, setForm] = useState({
    orgName:'', contactName:'', email:'', phone:'',
    eventName:'', eventType:'', eventZip:'', address:'',
    date:'', startTime:'', endTime:'',
    expectedAttendance:'', indoorOutdoor:'outdoor',
    vendorCategories:[], vendorCount:5,
    electricAvailable:true, tableProvided:false,
    budget:'', notes:'', managedBooking:false
  });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  return (
    <div className="form-card">
      <h2 className="form-section-title"><span className="dot" />Host an Event</h2>
      <p style={{ color:'#7a6a5a', marginBottom:32, fontSize:15 }}>
        Tell us about your event and we'll match you with the perfect South Jersey vendors — based on your event zip code and the categories you need.
      </p>
      <div className="form-grid">
        <div className="form-group"><label>Organization / Business Name</label><input placeholder="Your org or event name" value={form.orgName} onChange={e=>set('orgName',e.target.value)} /></div>
        <div className="form-group"><label>Contact Name *</label><input placeholder="Your full name" value={form.contactName} onChange={e=>set('contactName',e.target.value)} /></div>
        <div className="form-group"><label>Email *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
        <div className="form-group"><label>Phone</label><input placeholder="(856) 555-0000" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
        <div className="form-group"><label>Event Name *</label><input placeholder="e.g. Haddonfield Holiday Market" value={form.eventName} onChange={e=>set('eventName',e.target.value)} /></div>
        <div className="form-group"><label>Event Type *</label><select value={form.eventType} onChange={e=>set('eventType',e.target.value)}><option value="">Select type...</option>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <ZipInput label="Event Zip Code *" value={form.eventZip} onChange={v=>set('eventZip',v)} hint="Vendors whose travel radius covers this zip will be matched to your event" />
        <div className="form-group"><label>Venue Address</label><input placeholder="Street address" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
        <div className="form-group"><label>Event Date *</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
        <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)} /></div>
        <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>set('endTime',e.target.value)} /></div>
        <div className="form-group"><label>Expected Attendance</label><select value={form.expectedAttendance} onChange={e=>set('expectedAttendance',e.target.value)}><option value="">Estimate...</option><option>Under 50</option><option>50–150</option><option>150–300</option><option>300–500</option><option>500+</option></select></div>
        <div className="form-group"><label>Indoor or Outdoor?</label><select value={form.indoorOutdoor} onChange={e=>set('indoorOutdoor',e.target.value)}><option value="outdoor">Outdoor</option><option value="indoor">Indoor</option><option value="both">Mixed</option></select></div>
        <div className="form-group"><label>Number of Vendor Spots ({form.vendorCount})</label><input type="range" min={1} max={50} value={form.vendorCount} onChange={e=>set('vendorCount',+e.target.value)} /><div className="range-display">{form.vendorCount} vendors</div></div>
        <div className="form-group"><label>Electricity Available?</label><select value={form.electricAvailable?'yes':'no'} onChange={e=>set('electricAvailable',e.target.value==='yes')}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div className="form-group"><label>Tables Provided by Host?</label><select value={form.tableProvided?'yes':'no'} onChange={e=>set('tableProvided',e.target.value==='yes')}><option value="no">No — vendors bring their own</option><option value="yes">Yes — we provide tables</option></select></div>
        <div className="form-group"><label>Vendor Budget / Booth Fee Offered</label><select value={form.budget} onChange={e=>set('budget',e.target.value)}><option value="">Select...</option><option>Free (vendor keeps all sales)</option><option>$25–$50/vendor</option><option>$50–$100/vendor</option><option>$100–$200/vendor</option><option>$200+/vendor</option></select></div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Vendor Categories You Need</h3>
      <CheckboxGroup label="Categories" options={CATEGORIES} selected={form.vendorCategories} onChange={v=>set('vendorCategories',v)} />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Service Level</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <label className={`checkbox-item${!form.managedBooking?' checked':''}`} style={{ flexDirection:'column', alignItems:'flex-start', padding:20, cursor:'pointer' }} onClick={()=>set('managedBooking',false)}>
          <div style={{ fontWeight:600, marginBottom:4 }}>Self-Serve Matching</div>
          <div style={{ fontSize:13, color:'#7a6a5a' }}>Get a curated list of matched vendors. You reach out and book directly.</div>
          <div style={{ marginTop:8, color:'#e8c97a', fontWeight:700 }}>$25 one-time or $49/mo</div>
        </label>
        <label className={`checkbox-item${form.managedBooking?' checked':''}`} style={{ flexDirection:'column', alignItems:'flex-start', padding:20, cursor:'pointer' }} onClick={()=>set('managedBooking',true)}>
          <div style={{ fontWeight:600, marginBottom:4 }}>Managed Booking</div>
          <div style={{ fontSize:13, color:'#7a6a5a' }}>We contact, confirm, and coordinate all your vendors for you. Completely hands-off.</div>
          <div style={{ marginTop:8, color:'#e8c97a', fontWeight:700 }}>$150–$300/event</div>
        </label>
      </div>
      <div className="form-group" style={{ marginTop:20 }}>
        <label>Additional Notes</label>
        <textarea placeholder="Anything else vendors or our team should know..." value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>
      <div className="form-submit">
        <button className="btn-submit" onClick={()=>onSubmit(form)}>Find My Vendors →</button>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ v, contacted, setContacted, showDist, outOfRange }) {
  return (
    <div className="vendor-card">
      <div className="vendor-card-top">
        {v.emoji}
        <div className="match-score">{v.matchScore}% match</div>
      </div>
      <div className="vendor-card-body">
        <div className="vendor-name">{v.name}</div>
        <div className="vendor-category">{v.category}</div>
        <div className="vendor-tags">
          {v.tags.map(t=><span key={t} className="vendor-tag">{t}</span>)}
          {v.insurance && <span className="vendor-tag" style={{ background:'#d4f4e0', color:'#1a6b3a', borderColor:'#b8e8c8' }}>✓ Insured</span>}
        </div>
        <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.5, marginBottom:10 }}>{v.description}</p>
        <div className="vendor-meta">
          <div className="vendor-price">{v.price}</div>
          <div className="vendor-location">📍 {v.homeZip} · travels {v.radius}mi</div>
        </div>
        {showDist && (
          outOfRange
            ? <div className="vendor-no-match">✗ {v.dist!==null?`${v.dist.toFixed(1)} mi away`:'distance unknown'} — outside travel range</div>
            : <div className="vendor-distance">✓ {v.dist!==null?`${v.dist.toFixed(1)} mi from your event`:'within range (zip unverified)'}</div>
        )}
        <button className="contact-btn" onClick={()=>setContacted(c=>c.includes(v.id)?c:[...c,v.id])} style={contacted.includes(v.id)?{background:'#1a6b3a',color:'#fff'}:{}}>
          {contacted.includes(v.id)?'✓ Request Sent':'Request Contact Info'}
        </button>
      </div>
    </div>
  );
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function MatchesPage() {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInsurance, setFilterInsurance] = useState('');
  const [hostZip, setHostZip] = useState('');
  const [contacted, setContacted] = useState([]);
  const hasZip = hostZip.length === 5 && isValidZip(hostZip);

  const enriched = SAMPLE_VENDORS
    .filter(v => !filterCategory  || v.category === filterCategory)
    .filter(v => !filterInsurance || (filterInsurance==='yes' ? v.insurance : !v.insurance))
    .map(v => {
      if (!hasZip) return {...v, dist:null, inRange:true};
      const dist = distanceMiles(v.homeZip, hostZip);
      // null distance = unknown zip — include vendor, flag as unverified
      return {...v, dist, inRange: dist===null ? true : dist <= v.radius};
    });

  const inRange  = enriched.filter(v => v.inRange).sort((a,b)=>(a.dist??999)-(b.dist??999)||b.matchScore-a.matchScore);
  const outRange = enriched.filter(v => !v.inRange);

  return (
    <div className="section" style={{ maxWidth:1060 }}>
      <div className="section-title">Vendor Directory</div>
      <p className="section-sub">Browse all active South Jersey vendors. Enter your event zip code to see who can travel to you.</p>
      <div className="match-filters">
        <div className="match-filter-group" style={{ maxWidth:200 }}>
          <label>Event Zip Code</label>
          <input placeholder="e.g. 08033" value={hostZip} maxLength={5} onChange={e=>setHostZip(e.target.value.replace(/\D/g,'').slice(0,5))} />
          {hasZip && <div className={`zip-feedback ${isKnownZip(hostZip)?'zip-ok':'zip-warn'}`}>{isKnownZip(hostZip)?'✓ Showing vendors in range':'⚠ Zip unverified — results may vary'}</div>}
        </div>
        <div className="match-filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="match-filter-group">
          <label>Insurance</label>
          <select value={filterInsurance} onChange={e=>setFilterInsurance(e.target.value)}>
            <option value="">Any</option><option value="yes">Insured Only</option><option value="no">Not Required</option>
          </select>
        </div>
      </div>

      <div className="results-header">
        <div className="results-count"><strong>{inRange.length}</strong> {hasZip?'vendors within travel range':'vendors found'}</div>
        {hasZip && <div style={{ fontSize:13, color:'#7a6a5a' }}>Sorted nearest → farthest from {hostZip}</div>}
      </div>

      {inRange.length===0
        ? <div className="empty-state"><div className="big">🔍</div><p>No vendors match your filters.</p></div>
        : <div className="vendor-grid">{inRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} />)}</div>
      }

      {hasZip && outRange.length>0 && (
        <>
          <div style={{ marginTop:48, marginBottom:16, borderTop:'2px dashed #e0d5c5', paddingTop:32 }}>
            <div style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:4 }}>Outside Travel Range</div>
            <p style={{ fontSize:14, color:'#a89a8a' }}>These vendors are beyond their stated travel radius for zip {hostZip}.</p>
          </div>
          <div className="vendor-grid" style={{ opacity:0.5 }}>
            {outRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist outOfRange />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────
function PricingPage({ setTab }) {
  return (
    <div className="section" style={{ maxWidth:1000 }}>
      <div className="section-title">Simple, Transparent Pricing</div>
      <p className="section-sub">Whether you're a vendor looking for consistent leads or a host planning an event, we have a plan for you.</p>
      <h3 style={{ fontSize:13, marginBottom:20, color:'#7a6a5a', letterSpacing:1, textTransform:'uppercase' }}>FOR VENDORS</h3>
      <div className="pricing-grid" style={{ marginBottom:48 }}>
        <div className="pricing-card">
          <div className="pricing-type">Vendor</div><div className="pricing-name">Basic Listing</div>
          <div className="pricing-price">$15</div><div className="pricing-period">per month</div>
          <ul className="pricing-features"><li>Profile in vendor directory</li><li>Photo gallery (up to 6)</li><li>Insurance & doc uploads</li><li>Matched to events in your radius</li><li>Lead notifications by email</li></ul>
        </div>
        <div className="pricing-card featured">
          <div className="pricing-badge">MOST POPULAR</div>
          <div className="pricing-type">Vendor</div><div className="pricing-name">Featured</div>
          <div className="pricing-price">$35</div><div className="pricing-period">per month</div>
          <ul className="pricing-features"><li>Everything in Basic</li><li>Top placement in search results</li><li>Featured on homepage</li><li>Priority match notifications</li><li>Social media feature (monthly)</li></ul>
        </div>
      </div>
      <h3 style={{ fontSize:13, marginBottom:20, color:'#7a6a5a', letterSpacing:1, textTransform:'uppercase' }}>FOR HOSTS & EVENT ORGANIZERS</h3>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-type">Host</div><div className="pricing-name">Single Event</div>
          <div className="pricing-price">$25</div><div className="pricing-period">one-time fee</div>
          <ul className="pricing-features"><li>Zip-radius matched vendor list</li><li>Up to 20 vendor results</li><li>Filter by category & distance</li><li>Direct vendor contact info</li><li>You manage booking yourself</li></ul>
        </div>
        <div className="pricing-card">
          <div className="pricing-type">Host</div><div className="pricing-name">Monthly Access</div>
          <div className="pricing-price">$49</div><div className="pricing-period">per month</div>
          <ul className="pricing-features"><li>Unlimited event submissions</li><li>Unlimited vendor matching</li><li>Early access to new vendors</li><li>Event calendar listing</li><li>Priority support</li></ul>
        </div>
        <div className="pricing-card featured">
          <div className="pricing-badge">WHITE GLOVE</div>
          <div className="pricing-type">Host</div><div className="pricing-name">Managed Booking</div>
          <div className="pricing-price">$150+</div><div className="pricing-period">per event</div>
          <ul className="pricing-features"><li>We contact every vendor for you</li><li>Confirmations & follow-ups handled</li><li>Day-of coordination checklist</li><li>Vendor contract management</li><li>Dedicated event coordinator</li></ul>
        </div>
      </div>
      <div style={{ textAlign:'center', marginTop:48 }}>
        <button className="btn-submit" onClick={()=>setTab('vendor')}>Join as a Vendor →</button>
        <span style={{ margin:'0 20px', color:'#a89a8a' }}>or</span>
        <button className="btn-submit" style={{ background:'#e8c97a', color:'#1a1410' }} onClick={()=>setTab('host')}>Post Your Event →</button>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
function AdminPage({ opps=[], setOpps=()=>{}, vendorSubs=[] }) {
  return (
    <div className="section" style={{ maxWidth:1000 }}>
      <div className="section-title">Admin Dashboard</div>
      <p className="section-sub">Manage vendors, hosts, and bookings across South Jersey.</p>
      <div className="admin-grid">
        <div className="admin-stat"><div className="admin-stat-num">{opps.length}</div><div className="admin-stat-label">Live Opportunities</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{vendorSubs.length}</div><div className="admin-stat-label">Vendor Submissions</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{SAMPLE_VENDORS.length}</div><div className="admin-stat-label">Active Vendors</div></div>
        <div className="admin-stat"><div className="admin-stat-num">$0</div><div className="admin-stat-label">Monthly Revenue</div></div>
      </div>
      <AdminPostForm onPost={opp=>setOpps(prev=>[{...opp, source:opp.source||"Admin"}, ...prev])} />
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Live Opportunities</h3>
      {opps.length===0
        ? <div className="empty-state"><div className="big">&#128221;</div><p>No opportunities posted yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Event</th><th>Type</th><th>Zip</th><th>Date</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {opps.map(o=>(
                <tr key={o.id}>
                  <td><strong>{o.eventName}</strong></td><td>{o.eventType}</td><td>{o.zip}</td>
                  <td>{fmtDate(o.date)}</td><td>{o.source}</td>
                  <td><span className="status-pill status-active">Live</span></td>
                </tr>
              ))}
            </tbody>
          </table>
      }
      {vendorSubs.length>0 && (
        <>
          <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Recent Vendor Submissions</h3>
          <table className="admin-table">
            <thead><tr><th>Business</th><th>Owner</th><th>Home Zip</th><th>Radius</th><th>Categories</th><th>Status</th></tr></thead>
            <tbody>
              {vendorSubs.map((v,i)=>(
                <tr key={i}>
                  <td><strong>{v.businessName}</strong></td><td>{v.ownerName}</td>
                  <td>{v.homeZip}</td><td>{v.radius} mi</td>
                  <td>{(v.categories||[]).join(", ")||"—"}</td>
                  <td><span className="status-pill status-pending">Review</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}


// ─── Opportunities Page ───────────────────────────────────────────────────────
function OpportunitiesPage({ opps }) {
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [myZip, setMyZip] = useState("");
  const [saved, setSaved] = useState([]);
  const zipOk = myZip.length===5 && isKnownZip(myZip);

  const list = opps
    .filter(o => !filterType || o.eventType===filterType)
    .filter(o => !filterCat  || o.categoriesNeeded.includes(filterCat))
    .map(o => {
      const dist = zipOk ? distanceMiles(myZip, o.zip) : null;
      return {...o, dist};
    })
    .sort((a,b) => {
      if (a.dist!==null && b.dist!==null) return a.dist - b.dist;
      return 0;
    });

  return (
    <>
      <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"48px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(232,201,122,.08),transparent)" }} />
        <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:36, color:"#fff", marginBottom:8, position:"relative" }}>
          Vendor <em style={{ color:"#e8c97a", fontStyle:"italic" }}>Opportunities</em>
        </h2>
        <p style={{ color:"#a89a8a", fontSize:16, maxWidth:520, margin:"0 auto", position:"relative" }}>
          Events, pop-ups, and markets across South Jersey actively looking for vendors.
        </p>
      </div>
      <div className="section" style={{ maxWidth:1100, paddingTop:40 }}>
        <div className="match-filters">
          <div className="match-filter-group" style={{ maxWidth:200 }}>
            <label>My Zip Code</label>
            <input placeholder="e.g. 08003" value={myZip} maxLength={5}
              onChange={e => setMyZip(e.target.value.replace(/\D/g,"").slice(0,5))} />
            {myZip.length===5 && (
              <div className={`zip-feedback ${zipOk?"zip-ok":"zip-warn"}`}>
                {zipOk ? "\u2713 Sorted by distance to you" : "\u26a0 Zip unverified"}
              </div>
            )}
          </div>
          <div className="match-filter-group">
            <label>Event Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="match-filter-group">
            <label>Category Needed</label>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="results-header">
          <div className="results-count"><strong>{list.length}</strong> opportunities available</div>
          <div style={{ fontSize:13, color:"#a89a8a" }}>Updated regularly</div>
        </div>
        {list.length===0
          ? <div className="empty-state"><div className="big">📭</div><p>No opportunities match your filters.</p></div>
          : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24 }}>
            {list.map(opp => (
              <div key={opp.id} style={{ background:"#fff", border:"1px solid #e8ddd0", borderRadius:12, overflow:"hidden", transition:"all 0.2s" }}>
                <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"20px 24px" }}>
                  <div style={{ display:"inline-block", background:"#e8c97a", color:"#1a1410", fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, marginBottom:10 }}>{opp.source}</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, color:"#fff", marginBottom:4, lineHeight:1.3 }}>{opp.eventName}</div>
                  <div style={{ fontSize:12, color:"#a89a8a", letterSpacing:"1px", textTransform:"uppercase" }}>{opp.eventType}</div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Date</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtDate(opp.date)}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Time</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtTime(opp.startTime)} – {fmtTime(opp.endTime)}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Location</div><div style={{ fontSize:14, fontWeight:500 }}>Zip {opp.zip}{opp.dist!==null ? ` · ${opp.dist.toFixed(1)}mi away` : ""}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Booth Fee</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.boothFee}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Spots Open</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.spots} available</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Contact</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.contactName}</div></div>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                    {opp.categoriesNeeded.map(c=><span key={c} style={{ background:"#f5f0ea", border:"1px solid #e8ddd0", padding:"3px 10px", borderRadius:20, fontSize:11, color:"#5a4a3a" }}>{c}</span>)}
                  </div>
                  {opp.notes && <div style={{ fontSize:13, color:"#7a6a5a", lineHeight:1.6, marginBottom:14, padding:12, background:"#fdf9f5", borderRadius:6, borderLeft:"3px solid #e8c97a" }}>{opp.notes}</div>}
                  <div style={{ fontSize:13, color:"#7a6a5a", marginBottom:14 }}><strong style={{ color:"#1a1410" }}>Contact:</strong> {opp.contactEmail}{opp.contactPhone ? ` · ${opp.contactPhone}` : ""}</div>
                  {opp.deadline && (
                    <div style={{ display:"inline-block", background:isUrgent(opp.deadline)?"#fde8e8":"#fff3cd", border:`1px solid ${isUrgent(opp.deadline)?"#f5a0a0":"#ffd966"}`, color:isUrgent(opp.deadline)?"#8b0000":"#7a5a10", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, marginBottom:14 }}>
                      {isUrgent(opp.deadline)?"🔥 Deadline soon: ":"Apply by: "}{fmtDate(opp.deadline)}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10 }}>
                    {opp.fbLink && <a href={opp.fbLink} target="_blank" rel="noopener noreferrer" style={{ flex:1, background:"#1a1410", color:"#e8c97a", border:"none", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"center", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>View on Facebook</a>}
                    <button onClick={()=>setSaved(s=>s.includes(opp.id)?s.filter(x=>x!==opp.id):[...s,opp.id])} style={{ background:saved.includes(opp.id)?"#fdf4dc":"#f5f0ea", color:"#1a1410", border:"1px solid #e0d5c5", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
                      {saved.includes(opp.id)?"\u2713 Saved":"Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Admin Post Form ──────────────────────────────────────────────────────────
function AdminPostForm({ onPost }) {
  const blank = { eventName:"", eventType:"", zip:"", date:"", startTime:"", endTime:"", boothFee:"", spots:"", categoriesNeeded:[], contactName:"", contactEmail:"", contactPhone:"", fbLink:"", deadline:"", notes:"", source:"Facebook Group" };
  const [form, setForm] = useState(blank);
  const [posted, setPosted] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = () => {
    if (!form.eventName||!form.eventType||!form.zip||!form.date) { alert("Please fill in Event Name, Type, Zip Code, and Date."); return; }
    onPost({...form, id:Date.now(), spots:parseInt(form.spots)||0});
    setForm(blank); setPosted(true); setTimeout(()=>setPosted(false),4000);
  };

  return (
    <div style={{ background:"#fff", border:"2px solid #e8c97a", borderRadius:12, padding:32, marginBottom:40 }}>
      <div style={{ fontFamily:"Playfair Display,serif", fontSize:22, marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
        Post New Opportunity
        <span style={{ display:"inline-block", background:"#e8c97a", color:"#1a1410", fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20 }}>Admin Only</span>
      </div>
      <p style={{ color:"#7a6a5a", fontSize:14, marginBottom:24 }}>Post events from Facebook or approved hosts — they go live immediately on the Opportunities board.</p>
      {posted && <div style={{ background:"#d4f4e0", border:"1px solid #b8e8c8", borderRadius:8, padding:"12px 16px", marginBottom:20, color:"#1a6b3a", fontWeight:600 }}>\u2713 Posted! Now live on the Opportunities board.</div>}
      <div className="form-grid">
        <div className="form-group full"><label>Event Name *</label><input placeholder="e.g. Collingswood Spring Pop-Up Market" value={form.eventName} onChange={e=>set("eventName",e.target.value)} /></div>
        <div className="form-group"><label>Event Type *</label><select value={form.eventType} onChange={e=>set("eventType",e.target.value)}><option value="">Select type...</option>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label>Source</label><select value={form.source} onChange={e=>set("source",e.target.value)}><option>Facebook Group</option><option>Facebook Event</option><option>Host Submitted</option><option>Instagram</option><option>Email Tip</option><option>Other</option></select></div>
        <ZipInput label="Event Zip Code *" value={form.zip} onChange={v=>set("zip",v)} hint="5-digit zip where the event takes place" />
        <div className="form-group"><label>Event Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></div>
        <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>set("startTime",e.target.value)} /></div>
        <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>set("endTime",e.target.value)} /></div>
        <div className="form-group"><label>Booth Fee</label><input placeholder="e.g. $50/vendor or Free" value={form.boothFee} onChange={e=>set("boothFee",e.target.value)} /></div>
        <div className="form-group"><label>Spots Available</label><input type="number" placeholder="e.g. 20" value={form.spots} onChange={e=>set("spots",e.target.value)} /></div>
        <div className="form-group"><label>Application Deadline</label><input type="date" value={form.deadline} onChange={e=>set("deadline",e.target.value)} /></div>
        <div className="form-group"><label>Facebook / Event Link</label><input placeholder="https://facebook.com/events/..." value={form.fbLink} onChange={e=>set("fbLink",e.target.value)} /></div>
        <div className="form-group"><label>Host Contact Name</label><input placeholder="Who vendors should contact" value={form.contactName} onChange={e=>set("contactName",e.target.value)} /></div>
        <div className="form-group"><label>Host Contact Email</label><input type="email" placeholder="host@email.com" value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)} /></div>
        <div className="form-group"><label>Host Contact Phone</label><input placeholder="(856) 555-0000" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} /></div>
        <div className="form-group full">
          <CheckboxGroup label="Vendor Categories Needed" options={CATEGORIES} selected={form.categoriesNeeded} onChange={v=>set("categoriesNeeded",v)} />
        </div>
        <div className="form-group full"><label>Notes for Vendors</label><textarea placeholder="Tables provided? Tents required? Electric available? Insured vendors only?" value={form.notes} onChange={e=>set("notes",e.target.value)} /></div>
      </div>
      <div style={{ marginTop:24 }}>
        <button className="btn-submit" onClick={submit}>Post to Opportunities Board</button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [vendorSuccess, setVendorSuccess] = useState(false);
  const [hostSuccess,   setHostSuccess]   = useState(false);
  const [opps, setOpps] = useState(SAMPLE_OPPS);
  const [vendorSubs, setVendorSubs] = useState([]);

  const handleVendorSubmit = form => {
    if (!form.businessName || !form.email || form.categories.length===0) {
      alert("Please fill in Business Name, Email, and at least one Category.");
      return;
    }
    setVendorSubs(v => [form, ...v]);
    setVendorSuccess(true);
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const handleHostSubmit = form => {
    if (!form.contactName || !form.email || !form.eventType) {
      alert('Please fill in Contact Name, Email, and Event Type.');
      return;
    }
    setHostSuccess(true);
    setTab('matches');
    window.scrollTo({top:0, behavior:'smooth'});
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">SJ<span>Vendor</span>Match</div>
          <div className="nav-tabs">
            <button className={`nav-tab${tab==="home"?" active":""}`} onClick={()=>{setTab("home");window.scrollTo({top:0});}}>Home</button>
            <div className="nav-group">
              <div className="nav-group-label">&#128717; Vendors</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="vendor"?" active":""}`} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Join as Vendor</button>
                <button className={`nav-tab${tab==="opportunities"?" active":""}`} onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Opportunities</button>
                <button className={`nav-tab${tab==="matches"?" active":""}`} onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Browse Vendors</button>
              </div>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">&#127918; Hosts</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="host"?" active":""}`} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Post Event</button>
              </div>
            </div>
            <button className={`nav-tab${tab==="pricing"?" active":""}`} onClick={()=>{setTab("pricing");window.scrollTo({top:0});}}>Pricing</button>
            <button className={`nav-tab${tab==="admin"?" active":""}`} onClick={()=>{setTab("admin");window.scrollTo({top:0});}}>Admin</button>
          </div>
        </nav>

        {tab==='home' && (
          <>
            <div className="hero">
              <div className="hero-eyebrow">South Jersey's Vendor Matching Platform</div>
              <h1>Connect. Vend. <em>Thrive.</em></h1>
              <p>The only platform built exclusively for South Jersey vendors and event hosts — matched by zip code and travel radius.</p>
              <div style={{ display:"flex", gap:16, justifyContent:"center", alignItems:"stretch", maxWidth:900, margin:"0 auto", flexWrap:"wrap", position:"relative" }}>
                <div style={{ flex:1, minWidth:280, padding:"32px 40px", textAlign:"left", background:"rgba(255,255,255,.05)", borderRadius:8, border:"1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize:11, letterSpacing:"3px", textTransform:"uppercase", color:"#e8c97a", marginBottom:8 }}>&#128717; For Vendors</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:"#fff", marginBottom:8 }}>Find Events Near You</div>
                  <div style={{ color:"#a89a8a", fontSize:14, lineHeight:1.6, marginBottom:20 }}>Enter your home zip, set your travel radius, and get matched with events that come to you.</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <button className="btn-primary" onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Join as a Vendor</button>
                    <button className="btn-outline" onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Browse Opportunities</button>
                  </div>
                  <div style={{ marginTop:14, fontSize:12, color:"#e8c97a", fontWeight:600 }}>First 3 months free — no credit card required</div>
                </div>
                <div style={{ flex:1, minWidth:280, padding:"32px 40px", textAlign:"left", background:"rgba(255,255,255,.05)", borderRadius:8, border:"1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize:11, letterSpacing:"3px", textTransform:"uppercase", color:"#e8c97a", marginBottom:8 }}>&#127918; For Event Hosts</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:"#fff", marginBottom:8 }}>Find Vendors for Your Event</div>
                  <div style={{ color:"#a89a8a", fontSize:14, lineHeight:1.6, marginBottom:20 }}>Enter your event zip code and we instantly match vendors within their travel range.</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <button className="btn-primary" onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Post Your Event</button>
                    <button className="btn-outline" onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Search Vendors</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-bar">
              <div className="stat"><div className="stat-num">47+</div><div className="stat-label">Active Vendors</div></div>
              <div className="stat"><div className="stat-num">18</div><div className="stat-label">Categories</div></div>
              <div className="stat"><div className="stat-num">19</div><div className="stat-label">Event Types</div></div>
              <div className="stat"><div className="stat-num">95%</div><div className="stat-label">Match Satisfaction</div></div>
            </div>
            <div className="section" style={{ textAlign:'center' }}>
              <div className="section-title">How It Works</div>
              <p className="section-sub">Three simple steps to connect vendors and hosts across South Jersey.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:24, marginTop:32 }}>
                {[
                  {icon:'📍', title:'Enter Your Zip Code', desc:"Vendors set their home zip and travel radius. Hosts enter their event zip. We do the math."},
                  {icon:'🎯', title:'Smart Radius Matching', desc:"Our system finds vendors whose travel range covers your event location — no town dropdowns needed."},
                  {icon:'🤝', title:'Book & Vend', desc:"Hosts contact vendors directly or let us manage the entire booking process for you."},
                ].map(s=>(
                  <div key={s.title} style={{ background:'#fff', border:'1px solid #e8ddd0', borderRadius:10, padding:32, textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:16 }}>{s.icon}</div>
                    <div style={{ fontFamily:'Playfair Display', fontSize:20, marginBottom:8 }}>{s.title}</div>
                    <p style={{ fontSize:14, color:'#7a6a5a', lineHeight:1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:48 }}><button className="btn-submit" onClick={()=>setTab('matches')}>Browse Vendors →</button></div>
            </div>
          </>
        )}

        {tab==='vendor' && (
          <div className="section">
            {vendorSuccess ? (
              <>
                <div className="success-banner">
                  <div className="success-icon">🎉</div>
                  <h2>You're in the network!</h2>
                  <p>Your vendor profile has been submitted. We'll review and activate your listing within <span className="success-highlight">24 hours</span>. Welcome to SJVendorMatch.</p>
                </div>
                <button className="btn-submit" onClick={()=>setVendorSuccess(false)}>Submit Another Profile</button>
              </>
            ) : (
              <>
                <div className="section-title">Vendor Registration</div>
                <p className="section-sub">Join South Jersey's growing vendor community and get matched with events near you.</p>
                <VendorForm onSubmit={handleVendorSubmit} />
              </>
            )}
          </div>
        )}

        {tab==='host' && (
          <div className="section">
            {hostSuccess ? (
              <div className="success-banner">
                <div className="success-icon">✅</div>
                <h2>Event submitted!</h2>
                <p>We've matched your event with the best available South Jersey vendors. <span className="success-highlight">Check the Browse tab</span> to see your results.</p>
              </div>
            ) : (
              <>
                <div className="section-title">Host an Event</div>
                <p className="section-sub">Tell us about your event and we'll find the perfect vendors for you.</p>
                <HostForm onSubmit={handleHostSubmit} />
              </>
            )}
          </div>
        )}

        {tab==="matches"      && <MatchesPage />}
        {tab==="opportunities" && <OpportunitiesPage opps={opps} />}
        {tab==="pricing"       && <PricingPage setTab={setTab} />}
        {tab==="admin"         && <AdminPage opps={opps} setOpps={setOpps} vendorSubs={vendorSubs} />}
      </div>
    </>
  );
}
