import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Food & Beverage", "Jewelry & Accessories", "Art & Prints", "Candles & Home Decor",
  "Clothing & Apparel", "Beauty & Skincare", "Plants & Floral", "Crafts & Handmade",
  "Health & Wellness", "Kids & Baby", "Pet Products", "Photography & Media",
  "Wedding & Bridal", "Baby & Maternity", "Party & Event Decor", "Personalized Gifts",
  "Vintage & Thrift", "Spiritual & Metaphysical", "Entertainment", "Other"
];

const SUBCATEGORIES = {
  "Food & Beverage": ["Breads & Rolls", "Cakes", "Cookies", "Other Desserts", "Custom/Personalized", "Snacks & Jerky", "Sauces & Condiments", "Beverages & Juices", "Candy & Chocolates", "Meal Prep & Catering", "Charcuterie", "Other"],
  "Jewelry & Accessories": ["Earrings", "Necklaces & Pendants", "Bracelets & Bangles", "Rings", "Hair Accessories", "Bags & Purses", "Permanent", "Charm", "Custom/Personalized", "Handmade", "Other"],
  "Art & Prints": ["Illustrations & Drawing", "Paintings", "Digital Prints", "Custom Portraits", "Stickers & Postcards", "Mixed Media", "Other"],
  "Candles & Home Decor": ["Soy Candles", "Wax Melts", "Diffusers & Oils", "Wall Art", "Throw Pillows", "Seasonal Decor", "Other"],
  "Clothing & Apparel": ["T-Shirts & Hoodies", "Dresses & Skirts", "Kids Clothing", "Hats & Beanies", "Activewear", "Custom/Personalized", "Other"],
  "Beauty & Skincare": ["Skincare & Serums", "Body Butters & Lotions", "Lip Care", "Hair Care", "Bath Products", "Makeup & Cosmetics", "Injectibles", "Other"],
  "Plants & Floral": ["Succulents & Cacti", "Tropical Plants", "Floral Arrangements", "Dried Florals", "Seeds & Bulbs", "Terrariums", "Other"],
  "Crafts & Handmade": ["Woodwork", "Ceramics & Pottery", "Knit & Crochet", "Resin Art", "Macrame", "Paper Crafts", "Charcuterie", "Invitations", "Custom", "Other"],
  "Health & Wellness": ["Supplements & Vitamins", "Essential Oils", "Crystals & Spiritual", "Teas & Herbal", "Fitness Products", "Mental Wellness", "Yoga", "Personal Training", "Physical Therapy", "Other"],
  "Kids & Baby": ["Toys & Games", "Clothing", "Nursery Decor", "Books", "Personalized Gifts", "Educational", "Other"],
  "Pet Products": ["Treats & Food", "Toys", "Collars & Leashes", "Grooming", "Apparel", "Beds & Accessories", "Other"],
  "Photography & Media": ["Event Photography", "Portrait Sessions", "Digital Downloads", "Prints & Albums", "Video Services", "Headshots", "Other"],
  "Wedding & Bridal": ["Bridal Accessories", "Wedding Favors", "Bridesmaid Gifts", "Vow Books & Stationery", "Bridal Robes & Apparel", "Wedding Decor", "Custom Veils & Hair Accessories", "Other"],
  "Baby & Maternity": ["Baby Shower Favors", "Nursery Decor", "Baby Clothing & Accessories", "Maternity Apparel", "Gender Reveal Items", "Milestone Keepsakes", "Custom Baby Gifts", "Other"],
  "Party & Event Decor": ["Balloon Arrangements", "Table Centerpieces", "Backdrops & Banners", "Custom Signage", "Party Favors", "Themed Decorations", "Photo Booth Props", "Other"],
  "Personalized Gifts": ["Custom Tumblers & Cups", "Engraved Items", "Embroidered Goods", "Custom Jewelry", "Monogrammed Gifts", "Photo Gifts", "Name & Word Art", "Wine Charms", "Other"],
  "Vintage & Thrift": ["Vintage Clothing", "Antiques & Collectibles", "Vintage Jewelry", "Upcycled Goods", "Retro Home Decor", "Vinyl & Media", "Other"],
  "Spiritual & Metaphysical": ["Crystals & Gemstones", "Tarot & Oracle Cards", "Sage & Cleansing", "Spiritual Jewelry", "Meditation & Mindfulness", "Altar Supplies", "Other"],
  "Entertainment": ["Solo Acoustic Artist", "Acoustic Duo", "Full Band", "DJ (with MC)", "DJ (Music Only)", "Self DJ Rental", "Cover Band", "Jazz Ensemble", "Classical/String Quartet", "Karaoke Host", "Comedian/Stand-Up", "Magician", "Caricature Artist", "Photo Booth Operator", "Balloon Artist", "Face Painter", "Henna Artist", "Tarot/Palm Reader", "Fire Performer", "Strolling Entertainer", "Other"],
};

const EVENT_TYPES = [
  "Pop-Up Market", "Corporate Event", "Birthday Party", "Wedding Reception",
  "Wedding Ceremony", "Bridal Shower", "Baby Shower", "Gender Reveal",
  "Community Festival", "Farmers Market", "Fundraiser", "Grand Opening",
  "Holiday Market", "Block Party", "Private Party", "Sip & Shop",
  "Girls Night Out", "Bachelorette Party", "Anniversary Celebration", "Other"
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
function generateRef() { return 'SJVM-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).slice(2,5).toUpperCase(); }

// ─── Supabase row → app shape converters ─────────────────────────────────────
function dbVendorToApp(v) {
  return {
    id:                v.id,
    name:              v.name,
    category:          v.category,
    allCategories:     v.metadata?.allCategories || [v.category],
    subcategories:     v.subcategories  || [],
    homeZip:           v.home_zip,
    radius:            v.radius,
    emoji:             v.emoji          || "🏪",
    tags:              v.tags           || [],
    price:             v.price          || "",
    description:       v.description    || "",
    insurance:         v.insurance      || false,
    hasMinPurchase:    v.has_min_purchase    || false,
    minPurchaseAmt:    v.min_purchase_amt    || 0,
    chargesPrivateFee: v.charges_private_fee || false,
    privateEventFee:   v.private_event_fee   || 0,
    matchScore:        100,
  };
}

function dbEventToApp(e) {
  return {
    id:               e.id,
    eventName:        e.event_name,
    eventType:        e.event_type,
    zip:              e.zip,
    date:             e.date,
    startTime:        e.start_time ? e.start_time.slice(0, 5) : "",
    endTime:          e.end_time   ? e.end_time.slice(0, 5)   : "",
    boothFee:         e.booth_fee         || "",
    spots:            e.spots             || 0,
    categoriesNeeded: e.categories_needed || [],
    contactName:      e.contact_name      || "",
    contactEmail:     e.contact_email     || "",
    contactPhone:     e.contact_phone     || "",
    fbLink:           e.fb_link           || "",
    deadline:         e.deadline          || "",
    notes:            e.notes             || "",
    source:           e.source            || "Host Submitted",
    photoUrl:         e.photo_url         || "",
  };
}

function fmtDate(d){ if(!d) return ""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"}); }
function fmtTime(t){ if(!t) return ""; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; }
function isUrgent(d){ if(!d) return false; return (new Date(d+"T12:00:00")-new Date())/86400000<=7; }

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f0ea; color: #1a1410; min-height: 100vh; }
  .app { min-height: 100vh; }
  .nav { background: #1a1410; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 8px; }
  .nav-logo { display:flex; align-items:baseline; gap:6px; }
  .nav-logo-cursive { font-family: 'Corinthia', cursive; font-size: 32px; color: #e8c97a; line-height:1; letter-spacing: 0px; }
  .nav-logo-serif { font-family: 'Playfair Display', serif; font-size: 18px; color: #fff; letter-spacing: 1px; font-weight:700; }
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
    .ometa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) {
    .nav { padding: 10px 16px; gap: 6px; }
    .nav-logo { font-size: 18px; }
    .nav-tabs { gap: 2px; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; flex-wrap: nowrap; }
    .nav-tab { padding: 6px 10px; font-size: 11px; white-space: nowrap; flex-shrink: 0; }
    .nav-group { padding-left: 8px; margin-left: 2px; }
    .nav-group-label { font-size: 9px; padding: 1px 4px; }
    .nav-group-items { gap: 2px; }
    .hero { padding: 40px 16px 32px; }
    .hero h1 { font-size: 32px; }
    .hero > p { font-size: 15px; margin-bottom: 28px; }
    .hero-split { flex-direction: column; gap: 12px; }
    .hero-side { min-width: unset; padding: 20px; }
    .hero-side-title { font-size: 20px; }
    .stats-bar { gap: 16px; padding: 16px; justify-content: space-around; }
    .stat-num { font-size: 20px; }
    .stat-label { font-size: 10px; }
    .section { padding: 32px 16px; }
    .section-title { font-size: 26px; }
    .section-sub { font-size: 14px; }
    .form-card { padding: 20px 14px; }
    .form-grid { grid-template-columns: 1fr; }
    .form-section-title { font-size: 17px; }
    .checkbox-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
    .checkbox-item { padding: 6px 10px; font-size: 13px; }
    .radius-group { gap: 6px; }
    .radius-btn { padding: 6px 12px; font-size: 13px; }
    .btn-submit { padding: 14px 28px; font-size: 15px; width: 100%; }
    .match-filters { flex-direction: column; padding: 16px; gap: 12px; }
    .match-filter-group { min-width: unset; width: 100%; }
    .results-header { flex-direction: column; gap: 4px; }
    .vendor-grid { grid-template-columns: 1fr; gap: 14px; }
    .vendor-card-top { height: 80px; font-size: 28px; }
    .vendor-card-body { padding: 14px; }
    .vendor-name { font-size: 16px; }
    .admin-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .admin-table { font-size: 12px; }
    .admin-table th, .admin-table td { padding: 8px 10px; }
    .pricing-grid { grid-template-columns: 1fr; }
    .subcat-block { padding: 14px; }
    .form-submit { margin-top: 20px; }
    .info-box { font-size: 13px; padding: 10px 14px; }
    .upload-zone { padding: 20px; }
    .range-display { font-size: 16px; }
    .btn-select-all { padding: 5px 12px; font-size: 11px; }
    .checkbox-section-header { gap: 6px; }
    .selected-tags { gap: 4px; }
    .sel-tag { font-size: 11px; padding: 2px 8px; }
    .empty-state { padding: 40px 16px; }
    .empty-state .big { font-size: 36px; }
    .success-banner { padding: 28px 20px; }
    .success-banner h2 { font-size: 22px; }
    .success-icon { font-size: 36px; }
  }
    .ometa-grid { grid-template-columns: 1fr; }
    .service-grid { grid-template-columns: 1fr; }
      @media (max-width: 480px) {
    .nav-logo { font-size: 16px; }
    .hero h1 { font-size: 26px; }
    .stats-bar { flex-direction: row; flex-wrap: wrap; gap: 12px; padding: 12px; }
    .stat { min-width: 40%; text-align: center; }
    .admin-grid { grid-template-columns: 1fr; }
    .hero-side-btns button { font-size: 13px; padding: 11px 16px; }
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
function CheckboxGroup({ label, options, selected, onChange, otherValue, onOtherChange }) {
  const allOn  = options.length > 0 && options.every(o => selected.includes(o));
  const toggle = val => onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  const toggleAll = () => onChange(allOn ? selected.filter(s => !options.includes(s)) : [...new Set([...selected, ...options])]);
  const showOther = options.includes('Other') && selected.includes('Other');
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
      {showOther && (
        <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid #e8ddd0'}}>
          <input
            autoFocus
            placeholder="Please describe..."
            value={otherValue||''}
            onChange={e=>onOtherChange && onOtherChange(e.target.value)}
            style={{width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'9px 12px',fontSize:14,
              fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}}
          />
        </div>
      )}
    </div>
  );
}

// ─── Category + Subcategory Picker ────────────────────────────────────────────
function CategorySubcategoryPicker({ categories, subcategories, onCategoriesChange, onSubcategoriesChange, otherCategory, onOtherCategoryChange, otherSubcategories, onOtherSubcategoryChange }) {
  const handleCatChange = newCats => {
    const addedCats   = newCats.filter(c => !categories.includes(c));
    const removedCats = categories.filter(c => !newCats.includes(c));
    const kept    = subcategories.filter(s => !removedCats.some(c => (SUBCATEGORIES[c]||[]).includes(s)));
    const merged  = kept;
    onCategoriesChange(newCats);
    onSubcategoriesChange(merged);
    // Show the Other text input for any newly added category whose subcats include Other
    if (onOtherSubcategoryChange) {
      addedCats.forEach(cat => {
        if ((SUBCATEGORIES[cat] || []).includes('Other'))
          onOtherSubcategoryChange(cat, '');
      });
      removedCats.forEach(cat => {
        if ((SUBCATEGORIES[cat] || []).includes('Other'))
          onOtherSubcategoryChange(cat, null);
      });
    }
  };
  const toggleSubAll = (cat, catSubs) => {
    const allOn  = catSubs.every(s => subcategories.includes(s));
    const others = subcategories.filter(s => !catSubs.includes(s));
    onSubcategoriesChange(allOn ? others : [...others, ...catSubs]);
    // Show/hide the Other text input when Select All toggles Other in or out
    if (catSubs.includes('Other') && onOtherSubcategoryChange)
      onOtherSubcategoryChange(cat, allOn ? null : '');
  };
  const toggleSub = (sub, cat) => {
    const isRemoving = subcategories.includes(sub);
    onSubcategoriesChange(isRemoving ? subcategories.filter(s => s !== sub) : [...subcategories, sub]);
    if (sub === 'Other') {
      if (!isRemoving) {
        // Mark this cat's Other as active (empty string = checked, no text yet)
        onOtherSubcategoryChange && onOtherSubcategoryChange(cat, '');
      } else {
        // Remove this cat's Other entry
        onOtherSubcategoryChange && onOtherSubcategoryChange(cat, null);
      }
    }
  };
  return (
    <>
      <CheckboxGroup label="Your Categories *" options={CATEGORIES} selected={categories} onChange={handleCatChange} otherValue={otherCategory||''} onOtherChange={v=>onOtherCategoryChange && onOtherCategoryChange(v)} />
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
                      <input type="checkbox" checked={subcategories.includes(sub)} onChange={() => toggleSub(sub, cat)} />
                      {sub}
                    </label>
                  ))}
                </div>
                {catSubs.includes('Other') && subcategories.includes('Other') && otherSubcategories && otherSubcategories[cat] !== undefined && (
                  <div style={{marginTop:6,paddingTop:6,borderTop:'1px solid #e8ddd0'}}>
                    <input
                      autoFocus
                      placeholder={`Describe your "${cat}" subcategory...`}
                      value={(otherSubcategories&&otherSubcategories[cat])||''}
                      onChange={e=>onOtherSubcategoryChange && onOtherSubcategoryChange(cat, e.target.value)}
                      style={{width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',
                        fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}}
                    />
                  </div>
                )}
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function UploadZone({ label, hint, accept, onChange, multiple }) {
  const [fileNames, setFileNames] = useState([]);
  const inputRef = useRef(null);
  return (
    <div className="upload-zone" onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!!multiple}
        style={{ display:'none' }}
        onChange={e => {
          const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
          const valid = files.filter(Boolean);
          if (!valid.length) return;
          const oversized = valid.find(f => f.size > MAX_FILE_SIZE);
          if (oversized) { alert(`"${oversized.name}" is too large (${(oversized.size/1024/1024).toFixed(1)}MB). Maximum file size is 5MB.`); e.target.value=''; return; }
          setFileNames(valid.map(f => f.name));
          onChange && onChange(multiple ? valid : valid[0]);
        }}
      />
      <div className="upload-icon">{fileNames.length > 0 ? '✅' : '📎'}</div>
      <div style={{ fontWeight:600, marginBottom:4 }}>
        {fileNames.length > 0
          ? (multiple && fileNames.length > 1 ? `${fileNames.length} files selected` : fileNames[0])
          : `Upload ${label}`}
      </div>
      <div style={{ fontSize:13, color:'#a89a8a' }}>{hint}</div>
    </div>
  );
}

// ─── TOS Modal ────────────────────────────────────────────────────────────────
const TOS_SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By creating a vendor or host profile on South Jersey Vendor Market, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms constitute a legally binding agreement between you and South Jersey Vendor Market." },
  { title: "2. Non-Circumvention Agreement", body: "This is the most important section of our Terms. When a vendor and host are connected through South Jersey Vendor Market — whether through Browse Vendors, the Opportunities Board, in-app messaging, or any other platform feature — both parties agree NOT to conduct direct transactions outside the platform for a period of 12 months from the date of first contact.\n\nAny direct booking, hiring, payment, or business arrangement between a host and vendor who first connected through South Jersey Vendor Market, made outside of the platform, constitutes a circumvention violation. Violating parties will be subject to a finder's fee equal to 15% of the total transaction value, with a minimum fee of $150. South Jersey Vendor Market reserves the right to remove violating users from the platform permanently." },
  { title: "3. Vendor Responsibilities", body: "Vendors agree to: (a) provide accurate information about their business, products, pricing, insurance status, and availability; (b) honor commitments made through in-app messaging and booking; (c) maintain current and valid certificates of insurance where applicable; (d) conduct all platform communications through the in-app messaging system; (e) pay the applicable monthly subscription fee to maintain an active listing." },
  { title: "4. Host Responsibilities", body: "Hosts agree to: (a) provide accurate event information including zip code, date, time, and vendor requirements; (b) honor commitments to vendors made through the platform; (c) conduct all vendor communications through the in-app messaging system; (d) pay the applicable event posting or subscription fee; (e) not share vendor contact information obtained through the platform with third parties." },
  { title: "5. In-App Messaging & Communication", body: "South Jersey Vendor Market provides in-app messaging to protect both vendors and hosts. All initial contact and booking negotiations must take place through the platform's messaging system. This protects vendors from having their contact information shared without consent, and protects hosts by maintaining a record of all agreements. South Jersey Vendor Market does not read private messages but may access them if a dispute is filed." },
  { title: "6. Privacy & Data Protection", body: "South Jersey Vendor Market collects only the information necessary to operate the platform. Vendor contact details (email, phone) are never shared with hosts until a booking is confirmed. Host contact details are shared with vendors only as needed to fulfill event bookings. We do not sell your personal information to third parties. By using the platform, you consent to our use of your data to operate and improve our services." },
  { title: "7. Fees & Subscriptions", body: "Vendor listings are free until your first booking. After your first booking, a subscription fee of $15/month (Basic) applies. Host event postings start at $25 per event or $49/month for unlimited access. Managed booking services are priced separately. All fees are non-refundable except where required by law. South Jersey Vendor Market reserves the right to modify pricing with 30 days notice." },
  { title: "8. Limitation of Liability", body: "South Jersey Vendor Market is a marketplace platform that connects vendors and hosts. We are not responsible for the quality of vendor products or services, the outcome of events, disputes between vendors and hosts, or any damages arising from transactions conducted through the platform. Our total liability to any user shall not exceed the amount paid to South Jersey Vendor Market in the 3 months preceding any claim." },
  { title: "9. Dispute Resolution", body: "Any disputes between vendors and hosts arising from platform connections should first be reported to South Jersey Vendor Market at support@sjvendormarket.com. We will make reasonable efforts to mediate. Disputes not resolved through mediation shall be governed by the laws of the State of New Jersey. You agree to binding arbitration for any claims against South Jersey Vendor Market itself." },
  { title: "10. Modifications & Termination", body: "South Jersey Vendor Market reserves the right to modify these terms at any time with 14 days notice. Continued use of the platform after modifications constitutes acceptance. We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or circumvent the platform. The Non-Circumvention clause (Section 2) survives account termination." },
];

function TosModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fdf9f5', borderRadius:12, width:'100%', maxWidth:720, maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ background:'#1a1410', borderRadius:'12px 12px 0 0', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#e8c97a' }}>Terms of Service</div>
            <div style={{ fontSize:12, color:'#a89a8a', marginTop:2 }}>South Jersey Vendor Market Platform Agreement</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid #ffffff30', color:'#fff', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
        </div>
        {/* Scrollable content */}
        <div style={{ overflowY:'auto', padding:'28px', flex:1 }}>
          {TOS_SECTIONS.map(({ title, body }) => (
            <div key={title} style={{ marginBottom:24 }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:16, color:'#1a1410', marginBottom:6 }}>{title}</div>
              {body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize:13, color:'#5a4a3a', lineHeight:1.8, marginBottom:6 }}>{para}</p>
              ))}
            </div>
          ))}
          <div style={{ fontSize:13, color:'#a89a8a', borderTop:'1px solid #e8ddd0', paddingTop:16, marginTop:8 }}>
            Questions? Contact us at <strong>support@sjvendormarket.com</strong>
          </div>
        </div>
        {/* Footer */}
        <div style={{ borderTop:'1px solid #e8ddd0', padding:'16px 28px', display:'flex', justifyContent:'flex-end', flexShrink:0, background:'#fff', borderRadius:'0 0 12px 12px' }}>
          <button onClick={onClose} style={{ background:'#1a1410', color:'#e8c97a', border:'none', padding:'10px 28px', borderRadius:6, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Form ──────────────────────────────────────────────────────────────
const VENDOR_DRAFT_KEY      = 'sjvm_vendor_draft';
const VENDOR_DRAFT_SUBS_KEY = 'sjvm_vendor_draft_subs';
const CONVERSATIONS_LS_KEY  = 'sjvm_conversations';
const VENDOR_CALS_LS_KEY    = 'sjvm_vendor_calendars';
const SESSION_KEY           = 'sjvm_session_id';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
const DEFAULT_VENDOR_FORM = {
  businessName:'', ownerName:'', email:'', phone:'',
  homeZip:'', radius:20,
  categories:[], subcategories:[],
  description:'', website:'', facebook:'', instagram:'', tiktok:'', otherSocial:'',
  eventTypes:[],
  insurance:false,
  hasMinPurchase:false, minPurchaseAmt:25,
  chargesPrivateFee:false, privateEventFee:150,
  priceMax:0,
  otherCategory:'', otherEventType:'',
  responseTime:'24hrs', bookingLeadTime:'2weeks', eventFrequency:'flexible', emailFrequency:'weekly',
  setupTime:30, tableSize:'6ft', needsElectric:false,
  yearsActive:''
};

function VendorForm({ onSubmit, setTab }) {
  const [tosAgreed, setTosAgreed] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [coiFile, setCoiFile] = useState(null);
  const [lookbookFile, setLookbookFile] = useState(null);
  const [hasDraft] = useState(() => !!localStorage.getItem(VENDOR_DRAFT_KEY));
  const [otherSubcategories, setOtherSubcategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VENDOR_DRAFT_SUBS_KEY) || '{}'); }
    catch { return {}; }
  });
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(VENDOR_DRAFT_KEY);
      return saved ? { ...DEFAULT_VENDOR_FORM, ...JSON.parse(saved) } : DEFAULT_VENDOR_FORM;
    } catch { return DEFAULT_VENDOR_FORM; }
  });
  useEffect(() => { localStorage.setItem(VENDOR_DRAFT_KEY, JSON.stringify(form)); }, [form]);
  useEffect(() => { localStorage.setItem(VENDOR_DRAFT_SUBS_KEY, JSON.stringify(otherSubcategories)); }, [otherSubcategories]);
  const clearDraft = () => {
    localStorage.removeItem(VENDOR_DRAFT_KEY);
    localStorage.removeItem(VENDOR_DRAFT_SUBS_KEY);
    setForm(DEFAULT_VENDOR_FORM);
    setOtherSubcategories({});
  };
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  return (
    <div className="form-card">
      {hasDraft && (
        <div style={{ background:'#fdf4dc', border:'1px solid #ffd966', borderRadius:8, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontSize:14, color:'#7a5a10' }}>📋 <strong>Draft restored</strong> — your previously entered information has been loaded.</div>
          <button onClick={clearDraft} style={{ background:'none', border:'1px solid #c8a84b', color:'#7a5a10', borderRadius:6, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>Clear &amp; Start Over</button>
        </div>
      )}
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
        <div className="form-group"><label>Years in Business</label>
          <select value={form.yearsActive} onChange={e=>set('yearsActive',e.target.value)}>
            <option value="">Select…</option>
            <option value="<1">Less than 1 year</option>
            <option value="1-2">1–2 years</option>
            <option value="3-5">3–5 years</option>
            <option value="6-10">6–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div className="form-group full"><label>Business Description *</label><textarea placeholder="Tell hosts what makes your business special..." value={form.description} onChange={e=>set('description',e.target.value)} /></div>
        <div className="form-group"><label>Website URL</label><input placeholder="https://yourwebsite.com" value={form.website} onChange={e=>set('website',e.target.value)} /></div>
        <div className="form-group"><label>Facebook</label><input placeholder="https://facebook.com/yourbusiness" value={form.facebook} onChange={e=>set('facebook',e.target.value)} /></div>
        <div className="form-group"><label>Instagram</label><input placeholder="https://instagram.com/yourbusiness" value={form.instagram} onChange={e=>set('instagram',e.target.value)} /></div>
        <div className="form-group"><label>TikTok</label><input placeholder="https://tiktok.com/@yourbusiness" value={form.tiktok} onChange={e=>set('tiktok',e.target.value)} /></div>
        <div className="form-group"><label>Other Social / Link</label><input placeholder="Etsy, Pinterest, etc." value={form.otherSocial} onChange={e=>set('otherSocial',e.target.value)} /></div>
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
        otherCategory={form.otherCategory} onOtherCategoryChange={v=>set('otherCategory',v)}
        otherSubcategories={otherSubcategories} onOtherSubcategoryChange={(cat,val)=>setOtherSubcategories(p=>{const n={...p};if(val===null)delete n[cat];else n[cat]=val;return n;})}
      />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Event Fit</h3>
      <CheckboxGroup label="Event Types You're Open To" options={EVENT_TYPES} selected={form.eventTypes} onChange={v=>set('eventTypes',v)} otherValue={form.otherEventType} onOtherChange={v=>set('otherEventType',v)} />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Booth & Logistics</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Do You Carry Liability Insurance?</label>
          <select value={form.insurance?'yes':'no'} onChange={e=>set('insurance',e.target.value==='yes')}>
            <option value="no">No — I do not carry liability insurance</option>
            <option value="yes">Yes — I have a certificate of insurance (COI)</option>
          </select>
          <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}>Many events require insured vendors. This shows as a badge on your profile.</div>
        </div>
        <div className="form-group"><label>Daily Booth Fee (amount willing to pay)</label>
          <select value={form.priceMax} onChange={e=>set('priceMax',+e.target.value)}>
            <option value={0}>Free / No fee</option>
            <option value={25}>$25/day</option>
            <option value={50}>$50/day</option>
            <option value={75}>$75/day</option>
            <option value={100}>$100/day</option>
            <option value={125}>$125/day</option>
            <option value={150}>$150/day</option>
            <option value={200}>$200/day</option>
            <option value={250}>$250/day</option>
            <option value={300}>$300/day</option>
            <option value={400}>$400/day</option>
            <option value={500}>$500/day</option>
            <option value={750}>$750/day</option>
            <option value={1000}>$1,000/day</option>
          </select>
        </div>
        <div className="form-group">
          <label>Minimum Purchase Requirement?</label>
          <select value={form.hasMinPurchase?'yes':'no'} onChange={e=>set('hasMinPurchase',e.target.value==='yes')}>
            <option value="no">No minimum purchase</option>
            <option value="yes">Yes — I require a minimum</option>
          </select>
          {form.hasMinPurchase && <div style={{marginTop:8}}><div style={{fontSize:12,color:'#7a6a5a',marginBottom:4}}>Minimum per customer</div><select value={form.minPurchaseAmt} onChange={e=>set('minPurchaseAmt',+e.target.value)}>{[10,15,20,25,30,40,50,75,100].map(a=><option key={a} value={a}>${a}</option>)}</select></div>}
        </div>
        <div className="form-group">
          <label>Private Event Fee?</label>
          <select value={form.chargesPrivateFee?'yes':'no'} onChange={e=>set('chargesPrivateFee',e.target.value==='yes')}>
            <option value="no">No private event fee</option>
            <option value="yes">Yes — I charge extra for private events</option>
          </select>
          {form.chargesPrivateFee && <div style={{marginTop:8}}><div style={{fontSize:12,color:'#7a6a5a',marginBottom:4}}>Private event fee</div><select value={form.privateEventFee} onChange={e=>set('privateEventFee',+e.target.value)}>{[50,75,100,125,150,200,250,300,400,500,750,1000].map(a=><option key={a} value={a}>${a}</option>)}</select></div>}
        </div>
        <div className="form-group"><label>Setup Time Needed</label>
          <select value={form.setupTime} onChange={e=>set('setupTime',+e.target.value)}>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
        <div className="form-group"><label>Table / Space Size</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
        <div className="form-group"><label>Need Electrical Access?</label><select value={form.needsElectric?'yes':'no'} onChange={e=>set('needsElectric',e.target.value==='yes')}><option value="no">No</option><option value="yes">Yes</option></select></div>
      </div>


      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Communication & Availability</h3>
      <div className="form-grid">


        <div className="form-group">
          <label>Typical Response Time</label>
          <select value={form.responseTime} onChange={e=>set('responseTime',e.target.value)}>
            <option value="fewhours">Within a few hours</option>
            <option value="24hrs">Within 24 hours</option>
            <option value="48hrs">Within 48 hours</option>
            <option value="weekends">Weekends only</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div className="form-group">
          <label>Booking Lead Time Needed</label>
          <select value={form.bookingLeadTime} onChange={e=>set('bookingLeadTime',e.target.value)}>
            <option value="1week">At least 1 week</option>
            <option value="2weeks">At least 2 weeks</option>
            <option value="1month">At least 1 month</option>
            <option value="2months">2+ months</option>
            <option value="flexible">Flexible — last minute is fine</option>
          </select>
        </div>

        <div className="form-group">
          <label>How Often Do You Want to Vend?</label>
          <select value={form.eventFrequency} onChange={e=>set('eventFrequency',e.target.value)}>
            <option value="fewyear">A few times a year</option>
            <option value="monthly">About once a month</option>
            <option value="biweekly">2–3 times a month</option>
            <option value="weekly">Weekly</option>
            <option value="asmany">As many as possible</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div className="form-group">
          <label>New Event Match Notifications</label>
          <select value={form.emailFrequency} onChange={e=>set('emailFrequency',e.target.value)}>
            <option value="instant">As soon as a match is posted</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly roundup</option>
            <option value="biweekly">Every two weeks</option>
            <option value="monthly">Monthly only</option>
            <option value="none">Don't email me — I'll check manually</option>
          </select>
          <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}>When new events matching your categories and location are posted from Facebook or other sources, how often would you like to be notified?</div>
        </div>

      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Documents & Photos</h3>
      <div className="form-grid">
        <div className="form-group"><label>Business Photos</label><UploadZone label="Photos" accept="image/*" hint="JPG, PNG — up to 6 photos of products, booth, or branding" multiple onChange={files => setPhotoFiles(files.slice(0,6))} /></div>
        {form.insurance && (
          <div className="form-group"><label>Certificate of Insurance</label><UploadZone label="Insurance COI" accept=".pdf,image/*" hint="PDF or image — required for many events" onChange={file => setCoiFile(file)} /></div>
        )}
        <div className="form-group full"><label>Price Menu / Lookbook (Optional)</label><UploadZone label="Price Sheet / Lookbook" accept=".pdf,image/*" hint="PDF — helps hosts understand your offerings" onChange={file => setLookbookFile(file)} /></div>
      </div>

      

      {showTos && <TosModal onClose={()=>setShowTos(false)} />}
      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that contacting or booking hosts discovered through this platform outside of South Jersey Vendor Market within 12 months is prohibited and subject to a finder's fee.</span>
        </label>
        <button className="btn-submit" disabled={submitting} onClick={async ()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} localStorage.removeItem(VENDOR_DRAFT_KEY); localStorage.removeItem(VENDOR_DRAFT_SUBS_KEY); setSubmitting(true); await onSubmit(form, { photoFiles, coiFile, lookbookFile }); setSubmitting(false); }} style={{ opacity: tosAgreed&&!submitting?1:0.5 }}>{submitting ? 'Submitting…' : 'Submit Vendor Profile →'}</button>
        <p style={{ fontSize:13, color:'#a89a8a', marginTop:12 }}>Your profile will be reviewed within 24 hours. <strong style={{ color:'#e8c97a' }}>Pay nothing until your first booking!</strong> Then just $15/month.</p>
      </div>
    </div>
  );
}

// ─── Host Form ────────────────────────────────────────────────────────────────
const HOST_DRAFT_KEY      = 'sjvm_host_draft';
const HOST_DRAFT_SUBS_KEY = 'sjvm_host_draft_subs';
const DEFAULT_HOST_FORM = {
  orgName:'', contactName:'', email:'', phone:'',
  eventName:'', eventType:'', eventZip:'', address:'',
  date:'', startTime:'', endTime:'',
  isRecurring:false, recurrenceFrequency:'weekly', recurrenceDay:'Saturday', recurrenceWeekInterval:1, recurrenceMonthType:'dayofweek', recurrenceMonthWeek:'1st', recurrenceMonthDay:'Saturday', recurrenceEndType:'never', recurrenceEndDate:'', recurrenceCount:4, recurrenceNotes:'',
  expectedAttendance:'', indoorOutdoor:'outdoor',
  vendorCategories:[], vendorSubcategories:[], vendorCount:5,
  electricAvailable:true, tableProvided:false, allowDuplicateCategories:true,
  budget:'', isTicketedEvent:false, otherEventType:'', otherVendorCategory:'', notes:'', fullServiceBooking:false
};

function HostForm({ onSubmit, setTab }) {
  const [tosAgreed, setTosAgreed] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [hasDraft] = useState(() => !!localStorage.getItem(HOST_DRAFT_KEY));
  const [otherSubcategories, setOtherSubcategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HOST_DRAFT_SUBS_KEY) || '{}'); }
    catch { return {}; }
  });
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(HOST_DRAFT_KEY);
      return saved ? { ...DEFAULT_HOST_FORM, ...JSON.parse(saved) } : DEFAULT_HOST_FORM;
    } catch { return DEFAULT_HOST_FORM; }
  });
  useEffect(() => { localStorage.setItem(HOST_DRAFT_KEY, JSON.stringify(form)); }, [form]);
  useEffect(() => { localStorage.setItem(HOST_DRAFT_SUBS_KEY, JSON.stringify(otherSubcategories)); }, [otherSubcategories]);
  const clearDraft = () => {
    localStorage.removeItem(HOST_DRAFT_KEY);
    localStorage.removeItem(HOST_DRAFT_SUBS_KEY);
    setForm(DEFAULT_HOST_FORM);
    setOtherSubcategories({});
  };
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  return (
    <div className="form-card">
      {hasDraft && (
        <div style={{ background:'#fdf4dc', border:'1px solid #ffd966', borderRadius:8, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontSize:14, color:'#7a5a10' }}>📋 <strong>Draft restored</strong> — your previously entered information has been loaded.</div>
          <button onClick={clearDraft} style={{ background:'none', border:'1px solid #c8a84b', color:'#7a5a10', borderRadius:6, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>Clear &amp; Start Over</button>
        </div>
      )}
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
        {form.eventType === 'Other' && (
          <div className="form-group" style={{marginTop:-4}}>
            <input placeholder="Please describe your event type..." value={form.otherEventType} onChange={e=>set('otherEventType',e.target.value)}
              style={{border:'1.5px solid #c8a84b',borderRadius:8,padding:'9px 12px',fontSize:14,fontFamily:'DM Sans,sans-serif',width:'100%',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />
          </div>
        )}
        <ZipInput label="Event Zip Code *" value={form.eventZip} onChange={v=>set('eventZip',v)} hint="Vendors whose travel radius covers this zip will be matched to your event" />
        <div className="form-group"><label>Venue Address</label><input placeholder="Street address" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
        <div className="form-group"><label>Event Date *</label><input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>set('date',e.target.value)} /></div>
        <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)} /></div>
        <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>set('endTime',e.target.value)} /></div>
        <div className="form-group full">
          <label>Recurring Event?</label>
          <select value={form.isRecurring?'yes':'no'} onChange={e=>set('isRecurring',e.target.value==='yes')}>
            <option value="no">No — one-time event</option>
            <option value="yes">Yes — this event repeats</option>
          </select>
        </div>
        {form.isRecurring && (
          <div className="form-group full" style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'18px 20px',marginTop:4}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:14}}>Recurrence Settings</div>
            <div className="form-grid" style={{gap:12}}>

              <div className="form-group">
                <label>Repeats</label>
                <select value={form.recurrenceFrequency} onChange={e=>set('recurrenceFrequency',e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom interval</option>
                </select>
              </div>

              {form.recurrenceFrequency === 'weekly' && (
                <div className="form-group">
                  <label>Day of Week</label>
                  <select value={form.recurrenceDay} onChange={e=>set('recurrenceDay',e.target.value)}>
                    {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {form.recurrenceFrequency === 'biweekly' && (
                <div className="form-group">
                  <label>Day of Week</label>
                  <select value={form.recurrenceDay} onChange={e=>set('recurrenceDay',e.target.value)}>
                    {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {form.recurrenceFrequency === 'custom' && (
                <div className="form-group">
                  <label>Repeat Every</label>
                  <select value={form.recurrenceWeekInterval} onChange={e=>set('recurrenceWeekInterval',+e.target.value)}>
                    {[1,2,3,4,6,8,12].map(n=><option key={n} value={n}>Every {n} week{n>1?'s':''}</option>)}
                  </select>
                </div>
              )}

              {form.recurrenceFrequency === 'monthly' && (<>
                <div className="form-group">
                  <label>Monthly Type</label>
                  <select value={form.recurrenceMonthType} onChange={e=>set('recurrenceMonthType',e.target.value)}>
                    <option value="dayofweek">By day of week (e.g. 1st Saturday)</option>
                    <option value="dateofmonth">By date (e.g. 15th of each month)</option>
                    <option value="lastday">Last day of month</option>
                    <option value="lastweekday">Last weekday of month</option>
                  </select>
                </div>
                {form.recurrenceMonthType === 'dayofweek' && (<>
                  <div className="form-group">
                    <label>Which Week</label>
                    <select value={form.recurrenceMonthWeek} onChange={e=>set('recurrenceMonthWeek',e.target.value)}>
                      {['1st','2nd','3rd','4th','Last'].map(w=><option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select value={form.recurrenceMonthDay} onChange={e=>set('recurrenceMonthDay',e.target.value)}>
                      {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                </>)}
                {form.recurrenceMonthType === 'dateofmonth' && (
                  <div className="form-group">
                    <label>Day of Month</label>
                    <select value={form.recurrenceMonthWeek} onChange={e=>set('recurrenceMonthWeek',e.target.value)}>
                      {Array.from({length:28},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}{(n>=11&&n<=13)?'th':(['st','nd','rd'][(n%10)-1]||'th')}</option>)}
                    </select>
                  </div>
                )}
              </>)}

              <div className="form-group">
                <label>Ends</label>
                <select value={form.recurrenceEndType} onChange={e=>set('recurrenceEndType',e.target.value)}>
                  <option value="never">Never (ongoing)</option>
                  <option value="after">After a number of occurrences</option>
                  <option value="ondate">On a specific date</option>
                </select>
              </div>

              {form.recurrenceEndType === 'after' && (
                <div className="form-group">
                  <label>Number of Occurrences</label>
                  <select value={form.recurrenceCount} onChange={e=>set('recurrenceCount',+e.target.value)}>
                    {[2,3,4,5,6,8,10,12,16,20,24,26,52].map(n=><option key={n} value={n}>{n} times</option>)}
                  </select>
                </div>
              )}

              {form.recurrenceEndType === 'ondate' && (
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.recurrenceEndDate} onChange={e=>set('recurrenceEndDate',e.target.value)} />
                </div>
              )}

              <div className="form-group full">
                <label>Recurrence Notes (optional)</label>
                <input placeholder="e.g. Skipping July 4th weekend, indoor during winter months..." value={form.recurrenceNotes} onChange={e=>set('recurrenceNotes',e.target.value)} />
              </div>

              <div className="form-group full">
                <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#1a4a6b'}}>
                  📅 <strong>Summary: </strong>
                  {form.recurrenceFrequency==='daily' && 'Repeats every day'}
                  {form.recurrenceFrequency==='weekly' && `Repeats every ${form.recurrenceDay}`}
                  {form.recurrenceFrequency==='biweekly' && `Repeats every other ${form.recurrenceDay}`}
                  {form.recurrenceFrequency==='custom' && `Repeats every ${form.recurrenceWeekInterval} weeks`}
                  {form.recurrenceFrequency==='monthly' && form.recurrenceMonthType==='dayofweek' && `Repeats ${form.recurrenceMonthWeek} ${form.recurrenceMonthDay} of each month`}
                  {form.recurrenceFrequency==='monthly' && form.recurrenceMonthType==='dateofmonth' && `Repeats on the ${form.recurrenceMonthWeek} of each month`}
                  {form.recurrenceFrequency==='monthly' && form.recurrenceMonthType==='lastday' && 'Repeats on the last day of each month'}
                  {form.recurrenceFrequency==='monthly' && form.recurrenceMonthType==='lastweekday' && 'Repeats on the last weekday of each month'}
                  {form.recurrenceEndType==='never' && ' · Ongoing'}
                  {form.recurrenceEndType==='after' && ` · Ends after ${form.recurrenceCount} occurrences`}
                  {form.recurrenceEndType==='ondate' && form.recurrenceEndDate && ` · Ends ${form.recurrenceEndDate}`}
                </div>
              </div>

            </div>
          </div>
        )}
        <div className="form-group"><label>Expected Attendance</label><select value={form.expectedAttendance} onChange={e=>set('expectedAttendance',e.target.value)}><option value="">Estimate...</option><option>Under 50</option><option>50–150</option><option>150–300</option><option>300–500</option><option>500+</option></select></div>
        <div className="form-group"><label>Indoor or Outdoor?</label><select value={form.indoorOutdoor} onChange={e=>set('indoorOutdoor',e.target.value)}><option value="outdoor">Outdoor</option><option value="indoor">Indoor</option><option value="both">Mixed</option></select></div>
        <div className="form-group"><label>Number of Vendor Spots</label><select value={form.vendorCount} onChange={e=>set('vendorCount',+e.target.value)}><option value={1}>1 vendor</option><option value={2}>2 vendors</option><option value={3}>3 vendors</option><option value={4}>4 vendors</option><option value={5}>5 vendors</option><option value={6}>6 vendors</option><option value={7}>7 vendors</option><option value={8}>8 vendors</option><option value={10}>10 vendors</option><option value={12}>12 vendors</option><option value={15}>15 vendors</option><option value={20}>20 vendors</option><option value={25}>25 vendors</option><option value={30}>30 vendors</option><option value={40}>40 vendors</option><option value={50}>50 vendors</option><option value={75}>75 vendors</option><option value={100}>100+ vendors</option></select></div>
        <div className="form-group"><label>Electricity Available?</label><select value={form.electricAvailable?'yes':'no'} onChange={e=>set('electricAvailable',e.target.value==='yes')}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div className="form-group"><label>Tables Provided by Host?</label><select value={form.tableProvided?'yes':'no'} onChange={e=>set('tableProvided',e.target.value==='yes')}><option value="no">No — vendors bring their own</option><option value="yes">Yes — we provide tables</option></select></div>
        <div className="form-group"><label>Allow Multiple Vendors in Same Category?</label><select value={form.allowDuplicateCategories?'yes':'no'} onChange={e=>set('allowDuplicateCategories',e.target.value==='yes')}><option value="yes">Yes — multiple vendors per category OK</option><option value="no">No — one vendor per category only</option></select></div>
        <div className="form-group"><label>Vendor Booth Fee Offered</label><select value={form.budget} onChange={e=>set('budget',e.target.value)}><option value="">Select...</option><option>Free (vendor keeps all sales)</option><option>$25–$50/vendor</option><option>$50–$100/vendor</option><option>$100–$200/vendor</option><option>$200+/vendor</option></select></div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Vendor Categories You Need</h3>
      <p style={{ color:'#7a6a5a', fontSize:14, marginBottom:16 }}>Select the categories and specific types of vendors you want at your event.</p>
      <CategorySubcategoryPicker
        categories={form.vendorCategories}
        subcategories={form.vendorSubcategories}
        onCategoriesChange={v=>set('vendorCategories',v)}
        onSubcategoriesChange={v=>set('vendorSubcategories',v)}
        otherCategory={form.otherVendorCategory} onOtherCategoryChange={v=>set('otherVendorCategory',v)}
        otherSubcategories={otherSubcategories} onOtherSubcategoryChange={(cat,val)=>setOtherSubcategories(p=>{const n={...p};if(val===null)delete n[cat];else n[cat]=val;return n;})}
      />

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Full Service Booking</h3>
      <div
        onClick={()=>set('fullServiceBooking',!form.fullServiceBooking)}
        style={{
          background: form.fullServiceBooking ? '#1a1410' : '#fff',
          border: `2px solid ${form.fullServiceBooking ? '#e8c97a' : '#e8ddd0'}`,
          borderRadius:12, padding:'20px 24px', cursor:'pointer', transition:'all 0.2s', marginBottom:16
        }}>
        <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',margin:0}}>
          <input type="checkbox" checked={form.fullServiceBooking} onChange={e=>set('fullServiceBooking',e.target.checked)}
            style={{width:20,height:20,marginTop:2,flexShrink:0,accentColor:'#e8c97a'}} />
          <div>
            <div style={{fontWeight:700,fontSize:16,color:form.fullServiceBooking?'#e8c97a':'#1a1410',marginBottom:4}}>
              Let us handle everything
            </div>
            <div style={{fontSize:13,color:form.fullServiceBooking?'#c8b898':'#7a6a5a',lineHeight:1.5}}>
              Our team will select, contact, confirm, and coordinate all vendors for your event. You sit back and relax — we'll handle the rest. A flat concierge fee applies.
            </div>
          </div>
        </label>
      </div>
      {form.fullServiceBooking && (
        <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#7a5a10',lineHeight:1.5}}>
          <strong>How it works:</strong> After you submit, our team will review your event details, hand-pick the best vendors, and handle all outreach and confirmations on your behalf. We'll reach out within 24 hours to discuss your event and our concierge fee.
        </div>
      )}
      <div className="form-group" style={{ marginTop:4 }}>
        <label>Additional Notes</label>
        <textarea placeholder={form.fullServiceBooking ? "Tell us about your vision — theme, vibe, budget, anything that helps us pick the perfect vendors..." : "Anything else vendors or our team should know..."} value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>
      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that vendors discovered through this platform may not be contacted or booked outside of South Jersey Vendor Market within 12 months without a finder's fee.</span>
        </label>
        {showTos && <TosModal onClose={()=>setShowTos(false)} />}
        <button className="btn-submit" onClick={()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} localStorage.removeItem(HOST_DRAFT_KEY); localStorage.removeItem(HOST_DRAFT_SUBS_KEY); onSubmit(form); }} style={{ opacity: tosAgreed?1:0.5 }}>Find My Vendors →</button>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ v, contacted, setContacted, showDist, outOfRange, openMessage, sendBookingRequest, bookingRequests, hostEvent, setTab, vendorCalendars, setVendorCalendars }) {
  const req = bookingRequests && bookingRequests.find(r => r.vendorId === v.id);
  return (
    <div className="vendor-card">
      <div className="vendor-card-top">
        {v.emoji}
        <div className="match-score">{v.matchScore}% match</div>
      </div>
      <div className="vendor-card-body">
        <div className="vendor-name">{v.name}</div>
        <div className="vendor-category">
          {(v.allCategories || [v.category]).length > 1
            ? `${v.category} +${(v.allCategories || [v.category]).length - 1} more`
            : v.category}
        </div>
        <div className="vendor-tags">
          {v.tags.map(t=><span key={t} className="vendor-tag">{t}</span>)}
          {v.insurance && <span className="vendor-tag" style={{ background:'#d4f4e0', color:'#1a6b3a', borderColor:'#b8e8c8' }}>✓ Insured</span>}
        </div>
        <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.5, marginBottom:10 }}>{v.description}</p>
        <div className="vendor-meta">
          <div className="vendor-location">📍 {v.homeZip} · travels {v.radius}mi</div>
        </div>
        {showDist && (
          outOfRange
            ? <div className="vendor-no-match">✗ {v.dist!==null?`${v.dist.toFixed(1)} mi away`:'distance unknown'} — outside travel range</div>
            : <div className="vendor-distance">✓ {v.dist!==null?`${v.dist.toFixed(1)} mi from your event`:'within range (zip unverified)'}</div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:10}}>
          {hostEvent && sendBookingRequest && (
            req ? (
              <div style={{
                padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:600, textAlign:'center',
                background: req.status==='accepted'?'#d4f4e0': req.status==='declined'?'#fdecea':'#fdf4dc',
                color: req.status==='accepted'?'#1a6b3a': req.status==='declined'?'#8b1a1a':'#7a5a10',
                border: '1px solid ' + (req.status==='accepted'?'#b8e8c8': req.status==='declined'?'#f5c6c6':'#ffd966')
              }}>
                {req.status==='pending' && '⏳ Request Sent — Awaiting Response'}
                {req.status==='accepted' && '✅ Booking Accepted! Check Messages.'}
                {req.status==='declined' && '❌ Vendor Declined — Try Another Vendor'}
                {req.status==='cancelled' && '↩ Request Cancelled'}
              </div>
            ) : (
              <button className="contact-btn" style={{background:'#c8a84b',color:'#1a1410',fontWeight:700,fontSize:13}} onClick={()=>sendBookingRequest(v, hostEvent)}>
                📋 Request to Book
              </button>
            )
          )}
          {!hostEvent && sendBookingRequest && (
            <div style={{fontSize:12,color:'#a89a8a',textAlign:'center',padding:'6px 0'}}>
              <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:12,fontFamily:'DM Sans,sans-serif'}} onClick={()=>setTab('host')}>Post your event first</button> to request bookings
            </div>
          )}
          <div style={{display:'flex',gap:6}}>
            {openMessage && <button className="contact-btn" style={{flex:2,background:'#1a1410',color:'#e8c97a',fontSize:12}} onClick={()=>openMessage(v)}>💬 Message</button>}
            <button className="contact-btn" style={{flex:1,background:contacted.includes(v.id)?'#1a6b3a':'#f5f0ea',color:contacted.includes(v.id)?'#fff':'#1a1410',border:'1px solid #e0d5c5',fontSize:12}} onClick={()=>setContacted(c=>c.includes(v.id)?c:[...c,v.id])}>
              {contacted.includes(v.id)?'✓ Saved':'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Host Success + Matched Vendors ──────────────────────────────────────────
function HostSuccessMatches({ hostEvent, hostConfirm, vendors, openMessage, sendBookingRequest, bookingRequests, setTab, vendorCalendars, setVendorCalendars, onSubmitAnother }) {
  const [contacted, setContacted] = useState([]);
  const neededCats = hostEvent?.vendorCategories || [];
  const eventZip   = hostEvent?.eventZip || '';
  const hasZip     = isValidZip(eventZip) && isKnownZip(eventZip);

  const matched = vendors
    .filter(v => neededCats.length === 0 || (v.allCategories || [v.category]).some(c => neededCats.includes(c)))
    .map(v => {
      const dist    = hasZip ? distanceMiles(v.homeZip, eventZip) : null;
      const inRange = !hasZip ? true : (dist === null ? true : dist <= v.radius);
      return { ...v, dist, inRange };
    })
    .filter(v => v.inRange)
    .sort((a, b) => (a.dist ?? 999) - (b.dist ?? 999));

  return (
    <div>
      <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:12,padding:'24px 28px',marginBottom:32}}>
        <div style={{fontSize:32,marginBottom:8}}>✅</div>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:24,color:'#1a6b3a',marginBottom:8}}>Event submitted!</h2>
        <p style={{fontSize:14,color:'#2d7a50',marginBottom:4}}>
          <strong>{hostConfirm?.eventName}</strong> has been received. Ref: <strong>{hostConfirm?.ref}</strong>
        </p>
        <p style={{fontSize:13,color:'#2d7a50',marginBottom:16}}>A confirmation was sent to {hostConfirm?.email}</p>
        {hostEvent?.fullServiceBooking && (
          <div style={{background:'#1a1410',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#e8c97a',lineHeight:1.5}}>
            <strong>Concierge Request received!</strong> Our team will review your event and reach out within 24 hours to discuss vendor selection and coordination.
          </div>
        )}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>setTab('host-calendar')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            📅 View My Event Calendar
          </button>
          <button onClick={onSubmitAnother} style={{background:'none',border:'1.5px solid #1a6b3a',color:'#1a6b3a',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            + Submit Another Event
          </button>
        </div>
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:22,marginBottom:6}}>
        {matched.length > 0
          ? `${matched.length} Vendor${matched.length !== 1 ? 's' : ''} Match Your Event`
          : 'No Matching Vendors Yet'}
      </h3>
      <p style={{fontSize:14,color:'#7a6a5a',marginBottom:20}}>
        {neededCats.length > 0
          ? `Vendors in ${neededCats.join(', ')} within travel range of ${eventZip}.`
          : `All approved vendors within travel range of ${eventZip}.`}
        {' '}Send a booking request to any vendor below.
      </p>

      {matched.length === 0
        ? <div className="empty-state"><div className="big">🔍</div><p>No approved vendors match your categories yet — check back as more sign up!</p></div>
        : <div className="vendor-grid">
            {matched.map(v => (
              <VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />
            ))}
          </div>
      }
    </div>
  );
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function MatchesPage({ vendors=[], openMessage, sendBookingRequest, bookingRequests, setBookingRequests, hostEvent, setTab, vendorCalendars, setVendorCalendars }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInsurance, setFilterInsurance] = useState('');
  const [hostZip, setHostZip] = useState(hostEvent?.eventZip || '');
  const [contacted, setContacted] = useState([]);
  const hasZip = hostZip.length === 5 && isValidZip(hostZip);

  const enriched = vendors
    .filter(v => !filterCategory  || (v.allCategories || [v.category]).includes(filterCategory))
    .filter(v => !filterInsurance || (filterInsurance==='yes' ? v.insurance : !v.insurance))
    .map(v => {
      const dist    = hasZip ? distanceMiles(v.homeZip, hostZip) : null;
      const inRange = !hasZip ? true : (dist === null ? true : dist <= v.radius);
      return { ...v, dist, inRange };
    });

  const inRange  = enriched.filter(v => v.inRange).sort((a,b)=>(a.dist??999)-(b.dist??999)||b.matchScore-a.matchScore);
  const outRange = enriched.filter(v => !v.inRange);

  return (
    <div className="section" style={{ maxWidth:1060 }}>
      <div className="section-title">Vendor Directory</div>
      <p className="section-sub">Browse all active South Jersey vendors. Enter your event zip code to see who can travel to you.</p>
      <div className="match-filters">
        <div className="match-filter-group" style={{ maxWidth:200 }}>
          <label>{hostEvent ? 'Event Zip Code' : 'My Zip Code'}</label>
          <input placeholder="e.g. 08033" value={hostZip} maxLength={5} onChange={e=>setHostZip(e.target.value.replace(/\D/g,'').slice(0,5))} />
          {hasZip && <div className={`zip-feedback ${isKnownZip(hostZip)?'zip-ok':'zip-warn'}`}>{isKnownZip(hostZip)?'✓ Showing vendors in range':'⚠ Zip unverified — results may vary'}</div>}
          {!hostEvent && !hasZip && <div style={{fontSize:11,color:'#a89a8a',marginTop:2}}>Enter zip to filter by distance</div>}
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
        : <div className="vendor-grid">{inRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />)}</div>
      }

      {hasZip && outRange.length>0 && (
        <>
          <div style={{ marginTop:48, marginBottom:16, borderTop:'2px dashed #e0d5c5', paddingTop:32 }}>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:4 }}>Outside Travel Range</div>
            <p style={{ fontSize:14, color:'#a89a8a' }}>These vendors are beyond their stated travel radius for zip {hostZip}.</p>
          </div>
          <div className="vendor-grid" style={{ opacity:0.5 }}>
            {outRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist outOfRange openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />)}
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
      <h3 style={{ fontSize:13, marginBottom:8, color:'#7a6a5a', letterSpacing:1, textTransform:'uppercase' }}>FOR VENDORS</h3>
      <div className="info-box" style={{ marginBottom:20 }}>🎉 <strong>Pay nothing until your first booking!</strong> After that, just $15/month — cancel anytime.</div>
      <div className="pricing-grid" style={{ marginBottom:48 }}>
        <div className="pricing-card">
          <div className="pricing-type">Vendor</div><div className="pricing-name">Basic Listing</div>
          <div className="pricing-price">$15</div><div className="pricing-period">per month</div>
          <ul className="pricing-features"><li>Profile in vendor directory</li><li>Photo gallery (up to 6)</li><li>Insurance & doc uploads</li><li>Matched to events in your radius</li><li>Lead notifications by email</li></ul>
        </div>
        <div className="pricing-card featured">
          <div className="pricing-badge">MOST POPULAR</div>
          <div className="pricing-type">Vendor</div><div className="pricing-name">Featured</div>
          <div className="pricing-price">$25</div><div className="pricing-period">per month — or $250/year</div>
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
const ADMIN_PW = process.env.REACT_APP_ADMIN_PASSWORD || 'sjvm-admin-2026';

function AdminPage({ opps=[], setOpps=()=>{}, vendorSubs=[], vendors=[], setVendors=()=>{}, pendingVendors=[], setPendingVendors=()=>{} }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('sjvm_admin') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  const attemptUnlock = () => {
    if (pw === ADMIN_PW) { sessionStorage.setItem('sjvm_admin','1'); setUnlocked(true); }
    else { setPwError(true); setPw(''); }
  };

  if (!unlocked) {
    return (
      <div className="section" style={{maxWidth:420,textAlign:'center'}}>
        <div className="section-title">Admin Access</div>
        <div style={{background:'#fff',border:'1.5px solid #e8ddd0',borderRadius:14,padding:32,marginTop:16}}>
          <div style={{fontSize:36,marginBottom:12}}>🔒</div>
          <p style={{color:'#7a6a5a',fontSize:14,marginBottom:20}}>Enter the admin password to continue.</p>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}}
            onKeyDown={e=>{ if(e.key==='Enter') attemptUnlock(); }}
            placeholder="Password"
            style={{width:'100%',border:`1.5px solid ${pwError?'#c0392b':'#e0d5c5'}`,borderRadius:8,padding:'10px 14px',
              fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',marginBottom:8,outline:'none'}} />
          {pwError && <div style={{color:'#c0392b',fontSize:12,marginBottom:8}}>Incorrect password.</div>}
          <button onClick={attemptUnlock}
            style={{width:'100%',background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,
              padding:'11px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ maxWidth:1000 }}>
      <div className="section-title">Admin Dashboard</div>
      <p className="section-sub">Manage vendors, hosts, and bookings across South Jersey.</p>
      <div className="admin-grid">
        <div className="admin-stat"><div className="admin-stat-num">{opps.length}</div><div className="admin-stat-label">Live Opportunities</div></div>
        <div className="admin-stat"><div className="admin-stat-num" style={{color:'#c8a84b'}}>{opps.filter(o=>o.source==='Concierge Request').length}</div><div className="admin-stat-label">Concierge Requests</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{pendingVendors.length}</div><div className="admin-stat-label">Pending Review</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{vendors.length}</div><div className="admin-stat-label">Approved Vendors</div></div>
      </div>
      <AdminPostForm onPost={async opp => {
        const { data, error } = await supabase.from('events').insert({
          event_name:        opp.eventName,
          event_type:        opp.eventType,
          zip:               opp.zip,
          date:              opp.date,
          start_time:        opp.startTime  || null,
          end_time:          opp.endTime    || null,
          booth_fee:         opp.boothFee,
          spots:             opp.spots      || 0,
          categories_needed: opp.categoriesNeeded,
          contact_name:      opp.contactName,
          contact_email:     opp.contactEmail,
          contact_phone:     opp.contactPhone,
          fb_link:           opp.fbLink,
          deadline:          opp.deadline   || null,
          notes:             opp.notes,
          source:            opp.source     || "Admin",
          photo_url:         opp.photoUrl   || null,
        }).select().single();
        if (error) { console.error('Error posting event:', error); return false; }
        setOpps(prev => [dbEventToApp(data), ...prev]);
        return true;
      }} />
      {opps.filter(o=>o.source==='Concierge Request').length > 0 && (
        <>
          <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Concierge Requests</h3>
          <p style={{fontSize:13,color:'#7a5a10',marginBottom:12}}>These hosts requested full-service vendor coordination. Reach out within 24 hours.</p>
          <table className="admin-table" style={{border:'2px solid #e8c97a'}}>
            <thead><tr style={{background:'#1a1410'}}><th style={{color:'#e8c97a'}}>Event</th><th style={{color:'#e8c97a'}}>Type</th><th style={{color:'#e8c97a'}}>Contact</th><th style={{color:'#e8c97a'}}>Zip</th><th style={{color:'#e8c97a'}}>Date</th><th style={{color:'#e8c97a'}}>Categories</th><th style={{color:'#e8c97a'}}>Status</th></tr></thead>
            <tbody>
              {opps.filter(o=>o.source==='Concierge Request').map(o=>(
                <tr key={o.id} style={{background:'#fdf9f0'}}>
                  <td><strong>{o.eventName}</strong></td>
                  <td>{o.eventType}</td>
                  <td>{o.contactName}<br/><span style={{fontSize:11,color:'#7a6a5a'}}>{o.contactEmail}</span></td>
                  <td>{o.zip}</td>
                  <td>{fmtDate(o.date)}</td>
                  <td style={{fontSize:12}}>{(o.categoriesNeeded||[]).join(', ')||'—'}</td>
                  <td><span style={{background:'#1a1410',color:'#e8c97a',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>Concierge</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Live Opportunities</h3>
      {opps.length===0
        ? <div className="empty-state"><div className="big">&#128221;</div><p>No opportunities posted yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Event</th><th>Type</th><th>Zip</th><th>Date</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {opps.map(o=>(
                <tr key={o.id} style={o.source==='Concierge Request'?{background:'#fdf9f0'}:{}}>
                  <td><strong>{o.eventName}</strong></td><td>{o.eventType}</td><td>{o.zip}</td>
                  <td>{fmtDate(o.date)}</td><td>{o.source}</td>
                  <td>{o.source==='Concierge Request'
                    ? <span style={{background:'#1a1410',color:'#e8c97a',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700}}>Concierge</span>
                    : <span className="status-pill status-active">Live</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
      }
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Pending Vendor Applications</h3>
      {pendingVendors.length===0
        ? <div className="empty-state"><div className="big">✅</div><p>No pending vendor submissions.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Business</th><th>Owner</th><th>Email</th><th>Home Zip</th><th>Radius</th><th>Categories</th><th>Actions</th></tr></thead>
            <tbody>
              {pendingVendors.map(v=>(
                <tr key={v.id}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.contact_name||"—"}</td>
                  <td>{v.contact_email||"—"}</td>
                  <td>{v.home_zip}</td>
                  <td>{v.radius} mi</td>
                  <td>{(v.metadata?.allCategories||[v.category]).join(", ")||"—"}</td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button
                      onClick={async()=>{
                        const{error}=await supabase.from('vendors').update({status:'approved'}).eq('id',v.id);
                        if(error){alert('Error approving vendor. Please try again.');return;}
                        setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                        setVendors(prev=>[dbVendorToApp({...v,status:'approved'}), ...prev]);
                      }}
                      style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,cursor:'pointer',marginRight:6,fontFamily:'DM Sans,sans-serif'}}>
                      ✓ Approve
                    </button>
                    <button
                      onClick={async()=>{
                        if(!window.confirm(`Reject "${v.name}"? This cannot be undone.`))return;
                        const{error}=await supabase.from('vendors').update({status:'rejected'}).eq('id',v.id);
                        if(error){alert('Error rejecting vendor. Please try again.');return;}
                        setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                      }}
                      style={{background:'#c62828',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                      ✗ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      }
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

  const todayStr = new Date().toISOString().split('T')[0];
  const list = opps
    .filter(o => o.date >= todayStr)
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
          <div className="results-count"><strong>{list.length}</strong> upcoming opportunities</div>
          <div style={{ fontSize:13, color:"#a89a8a" }}>Past events hidden</div>
        </div>
        {list.length===0
          ? <div className="empty-state"><div className="big">📭</div><p>No opportunities match your filters.</p></div>
          : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24 }}>
            {list.map(opp => (
              <div key={opp.id} style={{ background:"#fff", border:"1px solid #e8ddd0", borderRadius:12, overflow:"hidden", transition:"all 0.2s" }}>
                {opp.photoUrl && (
                  <div style={{ position:'relative', height:160, overflow:'hidden' }}>
                    <img src={opp.photoUrl} alt={opp.eventName}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(26,20,16,0.7) 100%)' }} />
                    <div style={{ position:'absolute', bottom:10, left:14,
                      display:'inline-block', background:'#e8c97a', color:'#1a1410',
                      fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase',
                      padding:'3px 10px', borderRadius:20 }}>{opp.source}</div>
                  </div>
                )}
                <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"20px 24px" }}>
                  {!opp.photoUrl && <div style={{ display:"inline-block", background:"#e8c97a", color:"#1a1410", fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, marginBottom:10 }}>{opp.source}</div>}
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, color:"#fff", marginBottom:4, lineHeight:1.3 }}>{opp.eventName}</div>
                  <div style={{ fontSize:12, color:"#a89a8a", letterSpacing:"1px", textTransform:"uppercase" }}>{opp.eventType}</div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <div className="ometa-grid">
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
  const blank = { eventName:"", eventType:"", zip:"", date:"", startTime:"", endTime:"", boothFee:"", spots:"", categoriesNeeded:[], contactName:"", contactEmail:"", contactPhone:"", fbLink:"", deadline:"", notes:"", source:"Facebook Group", photoUrl:"" };
  const [form, setForm] = useState(blank);
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.eventName||!form.eventType||!form.zip||!form.date) { alert("Please fill in Event Name, Type, Zip Code, and Date."); return; }
    setPosting(true); setPostError(false);
    const ok = await onPost({...form, id:Date.now(), spots:parseInt(form.spots)||0});
    setPosting(false);
    if (ok) { setForm(blank); setPosted(true); setTimeout(()=>setPosted(false),4000); }
    else { setPostError(true); setTimeout(()=>setPostError(false),6000); }
  };

  return (
    <div style={{ background:"#fff", border:"2px solid #e8c97a", borderRadius:12, padding:32, marginBottom:40 }}>
      <div style={{ fontFamily:"Playfair Display,serif", fontSize:22, marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
        Post New Opportunity
        <span style={{ display:"inline-block", background:"#e8c97a", color:"#1a1410", fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20 }}>Admin Only</span>
      </div>
      <p style={{ color:"#7a6a5a", fontSize:14, marginBottom:24 }}>Post events from Facebook or approved hosts — they go live immediately on the Opportunities board.</p>
      {posted    && <div style={{ background:"#d4f4e0", border:"1px solid #b8e8c8", borderRadius:8, padding:"12px 16px", marginBottom:20, color:"#1a6b3a", fontWeight:600 }}>✓ Posted! Now live on the Opportunities board.</div>}
      {postError && <div style={{ background:"#fdecea", border:"1px solid #f5c6c6", borderRadius:8, padding:"12px 16px", marginBottom:20, color:"#8b1a1a", fontWeight:600 }}>✗ Failed to post. Check your connection and try again.</div>}
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
      <div className="form-group full" style={{ marginTop:8 }}>
        <label>Event Photo URL (optional)</label>
        <input type="url" placeholder="https://example.com/event-photo.jpg"
          value={form.photoUrl} onChange={e=>set("photoUrl",e.target.value)} />
        <div style={{ fontSize:12, color:'#7a6a5a', marginTop:4 }}>
          Paste a direct image link (Imgur, Google Drive share link, etc.). Shown on the opportunity card.
        </div>
        {form.photoUrl && (
          <img src={form.photoUrl} alt="Preview"
            style={{ marginTop:8, maxHeight:120, borderRadius:8, border:'1px solid #e8ddd0', display:'block' }}
            onError={e=>{ e.target.style.display='none'; }} />
        )}
      </div>
      <div style={{ marginTop:24 }}>
        <button className="btn-submit" onClick={submit} disabled={posting}
          style={{ opacity: posting ? 0.7 : 1 }}>
          {posting ? 'Posting…' : 'Post to Opportunities Board'}
        </button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [vendorSuccess, setVendorSuccess] = useState(false);
  const [vendorConfirm, setVendorConfirm] = useState(null); // { ref, email, name }
  const [hostSuccess,   setHostSuccess]   = useState(false);
  const [hostConfirm,   setHostConfirm]   = useState(null); // { ref, email, eventName }
  const [hostEvent,     setHostEvent]     = useState(null);
  const [vendors, setVendors] = useState([]);
  const [opps, setOpps] = useState([]);
  const [vendorSubs, setVendorSubs] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);

  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [{ data: vendorRows, error: vErr }, { data: eventRows, error: eErr }] = await Promise.all([
        supabase.from('vendors').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }),
      ]);
      if (vErr) { console.error('Failed to load vendors:', vErr); setLoadError('Could not load vendor data. Please refresh.'); }
      else if (vendorRows) setVendors(vendorRows.map(dbVendorToApp));

      // Load pending vendors for admin review
      const { data: pendingRows } = await supabase.from('vendors').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      if (pendingRows) setPendingVendors(pendingRows);
      if (eErr) { console.error('Failed to load events:', eErr); setLoadError('Could not load event data. Please refresh.'); }
      else if (eventRows) setOpps(eventRows.map(dbEventToApp));

      // Load booking requests for this browser session from Supabase
      const sid = getSessionId();
      const { data: brRows, error: brErr } = await supabase
        .from('booking_requests').select('*').eq('session_id', sid).order('created_at', { ascending: false });
      if (brErr) console.error('Failed to load booking requests:', brErr);
      else if (brRows && brRows.length > 0) {
        setBookingRequests(brRows.map(r => ({
          id: r.id, vendorId: r.vendor_id, vendorName: r.vendor_name,
          vendorEmoji: r.vendor_emoji, vendorCategory: r.vendor_category,
          hostName: r.host_name, hostEmail: r.host_email,
          eventName: r.event_name, eventType: r.event_type,
          eventZip: r.event_zip, eventDate: r.event_date,
          startTime: r.start_time, endTime: r.end_time, address: r.address,
          attendance: r.attendance, vendorCount: r.vendor_count,
          budget: r.budget, notes: r.notes,
          isRecurring: r.is_recurring, recurrenceFrequency: r.recurrence_frequency,
          recurrenceDay: r.recurrence_day, recurrenceEndType: r.recurrence_end_type,
          recurrenceEndDate: r.recurrence_end_date, recurrenceCount: r.recurrence_count,
          recurrenceNotes: r.recurrence_notes,
          categoriesNeeded: r.categories_needed || [], subcategoriesNeeded: r.subcategories_needed || [],
          status: r.status, sentAt: r.sent_at, respondedAt: r.responded_at,
          vendorMessage: r.vendor_message || '',
        })));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Conversations: persist to localStorage so they survive page refresh
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CONVERSATIONS_LS_KEY) || '[]'); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(CONVERSATIONS_LS_KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  const [activeConvoId, setActiveConvoId] = useState(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [calendarVendorId, setCalendarVendorId] = useState(() => localStorage.getItem('sjvm_calendar_vendor_id') || null);

  // Vendor calendars: persist to localStorage
  const [vendorCalendars, setVendorCalendars] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VENDOR_CALS_LS_KEY) || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(VENDOR_CALS_LS_KEY, JSON.stringify(vendorCalendars)); } catch {}
  }, [vendorCalendars]);

  const sendBookingRequest = async (vendor, eventDetails) => {
    const req = {
      id: Date.now(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmoji: vendor.emoji,
      vendorCategory: vendor.category,
      hostName: eventDetails.contactName || 'Host',
      hostEmail: eventDetails.email || '',
      eventName: eventDetails.eventName || '',
      eventType: eventDetails.eventType || '',
      eventZip: eventDetails.eventZip || '',
      eventDate: eventDetails.date || '',
      startTime: eventDetails.startTime || '',
      endTime: eventDetails.endTime || '',
      address: eventDetails.address || '',
      attendance: eventDetails.expectedAttendance || '',
      vendorCount: eventDetails.vendorCount || '',
      budget: eventDetails.budget || '',
      notes: eventDetails.notes || '',
      isRecurring: eventDetails.isRecurring || false,
      recurrenceFrequency: eventDetails.recurrenceFrequency || '',
      recurrenceDay: eventDetails.recurrenceDay || '',
      recurrenceEndType: eventDetails.recurrenceEndType || '',
      recurrenceEndDate: eventDetails.recurrenceEndDate || '',
      recurrenceCount: eventDetails.recurrenceCount || '',
      recurrenceNotes: eventDetails.recurrenceNotes || '',
      categoriesNeeded: eventDetails.vendorCategories || [],
      subcategoriesNeeded: eventDetails.vendorSubcategories || [],
      status: 'pending',
      sentAt: new Date().toISOString(),
      respondedAt: null,
      vendorMessage: '',
    };
    setBookingRequests(r => [req, ...r]);
    // Persist to Supabase so the request survives page refreshes
    const { error: brErr } = await supabase.from('booking_requests').insert({
      id: req.id, session_id: getSessionId(),
      vendor_id: req.vendorId, vendor_name: req.vendorName,
      vendor_emoji: req.vendorEmoji, vendor_category: req.vendorCategory,
      host_name: req.hostName, host_email: req.hostEmail,
      event_name: req.eventName, event_type: req.eventType,
      event_zip: req.eventZip, event_date: req.eventDate,
      start_time: req.startTime, end_time: req.endTime, address: req.address,
      attendance: req.attendance, vendor_count: req.vendorCount,
      budget: req.budget, notes: req.notes,
      is_recurring: req.isRecurring, recurrence_frequency: req.recurrenceFrequency,
      recurrence_day: req.recurrenceDay, recurrence_end_type: req.recurrenceEndType,
      recurrence_end_date: req.recurrenceEndDate || null,
      recurrence_count: req.recurrenceCount, recurrence_notes: req.recurrenceNotes,
      categories_needed: req.categoriesNeeded, subcategories_needed: req.subcategoriesNeeded,
      status: req.status, sent_at: req.sentAt,
    });
    if (brErr) console.error('Failed to persist booking request:', brErr);
    openMessage(vendor);
  };

  const openMessage = (vendor) => {
    const existing = conversations.find(c => c.vendorId === vendor.id);
    if (existing) { setActiveConvoId(existing.id); setTab("messages"); return; }
    const newConvo = {
      id: Date.now(), vendorId: vendor.id, vendorName: vendor.name,
      vendorEmoji: vendor.emoji, vendorCategory: vendor.category,
      hostName: "You (Host)", status: "active",
      messages: [{
        id: 1, from: "system", text: `Conversation started with ${vendor.name}. This is a protected platform conversation — contact info is shared only after a booking is confirmed through South Jersey Vendor Market.`, ts: new Date().toISOString()
      }]
    };
    setConversations(c => [newConvo, ...c]);
    setActiveConvoId(newConvo.id);
    setTab("messages");
  };

  const handleVendorSubmit = async (form, files = {}) => {
    if (!form.businessName || !form.email || form.categories.length === 0) {
      alert("Please fill in Business Name, Email, and at least one Category.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (form.phone && form.phone.replace(/\D/g,'').length < 10) {
      alert("Please enter a valid 10-digit phone number, or leave it blank.");
      return;
    }
    if (!form.homeZip || !/^\d{5}$/.test(form.homeZip)) {
      alert("Please enter a valid 5-digit home zip code.");
      return;
    }
    // Check for duplicate vendor email
    const { data: existing } = await supabase.from('vendors').select('id').eq('contact_email', form.email).limit(1);
    if (existing && existing.length > 0) {
      if (!window.confirm('A vendor profile with this email already exists. Submit another profile anyway?')) return;
    }
    const metadataPayload = {
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
      otherSocial: form.otherSocial || null,
      responseTime: form.responseTime,
      bookingLeadTime: form.bookingLeadTime,
      eventFrequency: form.eventFrequency,
      setupTime: form.setupTime,
      tableSize: form.tableSize,
      needsElectric: form.needsElectric,
      yearsActive: form.yearsActive || null,
      allCategories: form.categories,
    };
    const { data: newVendor, error } = await supabase.from('vendors').insert({
      name:                form.businessName,
      contact_name:        form.ownerName     || null,
      category:            form.categories[0],
      subcategories:       form.subcategories || [],
      home_zip:            form.homeZip,
      radius:              form.radius,
      tags:                form.eventTypes    || [],
      description:         form.description,
      insurance:           form.insurance,
      has_min_purchase:    form.hasMinPurchase,
      min_purchase_amt:    form.minPurchaseAmt  || 0,
      charges_private_fee: form.chargesPrivateFee,
      private_event_fee:   form.privateEventFee || 0,
      contact_email:       form.email,
      contact_phone:       form.phone       || null,
      website:             form.website     || null,
      instagram:           form.instagram   || null,
      metadata:            metadataPayload,
    }).select('id').single();
    if (error) {
      console.error('Vendor submit error:', error);
      alert(`Submission failed: ${error.message}\n\nIf this keeps happening, please contact support@sjvendormarket.com`);
      return;
    }

    // Upload files to Supabase Storage
    if (newVendor?.id) {
      const bucket = 'vendor-files';
      const vid = newVendor.id;
      const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const uploadFile = async (file, path) => {
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) { console.error('File upload error:', upErr); return null; }
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      };
      const { photoFiles = [], coiFile = null, lookbookFile = null } = files;
      const fileUrls = {};
      if (photoFiles.length > 0) {
        const urls = await Promise.all(photoFiles.map((f, i) => uploadFile(f, `${vid}/photos/${i}-${safeName(f.name)}`)));
        fileUrls.photoUrls = urls.filter(Boolean);
      }
      if (coiFile) {
        const url = await uploadFile(coiFile, `${vid}/coi/${safeName(coiFile.name)}`);
        if (url) fileUrls.coiUrl = url;
      }
      if (lookbookFile) {
        const url = await uploadFile(lookbookFile, `${vid}/lookbook/${safeName(lookbookFile.name)}`);
        if (url) fileUrls.lookbookUrl = url;
      }
      if (Object.keys(fileUrls).length > 0) {
        const { error: metaErr } = await supabase.from('vendors').update({ metadata: { ...metadataPayload, ...fileUrls } }).eq('id', vid);
        if (metaErr) console.error('Failed to save file URLs:', metaErr);
      }
      setCalendarVendorId(vid);
      localStorage.setItem('sjvm_calendar_vendor_id', vid);
    }

    setVendorSubs(v => [form, ...v]);
    if (newVendor?.id) {
      setPendingVendors(p => [{ id: newVendor.id, name: form.businessName, contact_name: form.ownerName, category: form.categories[0], home_zip: form.homeZip, radius: form.radius, contact_email: form.email, contact_phone: form.phone, status: 'pending', created_at: new Date().toISOString(), metadata: { allCategories: form.categories }, subcategories: form.subcategories || [] }, ...p]);
    }
    setVendorConfirm({ ref: generateRef(), email: form.email, name: form.businessName });
    setVendorSuccess(true);
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const handleHostSubmit = async form => {
    if (!form.contactName || !form.email || !form.eventType) {
      alert('Please fill in Contact Name, Email, and Event Type.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (form.phone && form.phone.replace(/\D/g,'').length < 10) {
      alert('Please enter a valid 10-digit phone number, or leave it blank.');
      return;
    }
    if (!form.date) {
      alert('Please select an event date.');
      return;
    }
    if (form.date < new Date().toISOString().split('T')[0]) {
      alert('Event date cannot be in the past.');
      return;
    }
    if (!form.eventZip || !/^\d{5}$/.test(form.eventZip)) {
      alert('Please enter a valid 5-digit event zip code.');
      return;
    }
    if (form.isRecurring) {
      if (!form.recurrenceFrequency) {
        alert('Please select how often the event recurs.');
        return;
      }
      if (form.recurrenceEndType === 'date' && !form.recurrenceEndDate) {
        alert('Please select an end date for your recurring event series.');
        return;
      }
      if (form.recurrenceEndType === 'count' && (!form.recurrenceCount || Number(form.recurrenceCount) < 1)) {
        alert('Please enter a valid number of occurrences (minimum 1).');
        return;
      }
      if (form.recurrenceFrequency === 'monthly' && form.recurrenceMonthType === 'dayofweek' && !form.recurrenceMonthDay) {
        alert('Please select the day of the week for your monthly recurring event.');
        return;
      }
    }
    const { error: eventErr } = await supabase.from('events').insert({
      event_name: form.eventName || form.eventType,
      event_type: form.eventType,
      zip: form.eventZip,
      date: form.date,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      booth_fee: form.budget || null,
      spots: form.vendorCount || null,
      categories_needed: form.vendorCategories || [],
      contact_name: form.contactName,
      contact_email: form.email,
      contact_phone: form.phone || null,
      notes: form.notes || null,
      source: form.fullServiceBooking ? 'Concierge Request' : 'Host Submitted',
      allow_duplicate_categories: form.allowDuplicateCategories,
    });
    if (eventErr) {
      console.error('Event submit error:', eventErr);
      alert(`Failed to submit event: ${eventErr.message}\n\nPlease try again or contact support@sjvendormarket.com`);
      return;
    }
    setHostEvent(form);
    setHostConfirm({ ref: generateRef(), email: form.email, eventName: form.eventName || form.eventType });
    setHostSuccess(true);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {loadError && (
          <div style={{background:'#fdecea',borderBottom:'2px solid #f5c6c6',padding:'10px 20px',
            fontSize:13,color:'#8b1a1a',fontWeight:600,textAlign:'center',zIndex:200,position:'relative'}}>
            ⚠ {loadError}
          </div>
        )}
        <nav className="nav">
          <div className="nav-logo"><span className="nav-logo-cursive">South Jersey</span><span className="nav-logo-serif">Vendor Market</span></div>
          <div className="nav-tabs">
            <button className={`nav-tab${tab==="home"?" active":""}`} onClick={()=>{setTab("home");window.scrollTo({top:0});}}>Home</button>
            <div className="nav-group">
              <div className="nav-group-label">&#128717; Vendors</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="vendor"?" active":""}`} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Join as Vendor</button>
                <button className={`nav-tab${tab==="opportunities"?" active":""}`} onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Opportunities</button>
                <button className={`nav-tab${tab==="calendar"?" active":""}`} onClick={()=>{setTab("calendar");window.scrollTo({top:0});}}>My Calendar</button>
              </div>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">&#127918; Hosts</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="host"?" active":""}`} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Post Event</button>
                <button className={`nav-tab${tab==="matches"?" active":""}`} onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Browse Vendors</button>
                <button className={`nav-tab${tab==="messages"?" active":""}`} onClick={()=>{setTab("messages");window.scrollTo({top:0});}}>
                  Messages{(()=>{const p=bookingRequests.filter(r=>r.status==='pending').length;return p>0?` (${p} pending)`:conversations.length>0?` (${conversations.length})`:"";})()}
                </button>
                <button className={`nav-tab${tab==="host-calendar"?" active":""}`} onClick={()=>{setTab("host-calendar");window.scrollTo({top:0});}}>My Calendar</button>
              </div>
            </div>
            <button className={`nav-tab${tab==="pricing"?" active":""}`} onClick={()=>{setTab("pricing");window.scrollTo({top:0});}}>Pricing</button>
            <button className={`nav-tab${tab==="tos"?" active":""}`} onClick={()=>{setTab("tos");window.scrollTo({top:0});}}>Terms</button>
            <button className={`nav-tab${tab==="admin"?" active":""}`} onClick={()=>{setTab("admin");window.scrollTo({top:0});}}>Admin</button>
          </div>
        </nav>

        {tab==='home' && (
          <>
            <div className="hero">
              <h1 style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,marginBottom:8}}>
                  <span style={{fontFamily:"'Corinthia', cursive",fontSize:'clamp(56px,8vw,96px)',color:'#e8c97a',lineHeight:1.1,fontWeight:700,letterSpacing:'0px'}}>South Jersey</span>
                  <span style={{fontFamily:"'Playfair Display', serif",fontSize:'clamp(28px,4vw,48px)',color:'#fff',letterSpacing:2,fontWeight:700,textTransform:'uppercase'}}>Vendor Market</span>
                </h1>
              <p style={{fontSize:16,color:'#c8b89a',maxWidth:560,margin:'0 auto 32px',lineHeight:1.7}}>Connecting vendors and events across South Jersey and Beyond</p>
              <div style={{ display:"flex", gap:16, justifyContent:"center", alignItems:"stretch", maxWidth:900, margin:"0 auto", flexWrap:"wrap", position:"relative" }}>
                <div style={{ flex:1, minWidth:280, padding:"32px 40px", textAlign:"left", background:"rgba(255,255,255,.05)", borderRadius:8, border:"1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize:11, letterSpacing:"3px", textTransform:"uppercase", color:"#e8c97a", marginBottom:8 }}>&#128717; For Vendors</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:"#fff", marginBottom:8 }}>Find Events Near You</div>
                  <div style={{ color:"#a89a8a", fontSize:14, lineHeight:1.6, marginBottom:20 }}>Enter your home zip, set your travel radius, and get matched with events that come to you.</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <button className="btn-primary" onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Join as a Vendor</button>
                    <button className="btn-outline" onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Browse Opportunities</button>
                  </div>
                  <div style={{ marginTop:14, fontSize:12, color:"#e8c97a", fontWeight:600 }}>Pay nothing until your first booking!!</div>
                </div>
                <div style={{ flex:1, minWidth:280, padding:"32px 40px", textAlign:"left", background:"rgba(255,255,255,.05)", borderRadius:8, border:"1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize:11, letterSpacing:"3px", textTransform:"uppercase", color:"#e8c97a", marginBottom:8 }}>&#127918; For Event Hosts</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:26, color:"#fff", marginBottom:8 }}>Find Vendors for Your Event</div>
                  <div style={{ color:"#a89a8a", fontSize:14, lineHeight:1.6, marginBottom:20 }}>Enter your event zip code and we instantly match and deliver a curated vendor list — you book directly.</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <button className="btn-primary" onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Post Your Event</button>
                    <button className="btn-outline" onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Browse Vendors</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-bar">
              <div className="stat"><div className="stat-num">{vendors.length || '—'}</div><div className="stat-label">Active Vendors</div></div>
              <div className="stat"><div className="stat-num">{CATEGORIES.length - 1}</div><div className="stat-label">Categories</div></div>
              <div className="stat"><div className="stat-num">{EVENT_TYPES.length - 1}</div><div className="stat-label">Event Types</div></div>
              <div className="stat"><div className="stat-num">{opps.length || '—'}</div><div className="stat-label">Live Events</div></div>
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
              <div style={{ marginTop:48, display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}><button className="btn-submit" onClick={()=>setTab('vendor')}>Join as a Vendor →</button><button className="btn-submit" style={{ background:'#e8c97a', color:'#1a1410' }} onClick={()=>setTab('host')}>Post Your Event →</button></div>
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
                  <p>Your vendor profile has been submitted and is under review. We'll activate your listing within <span className="success-highlight">24 hours</span>.</p>
                  {vendorConfirm && (
                    <div style={{ marginTop:20, background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'16px 20px', display:'inline-block', minWidth:280 }}>
                      <div style={{ fontSize:12, color:'#a89a8a', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Confirmation Number</div>
                      <div style={{ fontSize:22, fontWeight:700, color:'#e8c97a', letterSpacing:3, marginBottom:12 }}>{vendorConfirm.ref}</div>
                      <div style={{ fontSize:13, color:'#a89a8a', marginBottom:12 }}>Save this for your records.</div>
                      <a href={`mailto:${vendorConfirm.email}?subject=Your SJVM Vendor Registration — ${vendorConfirm.ref}&body=Hi ${vendorConfirm.name},%0A%0AThank you for registering with South Jersey Vendor Market!%0A%0AYour confirmation number is: ${vendorConfirm.ref}%0A%0AWhat happens next:%0A• Your listing will be reviewed within 24 hours%0A• You'll be matched with nearby events automatically%0A• Check Messages for booking requests from hosts%0A%0A— South Jersey Vendor Market%0Asupport@sjvendormarket.com`}
                        style={{ display:'inline-block', background:'#e8c97a', color:'#1a1410', padding:'9px 20px', borderRadius:6, fontSize:13, fontWeight:700, textDecoration:'none', fontFamily:'DM Sans,sans-serif' }}>
                        📧 Email yourself a copy
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ background:'#fff', border:'1px solid #e8ddd0', borderRadius:10, padding:'24px 28px', marginTop:24 }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, marginBottom:16 }}>What happens next</div>
                  {[
                    { icon:'🔍', title:'Profile Review', desc:"Our team reviews your submission within 24 hours and activates your listing." },
                    { icon:'📅', title:'Event Matching', desc:"When a host posts an event in your area and categories, you'll appear in their vendor list." },
                    { icon:'💬', title:'Booking Requests', desc:"Hosts send booking requests directly through the platform. Check your Messages tab." },
                  ].map(s => (
                    <div key={s.title} style={{ display:'flex', gap:14, marginBottom:16 }}>
                      <div style={{ fontSize:24, flexShrink:0 }}>{s.icon}</div>
                      <div><div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{s.title}</div><div style={{ fontSize:13, color:'#7a6a5a' }}>{s.desc}</div></div>
                    </div>
                  ))}
                </div>
                <button className="btn-submit" style={{ marginTop:20 }} onClick={()=>{setVendorSuccess(false);setVendorConfirm(null);}}>Submit Another Profile</button>
              </>
            ) : (
              <>
                <div className="section-title">Vendor Registration</div>
                <p className="section-sub">Join South Jersey's growing vendor community and get matched with events near you.</p>
                <VendorForm onSubmit={handleVendorSubmit} setTab={setTab} />
              </>
            )}
          </div>
        )}

        {tab==='host' && (
          <div className="section" style={{maxWidth: hostSuccess ? 1060 : undefined}}>
            {hostSuccess ? (
              <HostSuccessMatches
                hostEvent={hostEvent}
                hostConfirm={hostConfirm}
                vendors={vendors}
                openMessage={openMessage}
                sendBookingRequest={sendBookingRequest}
                bookingRequests={bookingRequests}
                setTab={setTab}
                vendorCalendars={vendorCalendars}
                setVendorCalendars={setVendorCalendars}
                onSubmitAnother={() => { setHostSuccess(false); setHostEvent(null); setHostConfirm(null); }}
              />
            ) : (
              <>
                <div className="section-title">Host an Event</div>
                <p className="section-sub">Tell us about your event and we'll find the perfect vendors for you.</p>
                <HostForm onSubmit={handleHostSubmit} setTab={setTab} />
              </>
            )}
          </div>
        )}

        {tab==="matches"      && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading vendors…</div>
          : <MatchesPage vendors={vendors} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />)}
        {tab==="opportunities" && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading events…</div>
          : <OpportunitiesPage opps={opps} />)}
        {tab==="pricing"       && <PricingPage setTab={setTab} />}
        {tab==="admin"         && <AdminPage opps={opps} setOpps={setOpps} vendorSubs={vendorSubs} vendors={vendors} setVendors={setVendors} pendingVendors={pendingVendors} setPendingVendors={setPendingVendors} />}
        {tab==="messages"      && <MessagesPage conversations={conversations} setConversations={setConversations} activeConvoId={activeConvoId} setActiveConvoId={setActiveConvoId} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} />}
        {tab==="tos"           && <TosPage setTab={setTab} />}
        {tab==="calendar"      && <VendorCalendarPage vendorId={calendarVendorId} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />}
        {tab==="host-calendar" && <HostCalendarPage hostEvent={hostEvent} bookingRequests={bookingRequests} setTab={setTab} hostConfirm={hostConfirm} clearHostConfirm={()=>setHostConfirm(null)} />}
      </div>
    </>
  );
}

// ─── Messages Page ────────────────────────────────────────────────────────────
function MessagesPage({ conversations, setConversations, activeConvoId, setActiveConvoId, bookingRequests, setBookingRequests }) {
  const [draft, setDraft] = useState('');
  const [senderName, setSenderName] = useState('');
  const messagesEndRef = useRef(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages?.length]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    if (!senderName.trim()) { alert('Please enter your name before sending.'); return; }
    setConversations(convos => convos.map(c => {
      if (c.id !== activeConvoId) return c;
      return {
        ...c,
        messages: [...c.messages, {
          id: Date.now(), from: 'host', senderName, text: draft.trim(),
          ts: new Date().toISOString()
        }]
      };
    }));
    setDraft('');
  };

  const fmtTs = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const respondToBooking = async (reqId, status, vendorMsg='') => {
    const respondedAt = new Date().toISOString();
    // Persist status change to Supabase first
    const { error } = await supabase.from('booking_requests')
      .update({ status, vendor_message: vendorMsg, responded_at: respondedAt })
      .eq('id', reqId);
    if (error) {
      console.error('Failed to update booking request status:', error);
      alert('Failed to update booking status. Please try again.');
      return;
    }
    // Only update UI after DB confirms
    setBookingRequests(reqs => reqs.map(r =>
      r.id === reqId ? {...r, status, vendorMessage: vendorMsg, respondedAt} : r
    ));
    // Add system message to conversation thread
    const req = bookingRequests.find(r => r.id === reqId);
    if (req) {
      setConversations(convos => convos.map(c => {
        if (c.vendorId !== req.vendorId) return c;
        const msg = status === 'accepted'
          ? `✅ Booking accepted! ${vendorMsg ? 'Vendor note: ' + vendorMsg : ''} The host will be in touch to confirm details. You're all set for ${req.eventName || 'the event'}!`
          : `❌ Booking declined. ${vendorMsg ? 'Reason: ' + vendorMsg : 'The vendor is unavailable for this date.'} We recommend messaging other vendors.`;
        return {...c, status: status==='accepted'?'booked':'active', messages: [...c.messages, {id:Date.now(), from:'system', text: msg, ts:new Date().toISOString()}]};
      }));
    }
  };

  const pendingRequests = (bookingRequests||[]).filter(r => r.status === 'pending');

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)', background:'#f5f0ea', overflow:'hidden' }}>

      {/* Booking Requests Panel */}
      {(bookingRequests||[]).length > 0 && (
        <div style={{ background:'#1a1410', borderBottom:'2px solid #c8a84b', padding:'12px 20px', flexShrink:0, overflowX:'auto' }}>
          <div style={{ fontSize:12, color:'#c8a84b', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>
            Booking Requests {pendingRequests.length > 0 && <span style={{background:'#c8a84b',color:'#1a1410',borderRadius:10,padding:'1px 7px',marginLeft:6}}>{pendingRequests.length} pending</span>}
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {(bookingRequests||[]).map(req => (
              <BookingRequestCard key={req.id} req={req} respondToBooking={respondToBooking} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

      {/* Sidebar */}
      <div style={{ width:280, minWidth:220, background:'#1a1410', display:'flex', flexDirection:'column', borderRight:'1px solid #2d2118', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid #2d2118' }}>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#e8c97a', marginBottom:4 }}>Messages</div>
          <div style={{ fontSize:12, color:'#7a6a5a' }}>{conversations.length} conversation{conversations.length!==1?'s':''}</div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {conversations.length === 0 && (
            <div style={{ padding:24, color:'#7a6a5a', fontSize:13, textAlign:'center', lineHeight:1.6 }}>
              No conversations yet.<br/>Browse vendors and click<br/>"Message Vendor" to start.
            </div>
          )}
          {conversations.map(c => (
            <div key={c.id}
              onClick={() => setActiveConvoId(c.id)}
              style={{ padding:'14px 16px', cursor:'pointer', borderBottom:'1px solid #2d2118',
                background: c.id === activeConvoId ? '#2d2118' : 'transparent',
                transition:'background 0.15s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <span style={{ fontSize:22 }}>{c.vendorEmoji}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{c.vendorName}</div>
                  <div style={{ fontSize:11, color:'#7a6a5a', textTransform:'uppercase', letterSpacing:1 }}>{c.vendorCategory}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#a89a8a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {c.messages[c.messages.length - 1]?.text?.slice(0, 50)}...
              </div>
              <div style={{ fontSize:11, color:'#4a3a28', marginTop:4 }}>
                {c.status === 'active' ? '🟢 Active' : c.status === 'booked' ? '✅ Booked' : '⏸ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {!activeConvo ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, color:'#a89a8a' }}>
          <div style={{ fontSize:48 }}>💬</div>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#1a1410' }}>Select a conversation</div>
          <div style={{ fontSize:14 }}>Choose a vendor from the left to view your messages</div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Chat header */}
          <div style={{ background:'#fff', borderBottom:'1px solid #e8ddd0', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:28 }}>{activeConvo.vendorEmoji}</span>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#1a1410' }}>{activeConvo.vendorName}</div>
                <div style={{ fontSize:12, color:'#a89a8a', textTransform:'uppercase', letterSpacing:1 }}>{activeConvo.vendorCategory}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {['active','pending','booked'].map(s => (
                <button key={s} onClick={() => setConversations(cs => cs.map(c => c.id===activeConvoId ? {...c,status:s} : c))}
                  style={{ background: activeConvo.status===s ? '#e8c97a' : '#f5f0ea', border:'1px solid #e0d5c5',
                    borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer',
                    fontFamily:'DM Sans,sans-serif', color: activeConvo.status===s ? '#1a1410' : '#7a6a5a', textTransform:'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform protection notice */}
          <div style={{ background:'#fdf9f5', borderBottom:'1px solid #e8ddd0', padding:'7px 24px', fontSize:12, color:'#7a6a5a', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            🔒 <strong>Secure platform messaging.</strong> Contact info is shared only after a booking is confirmed. All interactions are covered by our <a href="#tos" style={{color:'#c8a84b',textDecoration:'none',fontWeight:600}} onClick={e=>{e.preventDefault();}}>Terms of Service</a>.
          </div>

          {/* Messages — msg.text is rendered as JSX text (React-escaped), not innerHTML — XSS safe */}
          <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:12 }}>
            {activeConvo.messages.map(msg => (
              <div key={msg.id} style={{
                display:'flex',
                flexDirection: msg.from==='system' ? 'column' : msg.from==='host' ? 'flex-end' : 'flex-start',
                alignItems: msg.from==='system' ? 'center' : undefined
              }}>
                {msg.from === 'system' && (
                  <div style={{ background:'#f5f0ea', border:'1px solid #e8ddd0', borderRadius:8, padding:'8px 16px', fontSize:12, color:'#7a6a5a', maxWidth:480, textAlign:'center' }}>
                    {msg.text}
                  </div>
                )}
                {msg.from !== 'system' && (
                  <div style={{ maxWidth:'70%' }}>
                    <div style={{ fontSize:11, color:'#a89a8a', marginBottom:3, textAlign: msg.from==='host' ? 'right' : 'left' }}>
                      {msg.senderName || (msg.from==='vendor' ? activeConvo.vendorName : 'You')} · {fmtTs(msg.ts)}
                    </div>
                    <div style={{
                      background: msg.from==='host' ? '#1a1410' : '#fff',
                      color: msg.from==='host' ? '#e8c97a' : '#1a1410',
                      border: '1px solid ' + (msg.from==='host' ? '#1a1410' : '#e8ddd0'),
                      borderRadius: msg.from==='host' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding:'10px 14px', fontSize:14, lineHeight:1.6
                    }}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ background:'#fff', borderTop:'1px solid #e8ddd0', padding:16, flexShrink:0 }}>
            <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
              <div style={{ fontSize:12, color:'#7a6a5a', whiteSpace:'nowrap' }}>Sending as:</div>
              <input value={senderName} onChange={e=>setSenderName(e.target.value)}
                placeholder="Your name" maxLength={50}
                style={{ flex:1, border:'1px solid #e0d5c5', borderRadius:6, padding:'6px 10px', fontSize:13, fontFamily:'DM Sans,sans-serif', background:'#fdf9f5', outline:'none' }} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <textarea value={draft} onChange={e=>setDraft(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }}}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ flex:1, border:'1.5px solid #e0d5c5', borderRadius:8, padding:'10px 14px', fontSize:14, fontFamily:'DM Sans,sans-serif', resize:'none', outline:'none', background:'#fdf9f5' }} />
              <button onClick={sendMessage}
                style={{ background:'#1a1410', color:'#e8c97a', border:'none', borderRadius:8, padding:'0 20px', fontSize:20, cursor:'pointer', flexShrink:0 }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize:11, color:'#a89a8a', marginTop:6 }}>
              💡 Keep all booking conversations here to stay protected under the Non-Circumvention Agreement.
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── Terms of Service Page ───────────────────────────────────────────────────
function TosPage({ setTab }) {
  return (
    <div className="section" style={{ maxWidth:860 }}>
      <div className="section-title">Terms of Service</div>
      <p className="section-sub">South Jersey Vendor Market Platform Agreement — effective upon registration</p>

      {TOS_SECTIONS.map(({ title, body }) => (
        <div key={title} style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#1a1410', marginBottom:8 }}>{title}</div>
          {body.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize:14, color:'#5a4a3a', lineHeight:1.8, marginBottom:8 }}>{para}</p>
          ))}
        </div>
      ))}

      <div style={{ background:'#1a1410', borderRadius:10, padding:'28px 32px', marginTop:32, textAlign:'center' }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#e8c97a', marginBottom:8 }}>Questions about our Terms?</div>
        <p style={{ color:'#a89a8a', fontSize:14, marginBottom:16 }}>Contact us at support@sjvendormarket.com</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-primary" onClick={()=>setTab('vendor')}>Join as a Vendor</button>
          <button className="btn-outline" onClick={()=>setTab('host')}>Post Your Event</button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Request Card ─────────────────────────────────────────────────────
function BookingRequestCard({ req, respondToBooking }) {
  const [expanded, setExpanded] = useState(false);
  const [vendorMsg, setVendorMsg] = useState('');
  const [responding, setResponding] = useState(null); // 'accept' | 'decline'

  const statusColors = {
    pending:  { bg:'#fdf4dc', color:'#7a5a10', border:'#ffd966', label:'⏳ Pending' },
    accepted: { bg:'#d4f4e0', color:'#1a6b3a', border:'#b8e8c8', label:'✅ Accepted' },
    declined: { bg:'#fdecea', color:'#8b1a1a', border:'#f5c6c6', label:'❌ Declined' },
    cancelled:{ bg:'#f0f0f0', color:'#7a7a7a', border:'#d0d0d0', label:'↩ Cancelled' },
  };
  const sc = statusColors[req.status] || statusColors.pending;

  return (
    <div style={{ background:'#2d2118', borderRadius:10, border:'1px solid #3d3020', minWidth:240, maxWidth:320, padding:'12px 14px', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>{req.vendorEmoji}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{req.vendorName}</div>
            <div style={{ fontSize:11, color:'#7a6a5a' }}>{req.vendorCategory}</div>
          </div>
        </div>
        <span style={{ background:sc.bg, color:sc.color, border:'1px solid '+sc.border, borderRadius:10, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{sc.label}</span>
      </div>

      <div style={{ fontSize:12, color:'#a89a8a', marginBottom:6 }}>
        {req.eventName && <span>📅 {req.eventName}</span>}
        {req.eventDate && <span style={{marginLeft:8}}>· {req.eventDate}</span>}
      </div>

      <button onClick={()=>setExpanded(e=>!e)} style={{ background:'none', border:'none', color:'#c8a84b', fontSize:12, cursor:'pointer', padding:0, fontFamily:'DM Sans,sans-serif', textDecoration:'underline' }}>
        {expanded ? 'Hide details ▲' : 'View event details ▼'}
      </button>

      {expanded && (
        <div style={{ marginTop:10, fontSize:12, color:'#d0c8b8', lineHeight:1.8, borderTop:'1px solid #3d3020', paddingTop:10 }}>
          {req.hostName    && <div><strong style={{color:'#c8a84b'}}>Host:</strong> {req.hostName}</div>}
          {req.hostEmail   && <div><strong style={{color:'#c8a84b'}}>Email:</strong> {req.hostEmail}</div>}
          {req.eventType   && <div><strong style={{color:'#c8a84b'}}>Event type:</strong> {req.eventType}</div>}
          {req.address     && <div><strong style={{color:'#c8a84b'}}>Location:</strong> {req.address}</div>}
          {req.eventZip    && <div><strong style={{color:'#c8a84b'}}>Zip:</strong> {req.eventZip}</div>}
          {req.startTime   && <div><strong style={{color:'#c8a84b'}}>Time:</strong> {req.startTime}{req.endTime?' – '+req.endTime:''}</div>}
          {req.attendance  && <div><strong style={{color:'#c8a84b'}}>Expected attendance:</strong> {req.attendance}</div>}
          {req.vendorCount && <div><strong style={{color:'#c8a84b'}}>Vendor spots:</strong> {req.vendorCount}</div>}
          {req.budget      && <div><strong style={{color:'#c8a84b'}}>Budget:</strong> {req.budget}</div>}
          {req.categoriesNeeded?.length > 0 && <div><strong style={{color:'#c8a84b'}}>Categories needed:</strong> {req.categoriesNeeded.join(', ')}</div>}
          {req.notes       && <div><strong style={{color:'#c8a84b'}}>Notes:</strong> {req.notes}</div>}
          {req.isRecurring && (
            <div style={{marginTop:6,padding:'8px 10px',background:'#1a3a28',borderRadius:6,border:'1px solid #2a5a38'}}>
              <div style={{color:'#7ab88a',fontWeight:700,marginBottom:3}}>🔁 Recurring Event</div>
              <div><strong style={{color:'#c8a84b'}}>Frequency:</strong> {req.recurrenceFrequency==='weekly'?`Every ${req.recurrenceDay}`:req.recurrenceFrequency==='biweekly'?`Every other ${req.recurrenceDay}`:req.recurrenceFrequency==='monthly'?'Monthly':req.recurrenceFrequency}</div>
              {req.recurrenceEndType==='after' && <div><strong style={{color:'#c8a84b'}}>Duration:</strong> {req.recurrenceCount} occurrences</div>}
              {req.recurrenceEndType==='ondate' && req.recurrenceEndDate && <div><strong style={{color:'#c8a84b'}}>Ends:</strong> {req.recurrenceEndDate}</div>}
              {req.recurrenceEndType==='never' && <div><strong style={{color:'#c8a84b'}}>Ends:</strong> Ongoing</div>}
              {req.recurrenceNotes && <div><strong style={{color:'#c8a84b'}}>Notes:</strong> {req.recurrenceNotes}</div>}
            </div>
          )}
        </div>
      )}

      {req.status === 'pending' && (
        <div style={{ marginTop:10 }}>
          {!responding ? (
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setResponding('accept')} style={{ flex:1, background:'#1a6b3a', color:'#fff', border:'none', borderRadius:6, padding:'7px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>✓ Accept</button>
              <button onClick={()=>setResponding('decline')} style={{ flex:1, background:'#8b1a1a', color:'#fff', border:'none', borderRadius:6, padding:'7px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>✗ Decline</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:12, color:'#a89a8a', marginBottom:6 }}>
                {responding==='accept' ? '✅ Add a message for the host (optional):' : '❌ Reason for declining (optional):'}
              </div>
              <textarea value={vendorMsg} onChange={e=>setVendorMsg(e.target.value)}
                placeholder={responding==='accept' ? "E.g. Looking forward to it! I'll arrive 30 min early to set up." : "E.g. Already booked on this date. Try reaching out for a future event!"}
                rows={2} style={{ width:'100%', border:'1px solid #3d3020', borderRadius:6, padding:'7px 9px', fontSize:12, fontFamily:'DM Sans,sans-serif', background:'#1a1410', color:'#e0d0b0', resize:'none', boxSizing:'border-box', outline:'none' }} />
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <button onClick={()=>{ respondToBooking(req.id, responding==='accept'?'accepted':'declined', vendorMsg); setResponding(null); }}
                  style={{ flex:2, background: responding==='accept'?'#1a6b3a':'#8b1a1a', color:'#fff', border:'none', borderRadius:6, padding:'7px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                  {responding==='accept'?'Confirm Acceptance':'Confirm Decline'}
                </button>
                <button onClick={()=>setResponding(null)} style={{ flex:1, background:'#3d3020', color:'#a89a8a', border:'none', borderRadius:6, padding:'7px 0', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {req.status === 'accepted' && (
        <div style={{ marginTop:8, fontSize:12, color:'#7ab88a', lineHeight:1.6 }}>
          {req.vendorMessage && <div style={{fontStyle:'italic', marginBottom:4}}>"{req.vendorMessage}"</div>}
          <div>📩 Host notified via Messages. Finalize details through the chat.</div>
        </div>
      )}

      {req.status === 'declined' && (
        <div style={{ marginTop:8, fontSize:12, color:'#c08080', lineHeight:1.6 }}>
          {req.vendorMessage && <div style={{fontStyle:'italic', marginBottom:4}}>"{req.vendorMessage}"</div>}
          <div>💬 Host was notified. They can message other vendors.</div>
        </div>
      )}
    </div>
  );
}

// ─── Vendor Calendar Page ─────────────────────────────────────────────────────
function VendorCalendarPage({ vendorId, vendorCalendars, setVendorCalendars }) {
  if (!vendorId) {
    return (
      <div style={{ textAlign:'center', padding:'80px 40px', color:'#7a6a5a' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:28, marginBottom:12, color:'#1a1410' }}>Your Vendor Calendar</div>
        <p style={{ fontSize:16, maxWidth:440, margin:'0 auto' }}>Register as a vendor to unlock your personal availability calendar and manage bookings.</p>
      </div>
    );
  }
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showIcalInfo, setShowIcalInfo] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // date string being edited
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);

  // Recurring time templates: { id, label, days:[0-6], startTime, endTime, active }
  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAYS_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const cal = vendorCalendars[vendorId] || { dates:{}, bookedDates:[] };
  // dates: { '2025-06-14': { status:'available'|'blocked', startTime:'09:00', endTime:'17:00' } }

  const setCal = (updater) => setVendorCalendars(prev => ({
    ...prev,
    [vendorId]: typeof updater === 'function'
      ? updater(prev[vendorId] || { dates:{}, bookedDates:[] })
      : updater
  }));

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth= new Date(viewYear, viewMonth+1, 0).getDate();
  const MIN_YEAR = 2024; const MAX_YEAR = today.getFullYear() + 3;
  const prevMonth  = () => { if(viewYear<=MIN_YEAR&&viewMonth===0)return; if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth  = () => { if(viewYear>=MAX_YEAR&&viewMonth===11)return; if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const dateStr    = (d) => `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const isPast     = (d) => new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDate    = (ds) => cal.dates?.[ds] || null;
  const isBooked   = (ds) => cal.bookedDates?.includes(ds);

  const fmt12 = (t) => {
    if (!t) return '';
    const [h,m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${((h%12)||12)}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  // Apply a recurring template across the current month
  const applyTemplate = (tpl) => {
    setCal(prev => {
      const dates = {...(prev.dates||{})};
      for (let d=1; d<=daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d);
        if (!tpl.days.includes(date.getDay())) continue;
        const ds = dateStr(d);
        if (prev.bookedDates?.includes(ds)) continue;
        if (isPast(d)) continue;
        dates[ds] = { status: tpl.status || 'available', startTime: tpl.allDay ? '' : tpl.startTime, endTime: tpl.allDay ? '' : tpl.endTime };
      }
      return {...prev, dates};
    });
  };

  const removeTemplate = (id) => setRecurringTemplates(t => t.filter(x => x.id !== id));

  const saveTemplate = (tpl) => {
    if (tpl.id) {
      setRecurringTemplates(t => t.map(x => x.id===tpl.id ? tpl : x));
    } else {
      setRecurringTemplates(t => [...t, {...tpl, id: Date.now()}]);
    }
    setEditingTemplate(null);
  };

  const setDateEntry = (ds, entry) => {
    setCal(prev => {
      const dates = {...(prev.dates||{})};
      if (!entry) { delete dates[ds]; }
      else { dates[ds] = entry; }
      return {...prev, dates};
    });
  };

  const availCount  = Object.values(cal.dates||{}).filter(d=>d.status==='available').length;
  const bookedCount = (cal.bookedDates||[]).length;
  const blockedCount= Object.values(cal.dates||{}).filter(d=>d.status==='blocked').length;

  const generateICal = () => {
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//South Jersey Vendor Market//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    Object.entries(cal.dates||{}).forEach(([ds,entry]) => {
      if (entry.status !== 'available') return;
      const d = ds.replace(/-/g,'');
      const summary = entry.startTime
        ? `Available ${fmt12(entry.startTime)}–${fmt12(entry.endTime)} - South Jersey Vendor Market`
        : 'Available - South Jersey Vendor Market';
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,`SUMMARY:${summary}`,`UID:avail-${d}@sjvendormarket`,'STATUS:TENTATIVE','END:VEVENT');
    });
    (cal.bookedDates||[]).forEach(ds => {
      const d = ds.replace(/-/g,'');
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,'SUMMARY:BOOKED - South Jersey Vendor Market',`UID:booked-${d}@sjvendormarket`,'STATUS:CONFIRMED','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  const downloadICal = () => {
    const blob = new Blob([generateICal()], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='sjvendormarket-calendar.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const statusStyle = (ds) => {
    if (isBooked(ds))                        return {bg:'#c8a84b', color:'#1a1410', border:'#c8a84b', label:'BOOKED'};
    const entry = getDate(ds);
    if (!entry)                              return {bg:'#f5f0ea', color:'#9a8a7a', border:'#e0d5c5', label:''};
    if (entry.status==='available')          return {bg:'#1a6b3a', color:'#fff',    border:'#1a6b3a', label:'OPEN'};
    if (entry.status==='blocked')            return {bg:'#8b1a1a', color:'#fff',    border:'#8b1a1a', label:'BUSY'};
    return                                          {bg:'#f5f0ea', color:'#9a8a7a', border:'#e0d5c5', label:''};
  };

  // ── Date Time Modal ────────────────────────────────────────────────────────
  const DateTimeModal = ({ ds, onClose }) => {
    const existing = getDate(ds) || {};
    const booked = isBooked(ds);
    const [status,    setStatus]    = useState(existing.status || 'available');
    const [startTime, setStartTime] = useState(existing.startTime || '09:00');
    const [endTime,   setEndTime]   = useState(existing.endTime   || '17:00');
    const [allDay,    setAllDay]    = useState(!existing.startTime);

    const save = () => {
      setDateEntry(ds, { status, startTime: allDay ? '' : startTime, endTime: allDay ? '' : endTime });
      onClose();
    };
    const clear = () => { setDateEntry(ds, null); onClose(); };

    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div style={{background:'#fff',borderRadius:14,padding:28,minWidth:300,maxWidth:380,width:'100%',boxShadow:'0 8px 40px rgba(0,0,0,0.25)'}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#1a1410',marginBottom:4}}>
            {new Date(ds+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </div>
          {booked ? (
            <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'12px 16px',fontSize:14,color:'#7a5a10',fontWeight:600}}>
              ✅ This date is booked — confirmed event.
            </div>
          ) : (<>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Status</label>
              <div style={{display:'flex',gap:8}}>
                {[{val:'available',label:'✅ Available',bg:'#d4f4e0',color:'#1a6b3a',border:'#1a6b3a'},{val:'blocked',label:'🔴 Blocked',bg:'#fdecea',color:'#8b1a1a',border:'#8b1a1a'}].map(({val,label,bg,color,border})=>(
                  <div key={val} onClick={()=>setStatus(val)} style={{flex:1,padding:'10px 8px',borderRadius:8,cursor:'pointer',textAlign:'center',fontWeight:700,fontSize:13,
                    background:status===val?bg:'#f5f0ea', border:`2px solid ${status===val?border:'#e0d5c5'}`, color:status===val?color:'#7a6a5a', transition:'all 0.15s'}}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {status === 'available' && (<>
              <div style={{marginBottom:12}}>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14,color:'#4a3a28',textTransform:'none',letterSpacing:0,fontWeight:400}}>
                  <input type="checkbox" checked={allDay} onChange={e=>setAllDay(e.target.checked)} style={{width:16,height:16}} />
                  All day availability
                </label>
              </div>
              {!allDay && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Start Time</label>
                    <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)}
                      style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'8px 10px',fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>End Time</label>
                    <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                      style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'8px 10px',fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box'}} />
                  </div>
                </div>
              )}
            </>)}

            <div style={{display:'flex',gap:8}}>
              <button onClick={save} style={{flex:2,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'11px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Save</button>
              <button onClick={clear} style={{flex:1,background:'#f5f0ea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:8,padding:'11px 0',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Clear</button>
              <button onClick={onClose} style={{flex:1,background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:8,padding:'11px 0',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
            </div>
          </>)}
          {booked && <button onClick={onClose} style={{marginTop:12,width:'100%',background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>}
        </div>
      </div>
    );
  };

  // ── Recurring Template Editor ──────────────────────────────────────────────
  const TemplateEditor = ({ initial, onSave, onCancel }) => {
    const [tpl, setTpl] = useState(initial || { id:null, label:'', days:[], status:'available', startTime:'09:00', endTime:'17:00', allDay:false });
    const toggleDay = (i) => setTpl(t => ({...t, days: t.days.includes(i) ? t.days.filter(d=>d!==i) : [...t.days,i]}));
    const canSave = tpl.label.trim() && tpl.days.length > 0;
    return (
      <div style={{background:'#fdf9f5',border:'1.5px solid #e8ddd0',borderRadius:12,padding:20,marginBottom:12}}>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Template Name</label>
          <input value={tpl.label} onChange={e=>setTpl(t=>({...t,label:e.target.value}))} placeholder="e.g. Weekend Markets, Weekday Evenings"
            style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'8px 10px',fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none'}} />
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Status</label>
          <div style={{display:'flex',gap:8}}>
            {[{val:'available',label:'✅ Available',bg:'#d4f4e0',color:'#1a6b3a',border:'#1a6b3a'},{val:'blocked',label:'🔴 Blocked / Busy',bg:'#fdecea',color:'#8b1a1a',border:'#8b1a1a'}].map(({val,label,bg,color,border})=>(
              <div key={val} onClick={()=>setTpl(t=>({...t,status:val}))}
                style={{flex:1,padding:'9px 6px',borderRadius:8,cursor:'pointer',textAlign:'center',fontWeight:700,fontSize:12,
                  background:tpl.status===val?bg:'#f5f0ea', border:`2px solid ${tpl.status===val?border:'#e0d5c5'}`,
                  color:tpl.status===val?color:'#7a6a5a', transition:'all 0.15s'}}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Repeats On</label>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {DAYS_SHORT.map((d,i)=>(
              <div key={d} onClick={()=>toggleDay(i)} style={{padding:'7px 10px',borderRadius:6,cursor:'pointer',fontWeight:700,fontSize:12,
                background:tpl.days.includes(i)?'#1a1410':'#f5f0ea', color:tpl.days.includes(i)?'#e8c97a':'#4a3a28',
                border:`2px solid ${tpl.days.includes(i)?'#c8a84b':'#e0d5c5'}`, transition:'all 0.15s',userSelect:'none'}}>
                {d}
              </div>
            ))}
          </div>
          {tpl.days.length===0 && <div style={{fontSize:11,color:'#c8a84b',marginTop:5}}>Select at least one day</div>}
        </div>

        {tpl.status === 'available' && (
          <div style={{marginBottom:12}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14,color:'#4a3a28',textTransform:'none',letterSpacing:0,fontWeight:400,marginBottom:8}}>
              <input type="checkbox" checked={tpl.allDay} onChange={e=>setTpl(t=>({...t,allDay:e.target.checked}))} style={{width:16,height:16,cursor:'pointer'}} />
              All day
            </label>
            {!tpl.allDay && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Start Time</label>
                  <input type="time" value={tpl.startTime} onChange={e=>setTpl(t=>({...t,startTime:e.target.value}))}
                    style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'8px 10px',fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none'}} />
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#7a6a5a',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>End Time</label>
                  <input type="time" value={tpl.endTime} onChange={e=>setTpl(t=>({...t,endTime:e.target.value}))}
                    style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'8px 10px',fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none'}} />
                </div>
              </div>
            )}
          </div>
        )}

        {!canSave && <div style={{fontSize:11,color:'#a89a8a',marginBottom:8}}>Enter a name and select at least one day to save.</div>}
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{ if(canSave) onSave(tpl); }}
            style={{flex:2,background:canSave?'#1a1410':'#d0c8c0',color:canSave?'#e8c97a':'#a89a8a',border:'none',borderRadius:8,padding:'11px 0',fontSize:13,fontWeight:700,cursor:canSave?'pointer':'not-allowed',fontFamily:'DM Sans,sans-serif',transition:'all 0.2s'}}>
            Save Template
          </button>
          <button onClick={onCancel} style={{flex:1,background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:8,padding:'11px 0',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="section" style={{maxWidth:960}}>
      <div className="section-title">My Availability Calendar</div>
      <p className="section-sub">Set your available dates and times so hosts can see when you're open and direct-book you instantly.</p>

      {/* Stats */}
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        {[
          {label:'Available',count:availCount,  bg:'#d4f4e0',color:'#1a6b3a',border:'#b8e8c8'},
          {label:'Booked',   count:bookedCount,  bg:'#fdf4dc',color:'#7a5a10',border:'#ffd966'},
          {label:'Blocked',  count:blockedCount, bg:'#fdecea',color:'#8b1a1a',border:'#f5c6c6'},
        ].map(({label,count,bg,color,border})=>(
          <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:'10px 20px',textAlign:'center',minWidth:110}}>
            <div style={{fontSize:22,fontWeight:700,color,fontFamily:'Playfair Display,serif'}}>{count}</div>
            <div style={{fontSize:12,color,fontWeight:600}}>{label} Dates</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'flex-start'}}>

        {/* ── Calendar ── */}
        <div style={{flex:'1 1 380px',background:'#fff',borderRadius:14,border:'1px solid #e8ddd0',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
          <div style={{background:'#1a1410',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <button onClick={prevMonth} style={{background:'none',border:'none',color:'#c8a84b',fontSize:22,cursor:'pointer',padding:'0 8px'}}>‹</button>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#e8c97a'}}>{MONTHS[viewMonth]} {viewYear}</div>
            <button onClick={nextMonth} style={{background:'none',border:'none',color:'#c8a84b',fontSize:22,cursor:'pointer',padding:'0 8px'}}>›</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#f5f0ea',borderBottom:'1px solid #e8ddd0'}}>
            {DAYS_SHORT.map(d=><div key={d} style={{padding:'8px 0',textAlign:'center',fontSize:11,fontWeight:700,color:'#7a6a5a',letterSpacing:1}}>{d}</div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:8}}>
            {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const d = i+1;
              const ds = dateStr(d);
              const ss = statusStyle(ds);
              const entry = getDate(ds);
              const past  = isPast(d);
              const hov   = hoveredDate===ds;
              return (
                <div key={d}
                  onClick={()=>{ if(!past){ setSelectedDate(ds); setTimeModalOpen(true); }}}
                  onMouseEnter={()=>setHoveredDate(ds)}
                  onMouseLeave={()=>setHoveredDate(null)}
                  style={{background:ss.bg,color:ss.color,border:`2px solid ${ss.border}`,borderRadius:8,
                    padding:'6px 2px',textAlign:'center',cursor:past?'not-allowed':'pointer',
                    fontSize:13,fontWeight:600,transition:'all 0.15s',userSelect:'none',
                    opacity:past?0.3:1, transform:hov&&!past?'scale(1.07)':'scale(1)',
                    boxShadow:hov&&!past?'0 2px 8px rgba(0,0,0,0.18)':'none', minHeight:46}}>
                  <div>{d}</div>
                  {ss.label && <div style={{fontSize:7,marginTop:1,letterSpacing:0.5}}>{ss.label}</div>}
                  {entry?.startTime && !isBooked(ds) && (
                    <div style={{fontSize:7,lineHeight:1.2,marginTop:1}}>
                      {fmt12(entry.startTime).replace(' ','')}<br/>{fmt12(entry.endTime).replace(' ','')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{padding:'8px 12px',background:'#f5f0ea',borderTop:'1px solid #e8ddd0',fontSize:11,color:'#a89a8a',textAlign:'center'}}>
            Click any date to set availability &amp; time
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{flex:'1 1 260px',display:'flex',flexDirection:'column',gap:14}}>

          {/* Recurring Templates */}
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e8ddd0',padding:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontWeight:700,color:'#1a1410',fontSize:14}}>🔁 Recurring Availability</div>
              <button onClick={()=>{setEditingTemplate('new');setRecurringOpen(true);}} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'5px 12px',fontSize:12,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:700}}>+ New</button>
            </div>
            <div style={{fontSize:12,color:'#a89a8a',marginBottom:10,lineHeight:1.5}}>
              Create weekly schedules (e.g. "Every Saturday 9am–4pm") and apply them to any month in one click.
            </div>

            {recurringOpen && editingTemplate==='new' && (
              <TemplateEditor initial={null} onSave={(tpl)=>{saveTemplate(tpl);setRecurringOpen(false);}} onCancel={()=>{setRecurringOpen(false);setEditingTemplate(null);}} />
            )}

            {recurringTemplates.length === 0 && !recurringOpen && (
              <div style={{fontSize:12,color:'#c0b0a0',textAlign:'center',padding:'10px 0',fontStyle:'italic'}}>No recurring templates yet</div>
            )}

            {recurringTemplates.map(tpl=>(
              <div key={tpl.id} style={{background:'#f5f0ea',borderRadius:10,padding:'10px 12px',marginBottom:8,border:'1px solid #e8ddd0'}}>
                {editingTemplate===tpl.id ? (
                  <TemplateEditor initial={tpl} onSave={(t)=>{saveTemplate(t);setEditingTemplate(null);}} onCancel={()=>setEditingTemplate(null)} />
                ) : (<>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                    <div style={{fontWeight:700,color:'#1a1410',fontSize:13}}>{tpl.label}</div>
                    <div style={{display:'flex',gap:5}}>
                      <button onClick={()=>setEditingTemplate(tpl.id)} style={{background:'none',border:'1px solid #e0d5c5',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,color:'#7a6a5a',fontFamily:'DM Sans,sans-serif'}}>Edit</button>
                      <button onClick={()=>removeTemplate(tpl.id)} style={{background:'none',border:'1px solid #f5c6c6',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,color:'#8b1a1a',fontFamily:'DM Sans,sans-serif'}}>✕</button>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:'#7a6a5a',marginBottom:6}}>
                    {tpl.days.map(i=>DAYS_SHORT[i]).join(', ')} · {tpl.allDay?'All day':`${fmt12(tpl.startTime)} – ${fmt12(tpl.endTime)}`}
                  </div>
                  <button onClick={()=>applyTemplate(tpl)} style={{width:'100%',background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'7px 0',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                    ✓ Apply to {MONTHS[viewMonth]}
                  </button>
                </>)}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e8ddd0',padding:16}}>
            <div style={{fontWeight:700,color:'#1a1410',marginBottom:10,fontSize:14}}>Legend</div>
            {[
              {color:'#1a6b3a',bg:'#d4f4e0',label:'Available — hosts can book'},
              {color:'#c8a84b',bg:'#fdf4dc',label:'Booked — confirmed event'},
              {color:'#8b1a1a',bg:'#fdecea',label:'Blocked — unavailable'},
              {color:'#9a8a7a',bg:'#f5f0ea',label:'Unset — not specified'},
            ].map(({color,bg,label})=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:16,height:16,borderRadius:4,background:bg,border:`2px solid ${color}`,flexShrink:0}}/>
                <div style={{fontSize:12,color:'#4a3a28'}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Sync */}
          <div style={{background:'#1a1410',borderRadius:12,padding:16}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:15,color:'#e8c97a',marginBottom:8}}>📲 Sync Your Calendar</div>
            <div style={{fontSize:12,color:'#a89a8a',marginBottom:12,lineHeight:1.6}}>Download as .ics to import into Google Calendar, Apple Calendar, or Outlook.</div>
            <button onClick={downloadICal} style={{width:'100%',background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'10px 0',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',marginBottom:8}}>
              ⬇ Download .ics File
            </button>
            <button onClick={()=>setShowIcalInfo(s=>!s)} style={{width:'100%',background:'#2d2118',color:'#c8a84b',border:'1px solid #3d3020',borderRadius:8,padding:'8px 0',fontSize:12,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              {showIcalInfo?'Hide':'How to import ▼'}
            </button>
            {showIcalInfo && (
              <div style={{marginTop:10,fontSize:11,color:'#a89a8a',lineHeight:1.8}}>
                <div style={{fontWeight:700,color:'#c8a84b',marginBottom:4}}>Google Calendar:</div>
                <div>Settings → Import &amp; Export → Import → select .ics file</div>
                <div style={{fontWeight:700,color:'#c8a84b',margin:'8px 0 4px'}}>Apple Calendar:</div>
                <div>File → Import → select .ics file</div>
                <div style={{fontWeight:700,color:'#c8a84b',margin:'8px 0 4px'}}>Outlook:</div>
                <div>File → Open &amp; Export → Import/Export → Import iCalendar</div>
                <div style={{fontWeight:700,color:'#c8a84b',margin:'8px 0 4px'}}>iPhone / Android:</div>
                <div>Email yourself the .ics file and tap it to add to your phone calendar</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date/Time Modal */}
      {timeModalOpen && selectedDate && (
        <DateTimeModal ds={selectedDate} onClose={()=>{setTimeModalOpen(false);setSelectedDate(null);}} />
      )}
    </div>
  );
}

// ─── Host Calendar Page ────────────────────────────────────────────────────────
function HostCalendarPage({ hostEvent, bookingRequests, setTab, hostConfirm, clearHostConfirm }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dayView,   setDayView]   = useState(null); // null = month view, 'YYYY-MM-DD' = day view
  const [showIcalInfo, setShowIcalInfo] = useState(false);

  const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const DAYS_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const MIN_YEAR = 2024; const MAX_YEAR = today.getFullYear() + 3;
  const prevMonth   = () => { if(viewYear<=MIN_YEAR&&viewMonth===0)return; if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth   = () => { if(viewYear>=MAX_YEAR&&viewMonth===11)return; if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const dateStr     = (d) => `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const fmt12 = (t) => {
    if (!t) return '';
    const [h,m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${((h%12)||12)}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const fmtDate = (ds, opts) => ds ? new Date(ds+'T12:00').toLocaleDateString('en-US', opts) : '';

  // Navigate to event month on load
  useEffect(() => {
    if (hostEvent?.date) {
      const [y, mo] = hostEvent.date.split('-').map(Number);
      setViewYear(y);
      setViewMonth(mo - 1);
    }
  }, [hostEvent?.date]);

  // Group booking requests by date
  const requestsByDate = {};
  bookingRequests.forEach(req => {
    const d = req.eventDate;
    if (d) {
      if (!requestsByDate[d]) requestsByDate[d] = [];
      requestsByDate[d].push(req);
    }
  });

  const eventDate = hostEvent?.date || null;
  const allEventDates = new Set([
    ...(eventDate ? [eventDate] : []),
    ...Object.keys(requestsByDate),
  ]);

  const totalReqs    = bookingRequests.length;
  const pendingCount  = bookingRequests.filter(r => r.status === 'pending').length;
  const acceptedCount = bookingRequests.filter(r => r.status === 'accepted').length;
  const declinedCount = bookingRequests.filter(r => r.status === 'declined').length;

  const getRequests = (ds) => requestsByDate[ds] || [];

  const STATUS_META = {
    pending:  { bg:'#fdf4dc', color:'#7a5a10', border:'#ffd966', label:'Pending',     icon:'⏳' },
    accepted: { bg:'#d4f4e0', color:'#1a6b3a', border:'#b8e8c8', label:'Accepted',    icon:'✅' },
    declined: { bg:'#fdecea', color:'#8b1a1a', border:'#f5c6c6', label:'Declined',    icon:'❌' },
    cancelled:{ bg:'#f0f0f0', color:'#7a7a7a', border:'#d0d0d0', label:'Cancelled',   icon:'🚫' },
  };

  const cellMeta = (ds) => {
    const reqs = getRequests(ds);
    const isEv = allEventDates.has(ds);
    const accepted = reqs.filter(r => r.status === 'accepted').length;
    const pending  = reqs.filter(r => r.status === 'pending').length;
    if (isEv && accepted > 0) return { bg:'#1a6b3a', color:'#fff',    border:'#1a6b3a', dot:'#a3e8bb' };
    if (isEv && pending  > 0) return { bg:'#c8a84b', color:'#1a1410', border:'#c8a84b', dot:'#1a1410' };
    if (isEv)                 return { bg:'#fdf4dc', color:'#7a5a10', border:'#e8c97a', dot:'#c8a84b' };
    return                           { bg:'#f5f0ea', color:'#c0b0a0', border:'#e0d5c5', dot:null      };
  };

  const generateICal = () => {
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//South Jersey Vendor Market//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    if (hostEvent?.date) {
      const d = hostEvent.date.replace(/-/g,'');
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,
        `SUMMARY:${hostEvent.eventName || hostEvent.eventType || 'My Event'} - South Jersey Vendor Market`,
        `UID:event-${d}@sjvendormarket`,'STATUS:CONFIRMED','END:VEVENT');
    }
    bookingRequests.filter(r => r.status === 'accepted').forEach(req => {
      const d = (req.eventDate||'').replace(/-/g,'');
      if (!d) return;
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,
        `SUMMARY:Booked: ${req.vendorName} (${req.vendorCategory})`,
        `UID:booking-${req.id}@sjvendormarket`,'STATUS:CONFIRMED','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  const downloadICal = () => {
    const blob = new Blob([generateICal()], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='sjvendormarket-host-calendar.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Day view ─────────────────────────────────────────────────────────────────
  if (dayView) {
    const dayReqs   = getRequests(dayView);
    const isEvDay   = allEventDates.has(dayView);
    const dayOfWeek = DAYS_FULL[new Date(dayView+'T12:00').getDay()];
    const accepted  = dayReqs.filter(r => r.status === 'accepted');
    const pending   = dayReqs.filter(r => r.status === 'pending');
    const others    = dayReqs.filter(r => r.status !== 'accepted' && r.status !== 'pending');
    const ordered   = [...accepted, ...pending, ...others];

    return (
      <div className="section" style={{maxWidth:800}}>
        {/* Back nav */}
        <button onClick={()=>setDayView(null)}
          style={{background:'none',border:'none',color:'#c8a84b',fontSize:14,fontWeight:700,cursor:'pointer',
            fontFamily:'DM Sans,sans-serif',padding:'0 0 20px 0',display:'flex',alignItems:'center',gap:6}}>
          ← Back to Calendar
        </button>

        {/* Day header */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,color:'#a89a8a',fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:4}}>{dayOfWeek}</div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:36,color:'#1a1410',lineHeight:1.1}}>
            {fmtDate(dayView,{month:'long',day:'numeric',year:'numeric'})}
          </div>
        </div>

        {/* Event block */}
        {isEvDay && (
          <div style={{background:'#1a1410',borderRadius:12,padding:'18px 22px',marginBottom:24}}>
            <div style={{fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:4}}>Your Event</div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#e8c97a',marginBottom:6}}>
              {hostEvent.eventName || hostEvent.eventType || 'Your Event'}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {hostEvent.eventType && <div style={{fontSize:13,color:'#a89a8a'}}>🎪 {hostEvent.eventType}</div>}
              {hostEvent.startTime && (
                <div style={{fontSize:13,color:'#a89a8a'}}>
                  🕐 {fmt12(hostEvent.startTime)}{hostEvent.endTime ? ` – ${fmt12(hostEvent.endTime)}` : ''}
                </div>
              )}
              {hostEvent.address && <div style={{fontSize:13,color:'#a89a8a'}}>📍 {hostEvent.address}{hostEvent.eventZip ? `, ${hostEvent.eventZip}` : ''}</div>}
              {hostEvent.expectedAttendance && <div style={{fontSize:13,color:'#a89a8a'}}>👥 {hostEvent.expectedAttendance} expected</div>}
              {hostEvent.vendorCount && <div style={{fontSize:13,color:'#a89a8a'}}>🏪 {hostEvent.vendorCount} vendor spots</div>}
              {hostEvent.budget && <div style={{fontSize:13,color:'#a89a8a'}}>💰 {hostEvent.budget} budget</div>}
            </div>
            {hostEvent.notes && (
              <div style={{marginTop:10,fontSize:13,color:'#7a6a5a',fontStyle:'italic',lineHeight:1.6}}>"{hostEvent.notes}"</div>
            )}
          </div>
        )}

        {/* Vendor lineup */}
        <div style={{marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#1a1410'}}>
            Vendor Lineup
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {accepted.length > 0 && (
              <div style={{background:'#d4f4e0',color:'#1a6b3a',border:'1px solid #b8e8c8',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700}}>
                {accepted.length} confirmed
              </div>
            )}
            {pending.length > 0 && (
              <div style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700}}>
                {pending.length} pending
              </div>
            )}
          </div>
        </div>

        {ordered.length === 0 ? (
          <div style={{background:'#f5f0ea',borderRadius:12,border:'1px solid #e8ddd0',padding:32,textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12}}>🏪</div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#4a3a28',marginBottom:8}}>No vendor requests yet</div>
            <p style={{fontSize:13,color:'#7a6a5a',marginBottom:20}}>Send booking requests to vendors you'd like at this event.</p>
            <button onClick={()=>setTab('matches')}
              style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',
                fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              Browse Vendors →
            </button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {ordered.map(req => {
              const sm = STATUS_META[req.status] || STATUS_META.pending;
              return (
                <div key={req.id} style={{background:'#fff',borderRadius:12,border:`1.5px solid ${sm.border}`,overflow:'hidden',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                  {/* Card header */}
                  <div style={{background:sm.bg,padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontSize:28}}>{req.vendorEmoji || '🏪'}</div>
                      <div>
                        <div style={{fontWeight:700,color:'#1a1410',fontSize:16}}>{req.vendorName}</div>
                        <div style={{fontSize:12,color:'#7a6a5a'}}>{req.vendorCategory}</div>
                      </div>
                    </div>
                    <div style={{background:'#fff',color:sm.color,border:`1.5px solid ${sm.border}`,
                      borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:700,
                      display:'flex',alignItems:'center',gap:5}}>
                      {sm.icon} {sm.label}
                    </div>
                  </div>
                  {/* Card body */}
                  <div style={{padding:'14px 18px'}}>
                    <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:req.vendorMessage?12:0}}>
                      {req.startTime && (
                        <div style={{fontSize:13,color:'#4a3a28'}}>
                          🕐 <span style={{color:'#7a6a5a'}}>{fmt12(req.startTime)}{req.endTime ? ` – ${fmt12(req.endTime)}` : ''}</span>
                        </div>
                      )}
                      {req.budget && (
                        <div style={{fontSize:13,color:'#4a3a28'}}>
                          💰 <span style={{color:'#7a6a5a'}}>{req.budget}</span>
                        </div>
                      )}
                      {req.sentAt && (
                        <div style={{fontSize:12,color:'#a89a8a'}}>
                          Requested {new Date(req.sentAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </div>
                      )}
                      {req.respondedAt && (
                        <div style={{fontSize:12,color:'#a89a8a'}}>
                          · Responded {new Date(req.respondedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </div>
                      )}
                    </div>
                    {req.vendorMessage && (
                      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,
                        padding:'10px 14px',fontSize:13,color:'#4a3a28',fontStyle:'italic',lineHeight:1.6}}>
                        "{req.vendorMessage}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Day footer actions */}
        <div style={{marginTop:24,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>setDayView(null)}
            style={{background:'#f5f0ea',color:'#4a3a28',border:'1px solid #e0d5c5',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            ← Back to Calendar
          </button>
          <button onClick={()=>setTab('matches')}
            style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            Browse More Vendors →
          </button>
        </div>
      </div>
    );
  }

  // ── Month view ───────────────────────────────────────────────────────────────
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <div style={{padding:'24px 24px 48px',maxWidth:1200,margin:'0 auto'}}>

      {/* Host submission confirmation banner */}
      {hostConfirm && (
        <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:10,padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{fontWeight:700,color:'#1a6b3a',fontSize:15,marginBottom:4}}>✅ Event submitted — you're all set!</div>
            <div style={{fontSize:13,color:'#2d7a50'}}>
              Confirmation <strong>{hostConfirm.ref}</strong> sent to {hostConfirm.email} · <a href={`mailto:${hostConfirm.email}?subject=Your SJVM Event Submission — ${hostConfirm.ref}&body=Hi,%0A%0AYour event has been submitted to South Jersey Vendor Market.%0A%0AConfirmation: ${hostConfirm.ref}%0AEvent: ${hostConfirm.eventName}%0A%0ANext steps:%0A• Browse vendors using the Browse Vendors tab%0A• Send booking requests to vendors you want%0A• Check this calendar for responses%0A%0A— South Jersey Vendor Market%0Asupport@sjvendormarket.com`} style={{color:'#1a6b3a',fontWeight:700}}>Email copy →</a>
            </div>
          </div>
          <button onClick={clearHostConfirm} style={{background:'none',border:'none',color:'#1a6b3a',fontSize:18,cursor:'pointer',padding:4}}>✕</button>
        </div>
      )}

      {/* Top bar */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:20}}>
        <div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:30,color:'#1a1410',lineHeight:1.1}}>My Event Calendar</div>
          {hostEvent ? (
            <div style={{fontSize:14,color:'#7a6a5a',marginTop:6}}>
              {hostEvent.eventName || hostEvent.eventType || 'Your Event'}
              {hostEvent.date && ` · ${fmtDate(hostEvent.date,{month:'long',day:'numeric',year:'numeric'})}`}
              {hostEvent.startTime && ` · ${fmt12(hostEvent.startTime)}–${fmt12(hostEvent.endTime)}`}
            </div>
          ) : (
            <div style={{fontSize:14,color:'#a89a8a',marginTop:6}}>Post an event to see it on your calendar</div>
          )}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          {acceptedCount > 0 && (
            <div style={{background:'#d4f4e0',color:'#1a6b3a',border:'1px solid #b8e8c8',borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:700}}>
              {acceptedCount} confirmed
            </div>
          )}
          {pendingCount > 0 && (
            <div style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:700}}>
              {pendingCount} pending
            </div>
          )}
          {hostEvent ? (
            <button onClick={downloadICal}
              style={{background:'#f5f0ea',color:'#4a3a28',border:'1px solid #e0d5c5',borderRadius:8,
                padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              ⬇ Export .ics
            </button>
          ) : null}
          {hostEvent ? (
            <button onClick={()=>setTab('matches')}
              style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,
                padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              Browse Vendors →
            </button>
          ) : (
            <button onClick={()=>setTab('host')}
              style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,
                padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              + Post Your Event
            </button>
          )}
        </div>
      </div>

      {/* No-event prompt banner */}
      {!hostEvent && (
        <div style={{background:'#fdf9f5',border:'1.5px dashed #e0d5c5',borderRadius:12,
          padding:'18px 24px',marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{fontSize:28}}>📅</div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontWeight:700,color:'#1a1410',fontSize:15,marginBottom:2}}>No event posted yet</div>
            <div style={{fontSize:13,color:'#7a6a5a'}}>Your events and vendor bookings will appear on this calendar once you post an event.</div>
          </div>
          <button onClick={()=>setTab('host')}
            style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>
            Post an Event →
          </button>
        </div>
      )}

      {/* Next-step CTA: event posted but no requests sent yet */}
      {hostEvent && bookingRequests.length === 0 && (
        <div style={{background:'linear-gradient(135deg,#1a1410,#2d2118)',borderRadius:12,padding:'20px 28px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#e8c97a',marginBottom:4}}>Ready to find your vendors?</div>
            <div style={{fontSize:13,color:'#a89a8a',maxWidth:420}}>Your event is on the calendar. Now browse vendors in your area and send booking requests — they'll show up here when they respond.</div>
          </div>
          <button onClick={()=>setTab('matches')}
            style={{background:'#e8c97a',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>
            Browse Vendors →
          </button>
        </div>
      )}

      {/* Full-width calendar */}
      <div style={{background:'#fff',borderRadius:16,border:'1px solid #e8ddd0',overflow:'hidden',
        boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>

        {/* Month nav */}
        <div style={{background:'#1a1410',padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={prevMonth}
            style={{background:'none',border:'none',color:'#c8a84b',fontSize:26,cursor:'pointer',padding:'0 12px',lineHeight:1}}>‹</button>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:24,color:'#e8c97a',letterSpacing:1}}>
            {MONTHS[viewMonth]} {viewYear}
          </div>
          <button onClick={nextMonth}
            style={{background:'none',border:'none',color:'#c8a84b',fontSize:26,cursor:'pointer',padding:'0 12px',lineHeight:1}}>›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#f5f0ea',
          borderBottom:'2px solid #e8ddd0'}}>
          {DAYS_SHORT.map(d=>(
            <div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:12,fontWeight:700,
              color:'#7a6a5a',letterSpacing:1.5,textTransform:'uppercase'}}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',
          borderLeft:'1px solid #f0e8e0'}}>
          {Array(firstDay).fill(null).map((_,i)=>(
            <div key={`e${i}`} style={{minHeight:110,borderRight:'1px solid #f0e8e0',borderBottom:'1px solid #f0e8e0',background:'#fafaf8'}}/>
          ))}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d    = i+1;
            const ds   = dateStr(d);
            const cm   = cellMeta(ds);
            const reqs = getRequests(ds);
            const isEv = allEventDates.has(ds);
            const isT  = ds === todayStr;
            const accReqs  = reqs.filter(r=>r.status==='accepted');
            const pendReqs = reqs.filter(r=>r.status==='pending');
            const otherReqs= reqs.filter(r=>r.status!=='accepted'&&r.status!=='pending');
            const clickable= isEv || reqs.length>0;
            // show up to 3 vendor chips, then "+N more"
            const chips = [...accReqs,...pendReqs,...otherReqs];
            const visibleChips = chips.slice(0,3);
            const extraChips   = chips.length - visibleChips.length;
            return (
              <div key={d}
                onClick={()=>{ if(clickable) setDayView(ds); }}
                style={{minHeight:110,borderRight:'1px solid #f0e8e0',borderBottom:'1px solid #f0e8e0',
                  padding:'8px 10px',verticalAlign:'top',position:'relative',
                  background: isEv ? cm.bg : '#fff',
                  cursor:clickable?'pointer':'default',
                  transition:'background 0.12s',
                  boxShadow:isT?'inset 0 0 0 2px #c8a84b':'none'}}>
                {/* Date number */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:isT?800:600,
                    color: isEv ? cm.color : (isT?'#c8a84b':'#4a3a28'),
                    width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',
                    borderRadius:'50%',background:isT&&!isEv?'#fdf4dc':'transparent'}}>
                    {d}
                  </div>
                  {isT && <div style={{fontSize:9,color:'#c8a84b',fontWeight:700,letterSpacing:1}}>TODAY</div>}
                </div>

                {/* Event pill */}
                {isEv && (
                  <div style={{background:'rgba(0,0,0,0.18)',color:cm.color,borderRadius:4,
                    padding:'2px 6px',fontSize:10,fontWeight:700,marginBottom:4,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    📅 {hostEvent.eventName || hostEvent.eventType || 'Event'}
                    {hostEvent.startTime && ` · ${fmt12(hostEvent.startTime)}`}
                  </div>
                )}

                {/* Vendor chips */}
                <div style={{display:'flex',flexDirection:'column',gap:2}}>
                  {visibleChips.map(req=>{
                    const isAcc  = req.status==='accepted';
                    const isPend = req.status==='pending';
                    return (
                      <div key={req.id} style={{
                        borderRadius:4,padding:'2px 6px',fontSize:10,fontWeight:600,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                        background: isAcc  ? '#d4f4e0' : isPend ? '#fdf4dc' : '#f5f0ea',
                        color:      isAcc  ? '#1a6b3a' : isPend ? '#7a5a10' : '#7a6a5a',
                        border:     `1px solid ${isAcc?'#b8e8c8':isPend?'#ffd966':'#e0d5c5'}`,
                      }}>
                        {isAcc?'✓':isPend?'·':'–'} {req.vendorName}
                      </div>
                    );
                  })}
                  {extraChips > 0 && (
                    <div style={{fontSize:10,color:'#a89a8a',fontWeight:600,paddingLeft:4}}>
                      +{extraChips} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend row */}
      <div style={{display:'flex',gap:20,marginTop:14,flexWrap:'wrap',alignItems:'center'}}>
        {[
          {color:'#1a6b3a',bg:'#d4f4e0',border:'#b8e8c8',label:'Vendor confirmed'},
          {color:'#7a5a10',bg:'#fdf4dc',border:'#ffd966',label:'Request pending'},
          {color:'#7a5a10',bg:'#fdf4dc',border:'#e8c97a',label:'Event day'},
          {color:'#c8a84b',bg:'#fdf4dc',border:'#c8a84b',label:'Today'},
        ].map(({color,bg,border,label})=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:14,height:14,borderRadius:3,background:bg,border:`2px solid ${border}`,flexShrink:0}}/>
            <div style={{fontSize:12,color:'#7a6a5a'}}>{label}</div>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:14,height:14,borderRadius:3,background:'#fff',border:'1px solid #e0d5c5',
            boxShadow:'inset 0 0 0 2px #c8a84b',flexShrink:0}}/>
          <div style={{fontSize:12,color:'#7a6a5a'}}>Today (ring)</div>
        </div>
      </div>
    </div>
  );
}
