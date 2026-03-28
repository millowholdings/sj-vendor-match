import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['tiffany@southjerseyvendormarket.com', 'tiffany@subtleboujee.com'];

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
  "Pop-Up & Vendor Market", "Craft & Art Fair", "Farmers & Flea Market",
  "Holiday Market", "Night Market", "Sip & Shop", "Food Festival",
  "Community Festival", "Fundraiser", "Networking Event", "Girls Night Out"
];
const REMOVED_EVENT_TYPES = ["Corporate Event","Birthday Party","Wedding Reception","Wedding Ceremony","Bridal Shower","Baby Shower","Gender Reveal","Private Party","Bachelorette Party","Anniversary Celebration","Grand Opening","Block Party","Other"];
const EVENT_TYPE_MAP = {
  "Pop-Up Market":"Pop-Up & Vendor Market","Vendor Market":"Pop-Up & Vendor Market",
  "Craft Fair":"Craft & Art Fair","Art Show":"Craft & Art Fair",
  "Flea Market":"Farmers & Flea Market","Farmers Market":"Farmers & Flea Market",
  "Grand Opening":"Community Festival","Block Party":"Community Festival",
  "Other":"Community Festival",
};

const SERVICE_TYPES = ["Live Music/Band","DJ","Photography","Videography","Face Painting","Balloon Artist","Caricature Artist","Other"];
const SERVICE_DURATIONS = ["1 hour","2 hours","3 hours","4 hours","Half day","Full day","Other"];
const SERVICE_CATEGORIES = ["Entertainment","Visual & Media","Kids & Activities","Food & Beverage Services","Wellness & Beauty Services","Decor & Setup","Other Services"];
const SERVICE_SUBCATEGORIES = {
  "Entertainment": ["Solo Acoustic","Acoustic Duo","Full Band","DJ (with MC)","DJ (Music Only)","Cover Band","Jazz Ensemble","Classical/String Quartet","Karaoke Host","Comedian","Magician","Strolling Entertainer","Fire Performer","Other"],
  "Visual & Media": ["Event Photography","Videography","Photo Booth Operator","Portrait Sessions","Drone Photography","Live Painter","Other"],
  "Kids & Activities": ["Face Painter","Balloon Artist","Caricature Artist","Bounce House/Inflatables","Character Performer","Crafts Station","Other"],
  "Food & Beverage Services": ["Mobile Bar/Bartender","Food Truck","Catering","Coffee/Espresso Cart","Cotton Candy/Popcorn","Ice Cream Cart","Other"],
  "Wellness & Beauty Services": ["Henna Artist","Airbrush Makeup","Hair Styling","Massage Therapist","Tarot/Palm Reader","Other"],
  "Decor & Setup": ["Event Decorator","Balloon Garland/Arch","Tent/Canopy Rental","Lighting Setup","Sound System Rental","Other"],
  "Other Services": ["Other"],
};
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
  const m = v.metadata || {};
  return {
    id:                v.id,
    name:              v.name,
    category:          v.category,
    allCategories:     m.allCategories || [v.category],
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
    contactName:       v.contact_name   || "",
    contactEmail:      v.contact_email  || "",
    contactPhone:      v.contact_phone  || "",
    website:           v.website        || "",
    instagram:         v.instagram      || "",
    facebook:          m.facebook       || "",
    tiktok:            m.tiktok         || "",
    youtube:           m.youtube        || "",
    otherSocial:       m.otherSocial    || "",
    photoUrls:         m.photoUrls      || [],
    lookbookUrl:       m.lookbookUrl    || "",
    yearsActive:       m.yearsActive    || "",
    setupTime:         m.setupTime      || "",
    tableSize:         m.tableSize      || "",
    needsElectric:     m.needsElectric  || false,
    responseTime:      m.responseTime   || "",
    bookingLeadTime:   m.bookingLeadTime|| "",
    eventFrequency:    m.eventFrequency || "",
    isServiceProvider: m.isServiceProvider || false,
    serviceType:       m.serviceType    || "",
    serviceRateMin:    m.serviceRateMin || "",
    serviceRateMax:    m.serviceRateMax || "",
    serviceRateType:   m.serviceRateType|| "fixed",
    minBookingDuration:m.minBookingDuration || "",
    serviceDescription:m.serviceDescription || "",
    foundingVendor:    v.founding_vendor    || false,
  };
}

function dbEventToApp(e) {
  return {
    id:               e.id,
    eventName:        e.event_name,
    eventType:        EVENT_TYPE_MAP[e.event_type] || (REMOVED_EVENT_TYPES.includes(e.event_type) ? 'Community Festival' : e.event_type),
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
    vendorDiscovery:  e.vendor_discovery  || "both",
    status:           e.status            || "approved",
    eventLink:        e.event_link        || "",
    isTicketed:       e.is_ticketed       || false,
    ticketPrice:      e.ticket_price      || "",
    userId:           e.user_id           || "",
    adminNotes:       e.admin_notes       || "",
    rejectionReason:  e.rejection_reason  || "",
    servicesNeeded:   (() => { try { return typeof e.services_needed === 'string' ? JSON.parse(e.services_needed) : (e.services_needed || []); } catch { return []; } })(),
    eventPhotos:      e.event_photos || [],
  };
}

function fmtDate(d){ if(!d) return ""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"}); }
function fmtTime(t){ if(!t) return ""; const [h,m]=t.split(":"); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; }
function isUrgent(d){ if(!d) return false; return (new Date(d+"T12:00:00")-new Date())/86400000<=7; }

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Ibarra+Real+Nova:ital,wght@0,400;0,700;1,400;1,700&family=Lexend+Deca:wght@400;600;700&family=Public+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #1a1208; color: #1a1410; min-height: 100vh; }
  .app { min-height: 100vh; background: #1a1208; }
  .nav { background: #1a1410; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 8px; }
  .nav-logo { display:flex; align-items:baseline; gap:6px; }
  .nav-logo-cursive { font-family: 'Corinthia', cursive; font-size: 32px; color: #e8c97a; line-height:1; letter-spacing: 0px; }
  .nav-logo-serif { font-family: 'Playfair Display', serif; font-size: 18px; color: #fff; letter-spacing: 1px; font-weight:700; }
  .nav-tabs { display: none; }
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
    .hamburger-btn { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 4px; z-index: 201; }
    .mobile-menu { display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #1a1410; z-index: 200; flex-direction: column; overflow-y: auto; padding: 0; }
    .mobile-menu-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; border-bottom: 1px solid rgba(200,168,80,0.2); }
    .mobile-menu-section { padding: 8px 0; border-bottom: 1px solid rgba(200,168,80,0.1); }
    .mobile-menu-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c8a850; padding: 8px 32px 4px; font-weight: 700; }
    .mobile-menu-item { display: block; width: 100%; text-align: left; background: none; border: none; color: #fff; font-family: 'Public Sans', sans-serif; font-size: 15px; padding: 12px 32px; cursor: pointer; transition: background 0.15s; }
    .mobile-menu-item:hover { background: rgba(200,168,80,0.08); }
    .mobile-menu-item.active { color: #c8a850; }
    @media (max-width: 768px) {
    .home-columns { grid-template-columns: 1fr !important; gap: 12px !important; width: auto !important; max-width: none !important; padding: 12px 16px 0 16px !important; margin: 0 !important; box-sizing: border-box !important; }
    .home-col { border: none !important; }
    .nav { padding: 10px 16px; gap: 6px; }
    .nav-logo { font-size: 18px; }
    .mobile-menu-header { padding: 10px 16px; }
    .mobile-menu-label { padding: 8px 20px 4px; }
    .mobile-menu-item { padding: 12px 20px; }
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
    .ometa-grid { grid-template-columns: 1fr; }
    .service-grid { grid-template-columns: 1fr; }
    .modal-2col { grid-template-columns: 1fr !important; }
    .modal-3col { grid-template-columns: 1fr !important; }
    .msg-layout { flex-direction: column !important; }
    .msg-sidebar { width: 100% !important; min-width: unset !important; max-height: 200px; border-right: none !important; border-bottom: 1px solid #2d2118; }
    .msg-sidebar-list { display: flex; overflow-x: auto; flex-direction: row !important; }
    .msg-sidebar-list > div { min-width: 200px; flex-shrink: 0; }
    .msg-chat { min-height: 300px; }
  }
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
  { title: "4. Host Responsibilities", body: "Hosts agree to: (a) provide accurate event information including zip code, date, time, and vendor requirements; (b) honor commitments to vendors made through the platform; (c) conduct all vendor communications through the in-app messaging system; (d) not share vendor contact information obtained through the platform with third parties." },
  { title: "5. In-App Messaging & Communication", body: "South Jersey Vendor Market provides in-app messaging to protect both vendors and hosts. All initial contact and booking negotiations must take place through the platform's messaging system. This protects vendors from having their contact information shared without consent, and protects hosts by maintaining a record of all agreements. South Jersey Vendor Market does not read private messages but may access them if a dispute is filed." },
  { title: "6. Privacy & Data Protection", body: "South Jersey Vendor Market collects only the information necessary to operate the platform. Vendor contact details (email, phone) are never shared with hosts until a booking is confirmed. Host contact details are shared with vendors only as needed to fulfill event bookings. We do not sell your personal information to third parties. By using the platform, you consent to our use of your data to operate and improve our services." },
  { title: "7. Fees & Subscriptions", body: "Vendor listings are free during the beta period. After beta, a subscription fee of $15/month (Basic) applies to maintain an active vendor listing. Host access to all self-service features — including browsing vendors, posting events, and sending booking requests — is completely free. The optional Full Service Concierge offering is priced on a per-event basis through a free consultation. All fees are non-refundable except where required by law. South Jersey Vendor Market reserves the right to modify pricing with 30 days notice." },
  { title: "8. Limitation of Liability", body: "South Jersey Vendor Market is a marketplace platform that connects vendors and hosts. We are not responsible for the quality of vendor products or services, the outcome of events, disputes between vendors and hosts, or any damages arising from transactions conducted through the platform. Our total liability to any user shall not exceed the amount paid to South Jersey Vendor Market in the 3 months preceding any claim." },
  { title: "9. Dispute Resolution", body: "Any disputes between vendors and hosts arising from platform connections should first be reported to South Jersey Vendor Market at support@southjerseyvendormarket.com. We will make reasonable efforts to mediate. Disputes not resolved through mediation shall be governed by the laws of the State of New Jersey. You agree to binding arbitration for any claims against South Jersey Vendor Market itself." },
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
            Questions? Contact us at <strong>support@southjerseyvendormarket.com</strong>
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
  vendorType:{market:false, service:false},
  categories:[], subcategories:[],
  serviceCategories:[], serviceSubcategories:[], serviceOtherText:{},
  description:'', website:'', facebook:'', instagram:'', tiktok:'', youtube:'', otherSocial:'',
  eventTypes:[],
  insurance:false,
  hasMinPurchase:false, minPurchaseAmt:25,
  chargesPrivateFee:false, privateEventFee:150,
  priceMax:0,
  otherCategory:'', otherEventType:'',
  responseTime:'24hrs', bookingLeadTime:'2weeks', eventFrequency:'flexible', emailFrequency:'weekly',
  setupTime:30, tableSize:'6ft', needsElectric:false,
  yearsActive:'', password:'',
  isServiceProvider:false, serviceType:'', serviceRateMin:'', serviceRateMax:'', serviceRateType:'fixed', minBookingDuration:'1 hour', serviceDescription:''
};

function VendorForm({ onSubmit, setTab, authUser, setShowAuthModal }) {
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
  useEffect(() => { const { password: _pw, ...draft } = form; localStorage.setItem(VENDOR_DRAFT_KEY, JSON.stringify(draft)); }, [form]);
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
      {!authUser && (
        <>
          <h2 className="form-section-title"><span className="dot" />Create Your Account</h2>
          <div style={{background:'#1a1410',borderRadius:12,padding:'20px 24px',marginBottom:24}}>
            <div style={{fontSize:14,color:'#e8c97a',fontWeight:700,marginBottom:4}}>Your vendor account lets you:</div>
            <div style={{fontSize:13,color:'#c8b898',lineHeight:1.6}}>Log in to manage your profile, view and respond to booking requests, and apply to events with one click.</div>
          </div>
          <div className="form-grid" style={{marginBottom:24}}>
            <div className="form-group"><label>Email Address *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            <div className="form-group"><label>Create Password *</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} /></div>
          </div>
          <div style={{fontSize:12,color:'#a89a8a',marginBottom:8,textAlign:'center'}}>
            Already have an account? <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:12,fontFamily:'DM Sans,sans-serif',textDecoration:'underline',padding:0}} onClick={()=>{if(typeof setShowAuthModal==='function')setShowAuthModal(true);}}>Log in</button> and your profile will be linked.
          </div>
          <hr className="form-divider" />
        </>
      )}
      {authUser && (
        <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:10,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>✓</span>
          <div><div style={{fontWeight:700,fontSize:14,color:'#1a6b3a'}}>Logged in as {authUser.email}</div><div style={{fontSize:12,color:'#2d7a50'}}>Your vendor profile will be linked to this account.</div></div>
        </div>
      )}
      <h2 className="form-section-title"><span className="dot" />Vendor Profile</h2>
      <p style={{ color:'#7a6a5a', marginBottom:32, fontSize:15 }}>
        Join South Jersey's premier vendor network. Get matched with events and hosts looking for exactly what you offer.
      </p>
      <div className="form-grid">
        <div className="form-group"><label>Business Name *</label><input placeholder="e.g. Subtle Boujee" value={form.businessName} onChange={e=>set('businessName',e.target.value)} /></div>
        <div className="form-group"><label>Owner Name *</label><input placeholder="Your full name" value={form.ownerName} onChange={e=>set('ownerName',e.target.value)} /></div>
        {authUser && <div className="form-group"><label>Email Address *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>}
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
      <h3 className="form-section-title"><span className="dot" />What Type of Vendor Are You?</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:16}}>Select all that apply — you can be both!</p>
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div onClick={()=>set('vendorType',{...form.vendorType,market:!form.vendorType.market})}
          style={{flex:'1 1 220px',padding:'16px 20px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.vendorType.market?'#c8a850':'#e8ddd0'}`,background:form.vendorType.market?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:15,color:'#1a1410',marginBottom:4}}>Market Vendor</div>
          <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.4}}>I sell products/services at events and pay booth fees</div>
          {form.vendorType.market && <div style={{color:'#c8a850',fontSize:18,marginTop:6}}>&#10003;</div>}
        </div>
        <div onClick={()=>set('vendorType',{...form.vendorType,service:!form.vendorType.service})}
          style={{flex:'1 1 220px',padding:'16px 20px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.vendorType.service?'#c8a850':'#e8ddd0'}`,background:form.vendorType.service?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:15,color:'#1a1410',marginBottom:4}}>Event Service Provider</div>
          <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.4}}>I provide services and get paid by hosts</div>
          {form.vendorType.service && <div style={{color:'#c8a850',fontSize:18,marginTop:6}}>&#10003;</div>}
        </div>
      </div>

      {form.vendorType.market && (
        <>
          <h3 className="form-section-title"><span className="dot" />Product Categories</h3>
          <CategorySubcategoryPicker
            categories={form.categories} subcategories={form.subcategories}
            onCategoriesChange={v=>set('categories',v)} onSubcategoriesChange={v=>set('subcategories',v)}
            otherCategory={form.otherCategory} onOtherCategoryChange={v=>set('otherCategory',v)}
            otherSubcategories={otherSubcategories} onOtherSubcategoryChange={(cat,val)=>setOtherSubcategories(p=>{const n={...p};if(val===null)delete n[cat];else n[cat]=val;return n;})}
          />
        </>
      )}

      {form.vendorType.service && (
        <>
          <h3 className="form-section-title" style={{marginTop:form.vendorType.market?24:0}}><span className="dot" />Service Categories</h3>
          <p style={{color:'#7a6a5a',fontSize:14,marginBottom:12}}>Select the types of services you provide.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
            {SERVICE_CATEGORIES.map(cat=>(
              <button key={cat} onClick={()=>{
                const has = form.serviceCategories.includes(cat);
                set('serviceCategories', has ? form.serviceCategories.filter(c=>c!==cat) : [...form.serviceCategories, cat]);
                if (has) set('serviceSubcategories', form.serviceSubcategories.filter(s=>!(SERVICE_SUBCATEGORIES[cat]||[]).includes(s)));
              }} style={{
                padding:'8px 16px',borderRadius:20,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',
                border:'1.5px solid',transition:'all 0.15s',
                background:form.serviceCategories.includes(cat)?'#c8a850':'#fff',
                color:form.serviceCategories.includes(cat)?'#1a1410':'#7a6a5a',
                borderColor:form.serviceCategories.includes(cat)?'#c8a850':'#e8ddd0',
              }}>{cat}</button>
            ))}
          </div>
          {form.serviceCategories.map(cat=>(
            <div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:6}}>{cat}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {(SERVICE_SUBCATEGORIES[cat]||[]).map(sub=>(
                  <button key={sub} onClick={()=>{
                    const has = form.serviceSubcategories.includes(sub);
                    set('serviceSubcategories', has ? form.serviceSubcategories.filter(s=>s!==sub) : [...form.serviceSubcategories, sub]);
                  }} style={{
                    padding:'5px 12px',borderRadius:16,fontSize:12,cursor:'pointer',fontFamily:'DM Sans,sans-serif',
                    border:'1px solid',
                    background:form.serviceSubcategories.includes(sub)?'#1a1410':'#fff',
                    color:form.serviceSubcategories.includes(sub)?'#e8c97a':'#5a4a3a',
                    borderColor:form.serviceSubcategories.includes(sub)?'#1a1410':'#e8ddd0',
                  }}>{sub}</button>
                ))}
              </div>
              {form.serviceSubcategories.includes('Other') && (SERVICE_SUBCATEGORIES[cat]||[]).includes('Other') && (
                <input placeholder={`Describe your ${cat} service...`}
                  value={(form.serviceOtherText||{})[cat]||''}
                  onChange={e=>set('serviceOtherText',{...(form.serviceOtherText||{}), [cat]:e.target.value})}
                  style={{width:'100%',marginTop:8,border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />
              )}
            </div>
          ))}

          {/* Service provider rate & details — inside the service type flow */}
          <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginTop:16,marginBottom:8}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:12}}>Your Rate & Availability</div>
            <div className="form-grid" style={{gap:10}}>
              <div className="form-group"><label>Primary Service Type *</label>
                <select value={form.serviceType} onChange={e=>set('serviceType',e.target.value)}>
                  <option value="">Select your service...</option>
                  {SERVICE_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                {form.serviceType==='Other' && <input placeholder="Describe your service..." value={form.serviceTypeOther||''} onChange={e=>set('serviceTypeOther',e.target.value)} style={{marginTop:6,width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />}
              </div>
              <div className="form-group"><label>Minimum Booking Duration</label>
                <select value={form.minBookingDuration} onChange={e=>set('minBookingDuration',e.target.value)}>
                  {SERVICE_DURATIONS.map(d=><option key={d}>{d}</option>)}
                </select>
                {form.minBookingDuration==='Other' && <input placeholder="Describe your availability..." value={form.minBookingDurationOther||''} onChange={e=>set('minBookingDurationOther',e.target.value)} style={{marginTop:6,width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />}
              </div>
              <div className="form-group"><label>Rate Type</label>
                <select value={form.serviceRateType} onChange={e=>set('serviceRateType',e.target.value)}>
                  <option value="fixed">Fixed Rate</option>
                  <option value="range">Rate Range</option>
                  <option value="quote">Quote Based</option>
                </select>
              </div>
              {form.serviceRateType==='fixed' && <div className="form-group"><label>Your Rate</label><input placeholder="e.g. $500/event" value={form.serviceRateMin} onChange={e=>set('serviceRateMin',e.target.value)} /></div>}
              {form.serviceRateType==='range' && <>
                <div className="form-group"><label>Starting At</label><input placeholder="e.g. $200" value={form.serviceRateMin} onChange={e=>set('serviceRateMin',e.target.value)} /></div>
                <div className="form-group"><label>Up To</label><input placeholder="e.g. $800" value={form.serviceRateMax} onChange={e=>set('serviceRateMax',e.target.value)} /></div>
              </>}
            </div>
            <div className="form-group" style={{marginTop:8}}><label>What You Offer</label><textarea placeholder="Describe your service — style, equipment provided, what's included..." value={form.serviceDescription} onChange={e=>set('serviceDescription',e.target.value)} style={{minHeight:60}} /></div>
          </div>
        </>
      )}

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Event Fit</h3>
      <CheckboxGroup label="Event Types You're Open To" options={EVENT_TYPES} selected={form.eventTypes} onChange={v=>set('eventTypes',v)} otherValue={form.otherEventType} onOtherChange={v=>set('otherEventType',v)} />

      {/* Booth & Logistics — only for market vendors */}
      {form.vendorType.market && (
        <>
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
                <option value={25}>$25/day</option><option value={50}>$50/day</option><option value={75}>$75/day</option>
                <option value={100}>$100/day</option><option value={125}>$125/day</option><option value={150}>$150/day</option>
                <option value={200}>$200/day</option><option value={250}>$250/day</option><option value={300}>$300/day</option>
                <option value={500}>$500/day</option><option value={1000}>$1,000/day</option>
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
            <div className="form-group"><label>Setup Time Needed</label>
              <select value={form.setupTime} onChange={e=>set('setupTime',+e.target.value)}>
                <option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option><option value={120}>2 hours</option>
              </select>
            </div>
            <div className="form-group"><label>Table / Space Size</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
            <div className="form-group"><label>Need Electrical Access?</label><select value={form.needsElectric?'yes':'no'} onChange={e=>set('needsElectric',e.target.value==='yes')}><option value="no">No</option><option value="yes">Yes</option></select></div>
          </div>
        </>
      )}

      {/* Insurance for service providers who aren't market vendors */}
      {form.vendorType.service && !form.vendorType.market && (
        <>
          <hr className="form-divider" />
          <h3 className="form-section-title"><span className="dot" />Insurance</h3>
          <div className="form-group">
            <label>Do You Carry Liability Insurance?</label>
            <select value={form.insurance?'yes':'no'} onChange={e=>set('insurance',e.target.value==='yes')}>
              <option value="no">No — I do not carry liability insurance</option>
              <option value="yes">Yes — I have a certificate of insurance (COI)</option>
            </select>
            <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}>Many events require insured service providers. This shows as a badge on your profile.</div>
          </div>
        </>
      )}

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
      <h3 className="form-section-title"><span className="dot" />Photos & Documents</h3>

      {/* Photo uploads with preview */}
      <div style={{marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <label style={{fontSize:14,fontWeight:600,color:'#1a1410'}}>Business Photos</label>
          <span style={{fontSize:12,color: photoFiles.length >= 6 ? '#1a6b3a' : '#a89a8a',fontWeight:600}}>{photoFiles.length} of 6 photos</span>
        </div>
        {photoFiles.length > 0 && (
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
            {photoFiles.map((f,i)=>(
              <div key={i} style={{position:'relative',width:90,height:90}}>
                <img src={URL.createObjectURL(f)} alt={`Photo ${i+1}`} style={{width:90,height:90,objectFit:'cover',borderRadius:8,border:'1px solid #e8ddd0'}} />
                <button onClick={()=>setPhotoFiles(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:12,cursor:'pointer',lineHeight:'20px',textAlign:'center',padding:0}}>x</button>
              </div>
            ))}
          </div>
        )}
        {photoFiles.length < 6 && (
          <UploadZone label="Add Photos" accept="image/*" hint={`JPG, PNG — ${6 - photoFiles.length} more allowed`} multiple onChange={files => setPhotoFiles(p => [...p, ...files].slice(0,6))} />
        )}
      </div>

      <div className="form-grid">
        {form.insurance && (
          <div className="form-group"><label>Certificate of Insurance</label><UploadZone label="Insurance COI" accept=".pdf,image/*" hint="PDF or image — required for many events" onChange={file => setCoiFile(file)} /></div>
        )}
        <div className="form-group full"><label>Price Menu / Lookbook (Optional)</label><UploadZone label="Price Sheet / Lookbook" accept=".pdf,image/*" hint="PDF or image — helps hosts understand your offerings" onChange={file => setLookbookFile(file)} /></div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Videos & Social Links</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:16}}>Link your social profiles so hosts can see your work. No file uploads needed — just paste your links.</p>
      <div className="form-grid">
        <div className="form-group"><label>Website</label><input placeholder="https://yourwebsite.com" value={form.website} onChange={e=>set('website',e.target.value)} /></div>
        <div className="form-group"><label>Instagram</label><input placeholder="https://instagram.com/yourbusiness" value={form.instagram} onChange={e=>set('instagram',e.target.value)} /></div>
        <div className="form-group"><label>Facebook</label><input placeholder="https://facebook.com/yourbusiness" value={form.facebook} onChange={e=>set('facebook',e.target.value)} /></div>
        <div className="form-group"><label>TikTok</label><input placeholder="https://tiktok.com/@yourbusiness" value={form.tiktok} onChange={e=>set('tiktok',e.target.value)} /></div>
        <div className="form-group"><label>YouTube</label><input placeholder="https://youtube.com/@yourchannel" value={form.youtube||''} onChange={e=>set('youtube',e.target.value)} /></div>
        <div className="form-group"><label>Other Link</label><input placeholder="Etsy, Pinterest, Yelp, etc." value={form.otherSocial} onChange={e=>set('otherSocial',e.target.value)} /></div>
      </div>

      

      {showTos && <TosModal onClose={()=>setShowTos(false)} />}
      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that contacting or booking hosts discovered through this platform outside of South Jersey Vendor Market within 12 months is prohibited and subject to a finder's fee.</span>
        </label>
        <button className="btn-submit" disabled={submitting} onClick={async ()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} localStorage.removeItem(VENDOR_DRAFT_KEY); localStorage.removeItem(VENDOR_DRAFT_SUBS_KEY); setSubmitting(true); await onSubmit(form, { photoFiles, coiFile, lookbookFile }); setSubmitting(false); }} style={{ opacity: tosAgreed&&!submitting?1:0.5 }}>{submitting ? 'Submitting…' : 'Submit Vendor Profile →'}</button>
        <p style={{ fontSize:13, color:'#a89a8a', marginTop:12 }}>Your profile will be reviewed within 24 hours. Free during beta — <strong style={{ color:'#e8c97a' }}>$15/month</strong> once billing activates.</p>
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
  electricAvailable:true, tableProvided:false, tableSize:'6ft', allowDuplicateCategories:true,
  applyByDate:'', eventLink:'',
  budget:'', isTicketedEvent:false, ticketPrice:'', otherEventType:'', otherVendorCategory:'', notes:'', fullServiceBooking:false, servicesNeeded:[], needsMarketVendors:true, needsServiceProviders:false,
  vendorDiscovery:'both', password:''
};

function HostForm({ onSubmit, setTab, authUser, setShowAuthModal }) {
  const [tosAgreed, setTosAgreed] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [eventPhotos, setEventPhotos] = useState([]);
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
  useEffect(() => { const { password: _pw, ...draft } = form; localStorage.setItem(HOST_DRAFT_KEY, JSON.stringify(draft)); }, [form]);
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
      {!authUser && (
        <>
          <h2 className="form-section-title"><span className="dot" />Create Your Account</h2>
          <div style={{background:'#1a1410',borderRadius:12,padding:'20px 24px',marginBottom:24}}>
            <div style={{fontSize:14,color:'#e8c97a',fontWeight:700,marginBottom:4}}>Your host account lets you:</div>
            <div style={{fontSize:13,color:'#c8b898',lineHeight:1.6}}>Log in to manage your events, review vendor applications, and track booking requests from your dashboard.</div>
          </div>
          <div className="form-grid" style={{marginBottom:24}}>
            <div className="form-group"><label>Email *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            <div className="form-group"><label>Create Password *</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} /></div>
          </div>
          <div style={{fontSize:12,color:'#a89a8a',marginBottom:8,textAlign:'center'}}>
            Already have an account? <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:12,fontFamily:'DM Sans,sans-serif',textDecoration:'underline',padding:0}} onClick={()=>{if(setShowAuthModal)setShowAuthModal(true);}}>Log in</button> and your event will be linked.
          </div>
          <hr className="form-divider" />
        </>
      )}
      {authUser && (
        <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:10,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>✓</span>
          <div><div style={{fontWeight:700,fontSize:14,color:'#1a6b3a'}}>Logged in as {authUser.email}</div><div style={{fontSize:12,color:'#2d7a50'}}>Your event will be linked to this account.</div></div>
        </div>
      )}
      <h2 className="form-section-title"><span className="dot" />Host an Event</h2>
      <p style={{ color:'#7a6a5a', marginBottom:32, fontSize:15 }}>
        Tell us about your event and we'll match you with the perfect South Jersey vendors — based on your event zip code and the categories you need.
      </p>
      <div className="form-grid">
        <div className="form-group"><label>Organization / Business Name</label><input placeholder="Your org or event name" value={form.orgName} onChange={e=>set('orgName',e.target.value)} /></div>
        <div className="form-group"><label>Contact Name *</label><input placeholder="Your full name" value={form.contactName} onChange={e=>set('contactName',e.target.value)} /></div>
        {authUser && <div className="form-group"><label>Email *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>}
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
        <div className="form-group"><label>Apply By Date</label><input type="date" value={form.applyByDate} max={form.date || undefined} onChange={e=>set('applyByDate',e.target.value)} /><div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Deadline for vendors to apply</div></div>
        <div className="form-group full"><label>Event Website or Facebook Page <span style={{color:'#c0392b'}}>*</span></label><input type="url" value={form.eventLink} onChange={e=>set('eventLink',e.target.value)} placeholder="https://facebook.com/events/... or your event website" /><div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Official event page — used to verify your event</div></div>
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
        <div className="form-group"><label>Table / Space Size</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
        <div className="form-group"><label>Allow Multiple Vendors in Same Category?</label><select value={form.allowDuplicateCategories?'yes':'no'} onChange={e=>set('allowDuplicateCategories',e.target.value==='yes')}><option value="yes">Yes — multiple vendors per category OK</option><option value="no">No — one vendor per category only</option></select></div>
        <div className="form-group"><label>Vendor Booth Fee Offered</label><select value={form.budget} onChange={e=>set('budget',e.target.value)}><option value="">Select...</option><option>Free (vendor keeps all sales)</option><option>$25–$50/vendor</option><option>$50–$100/vendor</option><option>$100–$200/vendor</option><option>$200+/vendor</option></select></div>
        <div className="form-group"><label>Is This a Ticketed Event?</label>
          <div style={{display:'flex',gap:10}}>
            <button type="button" onClick={()=>set('isTicketedEvent',true)} style={{flex:1,padding:'10px',borderRadius:8,border:form.isTicketedEvent?'2px solid #c8a84b':'2px solid #e8ddd0',background:form.isTicketedEvent?'#fdf9f0':'#fff',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'DM Sans,sans-serif',color:'#1a1410'}}>Yes</button>
            <button type="button" onClick={()=>{set('isTicketedEvent',false);set('ticketPrice','');}} style={{flex:1,padding:'10px',borderRadius:8,border:!form.isTicketedEvent?'2px solid #c8a84b':'2px solid #e8ddd0',background:!form.isTicketedEvent?'#fdf9f0':'#fff',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'DM Sans,sans-serif',color:'#1a1410'}}>No</button>
          </div>
        </div>
        {form.isTicketedEvent && (
          <div className="form-group"><label>Ticket Price</label><input type="text" value={form.ticketPrice} onChange={e=>set('ticketPrice',e.target.value)} placeholder="e.g. $5, $10-$15, Free for kids" /></div>
        )}
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />What Type of Vendors Do You Need?</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:16}}>Select all that apply for your event.</p>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div onClick={()=>set('needsMarketVendors',!form.needsMarketVendors)}
          style={{flex:'1 1 220px',padding:'14px 18px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.needsMarketVendors?'#c8a850':'#e8ddd0'}`,background:form.needsMarketVendors?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:14,color:'#1a1410',marginBottom:2}}>Market Vendors</div>
          <div style={{fontSize:12,color:'#7a6a5a'}}>Product sellers who pay booth fees</div>
          {form.needsMarketVendors && <div style={{color:'#c8a850',fontSize:16,marginTop:4}}>&#10003;</div>}
        </div>
        <div onClick={()=>set('needsServiceProviders',!form.needsServiceProviders)}
          style={{flex:'1 1 220px',padding:'14px 18px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.needsServiceProviders?'#c8a850':'#e8ddd0'}`,background:form.needsServiceProviders?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:14,color:'#1a1410',marginBottom:2}}>Event Service Providers</div>
          <div style={{fontSize:12,color:'#7a6a5a'}}>Entertainment, photography, etc. — you pay them</div>
          {form.needsServiceProviders && <div style={{color:'#c8a850',fontSize:16,marginTop:4}}>&#10003;</div>}
        </div>
      </div>

      {form.needsMarketVendors && (
        <>
          <h3 className="form-section-title"><span className="dot" />Market Vendor Categories</h3>
          <p style={{ color:'#7a6a5a', fontSize:14, marginBottom:16 }}>Select the product categories you want at your event.</p>
          <CategorySubcategoryPicker
            categories={form.vendorCategories}
            subcategories={form.vendorSubcategories}
            onCategoriesChange={v=>set('vendorCategories',v)}
            onSubcategoriesChange={v=>set('vendorSubcategories',v)}
            otherCategory={form.otherVendorCategory} onOtherCategoryChange={v=>set('otherVendorCategory',v)}
            otherSubcategories={otherSubcategories} onOtherSubcategoryChange={(cat,val)=>setOtherSubcategories(p=>{const n={...p};if(val===null)delete n[cat];else n[cat]=val;return n;})}
          />
        </>
      )}

      {form.needsServiceProviders && (
        <>
          <hr className="form-divider" />
          <h3 className="form-section-title"><span className="dot" />Event Services Needed</h3>
      <p style={{ color:'#7a6a5a', fontSize:14, marginBottom:16 }}>Need entertainment, photography, or other services? Add them below.</p>
      {form.servicesNeeded.map((svc, idx) => (
        <div key={idx} style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>Service {idx+1}</div>
            <button onClick={()=>set('servicesNeeded',form.servicesNeeded.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',color:'#c0392b',cursor:'pointer',fontSize:12,fontFamily:'DM Sans,sans-serif'}}>Remove</button>
          </div>
          <div className="form-grid" style={{gap:10}}>
            <div className="form-group"><label>Service Type</label>
              <select value={svc.type} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],type:e.target.value};set('servicesNeeded',n);}}>
                <option value="">Select service...</option>
                {SERVICE_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
              {svc.type==='Other' && <input placeholder="Describe the service you need..." value={svc.otherType||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],otherType:e.target.value};set('servicesNeeded',n);}} style={{marginTop:6,width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />}
            </div>
            <div className="form-group"><label>Duration</label>
              <select value={svc.duration} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],duration:e.target.value};set('servicesNeeded',n);}}>
                {SERVICE_DURATIONS.map(d=><option key={d}>{d}</option>)}
              </select>
              {svc.duration==='Other' && <input placeholder="Describe duration needed..." value={svc.otherDuration||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],otherDuration:e.target.value};set('servicesNeeded',n);}} style={{marginTop:6,width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />}
            </div>
            <div className="form-group"><label>Budget</label>
              <select value={svc.budgetType} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],budgetType:e.target.value};set('servicesNeeded',n);}}>
                <option value="fixed">Fixed Amount</option>
                <option value="range">Budget Range</option>
                <option value="open">Open to Quotes</option>
              </select>
            </div>
            {svc.budgetType==='fixed' && <div className="form-group"><label>Amount</label><input type="text" placeholder="e.g. $500" value={svc.budgetAmount||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],budgetAmount:e.target.value};set('servicesNeeded',n);}} /></div>}
            {svc.budgetType==='range' && <>
              <div className="form-group"><label>Min</label><input type="text" placeholder="e.g. $200" value={svc.budgetMin||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],budgetMin:e.target.value};set('servicesNeeded',n);}} /></div>
              <div className="form-group"><label>Max</label><input type="text" placeholder="e.g. $800" value={svc.budgetMax||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],budgetMax:e.target.value};set('servicesNeeded',n);}} /></div>
            </>}
          </div>
          <div className="form-group" style={{marginTop:8}}><label>Specific Requirements</label><input placeholder="Any special needs or requests for this service..." value={svc.notes||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],notes:e.target.value};set('servicesNeeded',n);}} /></div>
        </div>
      ))}
      <button onClick={()=>set('servicesNeeded',[...form.servicesNeeded,{type:'',duration:'2 hours',budgetType:'open',budgetAmount:'',budgetMin:'',budgetMax:'',notes:''}])}
        style={{background:'#fff',border:'2px dashed #e8ddd0',borderRadius:10,padding:'12px 20px',width:'100%',cursor:'pointer',fontSize:14,fontWeight:600,color:'#7a6a5a',fontFamily:'DM Sans,sans-serif',marginBottom:16}}>
        + Add a Service
      </button>
        </>
      )}

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />How Would You Like to Find Vendors?</h3>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        {[
          { val:'browse', label:'Browse & Invite Only', desc:'You browse matched vendors and send invitations yourself.' },
          { val:'apply', label:'Allow Vendors to Apply', desc:'Vendors who match your event can apply directly. You review and confirm.' },
          { val:'both', label:'Both (Recommended)', desc:'You can browse and invite vendors, plus vendors can find and apply to your event.' },
        ].map(opt => (
          <div key={opt.val}
            onClick={()=>set('vendorDiscovery',opt.val)}
            style={{
              background: form.vendorDiscovery===opt.val ? '#1a1410' : '#fff',
              border: `2px solid ${form.vendorDiscovery===opt.val ? '#e8c97a' : '#e8ddd0'}`,
              borderRadius:10, padding:'14px 18px', cursor:'pointer', transition:'all 0.2s'
            }}>
            <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',margin:0}}>
              <input type="radio" name="vendorDiscovery" checked={form.vendorDiscovery===opt.val}
                onChange={()=>set('vendorDiscovery',opt.val)}
                style={{width:18,height:18,marginTop:2,flexShrink:0,accentColor:'#e8c97a'}} />
              <div>
                <div style={{fontWeight:700,fontSize:14,color:form.vendorDiscovery===opt.val?'#e8c97a':'#1a1410'}}>{opt.label}</div>
                <div style={{fontSize:12,color:form.vendorDiscovery===opt.val?'#c8b898':'#7a6a5a',marginTop:2}}>{opt.desc}</div>
              </div>
            </label>
          </div>
        ))}
      </div>

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
      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Event Photos (Optional)</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:12}}>Upload event flyers, venue photos, or past event photos to attract vendors.</p>
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:600}}>Photos</span>
          <span style={{fontSize:12,color:eventPhotos.length>=6?'#1a6b3a':'#a89a8a',fontWeight:600}}>{eventPhotos.length} of 6</span>
        </div>
        {eventPhotos.length > 0 && (
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
            {eventPhotos.map((f,i)=>(
              <div key={i} style={{position:'relative',width:80,height:80}}>
                <img src={URL.createObjectURL(f)} alt={`Photo ${i+1}`} style={{width:80,height:80,objectFit:'cover',borderRadius:6,border:'1px solid #e8ddd0'}} />
                <button onClick={()=>setEventPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:10,cursor:'pointer',lineHeight:'18px',textAlign:'center',padding:0}}>x</button>
              </div>
            ))}
          </div>
        )}
        {eventPhotos.length < 6 && (
          <label style={{display:'block',background:'#fdf9f5',border:'1.5px dashed #e8ddd0',borderRadius:8,padding:'10px',textAlign:'center',cursor:'pointer',fontSize:13,color:'#7a6a5a'}}>
            + Add Photos ({6 - eventPhotos.length} remaining)
            <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{const files=Array.from(e.target.files);setEventPhotos(p=>[...p,...files].slice(0,6));e.target.value='';}} />
          </label>
        )}
      </div>

      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that vendors discovered through this platform may not be contacted or booked outside of South Jersey Vendor Market within 12 months without a finder's fee.</span>
        </label>
        {showTos && <TosModal onClose={()=>setShowTos(false)} />}
        <button className="btn-submit" onClick={()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} localStorage.removeItem(HOST_DRAFT_KEY); localStorage.removeItem(HOST_DRAFT_SUBS_KEY); onSubmit(form, { eventPhotos }); }} style={{ opacity: tosAgreed?1:0.5 }}>Find My Vendors →</button>
      </div>
    </div>
  );
}

// ─── Event Guest Signup Modal ─────────────────────────────────────────────────
function EventGoerSignupModal({ onClose, onSuccess, defaultEmail, defaultName }) {
  const [form, setForm] = useState({ name:defaultName||'', email:defaultEmail||'', zip:'', radius:20, eventTypes:[], wantsAlerts:true, frequency:'weekly' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const allTypes = EVENT_TYPES.filter(t=>t!=='Other');
  const allSelected = allTypes.every(t=>form.eventTypes.includes(t));
  const toggleType = (t) => setForm(f=>({...f, eventTypes: f.eventTypes.includes(t) ? f.eventTypes.filter(x=>x!==t) : [...f.eventTypes, t]}));
  const toggleAll = () => setForm(f=>({...f, eventTypes: allSelected ? [] : [...allTypes]}));

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Please enter your name and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) { setError('Please enter a valid email.'); return; }
    if (!form.zip || !/^\d{5}$/.test(form.zip)) { setError('Please enter a valid 5-digit zip code.'); return; }
    if (form.eventTypes.length === 0) { setError('Please select at least one event type.'); return; }
    setSaving(true); setError('');
    const { error: dbErr } = await supabase.from('event_goers').upsert({
      name: form.name, email: form.email, zip: form.zip, radius: form.radius,
      event_types: form.eventTypes, email_frequency: form.wantsAlerts ? form.frequency : 'none', active: true,
    }, { onConflict: 'email' });
    if (dbErr) { setError('Failed to save. Please try again.'); setSaving(false); return; }
    setSaved(true); setSaving(false);
    // Send welcome email
    fetch('/api/send-guest-welcome', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email:form.email, name:form.name, zip:form.zip, radius:form.radius, eventTypes:form.eventTypes, frequency: form.wantsAlerts ? form.frequency : 'none' }),
    }).catch(()=>{});
    if (onSuccess) onSuccess();
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:500,width:'100%',overflow:'hidden',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{background:'#1a1410',padding:'20px 28px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>Never Miss a Market</div>
          <div style={{fontSize:13,color:'#a89a8a',marginTop:4}}>Get personalized event alerts delivered to your inbox</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {saved ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>&#10003;</div>
              <div style={{fontSize:16,fontWeight:700,color:'#1a6b3a',marginBottom:8}}>You're signed up!</div>
              <div style={{fontSize:14,color:'#7a6a5a',marginBottom:20}}>{form.wantsAlerts ? `We'll send you a personalized list of upcoming events ${form.frequency === 'weekly' ? 'every week' : 'every two weeks'}.` : 'You can browse upcoming events anytime on our site.'}</div>
              <button onClick={onClose} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          ) : (
            <>
              <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div className="form-group"><label>Name <span style={{color:'#c0392b'}}>*</span></label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your name" /></div>
                <div className="form-group"><label>Email <span style={{color:'#c0392b'}}>*</span></label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@email.com" /></div>
                <div className="form-group"><label>Zip Code <span style={{color:'#c0392b'}}>*</span></label><input value={form.zip} onChange={e=>set('zip',e.target.value.replace(/\D/g,'').slice(0,5))} placeholder="08033" maxLength={5} /></div>
                <div className="form-group"><label>How Far You'll Travel</label>
                  <select value={form.radius} onChange={e=>set('radius',+e.target.value)}>
                    {[5,10,15,20,30,50].map(r=><option key={r} value={r}>{r} miles</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#1a1410'}}>Event Types You're Interested In <span style={{color:'#c0392b'}}>*</span></label>
                  <button onClick={toggleAll} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'3px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{allSelected ? '✓ All Selected' : 'Select All'}</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {allTypes.map(t=>(
                    <button key={t} onClick={()=>toggleType(t)} style={{
                      padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',
                      fontFamily:'DM Sans,sans-serif',border:'1.5px solid',transition:'all 0.15s',
                      background: form.eventTypes.includes(t) ? '#c8a850' : '#fff',
                      color: form.eventTypes.includes(t) ? '#1a1410' : '#7a6a5a',
                      borderColor: form.eventTypes.includes(t) ? '#c8a850' : '#e8ddd0',
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:'#1a1410',display:'block',marginBottom:8}}>Would you like email alerts about upcoming events?</label>
                <div style={{display:'flex',gap:10,marginBottom:form.wantsAlerts?10:0}}>
                  <button onClick={()=>set('wantsAlerts',true)} style={{flex:1,padding:'10px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:'2px solid',background:form.wantsAlerts?'#fdf9f0':'#fff',borderColor:form.wantsAlerts?'#c8a850':'#e8ddd0',color:'#1a1410'}}>Yes, keep me posted</button>
                  <button onClick={()=>set('wantsAlerts',false)} style={{flex:1,padding:'10px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:'2px solid',background:!form.wantsAlerts?'#fdf9f0':'#fff',borderColor:!form.wantsAlerts?'#c8a850':'#e8ddd0',color:'#1a1410'}}>No thanks</button>
                </div>
                {form.wantsAlerts && (
                  <div>
                    <label style={{fontSize:12,color:'#7a6a5a',display:'block',marginBottom:6}}>How often?</label>
                    <div style={{display:'flex',gap:10}}>
                      {[{val:'weekly',label:'Every Week'},{val:'biweekly',label:'Every 2 Weeks'}].map(o=>(
                        <button key={o.val} onClick={()=>set('frequency',o.val)} style={{
                          flex:1,padding:'10px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',
                          fontFamily:'DM Sans,sans-serif',border:'2px solid',
                          background: form.frequency===o.val ? '#fdf9f0' : '#fff',
                          borderColor: form.frequency===o.val ? '#c8a850' : '#e8ddd0',
                          color:'#1a1410',
                        }}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'8px 12px'}}>{error}</div>}
              <button onClick={handleSave} disabled={saving} style={{width:'100%',background:'#c8a850',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:saving?0.6:1}}>
                {saving ? 'Signing up...' : 'Get Event Alerts'}
              </button>
              <div style={{fontSize:11,color:'#a89a8a',textAlign:'center',marginTop:8}}>Free forever. Unsubscribe anytime.</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Contact Modal ───────────────────────────────────────────────────────────
function ContactModal({ onClose, defaultSubject, defaultMessage, userName, userEmail }) {
  const [form, setForm] = useState({ name: userName||'', email: userEmail||'', subject: defaultSubject||'', message: defaultMessage||'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!form.email || !form.message) { setError('Please provide your email and message.'); return; }
    setSending(true); setError('');
    try {
      const resp = await fetch('/api/send-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (resp.ok) { setSent(true); }
      else { setError('Failed to send. Please try again or email support@southjerseyvendormarket.com directly.'); }
    } catch { setError('Failed to send. Please try again or email support@southjerseyvendormarket.com directly.'); }
    setSending(false);
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:480,width:'100%',overflow:'hidden'}}>
        <div style={{background:'#1a1410',padding:'24px 28px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>Contact Us</div>
          <div style={{fontSize:13,color:'#a89a8a',marginTop:4}}>We typically respond within 24 hours</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {sent ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>✓</div>
              <div style={{fontSize:16,fontWeight:700,color:'#1a6b3a',marginBottom:8}}>Thanks for reaching out!</div>
              <div style={{fontSize:14,color:'#7a6a5a',marginBottom:20}}>We typically respond within 24 hours.</div>
              <button onClick={onClose} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          ) : (
            <>
              <div className="form-group" style={{marginBottom:10}}><label>Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name" /></div>
              <div className="form-group" style={{marginBottom:10}}><label>Email <span style={{color:'#c0392b'}}>*</span></label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@email.com" /></div>
              <div className="form-group" style={{marginBottom:10}}><label>Subject</label><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="What's this about?" /></div>
              <div className="form-group" style={{marginBottom:14}}><label>Message <span style={{color:'#c0392b'}}>*</span></label><textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="How can we help?" style={{minHeight:100,resize:'vertical'}} /></div>
              {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'8px 12px'}}>{error}</div>}
              <button onClick={handleSend} disabled={sending} style={{width:'100%',background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:sending?0.6:1}}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback Modal ──────────────────────────────────────────────────────────
function FeedbackModal({ onClose, userEmail }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [liked, setLiked] = useState('');
  const [improve, setImprove] = useState('');
  const [role, setRole] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!role) { setError('Please select your role.'); return; }
    setSending(true); setError('');
    try {
      const resp = await fetch('/api/send-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: role,
          email: userEmail || 'anonymous@feedback.sjvm',
          subject: `Feedback: ${rating} stars from ${role}`,
          message: `Rating: ${rating}/5 stars\nRole: ${role}\n\nWhat they liked:\n${liked || '(not provided)'}\n\nWhat could be improved:\n${improve || '(not provided)'}`,
        }),
      });
      if (resp.ok) setSent(true);
      else setError('Failed to send. Please try again.');
    } catch { setError('Failed to send. Please try again.'); }
    setSending(false);
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:440,width:'100%',overflow:'hidden'}}>
        <div style={{background:'#1a1410',padding:'20px 28px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>Share Your Feedback</div>
          <div style={{fontSize:13,color:'#a89a8a',marginTop:4}}>Help us improve South Jersey Vendor Market</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {sent ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>&#10003;</div>
              <div style={{fontSize:16,fontWeight:700,color:'#1a6b3a',marginBottom:8}}>Thanks for your feedback!</div>
              <div style={{fontSize:14,color:'#7a6a5a',marginBottom:20}}>We read every response and use it to make the platform better.</div>
              <button onClick={onClose} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          ) : (
            <>
              {/* Star rating */}
              <div style={{marginBottom:16}}>
                <label style={{fontSize:13,fontWeight:600,color:'#1a1410',display:'block',marginBottom:6}}>Overall Rating <span style={{color:'#c0392b'}}>*</span></label>
                <div style={{display:'flex',gap:4}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setRating(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                      style={{background:'none',border:'none',fontSize:32,cursor:'pointer',color:(hover||rating)>=n?'#e8c97a':'#e0d5c5',transition:'color 0.1s',padding:0,lineHeight:1}}>
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>
              {/* Role */}
              <div style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:'#1a1410',display:'block',marginBottom:6}}>I am a... <span style={{color:'#c0392b'}}>*</span></label>
                <div style={{display:'flex',gap:8}}>
                  {['Vendor','Host','Visitor'].map(r=>(
                    <button key={r} onClick={()=>setRole(r)} style={{
                      flex:1,padding:'8px 0',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',
                      border:role===r?'2px solid #c8a84b':'2px solid #e8ddd0',
                      background:role===r?'#fdf9f0':'#fff',color:'#1a1410',
                    }}>{r}</button>
                  ))}
                </div>
              </div>
              {/* Text fields */}
              <div className="form-group" style={{marginBottom:10}}>
                <label>What did you like?</label>
                <textarea value={liked} onChange={e=>setLiked(e.target.value)} placeholder="What's working well..." style={{minHeight:60,resize:'vertical'}} />
              </div>
              <div className="form-group" style={{marginBottom:14}}>
                <label>What could be improved?</label>
                <textarea value={improve} onChange={e=>setImprove(e.target.value)} placeholder="Anything we should do differently..." style={{minHeight:60,resize:'vertical'}} />
              </div>
              {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'8px 12px'}}>{error}</div>}
              <button onClick={handleSend} disabled={sending} style={{width:'100%',background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:sending?0.6:1}}>
                {sending ? 'Sending...' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuth, defaultEmail, setTab, setShowEventGoerSignup }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [roles, setRoles] = useState({ vendor: false, host: false, eventGoer: false });
  const [signupRoles, setSignupRoles] = useState(null);

  const toggleRole = (role) => setRoles(r => ({ ...r, [role]: !r[role] }));

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (mode === 'signup' && !roles.vendor && !roles.host && !roles.eventGoer) { setError('Please select at least one role.'); return; }
    setLoading(true); setError('');
    if (mode === 'signup') {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
      setSignupRoles({...roles});
      setConfirmSent(true);
      setLoading(false);
      return;
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setError(signInErr.message); setLoading(false); return; }
    }
    setLoading(false);
    if (onAuth) onAuth();
    onClose();
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
    if (resetErr) { setError(resetErr.message); return; }
    setResetSent(true);
  };

  const roleBtn = (role, label, emoji, desc) => (
    <button onClick={()=>toggleRole(role)} style={{
      flex:1, minWidth:140, padding:'14px 12px', borderRadius:10, cursor:'pointer',
      border: roles[role] ? '2px solid #c8a84b' : '2px solid #e8ddd0',
      background: roles[role] ? '#fdf9f0' : '#fff',
      fontFamily:'DM Sans,sans-serif', textAlign:'center', transition:'all 0.15s',
    }}>
      <div style={{fontSize:22,marginBottom:4}}>{emoji}</div>
      <div style={{fontSize:14,fontWeight:700,color:'#1a1410'}}>{label}</div>
      <div style={{fontSize:11,color:'#7a6a5a',marginTop:2}}>{desc}</div>
      {roles[role] && <div style={{color:'#c8a84b',fontSize:16,marginTop:4}}>&#10003;</div>}
    </button>
  );

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:440,width:'100%',overflow:'hidden'}}>
        <div style={{background:'#1a1410',padding:'24px 28px',textAlign:'center'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>
            {mode==='login' ? 'Welcome Back' : 'Create Account'}
          </div>
          <div style={{fontSize:13,color:'#a89a8a',marginTop:4}}>South Jersey Vendor Market</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {resetSent ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:28,marginBottom:8}}>📧</div>
              <div style={{fontSize:15,fontWeight:600,color:'#1a6b3a',marginBottom:8}}>Check your email</div>
              <div style={{fontSize:13,color:'#7a6a5a'}}>We sent a password reset link to {email}</div>
              <button onClick={onClose} style={{marginTop:16,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          ) : confirmSent ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>📧</div>
              <div style={{fontSize:16,fontWeight:700,color:'#1a6b3a',marginBottom:8}}>Check your email to confirm</div>
              <div style={{fontSize:14,color:'#7a6a5a',marginBottom:8}}>We sent a confirmation link to <strong>{email}</strong></div>
              <div style={{fontSize:13,color:'#a89a8a',marginBottom:16,lineHeight:1.5}}>Click the link in the email to activate your account, then come back and log in.</div>
              {signupRoles && (
                <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',marginBottom:16,textAlign:'left',fontSize:13,color:'#7a6a5a',lineHeight:1.6}}>
                  <div style={{fontWeight:700,color:'#1a1410',marginBottom:6}}>After you confirm, here's what's next:</div>
                  {signupRoles.vendor && <div>• Complete your vendor profile to start getting matched with events</div>}
                  {signupRoles.eventGoer && <div>• Set up your event preferences so we can send you personalized market alerts</div>}
                  {signupRoles.host && <div>• Your host dashboard will be ready — post your first event whenever you're ready</div>}
                </div>
              )}
              <button onClick={()=>{
                // Save roles for post-login routing
                if (signupRoles) localStorage.setItem('sjvm_pending_roles', JSON.stringify(signupRoles));
                onClose();
              }} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Got it</button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:600,color:'#1a1410',marginBottom:8,display:'block'}}>I am a... <span style={{fontWeight:400,color:'#a89a8a'}}>(select all that apply)</span></label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {roleBtn('vendor', 'Vendor', '🛍️', 'Sell products or services at events')}
                    {roleBtn('host', 'Event Host', '🎪', 'Organize events and find vendors')}
                    {roleBtn('eventGoer', 'Event Guest', '📍', 'Discover local markets near me')}
                  </div>
                  {(roles.vendor && roles.host) || (roles.vendor && roles.eventGoer) || (roles.host && roles.eventGoer) ? (
                    <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'8px 12px',marginTop:10,fontSize:12,color:'#1a4a6b'}}>
                      You'll have access to all selected features under one account.
                    </div>
                  ) : null}
                </div>
              )}
              <div className="form-group" style={{marginBottom:12}}>
                <label>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                  onKeyDown={e=>{if(e.key==='Enter')handleSubmit();}} />
              </div>
              <div className="form-group" style={{marginBottom:16}}>
                <label>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder={mode==='signup'?'Create a password (min 6 chars)':'Your password'}
                  onKeyDown={e=>{if(e.key==='Enter')handleSubmit();}} />
              </div>
              {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'8px 12px'}}>{error}</div>}
              <button onClick={handleSubmit} disabled={loading}
                style={{width:'100%',background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',marginBottom:12,opacity:loading?0.5:1}}>
                {loading ? 'Please wait...' : mode==='login' ? 'Log In' : 'Sign Up'}
              </button>
              <div style={{textAlign:'center',fontSize:13,color:'#7a6a5a'}}>
                {mode==='login' ? (
                  <>
                    <button onClick={handleReset} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif',textDecoration:'underline',padding:0}}>Forgot password?</button>
                    <span style={{margin:'0 8px'}}>·</span>
                    <button onClick={()=>{setMode('signup');setError('');}} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif',textDecoration:'underline',padding:0}}>Create account</button>
                  </>
                ) : (
                  <>Already have an account? <button onClick={()=>{setMode('login');setError('');}} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif',textDecoration:'underline',padding:0}}>Log in</button></>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────
function VendorDashboard({ user, vendorProfile, bookingRequests, setTab, setShowContactModal, setShowFeedbackModal, setVendorProfile }) {
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editPhotos, setEditPhotos] = useState([]);       // new File objects to add
  const [existingPhotos, setExistingPhotos] = useState([]); // existing URLs
  const [newCoi, setNewCoi] = useState(null);
  const [newLookbook, setNewLookbook] = useState(null);
  const m = vendorProfile?.metadata || {};
  const [editForm, setEditForm] = useState({
    name: vendorProfile?.name||'', contact_name: vendorProfile?.contact_name||'', contact_email: vendorProfile?.contact_email||'',
    contact_phone: vendorProfile?.contact_phone||'', home_zip: vendorProfile?.home_zip||'', radius: vendorProfile?.radius||20,
    description: vendorProfile?.description||'', website: vendorProfile?.website||'', instagram: vendorProfile?.instagram||'',
    facebook: m.facebook||'', tiktok: m.tiktok||'', youtube: m.youtube||'', otherSocial: m.otherSocial||'',
  });
  const ef = (k,v) => setEditForm(f=>({...f,[k]:v}));
  const SIGNIFICANT_FIELDS = ['home_zip','radius'];

  const saveProfile = async () => {
    setSaving(true);
    const vp = vendorProfile;
    const vid = vp.id;
    const bucket = 'vendor-files';
    const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const uploadFile = async (file, path) => {
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { console.error('Upload error:', upErr); return null; }
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    };

    // Upload new photos
    let photoUrls = [...existingPhotos];
    if (editPhotos.length > 0) {
      const startIdx = existingPhotos.length;
      const newUrls = await Promise.all(editPhotos.map((f, i) => uploadFile(f, `${vid}/photos/${startIdx+i}-${safeName(f.name)}`)));
      photoUrls = [...photoUrls, ...newUrls.filter(Boolean)];
    }

    // Upload new COI
    let coiUrl = m.coiUrl || null;
    if (newCoi) {
      const url = await uploadFile(newCoi, `${vid}/coi/${safeName(newCoi.name)}`);
      if (url) coiUrl = url;
    }

    // Upload new lookbook
    let lookbookUrl = m.lookbookUrl || null;
    if (newLookbook) {
      const url = await uploadFile(newLookbook, `${vid}/lookbook/${safeName(newLookbook.name)}`);
      if (url) lookbookUrl = url;
    }

    // Detect profile field changes (not file changes)
    const changes = {};
    if (editForm.name !== vp.name) changes.name = {old:vp.name, new:editForm.name};
    if (editForm.contact_name !== vp.contact_name) changes.contact_name = {old:vp.contact_name, new:editForm.contact_name};
    if (editForm.contact_phone !== (vp.contact_phone||'')) changes.contact_phone = {old:vp.contact_phone, new:editForm.contact_phone};
    if (editForm.home_zip !== vp.home_zip) changes.home_zip = {old:vp.home_zip, new:editForm.home_zip};
    if (editForm.radius !== vp.radius) changes.radius = {old:vp.radius, new:editForm.radius};
    if (editForm.description !== (vp.description||'')) changes.description = {old:'(updated)', new:'(updated)'};

    const hasProfileChanges = Object.keys(changes).length > 0;
    const hasFileChanges = editPhotos.length > 0 || existingPhotos.length !== (m.photoUrls||[]).length || newCoi || newLookbook;

    if (!hasProfileChanges && !hasFileChanges) { setEditing(false); setSaving(false); return; }

    const newMeta = { ...m, facebook:editForm.facebook||null, tiktok:editForm.tiktok||null, youtube:editForm.youtube||null, otherSocial:editForm.otherSocial||null, photoUrls, coiUrl, lookbookUrl };
    const updatePayload = {
      name: editForm.name, contact_name: editForm.contact_name, contact_phone: editForm.contact_phone||null,
      home_zip: editForm.home_zip, radius: editForm.radius, description: editForm.description,
      website: editForm.website||null, instagram: editForm.instagram||null,
      metadata: newMeta,
    };
    // Only require re-approval for profile field changes, not file-only changes
    if (hasProfileChanges) updatePayload.status = 'pending';

    const { error } = await supabase.from('vendors').update(updatePayload).eq('id', vid);
    if (error) { alert('Failed to save: ' + error.message); setSaving(false); return; }

    if (hasProfileChanges) {
      supabase.from('change_log').insert({ entity_type:'vendor', entity_id:vid, entity_name:editForm.name, changed_by:user.email, changes, significant:true }).catch(()=>{});
      fetch('/api/send-contact', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:'Admin Alert', email:'system@sjvm.app', subject:`Vendor Profile Updated: ${editForm.name} — Needs Re-Approval`, message:`${editForm.name} updated their profile:\n${Object.entries(changes).map(([k,v])=>`${k}: ${v.old} → ${v.new}`).join('\n')}\n\nVendor status set to pending. Review in admin panel.` }),
      }).catch(()=>{});
    }

    // Refresh profile
    const { data: updated } = await supabase.from('vendors').select('*').eq('id', vid).single();
    if (updated && setVendorProfile) setVendorProfile(updated);
    setEditing(false); setSaving(false);
    alert(hasProfileChanges ? 'Changes saved! Your profile has been submitted for admin review.' : 'Photos and documents updated successfully!');
  };
  const [subMessage, setSubMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const subStatus = params.get('subscription');
    if (subStatus === 'success') return { type: 'success', text: 'Subscription activated! Thank you for subscribing.' };
    if (subStatus === 'canceled') return { type: 'info', text: 'Subscription checkout was canceled. You can subscribe anytime.' };
    return null;
  });

  // Clean up URL params after reading them
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription')) {
      params.delete('subscription');
      params.delete('tab');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    if (!vendorProfile?.id) { setLoadingReqs(false); return; }
    supabase.from('booking_requests').select('*')
      .eq('vendor_id', vendorProfile.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRequests(data); setLoadingReqs(false); });
  }, [vendorProfile?.id]);

  const respond = async (reqId, status) => {
    const { error } = await supabase.from('booking_requests')
      .update({ status, responded_at: new Date().toISOString() }).eq('id', reqId);
    if (error) { alert('Failed to update. Try again.'); return; }
    setRequests(r => r.map(x => x.id === reqId ? { ...x, status } : x));
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorProfile.id,
          vendorEmail: vendorProfile.contact_email || user.email,
          vendorName: vendorProfile.name,
        }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout. Please try again.');
        setSubscribing(false);
      }
    } catch (err) {
      alert('Failed to connect to payment service. Please try again.');
      setSubscribing(false);
    }
  };

  const subStatus = vendorProfile?.subscription_status || 'none';
  const isApproved = vendorProfile?.status === 'approved';

  return (
    <div className="section" style={{maxWidth:900}}>
      <div className="section-title">My Vendor Dashboard</div>
      <p className="section-sub">Welcome back, {vendorProfile?.name || user.email}</p>

      {vendorProfile?.founding_vendor && (
        <div style={{background:'linear-gradient(135deg,#1a1410,#2d2118)',border:'2px solid #c8a850',borderRadius:10,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:24}}>⭐</span>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:'#e8c97a'}}>Founding Vendor</div>
            <div style={{fontSize:12,color:'#b8a888'}}>You are a founding member of South Jersey Vendor Market. Your listing is permanently active — no subscription required, ever.</div>
          </div>
        </div>
      )}

      {subMessage && (
        <div style={{
          background: subMessage.type === 'success' ? '#d4f4e0' : '#e8f4fd',
          border: `1px solid ${subMessage.type === 'success' ? '#b8e8c8' : '#b8d8f0'}`,
          borderRadius: 10, padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ fontSize: 14, color: subMessage.type === 'success' ? '#1a6b3a' : '#1a4a6b', fontWeight: 600 }}>
            {subMessage.type === 'success' ? '✓ ' : ''}{subMessage.text}
          </div>
          <button onClick={() => setSubMessage(null)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#a89a8a', padding: 0 }}>×</button>
        </div>
      )}

      <div style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:12,padding:24,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,margin:0}}>My Profile</h3>
          <button onClick={()=>{if(editing){setEditing(false);}else{setEditForm({name:vendorProfile?.name||'',contact_name:vendorProfile?.contact_name||'',contact_email:vendorProfile?.contact_email||'',contact_phone:vendorProfile?.contact_phone||'',home_zip:vendorProfile?.home_zip||'',radius:vendorProfile?.radius||20,description:vendorProfile?.description||'',website:vendorProfile?.website||'',instagram:vendorProfile?.instagram||'',facebook:m.facebook||'',tiktok:m.tiktok||'',youtube:m.youtube||'',otherSocial:m.otherSocial||''});setExistingPhotos(m.photoUrls||[]);setEditPhotos([]);setNewCoi(null);setNewLookbook(null);setEditing(true);}}} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{editing?'Cancel':'Edit Profile'}</button>
        </div>
        {editing ? (
          <>
            <div className="form-grid" style={{gap:10,marginBottom:14}}>
              <div className="form-group"><label>Business Name</label><input value={editForm.name} onChange={e=>ef('name',e.target.value)} /></div>
              <div className="form-group"><label>Contact Name</label><input value={editForm.contact_name} onChange={e=>ef('contact_name',e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input value={editForm.contact_phone} onChange={e=>ef('contact_phone',e.target.value)} /></div>
              <div className="form-group"><label>Zip Code</label><input value={editForm.home_zip} onChange={e=>ef('home_zip',e.target.value.replace(/\D/g,'').slice(0,5))} maxLength={5} /></div>
              <div className="form-group"><label>Travel Radius</label><select value={editForm.radius} onChange={e=>ef('radius',+e.target.value)}>{[5,10,15,20,30,50].map(r=><option key={r} value={r}>{r} miles</option>)}</select></div>
              <div className="form-group full"><label>Description</label><textarea value={editForm.description} onChange={e=>ef('description',e.target.value)} style={{minHeight:60}} /></div>
              <div className="form-group"><label>Website</label><input value={editForm.website} onChange={e=>ef('website',e.target.value)} /></div>
              <div className="form-group"><label>Instagram</label><input value={editForm.instagram} onChange={e=>ef('instagram',e.target.value)} /></div>
              <div className="form-group"><label>Facebook</label><input value={editForm.facebook} onChange={e=>ef('facebook',e.target.value)} /></div>
              <div className="form-group"><label>TikTok</label><input value={editForm.tiktok} onChange={e=>ef('tiktok',e.target.value)} /></div>
              <div className="form-group"><label>YouTube</label><input value={editForm.youtube} onChange={e=>ef('youtube',e.target.value)} /></div>
              <div className="form-group"><label>Other Link</label><input value={editForm.otherSocial} onChange={e=>ef('otherSocial',e.target.value)} /></div>
            </div>
            {/* Photos */}
            <div style={{marginTop:16,marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <label style={{fontSize:14,fontWeight:600}}>Business Photos</label>
                <span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>{existingPhotos.length + editPhotos.length} of 6</span>
              </div>
              {(existingPhotos.length > 0 || editPhotos.length > 0) && (
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                  {existingPhotos.map((url,i)=>(
                    <div key={'ex'+i} style={{position:'relative',width:80,height:80}}>
                      <img src={url} alt={`Photo ${i+1}`} style={{width:80,height:80,objectFit:'cover',borderRadius:6,border:'1px solid #e8ddd0'}} />
                      <button onClick={()=>setExistingPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:10,cursor:'pointer',lineHeight:'18px',textAlign:'center',padding:0}}>x</button>
                    </div>
                  ))}
                  {editPhotos.map((f,i)=>(
                    <div key={'new'+i} style={{position:'relative',width:80,height:80}}>
                      <img src={URL.createObjectURL(f)} alt={`New ${i+1}`} style={{width:80,height:80,objectFit:'cover',borderRadius:6,border:'2px solid #c8a850'}} />
                      <button onClick={()=>setEditPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:10,cursor:'pointer',lineHeight:'18px',textAlign:'center',padding:0}}>x</button>
                    </div>
                  ))}
                </div>
              )}
              {existingPhotos.length + editPhotos.length < 6 && (
                <label style={{display:'block',background:'#fdf9f5',border:'1.5px dashed #e8ddd0',borderRadius:8,padding:'10px',textAlign:'center',cursor:'pointer',fontSize:13,color:'#7a6a5a'}}>
                  + Add Photos ({6 - existingPhotos.length - editPhotos.length} remaining)
                  <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{const files=Array.from(e.target.files);setEditPhotos(p=>[...p,...files].slice(0,6-existingPhotos.length));e.target.value='';}} />
                </label>
              )}
            </div>
            {/* COI */}
            <div style={{marginBottom:10}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:4}}>Certificate of Insurance</label>
              {m.coiUrl && !newCoi && <div style={{fontSize:12,marginBottom:4}}><a href={m.coiUrl} target="_blank" rel="noopener noreferrer" style={{color:'#1a6b3a'}}>📄 Current COI uploaded</a></div>}
              {newCoi && <div style={{fontSize:12,color:'#c8a850',marginBottom:4}}>New file: {newCoi.name}</div>}
              <label style={{display:'inline-block',background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',color:'#7a6a5a'}}>
                {m.coiUrl ? 'Replace COI' : 'Upload COI'}
                <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>{if(e.target.files[0])setNewCoi(e.target.files[0]);}} />
              </label>
            </div>
            {/* Lookbook */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:4}}>Price Menu / Lookbook</label>
              {m.lookbookUrl && !newLookbook && <div style={{fontSize:12,marginBottom:4}}><a href={m.lookbookUrl} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b'}}>📋 Current lookbook uploaded</a></div>}
              {newLookbook && <div style={{fontSize:12,color:'#c8a850',marginBottom:4}}>New file: {newLookbook.name}</div>}
              <label style={{display:'inline-block',background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',color:'#7a6a5a'}}>
                {m.lookbookUrl ? 'Replace Lookbook' : 'Upload Lookbook'}
                <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>{if(e.target.files[0])setNewLookbook(e.target.files[0]);}} />
              </label>
            </div>
            <div style={{fontSize:12,color:'#7a6a5a',marginBottom:12,background:'#fdf9f5',padding:'8px 12px',borderRadius:6}}>Photo and document updates save immediately without requiring re-approval. Other profile changes require admin review.</div>
            <button onClick={saveProfile} disabled={saving} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:saving?0.6:1}}>{saving?'Saving...':'Save Changes'}</button>
          </>
        ) : (
          <div className="modal-2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Business:</span> {vendorProfile?.name}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Contact:</span> {vendorProfile?.contact_name}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Email:</span> {vendorProfile?.contact_email}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Phone:</span> {vendorProfile?.contact_phone || '—'}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Zip:</span> {vendorProfile?.home_zip}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Radius:</span> {vendorProfile?.radius}mi</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Category:</span> {vendorProfile?.category}</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Status:</span> <span style={{background:vendorProfile?.status==='approved'?'#d4f4e0':'#fdf4dc',color:vendorProfile?.status==='approved'?'#1a6b3a':'#7a5a10',padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:600}}>{vendorProfile?.status || 'pending'}</span></div>
          </div>
        )}
      </div>

      {/* Subscription Card */}
      <div style={{background:'#fff',border: subStatus === 'active' ? '2px solid #b8e8c8' : '2px solid #e8c97a',borderRadius:12,padding:24,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div>
            <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,margin:'0 0 4px'}}>Subscription</h3>
            {subStatus === 'active' && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{background:'#d4f4e0',color:'#1a6b3a',padding:'3px 10px',borderRadius:10,fontSize:11,fontWeight:700}}>Active</span>
                <span style={{fontSize:13,color:'#7a6a5a'}}>Basic Listing — $15/month</span>
              </div>
            )}
            {subStatus === 'past_due' && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{background:'#fdecea',color:'#8b1a1a',padding:'3px 10px',borderRadius:10,fontSize:11,fontWeight:700}}>Past Due</span>
                <span style={{fontSize:13,color:'#7a6a5a'}}>Please update your payment method.</span>
              </div>
            )}
            {subStatus === 'canceled' && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{background:'#f0e8dc',color:'#7a5a10',padding:'3px 10px',borderRadius:10,fontSize:11,fontWeight:700}}>Canceled</span>
                <span style={{fontSize:13,color:'#7a6a5a'}}>Re-subscribe to maintain your listing.</span>
              </div>
            )}
            {subStatus === 'none' && isApproved && (
              <div>
                <div style={{fontSize:13,color:'#7a6a5a',marginBottom:4}}>Your profile is approved and visible during beta — no charge yet!</div>
                <div style={{fontSize:12,color:'#a89a8a'}}>Subscribe now to lock in $15/month and be ready when billing activates.</div>
              </div>
            )}
            {subStatus === 'none' && !isApproved && (
              <div style={{fontSize:13,color:'#7a6a5a'}}>Subscription will be available once your profile is approved.</div>
            )}
          </div>
          <div>
            {isApproved && subStatus !== 'active' && (
              <button onClick={handleSubscribe} disabled={subscribing}
                style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'11px 28px',fontSize:14,fontWeight:700,cursor:subscribing?'wait':'pointer',fontFamily:'DM Sans,sans-serif',opacity:subscribing?0.7:1,whiteSpace:'nowrap'}}>
                {subscribing ? 'Redirecting...' : subStatus === 'canceled' ? 'Re-subscribe — $15/mo' : 'Subscribe — $15/mo'}
              </button>
            )}
          </div>
        </div>
        {subStatus === 'none' && isApproved && (
          <div style={{background:'#fdf9f5',border:'1px solid #f0e8dc',borderRadius:8,padding:'12px 16px',marginTop:16,fontSize:13,color:'#7a5a10'}}>
            <strong>Beta note:</strong> Your listing is currently free and visible to all hosts. Once billing goes live, an active subscription will be required to stay in the directory. Subscribe now in test mode — your card will not be charged. All prices subject to applicable sales tax.
          </div>
        )}
      </div>

      {/* Contact & Feedback */}
      <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'#7a6a5a'}}>Need help? Have questions about your listing?</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>setShowContactModal(true)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
        </div>
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>Booking Requests</h3>
      {loadingReqs ? <div style={{color:'#a89a8a',padding:20}}>Loading...</div>
      : requests.length === 0 ? (
        <div className="empty-state"><div className="big">📭</div><p>No booking requests yet. Browse <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:'inherit',fontFamily:'inherit'}} onClick={()=>setTab('opportunities')}>Opportunities</button> and apply to events!</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {requests.map(r => (
            <div key={r.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{r.event_name || r.event_type}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>{r.host_name} · {fmtDate(r.event_date)} · Zip {r.event_zip}</div>
                  {r.notes && <div style={{fontSize:12,color:'#a89a8a',marginTop:4,fontStyle:'italic'}}>"{r.notes}"</div>}
                </div>
                <div>
                  {r.status === 'pending' ? (
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>respond(r.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept</button>
                      <button onClick={()=>respond(r.id,'declined')} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline</button>
                    </div>
                  ) : (
                    <span style={{background:r.status==='accepted'?'#d4f4e0':'#fdecea',color:r.status==='accepted'?'#1a6b3a':'#8b1a1a',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:600}}>{r.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Host Dashboard ───────────────────────────────────────────────────────────
function HostDashboard({ user, userEvents, setTab, setShowContactModal, setShowFeedbackModal, setUserEvents }) {
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({});
  const [savingEvent, setSavingEvent] = useState(false);
  const [editExistingPhotos, setEditExistingPhotos] = useState([]);
  const [editNewPhotos, setEditNewPhotos] = useState([]);
  const SIG_EVENT_FIELDS = ['date','zip','event_name'];

  const startEditEvent = (e) => {
    setEventForm({ event_name:e.event_name, event_type:e.event_type, date:e.date, start_time:e.start_time||'', end_time:e.end_time||'', zip:e.zip, booth_fee:e.booth_fee||'', spots:e.spots||0, notes:e.notes||'', deadline:e.deadline||'', ticket_price:e.ticket_price||'', is_ticketed:e.is_ticketed||false });
    setEditExistingPhotos(e.event_photos||[]);
    setEditNewPhotos([]);
    setEditingEvent(e.id);
  };
  const eSet = (k,v) => setEventForm(f=>({...f,[k]:v}));

  const saveEvent = async (evt) => {
    setSavingEvent(true);
    const changes = {};
    if (eventForm.event_name !== evt.event_name) changes.event_name = {old:evt.event_name, new:eventForm.event_name};
    if (eventForm.date !== evt.date) changes.date = {old:evt.date, new:eventForm.date};
    if (eventForm.zip !== evt.zip) changes.zip = {old:evt.zip, new:eventForm.zip};
    if (eventForm.spots !== evt.spots) changes.spots = {old:evt.spots, new:eventForm.spots};
    const photosChanged = editNewPhotos.length > 0 || editExistingPhotos.length !== (evt.event_photos||[]).length;
    if (photosChanged) changes.photos = {old:`${(evt.event_photos||[]).length} photos`, new:`${editExistingPhotos.length + editNewPhotos.length} photos`};

    if (Object.keys(changes).length === 0) { setEditingEvent(null); setSavingEvent(false); return; }

    // Upload new photos
    let allPhotoUrls = [...editExistingPhotos];
    if (editNewPhotos.length > 0) {
      const bucket = 'vendor-files';
      const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const newUrls = await Promise.all(editNewPhotos.map(async (f, i) => {
        const path = `events/${evt.id}/photos/${editExistingPhotos.length+i}-${safeName(f.name)}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, f, { upsert: true, contentType: f.type });
        if (upErr) return null;
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      }));
      allPhotoUrls = [...allPhotoUrls, ...newUrls.filter(Boolean)];
    }

    const updatePayload = {
      event_name:eventForm.event_name, event_type:eventForm.event_type, date:eventForm.date,
      start_time:eventForm.start_time||null, end_time:eventForm.end_time||null, zip:eventForm.zip,
      booth_fee:eventForm.booth_fee||null, spots:eventForm.spots||null, notes:eventForm.notes||null,
      deadline:eventForm.deadline||null, ticket_price:eventForm.ticket_price||null, is_ticketed:eventForm.is_ticketed,
      event_photos: allPhotoUrls,
      status: 'pending_review',
    };

    const { error } = await supabase.from('events').update(updatePayload).eq('id', evt.id);
    if (error) { alert('Failed to save: ' + error.message); setSavingEvent(false); return; }

    supabase.from('change_log').insert({ entity_type:'event', entity_id:evt.id, entity_name:eventForm.event_name, changed_by:user.email, changes, significant:true }).catch(()=>{});
    fetch('/api/send-contact', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:'Admin Alert', email:'system@sjvm.app', subject:`Event Updated: ${eventForm.event_name} — Needs Re-Approval`, message:`Host ${user.email} updated their event:\n${Object.entries(changes).map(([k,v])=>`${k}: ${v.old} → ${v.new}`).join('\n')}\n\nEvent status set to pending review.` }),
    }).catch(()=>{});

    // Refresh events
    const { data } = await supabase.from('events').select('*').eq('id', evt.id).single();
    if (data && setUserEvents) setUserEvents(prev => prev.map(e => e.id === evt.id ? data : e));
    setEditingEvent(null); setSavingEvent(false);
    alert('Changes saved! Your event has been submitted for admin review. You will be notified once approved.');
  };

  useEffect(() => {
    if (!userEvents || userEvents.length === 0) { setLoadingApps(false); return; }
    const eventNames = userEvents.map(e => e.event_name);
    supabase.from('booking_requests').select('*')
      .in('event_name', eventNames).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setApplications(data); setLoadingApps(false); });
  }, [userEvents]);

  const respond = async (reqId, status) => {
    const { error } = await supabase.from('booking_requests')
      .update({ status, responded_at: new Date().toISOString() }).eq('id', reqId);
    if (error) { alert('Failed to update. Try again.'); return; }
    setApplications(a => a.map(x => x.id === reqId ? { ...x, status } : x));
  };

  return (
    <div className="section" style={{maxWidth:900}}>
      <div className="section-title">My Host Dashboard</div>
      <p className="section-sub">Welcome back, {user.email}</p>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>My Events</h3>
      {userEvents.length === 0 ? (
        <div className="empty-state"><div className="big">📅</div><p>No events posted yet. <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:'inherit',fontFamily:'inherit'}} onClick={()=>setTab('host')}>Post your first event</button></p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
          {userEvents.map(e => (
            <div key={e.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{e.event_name}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>{e.event_type} · {fmtDate(e.date)} · Zip {e.zip}</div>
                  <div style={{fontSize:12,color:'#a89a8a',marginTop:4}}>{e.spots || 0} spots · {e.source}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <button onClick={()=>editingEvent===e.id?setEditingEvent(null):startEditEvent(e)} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{editingEvent===e.id?'Cancel':'Edit'}</button>
                  <span style={{
                    padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap',
                    background: e.status==='approved' ? '#d4f4e0' : e.status==='rejected' ? '#fdecea' : e.status==='concierge_active' ? '#d4f4e0' : '#fdf4dc',
                    color: e.status==='approved' ? '#1a6b3a' : e.status==='rejected' ? '#8b1a1a' : e.status==='concierge_active' ? '#1a6b3a' : '#7a5a10',
                  }}>
                    {e.status==='approved' ? 'Live' : e.status==='rejected' ? 'Not Approved' : e.status==='concierge_pending' ? 'Awaiting Payment' : e.status==='concierge_active' ? 'Concierge Active' : e.status==='pending_review' ? 'Pending Review' : 'Live'}
                  </span>
                </div>
              </div>
              {e.status==='rejected' && e.rejection_reason && (
                <div style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:6,padding:'8px 12px',marginTop:8,fontSize:12,color:'#8b1a1a'}}>
                  <strong>Reason:</strong> {e.rejection_reason}
                </div>
              )}
              {editingEvent===e.id && (
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e8ddd0'}}>
                  <div className="form-grid" style={{gap:10,marginBottom:12}}>
                    <div className="form-group"><label>Event Name</label><input value={eventForm.event_name} onChange={ev=>eSet('event_name',ev.target.value)} /></div>
                    <div className="form-group"><label>Event Type</label><select value={eventForm.event_type} onChange={ev=>eSet('event_type',ev.target.value)}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Date</label><input type="date" value={eventForm.date} onChange={ev=>eSet('date',ev.target.value)} /></div>
                    <div className="form-group"><label>Zip</label><input value={eventForm.zip} onChange={ev=>eSet('zip',ev.target.value.replace(/\D/g,'').slice(0,5))} maxLength={5} /></div>
                    <div className="form-group"><label>Start Time</label><input type="time" value={eventForm.start_time} onChange={ev=>eSet('start_time',ev.target.value)} /></div>
                    <div className="form-group"><label>End Time</label><input type="time" value={eventForm.end_time} onChange={ev=>eSet('end_time',ev.target.value)} /></div>
                    <div className="form-group"><label>Booth Fee</label><input value={eventForm.booth_fee} onChange={ev=>eSet('booth_fee',ev.target.value)} /></div>
                    <div className="form-group"><label>Spots</label><input type="number" value={eventForm.spots} onChange={ev=>eSet('spots',+ev.target.value)} /></div>
                    <div className="form-group"><label>Apply By</label><input type="date" value={eventForm.deadline} onChange={ev=>eSet('deadline',ev.target.value)} /></div>
                    <div className="form-group"><label>Ticketed</label><select value={eventForm.is_ticketed?'yes':'no'} onChange={ev=>eSet('is_ticketed',ev.target.value==='yes')}><option value="no">No</option><option value="yes">Yes</option></select></div>
                    {eventForm.is_ticketed && <div className="form-group"><label>Ticket Price</label><input value={eventForm.ticket_price} onChange={ev=>eSet('ticket_price',ev.target.value)} /></div>}
                    <div className="form-group full"><label>Notes</label><textarea value={eventForm.notes} onChange={ev=>eSet('notes',ev.target.value)} style={{minHeight:50}} /></div>
                  </div>
                  {/* Event photos */}
                  <div style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <label style={{fontSize:13,fontWeight:600}}>Event Photos</label>
                      <span style={{fontSize:11,color:'#a89a8a'}}>{editExistingPhotos.length + editNewPhotos.length} of 6</span>
                    </div>
                    {(editExistingPhotos.length > 0 || editNewPhotos.length > 0) && (
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                        {editExistingPhotos.map((url,i)=>(
                          <div key={'ex'+i} style={{position:'relative',width:70,height:70}}>
                            <img src={url} alt={`Photo ${i+1}`} style={{width:70,height:70,objectFit:'cover',borderRadius:6,border:'1px solid #e8ddd0'}} />
                            <button onClick={()=>setEditExistingPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:9,cursor:'pointer',lineHeight:'16px',textAlign:'center',padding:0}}>x</button>
                          </div>
                        ))}
                        {editNewPhotos.map((f,i)=>(
                          <div key={'new'+i} style={{position:'relative',width:70,height:70}}>
                            <img src={URL.createObjectURL(f)} alt={`New ${i+1}`} style={{width:70,height:70,objectFit:'cover',borderRadius:6,border:'2px solid #c8a850'}} />
                            <button onClick={()=>setEditNewPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'#c62828',color:'#fff',border:'none',fontSize:9,cursor:'pointer',lineHeight:'16px',textAlign:'center',padding:0}}>x</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {editExistingPhotos.length + editNewPhotos.length < 6 && (
                      <label style={{display:'block',background:'#fdf9f5',border:'1px dashed #e8ddd0',borderRadius:6,padding:'8px',textAlign:'center',cursor:'pointer',fontSize:12,color:'#7a6a5a'}}>
                        + Add Photos
                        <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={ev=>{const files=Array.from(ev.target.files);setEditNewPhotos(p=>[...p,...files].slice(0,6-editExistingPhotos.length));ev.target.value='';}} />
                      </label>
                    )}
                  </div>
                  <div style={{fontSize:12,color:'#7a5a10',marginBottom:8,background:'#fdf4dc',padding:'6px 10px',borderRadius:6}}>All changes require admin approval before going live.</div>
                  <button onClick={()=>saveEvent(e)} disabled={savingEvent} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:savingEvent?0.6:1}}>{savingEvent?'Saving...':'Save Changes'}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact & Feedback */}
      <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'#7a6a5a'}}>Need help? Have questions about your events?</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>setShowContactModal(true)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
        </div>
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>Vendor Applications & Responses</h3>
      {loadingApps ? <div style={{color:'#a89a8a',padding:20}}>Loading...</div>
      : applications.length === 0 ? (
        <div className="empty-state"><div className="big">📭</div><p>No vendor applications yet.</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {applications.map(a => (
            <div key={a.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{a.vendor_name || 'Vendor'}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>For: {a.event_name} · {fmtDate(a.event_date)}</div>
                  <div style={{fontSize:12,color:'#a89a8a'}}>{a.vendor_category}{a.host_email ? ` · ${a.host_email}` : ''}</div>
                  {a.notes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4,fontStyle:'italic'}}>"{a.notes}"</div>}
                </div>
                <div>
                  {(a.status === 'pending' || a.status === 'reviewing') ? (
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>respond(a.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept</button>
                      <button onClick={()=>respond(a.id,'declined')} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline</button>
                      {a.status === 'pending' && <button onClick={()=>respond(a.id,'reviewing')} style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Review</button>}
                    </div>
                  ) : (
                    <span style={{background:a.status==='accepted'?'#d4f4e0':'#fdecea',color:a.status==='accepted'?'#1a6b3a':'#8b1a1a',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:600}}>{a.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Event Guest Dashboard ─────────────────────────────────────────────────────
function EventGoerDashboard({ profile, opps, setShowContactModal, setShowFeedbackModal }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:profile.name, zip:profile.zip, radius:profile.radius, eventTypes:profile.event_types||[], frequency:profile.email_frequency });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleType = (t) => setForm(f=>({...f, eventTypes: f.eventTypes.includes(t) ? f.eventTypes.filter(x=>x!==t) : [...f.eventTypes, t]}));

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('event_goers').update({ name:form.name, zip:form.zip, radius:form.radius, event_types:form.eventTypes, email_frequency:form.frequency }).eq('id', profile.id);
    setSaving(false); setEditing(false);
  };

  // Filter events matching preferences
  const matched = opps.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    if (o.date < today) return false;
    if (form.eventTypes.length > 0 && !form.eventTypes.includes(o.eventType)) return false;
    return true;
  }).slice(0, 10);

  return (
    <div className="section" style={{maxWidth:900}}>
      <div className="section-title" style={{color:'#e8c97a'}}>Event Guest Dashboard</div>
      <p className="section-sub" style={{color:'#b8a888'}}>Welcome back, {profile.name}</p>

      <div style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:12,padding:24,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,margin:0}}>My Preferences</h3>
          <button onClick={()=>setEditing(!editing)} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{editing ? 'Cancel' : 'Edit'}</button>
        </div>
        {editing ? (
          <>
            <div className="form-grid" style={{gap:12,marginBottom:14}}>
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} /></div>
              <div className="form-group"><label>Zip Code</label><input value={form.zip} onChange={e=>set('zip',e.target.value.replace(/\D/g,'').slice(0,5))} maxLength={5} /></div>
              <div className="form-group"><label>Travel Radius</label><select value={form.radius} onChange={e=>set('radius',+e.target.value)}>{[5,10,15,20,30,50].map(r=><option key={r} value={r}>{r} miles</option>)}</select></div>
              <div className="form-group"><label>Email Frequency</label><select value={form.frequency} onChange={e=>set('frequency',e.target.value)}><option value="weekly">Weekly</option><option value="biweekly">Every 2 Weeks</option></select></div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:6}}>Event Types</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {EVENT_TYPES.filter(t=>t!=='Other').map(t=>(
                  <button key={t} onClick={()=>toggleType(t)} style={{padding:'5px 12px',borderRadius:16,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:'1.5px solid',background:form.eventTypes.includes(t)?'#c8a850':'#fff',color:form.eventTypes.includes(t)?'#1a1410':'#7a6a5a',borderColor:form.eventTypes.includes(t)?'#c8a850':'#e8ddd0'}}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{saving ? 'Saving...' : 'Save Preferences'}</button>
          </>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Location:</span> Zip {profile.zip} ({profile.radius}mi radius)</div>
            <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Email:</span> {profile.email_frequency === 'weekly' ? 'Weekly' : 'Biweekly'} digest</div>
            <div style={{gridColumn:'1/-1'}}><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Event Types:</span> {(profile.event_types||[]).join(', ') || 'All types'}</div>
          </div>
        )}
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>Upcoming Events for You</h3>
      {matched.length === 0 ? (
        <div className="empty-state"><div className="big">📅</div><p>No upcoming events match your preferences right now. Check back soon!</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {matched.map(o=>(
            <div key={o.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{o.eventName}</div>
              <div style={{fontSize:13,color:'#7a6a5a'}}>{o.eventType} · {fmtDate(o.date)} · Zip {o.zip}</div>
              {o.isTicketed && <div style={{fontSize:12,color:'#c8a850',marginTop:2}}>Tickets: {o.ticketPrice || 'Ticketed'}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'#7a6a5a'}}>Questions or feedback?</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>setShowContactModal(true)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Profile Modal ─────────────────────────────────────────────────────
function VendorProfileModal({ v, onClose, bookingAccepted, sendBookingRequest, hostEvent, bookingRequests, openMessage, setTab }) {
  const req = bookingRequests && bookingRequests.find(r => r.vendorId === v.id);
  const accepted = bookingAccepted || req?.status === 'accepted';
  const cats = v.allCategories || [v.category];
  const photos = v.photoUrls || [];
  const socials = [
    v.website && { icon: '🌐', label: 'Website', url: v.website },
    v.instagram && { icon: '📸', label: 'Instagram', url: v.instagram },
    v.facebook && { icon: '👤', label: 'Facebook', url: v.facebook },
    v.tiktok && { icon: '🎵', label: 'TikTok', url: v.tiktok },
    v.youtube && { icon: '▶️', label: 'YouTube', url: v.youtube },
    v.otherSocial && { icon: '🔗', label: 'Other', url: v.otherSocial },
  ].filter(Boolean);

  const Field = ({label, val}) => val ? (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{label}</div>
      <div style={{fontSize:14,color:'#1a1410'}}>{val}</div>
    </div>
  ) : null;

  const BlurredField = ({label, val}) => (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{label}</div>
      {accepted && val
        ? <div style={{fontSize:14,color:'#1a1410'}}>{val}</div>
        : <div style={{fontSize:13,color:'#a89a8a',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:14}}>🔒</span> Available after booking accepted
          </div>
      }
    </div>
  );

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:720,width:'100%',maxHeight:'90vh',overflowY:'auto',position:'relative'}}>

        {/* Close button */}
        <button onClick={onClose} style={{position:'sticky',top:12,float:'right',marginRight:12,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:'50%',width:36,height:36,fontSize:18,cursor:'pointer',zIndex:10,fontFamily:'DM Sans,sans-serif',lineHeight:'36px',textAlign:'center'}}>✕</button>

        {/* Header with photos */}
        {photos.length > 0 ? (
          <div style={{position:'relative',height:220,overflow:'hidden',borderRadius:'16px 16px 0 0'}}>
            <div style={{display:'flex',height:'100%',overflowX:'auto',scrollSnapType:'x mandatory',gap:0}}>
              {photos.map((url,i) => (
                <img key={i} src={url} alt={`${v.name} photo ${i+1}`}
                  style={{minWidth:'100%',height:'100%',objectFit:'cover',scrollSnapAlign:'start'}} />
              ))}
            </div>
            {photos.length > 1 && (
              <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6}}>
                {photos.map((_,i) => <div key={i} style={{width:8,height:8,borderRadius:'50%',background:'rgba(255,255,255,0.7)'}} />)}
              </div>
            )}
          </div>
        ) : (
          <div style={{height:120,background:'linear-gradient(135deg,#1a1410,#2d2118)',borderRadius:'16px 16px 0 0',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:64}}>{v.emoji}</span>
          </div>
        )}

        <div style={{padding:'20px clamp(16px, 4vw, 32px) 28px'}}>
          {/* Name + category header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:20}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                {photos.length > 0 && <span style={{fontSize:28}}>{v.emoji}</span>}
                <h2 style={{fontFamily:'Playfair Display,serif',fontSize:26,color:'#1a1410',margin:0}}>{v.name}</h2>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
                {cats.map(c => <span key={c} style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:20,padding:'3px 12px',fontSize:12,color:'#7a6a5a',fontWeight:600}}>{c}</span>)}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{background:'#1a1410',color:'#e8c97a',borderRadius:8,padding:'8px 14px',fontSize:14,fontWeight:700}}>{v.matchScore}% match</div>
            </div>
          </div>

          {/* Tags */}
          {v.tags.length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
              {v.tags.map(t=><span key={t} className="vendor-tag">{t}</span>)}
              {v.insurance && <span className="vendor-tag" style={{background:'#d4f4e0',color:'#1a6b3a',borderColor:'#b8e8c8'}}>✓ Insured</span>}
            </div>
          )}

          {/* Description */}
          {v.description && (
            <div style={{fontSize:15,color:'#4a3a28',lineHeight:1.7,marginBottom:24,padding:'16px 20px',background:'#fdf9f5',borderRadius:10,border:'1px solid #f0e8dc'}}>
              {v.description}
            </div>
          )}

          {/* Two-column details */}
          <div className="modal-2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 32px',marginBottom:24}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'2px solid #e8c97a',paddingBottom:6}}>About</div>
              <Field label="Location" val={`📍 ${v.homeZip} · travels ${v.radius}mi`} />
              {v.contactName && <Field label="Owner / Contact" val={v.contactName} />}
              <Field label="Years Active" val={v.yearsActive} />
              <Field label="Event Types" val={v.tags.length > 0 ? v.tags.join(', ') : null} />
              {v.subcategories.length > 0 && <Field label="Specialties" val={v.subcategories.join(', ')} />}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'2px solid #e8c97a',paddingBottom:6}}>Booth & Logistics</div>
              <Field label="Insurance" val={v.insurance ? '✓ Has Certificate of Insurance' : 'Not insured'} />
              {v.hasMinPurchase && <Field label="Minimum Purchase" val={`$${v.minPurchaseAmt}`} />}
              {/* Private event fee hidden */}
              <Field label="Setup Time" val={v.setupTime ? `${v.setupTime} min` : null} />
              <Field label="Table Size" val={v.tableSize} />
              <Field label="Needs Electric" val={v.needsElectric ? 'Yes' : null} />
              <Field label="Response Time" val={v.responseTime} />
              <Field label="Booking Lead Time" val={v.bookingLeadTime} />
            </div>
          </div>

          {/* Service Provider info */}
          {v.isServiceProvider && (
            <div style={{marginBottom:24,background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'2px solid #e8c97a',paddingBottom:6}}>Service Provider</div>
              <Field label="Service" val={v.serviceType} />
              <Field label="Rate" val={v.serviceRateType==='quote' ? 'Quote based' : v.serviceRateType==='range' ? `${v.serviceRateMin} – ${v.serviceRateMax}` : v.serviceRateMin} />
              <Field label="Min Duration" val={v.minBookingDuration} />
              {v.serviceDescription && <Field label="What's Included" val={v.serviceDescription} />}
            </div>
          )}

          {/* Social links */}
          {socials.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'2px solid #e8c97a',paddingBottom:6}}>Links & Social</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {socials.map(s => (
                  <a key={s.label} href={s.url.startsWith('http') ? s.url : 'https://'+s.url} target="_blank" rel="noopener noreferrer"
                    style={{display:'inline-flex',alignItems:'center',gap:6,background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 14px',fontSize:13,fontWeight:600,color:'#1a1410',textDecoration:'none'}}>
                    <span>{s.icon}</span> {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lookbook */}
          {v.lookbookUrl && (
            <div style={{marginBottom:24}}>
              <a href={v.lookbookUrl} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:8,background:'#1a1410',color:'#e8c97a',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:700,textDecoration:'none'}}>
                📄 View Lookbook / Menu
              </a>
            </div>
          )}

          {/* Contact info — blurred until accepted */}
          <div style={{marginBottom:24,padding:'16px 20px',background:accepted?'#d4f4e0':'#f5f0ea',borderRadius:10,border:'1px solid '+(accepted?'#b8e8c8':'#e8ddd0')}}>
            <div style={{fontSize:13,fontWeight:700,color:accepted?'#1a6b3a':'#1a1410',marginBottom:12}}>
              {accepted ? '✅ Contact Info (Booking Accepted)' : '🔒 Contact Info — Available After Booking Accepted'}
            </div>
            <div className="modal-2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
              <BlurredField label="Email" val={v.contactEmail} />
              <BlurredField label="Phone" val={v.contactPhone} />
            </div>
            {!accepted && (
              <div style={{fontSize:12,color:'#a89a8a',marginTop:4}}>
                Invite this vendor to your event and their contact info will be shared once they accept.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {hostEvent && sendBookingRequest && !req && (
              <button onClick={()=>{sendBookingRequest(v, hostEvent); onClose();}}
                style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                📋 Invite to My Event
              </button>
            )}
            {req && (
              <div style={{
                padding:'10px 16px', borderRadius:8, fontSize:13, fontWeight:600,
                background: req.status==='accepted'?'#d4f4e0':req.status==='declined'?'#fdecea':'#fdf4dc',
                color: req.status==='accepted'?'#1a6b3a':req.status==='declined'?'#8b1a1a':'#7a5a10',
                border: '1px solid '+(req.status==='accepted'?'#b8e8c8':req.status==='declined'?'#f5c6c6':'#ffd966')
              }}>
                {req.status==='pending' && '⏳ Invited — Awaiting Response'}
                {req.status==='accepted' && '✅ Booking Accepted!'}
                {req.status==='declined' && '❌ Vendor Declined'}
              </div>
            )}
            {openMessage && (
              <button onClick={()=>{openMessage(v); onClose();}}
                style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                💬 Message
              </button>
            )}
            {!hostEvent && sendBookingRequest && (
              <button onClick={()=>{setTab('host'); onClose();}}
                style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                Post an Event First
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ v, contacted, setContacted, showDist, outOfRange, openMessage, sendBookingRequest, bookingRequests, hostEvent, setTab, vendorCalendars, setVendorCalendars, authUser, setShowAuthModal }) {
  const [showProfile, setShowProfile] = useState(false);
  const req = bookingRequests && bookingRequests.find(r => r.vendorId === v.id);
  const hasPhotos = v.photoUrls && v.photoUrls.length > 0;
  const isGuest = !authUser;

  // Unauthenticated: show limited card
  if (isGuest) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-top" style={{background:'linear-gradient(135deg,#1a1410,#2d2118)'}}>
          {v.emoji}
          <div className="match-score">{v.matchScore}% match</div>
        </div>
        <div className="vendor-card-body">
          <div className="vendor-name" style={{color:'#a89a8a',fontStyle:'italic'}}>🔒 Vendor Name Hidden</div>
          <div className="vendor-category">
            {(v.allCategories || [v.category]).length > 1
              ? `${v.category} +${(v.allCategories || [v.category]).length - 1} more`
              : v.category}
          </div>
          <div className="vendor-tags">
            {v.insurance && <span className="vendor-tag" style={{ background:'#d4f4e0', color:'#1a6b3a', borderColor:'#b8e8c8' }}>✓ Insured</span>}
          </div>
          <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.5, marginBottom:10 }}>{v.description}</p>
          {v.price && <div style={{fontSize:13,color:'#1a1410',fontWeight:600,marginBottom:6}}>💰 {v.price}</div>}
          <div className="vendor-meta">
            <div className="vendor-location">📍 {v.homeZip} · travels {v.radius}mi</div>
          </div>
          {showDist && (
            outOfRange
              ? <div className="vendor-no-match">✗ {v.dist!==null?`${v.dist.toFixed(1)} mi away`:'distance unknown'} — outside travel range</div>
              : <div className="vendor-distance">✓ {v.dist!==null?`${v.dist.toFixed(1)} mi from your event`:'within range (zip unverified)'}</div>
          )}
          <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 14px',marginTop:12,textAlign:'center'}}>
            <div style={{fontSize:12,color:'#7a5a10',marginBottom:8}}>🔒 Create a free host account to see full vendor profiles, photos, and social links</div>
            <button onClick={()=>{if(setShowAuthModal)setShowAuthModal(true);}}
              style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="vendor-card" style={{cursor:'pointer'}} onClick={()=>setShowProfile(true)}>
      {hasPhotos ? (
        <div style={{position:'relative',height:120,overflow:'hidden',borderRadius:'12px 12px 0 0'}}>
          <img src={v.photoUrls[0]} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(26,20,16,0.5) 100%)'}} />
          <div style={{position:'absolute',top:10,left:10,fontSize:24}}>{v.emoji}</div>
          <div className="match-score" style={{position:'absolute',top:10,right:10}}>{v.matchScore}% match</div>
        </div>
      ) : (
        <div className="vendor-card-top">
          {v.emoji}
          <div className="match-score">{v.matchScore}% match</div>
        </div>
      )}
      <div className="vendor-card-body">
        <div className="vendor-name">{v.name}</div>
        <div className="vendor-category">
          {(v.allCategories || [v.category]).length > 1
            ? `${v.category} +${(v.allCategories || [v.category]).length - 1} more`
            : v.category}
        </div>
        <div className="vendor-tags">
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
        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:10}} onClick={e=>e.stopPropagation()}>
          {hostEvent && sendBookingRequest && (
            req ? (
              <div style={{
                padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:600, textAlign:'center',
                background: req.status==='accepted'?'#d4f4e0': req.status==='declined'?'#fdecea':'#fdf4dc',
                color: req.status==='accepted'?'#1a6b3a': req.status==='declined'?'#8b1a1a':'#7a5a10',
                border: '1px solid ' + (req.status==='accepted'?'#b8e8c8': req.status==='declined'?'#f5c6c6':'#ffd966')
              }}>
                {req.status==='pending' && '⏳ Invited — Awaiting Response'}
                {req.status==='accepted' && '✅ Booking Accepted! Check Messages.'}
                {req.status==='declined' && '❌ Vendor Declined — Try Another Vendor'}
                {req.status==='cancelled' && '↩ Request Cancelled'}
              </div>
            ) : (
              <button className="contact-btn" style={{background:'#c8a84b',color:'#1a1410',fontWeight:700,fontSize:13}} onClick={()=>sendBookingRequest(v, hostEvent)}>
                📋 Invite to My Event
              </button>
            )
          )}
          {!hostEvent && sendBookingRequest && (
            <button className="contact-btn" style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',fontWeight:600,fontSize:13}} onClick={()=>setTab('host')}>
              Post an Event First
            </button>
          )}
          <div style={{display:'flex',gap:6}}>
            <button className="contact-btn" style={{flex:2,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',fontSize:12}} onClick={()=>setShowProfile(true)}>
              View Profile
            </button>
            <button className="contact-btn" style={{flex:1,background:contacted.includes(v.id)?'#1a6b3a':'#f5f0ea',color:contacted.includes(v.id)?'#fff':'#1a1410',border:'1px solid #e0d5c5',fontSize:12}} onClick={()=>setContacted(c=>c.includes(v.id)?c:[...c,v.id])}>
              {contacted.includes(v.id)?'✓ Saved':'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
    {showProfile && (
      <VendorProfileModal v={v} onClose={()=>setShowProfile(false)}
        sendBookingRequest={sendBookingRequest} hostEvent={hostEvent}
        bookingRequests={bookingRequests} openMessage={openMessage} setTab={setTab} />
    )}
    </>
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
        <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#7a5a10',lineHeight:1.5}}>
          <strong>⏳ Pending Review:</strong> Your event will be reviewed by our team before it goes live. You'll be notified once it's approved.
        </div>
        {hostEvent?.fullServiceBooking && (
          <div style={{background:'#1a1410',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#e8c97a',lineHeight:1.5}}>
            <strong>Concierge Request received!</strong> Our team will review your event and reach out within 24 hours to schedule a free consultation and discuss pricing for your event.
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
function MatchesPage({ vendors=[], openMessage, sendBookingRequest, bookingRequests, setBookingRequests, hostEvent, setTab, vendorCalendars, setVendorCalendars, authUser, setShowAuthModal }) {
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
        : <div className="vendor-grid">{inRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} />)}</div>
      }

      {hasZip && outRange.length>0 && (
        <>
          <div style={{ marginTop:48, marginBottom:16, borderTop:'2px dashed #e0d5c5', paddingTop:32 }}>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:4 }}>Outside Travel Range</div>
            <p style={{ fontSize:14, color:'#a89a8a' }}>These vendors are beyond their stated travel radius for zip {hostZip}.</p>
          </div>
          <div className="vendor-grid" style={{ opacity:0.5 }}>
            {outRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist outOfRange openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────
function PricingPage({ setTab, authUser, vendorProfile, userEvents, setShowAuthModal, setShowContactModal }) {
  const isVendor = !!vendorProfile;
  const isHost = userEvents && userEvents.length > 0;
  const [activeTab, setActiveTab] = useState('vendor');

  const vendorPricing = (
    <>
      <h3 style={{ fontSize:13, marginBottom:8, color:'#7a6a5a', letterSpacing:1, textTransform:'uppercase' }}>FOR VENDORS</h3>
      <div className="info-box" style={{ marginBottom:20 }}>Currently free during beta — $15/month once billing activates. Cancel anytime.</div>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-type">Vendor</div><div className="pricing-name">Basic Listing</div>
          <div className="pricing-price">$15</div><div className="pricing-period">per month</div>
          <ul className="pricing-features"><li>Profile in vendor directory</li><li>Photo gallery (up to 6)</li><li>Insurance & doc uploads</li><li>Matched to events in your radius</li><li>Lead notifications by email</li></ul>
          <div style={{fontSize:11,color:'#a89a8a',marginTop:12,textAlign:'center'}}>All prices subject to applicable sales tax.</div>
        </div>
      </div>
    </>
  );

  const hostPricing = (
    <>
      <h3 style={{ fontSize:13, marginBottom:20, color:'#7a6a5a', letterSpacing:1, textTransform:'uppercase' }}>FOR HOSTS & EVENT ORGANIZERS</h3>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-badge" style={{ background:'#d4f4e0', color:'#1a6b3a' }}>ALWAYS FREE</div>
          <div className="pricing-type" style={{ marginTop:8 }}>Host</div><div className="pricing-name">Self-Service</div>
          <div className="pricing-price">$0</div><div className="pricing-period">forever free</div>
          <ul className="pricing-features"><li>Unlimited event postings</li><li>Full vendor directory access</li><li>Vendor names, photos & profiles</li><li>Send unlimited booking requests</li><li>Contact info revealed on acceptance</li><li>In-app messaging</li></ul>
        </div>
        <div className="pricing-card featured" style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div>
            <div className="pricing-badge">FULL SERVICE</div>
            <div className="pricing-type">Host</div><div className="pricing-name">Concierge</div>
            <div style={{fontSize:16,color:'#1a1410',lineHeight:1.6,marginTop:12,marginBottom:16}}>
              Have an event and want us to handle everything? Let's talk. Schedule a free concierge consultation and we'll customize a plan around your event size and needs.
            </div>
          </div>
          <button onClick={()=>setShowContactModal(true)} style={{width:'100%',background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            Request a Consultation
          </button>
          <div style={{fontSize:11,color:'#a89a8a',marginTop:8,textAlign:'center'}}>All service fees subject to applicable sales tax.</div>
        </div>
      </div>
    </>
  );

  // Logged-in vendor only — show vendor pricing
  if (authUser && isVendor && !isHost) {
    return (
      <div className="section" style={{ maxWidth:1000 }}>
        <div className="section-title">Your Vendor Pricing</div>
        <p className="section-sub">Your pricing plan as a registered vendor.</p>
        {vendorPricing}
      </div>
    );
  }

  // Logged-in host only — show host pricing
  if (authUser && isHost && !isVendor) {
    return (
      <div className="section" style={{ maxWidth:1000 }}>
        <div className="section-title">Your Host Pricing</div>
        <p className="section-sub">Pricing plans for event hosts and organizers.</p>
        {hostPricing}
      </div>
    );
  }

  // Not logged in, or logged in but no role yet — show tabs
  const tabStyle = (t) => ({
    flex:1, padding:'12px 0', fontSize:14, fontWeight:700, cursor:'pointer', border:'none',
    fontFamily:'DM Sans,sans-serif', letterSpacing:0.5, transition:'all 0.2s',
    background: activeTab===t ? '#1a1410' : '#fff',
    color: activeTab===t ? '#e8c97a' : '#7a6a5a',
    borderBottom: activeTab===t ? '3px solid #e8c97a' : '3px solid transparent',
  });

  return (
    <div className="section" style={{ maxWidth:1000 }}>
      <div className="section-title">Simple, Transparent Pricing</div>
      <p className="section-sub">Select your role to see the pricing that applies to you.</p>
      <div style={{ display:'flex', borderRadius:'10px 10px 0 0', overflow:'hidden', border:'1px solid #e8ddd0', borderBottom:'none', marginBottom:0 }}>
        <button style={tabStyle('vendor')} onClick={()=>setActiveTab('vendor')}>I'm a Vendor</button>
        <button style={tabStyle('host')} onClick={()=>setActiveTab('host')}>I'm a Host</button>
      </div>
      <div style={{ border:'1px solid #e8ddd0', borderTop:'none', borderRadius:'0 0 10px 10px', padding:'32px 24px', background:'#fff', marginBottom:32 }}>
        {activeTab==='vendor' ? vendorPricing : hostPricing}
      </div>
      {!authUser && (
        <div style={{ textAlign:'center', marginTop:8 }}>
          <p style={{ color:'#7a6a5a', fontSize:14, marginBottom:16 }}>Log in or create an account to get started.</p>
          <button className="btn-submit" onClick={()=>setShowAuthModal(true)}>Log In / Sign Up</button>
        </div>
      )}
    </div>
  );
}

// ─── Pending Vendor Card (Admin) ──────────────────────────────────────────────
function PendingVendorCard({ v, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const m = v.metadata || {};
  const cats = m.allCategories || [v.category];
  const photos = m.photoUrls || [];
  const coiUrl = m.coiUrl || null;
  const lookbookUrl = m.lookbookUrl || null;
  const submitted = v.created_at ? new Date(v.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';

  const Field = ({label, val}) => val ? (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{label}</div>
      <div style={{fontSize:14,color:'#1a1410'}}>{val}</div>
    </div>
  ) : null;

  return (
    <div style={{background:'#fff',border:'1.5px solid #e8ddd0',borderRadius:12,overflow:'hidden'}}>
      {/* Summary row */}
      <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:14,flex:1,minWidth:200}}>
          <div style={{fontSize:28}}>{v.emoji||'🏪'}</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{v.name}</div>
            <div style={{fontSize:12,color:'#7a6a5a'}}>{v.contact_name||'—'} · {v.contact_email||'—'} · {v.home_zip} · {v.radius}mi</div>
            <div style={{fontSize:12,color:'#a89a8a',marginTop:2}}>{cats.join(', ')} · Submitted {submitted}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setExpanded(e=>!e)}
            style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            {expanded ? '▾ Collapse' : '▸ View Full Application'}
          </button>
          <button onClick={onApprove}
            style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            ✓ Approve
          </button>
          <button onClick={onReject}
            style={{background:'#c62828',color:'#fff',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{borderTop:'1px solid #e8ddd0',padding:'20px 24px',background:'#faf8f5'}}>
          <div className="modal-3col" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 32px'}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'1px solid #e8ddd0',paddingBottom:6}}>Contact & Business</div>
              <Field label="Business Name" val={v.name} />
              <Field label="Owner" val={v.contact_name} />
              <Field label="Email" val={v.contact_email} />
              <Field label="Phone" val={v.contact_phone} />
              <Field label="Years Active" val={m.yearsActive} />
              {/* Clickable links for verification */}
              <div style={{marginTop:10,borderTop:'1px solid #e8ddd0',paddingTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Links (click to verify)</div>
                {[
                  {label:'🌐 Website', url:v.website},
                  {label:'📸 Instagram', url:v.instagram},
                  {label:'👤 Facebook', url:m.facebook},
                  {label:'🎵 TikTok', url:m.tiktok},
                  {label:'▶️ YouTube', url:m.youtube},
                  {label:'🔗 Other', url:m.otherSocial},
                ].filter(l=>l.url).map(l=>(
                  <div key={l.label} style={{marginBottom:6}}>
                    <a href={l.url.startsWith('http')?l.url:'https://'+l.url} target="_blank" rel="noopener noreferrer"
                      style={{fontSize:13,color:'#1a4a6b',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4,wordBreak:'break-all'}}>
                      {l.label}: {l.url}
                    </a>
                  </div>
                ))}
                {![v.website,v.instagram,m.facebook,m.tiktok,m.youtube,m.otherSocial].some(Boolean) && (
                  <div style={{fontSize:12,color:'#a89a8a',fontStyle:'italic'}}>No links provided</div>
                )}
              </div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'1px solid #e8ddd0',paddingBottom:6}}>Categories & Details</div>
              <Field label="Categories" val={cats.join(', ')} />
              <Field label="Subcategories" val={(v.subcategories||[]).length>0 ? v.subcategories.join(', ') : null} />
              <Field label="Event Types" val={(v.tags||[]).length>0 ? v.tags.join(', ') : null} />
              <Field label="Description" val={v.description} />
              <Field label="Home Zip" val={v.home_zip} />
              <Field label="Travel Radius" val={`${v.radius} miles`} />
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12,borderBottom:'1px solid #e8ddd0',paddingBottom:6}}>Booth & Logistics</div>
              <Field label="Insurance" val={v.insurance ? '✓ Yes — has COI' : '✗ No'} />
              <Field label="Minimum Purchase" val={v.has_min_purchase ? `Yes — $${v.min_purchase_amt} minimum` : 'No minimum'} />
              {/* Private event fee hidden */}
              <Field label="Setup Time" val={m.setupTime ? `${m.setupTime} min` : null} />
              <Field label="Table Size" val={m.tableSize} />
              <Field label="Needs Electric" val={m.needsElectric ? 'Yes' : 'No'} />
              <Field label="Response Time" val={m.responseTime} />
              <Field label="Booking Lead Time" val={m.bookingLeadTime} />
              <Field label="Event Frequency" val={m.eventFrequency} />
            </div>
          </div>

          {/* Service Provider details */}
          {(m.isServiceProvider || m.vendorType?.service) && (
            <div style={{marginTop:16,borderTop:'1px solid #e8ddd0',paddingTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12}}>Service Provider Details</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 32px'}}>
                <Field label="Vendor Type" val={m.vendorType?.market && m.vendorType?.service ? 'Market Vendor + Service Provider' : m.vendorType?.service ? 'Service Provider Only' : 'Market Vendor'} />
                <Field label="Service Type" val={m.serviceType} />
                <Field label="Rate" val={m.serviceRateType==='quote' ? 'Quote based' : m.serviceRateType==='range' ? `${m.serviceRateMin} – ${m.serviceRateMax}` : m.serviceRateMin} />
                <Field label="Min Duration" val={m.minBookingDuration} />
                <Field label="Service Categories" val={(m.serviceCategories||[]).join(', ') || null} />
                <Field label="Service Subcategories" val={(m.serviceSubcategories||[]).join(', ') || null} />
              </div>
              {m.serviceDescription && <Field label="Service Description" val={m.serviceDescription} />}
            </div>
          )}

          {/* Uploaded files */}
          <div style={{marginTop:20,borderTop:'1px solid #e8ddd0',paddingTop:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:12}}>Uploaded Files & Attachments</div>
            {photos.length === 0 && !coiUrl && !lookbookUrl && (
              <div style={{fontSize:13,color:'#a89a8a',fontStyle:'italic',marginBottom:12}}>No files uploaded with this application.</div>
            )}
          {(photos.length > 0 || coiUrl || lookbookUrl) && (
            <div>
              {photos.length > 0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Business Photos ({photos.length})</div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    {photos.map((url,i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{display:'block'}}>
                        <img src={url} alt={`Photo ${i+1}`} style={{width:180,height:180,objectFit:'cover',borderRadius:8,border:'1px solid #e0d5c5',cursor:'pointer'}} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                {coiUrl && (
                  <a href={coiUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:8,background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:8,padding:'10px 16px',fontSize:13,color:'#1a6b3a',fontWeight:600,textDecoration:'none'}}>
                    📄 Certificate of Insurance
                  </a>
                )}
                {lookbookUrl && (
                  <a href={lookbookUrl} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:8,background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'10px 16px',fontSize:13,color:'#1a4a6b',fontWeight:600,textDecoration:'none'}}>
                    📋 Price Menu / Lookbook
                  </a>
                )}
              </div>
            </div>
          )}
          </div>

          {/* Bottom action bar */}
          <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #e8ddd0',display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={onApprove}
              style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              ✓ Approve Vendor
            </button>
            <button onClick={onReject}
              style={{background:'#c62828',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
const ADMIN_PW = process.env.REACT_APP_ADMIN_PASSWORD || 'sjvm-admin-2026';

function AdminPage({ opps=[], setOpps=()=>{}, allEvents=[], setAllEvents=()=>{}, vendorSubs=[], vendors=[], setVendors=()=>{}, pendingVendors=[], setPendingVendors=()=>{}, isAdmin=false, eventGoers=[] }) {
  const [unlocked, setUnlocked] = useState(() => isAdmin || sessionStorage.getItem('sjvm_admin') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  // Auto-unlock when admin email is detected (handles late auth load)
  useEffect(() => { if (isAdmin) setUnlocked(true); }, [isAdmin]);

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

  const [removeDialog, setRemoveDialog] = useState(null); // { type, id, name }
  const [removeReason, setRemoveReason] = useState('');

  const handleRemove = async () => {
    if (!removeReason.trim()) { alert('Please provide a reason for removal.'); return; }
    const { type, id, name } = removeDialog;
    // Log removal
    await supabase.from('admin_removal_log').insert({ entity_type: type, entity_id: id, entity_name: name, reason: removeReason });
    if (type === 'event') {
      const evt = allEvents.find(e => e.id === id);
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) { alert('Failed to remove event: ' + error.message); return; }
      setOpps(prev => prev.filter(e => e.id !== id));
      setAllEvents(prev => prev.filter(e => e.id !== id));
      if (evt?.contactEmail) {
        fetch('/api/send-approval-email', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:evt.contactEmail, name:evt.contactName, type:'event', entityName:evt.eventName, approved:false, reason:'Your event has been removed: '+removeReason }),
        }).catch(()=>{});
      }
    } else if (type === 'vendor') {
      const v = vendors.find(x => x.id === id) || pendingVendors.find(x => x.id === id);
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) { alert('Failed to remove vendor: ' + error.message); return; }
      setVendors(prev => prev.filter(x => x.id !== id));
      setPendingVendors(prev => prev.filter(x => x.id !== id));
      if (v?.contactEmail || v?.contact_email) {
        fetch('/api/send-approval-email', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:v.contactEmail||v.contact_email, name:v.contactName||v.contact_name||v.name, type:'vendor', entityName:v.name, approved:false, reason:'Your vendor listing has been removed: '+removeReason }),
        }).catch(()=>{});
      }
    } else if (type === 'event_guest') {
      const g = eventGoers.find(x => x.id === id);
      const { error } = await supabase.from('event_goers').update({ active: false }).eq('id', id);
      if (error) { alert('Failed to remove event guest: ' + error.message); return; }
      setEventGoers(prev => prev.filter(x => x.id !== id));
      if (g?.email) {
        fetch('/api/send-approval-email', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:g.email, name:g.name, type:'vendor', entityName:'Event Guest Account', approved:false, reason:'Your event guest account has been removed: '+removeReason }),
        }).catch(()=>{});
      }
    }
    setRemoveDialog(null);
    setRemoveReason('');
  };

  const pendingEvents = allEvents.filter(e => e.status === 'pending_review');
  const conciergeEvents = allEvents.filter(e => e.status === 'concierge_pending' || e.status === 'concierge_active');
  const [eventNotes, setEventNotes] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);

  const approveEvent = async (evt) => {
    const notes = eventNotes[evt.id] || '';
    const updatePayload = { status: 'approved' };
    if (notes) updatePayload.admin_notes = notes;
    const { error } = await supabase.from('events').update(updatePayload).eq('id', evt.id);
    if (error) { alert('Failed to approve event: ' + error.message); return; }
    const updated = { ...evt, status: 'approved', adminNotes: notes };
    setAllEvents(prev => prev.map(e => e.id === evt.id ? updated : e));
    setOpps(prev => [updated, ...prev]);
    fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:evt.contactEmail,name:evt.contactName,type:'event',entityName:evt.eventName,approved:true})}).catch(()=>{});
  };

  const rejectEvent = async (evt) => {
    const reason = rejectReasons[evt.id] || '';
    if (!reason) { alert('Please provide a rejection reason.'); return; }
    const { error } = await supabase.from('events').update({ status: 'rejected', rejection_reason: reason, admin_notes: eventNotes[evt.id] || null }).eq('id', evt.id);
    if (error) { alert('Failed to reject event: ' + error.message); return; }
    setAllEvents(prev => prev.map(e => e.id === evt.id ? { ...e, status: 'rejected', rejectionReason: reason } : e));
    // Send rejection notification email
    fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:evt.contactEmail,name:evt.contactName,type:'event',entityName:evt.eventName,approved:false,reason})}).catch(()=>{});
  };

  const markConciergeActive = async (evt) => {
    const { error } = await supabase.from('events').update({ status: 'concierge_active' }).eq('id', evt.id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    setAllEvents(prev => prev.map(e => e.id === evt.id ? { ...e, status: 'concierge_active' } : e));
    setOpps(prev => [{ ...evt, status: 'concierge_active' }, ...prev]);
  };

  const eventStatusPill = (status) => {
    const styles = {
      pending_review:    { bg:'#fdf4dc', color:'#7a5a10', label:'Pending Review' },
      approved:          { bg:'#d4f4e0', color:'#1a6b3a', label:'Live' },
      rejected:          { bg:'#fdecea', color:'#8b1a1a', label:'Rejected' },
      concierge_pending: { bg:'#fdf4dc', color:'#7a5a10', label:'Concierge — Awaiting Payment' },
      concierge_active:  { bg:'#d4f4e0', color:'#1a6b3a', label:'Concierge Active' },
    };
    const s = styles[status] || styles.approved;
    return <span style={{background:s.bg,color:s.color,padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{s.label}</span>;
  };

  return (
    <div className="section" style={{ maxWidth:1100 }}>
      <div className="section-title">Admin Dashboard</div>
      <p className="section-sub">Manage vendors, hosts, and bookings across South Jersey.</p>
      {/* Pending action alert */}
      {(pendingEvents.length > 0 || pendingVendors.length > 0) && (
        <div style={{background:'#fdf4dc',border:'2px solid #ffd966',borderRadius:10,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:22}}>⚠️</span>
          <div style={{fontSize:14,color:'#7a5a10',fontWeight:600}}>
            {pendingEvents.length + pendingVendors.length} pending approval{pendingEvents.length + pendingVendors.length !== 1 ? 's' : ''}
            {pendingEvents.length > 0 && ` — ${pendingEvents.length} event${pendingEvents.length!==1?'s':''}`}
            {pendingVendors.length > 0 && ` — ${pendingVendors.length} vendor${pendingVendors.length!==1?'s':''}`}
          </div>
        </div>
      )}
      <div className="admin-grid">
        <div className="admin-stat" style={{border:pendingVendors.length>0?'2px solid #ffd966':undefined}}><div className="admin-stat-num" style={{color:pendingVendors.length>0?'#c8a84b':undefined}}>{pendingVendors.length}</div><div className="admin-stat-label">Vendors Pending</div></div>
        <div className="admin-stat" style={{border:pendingEvents.length>0?'2px solid #ffd966':undefined}}><div className="admin-stat-num" style={{color:pendingEvents.length>0?'#c8a84b':undefined}}>{pendingEvents.length}</div><div className="admin-stat-label">Events Pending</div></div>
        <div className="admin-stat"><div className="admin-stat-num" style={{color:'#c8a84b'}}>{conciergeEvents.length}</div><div className="admin-stat-label">Concierge</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{vendors.length}</div><div className="admin-stat-label">Approved Vendors</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{opps.length}</div><div className="admin-stat-label">Live Events</div></div>
        <div className="admin-stat"><div className="admin-stat-num" style={{color:'#1a6b3a'}}>{eventGoers.length}</div><div className="admin-stat-label">Event Guests</div></div>
      </div>

      {/* ── Pending Event Review ─────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>🔍 Events Pending Review ({pendingEvents.length})</h3>
      {pendingEvents.length===0
        ? <div className="empty-state"><div className="big">✅</div><p>No events awaiting review.</p></div>
        : <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {pendingEvents.map(evt=>(
            <div key={evt.id} style={{background:'#fff',border:'2px solid #ffd966',borderRadius:12,overflow:'hidden'}}>
              <div style={{background:'#fdf9f0',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,cursor:'pointer'}} onClick={()=>setExpandedEvent(expandedEvent===evt.id?null:evt.id)}>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:'#1a1410'}}>{evt.eventName}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>{evt.eventType} · {fmtDate(evt.date)} · Zip {evt.zip}</div>
                  <div style={{fontSize:12,color:'#a89a8a',marginTop:2}}>Host: {evt.contactName} ({evt.contactEmail})</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {eventStatusPill(evt.status)}
                  <span style={{fontSize:18,color:'#a89a8a'}}>{expandedEvent===evt.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedEvent===evt.id && (
                <div style={{padding:'20px',borderTop:'1px solid #f0e8dc'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:16}}>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Time:</span> {fmtTime(evt.startTime)} – {fmtTime(evt.endTime)}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Booth Fee:</span> {evt.boothFee || '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Spots:</span> {evt.spots}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Deadline:</span> {evt.deadline ? fmtDate(evt.deadline) : '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Phone:</span> {evt.contactPhone || '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Source:</span> {evt.source}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Ticketed:</span> {evt.isTicketed ? `Yes — ${evt.ticketPrice||'Price TBD'}` : 'No — Free admission'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Contact Email:</span> {evt.contactEmail || '—'}</div>
                    <div style={{gridColumn:'1/-1'}}><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Categories Needed:</span> {(evt.categoriesNeeded||[]).join(', ') || '—'}</div>
                    {evt.notes && <div style={{gridColumn:'1/-1',background:'#fdf9f5',borderRadius:6,padding:'8px 12px',borderLeft:'3px solid #e8c97a'}}><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Host Notes:</span><div style={{fontSize:13,color:'#1a1410',marginTop:4}}>{evt.notes}</div></div>}
                  </div>
                  {/* Services Needed */}
                  {evt.servicesNeeded && evt.servicesNeeded.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:8}}>Services Needed ({evt.servicesNeeded.length})</div>
                      {evt.servicesNeeded.map((svc,i)=>(
                        <div key={i} style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 12px',marginBottom:6,fontSize:13}}>
                          <strong>{svc.type||'Service'}{svc.otherType ? ` — ${svc.otherType}`:''}</strong>
                          <span style={{color:'#7a6a5a'}}> · {svc.duration}{svc.otherDuration ? ` (${svc.otherDuration})`:''}</span>
                          <span style={{color:'#7a6a5a'}}> · Budget: {svc.budgetType==='open'?'Open to quotes':svc.budgetType==='fixed'?(svc.budgetAmount||'TBD'):`${svc.budgetMin||'?'} – ${svc.budgetMax||'?'}`}</span>
                          {svc.notes && <div style={{fontSize:12,color:'#a89a8a',marginTop:2,fontStyle:'italic'}}>{svc.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Event photos */}
                  {evt.eventPhotos && evt.eventPhotos.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:8}}>Event Photos ({evt.eventPhotos.length})</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {evt.eventPhotos.map((url,i)=>(
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={`Event photo ${i+1}`} style={{width:120,height:120,objectFit:'cover',borderRadius:8,border:'1px solid #e0d5c5'}} /></a>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Event Link — prominent for verification */}
                  {evt.eventLink && (
                    <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
                      <div style={{fontSize:11,color:'#1a4a6b',fontWeight:700,marginBottom:4}}>🔗 EVENT LINK (verify host)</div>
                      <a href={evt.eventLink} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b',fontSize:14,wordBreak:'break-all'}}>{evt.eventLink}</a>
                    </div>
                  )}
                  {!evt.eventLink && (
                    <div style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
                      <div style={{fontSize:12,color:'#8b1a1a',fontWeight:600}}>⚠️ No event link provided — verify host through other means</div>
                    </div>
                  )}
                  {/* Admin notes */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,fontWeight:600,color:'#1a1410',display:'block',marginBottom:4}}>Admin Notes (internal — flag suspicious hosts)</label>
                    <textarea value={eventNotes[evt.id]||''} onChange={e=>setEventNotes(n=>({...n,[evt.id]:e.target.value}))}
                      placeholder="Flag anything suspicious, verification notes, etc."
                      style={{width:'100%',minHeight:60,border:'1px solid #e0d5c5',borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',resize:'vertical'}} />
                  </div>
                  {/* Reject reason */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:12,fontWeight:600,color:'#8b1a1a',display:'block',marginBottom:4}}>Rejection Reason (sent to host if rejected)</label>
                    <input value={rejectReasons[evt.id]||''} onChange={e=>setRejectReasons(r=>({...r,[evt.id]:e.target.value}))}
                      placeholder="Reason for rejection (required to reject)"
                      style={{width:'100%',border:'1px solid #e0d5c5',borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box'}} />
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={()=>approveEvent(evt)} style={{flex:1,background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'10px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>✓ Approve Event</button>
                    <button onClick={()=>rejectEvent(evt)} style={{flex:1,background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'10px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>✗ Reject Event</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      }

      {/* ── Pending Vendor Applications ──────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>🔍 Pending Vendor Applications ({pendingVendors.length})</h3>
      {pendingVendors.length===0
        ? <div className="empty-state"><div className="big">✅</div><p>No pending vendor submissions.</p></div>
        : <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {pendingVendors.map(v=>(
              <PendingVendorCard key={v.id} v={v}
                onApprove={async()=>{
                  const{error}=await supabase.from('vendors').update({status:'approved'}).eq('id',v.id);
                  if(error){alert('Error approving vendor. Please try again.');return;}
                  setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                  setVendors(prev=>[dbVendorToApp({...v,status:'approved'}), ...prev]);
                  fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:v.contact_email,name:v.contact_name,type:'vendor',entityName:v.name,approved:true})}).catch(()=>{});
                }}
                onReject={async()=>{
                  const reason = window.prompt(`Reject "${v.name}"? Enter a reason (sent to vendor):`);
                  if(!reason) return;
                  const{error}=await supabase.from('vendors').update({status:'rejected'}).eq('id',v.id);
                  if(error){alert('Error rejecting vendor. Please try again.');return;}
                  setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                  fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:v.contact_email,name:v.contact_name,type:'vendor',entityName:v.name,approved:false,reason})}).catch(()=>{});
                }}
              />
            ))}
          </div>
      }

      {/* ── Concierge Requests ───────────────────────────────── */}
      {conciergeEvents.length > 0 && (
        <>
          <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>🤝 Concierge Requests ({conciergeEvents.length})</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {conciergeEvents.map(evt=>(
              <div key={evt.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{evt.eventName}</div>
                  <div style={{fontSize:12,color:'#7a6a5a'}}>{fmtDate(evt.date)} · {evt.contactName} · {evt.contactEmail}</div>
                  {evt.eventLink && <a href={evt.eventLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b'}}>🔗 Event Link</a>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {eventStatusPill(evt.status)}
                  {evt.status === 'concierge_pending' && (
                    <button onClick={()=>markConciergeActive(evt)} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                      Mark Payment Confirmed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
          status:            'approved',
        }).select().single();
        if (error) { console.error('Error posting event:', error); return false; }
        const mapped = dbEventToApp(data);
        setOpps(prev => [mapped, ...prev]);
        setAllEvents(prev => [mapped, ...prev]);
        return true;
      }} />

      {/* ── Live Events ──────────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Live Events ({opps.length})</h3>
      {opps.length===0
        ? <div className="empty-state"><div className="big">&#128221;</div><p>No live events yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Event</th><th>Type</th><th>Zip</th><th>Date</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {opps.map(o=>(
                <tr key={o.id} style={o.source==='Concierge Request'?{background:'#fdf9f0'}:{}}>
                  <td><strong>{o.eventName}</strong>{o.eventLink && <a href={o.eventLink} target="_blank" rel="noopener noreferrer" style={{marginLeft:6,fontSize:11,color:'#1a4a6b'}}>🔗</a>}</td><td>{o.eventType}</td><td>{o.zip}</td>
                  <td>{fmtDate(o.date)}</td><td>{o.source}</td>
                  <td>{eventStatusPill(o.status)}</td>
                  <td><button onClick={()=>setRemoveDialog({type:'event',id:o.id,name:o.eventName})} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
      }

      {/* ── Approved Vendors ────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Approved Vendors ({vendors.length})</h3>
      {vendors.length===0
        ? <div className="empty-state"><div className="big">🛍️</div><p>No approved vendors yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Business</th><th>Category</th><th>Zip</th><th>Contact</th><th>Founding</th><th>Actions</th></tr></thead>
            <tbody>
              {vendors.map(v=>(
                <tr key={v.id}>
                  <td><strong>{v.name}</strong>{v.foundingVendor && <span style={{marginLeft:6,background:'#c8a850',color:'#1a1410',padding:'1px 6px',borderRadius:8,fontSize:9,fontWeight:700}}>FOUNDING</span>}</td>
                  <td>{v.category}</td>
                  <td>{v.homeZip}</td>
                  <td style={{fontSize:12}}>{v.contactEmail}</td>
                  <td>
                    <button onClick={async()=>{
                      const newVal = !v.foundingVendor;
                      const{error}=await supabase.from('vendors').update({founding_vendor:newVal}).eq('id',v.id);
                      if(error){alert('Failed to update');return;}
                      setVendors(prev=>prev.map(x=>x.id===v.id?{...x,foundingVendor:newVal}:x));
                    }} style={{
                      background:v.foundingVendor?'#c8a850':'#fff',
                      color:v.foundingVendor?'#1a1410':'#7a6a5a',
                      border:`1px solid ${v.foundingVendor?'#c8a850':'#e8ddd0'}`,
                      borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600
                    }}>{v.foundingVendor?'✓ Founding':'Mark Founding'}</button>
                  </td>
                  <td><button onClick={()=>setRemoveDialog({type:'vendor',id:v.id,name:v.name})} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
      }

      {/* ── Event Guests ────────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Event Guests ({eventGoers.length})</h3>
      {eventGoers.length===0
        ? <div className="empty-state"><div className="big">📬</div><p>No event guests signed up yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Zip</th><th>Radius</th><th>Event Types</th><th>Frequency</th><th>Signed Up</th><th>Actions</th></tr></thead>
            <tbody>
              {eventGoers.map(eg=>(
                <tr key={eg.id}>
                  <td><strong>{eg.name}</strong></td>
                  <td style={{fontSize:12}}>{eg.email}</td>
                  <td>{eg.zip}</td>
                  <td>{eg.radius}mi</td>
                  <td style={{fontSize:11}}>{(eg.event_types||[]).join(', ')||'—'}</td>
                  <td>{eg.email_frequency}</td>
                  <td style={{fontSize:11}}>{new Date(eg.created_at).toLocaleDateString()}</td>
                  <td><button onClick={()=>setRemoveDialog({type:'event_guest',id:eg.id,name:eg.name})} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
      }

      {/* Remove confirmation dialog */}
      {removeDialog && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:12,maxWidth:420,width:'100%',padding:'24px 28px'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#8b1a1a',marginBottom:12}}>Remove {removeDialog.type}: {removeDialog.name}</div>
            <p style={{fontSize:13,color:'#7a6a5a',marginBottom:16}}>This action cannot be undone. The affected party will be notified.</p>
            <div className="form-group" style={{marginBottom:16}}>
              <label style={{color:'#8b1a1a',fontWeight:700}}>Reason for removal <span style={{color:'#c0392b'}}>*</span></label>
              <textarea value={removeReason} onChange={e=>setRemoveReason(e.target.value)} placeholder="Explain why this is being removed..." style={{minHeight:80,resize:'vertical'}} />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={handleRemove} style={{flex:1,background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'10px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Confirm Removal</button>
              <button onClick={()=>{setRemoveDialog(null);setRemoveReason('');}} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Opportunities Page ───────────────────────────────────────────────────────
// ─── Vendor Application Modal ─────────────────────────────────────────────────
function VendorApplyModal({ opp, onClose }) {
  const [form, setForm] = useState({ vendorName:'', contactName:'', email:'', phone:'', category:'', message:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Auto-fill from vendor profile (auth user or localStorage fallback)
  useEffect(() => {
    const fillFrom = (data) => {
      if (!data) return;
      setForm(f => ({
        ...f,
        vendorName: f.vendorName || data.name || '',
        contactName: f.contactName || data.contact_name || '',
        email: f.email || data.contact_email || '',
        phone: f.phone || data.contact_phone || '',
        category: f.category || data.category || '',
      }));
      setAutoFilled(true);
    };
    // Try auth user first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('name,contact_name,contact_email,contact_phone,category')
          .eq('user_id', session.user.id).limit(1).single()
          .then(({ data }) => {
            if (data) fillFrom(data);
            else {
              // Fallback to email match
              supabase.from('vendors').select('name,contact_name,contact_email,contact_phone,category')
                .eq('contact_email', session.user.email).limit(1).single()
                .then(({ data: d2 }) => fillFrom(d2));
            }
          });
      } else {
        // Fallback to localStorage vendor ID
        const vid = localStorage.getItem('sjvm_calendar_vendor_id');
        if (vid) {
          supabase.from('vendors').select('name,contact_name,contact_email,contact_phone,category')
            .eq('id', vid).single().then(({ data }) => fillFrom(data));
        }
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.vendorName || !form.email || !form.contactName) { alert('Please fill in your business name, contact name, and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) { alert('Please enter a valid email.'); return; }
    setSubmitting(true);
    const responseToken = crypto.randomUUID();
    const payload = {
      id: Date.now(), session_id: 'vendor-application',
      vendor_id: null, vendor_name: form.vendorName,
      vendor_emoji: '', vendor_category: form.category || '',
      host_name: opp.contactName, host_email: opp.contactEmail,
      event_name: opp.eventName, event_type: opp.eventType,
      event_zip: opp.zip, event_date: opp.date,
      start_time: opp.startTime, end_time: opp.endTime,
      address: '', attendance: '', vendor_count: String(opp.spots || ''),
      budget: opp.boothFee || '', notes: form.message,
      status: 'pending', sent_at: new Date().toISOString(),
      response_token: responseToken,
    };
    let { error } = await supabase.from('booking_requests').insert(payload);
    if (error && error.code === 'PGRST204') {
      const { response_token: _rt, ...withoutToken } = payload;
      ({ error } = await supabase.from('booking_requests').insert(withoutToken));
    }
    if (error) {
      console.error('Application error:', error);
      alert('Failed to submit application. Please try again.');
      setSubmitting(false);
      return;
    }
    // Email the host about the vendor application
    try {
      await fetch('/api/send-booking-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorEmail: opp.contactEmail,
          vendorName: opp.contactName,
          hostName: form.vendorName,
          hostEmail: form.email,
          eventName: opp.eventName, eventType: opp.eventType,
          eventDate: opp.date, startTime: opp.startTime, endTime: opp.endTime,
          eventZip: opp.zip, notes: `Vendor Application from ${form.vendorName} (${form.contactName})\n\nEmail: ${form.email}${form.phone ? '\nPhone: '+form.phone : ''}${form.category ? '\nCategory: '+form.category : ''}${form.message ? '\n\nMessage: '+form.message : ''}`,
          responseToken,
        }),
      });
    } catch (emailErr) { console.error('Failed to send application email:', emailErr); }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:520,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{background:'#1a1410',padding:'20px 28px',borderRadius:'16px 16px 0 0'}}>
          <div style={{fontSize:14,color:'#a89a8a'}}>Apply to Vend</div>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>{opp.eventName}</div>
          <div style={{fontSize:12,color:'#a89a8a',marginTop:4}}>{fmtDate(opp.date)} · {opp.eventType} · Zip {opp.zip}</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {submitted ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:12}}>✅</div>
              <div style={{fontSize:18,fontWeight:700,color:'#1a6b3a',marginBottom:8}}>Application Sent!</div>
              <div style={{fontSize:14,color:'#7a6a5a',marginBottom:16}}>The host has been notified and will review your application. They'll reach out if they'd like to confirm your spot.</div>
              <button onClick={onClose} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          ) : (
            <>
              {autoFilled && (
                <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:8,padding:'8px 14px',marginBottom:12,fontSize:12,color:'#1a6b3a',fontWeight:600}}>
                  ✓ Pre-filled from your vendor profile
                </div>
              )}
              <div className="modal-2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div className="form-group"><label>Business Name *</label><input value={form.vendorName} onChange={e=>set('vendorName',e.target.value)} placeholder="Your business name" /></div>
                <div className="form-group"><label>Contact Name *</label><input value={form.contactName} onChange={e=>set('contactName',e.target.value)} placeholder="Your name" /></div>
              </div>
              <div className="modal-2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@email.com" /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(555) 555-5555" /></div>
              </div>
              <div className="form-group" style={{marginBottom:12}}>
                <label>Your Category</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid #e0d5c5',borderRadius:6,fontSize:14,fontFamily:'DM Sans,sans-serif'}}>
                  <option value="">Select your category</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:16}}>
                <label>Message to Host (optional)</label>
                <textarea value={form.message} onChange={e=>set('message',e.target.value)} rows={3}
                  placeholder="Tell the host about your products, experience, or any questions..." />
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{flex:2,background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:submitting?0.5:1}}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={onClose}
                  style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming Markets (public calendar) ──────────────────────────────────────
function UpcomingMarketsPage({ opps, setTab, setShowAuthModal, setShowEventGoerSignup }) {
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTicketed, setFilterTicketed] = useState("");
  const [myZip, setMyZip] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [vendorsByEvent, setVendorsByEvent] = useState({});
  const [loadingVendors, setLoadingVendors] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];
  const zipOk = myZip.length===5 && isKnownZip(myZip);
  const upcoming = opps
    .filter(o => o.date >= todayStr)
    .filter(o => !filterType || o.eventType===filterType)
    .filter(o => !filterDate || o.date === filterDate)
    .filter(o => !filterTicketed || (filterTicketed==='yes' ? o.isTicketed : !o.isTicketed))
    .map(o => ({ ...o, dist: zipOk ? distanceMiles(myZip, o.zip) : null }))
    .sort((a,b) => { if (a.dist!==null && b.dist!==null) return a.dist - b.dist; return a.date.localeCompare(b.date); });

  const loadVendors = async (opp) => {
    if (vendorsByEvent[opp.id]) return;
    setLoadingVendors(l => ({...l, [opp.id]: true}));
    const { data } = await supabase.from('booking_requests').select('vendor_name,vendor_category,vendor_emoji,status')
      .eq('event_name', opp.eventName).eq('status', 'accepted');
    setVendorsByEvent(v => ({...v, [opp.id]: data || []}));
    setLoadingVendors(l => ({...l, [opp.id]: false}));
  };

  const handleExpand = (opp) => {
    const next = expandedId === opp.id ? null : opp.id;
    setExpandedId(next);
    if (next) loadVendors(opp);
  };

  return (
    <>
      <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"48px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(232,201,122,.08),transparent)" }} />
        <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:36, color:"#fff", marginBottom:8, position:"relative" }}>
          Upcoming <em style={{ color:"#e8c97a", fontStyle:"italic" }}>Markets & Events</em>
        </h2>
        <p style={{ color:"#a89a8a", fontSize:16, maxWidth:520, margin:"0 auto", position:"relative" }}>
          Browse upcoming vendor markets, pop-ups, and events across South Jersey.
        </p>
      </div>
      <div className="section" style={{ maxWidth:1100, paddingTop:40 }}>
        <div className="match-filters">
          <div className="match-filter-group" style={{maxWidth:200}}>
            <label>My Zip Code</label>
            <input placeholder="e.g. 08033" value={myZip} maxLength={5} onChange={e=>setMyZip(e.target.value.replace(/\D/g,'').slice(0,5))} />
            {myZip.length===5 && <div className={`zip-feedback ${zipOk?'zip-ok':'zip-warn'}`}>{zipOk ? '✓ Sorted by distance' : '⚠ Zip unverified'}</div>}
          </div>
          <div className="match-filter-group">
            <label>Event Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="match-filter-group">
            <label>Date</label>
            <input type="date" value={filterDate} min={todayStr} onChange={e=>setFilterDate(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>Ticketed</label>
            <select value={filterTicketed} onChange={e=>setFilterTicketed(e.target.value)}>
              <option value="">All Events</option>
              <option value="yes">Ticketed Only</option>
              <option value="no">Free Only</option>
            </select>
          </div>
        </div>
        <div className="results-header">
          <div className="results-count"><strong>{upcoming.length}</strong> upcoming events</div>
        </div>
        {upcoming.length===0
          ? <div className="empty-state"><div className="big">📭</div><p>No upcoming events match your filters.</p></div>
          : (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {upcoming.map(opp => {
              const isOpen = expandedId === opp.id;
              const vendors = vendorsByEvent[opp.id] || [];
              const loading = loadingVendors[opp.id];
              return (
              <div key={opp.id} style={{ background:"#fff", border:"1px solid #e8ddd0", borderRadius:12, overflow:"hidden" }}>
                {/* Card header — always visible */}
                <div style={{ cursor:'pointer' }} onClick={()=>handleExpand(opp)}>
                  <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"18px 24px", display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontFamily:"Playfair Display,serif", fontSize:22, color:"#fff", marginBottom:2, lineHeight:1.3 }}>{opp.eventName}</div>
                      <div style={{ fontSize:12, color:"#a89a8a", letterSpacing:"1px", textTransform:"uppercase" }}>{opp.eventType}</div>
                    </div>
                    <div style={{color:'#a89a8a',fontSize:18,flexShrink:0,marginLeft:12}}>{isOpen ? '▲' : '▼'}</div>
                  </div>
                  <div style={{ padding:"16px 24px" }}>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'12px 24px',marginBottom:opp.notes||opp.isTicketed||opp.eventLink?12:0}}>
                      <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Date </span><span style={{fontSize:14,fontWeight:500}}>{fmtDate(opp.date)}</span></div>
                      {(opp.startTime || opp.endTime) && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Time </span><span style={{fontSize:14,fontWeight:500}}>{fmtTime(opp.startTime)}{opp.endTime ? ' – '+fmtTime(opp.endTime) : ''}</span></div>}
                      <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Location </span><span style={{fontSize:14,fontWeight:500}}>Zip {opp.zip}{opp.dist!==null ? ` · ${opp.dist.toFixed(1)} mi away` : ''}</span></div>
                      {opp.isTicketed && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Admission </span><span style={{fontSize:14,fontWeight:500}}>🎟️ {opp.ticketPrice || 'Ticketed'}</span></div>}
                      {!opp.isTicketed && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Admission </span><span style={{fontSize:14,fontWeight:500,color:'#1a6b3a'}}>Free</span></div>}
                    </div>
                    {opp.notes && <p style={{fontSize:13,color:'#7a6a5a',lineHeight:1.5,margin:'0 0 10px',padding:'10px 12px',background:'#fdf9f5',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{opp.notes}</p>}
                    {opp.eventLink && <div><a href={opp.eventLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:12,color:'#1a4a6b',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>🔗 Event Page</a></div>}
                    {!isOpen && <div style={{fontSize:12,color:'#c8a84b',marginTop:8,fontWeight:600}}>Click to see vendors attending →</div>}
                  </div>
                </div>

                {/* Expanded: vendors attending */}
                {isOpen && (
                  <div style={{borderTop:'1px solid #e8ddd0',padding:'20px 24px',background:'#fdf9f5'}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:12}}>Vendors Attending</div>
                    {loading ? (
                      <div style={{color:'#a89a8a',fontSize:13,padding:'8px 0'}}>Loading vendors...</div>
                    ) : vendors.length === 0 ? (
                      <div style={{color:'#7a6a5a',fontSize:13,padding:'8px 0'}}>No confirmed vendors yet. Check back closer to the event date!</div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                        {vendors.map((v,i) => (
                          <div key={i} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
                            {v.vendor_emoji && <span style={{fontSize:20}}>{v.vendor_emoji}</span>}
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:'#1a1410'}}>{v.vendor_name}</div>
                              {v.vendor_category && <div style={{fontSize:11,color:'#7a6a5a'}}>{v.vendor_category}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
        {/* CTAs */}
        <div style={{ marginTop:48, display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap' }}>
          <div style={{ background:'#fff', border:'1px solid #e8ddd0', borderRadius:12, padding:'28px 32px', textAlign:'center', flex:'1 1 280px', maxWidth:380 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🛍️</div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, marginBottom:6 }}>Are you a vendor?</div>
            <p style={{ fontSize:13, color:'#7a6a5a', marginBottom:14 }}>Find events near you and grow your business.</p>
            <button onClick={()=>{setShowAuthModal ? setShowAuthModal(true) : setTab('vendor');}} className="btn-submit" style={{ fontSize:14, padding:'10px 28px' }}>Apply to Vend</button>
          </div>
          <div style={{ background:'#fff', border:'1px solid #e8ddd0', borderRadius:12, padding:'28px 32px', textAlign:'center', flex:'1 1 280px', maxWidth:380 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🎪</div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, marginBottom:6 }}>Are you an event organizer?</div>
            <p style={{ fontSize:13, color:'#7a6a5a', marginBottom:14 }}>List your event for free and find quality vendors.</p>
            <button onClick={()=>{setShowAuthModal ? setShowAuthModal(true) : setTab('host');}} className="btn-submit" style={{ fontSize:14, padding:'10px 28px', background:'#e8c97a', color:'#1a1410' }}>List Your Event</button>
          </div>
          <div style={{ background:'#fff', border:'1px solid #e8ddd0', borderRadius:12, padding:'28px 32px', textAlign:'center', flex:'1 1 280px', maxWidth:380 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📬</div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, marginBottom:6 }}>Love local markets?</div>
            <p style={{ fontSize:13, color:'#7a6a5a', marginBottom:14 }}>Get a personalized list of events near you — free, weekly or biweekly.</p>
            <button onClick={()=>setShowEventGoerSignup(true)} className="btn-submit" style={{ fontSize:14, padding:'10px 28px' }}>Get Event Alerts</button>
          </div>
        </div>
      </div>
    </>
  );
}

function OpportunitiesPage({ opps, authUser, vendorProfile, setShowAuthModal }) {
  const isVendor = !!vendorProfile;
  const canSeeFullDetails = authUser && isVendor;
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [myZip, setMyZip] = useState("");
  const [saved, setSaved] = useState([]);
  const [applyOpp, setApplyOpp] = useState(null);
  const [showSection, setShowSection] = useState('open');
  const zipOk = myZip.length===5 && isKnownZip(myZip);

  const todayStr = new Date().toISOString().split('T')[0];
  const future = opps
    .filter(o => o.date >= todayStr)
    .filter(o => !filterType || o.eventType===filterType)
    .filter(o => !filterCat  || o.categoriesNeeded.includes(filterCat))
    .filter(o => !filterDate || o.date === filterDate)
    .map(o => {
      const dist = zipOk ? distanceMiles(myZip, o.zip) : null;
      return {...o, dist};
    })
    .sort((a,b) => {
      if (a.dist!==null && b.dist!==null) return a.dist - b.dist;
      return 0;
    });
  const openOpps = future.filter(o => !o.deadline || o.deadline >= todayStr);
  const closedOpps = future.filter(o => o.deadline && o.deadline < todayStr);
  const list = showSection === 'open' ? openOpps : closedOpps;

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
            <label>Date</label>
            <input type="date" value={filterDate} min={todayStr} onChange={e=>setFilterDate(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>Category Needed</label>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:0, marginBottom:20, borderRadius:8, overflow:'hidden', border:'1px solid #e8ddd0' }}>
          <button onClick={()=>setShowSection('open')} style={{
            flex:1, padding:'10px 16px', fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
            fontFamily:'DM Sans,sans-serif',
            background: showSection==='open' ? '#1a1410' : '#fff',
            color: showSection==='open' ? '#e8c97a' : '#7a6a5a',
          }}>Open ({openOpps.length})</button>
          <button onClick={()=>setShowSection('closed')} style={{
            flex:1, padding:'10px 16px', fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
            fontFamily:'DM Sans,sans-serif', borderLeft:'1px solid #e8ddd0',
            background: showSection==='closed' ? '#1a1410' : '#fff',
            color: showSection==='closed' ? '#e8c97a' : '#7a6a5a',
          }}>Coming Soon ({closedOpps.length})</button>
        </div>
        <div className="results-header">
          <div className="results-count"><strong>{list.length}</strong> {showSection==='open' ? 'open opportunities' : 'coming soon — applications closed'}</div>
          <div style={{ fontSize:13, color:"#a89a8a" }}>Past events hidden</div>
        </div>
        {list.length===0
          ? <div className="empty-state"><div className="big">📭</div><p>No opportunities match your filters.</p></div>
          : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24 }}>
            {list.map(opp => (
              <div key={opp.id} style={{ background:"#fff", border:"1px solid #e8ddd0", borderRadius:12, overflow:"hidden", transition:"all 0.2s" }}>
                {/* Photo — vendors only */}
                {canSeeFullDetails && opp.photoUrl && (
                  <div style={{ position:'relative', height:160, overflow:'hidden' }}>
                    <img src={opp.photoUrl} alt={opp.eventName} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(26,20,16,0.7) 100%)' }} />
                    <div style={{ position:'absolute', bottom:10, left:14, display:'inline-block', background:'#e8c97a', color:'#1a1410', fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', padding:'3px 10px', borderRadius:20 }}>{opp.source}</div>
                  </div>
                )}
                {/* Header */}
                <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"20px 24px" }}>
                  {canSeeFullDetails && !opp.photoUrl && <div style={{ display:"inline-block", background:"#e8c97a", color:"#1a1410", fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, marginBottom:10 }}>{opp.source}</div>}
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, color:"#fff", marginBottom:4, lineHeight:1.3 }}>{canSeeFullDetails ? opp.eventName : opp.eventType}</div>
                  <div style={{ fontSize:12, color:"#a89a8a", letterSpacing:"1px", textTransform:"uppercase" }}>{opp.eventType}</div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  {/* Preview fields — visible to everyone */}
                  {opp.notes && <p style={{ fontSize:13, color:"#7a6a5a", lineHeight:1.6, marginBottom:14, padding:12, background:"#fdf9f5", borderRadius:6, borderLeft:"3px solid #e8c97a" }}>{opp.notes}</p>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px',marginBottom:14}}>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Date</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtDate(opp.date)}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Time</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtTime(opp.startTime)}{opp.endTime ? ' – '+fmtTime(opp.endTime) : ''}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Booth Fee</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.boothFee || 'Not specified'}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Admission</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.isTicketed ? '🎟️ '+(opp.ticketPrice||'Ticketed') : 'Free'}</div></div>
                    {opp.deadline && <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Apply By</div><div style={{ fontSize:14, fontWeight:500, color:isUrgent(opp.deadline)?'#8b0000':'#1a1410' }}>{isUrgent(opp.deadline)?'🔥 ':''}{fmtDate(opp.deadline)}</div></div>}
                  </div>

                  {/* Vendor full details */}
                  {canSeeFullDetails ? (
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px',marginBottom:14,paddingTop:14,borderTop:'1px solid #e8ddd0'}}>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Host</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.contactName}</div></div>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Location</div><div style={{ fontSize:14, fontWeight:500 }}>Zip {opp.zip}{opp.dist!==null ? ` · ${opp.dist.toFixed(1)}mi away` : ""}</div></div>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Spots Open</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.spots} available</div></div>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Contact</div><div style={{ fontSize:13, color:'#a89a8a' }}>🔒 Available after booking</div></div>
                      </div>
                      {opp.categoriesNeeded.length > 0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600, marginBottom:6 }}>Categories Needed</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {opp.categoriesNeeded.map(c=><span key={c} style={{ background:"#f5f0ea", border:"1px solid #e8ddd0", padding:"3px 10px", borderRadius:20, fontSize:11, color:"#5a4a3a" }}>{c}</span>)}
                          </div>
                        </div>
                      )}
                      {opp.servicesNeeded && opp.servicesNeeded.length > 0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600, marginBottom:6 }}>Services Needed</div>
                          {opp.servicesNeeded.map((svc,i)=>(
                            <div key={i} style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 12px',marginBottom:6,fontSize:13}}>
                              <strong style={{color:'#1a1410'}}>{svc.type || 'Service'}</strong>
                              <span style={{color:'#7a6a5a'}}> · {svc.duration}</span>
                              <span style={{color:'#7a6a5a'}}> · Budget: {svc.budgetType==='open' ? 'Open to quotes' : svc.budgetType==='fixed' ? (svc.budgetAmount||'TBD') : (svc.budgetMin||'?')+' – '+(svc.budgetMax||'?')}</span>
                              {svc.notes && <div style={{fontSize:11,color:'#a89a8a',marginTop:2}}>{svc.notes}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:10, flexWrap:'wrap' }}>
                        {showSection==='open' && (opp.vendorDiscovery === 'apply' || opp.vendorDiscovery === 'both') && (
                          <button onClick={()=>setApplyOpp(opp)} style={{ flex:2, minWidth:140, background:"#c8a84b", color:"#1a1410", border:"none", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
                            Apply to Vend
                          </button>
                        )}
                        {showSection==='closed' && (
                          <div style={{ flex:2, minWidth:140, padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, textAlign:'center', background:'#f5f0ea', color:'#a89a8a', border:'1px solid #e8ddd0' }}>
                            Applications Closed
                          </div>
                        )}
                        {opp.fbLink && <a href={opp.fbLink} target="_blank" rel="noopener noreferrer" style={{ flex:1, minWidth:100, background:"#1a1410", color:"#e8c97a", border:"none", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"center", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>View on Facebook</a>}
                        <button onClick={()=>setSaved(s=>s.includes(opp.id)?s.filter(x=>x!==opp.id):[...s,opp.id])} style={{ background:saved.includes(opp.id)?"#fdf4dc":"#f5f0ea", color:"#1a1410", border:"1px solid #e0d5c5", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
                          {saved.includes(opp.id)?"\u2713 Saved":"Save"}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Guest / non-vendor CTA */
                    <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'16px 20px',textAlign:'center'}}>
                      <div style={{fontSize:13,color:'#7a5a10',marginBottom:10,lineHeight:1.5}}>🔒 Sign up as a vendor to view full event details and apply</div>
                      <button onClick={()=>{if(setShowAuthModal)setShowAuthModal(true);}}
                        style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:6,padding:'10px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                        Sign Up as a Vendor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {applyOpp && <VendorApplyModal opp={applyOpp} onClose={()=>setApplyOpp(null)} />}
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

// ─── Vendor Response Page (accessed via unique link) ──────────────────────────
function VendorResponsePage({ token }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(null); // 'accept' | 'decline'
  const [vendorMsg, setVendorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadRequest() {
      const { data, error: fetchErr } = await supabase
        .from('booking_requests').select('*').eq('response_token', token).single();
      if (fetchErr || !data) { setError('This booking request link is invalid or has expired.'); setLoading(false); return; }
      setRequest(data);
      setLoading(false);
    }
    loadRequest();
  }, [token]);

  const handleRespond = async (status) => {
    const respondedAt = new Date().toISOString();
    const { error: updateErr } = await supabase.from('booking_requests')
      .update({ status, vendor_message: vendorMsg, responded_at: respondedAt })
      .eq('response_token', token);
    if (updateErr) { alert('Failed to save your response. Please try again.'); return; }
    setRequest(r => ({ ...r, status, vendor_message: vendorMsg, responded_at: respondedAt }));
    setSubmitted(true);
    setResponding(null);
  };

  const fmtDate = d => { if (!d) return ''; try { const [y,m,day] = d.split('-'); const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`; } catch { return d; } };
  const fmtTime = t => { if (!t) return ''; const [h,m] = t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`; };

  const Field = ({label, val}) => val ? (
    <div style={{display:'flex',borderBottom:'1px solid #f0e8dc',padding:'10px 0'}}>
      <div style={{width:160,fontSize:12,fontWeight:700,color:'#a89a8a',textTransform:'uppercase',letterSpacing:0.5}}>{label}</div>
      <div style={{flex:1,fontSize:14,color:'#1a1410'}}>{val}</div>
    </div>
  ) : null;

  return (
    <div style={{minHeight:'100vh',background:'#f5f0ea',fontFamily:"'DM Sans','Helvetica Neue',Arial,sans-serif"}}>
      <div style={{background:'#1a1410',padding:'16px 24px',textAlign:'center'}}>
        <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',letterSpacing:-0.5}}>South Jersey Vendor Market</div>
      </div>
      <div style={{maxWidth:600,margin:'0 auto',padding:'32px 16px'}}>
        {loading && <div style={{textAlign:'center',padding:60,color:'#7a6a5a'}}>Loading booking request...</div>}
        {error && (
          <div style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:12,padding:32,textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12}}>😕</div>
            <div style={{fontSize:16,fontWeight:700,color:'#8b1a1a',marginBottom:8}}>{error}</div>
            <a href="/" style={{color:'#c8a84b',fontSize:14}}>Go to South Jersey Vendor Market</a>
          </div>
        )}
        {request && !loading && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e8ddd0',overflow:'hidden'}}>
            <div style={{background:'#1a1410',padding:'24px 28px',textAlign:'center'}}>
              <div style={{fontSize:14,color:'#a89a8a',marginBottom:4}}>Booking Request</div>
              <div style={{fontSize:22,fontWeight:700,color:'#e8c97a'}}>{request.event_name || request.event_type || 'Event'}</div>
              {request.host_name && <div style={{fontSize:13,color:'#a89a8a',marginTop:6}}>from {request.host_name}</div>}
            </div>

            <div style={{padding:'24px 28px'}}>
              {/* Already responded */}
              {(request.status !== 'pending' || submitted) && (
                <div style={{
                  background: request.status==='accepted'?'#d4f4e0':request.status==='reviewing'?'#fdf4dc':'#fdecea',
                  border: '1px solid '+(request.status==='accepted'?'#b8e8c8':request.status==='reviewing'?'#ffd966':'#f5c6c6'),
                  borderRadius:10,padding:'20px 24px',textAlign:'center',marginBottom:20
                }}>
                  <div style={{fontSize:28,marginBottom:8}}>{request.status==='accepted'?'✅':request.status==='reviewing'?'🔍':'❌'}</div>
                  <div style={{fontSize:16,fontWeight:700,color:request.status==='accepted'?'#1a6b3a':request.status==='reviewing'?'#7a5a10':'#8b1a1a'}}>
                    {request.status==='accepted'
                      ? 'You accepted this booking!'
                      : request.status==='declined'
                        ? 'You declined this booking.'
                        : request.status==='reviewing'
                          ? 'Marked as Pending Review'
                          : `This request has been ${request.status}.`}
                  </div>
                  {request.vendor_message && (
                    <div style={{fontSize:13,color:'#7a6a5a',marginTop:8}}>Your message: "{request.vendor_message}"</div>
                  )}
                  {request.status==='accepted' && request.host_email && (
                    <div style={{marginTop:12,fontSize:13,color:'#2d7a50'}}>
                      The host ({request.host_email}) has been notified. They'll be in touch to confirm details.
                    </div>
                  )}
                  {request.status==='reviewing' && (
                    <div style={{marginTop:12,fontSize:13,color:'#7a5a10'}}>
                      You can return to this page later to accept or decline.
                    </div>
                  )}
                </div>
              )}

              {/* Event details */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1a1410',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Event Details</div>
                <Field label="Event Type" val={request.event_type} />
                <Field label="Date" val={fmtDate(request.event_date)} />
                <Field label="Time" val={request.start_time ? `${fmtTime(request.start_time)}${request.end_time ? ' – '+fmtTime(request.end_time) : ''}` : null} />
                <Field label="Location" val={request.address} />
                <Field label="Zip Code" val={request.event_zip} />
                <Field label="Attendance" val={request.attendance} />
                <Field label="Vendor Spots" val={request.vendor_count} />
                <Field label="Budget" val={request.budget} />
                <Field label="Notes" val={request.notes} />
                {request.is_recurring && (
                  <Field label="Recurring" val={`${request.recurrence_frequency || 'Yes'}${request.recurrence_day ? ' ('+request.recurrence_day+')' : ''}`} />
                )}
              </div>

              <div style={{marginBottom:20}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1a1410',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>Host Info</div>
                <Field label="Host Name" val={request.host_name} />
                <Field label="Email" val={request.status==='accepted' ? request.host_email : '(shared after you accept)'} />
              </div>

              {/* Response actions — show if pending or reviewing */}
              {(request.status === 'pending' || request.status === 'reviewing') && !submitted && (
                <div style={{borderTop:'2px solid #e8ddd0',paddingTop:20}}>
                  {!responding ? (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',gap:12}}>
                        <button onClick={()=>setResponding('accept')} style={{flex:1,background:'#1a6b3a',color:'#fff',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"DM Sans,sans-serif"}}>
                          ✓ Accept
                        </button>
                        <button onClick={()=>setResponding('decline')} style={{flex:1,background:'#8b1a1a',color:'#fff',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"DM Sans,sans-serif"}}>
                          ✗ Decline
                        </button>
                      </div>
                      {request.status === 'pending' && (
                        <button onClick={()=>handleRespond('reviewing')} style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"DM Sans,sans-serif"}}>
                          🔍 Pending Review — Decide Later
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'#1a1410',marginBottom:8}}>
                        {responding==='accept' ? '✅ Add a message (optional):' : '❌ Reason for declining (optional):'}
                      </div>
                      <textarea value={vendorMsg} onChange={e=>setVendorMsg(e.target.value)}
                        placeholder={responding==='accept' ? "Looking forward to it! I'll arrive 30 min early to set up." : "Already booked on this date."}
                        rows={3} style={{width:'100%',border:'1px solid #e0d5c5',borderRadius:8,padding:'10px 12px',fontSize:14,fontFamily:"DM Sans,sans-serif",resize:'none',boxSizing:'border-box'}} />
                      <div style={{display:'flex',gap:10,marginTop:12}}>
                        <button onClick={()=>handleRespond(responding==='accept'?'accepted':'declined')}
                          style={{flex:2,background:responding==='accept'?'#1a6b3a':'#8b1a1a',color:'#fff',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"DM Sans,sans-serif"}}>
                          {responding==='accept'?'Confirm Acceptance':'Confirm Decline'}
                        </button>
                        <button onClick={()=>{setResponding(null);setVendorMsg('');}}
                          style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"DM Sans,sans-serif"}}>
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{textAlign:'center',marginTop:24}}>
          <a href="/" style={{color:'#c8a84b',fontSize:13,textDecoration:'none'}}>← South Jersey Vendor Market</a>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function AppInner() {
  const getTabFromUrl = () => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path && path !== '') return path;
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'home';
  };
  const [tab, setTabRaw] = useState(getTabFromUrl);
  const setTab = (newTab) => {
    setTabRaw(newTab);
    const url = newTab === 'home' ? '/' : '/' + newTab;
    window.history.pushState({ tab: newTab }, '', url);
  };
  useEffect(() => {
    const onPop = () => {
      const t = getTabFromUrl();
      setTabRaw(t);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    const initTab = getTabFromUrl();
    const initUrl = initTab === 'home' ? '/' : '/' + initTab;
    window.history.replaceState({ tab: initTab }, '', initUrl);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [vendorProfile, setVendorProfile] = useState(null); // raw DB row for logged-in vendor
  const [userEvents, setUserEvents] = useState([]); // raw DB rows for logged-in host
  const isAdmin = authUser && ADMIN_EMAILS.includes(authUser.email?.toLowerCase());

  // Listen for auth state changes — clear drafts when no session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) clearAllDrafts();
      setAuthUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) clearAllDrafts();
      setAuthUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Post-login: check for pending signup roles and route accordingly
  useEffect(() => {
    if (!authUser) return;
    const pendingStr = localStorage.getItem('sjvm_pending_roles');
    if (!pendingStr) return;
    localStorage.removeItem('sjvm_pending_roles');
    try {
      const roles = JSON.parse(pendingStr);
      // Priority: vendor form first, then event guest preferences, then host message
      if (roles.vendor) {
        setTab('vendor');
        // If also event guest, open preferences after a short delay
        if (roles.eventGoer) setTimeout(() => setShowEventGoerSignup(true), 500);
      } else if (roles.eventGoer) {
        setShowEventGoerSignup(true);
      } else if (roles.host) {
        setTab('host');
      }
    } catch {}
  }, [authUser]);

  // Load vendor profile and host events for logged-in user
  useEffect(() => {
    if (!authUser) { setVendorProfile(null); setUserEvents([]); setEventGoerProfile(null); return; }
    // Check if user is an event guest
    supabase.from('event_goers').select('*').eq('email', authUser.email).limit(1).single()
      .then(({ data }) => { if (data) setEventGoerProfile(data); });
    // Find vendor linked to this user
    supabase.from('vendors').select('*').eq('user_id', authUser.id).limit(1).single()
      .then(({ data }) => { if (data) setVendorProfile(data); });
    // Also check by email if not linked yet
    supabase.from('vendors').select('*').eq('contact_email', authUser.email).limit(1).single()
      .then(({ data }) => {
        if (data && !data.user_id) {
          // Link existing vendor to this auth user
          supabase.from('vendors').update({ user_id: authUser.id }).eq('id', data.id).then(() => {});
          setVendorProfile(data);
        } else if (data) {
          setVendorProfile(p => p || data);
        }
      });
    // Find events linked to this user
    supabase.from('events').select('*').eq('user_id', authUser.id).order('date', { ascending: false })
      .then(({ data }) => { if (data) setUserEvents(data); });
    // Also link by email
    supabase.from('events').select('*').eq('contact_email', authUser.email).order('date', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const unlinked = data.filter(e => !e.user_id);
          if (unlinked.length > 0) {
            Promise.all(unlinked.map(e => supabase.from('events').update({ user_id: authUser.id }).eq('id', e.id)));
          }
          setUserEvents(prev => {
            const ids = new Set(prev.map(e => e.id));
            return [...prev, ...data.filter(e => !ids.has(e.id))];
          });
        }
      });
  }, [authUser]);

  const clearAllDrafts = () => {
    localStorage.removeItem('sjvm_vendor_draft');
    localStorage.removeItem('sjvm_vendor_draft_subs');
    localStorage.removeItem('sjvm_host_draft');
    localStorage.removeItem('sjvm_host_draft_subs');
    localStorage.removeItem('sjvm_conversations');
    localStorage.removeItem('sjvm_vendor_calendars');
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAllDrafts();
    setAuthUser(null); setVendorProfile(null); setUserEvents([]);
    setTab('home');
  };

  const [vendorSuccess, setVendorSuccess] = useState(false);
  const [vendorConfirm, setVendorConfirm] = useState(null); // { ref, email, name }
  const [hostSuccess,   setHostSuccess]   = useState(false);
  const [hostConfirm,   setHostConfirm]   = useState(null); // { ref, email, eventName }
  const [hostEvent,     setHostEvent]     = useState(null);
  const [vendors, setVendors] = useState([]);
  const [opps, setOpps] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [eventGoers, setEventGoers] = useState([]);
  const [eventGoerProfile, setEventGoerProfile] = useState(null);
  const [hostCount, setHostCount] = useState(0);
  const [showEventGoerSignup, setShowEventGoerSignup] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navTo = (t) => { setTab(t); setMobileMenuOpen(false); window.scrollTo({top:0}); };
  const [vendorSubs, setVendorSubs] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);

  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal back-button support
  const modalOpenRef = useRef(false);
  const anyModalOpen = showAuthModal || showContactModal || showFeedbackModal || showEventGoerSignup || mobileMenuOpen;
  useEffect(() => {
    if (anyModalOpen && !modalOpenRef.current) {
      window.history.pushState({ modal: true }, '');
      modalOpenRef.current = true;
    } else if (!anyModalOpen) {
      modalOpenRef.current = false;
    }
  }, [anyModalOpen]);

  useEffect(() => {
    const onPop = () => {
      if (modalOpenRef.current) {
        setShowAuthModal(false); setShowContactModal(false);
        setShowFeedbackModal(false); setShowEventGoerSignup(false);
        setMobileMenuOpen(false);
        modalOpenRef.current = false;
        return;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
      // Try loading approved vendors; if status column doesn't exist yet, load all vendors
      let vendorRows, vErr;
      const [approvedResult, eventResult] = await Promise.all([
        supabase.from('vendors').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }),
      ]);
      vendorRows = approvedResult.data;
      vErr = approvedResult.error;
      const { data: eventRows, error: eErr } = eventResult;

      // Fallback: if status column doesn't exist, fetch all vendors
      if (vErr && vErr.code === '42703') {
        console.warn('vendors.status column not found — loading all vendors');
        const fallback = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
        vendorRows = fallback.data;
        vErr = fallback.error;
      }

      if (vErr) { console.error('Failed to load vendors:', vErr); setLoadError('Could not load vendor data. Please refresh.'); }
      else if (vendorRows) setVendors(vendorRows.map(dbVendorToApp));

      // Load pending vendors for admin review (skip if status column doesn't exist)
      const { data: pendingRows, error: pErr } = await supabase.from('vendors').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      if (pErr && pErr.code !== '42703') console.error('Failed to load pending vendors:', pErr);
      else if (pendingRows) setPendingVendors(pendingRows);
      if (eErr) { console.error('Failed to load events:', eErr); setLoadError('Could not load event data. Please refresh.'); }
      else if (eventRows) {
        // Public feed only shows approved events (or events without status column for backwards compat)
        setOpps(eventRows.map(dbEventToApp).filter(e => !e.status || e.status === 'approved' || e.status === 'concierge_active'));
        // Store all events including pending for admin
        setAllEvents(eventRows.map(dbEventToApp));
      }

      // Load event guests for admin
      supabase.from('event_goers').select('*').eq('active', true).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setEventGoers(data); });

      // Count distinct hosts (events with unique user_id or contact_email)
      supabase.from('events').select('user_id,contact_email')
        .then(({ data }) => {
          if (data) {
            const unique = new Set(data.map(e => e.user_id || e.contact_email).filter(Boolean));
            setHostCount(unique.size);
          }
        });

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
      } catch (err) {
        console.error('fetchData error:', err);
        setLoadError('Something went wrong loading data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Poll for booking request status updates (vendor responses via email link)
  useEffect(() => {
    const interval = setInterval(async () => {
      const sid = getSessionId();
      const { data: rows } = await supabase
        .from('booking_requests').select('id,status,vendor_message,responded_at')
        .eq('session_id', sid);
      if (rows) {
        setBookingRequests(prev => prev.map(r => {
          const updated = rows.find(u => u.id === r.id);
          if (updated && updated.status !== r.status) {
            return { ...r, status: updated.status, vendorMessage: updated.vendor_message || '', respondedAt: updated.responded_at };
          }
          return r;
        }));
      }
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
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
    const responseToken = crypto.randomUUID();
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
      responseToken,
    };
    setBookingRequests(r => [req, ...r]);
    // Persist to Supabase so the request survives page refreshes
    const brPayload = {
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
      response_token: responseToken,
    };
    let { error: brErr } = await supabase.from('booking_requests').insert(brPayload);
    if (brErr && brErr.code === 'PGRST204') {
      const { response_token: _rt, ...withoutToken } = brPayload;
      ({ error: brErr } = await supabase.from('booking_requests').insert(withoutToken));
    }
    if (brErr) console.error('Failed to persist booking request:', brErr);

    // Look up vendor email and send notification
    if (!brErr) {
      const { data: vendorRow } = await supabase.from('vendors').select('contact_email').eq('id', vendor.id).single();
      const vendorEmail = vendorRow?.contact_email;
      if (vendorEmail) {
        try {
          await fetch('/api/send-booking-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorEmail, vendorName: vendor.name,
              hostName: req.hostName, hostEmail: req.hostEmail,
              eventName: req.eventName, eventType: req.eventType,
              eventDate: req.eventDate, startTime: req.startTime,
              endTime: req.endTime, eventZip: req.eventZip,
              address: req.address, attendance: req.attendance,
              vendorCount: req.vendorCount, budget: req.budget,
              notes: req.notes, isRecurring: req.isRecurring,
              recurrenceFrequency: req.recurrenceFrequency,
              recurrenceDay: req.recurrenceDay,
              responseToken,
            }),
          });
        } catch (emailErr) {
          console.error('Failed to send booking email:', emailErr);
        }
      }
    }

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
    if (!form.businessName || !form.email) {
      alert("Please fill in Business Name and Email.");
      return;
    }
    const hasMarketCats = form.categories && form.categories.length > 0;
    const hasServiceCats = form.serviceCategories && form.serviceCategories.length > 0;
    const isMarket = form.vendorType?.market;
    const isService = form.vendorType?.service;
    if (!isMarket && !isService) {
      alert("Please select whether you are a Market Vendor, Event Service Provider, or both.");
      return;
    }
    if (isMarket && !hasMarketCats) {
      alert("Please select at least one product category for your Market Vendor profile.");
      return;
    }
    if (isService && !hasServiceCats) {
      alert("Please select at least one service category for your Service Provider profile.");
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
    // Create auth account if not already logged in
    let userId = authUser?.id || null;
    if (!authUser) {
      if (!form.password || form.password.length < 6) {
        alert("Please create a password (minimum 6 characters) for your vendor account.");
        return;
      }
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (signUpErr) {
        if (signUpErr.message?.includes('already registered')) {
          alert("An account with this email already exists. Please log in first, then submit your vendor profile.");
          setShowAuthModal(true); setAuthEmail(form.email);
          return;
        }
        alert(`Account creation failed: ${signUpErr.message}`);
        return;
      }
      userId = signUpData.user?.id || null;
    }
    // Check for duplicate vendor email
    const { data: existing } = await supabase.from('vendors').select('id').eq('contact_email', form.email).limit(1);
    if (existing && existing.length > 0) {
      if (!window.confirm('A vendor profile with this email already exists. Submit another profile anyway?')) return;
    }
    const metadataPayload = {
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
      youtube: form.youtube || null,
      otherSocial: form.otherSocial || null,
      responseTime: form.responseTime,
      bookingLeadTime: form.bookingLeadTime,
      eventFrequency: form.eventFrequency,
      setupTime: form.setupTime,
      tableSize: form.tableSize,
      needsElectric: form.needsElectric,
      yearsActive: form.yearsActive || null,
      allCategories: form.categories,
      vendorType: form.vendorType || {market:false,service:false},
      serviceCategories: form.serviceCategories || [],
      serviceSubcategories: form.serviceSubcategories || [],
      isServiceProvider: form.vendorType?.service || form.isServiceProvider || false,
      serviceType: form.serviceType || null,
      serviceRateMin: form.serviceRateMin || null,
      serviceRateMax: form.serviceRateMax || null,
      serviceRateType: form.serviceRateType || 'fixed',
      minBookingDuration: form.minBookingDuration || null,
      serviceDescription: form.serviceDescription || null,
    };
    const vendorPayload = {
      name:                form.businessName,
      contact_name:        form.ownerName     || null,
      category:            form.categories?.[0] || form.serviceCategories?.[0] || 'Other',
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
      status:              'pending',
      ...(userId ? { user_id: userId } : {}),
    };
    let { data: newVendor, error } = await supabase.from('vendors').insert(vendorPayload).select('id').single();
    // Retry without status if the column doesn't exist yet
    if (error && error.code === '42703') {
      const { status: _s, ...payloadWithoutStatus } = vendorPayload;
      ({ data: newVendor, error } = await supabase.from('vendors').insert(payloadWithoutStatus).select('id').single());
    }
    if (error) {
      console.error('Vendor submit error:', error);
      alert(`Submission failed: ${error.message}\n\nIf this keeps happening, please contact support@southjerseyvendormarket.com`);
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
      // Re-fetch the vendor from DB to get the complete record with file URLs
      const { data: fullVendor } = await supabase.from('vendors').select('*').eq('id', newVendor.id).single();
      if (fullVendor) {
        setPendingVendors(p => [fullVendor, ...p]);
      } else {
        setPendingVendors(p => [{ id: newVendor.id, name: form.businessName, contact_name: form.ownerName, category: form.categories?.[0] || form.serviceCategories?.[0] || 'Other', home_zip: form.homeZip, radius: form.radius, contact_email: form.email, contact_phone: form.phone, status: 'pending', created_at: new Date().toISOString(), metadata: { ...metadataPayload }, subcategories: form.subcategories || [] }, ...p]);
      }
    }
    // Send notification emails
    try {
      await fetch('/api/send-vendor-notification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.ownerName,
          vendorEmail: form.email,
          phone: form.phone,
          category: form.categories?.[0] || form.serviceCategories?.[0] || 'Other',
          vendorType: form.vendorType?.market && form.vendorType?.service ? 'both' : form.vendorType?.service ? 'service' : 'market',
        }),
      });
    } catch (e) { console.error('Notification email failed:', e); }

    setVendorConfirm({ ref: generateRef(), email: form.email, name: form.businessName });
    setVendorSuccess(true);
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const handleHostSubmit = async (form, files = {}) => {
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
    if (!form.eventLink || !/^https?:\/\/.+/.test(form.eventLink)) {
      alert('Please provide a valid event website or Facebook page URL.');
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
    // Create auth account if not already logged in
    let hostUserId = authUser?.id || null;
    if (!authUser) {
      if (!form.password || form.password.length < 6) {
        alert("Please create a password (minimum 6 characters) for your host account.");
        return;
      }
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (signUpErr) {
        if (signUpErr.message?.includes('already registered')) {
          alert("An account with this email already exists. Please log in first, then post your event.");
          setShowAuthModal(true); setAuthEmail(form.email);
          return;
        }
        alert(`Account creation failed: ${signUpErr.message}`);
        return;
      }
      hostUserId = signUpData.user?.id || null;
    }
    const eventPayload = {
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
      deadline: form.applyByDate || null,
      source: form.fullServiceBooking ? 'Concierge Request' : 'Host Submitted',
      status: form.fullServiceBooking ? 'concierge_pending' : 'pending_review',
      event_link: form.eventLink || null,
      is_ticketed: form.isTicketedEvent || false,
      ticket_price: form.isTicketedEvent ? (form.ticketPrice || null) : null,
      services_needed: form.servicesNeeded.length > 0 ? JSON.stringify(form.servicesNeeded) : null,
      allow_duplicate_categories: form.allowDuplicateCategories,
      vendor_discovery: form.vendorDiscovery || 'both',
      ...(hostUserId ? { user_id: hostUserId } : {}),
    };
    let { data: newEvent, error: eventErr } = await supabase.from('events').insert(eventPayload).select().single();
    // Retry without newer columns if they don't exist yet
    if (eventErr && (eventErr.code === '42703' || eventErr.code === 'PGRST204')) {
      const { vendor_discovery: _vd, status: _st, event_link: _el, ...fallback } = eventPayload;
      ({ data: newEvent, error: eventErr } = await supabase.from('events').insert(fallback).select().single());
    }
    if (eventErr) {
      console.error('Event submit error:', eventErr);
      alert(`Failed to submit event: ${eventErr.message}\n\nPlease try again or contact support@southjerseyvendormarket.com`);
      return;
    }
    // Send concierge email with payment link
    if (form.fullServiceBooking && newEvent) {
      try {
        await fetch('/api/send-concierge-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostEmail: form.email,
            hostName: form.contactName,
            eventName: form.eventName || form.eventType,
            eventDate: form.date,
            eventId: newEvent.id,
          }),
        });
      } catch (e) { console.error('Concierge email failed:', e); }
    }
    // Upload event photos
    if (newEvent && files.eventPhotos && files.eventPhotos.length > 0) {
      const bucket = 'vendor-files';
      const eid = newEvent.id;
      const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const photoUrls = await Promise.all(files.eventPhotos.slice(0,6).map(async (f, i) => {
        const path = `events/${eid}/photos/${i}-${safeName(f.name)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, f, { upsert: true, contentType: f.type });
        if (error) { console.error('Event photo upload error:', error); return null; }
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      }));
      const validUrls = photoUrls.filter(Boolean);
      if (validUrls.length > 0) {
        await supabase.from('events').update({ event_photos: validUrls }).eq('id', eid);
      }
    }
    // Send host confirmation email
    try {
      await fetch('/api/send-host-confirmation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostEmail: form.email, hostName: form.contactName, eventName: form.eventName || form.eventType, eventDate: form.date, eventType: form.eventType, isConcierge: form.fullServiceBooking }),
      });
    } catch (e) { console.error('Host confirmation email failed:', e); }
    // Notify admin of new event submission
    fetch('/api/send-contact', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:'Admin Alert', email:'system@sjvm.app', subject:`New Event Submitted: ${form.eventName||form.eventType}${form.fullServiceBooking?' [CONCIERGE]':''}`, message:`Host: ${form.contactName} (${form.email})\nEvent: ${form.eventName||form.eventType}\nType: ${form.eventType}\nDate: ${form.date}\nZip: ${form.eventZip}\n${form.fullServiceBooking?'CONCIERGE REQUEST — requires follow-up\n':''}Review in admin panel.` }),
    }).catch(()=>{});

    // Pending events don't appear in public feed — they go through admin approval
    // Only add to user's own events list for their dashboard
    if (newEvent) {
      setUserEvents(prev => [dbEventToApp(newEvent), ...prev]);
    }
    setHostEvent(form);
    setHostConfirm({ ref: generateRef(), email: form.email, eventName: form.eventName || form.eventType, isPending: true, isConcierge: form.fullServiceBooking });
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
          <div className="nav-logo" style={{cursor:'pointer',background:'none'}} onClick={()=>{setTab('home');setMobileMenuOpen(false);window.scrollTo({top:0});}}><img src="/Logo.png" alt="South Jersey Vendor Market" style={{height:40,width:'auto',display:'block',background:'none',border:'none'}} /></div>
          {/* Admin + Auth + Hamburger on right */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isAdmin && (
            <button onClick={()=>{setTab('admin');window.scrollTo({top:0});}} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>
              Admin{(pendingVendors.length + allEvents.filter(e=>e.status==='pending_review').length) > 0 ? ` (${pendingVendors.length + allEvents.filter(e=>e.status==='pending_review').length})` : ''}
            </button>
          )}
          {authUser ? (
            <button onClick={handleLogout} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'6px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Log Out</button>
          ) : (
            <button onClick={()=>setShowAuthModal(true)} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Log In / Sign Up</button>
          )}
          <button className="hamburger-btn" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a850" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
          </div>
          {/* Menu panel */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-header">
                <div style={{cursor:'pointer'}} onClick={()=>{navTo('home');}}><img src="/Logo.png" alt="South Jersey Vendor Market" style={{height:36,background:'none',border:'none'}} /></div>
                <button onClick={()=>setMobileMenuOpen(false)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a850" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Auth — first item */}
              <div className="mobile-menu-section">
                {authUser ? (
                  <>
                    {vendorProfile && <button className={`mobile-menu-item${tab==='vendor-dashboard'?' active':''}`} onClick={()=>navTo('vendor-dashboard')}>Vendor Dashboard</button>}
                    {userEvents.length > 0 && <button className={`mobile-menu-item${tab==='host-dashboard'?' active':''}`} onClick={()=>navTo('host-dashboard')}>Host Dashboard</button>}
                    {eventGoerProfile && <button className={`mobile-menu-item${tab==='event-goer-dashboard'?' active':''}`} onClick={()=>navTo('event-goer-dashboard')}>Event Guest Dashboard</button>}
                    {isAdmin && <button className={`mobile-menu-item${tab==='admin'?' active':''}`} onClick={()=>navTo('admin')} style={{color:'#e8c97a'}}>Admin Panel</button>}
                    <button className="mobile-menu-item" style={{color:'#c8a850'}} onClick={()=>{handleLogout();setMobileMenuOpen(false);}}>Log Out</button>
                  </>
                ) : (
                  <button className="mobile-menu-item" style={{color:'#c8a850',fontWeight:700}} onClick={()=>{setShowAuthModal(true);setMobileMenuOpen(false);}}>Log In / Sign Up</button>
                )}
              </div>
              <div className="mobile-menu-section">
                <button className={`mobile-menu-item${tab==='home'?' active':''}`} onClick={()=>navTo('home')}>Home</button>
                <button className={`mobile-menu-item${tab==='upcoming-markets'?' active':''}`} onClick={()=>navTo('upcoming-markets')}>Upcoming Markets</button>
              </div>
              <div className="mobile-menu-section">
                <div className="mobile-menu-label">Vendors</div>
                <button className={`mobile-menu-item${tab==='vendor'?' active':''}`} onClick={()=>navTo('vendor')}>Join as Vendor</button>
                <button className={`mobile-menu-item${tab==='opportunities'?' active':''}`} onClick={()=>navTo('opportunities')}>Opportunities</button>
                <button className={`mobile-menu-item${tab==='messages'?' active':''}`} onClick={()=>navTo('messages')}>Messages</button>
                {authUser && <button className={`mobile-menu-item${tab==='calendar'?' active':''}`} onClick={()=>navTo('calendar')}>My Calendar</button>}
              </div>
              <div className="mobile-menu-section">
                <div className="mobile-menu-label">Hosts</div>
                <button className={`mobile-menu-item${tab==='host'?' active':''}`} onClick={()=>navTo('host')}>Post Event</button>
                <button className={`mobile-menu-item${tab==='matches'?' active':''}`} onClick={()=>navTo('matches')}>Browse Vendors</button>
                <button className={`mobile-menu-item${tab==='messages'?' active':''}`} onClick={()=>navTo('messages')}>Messages</button>
                {authUser && <button className={`mobile-menu-item${tab==='host-calendar'?' active':''}`} onClick={()=>navTo('host-calendar')}>My Calendar</button>}
              </div>
              <div className="mobile-menu-section">
                <button className={`mobile-menu-item${tab==='pricing'?' active':''}`} onClick={()=>navTo('pricing')}>Pricing</button>
                <button className="mobile-menu-item" onClick={()=>{setShowContactModal(true);setMobileMenuOpen(false);}}>Contact Us</button>
                <button className={`mobile-menu-item${tab==='tos'?' active':''}`} onClick={()=>navTo('tos')}>Terms</button>
              </div>
            </div>
          )}
          <div className="nav-tabs">
            <button className={`nav-tab${tab==="home"?" active":""}`} onClick={()=>{setTab("home");window.scrollTo({top:0});}}>Home</button>
            <button className={`nav-tab${tab==="upcoming-markets"?" active":""}`} onClick={()=>{setTab("upcoming-markets");window.scrollTo({top:0});}}>Upcoming Markets</button>
            <div className="nav-group">
              <div className="nav-group-label">&#128717; Vendors</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="vendor"?" active":""}`} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Join as Vendor</button>
                <button className={`nav-tab${tab==="opportunities"?" active":""}`} onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Opportunities</button>
                <button className={`nav-tab${tab==="messages"?" active":""}`} onClick={()=>{setTab("messages");window.scrollTo({top:0});}}>
                  Messages{(()=>{const p=bookingRequests.filter(r=>r.status==='pending').length;return p>0?` (${p} pending)`:conversations.length>0?` (${conversations.length})`:"";})()}
                </button>
                <button className={`nav-tab${tab==="calendar"?" active":""}`} onClick={()=>{setTab("calendar");window.scrollTo({top:0});}}>My Calendar</button>
              </div>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">&#127918; Hosts</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="host"?" active":""}`} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Post Event</button>
                {(!vendorProfile || userEvents.length > 0) && <button className={`nav-tab${tab==="matches"?" active":""}`} onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Browse Vendors</button>}
                <button className={`nav-tab${tab==="messages"?" active":""}`} onClick={()=>{setTab("messages");window.scrollTo({top:0});}}>
                  Messages{(()=>{const p=bookingRequests.filter(r=>r.status==='pending').length;return p>0?` (${p} pending)`:conversations.length>0?` (${conversations.length})`:"";})()}
                </button>
                <button className={`nav-tab${tab==="host-calendar"?" active":""}`} onClick={()=>{setTab("host-calendar");window.scrollTo({top:0});}}>My Calendar</button>
              </div>
            </div>
            <button className={`nav-tab${tab==="pricing"?" active":""}`} onClick={()=>{setTab("pricing");window.scrollTo({top:0});}}>Pricing</button>
            <button className="nav-tab" onClick={()=>setShowContactModal(true)}>Contact Us</button>
            <button className={`nav-tab${tab==="tos"?" active":""}`} onClick={()=>{setTab("tos");window.scrollTo({top:0});}}>Terms</button>
            {isAdmin && <button className={`nav-tab${tab==="admin"?" active":""}`} onClick={()=>{setTab("admin");window.scrollTo({top:0});}}>Admin</button>}
            {authUser ? (
              <div className="nav-group">
                <div className="nav-group-label">&#128100; Account{vendorProfile && userEvents.length > 0 ? ' (Vendor + Host)' : vendorProfile ? ' (Vendor)' : userEvents.length > 0 ? ' (Host)' : ''}</div>
                <div className="nav-group-items">
                  {vendorProfile && <button className={`nav-tab${tab==="vendor-dashboard"?" active":""}`} onClick={()=>{setTab("vendor-dashboard");window.scrollTo({top:0});}}>Vendor Dashboard</button>}
                  {userEvents.length > 0 && <button className={`nav-tab${tab==="host-dashboard"?" active":""}`} onClick={()=>{setTab("host-dashboard");window.scrollTo({top:0});}}>Host Dashboard</button>}
                  {vendorProfile && userEvents.length === 0 && <button className="nav-tab" style={{fontSize:12,color:'#a89a8a'}} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>+ Add Host Role</button>}
                  {!vendorProfile && userEvents.length > 0 && <button className="nav-tab" style={{fontSize:12,color:'#a89a8a'}} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>+ Add Vendor Role</button>}
                  <button className="nav-tab" onClick={handleLogout} style={{color:'#c8a84b'}}>Log Out</button>
                </div>
              </div>
            ) : (
              <button className="nav-tab" onClick={()=>setShowAuthModal(true)} style={{color:'#e8c97a',fontWeight:700}}>Log In</button>
            )}
          </div>
        </nav>

        {tab==='home' && (
          <div style={{background:'#0e0c0a'}}>
            {/* Text logo */}
            <div style={{textAlign:'center',paddingTop:32,paddingBottom:0}}>
              <h1 style={{margin:0,lineHeight:1}}>
                <span style={{fontFamily:"'Ibarra Real Nova',serif",fontSize:'clamp(56px,8vw,96px)',color:'#c8a850',display:'block',lineHeight:1.1,fontWeight:700,fontStyle:'italic'}}>South Jersey</span>
                <span style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:'clamp(20px,3.2vw,38px)',color:'#fff',letterSpacing:6,fontWeight:700,textTransform:'uppercase',display:'block',marginTop:8}}>Vendor Market</span>
              </h1>
              <div style={{width:60,height:2,background:'#c8a850',margin:'10px auto 8px',borderRadius:1}} />
              <p style={{fontFamily:"'Public Sans',sans-serif",fontSize:'clamp(12px,1.2vw,15px)',color:'#c8a850',margin:'0 auto',lineHeight:1.4}}>Connecting vendors, events, and communities across South Jersey</p>
            </div>

            {/* Three cards */}
            <div className="home-columns" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:1200,width:'100%',margin:'0 auto',padding:'32px 32px 0'}}>
              {[
                { title:'Vendors', desc:'Create your profile, set your travel radius, and get matched with events looking for what you offer.',
                  buttons:[{label:'Join as a Vendor',tab:'vendor'},{label:'Browse Opportunities',tab:'opportunities'},...(authUser?[{label:'My Calendar',tab:'calendar'}]:[])] },
                { title:'Event Hosts', desc:'Post your event for free, browse vendor profiles, send booking requests, and manage it all in one place.',
                  buttons:[{label:'Post Your Event',tab:'host'},{label:'Browse Vendors',tab:'matches'},...(authUser?[{label:'My Calendar',tab:'host-calendar'}]:[])] },
                { title:'Event Guests', desc:'Discover local markets, craft fairs, food festivals, and pop-up events happening across South Jersey.',
                  buttons:[{label:'Browse Upcoming Markets',tab:'upcoming-markets'},{label:'Get Event Alerts',action:'eventGoerSignup'}] },
              ].map(card=>(
                <div key={card.title} className="home-col" style={{background:'#0e0c0a',borderRadius:10,padding:24,display:'flex',flexDirection:'column',textAlign:'center',border:'2px solid #c8a850'}}>
                  <h2 style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:'clamp(16px,1.6vw,24px)',color:'#fff',margin:'0 0 8px',lineHeight:1.2,fontWeight:700}}>
                    {card.title}
                  </h2>
                  <p style={{fontFamily:"'Public Sans',sans-serif",fontSize:'clamp(11px,0.85vw,14px)',color:'#c8a850',lineHeight:1.5,margin:'0 0 16px'}}>
                    {card.desc}
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:'auto'}}>
                    {card.buttons.map(b=>(
                      <button key={b.label} onClick={()=>{ if(b.action==='eventGoerSignup') setShowEventGoerSignup(true); else {setTab(b.tab);window.scrollTo({top:0});} }}
                        style={{width:'100%',background:'#0e0c0a',color:'#e8c97a',border:'1px solid rgba(255,255,255,0.4)',borderRadius:8,padding:'10px 0',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Public Sans',sans-serif",letterSpacing:0.3}}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div style={{padding:'16px 24px',display:'flex',justifyContent:'center',gap:'clamp(40px,8vw,100px)',flexWrap:'wrap',borderTop:'1px solid rgba(200,168,80,0.25)',borderBottom:'2px solid #c8a850',marginTop:32}}>
              {[
                {num: vendors.length || '—', label:'Active Vendors'},
                {num: eventGoers.length || '—', label:'Event Guests'},
                {num: opps.length || '—', label:'Live Events'},
              ].map(s=>(
                <div key={s.label} style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:'clamp(22px,2.4vw,34px)',fontWeight:700,color:'#fff',lineHeight:1}}>{s.num}</div>
                  <div style={{fontFamily:"'Public Sans',sans-serif",fontSize:10,color:'#c8a850',letterSpacing:1.5,textTransform:'uppercase',fontWeight:600,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

          </div>
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
                      <a href={`mailto:${vendorConfirm.email}?subject=Your SJVM Vendor Registration — ${vendorConfirm.ref}&body=Hi ${vendorConfirm.name},%0A%0AThank you for registering with South Jersey Vendor Market!%0A%0AYour confirmation number is: ${vendorConfirm.ref}%0A%0AWhat happens next:%0A• Your listing will be reviewed within 24 hours%0A• You'll be matched with nearby events automatically%0A• Check Messages for booking requests from hosts%0A%0A— South Jersey Vendor Market%0Asupport@southjerseyvendormarket.com`}
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
                <VendorForm onSubmit={handleVendorSubmit} setTab={setTab} authUser={authUser} setShowAuthModal={setShowAuthModal} />
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
                <HostForm onSubmit={handleHostSubmit} setTab={setTab} authUser={authUser} setShowAuthModal={setShowAuthModal} />
              </>
            )}
          </div>
        )}

        {tab==="matches"      && (vendorProfile && userEvents.length === 0
          ? <div className="section" style={{maxWidth:600,textAlign:'center'}}><div className="section-title">Browse Vendors</div><p className="section-sub">This section is available to event hosts. To browse vendors, <a href="#" onClick={e=>{e.preventDefault();setTab('host')}} style={{color:'#e8c97a'}}>post an event</a> first.</p></div>
          : loading
            ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading vendors…</div>
            : <MatchesPage vendors={vendors} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} />)}
        {tab==="upcoming-markets" && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading events…</div>
          : <UpcomingMarketsPage opps={opps} setTab={setTab} setShowAuthModal={setShowAuthModal} setShowEventGoerSignup={setShowEventGoerSignup} />)}
        {tab==="opportunities" && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading events…</div>
          : <OpportunitiesPage opps={opps} authUser={authUser} vendorProfile={vendorProfile} setShowAuthModal={setShowAuthModal} />)}
        {tab==="pricing"       && <PricingPage setTab={setTab} authUser={authUser} vendorProfile={vendorProfile} userEvents={userEvents} setShowAuthModal={setShowAuthModal} setShowContactModal={setShowContactModal} />}
        {tab==="admin"         && <AdminPage opps={opps} setOpps={setOpps} allEvents={allEvents} setAllEvents={setAllEvents} vendorSubs={vendorSubs} vendors={vendors} setVendors={setVendors} pendingVendors={pendingVendors} setPendingVendors={setPendingVendors} isAdmin={isAdmin} eventGoers={eventGoers} />}
        {tab==="messages"      && <MessagesPage conversations={conversations} setConversations={setConversations} activeConvoId={activeConvoId} setActiveConvoId={setActiveConvoId} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} />}
        {tab==="tos"           && <TosPage setTab={setTab} />}
        {tab==="calendar"      && <VendorCalendarPage vendorId={calendarVendorId} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} />}
        {tab==="host-calendar" && <HostCalendarPage hostEvent={hostEvent} bookingRequests={bookingRequests} setTab={setTab} hostConfirm={hostConfirm} clearHostConfirm={()=>setHostConfirm(null)} />}
        {tab==="vendor-dashboard" && authUser && vendorProfile && <VendorDashboard user={authUser} vendorProfile={vendorProfile} setVendorProfile={setVendorProfile} bookingRequests={bookingRequests} setTab={setTab} setShowContactModal={setShowContactModal} setShowFeedbackModal={setShowFeedbackModal} />}
        {tab==="host-dashboard"   && authUser && <HostDashboard user={authUser} userEvents={userEvents} setUserEvents={setUserEvents} setTab={setTab} setShowContactModal={setShowContactModal} setShowFeedbackModal={setShowFeedbackModal} />}
        {tab==="event-goer-dashboard" && authUser && eventGoerProfile && <EventGoerDashboard profile={eventGoerProfile} opps={opps} setShowContactModal={setShowContactModal} setShowFeedbackModal={setShowFeedbackModal} />}
      </div>
      {/* Site Footer */}
      <footer style={{background:'#1a1208',padding:'32px 24px',marginTop:20,textAlign:'center',borderTop:'1px solid rgba(200,168,80,0.15)'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#e8c97a',marginBottom:8}}>South Jersey Vendor Market</div>
        <p style={{fontSize:13,color:'#a89a8a',marginBottom:16}}>Connecting vendors and events across South Jersey</p>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
          <button onClick={()=>setShowContactModal(true)} style={{background:'transparent',color:'#e8c97a',border:'1px solid #e8c97a',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'transparent',color:'#e8c97a',border:'1px solid #e8c97a',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>{setTab('tos');window.scrollTo({top:0});}} style={{background:'transparent',color:'#a89a8a',border:'1px solid rgba(168,154,138,0.3)',borderRadius:6,padding:'8px 20px',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Terms of Service</button>
          <button onClick={()=>{setTab('pricing');window.scrollTo({top:0});}} style={{background:'transparent',color:'#a89a8a',border:'1px solid rgba(168,154,138,0.3)',borderRadius:6,padding:'8px 20px',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Pricing</button>
        </div>
        <div style={{fontSize:11,color:'#5a4a3a'}}>support@southjerseyvendormarket.com</div>
      </footer>
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)} onAuth={()=>{}} defaultEmail={authEmail} setTab={setTab} setShowEventGoerSignup={setShowEventGoerSignup} />}
      {showContactModal && <ContactModal onClose={()=>setShowContactModal(false)} userName={authUser?.user_metadata?.full_name||''} userEmail={authUser?.email||''} />}
      {showFeedbackModal && <FeedbackModal onClose={()=>setShowFeedbackModal(false)} userEmail={authUser?.email||''} />}
      {showEventGoerSignup && <EventGoerSignupModal onClose={()=>setShowEventGoerSignup(false)} defaultEmail={authUser?.email||''} defaultName={vendorProfile?.contact_name||''} onSuccess={()=>{ supabase.from('event_goers').select('*').eq('active',true).then(({data})=>{if(data)setEventGoers(data);}); if(authUser) supabase.from('event_goers').select('*').eq('email',authUser.email).limit(1).single().then(({data})=>{if(data)setEventGoerProfile(data);}); }} />}
    </>
  );
}

export default function App() {
  const respondToken = new URLSearchParams(window.location.search).get('respond');
  if (respondToken) return <VendorResponsePage token={respondToken} />;
  return <AppInner />;
}

// ─── Message Helpers ──────────────────────────────────────────────────────────
const URL_REGEX = /(https?:\/\/[^\s<>"')\]]+)/g;

function MessageContent({ text, isHost }) {
  if (!text) return null;
  const parts = text.split(URL_REGEX);
  return (
    <span>
      {parts.map((part, i) =>
        URL_REGEX.test(part)
          ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
              style={{ color: isHost ? '#c8a84b' : '#1a6b3a', textDecoration:'underline', wordBreak:'break-all' }}>{part}</a>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

function AttachmentBubble({ att, isHost }) {
  const isImage = att.type && att.type.startsWith('image/');
  const fmtSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  };
  const iconForType = (type, name) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.includes('pdf') || name?.endsWith('.pdf')) return '📄';
    if (type?.includes('spreadsheet') || type?.includes('excel') || name?.match(/\.(xlsx?|csv)$/)) return '📊';
    if (type?.includes('word') || type?.includes('document') || name?.match(/\.docx?$/)) return '📝';
    if (type?.includes('zip') || name?.endsWith('.zip')) return '📦';
    return '📎';
  };
  return (
    <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div style={{
        background: isHost ? '#2d2118' : '#fdf9f5',
        border: '1px solid ' + (isHost ? '#3d3020' : '#e8ddd0'),
        borderRadius:8, padding: isImage ? 4 : '8px 12px', overflow:'hidden',
        maxWidth: isImage ? 280 : undefined,
      }}>
        {isImage ? (
          <img src={att.url} alt={att.name}
            style={{ display:'block', maxWidth:'100%', borderRadius:6 }} />
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>{iconForType(att.type, att.name)}</span>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:600, color: isHost ? '#e8c97a' : '#1a1410', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{att.name}</div>
              {att.size && <div style={{ fontSize:11, color:'#a89a8a' }}>{fmtSize(att.size)}</div>}
            </div>
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Messages Page ────────────────────────────────────────────────────────────
function MessagesPage({ conversations, setConversations, activeConvoId, setActiveConvoId, bookingRequests, setBookingRequests }) {
  const [draft, setDraft] = useState('');
  const [senderName, setSenderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages?.length]);

  const addMessage = (text, attachments) => {
    setConversations(convos => convos.map(c => {
      if (c.id !== activeConvoId) return c;
      return {
        ...c,
        messages: [...c.messages, {
          id: Date.now(), from: 'host', senderName, text: text || '',
          ts: new Date().toISOString(),
          ...(attachments && attachments.length > 0 ? { attachments } : {})
        }]
      };
    }));
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    if (!senderName.trim()) { alert('Please enter your name before sending.'); return; }
    addMessage(draft.trim());
    setDraft('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!senderName.trim()) { alert('Please enter your name before sharing files.'); return; }
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversized = files.find(f => f.size > maxSize);
    if (oversized) { alert(`"${oversized.name}" is too large. Maximum file size is 10MB.`); return; }
    setUploading(true);
    const bucket = 'vendor-files';
    const convoId = activeConvoId;
    const attachments = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const path = `messages/${convoId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { console.error('Upload error:', upErr); continue; }
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      attachments.push({ name: file.name, url, type: file.type, size: file.size });
    }
    if (attachments.length > 0) {
      addMessage(draft.trim() || '', attachments);
      setDraft('');
    } else {
      alert('File upload failed. Please try again.');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      // Email host about booking response
      if (req.hostEmail) {
        fetch('/api/send-booking-response', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ hostEmail:req.hostEmail, hostName:req.hostName, vendorName:req.vendorName, vendorCategory:req.vendorCategory, eventName:req.eventName, eventDate:req.eventDate, status, vendorMessage:vendorMsg }),
        }).catch(()=>{});
      }
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

      <div className="msg-layout" style={{ display:'flex', flex:1, overflow:'hidden' }}>

      {/* Sidebar */}
      <div className="msg-sidebar" style={{ width:280, minWidth:220, background:'#1a1410', display:'flex', flexDirection:'column', borderRight:'1px solid #2d2118', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid #2d2118' }}>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#e8c97a', marginBottom:4 }}>Messages</div>
          <div style={{ fontSize:12, color:'#7a6a5a' }}>{conversations.length} conversation{conversations.length!==1?'s':''}</div>
        </div>
        <div className="msg-sidebar-list" style={{ flex:1, overflowY:'auto' }}>
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

          {/* Messages */}
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
                      <MessageContent text={msg.text} isHost={msg.from==='host'} />
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
                        {msg.attachments.map((att, i) => (
                          <AttachmentBubble key={i} att={att} isHost={msg.from==='host'} />
                        ))}
                      </div>
                    )}
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
              <button onClick={()=>fileInputRef.current?.click()} disabled={uploading}
                title="Share a file or document"
                style={{ background:'#f5f0ea', color:'#7a6a5a', border:'1px solid #e0d5c5', borderRadius:8, padding:'0 12px', fontSize:18, cursor:'pointer', flexShrink:0, opacity:uploading?0.5:1 }}>
                {uploading ? '⏳' : '📎'}
              </button>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                style={{ display:'none' }} />
              <textarea value={draft} onChange={e=>setDraft(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }}}
                placeholder="Type a message or share a link... (Enter to send)"
                rows={2}
                style={{ flex:1, border:'1.5px solid #e0d5c5', borderRadius:8, padding:'10px 14px', fontSize:14, fontFamily:'DM Sans,sans-serif', resize:'none', outline:'none', background:'#fdf9f5' }} />
              <button onClick={sendMessage}
                style={{ background:'#1a1410', color:'#e8c97a', border:'none', borderRadius:8, padding:'0 20px', fontSize:20, cursor:'pointer', flexShrink:0 }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize:11, color:'#a89a8a', marginTop:6 }}>
              📎 Share documents, images, or links · 💡 All conversations are protected under the Non-Circumvention Agreement.
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
      <div className="section-title" style={{color:'#e8c97a'}}>Terms of Service</div>
      <p className="section-sub" style={{color:'#b8a888'}}>South Jersey Vendor Market Platform Agreement — effective upon registration</p>

      {TOS_SECTIONS.map(({ title, body }) => (
        <div key={title} style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'#e8c97a', marginBottom:8 }}>{title}</div>
          {body.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize:14, color:'#d4c8a8', lineHeight:1.8, marginBottom:8 }}>{para}</p>
          ))}
        </div>
      ))}

      <div style={{ background:'#1a1410', borderRadius:10, padding:'28px 32px', marginTop:32, textAlign:'center' }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#e8c97a', marginBottom:8 }}>Questions about our Terms?</div>
        <p style={{ color:'#a89a8a', fontSize:14, marginBottom:16 }}>Contact us at support@southjerseyvendormarket.com</p>
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
    <div style={{padding:'24px 24px 48px',maxWidth:1200,margin:'0 auto'}}>
      {/* Top bar */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:20}}>
        <div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:30,color:'#1a1410',lineHeight:1.1}}>My Availability Calendar</div>
          <div style={{fontSize:14,color:'#7a6a5a',marginTop:6}}>Set your available dates so hosts can see when you're open.</div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          {[
            {label:'Available',count:availCount,  bg:'#d4f4e0',color:'#1a6b3a',border:'#b8e8c8'},
            {label:'Booked',   count:bookedCount,  bg:'#fdf4dc',color:'#7a5a10',border:'#ffd966'},
            {label:'Blocked',  count:blockedCount, bg:'#fdecea',color:'#8b1a1a',border:'#f5c6c6'},
          ].map(({label,count,bg,color,border})=>(
            <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:700,color}}>
              {count} {label.toLowerCase()}
            </div>
          ))}
        </div>
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
  if (!hostEvent) {
    return (
      <div style={{ textAlign:'center', padding:'80px 40px', color:'#7a6a5a' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:28, marginBottom:12, color:'#1a1410' }}>Your Event Calendar</div>
        <p style={{ fontSize:16, maxWidth:440, margin:'0 auto', marginBottom:24 }}>Post an event to see your calendar with booking requests and vendor lineup.</p>
        <button onClick={()=>setTab('host')} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 28px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Post Your Event</button>
      </div>
    );
  }
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
              Confirmation <strong>{hostConfirm.ref}</strong> sent to {hostConfirm.email} · <a href={`mailto:${hostConfirm.email}?subject=Your SJVM Event Submission — ${hostConfirm.ref}&body=Hi,%0A%0AYour event has been submitted to South Jersey Vendor Market.%0A%0AConfirmation: ${hostConfirm.ref}%0AEvent: ${hostConfirm.eventName}%0A%0ANext steps:%0A• Browse vendors using the Browse Vendors tab%0A• Send booking requests to vendors you want%0A• Check this calendar for responses%0A%0A— South Jersey Vendor Market%0Asupport@southjerseyvendormarket.com`} style={{color:'#1a6b3a',fontWeight:700}}>Email copy →</a>
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
