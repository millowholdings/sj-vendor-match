import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// Error boundary to catch crashes and show reload button
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('App crash:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1a1208',padding:20}}>
          <div style={{textAlign:'center',maxWidth:400}}>
            <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
            <h2 style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:24,marginBottom:12}}>Something went wrong</h2>
            <p style={{color:'#a89a8a',fontSize:14,marginBottom:24,lineHeight:1.6}}>The page encountered an error. Please refresh to continue.</p>
            <button onClick={()=>window.location.reload()} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'14px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['tiffany@southjerseyvendormarket.com'];

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Food & Beverage", "Jewelry & Accessories", "Art & Prints", "Candles & Home Decor",
  "Clothing & Apparel", "Beauty & Skincare", "Plants & Floral", "Crafts & Handmade",
  "Health & Wellness", "Kids, Baby & Maternity", "Pet Products",
  "Wedding & Events", "Personalized Gifts",
  "Vintage & Thrift", "Spiritual & Metaphysical", "Services & Professionals"
];

const SUBCATEGORIES = {
  "Food & Beverage": ["Breads & Rolls", "Cakes", "Cookies", "Other Desserts", "Custom/Personalized", "Snacks & Jerky", "Sauces & Condiments", "Beverages & Juices", "Wine & Spirits", "Craft Beer & Brewery", "Candy & Chocolates", "Meal Prep & Catering", "Charcuterie", "Honey & Farm Products", "Other"],
  "Jewelry & Accessories": ["Earrings", "Necklaces & Pendants", "Bracelets & Bangles", "Rings", "Hair Accessories", "Bags & Purses", "Permanent", "Charm", "Handmade", "Other"],
  "Art & Prints": ["Illustrations & Drawing", "Paintings", "Digital Prints", "Custom Portraits", "Stickers & Postcards", "Mixed Media", "Other"],
  "Candles & Home Decor": ["Soy Candles", "Wax Melts", "Diffusers & Oils", "Wall Art", "Throw Pillows", "Seasonal Decor", "Other"],
  "Clothing & Apparel": ["T-Shirts & Hoodies", "Dresses & Skirts", "Kids Clothing", "Hats & Beanies", "Activewear", "Custom/Personalized", "Other"],
  "Beauty & Skincare": ["Skincare & Serums", "Body Butters & Lotions", "Lip Care", "Hair Care", "Bath Products", "Makeup & Cosmetics", "Injectibles", "Other"],
  "Plants & Floral": ["Succulents & Cacti", "Tropical Plants", "Floral Arrangements", "Dried Florals", "Seeds & Bulbs", "Terrariums", "Other"],
  "Crafts & Handmade": ["Woodwork", "Ceramics & Pottery", "Knit & Crochet", "Resin Art", "Macrame", "Paper Crafts", "Custom", "Other"],
  "Health & Wellness": ["Supplements & Vitamins", "Essential Oils", "Crystals & Spiritual", "Teas & Herbal", "Fitness Products", "Mental Wellness", "Physical Therapy", "CBD & Hemp", "Natural Remedies & Tinctures", "Aromatherapy", "Other"],
  "Kids, Baby & Maternity": ["Toys & Games", "Clothing", "Nursery Decor", "Books", "Personalized Gifts", "Educational", "Baby Shower Favors", "Maternity Apparel", "Gender Reveal Items", "Milestone Keepsakes", "Other"],
  "Pet Products": ["Treats & Food", "Toys", "Collars & Leashes", "Grooming", "Apparel", "Beds & Accessories", "Other"],
  "Wedding & Events": ["Bridal Accessories", "Wedding Favors", "Bridesmaid Gifts", "Vow Books & Stationery", "Bridal Robes & Apparel", "Wedding Decor", "Custom Veils & Hair Accessories", "Balloon Arrangements", "Table Centerpieces", "Backdrops & Banners", "Custom Signage", "Party Favors", "Themed Decorations", "Photo Booth Props", "Other"],
  "Personalized Gifts": ["Custom Tumblers & Cups", "Engraved Items", "Embroidered Goods", "Monogrammed Gifts", "Photo Gifts", "Name & Word Art", "Wine Charms", "Other"],
  "Vintage & Thrift": ["Vintage Clothing", "Antiques & Collectibles", "Vintage Jewelry", "Upcycled Goods", "Retro Home Decor", "Vinyl & Media", "Other"],
  "Spiritual & Metaphysical": ["Crystals & Gemstones", "Tarot & Oracle Cards", "Sage & Cleansing", "Spiritual Jewelry", "Meditation & Mindfulness", "Altar Supplies", "Other"],
  "Services & Professionals": ["Real Estate", "Insurance & Financial", "Home Repair & Improvement", "Pet Services", "Animal Rescue & Shelter", "Tutoring & Education", "Fitness & Personal Training", "Beauty & Salon Services", "Photography & Video", "Legal & Notary", "Health & Medical", "Cleaning Services", "Nonprofits & Community Orgs", "Other"],
};
// Map old category names to new ones for existing vendor/event data
const CATEGORY_MAP = {
  "Kids & Baby":"Kids, Baby & Maternity", "Baby & Maternity":"Kids, Baby & Maternity",
  "Wedding & Bridal":"Wedding & Events", "Party & Event Decor":"Wedding & Events",
};

const EVENT_TYPES = [
  "Pop-Up & Vendor Market", "Craft & Art Fair", "Farmers & Flea Market",
  "Holiday Market", "Sip & Shop", "Food/Drink Festival",
  "Community Festival", "Fundraiser", "Corporate & Networking", "Private Party", "Other"
];
const REMOVED_EVENT_TYPES = ["Birthday Party","Wedding Reception","Wedding Ceremony","Bridal Shower","Baby Shower","Gender Reveal","Bachelorette Party","Anniversary Celebration","Grand Opening","Block Party","Other"];
const EVENT_TYPE_MAP = {
  "Pop-Up Market":"Pop-Up & Vendor Market","Vendor Market":"Pop-Up & Vendor Market",
  "Craft Fair":"Craft & Art Fair","Art Show":"Craft & Art Fair",
  "Flea Market":"Farmers & Flea Market","Farmers Market":"Farmers & Flea Market",
  "Grand Opening":"Community Festival","Block Party":"Community Festival",
  "Other":"Community Festival",
  "Food Festival":"Food/Drink Festival","Wine & Spirits Festival":"Food/Drink Festival","Tasting Event":"Sip & Shop",
  "Night Market":"Pop-Up & Vendor Market",
  "Networking Event":"Corporate & Networking","Corporate Event":"Corporate & Networking",
  "Girls Night Out":"Private Party",
};

const SERVICE_DURATIONS = ["1 hour","2 hours","3 hours","4 hours","Half day","Full day","Other"];
const SERVICE_CATEGORIES = ["Entertainment","Visual & Media","Kids & Activities","Food & Beverage Services","Wellness & Beauty Services","Decor & Setup","Other Services"];
const SERVICE_SUBCATEGORIES = {
  "Entertainment": ["Solo Acoustic","Acoustic Duo","Full Band","DJ (with MC)","DJ (Music Only)","Cover Band","Jazz Ensemble","Classical/String Quartet","Karaoke Host","Comedian","Magician","Strolling Entertainer","Fire Performer","Other"],
  "Visual & Media": ["Event Photography","Videography","Photo Booth Operator","Portrait Sessions","Drone Photography","Live Painter","Other"],
  "Kids & Activities": ["Face Painter","Balloon Artist","Caricature Artist","Bounce House/Inflatables","Character Performer","Crafts Station","Other"],
  "Food & Beverage Services": ["Mobile Bar/Bartender","Wine Tasting/Sommelier","Craft Beer/Brewery Pour","Food Truck","Catering","Coffee/Espresso Cart","Cotton Candy/Popcorn","Ice Cream Cart","Other"],
  "Wellness & Beauty Services": ["Henna Artist","Airbrush Makeup","Hair Styling","Massage Therapist","Tarot/Palm Reader","Other"],
  "Decor & Setup": ["Event Decorator","Balloon Garland/Arch","Tent/Canopy Rental","Lighting Setup","Sound System Rental","Other"],
  "Other Services": ["Other"],
};
const RADIUS_OPTIONS = [5, 10, 15, 20, 30, 50];

// Zip code lat/lng for South Jersey distance calculation
// Zip to city name mapping for display
const ZIP_CITY = {
  "08002":"Cherry Hill","08003":"Cherry Hill","08004":"Atco","08007":"Barrington","08009":"Berlin",
  "08012":"Blackwood","08021":"Clementon","08026":"Gibbsboro","08029":"Glendora","08030":"Gloucester City",
  "08033":"Haddonfield","08034":"Cherry Hill","08035":"Haddon Heights","08036":"Hainesport","08043":"Voorhees",
  "08045":"Lawnside","08048":"Lumberton","08052":"Maple Shade","08053":"Marlton","08054":"Mount Laurel",
  "08055":"Medford","08057":"Moorestown","08059":"Mount Ephraim","08060":"Mount Holly","08063":"National Park",
  "08065":"Palmyra","08075":"Riverton","08077":"Riverton","08078":"Runnemede","08080":"Sewell",
  "08081":"Sicklerville","08083":"Somerdale","08086":"Thorofare","08088":"Vincentown","08089":"Waterford Works",
  "08090":"Wenonah","08091":"West Berlin","08093":"Westville","08094":"Williamstown","08096":"Woodbury",
  "08097":"Woodbury Heights","08101":"Camden","08102":"Camden","08103":"Camden","08104":"Camden",
  "08105":"Camden","08106":"Audubon","08107":"Oaklyn","08108":"Collingswood","08109":"Merchantville",
  "08110":"Pennsauken","08226":"Ocean City","08232":"Pleasantville","08244":"Somers Point",
  "08401":"Atlantic City","08402":"Margate City","08406":"Ventnor City",
};
function getCityFromZip(zip) { return ZIP_CITY[zip] || null; }

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
// Canonical conversation ID — always the same for any two users regardless of who initiates
function getConvoId(id1, id2, eventId) { return [id1, id2].sort().join('_') + (eventId ? '_evt_' + eventId : ''); }

// ─── Supabase row → app shape converters ─────────────────────────────────────
function dbVendorToApp(v) {
  const m = v.metadata || {};
  return {
    id:                v.id,
    userId:            v.user_id || null,
    name:              v.name,
    category:          CATEGORY_MAP[v.category] || v.category,
    allCategories:     (m.allCategories || [v.category]).map(c => CATEGORY_MAP[c] || c),
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
    vendorType:        m.vendorType     || null,
    serviceCategories: m.serviceCategories || [],
    serviceSubcategories: m.serviceSubcategories || [],
    serviceType:       m.serviceType    || "",
    serviceRateMin:    m.serviceRateMin || "",
    serviceRateMax:    m.serviceRateMax || "",
    serviceRateType:   m.serviceRateType|| "fixed",
    minBookingDuration:m.minBookingDuration || "",
    serviceDescription:m.serviceDescription || "",
    availabilityNotes: m.availabilityNotes || "",
    equipmentNotes:    m.equipmentNotes    || "",
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
    categoriesNeeded: (e.categories_needed || []).map(c => CATEGORY_MAP[c] || c),
    contactName:      e.contact_name      || "",
    contactEmail:     e.contact_email     || "",
    contactPhone:     e.contact_phone     || "",
    fbLink:           e.fb_link           || "",
    deadline:         e.deadline          || "",
    notes:            e.notes             || "",
    vendorNotes:      e.vendor_notes      || "",
    eventGoerNotes:   e.event_goer_notes  || "",
    shareWithEventGoers: e.share_with_event_goers !== false,
    source:           e.source            || "Host Submitted",
    photoUrl:         e.photo_url         || "",
    vendorDiscovery:  e.vendor_discovery  || "both",
    allowDuplicateCategories: e.allow_duplicate_categories !== false,
    allowDuplicateSubcategories: e.allow_duplicate_subcategories !== false,
    status:           e.status            || "approved",
    vendorStatus:     e.vendor_status     || "open",
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
    // If all categories are now selected, auto-select all subcategories
    const allCatsSelected = newCats.length === CATEGORIES.length;
    let merged = kept;
    if (allCatsSelected) {
      const allSubs = newCats.flatMap(c => SUBCATEGORIES[c] || []);
      merged = [...new Set([...kept, ...allSubs])];
    } else {
      // Auto-select subcategories for newly added categories
      const newSubs = addedCats.flatMap(c => SUBCATEGORIES[c] || []);
      merged = [...new Set([...kept, ...newSubs])];
    }
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
      <CheckboxGroup label="Your Categories *" options={CATEGORIES} selected={categories.filter(c => CATEGORIES.includes(c))} onChange={handleCatChange} otherValue={otherCategory||''} onOtherChange={v=>onOtherCategoryChange && onOtherCategoryChange(v)} />
      {categories.filter(c => CATEGORIES.includes(c)).length > 0 && (
        <div className="subcat-block">
          <div style={{ fontSize:12, fontWeight:700, color:'#7a6a5a', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>
            Subcategories — select all that apply
          </div>
          {categories.filter(c => CATEGORIES.includes(c)).map(cat => {
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
          {subcategories.filter(s => categories.filter(c => CATEGORIES.includes(c)).some(c => (SUBCATEGORIES[c]||[]).includes(s))).length > 0 && (
            <div className="selected-tags">
              {subcategories.filter(s => categories.filter(c => CATEGORIES.includes(c)).some(c => (SUBCATEGORIES[c]||[]).includes(s))).map(s => <span key={s} className="sel-tag">{s}</span>)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function PasswordInput({ value, onChange, placeholder, onKeyDown, style }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:'relative'}}>
      <input type={show?'text':'password'} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={{...style, paddingRight:36}} />
      <button type="button" onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:2,color:'#c8a850',fontSize:16,lineHeight:1}}>
        {show ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  );
}

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
  const [formStep, setFormStep] = useState(1);
  const STEPS = [{n:1,label:'Business Info'},{n:2,label:'Categories'},{n:3,label:'Photos & Links'},{n:4,label:'Review & Submit'}];
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
      if (!saved) return DEFAULT_VENDOR_FORM;
      const draft = { ...DEFAULT_VENDOR_FORM, ...JSON.parse(saved) };
      if (draft.categories) draft.categories = [...new Set(draft.categories.map(c => CATEGORY_MAP[c] || c).filter(c => CATEGORIES.includes(c)))];
      if (draft.subcategories) {
        const validSubs = new Set((draft.categories||[]).flatMap(c => SUBCATEGORIES[c] || []));
        draft.subcategories = draft.subcategories.filter(s => validSubs.has(s));
      }
      return draft;
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
  const nextStep = () => setFormStep(s => Math.min(s+1, 4));
  const prevStep = () => setFormStep(s => Math.max(s-1, 1));
  return (
    <div className="form-card">
      {/* Step progress bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:24}}>
        {STEPS.map((s,i) => (
          <div key={s.n} style={{display:'flex',alignItems:'center'}}>
            <div onClick={()=>setFormStep(s.n)} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',minWidth:70}}>
              <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,
                background:formStep===s.n?'#c8a84b':formStep>s.n?'#1a6b3a':'#e8ddd0',
                color:formStep===s.n?'#1a1410':formStep>s.n?'#fff':'#a89a8a'}}>{formStep>s.n?'✓':s.n}</div>
              <div style={{fontSize:10,color:formStep===s.n?'#1a1410':'#a89a8a',fontWeight:formStep===s.n?700:400,marginTop:4}}>{s.label}</div>
            </div>
            {i<STEPS.length-1 && <div style={{width:40,height:2,background:formStep>s.n?'#1a6b3a':'#e8ddd0',margin:'0 4px 16px'}}/>}
          </div>
        ))}
      </div>
      {hasDraft && (
        <div style={{ background:'#fdf4dc', border:'1px solid #ffd966', borderRadius:8, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontSize:14, color:'#7a5a10' }}>📋 <strong>Draft restored</strong> — your previously entered information has been loaded.</div>
          <button onClick={clearDraft} style={{ background:'none', border:'1px solid #c8a84b', color:'#7a5a10', borderRadius:6, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>Clear &amp; Start Over</button>
        </div>
      )}
      {/* ── STEP 1: Business Info ── */}
      {formStep === 1 && (<>
      {!authUser && (
        <>
          <div style={{display:'flex',gap:10,marginBottom:20}}>
            <button onClick={()=>{if(typeof setShowAuthModal==='function')setShowAuthModal(true);}} style={{flex:1,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Log In</button>
            <button onClick={()=>{}} style={{flex:1,background:'#e8c97a',color:'#1a1410',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Create Account</button>
          </div>
          <div className="form-grid" style={{marginBottom:24}}>
            <div className="form-group"><label>Email Address *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            <div className="form-group"><label>Create Password *</label><PasswordInput placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} /></div>
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
        <div className="form-group full"><label>Business Description *</label><textarea placeholder="Tell hosts what makes your business special — what you offer, your style, and what sets you apart." value={form.description} onChange={e=>set('description',e.target.value)} /></div>
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

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Categories →</button>
      </div>
      </>)}

      {/* ── STEP 2: Categories ── */}
      {formStep === 2 && (<>
      <h3 className="form-section-title"><span className="dot" />What Type of Listing Is This?</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:16}}>Choose one per listing. You can create additional listings for other offerings from your dashboard.</p>
      <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <div onClick={()=>set('vendorType',{market:true,service:false})}
          style={{flex:'1 1 220px',padding:'16px 20px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.vendorType.market?'#c8a850':'#e8ddd0'}`,background:form.vendorType.market?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:15,color:'#1a1410',marginBottom:4}}>Market Vendor</div>
          <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.4}}>I sell products at events and pay an event fee</div>
          {form.vendorType.market && <div style={{color:'#c8a850',fontSize:18,marginTop:6}}>&#10003;</div>}
        </div>
        <div onClick={()=>set('vendorType',{market:false,service:true})}
          style={{flex:'1 1 220px',padding:'16px 20px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.vendorType.service?'#c8a850':'#e8ddd0'}`,background:form.vendorType.service?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:15,color:'#1a1410',marginBottom:4}}>Event Service Provider</div>
          <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.4}}>I provide a service and get paid by the host</div>
          {form.vendorType.service && <div style={{color:'#c8a850',fontSize:18,marginTop:6}}>&#10003;</div>}
        </div>
      </div>
      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',marginBottom:24,fontSize:13,color:'#7a6a5a',lineHeight:1.5}}>
        <strong>Do both?</strong> No problem — create this listing first, then add another from your dashboard. Each listing gets its own categories, photos, and pricing so hosts can find exactly what they need.
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
            <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:4}}>Your Rate & Availability</div>
            <div style={{fontSize:11,color:'#a89a8a',marginBottom:12}}>Your rate is shared with hosts for reference — all payments are handled directly between you and the host.</div>
            <div className="form-grid" style={{gap:10}}>
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
            <div className="form-group"><label>Max Event Fee You'll Pay</label>
              <select value={form.priceMax} onChange={e=>set('priceMax',+e.target.value)}>
                <option value={0}>Free / No fee</option>
                <option value={25}>$25/day</option><option value={50}>$50/day</option><option value={75}>$75/day</option>
                <option value={100}>$100/day</option><option value={125}>$125/day</option><option value={150}>$150/day</option>
                <option value={200}>$200/day</option><option value={250}>$250/day</option><option value={300}>$300/day</option>
                <option value={500}>$500/day</option><option value={1000}>$1,000/day</option>
              </select>
              <div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Event fees are paid directly to the event host — not through this platform.</div>
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

      {/* Insurance & Logistics for service providers who aren't market vendors */}
      {form.vendorType.service && !form.vendorType.market && (
        <>
          <hr className="form-divider" />
          <h3 className="form-section-title"><span className="dot" />Insurance & Logistics</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Do You Carry Liability Insurance?</label>
              <select value={form.insurance?'yes':'no'} onChange={e=>set('insurance',e.target.value==='yes')}>
                <option value="no">No — I do not carry liability insurance</option>
                <option value="yes">Yes — I have a certificate of insurance (COI)</option>
              </select>
              <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}>Many events require insured service providers. This shows as a badge on your profile.</div>
            </div>
            <div className="form-group"><label>Setup Time Needed</label>
              <select value={form.setupTime} onChange={e=>set('setupTime',+e.target.value)}>
                <option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option><option value={120}>2 hours</option>
              </select>
            </div>
            <div className="form-group"><label>Space Needed</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
            <div className="form-group"><label>Need Electrical Access?</label><select value={form.needsElectric?'yes':'no'} onChange={e=>set('needsElectric',e.target.value==='yes')}><option value="no">No</option><option value="yes">Yes</option></select></div>
          </div>
        </>
      )}

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={prevStep} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back</button>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Photos & Links →</button>
      </div>
      </>)}

      {/* ── STEP 3: Photos & Links ── */}
      {formStep === 3 && (<>
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

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={prevStep} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back</button>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Review & Submit →</button>
      </div>
      </>)}

      {/* ── STEP 4: Review & Submit ── */}
      {formStep === 4 && (<>
      <h3 className="form-section-title"><span className="dot" />Review & Submit</h3>
      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:16,marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px',fontSize:13}}>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Business:</span> {form.businessName || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Contact:</span> {form.ownerName || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Email:</span> {form.email || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Location:</span> Zip {form.homeZip || '—'} ({form.radius}mi)</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Type:</span> {form.vendorType?.service?'Service Provider':'Market Vendor'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Categories:</span> {[...(form.categories||[]),...(form.serviceCategories||[])].join(', ') || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Photos:</span> {photoFiles.length} uploaded</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Insurance:</span> {form.insurance ? 'Yes' : 'No'}</div>
        </div>
        <button onClick={()=>setFormStep(1)} style={{marginTop:10,background:'none',border:'none',color:'#c8a84b',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Edit any section</button>
      </div>

      {showTos && <TosModal onClose={()=>setShowTos(false)} />}
      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that contacting or booking hosts discovered through this platform outside of South Jersey Vendor Market within 12 months is prohibited and subject to a finder's fee.</span>
        </label>
        <button className="btn-submit" disabled={submitting} onClick={async ()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} localStorage.removeItem(VENDOR_DRAFT_KEY); localStorage.removeItem(VENDOR_DRAFT_SUBS_KEY); setSubmitting(true); await onSubmit(form, { photoFiles, coiFile, lookbookFile }); setSubmitting(false); }} style={{ opacity: tosAgreed&&!submitting?1:0.5 }}>{submitting ? 'Submitting…' : 'Submit Vendor Profile →'}</button>
        <p style={{ fontSize:13, color:'#a89a8a', marginTop:12 }}>Your profile will be reviewed within 24 hours. Free during beta — <strong style={{ color:'#e8c97a' }}>$15/month</strong> once billing activates.</p>
        <button onClick={prevStep} style={{marginTop:10,background:'none',border:'1px solid #e0d5c5',color:'#7a6a5a',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back to Photos</button>
      </div>
      </>)}
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
  electricAvailable:true, tableProvided:false, tableSize:'6ft', allowDuplicateCategories:true, allowDuplicateSubcategories:true,
  applyByDate:'', eventLink:'',
  budget:'No event fee', isTicketedEvent:false, ticketPrice:'', otherEventType:'', otherVendorCategory:'', notes:'', vendorNotes:'', eventGoerNotes:'', shareWithEventGoers:true, fullServiceBooking:false, servicesNeeded:[], needsMarketVendors:true, needsServiceProviders:false,
  vendorDiscovery:'both', password:''
};

function HostForm({ onSubmit, setTab, authUser, setShowAuthModal }) {
  const [tosAgreed, setTosAgreed] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [hostSubmitting, setHostSubmitting] = useState(false);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [formStep, setFormStep] = useState(1);
  const HOST_STEPS = [{n:1,label:'Event Details'},{n:2,label:'Vendors & Services'},{n:3,label:'Venue & Logistics'},{n:4,label:'Review & Submit'}];
  const nextStep = () => setFormStep(s => Math.min(s+1, 4));
  const prevStep = () => setFormStep(s => Math.max(s-1, 1));
  const [hasDraft] = useState(() => !!localStorage.getItem(HOST_DRAFT_KEY));
  const [otherSubcategories, setOtherSubcategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HOST_DRAFT_SUBS_KEY) || '{}'); }
    catch { return {}; }
  });
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(HOST_DRAFT_KEY);
      if (!saved) return DEFAULT_HOST_FORM;
      const draft = { ...DEFAULT_HOST_FORM, ...JSON.parse(saved) };
      // Migrate old category names and clean stale subcategories in draft
      if (draft.vendorCategories) draft.vendorCategories = [...new Set(draft.vendorCategories.map(c => CATEGORY_MAP[c] || c).filter(c => CATEGORIES.includes(c)))];
      if (draft.vendorSubcategories) {
        const validSubs = new Set(draft.vendorCategories.flatMap(c => SUBCATEGORIES[c] || []));
        draft.vendorSubcategories = draft.vendorSubcategories.filter(s => validSubs.has(s));
      }
      return draft;
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
      {/* Step progress bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:24}}>
        {HOST_STEPS.map((s,i) => (
          <div key={s.n} style={{display:'flex',alignItems:'center'}}>
            <div onClick={()=>setFormStep(s.n)} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',minWidth:70}}>
              <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,
                background:formStep===s.n?'#c8a84b':formStep>s.n?'#1a6b3a':'#e8ddd0',
                color:formStep===s.n?'#1a1410':formStep>s.n?'#fff':'#a89a8a'}}>{formStep>s.n?'✓':s.n}</div>
              <div style={{fontSize:10,color:formStep===s.n?'#1a1410':'#a89a8a',fontWeight:formStep===s.n?700:400,marginTop:4}}>{s.label}</div>
            </div>
            {i<HOST_STEPS.length-1 && <div style={{width:40,height:2,background:formStep>s.n?'#1a6b3a':'#e8ddd0',margin:'0 4px 16px'}}/>}
          </div>
        ))}
      </div>
      {hasDraft && (
        <div style={{ background:'#fdf4dc', border:'1px solid #ffd966', borderRadius:8, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontSize:14, color:'#7a5a10' }}>📋 <strong>Draft restored</strong> — your previously entered information has been loaded.</div>
          <button onClick={clearDraft} style={{ background:'none', border:'1px solid #c8a84b', color:'#7a5a10', borderRadius:6, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>Clear &amp; Start Over</button>
        </div>
      )}

      {/* ── STEP 1: Event Details ── */}
      {formStep === 1 && (<>
      {!authUser && (
        <>
          <div style={{display:'flex',gap:10,marginBottom:20}}>
            <button onClick={()=>{if(setShowAuthModal)setShowAuthModal(true);}} style={{flex:1,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Log In</button>
            <button onClick={()=>{}} style={{flex:1,background:'#e8c97a',color:'#1a1410',border:'none',borderRadius:8,padding:'14px 0',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Create Account</button>
          </div>
          <div className="form-grid" style={{marginBottom:24}}>
            <div className="form-group"><label>Email *</label><input type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            <div className="form-group"><label>Create Password *</label><PasswordInput placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} /></div>
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
      <h2 className="form-section-title"><span className="dot" />Event Details</h2>
      <p style={{ color:'#7a6a5a', marginBottom:32, fontSize:15 }}>
        Tell us about your event and we'll match you with the perfect South Jersey vendors.
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
        <div className="form-group full">
          <label>Recurring Event?</label>
          <select value={form.isRecurring?'yes':'no'} onChange={e=>set('isRecurring',e.target.value==='yes')}>
            <option value="no">No — one-time event</option>
            <option value="yes">Yes — this event repeats</option>
          </select>
        </div>
        {form.isRecurring
          ? <div className="form-group"><label>Start Date *</label><input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>set('date',e.target.value)} /></div>
          : <div className="form-group"><label>Event Date *</label><input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>set('date',e.target.value)} /></div>
        }
        <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)} /></div>
        <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={e=>set('endTime',e.target.value)} /></div>
        <div className="form-group full"><label>Event Website or Facebook Page <span style={{fontSize:11,color:'#a89a8a',fontWeight:400}}>(optional)</span></label><input type="url" value={form.eventLink} onChange={e=>set('eventLink',e.target.value)} placeholder="https://facebook.com/events/... or your event website" /><div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Add a link to your event page if you have one</div></div>
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

              <p style={{fontSize:12,color:'#a89a8a',margin:'8px 0 0',lineHeight:1.5,gridColumn:'1/-1'}}>Once your recurring series is created, you can cancel individual dates from your dashboard without cancelling the entire series.</p>
            </div>
          </div>
        )}
      </div>

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Vendors & Services →</button>
      </div>
      </>)}

      {/* ── STEP 2: Vendors & Services ── */}
      {formStep === 2 && (<>
      <h3 className="form-section-title"><span className="dot" />What Type of Vendors Do You Need?</h3>
      <p style={{color:'#7a6a5a',fontSize:14,marginBottom:16}}>Select all that apply for your event.</p>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div onClick={()=>set('needsMarketVendors',!form.needsMarketVendors)}
          style={{flex:'1 1 220px',padding:'14px 18px',borderRadius:10,cursor:'pointer',border:`2px solid ${form.needsMarketVendors?'#c8a850':'#e8ddd0'}`,background:form.needsMarketVendors?'#fdf9f0':'#fff',transition:'all 0.15s'}}>
          <div style={{fontWeight:700,fontSize:14,color:'#1a1410',marginBottom:2}}>Market Vendors</div>
          <div style={{fontSize:12,color:'#7a6a5a'}}>Product sellers who pay event fees</div>
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
            <div className="form-group"><label>Service Category</label>
              <select value={svc.type} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],type:e.target.value,subType:''};set('servicesNeeded',n);}}>
                <option value="">Select category...</option>
                {SERVICE_CATEGORIES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            {svc.type && SERVICE_SUBCATEGORIES[svc.type] && (
              <div className="form-group"><label>Specific Service</label>
                <select value={svc.subType||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],subType:e.target.value};set('servicesNeeded',n);}}>
                  <option value="">Any / All</option>
                  {SERVICE_SUBCATEGORIES[svc.type].map(s=><option key={s}>{s}</option>)}
                </select>
                {svc.subType==='Other' && <input placeholder="Describe the service you need..." value={svc.otherType||''} onChange={e=>{const n=[...form.servicesNeeded];n[idx]={...n[idx],otherType:e.target.value};set('servicesNeeded',n);}} style={{marginTop:6,width:'100%',border:'1.5px solid #c8a84b',borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fdf9f5'}} />}
              </div>
            )}
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
      <button onClick={()=>set('servicesNeeded',[...form.servicesNeeded,{type:'',subType:'',duration:'2 hours',budgetType:'open',budgetAmount:'',budgetMin:'',budgetMax:'',notes:''}])}
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
      {(form.vendorDiscovery === 'apply' || form.vendorDiscovery === 'both') && (
        <div className="form-group" style={{marginBottom:16}}>
          <label>Vendor Application Deadline</label>
          <input type="date" value={form.applyByDate} max={form.date || undefined} onChange={e=>set('applyByDate',e.target.value)} />
          <div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Last day vendors can apply to your event</div>
        </div>
      )}

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={prevStep} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back</button>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Venue & Logistics →</button>
      </div>
      </>)}

      {/* ── STEP 3: Venue & Logistics ── */}
      {formStep === 3 && (<>
      <h2 className="form-section-title"><span className="dot" />Venue & Logistics</h2>
      <div className="form-grid">
        <div className="form-group"><label>Expected Attendance</label><select value={form.expectedAttendance} onChange={e=>set('expectedAttendance',e.target.value)}><option value="">Estimate...</option><option>Under 50</option><option>50–150</option><option>150–300</option><option>300–500</option><option>500+</option></select></div>
        <div className="form-group"><label>Indoor or Outdoor?</label><select value={form.indoorOutdoor} onChange={e=>set('indoorOutdoor',e.target.value)}><option value="outdoor">Outdoor</option><option value="indoor">Indoor</option><option value="both">Mixed</option></select></div>
        <div className="form-group"><label>Number of Vendor Spots</label><input type="number" min={1} max={200} value={form.vendorCount} onChange={e=>set('vendorCount',Math.max(1,+e.target.value||1))} placeholder="e.g. 10" /></div>
        <div className="form-group"><label>Electricity Available?</label><select value={form.electricAvailable?'yes':'no'} onChange={e=>set('electricAvailable',e.target.value==='yes')}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div className="form-group"><label>Tables Provided by Host?</label><select value={form.tableProvided?'yes':'no'} onChange={e=>set('tableProvided',e.target.value==='yes')}><option value="no">No — vendors bring their own</option><option value="yes">Yes — we provide tables</option></select></div>
        <div className="form-group"><label>{form.tableProvided ? 'Table Size Provided' : 'Space per Vendor'}</label><select value={form.tableSize} onChange={e=>set('tableSize',e.target.value)}><option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option></select></div>
        <div className="form-group">
          <label>Allow Multiple Vendors with Similar Products?</label>
          <select value={form.allowDuplicateCategories?'yes':'no'} onChange={e=>{set('allowDuplicateCategories',e.target.value==='yes');set('allowDuplicateSubcategories',e.target.value==='yes');}}>
            <option value="yes">Yes — similar vendors are OK</option>
            <option value="no">No — I want variety only</option>
          </select>
          <div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>e.g. allowing two jewelry vendors or two candle makers at the same event</div>
        </div>
        <div className="form-group"><label>Do You Charge Vendors an Event Fee?</label><select value={form.budget==='No event fee'?'no':'yes'} onChange={e=>{if(e.target.value==='no')set('budget','No event fee');else set('budget','');}}><option value="no">No event fee</option><option value="yes">Yes — event fee required</option></select><div style={{fontSize:11,color:'#a89a8a',marginTop:4}}>Event fees are collected directly between you and the vendor — not through this platform.</div></div>
        {form.budget !== 'No event fee' && (
          <div className="form-group"><label>Event Fee Amount</label><input value={form.budget==='No event fee'?'':form.budget} onChange={e=>set('budget',e.target.value)} placeholder="e.g. $50 per vendor, $75/table" /></div>
        )}
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
      <h3 className="form-section-title"><span className="dot" />Event Visibility</h3>
      <div className="form-group" style={{marginBottom:16}}>
        <label>Share this event with event guests?</label>
        <div style={{display:'flex',gap:10}}>
          <button type="button" onClick={()=>set('shareWithEventGoers',true)} style={{flex:1,padding:'10px',borderRadius:8,border:form.shareWithEventGoers?'2px solid #c8a84b':'2px solid #e8ddd0',background:form.shareWithEventGoers?'#fdf9f0':'#fff',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'DM Sans,sans-serif',color:'#1a1410'}}>Yes</button>
          <button type="button" onClick={()=>set('shareWithEventGoers',false)} style={{flex:1,padding:'10px',borderRadius:8,border:!form.shareWithEventGoers?'2px solid #c8a84b':'2px solid #e8ddd0',background:!form.shareWithEventGoers?'#fdf9f0':'#fff',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'DM Sans,sans-serif',color:'#1a1410'}}>No</button>
        </div>
        <div style={{fontSize:12,color:'#7a6a5a',marginTop:6}}>{form.shareWithEventGoers ? 'Your event will appear on the public Upcoming Events page for guests to discover.' : 'Your event will only be visible to vendors — it won\'t appear on the public Upcoming Events page.'}</div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot" />Notes</h3>
      <div className="form-group" style={{ marginTop:4 }}>
        <label>Notes for Vendors</label>
        <textarea placeholder="Load-in times, setup details, booth requirements, what vendors should know..." value={form.vendorNotes} onChange={e=>set('vendorNotes',e.target.value)} />
      </div>
      {form.shareWithEventGoers && (
        <div className="form-group" style={{ marginTop:12 }}>
          <label>Notes for Event Guests</label>
          <textarea placeholder="Parking info, what to expect, food options, bring a lawn chair, rain-or-shine policy..." value={form.eventGoerNotes} onChange={e=>set('eventGoerNotes',e.target.value)} />
        </div>
      )}

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

      <div style={{display:'flex',gap:10,marginTop:20}}>
        <button onClick={prevStep} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back</button>
        <button onClick={nextStep} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 32px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Next: Review & Submit →</button>
      </div>
      </>)}

      {/* ── STEP 4: Review & Submit ── */}
      {formStep === 4 && (<>
      <h3 className="form-section-title"><span className="dot" />Review & Submit</h3>
      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:16,marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px',fontSize:13}}>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Event:</span> {form.eventName || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Type:</span> {form.eventType || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Contact:</span> {form.contactName || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Email:</span> {form.email || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Date:</span> {form.date ? fmtDate(form.date) : '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Location:</span> Zip {form.eventZip || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Time:</span> {form.startTime ? fmtTime(form.startTime) : '—'}{form.endTime ? ' – '+fmtTime(form.endTime) : ''}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Attendance:</span> {form.expectedAttendance || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Vendor Spots:</span> {form.vendorCount}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Event Fee:</span> {form.budget || 'No event fee'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Vendors:</span> {[form.needsMarketVendors&&'Market',form.needsServiceProviders&&'Service'].filter(Boolean).join(' + ') || '—'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Categories:</span> {form.vendorCategories.length > 0 ? form.vendorCategories.join(', ') : '—'}</div>
          {form.servicesNeeded.length > 0 && <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontWeight:600}}>Services:</span> {form.servicesNeeded.map(s=>s.type||'TBD').join(', ')}</div>}
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Discovery:</span> {form.vendorDiscovery==='both'?'Browse + Apply':form.vendorDiscovery==='browse'?'Browse & Invite':form.vendorDiscovery==='apply'?'Vendor Applications':'—'}</div>
          {form.isRecurring && <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontWeight:600}}>Recurring:</span> {form.recurrenceFrequency==='daily'?'Daily':form.recurrenceFrequency==='weekly'?`Every ${form.recurrenceDay}`:form.recurrenceFrequency==='biweekly'?`Every other ${form.recurrenceDay}`:form.recurrenceFrequency==='monthly'?'Monthly':form.recurrenceFrequency==='custom'?`Every ${form.recurrenceWeekInterval} weeks`:''}{form.recurrenceEndType==='never'?' · Ongoing':form.recurrenceEndType==='after'?` · ${form.recurrenceCount} times`:''}</div>}
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Visible to Guests:</span> {form.shareWithEventGoers ? 'Yes' : 'No — vendors only'}</div>
          <div><span style={{color:'#a89a8a',fontWeight:600}}>Photos:</span> {eventPhotos.length} uploaded</div>
          {form.vendorNotes && <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontWeight:600}}>Vendor Notes:</span> {form.vendorNotes.length > 80 ? form.vendorNotes.slice(0,80)+'...' : form.vendorNotes}</div>}
          {form.eventGoerNotes && <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontWeight:600}}>Guest Notes:</span> {form.eventGoerNotes.length > 80 ? form.eventGoerNotes.slice(0,80)+'...' : form.eventGoerNotes}</div>}
        </div>
        <button onClick={()=>setFormStep(1)} style={{marginTop:10,background:'none',border:'none',color:'#c8a84b',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Edit any section</button>
      </div>

      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'14px 18px',marginBottom:20,fontSize:13,color:'#7a6a5a',lineHeight:1.6}}>
        <strong style={{color:'#1a1410'}}>Your responsibility as a host:</strong> South Jersey Vendor Market connects you with vendors — but all vetting, contracts, and payments are between you and the vendor. Before confirming any vendor, we recommend you verify their insurance, licenses, and any permits required by your venue. You are responsible for collecting event fees, signing agreements, and confirming all details directly with each vendor.
      </div>
      <div className="form-submit">
        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', marginBottom:16, textAlign:'left', textTransform:'none', letterSpacing:0, fontWeight:400, fontSize:14, color:'#4a3a28' }}>
          <input type="checkbox" checked={tosAgreed} onChange={e=>setTosAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:2, flexShrink:0, display:'block' }} />
          <span>I agree to the <button type="button" onClick={()=>setShowTos(true)} style={{ background:'none', border:'none', color:'#c8a84b', fontWeight:600, cursor:'pointer', textDecoration:'underline', padding:0, fontSize:14, fontFamily:'DM Sans, sans-serif' }}>South Jersey Vendor Market Terms of Service &amp; Non-Circumvention Agreement</button>. I understand that vendors discovered through this platform may not be contacted or booked outside of South Jersey Vendor Market within 12 months without a finder's fee.</span>
        </label>
        {showTos && <TosModal onClose={()=>setShowTos(false)} />}
        <button className="btn-submit" disabled={hostSubmitting} onClick={async()=>{ if(!tosAgreed){alert("Please agree to the Terms of Service to continue.");return;} setHostSubmitting(true); localStorage.removeItem(HOST_DRAFT_KEY); localStorage.removeItem(HOST_DRAFT_SUBS_KEY); await onSubmit(form, { eventPhotos }); setHostSubmitting(false); }} style={{ opacity: tosAgreed&&!hostSubmitting?1:0.5 }}>{hostSubmitting ? 'Submitting…' : 'Find My Vendors →'}</button>
        <button onClick={prevStep} style={{marginTop:10,background:'none',border:'1px solid #e0d5c5',color:'#7a6a5a',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>← Back to Logistics</button>
      </div>
      </>)}
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
  const allTypes = EVENT_TYPES.filter(t=>t!=='Other'&&t!=='Private Party');
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
    }).catch(e=>console.error('API call failed:',e));
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
function AuthModal({ onClose, onAuth, defaultEmail, setTab, setShowEventGoerSignup, defaultMode, defaultRole }) {
  const [mode, setMode] = useState(defaultMode || 'login');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [roles, setRoles] = useState({ vendor: defaultRole==='vendor', host: defaultRole==='host', eventGoer: defaultRole==='eventGoer' });

  const toggleRole = (role) => setRoles(r => ({ ...r, [role]: !r[role] }));

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (mode === 'signup' && !roles.vendor && !roles.host && !roles.eventGoer) { setError('Please select at least one role.'); return; }
    setLoading(true); setError('');
    if (mode === 'signup') {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
      // Save roles for post-login routing
      localStorage.setItem('sjvm_pending_roles', JSON.stringify(roles));
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setError(signInErr.message); setLoading(false); return; }
    }
    setLoading(false);
    if (onAuth) onAuth();
    onClose();
    // Route based on roles after signup
    if (mode === 'signup' && setTab) {
      if (roles.vendor) setTab('vendor');
      else if (roles.host) setTab('host');
      else if (roles.eventGoer && setShowEventGoerSignup) setShowEventGoerSignup(true);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://southjerseyvendormarket.com',
    });
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
            {mode==='login' ? 'Welcome Back' : 'Welcome to South Jersey Vendor Market!'}
          </div>
          <div style={{fontSize:13,color:'#a89a8a',marginTop:4}}>{mode==='login' ? 'South Jersey Vendor Market' : 'Create your free account — select all that apply'}</div>
        </div>
        <div style={{padding:'24px 28px'}}>
          {resetSent ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:28,marginBottom:8}}>📧</div>
              <div style={{fontSize:15,fontWeight:600,color:'#1a6b3a',marginBottom:8}}>Check your email</div>
              <div style={{fontSize:13,color:'#7a6a5a'}}>We sent a password reset link to {email}</div>
              <div style={{fontSize:12,color:'#a89a8a',marginTop:6}}>Check your spam folder if you don't see it. Link expires in 24 hours.</div>
              <button onClick={onClose} style={{marginTop:16,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
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
                  <div style={{fontSize:11,color:'#a89a8a',marginTop:8,textAlign:'center'}}>You can always add more roles later from your dashboard.</div>
                </div>
              )}
              <div className="form-group" style={{marginBottom:12}}>
                <label>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                  onKeyDown={e=>{if(e.key==='Enter')handleSubmit();}} />
              </div>
              <div className="form-group" style={{marginBottom:16}}>
                <label>Password</label>
                <PasswordInput value={password} onChange={e=>setPassword(e.target.value)}
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

// ─── Dashboard Mini-Calendars ─────────────────────────────────────────────────
function DashboardMiniCal({ dates, onDateClick, label }) {
  const today = new Date();
  const [mo, setMo] = useState(today.getMonth());
  const [yr, setYr] = useState(today.getFullYear());
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const first = new Date(yr, mo, 1).getDay();
  const dim = new Date(yr, mo+1, 0).getDate();
  const ds = (d) => `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayStr = today.toISOString().split('T')[0];
  const prev = () => { if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1); };
  const next = () => { if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1); };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <button onClick={prev} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:16,fontWeight:700}}>‹</button>
        <div style={{fontSize:13,fontWeight:700,color:'#e8c97a'}}>{MONTHS[mo]} {yr}</div>
        <button onClick={next} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:16,fontWeight:700}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,textAlign:'center'}}>
        {DAYS.map(d=><div key={d} style={{fontSize:9,color:'#a89a8a',fontWeight:600,padding:2}}>{d}</div>)}
        {Array(first).fill(null).map((_,i)=><div key={'e'+i}/>)}
        {Array(dim).fill(null).map((_,i)=>{
          const d=i+1, s=ds(d), info=dates[s];
          const isToday=s===todayStr;
          const bg = info?.type==='accepted'?'#1a6b3a':info?.type==='pending'?'#c8a84b':info?.type==='event'?'#c8a84b':'transparent';
          const color = info?'#fff':(isToday?'#c8a84b':'#7a6a5a');
          return (
            <div key={d} onClick={()=>info&&onDateClick&&onDateClick(s,info)}
              style={{fontSize:11,fontWeight:isToday?800:500,color,background:bg,borderRadius:4,padding:'3px 0',
                cursor:info?'pointer':'default',border:isToday&&!info?'1px solid #c8a84b':'1px solid transparent',
                lineHeight:'18px',minHeight:20}}>
              {d}
            </div>
          );
        })}
      </div>
      {label && <div style={{fontSize:10,color:'#a89a8a',textAlign:'center',marginTop:6}}>{label}</div>}
    </div>
  );
}

function UnifiedDashboardCalendar({ authUser, vendorProfile, userEvents, setTab }) {
  const [hostEvents, setHostEvents] = useState(userEvents || []);
  const [vendorBookings, setVendorBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      // Fetch host events if not passed
      if (!userEvents || userEvents.length === 0) {
        const { data } = await supabase.from('events').select('*')
          .or(`user_id.eq.${authUser.id},contact_email.ilike.${authUser.email}`)
          .order('date',{ascending:true});
        if (mounted && data) setHostEvents(data);
      }
      // Fetch vendor bookings
      if (vendorProfile) {
        let allReqs = [];
        if (vendorProfile.id) { const { data } = await supabase.from('booking_requests').select('*').eq('vendor_id', vendorProfile.id); if (data) allReqs = data; }
        if (allReqs.length === 0 && vendorProfile.contact_email) { const { data } = await supabase.from('booking_requests').select('*').ilike('host_email', vendorProfile.contact_email); if (data) allReqs = data; }
        if (allReqs.length === 0 && vendorProfile.name) { const { data } = await supabase.from('booking_requests').select('*').ilike('vendor_name', vendorProfile.name); if (data) allReqs = data; }
        const seen = new Set(); allReqs = allReqs.filter(r => { if(seen.has(r.id)) return false; seen.add(r.id); return true; });
        if (mounted) setVendorBookings(allReqs);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [authUser, vendorProfile, userEvents]);

  const todayStr = new Date().toISOString().split('T')[0];
  const fmtD = (d) => d ? new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';

  // Build unified dates map for DashboardMiniCal
  const calDates = {};
  hostEvents.forEach(e => { if (e.date) calDates[e.date] = { type: 'event' }; });
  vendorBookings.forEach(b => {
    if (b.event_date) {
      if (b.status === 'accepted') calDates[b.event_date] = { type: 'accepted' };
      else if (b.status === 'pending' && !calDates[b.event_date]) calDates[b.event_date] = { type: 'pending' };
    }
  });

  const confirmed = vendorBookings.filter(b => b.status==='accepted' && (b.event_date||'')>=todayStr).sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||''));
  const pending = vendorBookings.filter(b => b.status==='pending' && (b.event_date||'')>=todayStr).sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||''));
  const upcomingEvents = hostEvents.filter(e => (e.date||'')>=todayStr).sort((a,b)=>(a.date||'').localeCompare(b.date||''));

  const hasData = hostEvents.length > 0 || vendorBookings.length > 0;

  return (
    <div style={{marginBottom:24}}>
      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>My Calendar</h3>
      {loading ? <div style={{color:'#a89a8a',padding:16}}>Loading...</div> : !hasData ? (
        <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'20px',textAlign:'center'}}>
          <div style={{fontSize:13,color:'#7a6a5a'}}>No events or bookings yet.</div>
        </div>
      ) : (
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          {/* Mini calendar */}
          <div style={{flex:'0 0 220px',background:'#1a1410',borderRadius:10,padding:16}}>
            <DashboardMiniCal dates={calDates} onDateClick={(s)=>setExpanded(expanded===s?null:s)} />
            <div style={{display:'flex',gap:6,justifyContent:'center',marginTop:8,flexWrap:'wrap'}}>
              {hostEvents.length > 0 && <div style={{display:'flex',alignItems:'center',gap:3,fontSize:8,color:'#a89a8a'}}><div style={{width:7,height:7,borderRadius:2,background:'#c8a84b'}}/> Events</div>}
              {confirmed.length > 0 && <div style={{display:'flex',alignItems:'center',gap:3,fontSize:8,color:'#a89a8a'}}><div style={{width:7,height:7,borderRadius:2,background:'#1a6b3a'}}/> Confirmed</div>}
              {pending.length > 0 && <div style={{display:'flex',alignItems:'center',gap:3,fontSize:8,color:'#a89a8a'}}><div style={{width:7,height:7,borderRadius:2,background:'#c8a84b'}}/> Pending</div>}
            </div>
            <button onClick={()=>setTab('my-calendar')} style={{display:'block',width:'100%',background:'none',border:'1px solid #c8a84b',color:'#c8a84b',borderRadius:6,padding:'6px',fontSize:11,fontWeight:600,cursor:'pointer',marginTop:10,fontFamily:'DM Sans,sans-serif'}}>Full Calendar →</button>
          </div>
          {/* Upcoming list */}
          <div style={{flex:1,minWidth:280}}>
            {upcomingEvents.length > 0 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:'#7a5a10',marginBottom:6}}>My Events (Host)</div>
                {upcomingEvents.slice(0,4).map(e => (
                  <div key={e.id} style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'8px 12px',marginBottom:4}}>
                    <div style={{fontWeight:600,fontSize:12,color:'#1a1410'}}>{e.event_name}</div>
                    <div style={{fontSize:10,color:'#7a5a10'}}>{fmtD(e.date)} · {e.event_type} · {e.status==='approved'?'Live':e.status}</div>
                  </div>
                ))}
              </div>
            )}
            {confirmed.length > 0 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:'#1a6b3a',marginBottom:6}}>Confirmed Bookings</div>
                {confirmed.slice(0,4).map(b => (
                  <div key={b.id} onClick={()=>setExpanded(expanded===b.id?null:b.id)} style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:8,padding:'8px 12px',marginBottom:4,cursor:'pointer'}}>
                    <div style={{fontWeight:600,fontSize:12,color:'#1a1410'}}>{b.event_name||'Event'}</div>
                    <div style={{fontSize:10,color:'#2d7a50'}}>{fmtD(b.event_date)} · Zip {b.event_zip||'—'}</div>
                    {expanded===b.id && <div style={{marginTop:4,fontSize:10,color:'#1a6b3a',borderTop:'1px solid #b8e8c8',paddingTop:4}}>Host: {b.host_name||'—'}{b.host_email?` · ${b.host_email}`:''}</div>}
                  </div>
                ))}
              </div>
            )}
            {pending.length > 0 && (
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#7a5a10',marginBottom:6}}>Pending Applications</div>
                {pending.slice(0,4).map(b => (
                  <div key={b.id} style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'8px 12px',marginBottom:4}}>
                    <div style={{fontWeight:600,fontSize:12,color:'#1a1410'}}>{b.event_name||'Event'}</div>
                    <div style={{fontSize:10,color:'#7a5a10'}}>{fmtD(b.event_date)} · Awaiting response</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────
function VendorDashboard({ user, vendorProfile, allVendorProfiles, bookingRequests, setTab, setShowContactModal, setShowFeedbackModal, setVendorProfile, conversations, setConversations, setActiveConvoId, unreadCount, opps }) {
  const [requests, setRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSubPanel, setShowSubPanel] = useState(false);
  const profilePanelRef = React.useRef(null);
  const subPanelRef = React.useRef(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editPhotos, setEditPhotos] = useState([]);       // new File objects to add
  const [existingPhotos, setExistingPhotos] = useState([]); // existing URLs
  const [newCoi, setNewCoi] = useState(null);
  const [newLookbook, setNewLookbook] = useState(null);
  const m = vendorProfile?.metadata || {};
  const initEditForm = () => ({
    name: vendorProfile?.name||'', contact_name: vendorProfile?.contact_name||'', contact_email: vendorProfile?.contact_email||'',
    contact_phone: vendorProfile?.contact_phone||'', home_zip: vendorProfile?.home_zip||'', radius: vendorProfile?.radius||20,
    description: vendorProfile?.description||'', website: vendorProfile?.website||'', instagram: vendorProfile?.instagram||'',
    facebook: m.facebook||'', tiktok: m.tiktok||'', youtube: m.youtube||'', otherSocial: m.otherSocial||'',
    yearsActive: m.yearsActive||'', insurance: vendorProfile?.insurance||false,
    // Service provider fields
    isServiceProvider: m.isServiceProvider || m.vendorType?.service || false,
    serviceCategories: m.serviceCategories||[],
    serviceSubcategories: m.serviceSubcategories||[],
    serviceType: m.serviceType||'', serviceRateType: m.serviceRateType||'fixed',
    serviceRateMin: m.serviceRateMin||'', serviceRateMax: m.serviceRateMax||'',
    minBookingDuration: m.minBookingDuration||'1 hour',
    serviceDescription: m.serviceDescription||'',
    availabilityNotes: m.availabilityNotes||'',
    equipmentNotes: m.equipmentNotes||'',
  });
  const [editForm, setEditForm] = useState(initEditForm);
  const ef = (k,v) => setEditForm(f=>({...f,[k]:v}));
  const SIGNIFICANT_FIELDS = ['home_zip','radius'];

  // Open or create a conversation with a host from a booking request
  const messageHost = async (request) => {
    try {
      // Look up host's user_id from events table
      let hostUserId = null;
      if (request.event_name) {
        const { data } = await supabase.from('events').select('user_id').eq('event_name', request.event_name).limit(1);
        hostUserId = data?.[0]?.user_id;
      }
      if (!hostUserId && request.host_email) {
        const { data } = await supabase.from('events').select('user_id').ilike('contact_email', request.host_email).limit(1);
        hostUserId = data?.[0]?.user_id;
      }
      if (!hostUserId) { setTab('messages'); window.scrollTo({top:0}); return; }
      const vendorAuthId = user.id; // always use auth user_id for conversations
      const convoId = getConvoId(hostUserId, vendorAuthId, request.event_id || null);
      // Check if conversation already exists
      const existing = conversations?.find(c => c.id === convoId);
      if (existing) { if (setActiveConvoId) setActiveConvoId(convoId); setTab('messages'); window.scrollTo({top:0}); return; }
      const sysText = `Conversation started by ${vendorProfile?.name || 'Vendor'} about ${request.event_name || 'an event'}. Contact info is shared only after a booking is confirmed.`;
      // Create messages visible to both parties
      await supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: hostUserId, recipient_type: 'host', event_name: request.event_name || '', message_text: sysText, is_read: false });
      await supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: user.id, recipient_type: 'vendor', event_name: request.event_name || '', message_text: sysText, is_read: true });
      const newConvo = {
        id: convoId, vendorId: vendorAuthId, vendorName: vendorProfile?.name || '',
        vendorEmoji: vendorProfile?.emoji || '', vendorCategory: vendorProfile?.category || '',
        hostName: request.host_name || request.host_email || 'Host', eventName: request.event_name || '', status: 'active',
        messages: [{ id: Date.now(), from: 'system', text: sysText, ts: new Date().toISOString() }],
      };
      if (setConversations) setConversations(c => [newConvo, ...c]);
      if (setActiveConvoId) setActiveConvoId(convoId);
      setTab('messages'); window.scrollTo({top:0});
    } catch (err) {
      console.error('messageHost error:', err);
      setTab('messages'); window.scrollTo({top:0});
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    // Hard 3-second timeout — force UI reset no matter what
    const forceComplete = setTimeout(() => {
      setSaving(false); setEditing(false);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 5000);
    }, 3000);
    try {
      const vp = vendorProfile;
      if (!vp || !vp.id) { clearTimeout(forceComplete); setSaving(false); alert('Error: Vendor profile not loaded. Please refresh and try again.'); return; }
      const vid = vp.id;

      // Upload files
      let photoUrls = [...existingPhotos];
      let coiUrl = m.coiUrl || null;
      let lookbookUrl = m.lookbookUrl || null;
      const bucket = 'vendor-files';
      const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const upload = async (file, path) => {
        try {
          const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
          if (error) return null;
          return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        } catch { return null; }
      };
      if (editPhotos.length > 0) {
        const urls = await Promise.all(editPhotos.map((f,i) => upload(f, `${vid}/photos/${existingPhotos.length+i}-${safeName(f.name)}`)));
        photoUrls = [...photoUrls, ...urls.filter(Boolean)];
      }
      if (newCoi) { const u = await upload(newCoi, `${vid}/coi/${safeName(newCoi.name)}`); if (u) coiUrl = u; }
      if (newLookbook) { const u = await upload(newLookbook, `${vid}/lookbook/${safeName(newLookbook.name)}`); if (u) lookbookUrl = u; }

      // Save to Supabase — this is the only await that matters
      const { error } = await supabase.from('vendors').update({
        name:editForm.name, contact_name:editForm.contact_name, contact_phone:editForm.contact_phone||null,
        home_zip:editForm.home_zip, radius:editForm.radius, description:editForm.description,
        website:editForm.website||null, instagram:editForm.instagram||null, insurance:editForm.insurance,
        metadata: { ...m,
          facebook:editForm.facebook||null, tiktok:editForm.tiktok||null, youtube:editForm.youtube||null, otherSocial:editForm.otherSocial||null,
          yearsActive:editForm.yearsActive||null, photoUrls, coiUrl, lookbookUrl,
          isServiceProvider:editForm.isServiceProvider, vendorType:editForm.isServiceProvider?{market:!!vp.category,service:true}:m.vendorType,
          serviceCategories:editForm.serviceCategories||[], serviceSubcategories:editForm.serviceSubcategories||[],
          serviceType:editForm.serviceType||null, serviceRateType:editForm.serviceRateType||'fixed',
          serviceRateMin:editForm.serviceRateMin||null, serviceRateMax:editForm.serviceRateMax||null,
          minBookingDuration:editForm.minBookingDuration||null, serviceDescription:editForm.serviceDescription||null,
          availabilityNotes:editForm.availabilityNotes||null, equipmentNotes:editForm.equipmentNotes||null,
          bookingLeadTime:editForm.bookingLeadTime||m.bookingLeadTime||null,
        },
        status: 'pending',
      }).eq('id', vid);

      // Cancel the force-timeout since we got a response
      clearTimeout(forceComplete);

      if (error) { setSaving(false); alert('Failed to save: ' + error.message); return; }

      // SUCCESS — immediately reset UI, no more awaits
      setSaving(false);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

      // Everything below is fire-and-forget background work
      fetch('/api/send-vendor-notification', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ businessName:editForm.name+' (PROFILE UPDATE)', contactName:editForm.contact_name, vendorEmail:'tiffany@southjerseyvendormarket.com', category:vp.category||editForm.serviceCategories?.[0]||'—', vendorType:editForm.isServiceProvider?'service':'market' }),
      }).catch(e=>console.error('API call failed:',e));
      supabase.from('change_log').insert({ entity_type:'vendor', entity_id:vid, entity_name:editForm.name, changed_by:user.email, changes:{summary:'profile updated'}, significant:true }).catch(e=>console.error('API call failed:',e));
      supabase.from('vendors').select('*').eq('id', vid).single()
        .then(({ data: updated }) => { if (updated && setVendorProfile) setVendorProfile(updated); }).catch(e=>console.error('API call failed:',e));
    } catch (err) {
      clearTimeout(forceComplete);
      setSaving(false);
      alert('Something went wrong: ' + (err.message||'Unknown error') + '\n\nPlease try again.');
    }
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
    // Load host-initiated invitations (where vendor is the target)
    supabase.from('booking_requests').select('*')
      .eq('vendor_id', vendorProfile.id).neq('session_id', 'vendor-application').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRequests(data); });
    // Load vendor-initiated applications
    const loadApps = async () => {
      let apps = [];
      const { data: byId } = await supabase.from('booking_requests').select('*')
        .eq('vendor_id', vendorProfile.id).eq('session_id', 'vendor-application').order('created_at', { ascending: false });
      if (byId) apps = byId;
      if (apps.length === 0 && vendorProfile.contact_email) {
        const { data: byEmail } = await supabase.from('booking_requests').select('*')
          .ilike('host_email', vendorProfile.contact_email).eq('session_id', 'vendor-application').order('created_at', { ascending: false });
        if (byEmail) apps = byEmail;
      }
      if (apps.length === 0 && vendorProfile.name) {
        const { data: byName } = await supabase.from('booking_requests').select('*')
          .ilike('vendor_name', vendorProfile.name).eq('session_id', 'vendor-application').order('created_at', { ascending: false });
        if (byName) apps = byName;
      }
      setMyApplications(apps);
      setLoadingReqs(false);
    };
    loadApps();
  }, [vendorProfile?.id]);

  const respond = async (reqId, status) => {
    const req = requests.find(r => r.id === reqId);
    const { error } = await supabase.from('booking_requests')
      .update({ status, responded_at: new Date().toISOString() }).eq('id', reqId);
    if (error) { alert('Failed to update. Try again.'); return; }
    setRequests(r => r.map(x => x.id === reqId ? { ...x, status } : x));
    // Notify host
    if (req?.host_email) {
      fetch('/api/send-message-notification', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ recipientEmail: req.host_email, recipientName: req.host_name, senderName: vendorProfile?.name || 'A vendor', senderType: 'vendor', recipientType: 'host', eventName: req.event_name, messagePreview: `${vendorProfile?.name || 'A vendor'} has ${status} your invite for ${req.event_name} on ${fmtDate(req.event_date)}.` }),
      }).catch(() => {});
    }
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

      {/* ── Dashboard nav buttons ── */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
        <button onClick={()=>{const opening=!showProfilePanel;setShowProfilePanel(opening);setShowSubPanel(false);if(opening)setTimeout(()=>profilePanelRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50);}} style={{background:showProfilePanel?'#c8a850':'#1a1410',color:showProfilePanel?'#1a1410':'#e8c97a',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>My Profile</button>
        <button onClick={()=>{const opening=!showSubPanel;setShowSubPanel(opening);setShowProfilePanel(false);if(opening)setTimeout(()=>subPanelRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50);}} style={{background:showSubPanel?'#c8a850':'#1a1410',color:showSubPanel?'#1a1410':'#e8c97a',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Subscription</button>
        <button onClick={()=>{setTab('messages');window.scrollTo({top:0});}} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Messages{unreadCount>0?` (${unreadCount})`:''}</button>
        <button onClick={()=>{setTab('opportunities');window.scrollTo({top:0});}} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Browse Events</button>
        <button onClick={()=>{setTab('my-calendar');window.scrollTo({top:0});}} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>My Calendar</button>
      </div>

      {/* ── Messages notification — always at top ── */}
      {unreadCount > 0 && (
        <button onClick={()=>{setTab('messages');window.scrollTo({top:0});}} style={{width:'100%',background:'#1a1410',border:'2px solid #e8c97a',borderRadius:10,padding:'14px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20}}>💬</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:14,color:'#e8c97a'}}>{unreadCount} unread message{unreadCount!==1?'s':''}</div>
              <div style={{fontSize:12,color:'#c8b898'}}>Tap to view and reply</div>
            </div>
          </div>
          <span style={{fontSize:18,color:'#e8c97a'}}>→</span>
        </button>
      )}

      {/* ── 2. REQUESTS FROM HOSTS ── */}
      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:12}}>Requests from Hosts</h3>

      {/* Pending host invitations — grouped by event name for recurring */}
      {requests.filter(r=>r.status==='pending').length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:'#c8a850',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Host Invites</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(() => {
              const pending = requests.filter(r=>r.status==='pending');
              const groups = {};
              pending.forEach(r => { const key = r.event_name; if (!groups[key]) groups[key] = []; groups[key].push(r); });
              return Object.entries(groups).map(([eventName, dateRequests]) => {
                const isSeries = dateRequests.length > 1;
                const first = dateRequests[0];
                return (
                  <div key={eventName} style={{background:'#fff',border:'2px solid #ffd966',borderRadius:10,padding:'14px 16px'}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#1a1410',marginBottom:2}}>{eventName}</div>
                    <div style={{fontSize:12,color:'#7a6a5a',marginBottom:4}}>{first.host_name} · Zip {first.event_zip}</div>
                    {isSeries && <div style={{fontSize:11,color:'#c8a850',fontWeight:700,marginBottom:8}}>🔄 Recurring Series — {dateRequests.length} dates</div>}
                    {first.notes && <div style={{fontSize:12,color:'#a89a8a',marginBottom:8,fontStyle:'italic'}}>"{first.notes}"</div>}
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
                      {dateRequests.sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||'')).map(r => (
                        <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 12px',flexWrap:'wrap',gap:6}}>
                          <div style={{fontSize:13,fontWeight:600,color:'#1a1410'}}>{fmtDate(r.event_date)}</div>
                          <div style={{display:'flex',gap:4}}>
                            <button onClick={()=>respond(r.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept</button>
                            <button onClick={()=>respond(r.id,'declined')} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {isSeries && (
                        <>
                          <button onClick={async()=>{if(!window.confirm(`Accept all ${dateRequests.length} dates?`))return;for(const r of dateRequests)await respond(r.id,'accepted');}} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept All Dates</button>
                          <button onClick={async()=>{if(!window.confirm(`Decline all ${dateRequests.length} dates?`))return;for(const r of dateRequests)await respond(r.id,'declined');}} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline All</button>
                        </>
                      )}
                      <button onClick={()=>messageHost(first)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Message Host</button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Pending applications */}
      {myApplications.filter(a=>a.status==='pending').length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:'#c8a850',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>My Applications — Awaiting Response</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {myApplications.filter(a=>a.status==='pending').map(a => (
              <div key={a.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{a.event_name || a.event_type || 'Event'}</div>
                  <div style={{fontSize:12,color:'#7a6a5a'}}>{fmtDate(a.event_date)} · {getCityFromZip(a.event_zip) ? getCityFromZip(a.event_zip)+' · ' : ''}Zip {a.event_zip || '—'} · {a.host_name || 'Host'}</div>
                  {a.sent_at && <div style={{fontSize:11,color:'#a89a8a',marginTop:2}}>Applied {new Date(a.sent_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>}
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{background:'#fdf4dc',color:'#7a5a10',padding:'4px 12px',borderRadius:10,fontSize:11,fontWeight:700}}>Pending Review</span>
                  <button onClick={async()=>{if(!window.confirm('Withdraw your application for this event?'))return;await supabase.from('booking_requests').update({status:'withdrawn'}).eq('id',a.id);setMyApplications(prev=>prev.map(x=>x.id===a.id?{...x,status:'withdrawn'}:x));fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:a.host_email||'',recipientName:a.host_name,senderName:vendorProfile?.name||'A vendor',senderType:'vendor',eventName:a.event_name,messagePreview:`${vendorProfile?.name||'A vendor'} has withdrawn their application for ${a.event_name}.`})}).catch(()=>{});}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Withdraw</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No pending items */}
      {requests.filter(r=>r.status==='pending').length === 0 && myApplications.filter(a=>a.status==='pending').length === 0 && !loadingReqs && (
        <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px',marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:13,color:'#7a6a5a'}}>No pending items. <button onClick={()=>setTab('opportunities')} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:13,fontFamily:'inherit'}}>Browse events</button> to find new opportunities.</div>
        </div>
      )}

      {/* ── 3. EVENTS THAT MATCH YOU ── */}
      {isApproved && opps && opps.length > 0 && (() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const vendorCats = [...(vendorProfile?.subcategories||[]), vendorProfile?.category, ...(vendorProfile?.metadata?.serviceCategories||[]), ...(vendorProfile?.metadata?.allCategories||[])].filter(Boolean);
        const vendorZip = vendorProfile?.home_zip;
        const vendorRadius = vendorProfile?.radius || 20;
        const appliedEventNames = new Set([...myApplications, ...requests].map(a => a.event_name));
        const matching = opps
          .filter(o => o.date >= todayStr)
          .filter(o => !appliedEventNames.has(o.eventName))
          .filter(o => vendorCats.length === 0 || o.categoriesNeeded.length === 0 || o.categoriesNeeded.some(c => vendorCats.includes(c)))
          .filter(o => { if (!vendorZip || !isKnownZip(vendorZip)) return true; const d = distanceMiles(vendorZip, o.zip); return d === null || d <= vendorRadius; })
          .slice(0, 5);
        if (matching.length === 0) return null;
        return (
          <div style={{background:'#fff',border:'2px solid #c8a850',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:4}}>New Events Matching Your Profile</div>
            <div style={{fontSize:12,color:'#7a6a5a',marginBottom:12}}>These events are looking for vendors like you</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {matching.map(o => (
                <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 14px',flexWrap:'wrap',gap:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{o.eventName}</div>
                    <div style={{fontSize:12,color:'#7a6a5a'}}>{o.eventType} · {fmtDate(o.date)} · {getCityFromZip(o.zip) || 'Zip '+o.zip}</div>
                  </div>
                  <button onClick={()=>{setTab('opportunities');window.scrollTo({top:0});}} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>View & Apply</button>
                </div>
              ))}
            </div>
            {matching.length >= 5 && <button onClick={()=>{setTab('opportunities');window.scrollTo({top:0});}} style={{marginTop:8,background:'none',border:'none',color:'#c8a850',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',textDecoration:'underline'}}>See all matching events →</button>}
          </div>
        );
      })()}

      {/* Profile switcher for multi-listing vendors */}
      {allVendorProfiles && allVendorProfiles.length > 1 && (
        <div style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'12px 16px',marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Your Listings</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {allVendorProfiles.map(p => (
              <button key={p.id} onClick={()=>setVendorProfile(p)}
                style={{padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',
                  border: vendorProfile?.id===p.id ? '2px solid #c8a850' : '1px solid #e8ddd0',
                  background: vendorProfile?.id===p.id ? '#fdf9f0' : '#fff',
                  color:'#1a1410',transition:'all 0.15s'}}>
                {p.name}{vendorProfile?.id===p.id && <span style={{marginLeft:6,fontSize:11,color:'#c8a850'}}>Active</span>}
              </button>
            ))}
            <button onClick={()=>{setTab('vendor');window.scrollTo({top:0});}}
              style={{padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',
                border:'1px dashed #c8a850',background:'none',color:'#c8a850'}}>
              + Add Listing
            </button>
          </div>
        </div>
      )}

      {/* Single listing — add another prompt */}
      {allVendorProfiles && allVendorProfiles.length === 1 && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 16px',marginBottom:20,flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:13,color:'#7a6a5a'}}>Have another business or service?</span>
          <button onClick={()=>{setTab('vendor');window.scrollTo({top:0});}}
            style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'5px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>
            + Add Another Listing
          </button>
        </div>
      )}

      {saveSuccess && (
        <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:10,padding:'14px 20px',marginBottom:24,textAlign:'center',animation:'fadeIn 0.3s ease'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#1a6b3a'}}>Changes submitted for review successfully!</div>
          <div style={{fontSize:13,color:'#2d7a50',marginTop:4}}>Your updates will be live within 24 hours after admin approval.</div>
        </div>
      )}

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

      {showProfilePanel && <div ref={profilePanelRef} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:12,padding:24,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,margin:0}}>My Profile</h3>
          <button onClick={()=>{if(editing){setEditing(false);}else{setEditForm(initEditForm());setExistingPhotos(m.photoUrls||[]);setEditPhotos([]);setNewCoi(null);setNewLookbook(null);setEditing(true);}}} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{editing?'Cancel':'Edit Profile'}</button>
        </div>
        {editing ? (
          <>
            <div className="form-grid" style={{gap:10,marginBottom:14}}>
              <div className="form-group"><label>Business Name</label><input value={editForm.name} onChange={e=>ef('name',e.target.value)} /></div>
              <div className="form-group"><label>Contact Name</label><input value={editForm.contact_name} onChange={e=>ef('contact_name',e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={editForm.contact_email} disabled style={{opacity:0.6}} /><div style={{fontSize:10,color:'#a89a8a'}}>Email cannot be changed</div></div>
              <div className="form-group"><label>Phone</label><input value={editForm.contact_phone} onChange={e=>ef('contact_phone',e.target.value)} /></div>
              <div className="form-group"><label>Zip Code</label><input value={editForm.home_zip} onChange={e=>ef('home_zip',e.target.value.replace(/\D/g,'').slice(0,5))} maxLength={5} /></div>
              <div className="form-group"><label>Travel Radius</label><select value={editForm.radius} onChange={e=>ef('radius',+e.target.value)}>{[5,10,15,20,30,50].map(r=><option key={r} value={r}>{r} miles</option>)}</select></div>
              <div className="form-group"><label>Years in Business</label><select value={editForm.yearsActive} onChange={e=>ef('yearsActive',e.target.value)}><option value="">Select...</option><option value="<1">Less than 1 year</option><option value="1-2">1-2 years</option><option value="3-5">3-5 years</option><option value="6-10">6-10 years</option><option value="10+">10+ years</option></select></div>
              <div className="form-group"><label>Insurance</label><select value={editForm.insurance?'yes':'no'} onChange={e=>ef('insurance',e.target.value==='yes')}><option value="no">No</option><option value="yes">Yes — I have a COI</option></select></div>
              <div className="form-group full">
                <label>Business Description</label>
                <textarea value={editForm.description} onChange={e=>{if(e.target.value.length<=500)ef('description',e.target.value);}} style={{minHeight:80}} maxLength={500} />
                <div style={{fontSize:11,color:editForm.description.length>450?'#c0392b':'#a89a8a',textAlign:'right',marginTop:2}}>{editForm.description.length}/500</div>
              </div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:8,marginTop:8}}>Links & Social</div>
            <div className="form-grid" style={{gap:10,marginBottom:14}}>
              <div className="form-group"><label>Website</label><input value={editForm.website} onChange={e=>ef('website',e.target.value)} /></div>
              <div className="form-group"><label>Instagram</label><input value={editForm.instagram} onChange={e=>ef('instagram',e.target.value)} /></div>
              <div className="form-group"><label>Facebook</label><input value={editForm.facebook} onChange={e=>ef('facebook',e.target.value)} /></div>
              <div className="form-group"><label>TikTok</label><input value={editForm.tiktok} onChange={e=>ef('tiktok',e.target.value)} /></div>
              <div className="form-group"><label>YouTube</label><input value={editForm.youtube} onChange={e=>ef('youtube',e.target.value)} /></div>
              <div className="form-group"><label>Other Link</label><input value={editForm.otherSocial} onChange={e=>ef('otherSocial',e.target.value)} /></div>
            </div>
            {/* Service Provider Section */}
            {editForm.isServiceProvider && (
              <div style={{marginTop:16,marginBottom:14,background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1a1410',marginBottom:12}}>Service Provider Details</div>
                <div className="form-grid" style={{gap:10}}>
                  <div className="form-group"><label>Service Categories</label>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {SERVICE_CATEGORIES.map(cat=>(
                        <button key={cat} type="button" onClick={()=>{const has=editForm.serviceCategories.includes(cat);ef('serviceCategories',has?editForm.serviceCategories.filter(c=>c!==cat):[...editForm.serviceCategories,cat]);}} style={{padding:'5px 12px',borderRadius:16,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:'1px solid',background:editForm.serviceCategories.includes(cat)?'#c8a850':'#fff',color:editForm.serviceCategories.includes(cat)?'#1a1410':'#7a6a5a',borderColor:editForm.serviceCategories.includes(cat)?'#c8a850':'#e8ddd0'}}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  {editForm.serviceCategories.length>0 && (
                    <div className="form-group full"><label>Service Subcategories</label>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {editForm.serviceCategories.flatMap(cat=>(SERVICE_SUBCATEGORIES[cat]||[]).filter(s=>s!=='Other')).map(sub=>(
                          <button key={sub} type="button" onClick={()=>{const has=editForm.serviceSubcategories.includes(sub);ef('serviceSubcategories',has?editForm.serviceSubcategories.filter(s=>s!==sub):[...editForm.serviceSubcategories,sub]);}} style={{padding:'4px 10px',borderRadius:14,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:'1px solid',background:editForm.serviceSubcategories.includes(sub)?'#1a1410':'#fff',color:editForm.serviceSubcategories.includes(sub)?'#e8c97a':'#5a4a3a',borderColor:editForm.serviceSubcategories.includes(sub)?'#1a1410':'#e8ddd0'}}>{sub}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form-group"><label>Rate Type</label>
                    <select value={editForm.serviceRateType} onChange={e=>ef('serviceRateType',e.target.value)}>
                      <option value="fixed">Fixed Rate</option>
                      <option value="range">Rate Range</option>
                      <option value="quote">Open to Quotes</option>
                    </select>
                  </div>
                  {editForm.serviceRateType==='fixed' && <div className="form-group"><label>Your Rate</label><input placeholder="e.g. $500/event" value={editForm.serviceRateMin} onChange={e=>ef('serviceRateMin',e.target.value)} /></div>}
                  {editForm.serviceRateType==='range' && <>
                    <div className="form-group"><label>Starting At</label><input placeholder="e.g. $200" value={editForm.serviceRateMin} onChange={e=>ef('serviceRateMin',e.target.value)} /></div>
                    <div className="form-group"><label>Up To</label><input placeholder="e.g. $800" value={editForm.serviceRateMax} onChange={e=>ef('serviceRateMax',e.target.value)} /></div>
                  </>}
                  <div className="form-group"><label>Min Booking Duration</label>
                    <select value={editForm.minBookingDuration} onChange={e=>ef('minBookingDuration',e.target.value)}>
                      {SERVICE_DURATIONS.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Min Booking Notice</label>
                    <select value={editForm.bookingLeadTime||m.bookingLeadTime||''} onChange={e=>ef('bookingLeadTime',e.target.value)}>
                      <option value="1week">At least 1 week</option>
                      <option value="2weeks">At least 2 weeks</option>
                      <option value="1month">At least 1 month</option>
                      <option value="2months">2+ months</option>
                      <option value="flexible">Flexible — last minute OK</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>What's Included</label>
                    <textarea placeholder="Describe what the host gets — duration, equipment, setup/breakdown, setlist customization, etc." value={editForm.serviceDescription} onChange={e=>ef('serviceDescription',e.target.value)} style={{minHeight:60}} />
                  </div>
                  <div className="form-group full">
                    <label>Availability Notes</label>
                    <textarea placeholder="e.g. Weekends only, no holidays, available year-round..." value={editForm.availabilityNotes} onChange={e=>ef('availabilityNotes',e.target.value)} style={{minHeight:40}} />
                  </div>
                  <div className="form-group full">
                    <label>Equipment & Requirements</label>
                    <textarea placeholder="What you bring vs what the venue needs to provide..." value={editForm.equipmentNotes} onChange={e=>ef('equipmentNotes',e.target.value)} style={{minHeight:40}} />
                  </div>
                </div>
              </div>
            )}

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
          <>
            {/* Photos */}
            {(m.photoUrls||[]).length > 0 && (
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                {(m.photoUrls||[]).map((url,i)=>(
                  <img key={i} src={url} alt={`Photo ${i+1}`} style={{width:100,height:100,objectFit:'cover',borderRadius:8,border:'1px solid #e8ddd0'}} />
                ))}
              </div>
            )}
            {/* Info grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:14}}>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Business:</span> {vendorProfile?.name}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Contact:</span> {vendorProfile?.contact_name}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Email:</span> {vendorProfile?.contact_email}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Phone:</span> {vendorProfile?.contact_phone || '—'}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Location:</span> Zip {vendorProfile?.home_zip} · {vendorProfile?.radius}mi radius</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Category:</span> {vendorProfile?.isServiceProvider ? (vendorProfile.serviceCategories||[]).join(', ')||vendorProfile?.category : vendorProfile?.category}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Insurance:</span> {vendorProfile?.insurance ? '✓ Insured' : 'Not insured'}</div>
              <div><span style={{fontSize:12,color:'#a89a8a',fontWeight:600}}>Status:</span> <span style={{background:vendorProfile?.status==='approved'?'#d4f4e0':'#fdf4dc',color:vendorProfile?.status==='approved'?'#1a6b3a':'#7a5a10',padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:600}}>{vendorProfile?.status || 'pending'}</span></div>
            </div>
            {/* Description */}
            {vendorProfile?.description && <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.6,marginBottom:14,padding:'10px 12px',background:'#fdf9f5',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{vendorProfile.description}</div>}
            {/* Service provider info */}
            {vendorProfile?.isServiceProvider && (
              <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:6}}>Service Provider</div>
                <div style={{fontSize:13,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 16px'}}>
                  <div><span style={{color:'#a89a8a',fontSize:11}}>Type:</span> {vendorProfile.serviceType||'—'}</div>
                  <div><span style={{color:'#a89a8a',fontSize:11}}>Rate:</span> {vendorProfile.serviceRateType==='quote'?'Quote based':vendorProfile.serviceRateType==='range'?`${vendorProfile.serviceRateMin} – ${vendorProfile.serviceRateMax}`:vendorProfile.serviceRateMin||'—'}</div>
                  <div><span style={{color:'#a89a8a',fontSize:11}}>Duration:</span> {vendorProfile.minBookingDuration||'—'}</div>
                </div>
                {vendorProfile.serviceDescription && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}>{vendorProfile.serviceDescription}</div>}
              </div>
            )}
            {/* Links */}
            {[vendorProfile?.website,vendorProfile?.instagram,m.facebook,m.tiktok,m.youtube,m.otherSocial].some(Boolean) && (
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
                {[{l:'🌐 Website',u:vendorProfile?.website},{l:'📸 Instagram',u:vendorProfile?.instagram},{l:'👤 Facebook',u:m.facebook},{l:'🎵 TikTok',u:m.tiktok},{l:'▶️ YouTube',u:m.youtube},{l:'🔗 Other',u:m.otherSocial}].filter(x=>x.u).map(x=>(
                  <a key={x.l} href={x.u.startsWith('http')?x.u:'https://'+x.u} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b',textDecoration:'none',background:'#e8f4fd',padding:'4px 10px',borderRadius:6}}>{x.l}</a>
                ))}
              </div>
            )}
            {m.lookbookUrl && <div style={{marginBottom:8}}><a href={m.lookbookUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b'}}>📋 View Price Menu / Lookbook</a></div>}
            <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:6,padding:'8px 12px',marginTop:12,fontSize:12,color:'#1a4a6b'}}>
              <strong>Profile Preview</strong> — this is how your listing appears to hosts browsing the vendor directory. Click "Edit Profile" to make changes.
            </div>
          </>
        )}
      </div>}

      {/* Subscription Card */}
      {showSubPanel && <div ref={subPanelRef} style={{background:'#fff',border: subStatus === 'active' ? '2px solid #b8e8c8' : '2px solid #e8c97a',borderRadius:12,padding:24,marginBottom:24}}>
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
      </div>}

      {/* ── First-time onboarding ── */}
      {isApproved && requests.length === 0 && myApplications.length === 0 && !loadingReqs && (
        <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:15,color:'#1a4a6b',marginBottom:8}}>Welcome to your dashboard!</div>
          <div style={{fontSize:13,color:'#1a4a6b',lineHeight:1.8}}>
            1. <strong>Browse events</strong> — find opportunities that match your category and location<br/>
            2. <strong>Apply to events</strong> — one click to let hosts know you're interested<br/>
            3. <strong>Respond to invitations</strong> — hosts can find and invite you directly
          </div>
          <button onClick={()=>setTab('opportunities')} style={{marginTop:12,background:'#1a4a6b',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Browse Events</button>
        </div>
      )}

      {/* ── Analytics summary ── */}
      {isApproved && (requests.length > 0 || myApplications.length > 0) && (
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          <div style={{flex:'1 1 100px',background:'#fff',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:'#c8a850'}}>{requests.length + myApplications.length}</div>
            <div style={{fontSize:11,color:'#7a6a5a'}}>Total Activity</div>
          </div>
          <div style={{flex:'1 1 100px',background:'#fff',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:'#1a6b3a'}}>{[...requests,...myApplications].filter(a=>a.status==='accepted').length}</div>
            <div style={{fontSize:11,color:'#7a6a5a'}}>Confirmed</div>
          </div>
          <div style={{flex:'1 1 100px',background:'#fff',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:'#c8a850'}}>{[...requests,...myApplications].filter(a=>a.status==='pending').length}</div>
            <div style={{fontSize:11,color:'#7a6a5a'}}>Pending</div>
          </div>
        </div>
      )}

      {/* ── Insurance visibility note ── */}
      {isApproved && !vendorProfile?.insurance && (
        <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'10px 14px',marginBottom:20,fontSize:12,color:'#7a5a10',lineHeight:1.5}}>
          <strong>Tip:</strong> Hosts can filter vendors by insurance status. Adding a certificate of insurance to your profile increases your visibility and booking rate.
        </div>
      )}

      {/* ── CONFIRMED ── */}
      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:12}}>Confirmed</h3>

      {/* Confirmed bookings */}
      {[...requests.filter(r=>r.status==='accepted'), ...myApplications.filter(a=>a.status==='accepted')].length > 0 ? (
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
          {[...requests.filter(r=>r.status==='accepted'), ...myApplications.filter(a=>a.status==='accepted')].map(a => (
            <div key={a.id} style={{background:'#fff',border:'2px solid #b8e8c8',borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{a.event_name || a.event_type || 'Event'}</div>
                <div style={{fontSize:12,color:'#7a6a5a'}}>{fmtDate(a.event_date)} · Zip {a.event_zip || '—'} · {a.host_name || 'Host'}</div>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{background:'#d4f4e0',color:'#1a6b3a',padding:'4px 12px',borderRadius:10,fontSize:11,fontWeight:700}}>Confirmed</span>
                <button onClick={()=>messageHost(a)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Message</button>
                <button onClick={async()=>{const reason=window.prompt('Reason for cancelling this booking (sent to host):');if(reason===null)return;await supabase.from('booking_requests').update({status:'cancelled',vendor_message:reason||'Vendor cancelled'}).eq('id',a.id);setRequests(prev=>prev.map(x=>x.id===a.id?{...x,status:'cancelled'}:x));setMyApplications(prev=>prev.map(x=>x.id===a.id?{...x,status:'cancelled'}:x));fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:a.host_email||'',recipientName:a.host_name,senderName:vendorProfile?.name||'A vendor',senderType:'vendor',eventName:a.event_name,messagePreview:`${vendorProfile?.name||'A vendor'} has cancelled their booking for ${a.event_name}.${reason?' Reason: '+reason:''}`})}).catch(()=>{});}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel Booking</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px',marginBottom:24,textAlign:'center'}}>
          <div style={{fontSize:13,color:'#7a6a5a'}}>No confirmed events yet. Apply to events or respond to host invitations above.</div>
        </div>
      )}

      {/* Declined (collapsed) */}
      {[...requests.filter(r=>r.status==='declined'), ...myApplications.filter(a=>a.status==='declined')].length > 0 && (
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,color:'#a89a8a',marginBottom:8}}>{[...requests.filter(r=>r.status==='declined'), ...myApplications.filter(a=>a.status==='declined')].length} not selected</div>
          {[...requests.filter(r=>r.status==='declined'), ...myApplications.filter(a=>a.status==='declined')].map(a => (
            <div key={a.id} style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 14px',marginBottom:4,fontSize:12,color:'#a89a8a'}}>
              {a.event_name || 'Event'} · {fmtDate(a.event_date)}
            </div>
          ))}
        </div>
      )}

      {/* ── My Calendar ── */}
      <UnifiedDashboardCalendar authUser={user} vendorProfile={vendorProfile} userEvents={[]} setTab={setTab} />

      {/* Contact & Feedback */}
      <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'#7a6a5a'}}>Need help? Have questions about your listing?</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>setShowContactModal(true)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
        </div>
      </div>

      {/* Account management */}
      <div style={{borderTop:'1px solid #e8ddd0',paddingTop:20,marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:700,color:'#a89a8a',letterSpacing:1,textTransform:'uppercase',marginBottom:12}}>Account Management</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {allVendorProfiles && allVendorProfiles.length > 1 && (
            <button onClick={async()=>{if(!window.confirm(`Remove "${vendorProfile?.name}" listing? This deletes this vendor profile only, not your account.`))return;await supabase.from('vendors').delete().eq('id',vendorProfile?.id);setVendorProfile(allVendorProfiles.find(p=>p.id!==vendorProfile?.id)||null);window.location.reload();}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Remove This Listing</button>
          )}
          <button onClick={async()=>{if(!window.confirm('Delete your entire account? This removes ALL vendor profiles, messages, bookings, and your login. This cannot be undone.'))return;if(!window.confirm('Are you absolutely sure? This is permanent.'))return;await supabase.from('booking_requests').delete().or(`vendor_id.eq.${vendorProfile?.id},host_email.eq.${user.email}`).catch(()=>{});await supabase.from('messages').delete().or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).catch(()=>{});await supabase.from('vendors').delete().eq('user_id',user.id).catch(()=>{});await supabase.from('events').delete().eq('user_id',user.id).catch(()=>{});await supabase.from('event_goers').delete().eq('email',user.email).catch(()=>{});await supabase.auth.signOut();window.location.reload();}} style={{background:'none',border:'1px solid #e0d5c5',color:'#8b1a1a',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Delete Entire Account</button>
        </div>
      </div>
    </div>
  );
}

// ─── Host Dashboard ───────────────────────────────────────────────────────────
function HostDashboard({ user, userEvents, setTab, setShowContactModal, setShowFeedbackModal, setUserEvents, setHostEventFromDashboard, unreadCount, conversations, openMessage, setAllEvents, setOpps }) {
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({});
  const [savingEvent, setSavingEvent] = useState(false);
  const [editExistingPhotos, setEditExistingPhotos] = useState([]);
  const [editNewPhotos, setEditNewPhotos] = useState([]);
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewVendor, setReviewVendor] = useState(null);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [cancelEventModal, setCancelEventModal] = useState(null); // {event, seriesEvents}
  const [expandedVendorList, setExpandedVendorList] = useState(null); // e.g. "eventId_confirmed"
  const [profileModalVendor, setProfileModalVendor] = useState(null); // vendor object for VendorProfileModal

  const openVendorProfile = async (vendorId) => {
    if (!vendorId) return;
    const { data } = await supabase.from('vendors').select('*').eq('id', vendorId).single();
    if (data) setProfileModalVendor(dbVendorToApp(data));
    else alert('Could not load vendor profile.');
  };

  // Delete one or more events and all related data
  const deleteEvents = async (eventsToDelete, reason) => {
    // Notify vendors for events with bookings
    for (const evt of eventsToDelete) {
      const bookedVendors = applications.filter(a=>a.event_name===evt.event_name&&a.event_date===evt.date&&(a.status==='accepted'||a.status==='pending'));
      for (const a of bookedVendors) {
        if (a.vendor_id) {
          const {data:vr} = await supabase.from('vendors').select('contact_email,contact_name').eq('id',a.vendor_id).limit(1);
          if (vr?.[0]?.contact_email) {
            fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:vr[0].contact_email,recipientName:vr[0].contact_name,senderName:evt.contact_name||user.email,senderType:'host',eventName:evt.event_name,messagePreview:`${evt.event_name} on ${fmtDate(evt.date)} has been cancelled.${reason?' Reason: '+reason:''}`})}).catch(()=>{});
          }
        }
      }
    }
    // Delete from DB first, then update UI only on success
    const deleteIds = new Set(eventsToDelete.map(e=>e.id));
    const deleteNames = new Set(eventsToDelete.map(e=>e.event_name));
    try {
      for (const evt of eventsToDelete) {
        const {error:brErr} = await supabase.from('booking_requests').delete().eq('event_name',evt.event_name).eq('event_date',evt.date);
        if (brErr) console.error('Failed to delete booking requests for', evt.event_name, evt.date, brErr);
        const {error:evtErr} = await supabase.from('events').delete().eq('id',evt.id);
        if (evtErr) throw new Error(`Failed to delete event ${evt.event_name}: ${evtErr.message}`);
      }
      for (const name of deleteNames) {
        const {error:msgErr} = await supabase.from('messages').delete().ilike('event_name','%'+name+'%');
        if (msgErr) console.error('Failed to clean up messages for', name, msgErr);
      }
      // DB deletes succeeded — now update UI
      setUserEvents(prev=>prev.filter(x=>!deleteIds.has(x.id)));
      if(setAllEvents)setAllEvents(prev=>prev.filter(x=>!deleteIds.has(x.id)));
      if(setOpps)setOpps(prev=>prev.filter(x=>!deleteIds.has(x.id)));
      setApplications(prev=>prev.filter(a=>!eventsToDelete.some(e=>e.event_name===a.event_name&&e.date===a.event_date)));
      // Email host
      fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:eventsToDelete[0]?.contact_email||user.email,recipientName:eventsToDelete[0]?.contact_name,senderName:'South Jersey Vendor Market',senderType:'host',eventName:eventsToDelete[0]?.event_name,messagePreview:`${eventsToDelete.length} event date${eventsToDelete.length!==1?'s':''} cancelled and removed.`})}).catch(()=>{});
    } catch (err) {
      console.error('Event cancellation failed:', err);
      alert('Something went wrong cancelling this event. Please try again.');
    }
  };
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(null);
  const SIG_EVENT_FIELDS = ['date','zip','event_name'];

  const startEditEvent = (e) => {
    setEventForm({
      event_name:e.event_name, event_type:e.event_type, date:e.date, start_time:e.start_time||'', end_time:e.end_time||'',
      zip:e.zip, booth_fee:e.booth_fee||'', spots:e.spots||0, notes:e.notes||'', deadline:e.deadline||'',
      ticket_price:e.ticket_price||'', is_ticketed:e.is_ticketed||false, event_link:e.event_link||'',
      allow_duplicate_categories:e.allow_duplicate_categories!==false, allow_duplicate_subcategories:e.allow_duplicate_subcategories!==false,
    });
    setEditExistingPhotos(e.event_photos||[]);
    setEditNewPhotos([]);
    setEditingEvent(e.id);
  };
  const eSet = (k,v) => setEventForm(f=>({...f,[k]:v}));

  const saveEvent = async (evt) => {
    setSavingEvent(true);
    try {
      // Convert new photos to base64 and store directly in DB
      let photoUrl = editExistingPhotos.length > 0 ? editExistingPhotos[0] : (evt.photo_url || null);
      if (editNewPhotos.length > 0) {
        const f = editNewPhotos[editNewPhotos.length - 1]; // use last selected photo
        const reader = new FileReader();
        photoUrl = await new Promise((resolve) => { reader.onload = () => resolve(reader.result); reader.readAsDataURL(f); });
      }

      // Update event with all core fields
      const payload = {
        event_name: eventForm.event_name, event_type: eventForm.event_type,
        date: eventForm.date, start_time: eventForm.start_time || null, end_time: eventForm.end_time || null,
        zip: eventForm.zip, booth_fee: eventForm.booth_fee || null, spots: eventForm.spots || null,
        notes: eventForm.notes || null, deadline: eventForm.deadline || null,
        photo_url: photoUrl, status: 'pending_review',
      };

      let { error } = await supabase.from('events').update(payload).eq('id', evt.id);
      if (error) {
        // photo_url might be too large for the column — try without it
        const { photo_url: _pu, ...withoutPhoto } = payload;
        ({ error } = await supabase.from('events').update(withoutPhoto).eq('id', evt.id));
        if (!error) alert('Event saved but photo was too large to store. Try a smaller image.');
      }
      if (error) {
        alert('Failed to save: ' + error.message);
        setSavingEvent(false);
        return;
      }

      // Refresh from DB and update ALL state sources
      const { data } = await supabase.from('events').select('*').eq('id', evt.id).single();
      if (data) {
        const mapped = dbEventToApp(data);
        if (setUserEvents) setUserEvents(prev => prev.map(e => e.id === evt.id ? data : e));
        if (setAllEvents) setAllEvents(prev => prev.map(e => e.id === mapped.id ? mapped : e));
        if (setOpps) setOpps(prev => prev.map(e => e.id === mapped.id ? mapped : e));
      }

      // Notify admin (fire and forget)
      fetch('/api/send-contact', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:'Admin Alert', email:'system@sjvm.app', subject:`Event Updated: ${eventForm.event_name}`, message:`Host ${user.email} updated their event. Status set to pending review.` }),
      }).catch(()=>{});

      setEditingEvent(null); setSavingEvent(false);
      alert('Changes saved! Your event has been submitted for admin review.');
    } catch (err) {
      console.error('saveEvent error:', err);
      setSavingEvent(false);
      alert('Something went wrong: ' + (err.message || 'Please try again.'));
    }
  };

  useEffect(() => {
    if (!userEvents || userEvents.length === 0) { setLoadingApps(false); return; }
    const eventNames = userEvents.map(e => e.event_name);
    supabase.from('booking_requests').select('*')
      .in('event_name', eventNames).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setApplications(data); setLoadingApps(false); });
  }, [userEvents]);

  const handleReview = (app) => {
    const appId = String(app.id);
    // Toggle off if already reviewing this one
    if (String(reviewingApp) === appId) { setReviewingApp(null); setReviewVendor(null); setLoadingVendor(false); return; }
    // Open the panel immediately — set state synchronously, then fetch data in background
    setReviewingApp(appId);
    setReviewVendor(null);
    setLoadingVendor(true);
    // Fetch vendor profile in background — try vendor_id, then email, then name
    (async () => {
      try {
        let vd = null;
        if (app.vendor_id) {
          const { data } = await supabase.from('vendors').select('*').eq('id', app.vendor_id).single();
          vd = data;
        }
        if (!vd && app.host_email) {
          const { data } = await supabase.from('vendors').select('*').ilike('contact_email', app.host_email).limit(1);
          vd = data?.[0] || null;
        }
        if (!vd && app.vendor_name) {
          const { data } = await supabase.from('vendors').select('*').ilike('name', app.vendor_name).limit(1);
          vd = data?.[0] || null;
        }
        setReviewVendor(vd);
      } catch (err) {
        console.error('Review fetch error:', err);
      } finally {
        setLoadingVendor(false);
      }
    })();
  };

  const respond = async (reqId, status, reason) => {
    const app = applications.find(a => a.id === reqId);
    // Prevent accepting the same vendor to the same event twice
    if (status === 'accepted' && app) {
      const alreadyAccepted = applications.some(a2 => a2.id !== reqId && a2.vendor_id === app.vendor_id && a2.event_name === app.event_name && a2.status === 'accepted');
      if (alreadyAccepted) { alert(`${app.vendor_name} is already accepted for ${app.event_name}.`); return; }
    }
    const { error } = await supabase.from('booking_requests')
      .update({ status, responded_at: new Date().toISOString(), ...(reason ? { vendor_message: reason } : {}) }).eq('id', reqId);
    if (error) { alert('Failed to update. Try again.'); return; }
    setApplications(a => a.map(x => x.id === reqId ? { ...x, status } : x));
    if (status === 'accepted' || status === 'declined') {
      setShowDeclinePrompt(null); setDeclineReason('');
      // Send email notification to vendor
      let vendorEmail = app?.host_email; // In vendor applications, host_email is actually the vendor's email
      let vendorContactName = app?.vendor_name;
      if (app && app.vendor_id) {
        const { data: vendor } = await supabase.from('vendors').select('contact_email,contact_name').eq('id', app.vendor_id).single();
        if (vendor?.contact_email) { vendorEmail = vendor.contact_email; vendorContactName = vendor.contact_name || app.vendor_name; }
      }
      if (vendorEmail) {
        fetch('/api/send-booking-response', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostEmail: vendorEmail, hostName: vendorContactName || app?.vendor_name,
            vendorName: user.email, vendorCategory: app?.vendor_category,
            eventName: app?.event_name, eventDate: app?.event_date,
            status, vendorMessage: reason || '',
          }),
        }).catch(() => {});
      }
      // If accepted, load vendor profile to reveal contact info
      if (status === 'accepted' && app && app.vendor_id && !reviewVendor) {
        const { data } = await supabase.from('vendors').select('*').eq('id', app.vendor_id).single();
        if (data) { setReviewVendor(data); setReviewingApp(reqId); }
      }
      // Auto-close: check if all spots are now filled
      if (status === 'accepted' && app) {
        const evt = userEvents.find(e => e.event_name === app.event_name);
        if (evt && evt.spots) {
          const acceptedCount = applications.filter(a => a.event_name === app.event_name && (a.status === 'accepted' || (a.id === reqId && status === 'accepted'))).length;
          if (acceptedCount >= evt.spots) {
            // Mark event as fully booked
            await supabase.from('events').update({ vendor_status: 'fully_booked' }).eq('id', evt.id).catch(()=>{});
            if (setUserEvents) setUserEvents(prev => prev.map(e => e.id === evt.id ? { ...e, vendor_status: 'fully_booked' } : e));
            if (setAllEvents) setAllEvents(prev => prev.map(e => e.id === evt.id ? { ...e, vendorStatus: 'fully_booked' } : e));
            // Notify unaccepted vendors that event is full
            const unaccepted = applications.filter(a => a.event_name === app.event_name && a.status === 'pending' && a.id !== reqId);
            for (const ua of unaccepted) {
              if (ua.vendor_id) {
                const { data: vr } = await supabase.from('vendors').select('contact_email,contact_name').eq('id', ua.vendor_id).limit(1);
                if (vr?.[0]?.contact_email) {
                  fetch('/api/send-message-notification', { method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ recipientEmail: vr[0].contact_email, recipientName: vr[0].contact_name, senderName: 'South Jersey Vendor Market', senderType: 'host', eventName: app.event_name, messagePreview: `${app.event_name} is now fully booked. All vendor spots have been filled. Keep browsing events on South Jersey Vendor Market — new opportunities are posted regularly!` }),
                  }).catch(()=>{});
                }
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="section" style={{maxWidth:900}}>
      <div className="section-title">My Host Dashboard</div>
      <p className="section-sub">Welcome back, {user.email}</p>

      {/* ── Messages notification ── */}
      {unreadCount > 0 && (
        <button onClick={()=>{setTab('messages');window.scrollTo({top:0});}} style={{width:'100%',background:'#1a1410',border:'2px solid #e8c97a',borderRadius:10,padding:'14px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20}}>💬</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:14,color:'#e8c97a'}}>{unreadCount} unread message{unreadCount!==1?'s':''}</div>
              <div style={{fontSize:12,color:'#c8b898'}}>Tap to view and reply</div>
            </div>
          </div>
          <span style={{fontSize:18,color:'#e8c97a'}}>→</span>
        </button>
      )}

      {/* ── Vendor Applications (vendor-initiated) — need host action ── */}
      {applications.filter(a=>a.status==='pending'&&a.session_id==='vendor-application').length > 0 && (
        <div style={{background:'#fff',border:'2px solid #ffd966',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a1410',marginBottom:4}}>Vendors Requesting to Join Your Event</div>
          <div style={{fontSize:12,color:'#7a6a5a',marginBottom:12}}>{applications.filter(a=>a.status==='pending'&&a.session_id==='vendor-application').length} pending — accept or decline below</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {applications.filter(a=>a.status==='pending'&&a.session_id==='vendor-application').map(a=>(
              <div key={a.id} style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{a.vendor_name || 'Vendor'}</div>
                  <div style={{fontSize:12,color:'#7a6a5a'}}>For: {a.event_name} · {fmtDate(a.event_date)}</div>
                  <div style={{fontSize:11,color:'#a89a8a'}}>{a.vendor_category}</div>
                  {a.notes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:2,fontStyle:'italic'}}>"{a.notes}"</div>}
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <button onClick={()=>respond(a.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept</button>
                  <button onClick={async()=>{const reason=window.prompt(`Decline ${a.vendor_name}? Enter an optional message (sent to vendor):`);if(reason===null)return;await supabase.from('booking_requests').update({status:'declined',vendor_message:reason||'Declined by host',responded_at:new Date().toISOString()}).eq('id',a.id);setApplications(prev=>prev.map(x=>x.id===a.id?{...x,status:'declined'}:x));if(a.vendor_id){const{data:vr}=await supabase.from('vendors').select('contact_email,contact_name').eq('id',a.vendor_id).limit(1);if(vr?.[0]?.contact_email){fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:vr[0].contact_email,recipientName:vr[0].contact_name,senderName:user.email,senderType:'host',eventName:a.event_name,messagePreview:`Your application for ${a.event_name} was declined.${reason?' Message from host: '+reason:''} Keep browsing events on South Jersey Vendor Market!`})}).catch(()=>{});}}}} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline</button>
                  {openMessage && a.vendor_id && <button onClick={()=>openMessage({id:a.vendor_id,name:a.vendor_name,emoji:'',category:a.vendor_category})} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Message</button>}
                  {a.vendor_id && <button onClick={()=>openVendorProfile(a.vendor_id)} style={{background:'#fff',color:'#1a1410',border:'1px solid #c8a850',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>View Profile</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Host-Sent Invites (host-initiated) — awaiting vendor response ── */}
      {applications.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application').length > 0 && (
        <div style={{background:'#fff',border:'2px solid #b8d8f0',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:16,color:'#1a4a6b',marginBottom:4}}>Your Invites — Awaiting Vendor Response</div>
          <div style={{fontSize:12,color:'#7a6a5a',marginBottom:12}}>{applications.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application').length} invite{applications.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application').length!==1?'s':''} sent — waiting for vendors to respond</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {applications.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application').map(a=>(
              <div key={a.id} style={{background:'#f0f7fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{a.vendor_name || 'Vendor'}</div>
                  <div style={{fontSize:12,color:'#7a6a5a'}}>Invited to: {a.event_name} · {fmtDate(a.event_date)}</div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{background:'#e8f4fd',color:'#1a4a6b',padding:'4px 12px',borderRadius:10,fontSize:11,fontWeight:700}}>Awaiting Response</span>
                  {openMessage && a.vendor_id && <button onClick={()=>openMessage({id:a.vendor_id,name:a.vendor_name,emoji:'',category:a.vendor_category})} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Message</button>}
                  <button onClick={async()=>{if(!window.confirm(`Remove invite for ${a.vendor_name}?`))return;const delId=a.id;const{error:delErr}=await supabase.from('booking_requests').delete().eq('id',delId);if(delErr){console.error('Remove invite failed:',delErr);alert('Failed to remove invite. Please try again.');return;}setApplications(prev=>prev.filter(x=>String(x.id)!==String(delId)));}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Remove Invite</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending review banner — shown when ALL events are still pending */}
      {userEvents.length > 0 && !userEvents.some(e => e.status === 'approved' || e.status === 'concierge_active') && userEvents.some(e => e.status === 'pending_review' || e.status === 'concierge_pending') && (
        <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:10,padding:'20px 24px',marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:16,color:'#7a5a10',marginBottom:6}}>Your event is being reviewed</div>
          <p style={{fontSize:14,color:'#7a5a10',lineHeight:1.6,margin:0}}>Our team is reviewing your submission and will approve it within 24 hours. Once live, you'll be able to browse vendors, receive applications, and start booking. We'll notify you by email when it's approved.</p>
        </div>
      )}

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:16}}>My Events</h3>
      {userEvents.length === 0 ? (
        <div className="empty-state"><div className="big">📅</div><p>No events posted yet. <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:'inherit',fontFamily:'inherit'}} onClick={()=>setTab('host')}>Add your first event</button></p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
          {userEvents.map(e => (
            <div key={e.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{e.event_name}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>{e.event_type} · {fmtDate(e.date)} · Zip {e.zip}</div>
                  <div style={{fontSize:12,color:'#a89a8a',marginTop:4}}>{(() => { const accepted = applications.filter(a=>a.event_name===e.event_name&&a.status==='accepted').length; const total = e.spots||0; return `${total-accepted} of ${total} spots open`; })()}{e.source==='Recurring Series' ? ' · 🔄 Recurring Series' : ''}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <button onClick={()=>setViewingEvent(viewingEvent===e.id?null:e.id)} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{viewingEvent===e.id?'Hide':'View'}</button>
                  <button onClick={()=>{setViewingEvent(null);editingEvent===e.id?setEditingEvent(null):startEditEvent(e);}} style={{background:'none',border:'1px solid #c8a850',color:'#c8a850',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{editingEvent===e.id?'Cancel':'Edit'}</button>
                  {e.status==='approved' && <button onClick={()=>{if(setHostEventFromDashboard)setHostEventFromDashboard(e);setTab('matches');window.scrollTo({top:0});}} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Find Vendors</button>}
                  <span style={{
                    padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap',
                    background: e.status==='approved' ? '#d4f4e0' : e.status==='rejected' ? '#fdecea' : e.status==='concierge_active' ? '#d4f4e0' : '#fdf4dc',
                    color: e.status==='approved' ? '#1a6b3a' : e.status==='rejected' ? '#8b1a1a' : e.status==='concierge_active' ? '#1a6b3a' : '#7a5a10',
                  }}>
                    {e.status==='approved' || e.status==='concierge_active' ? 'Live' : e.status==='rejected' ? 'Not Approved' : e.status==='pending_review' || e.status==='concierge_pending' ? 'Pending Review' : 'Live'}
                  </span>
                  {e.vendor_status === 'fully_booked' && <span style={{padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,background:'#1a1410',color:'#e8c97a',whiteSpace:'nowrap'}}>Fully Booked</span>}
                  {e.vendor_status === 'closed' && <span style={{padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,background:'#f5f0ea',color:'#7a6a5a',whiteSpace:'nowrap'}}>Applications Closed</span>}
                  {e.status==='approved' && e.vendor_discovery !== 'closed' && (
                    <button onClick={async()=>{if(!window.confirm('Close applications? Vendors will no longer see or apply to this event.'))return;const{error}=await supabase.from('events').update({vendor_discovery:'closed'}).eq('id',e.id);if(error)console.error('Close failed:',error.message);if(setUserEvents)setUserEvents(prev=>prev.map(x=>x.id===e.id?{...x,vendor_discovery:'closed'}:x));if(setAllEvents)setAllEvents(prev=>prev.map(x=>x.id===e.id?{...x,vendorDiscovery:'closed'}:x));if(setOpps)setOpps(prev=>prev.filter(x=>x.id!==e.id));fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:e.contact_email||user.email,recipientName:e.contact_name,senderName:'South Jersey Vendor Market',senderType:'host',eventName:e.event_name,messagePreview:`Applications for ${e.event_name} have been closed. Vendors can no longer apply. You can reopen applications anytime from your dashboard.`})}).catch(()=>{});}} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close Applications</button>
                  )}
                  {e.status==='approved' && e.vendor_discovery === 'closed' && (
                    <>
                      <span style={{padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,background:'#f5f0ea',color:'#7a6a5a',whiteSpace:'nowrap'}}>Applications Closed</span>
                      <button onClick={async()=>{const{error}=await supabase.from('events').update({vendor_discovery:'both'}).eq('id',e.id);if(error)console.error('Reopen failed:',error.message);if(setUserEvents)setUserEvents(prev=>prev.map(x=>x.id===e.id?{...x,vendor_discovery:'both'}:x));if(setAllEvents)setAllEvents(prev=>prev.map(x=>x.id===e.id?{...x,vendorDiscovery:'both'}:x));if(setOpps)setOpps(prev=>[dbEventToApp({...e,vendor_discovery:'both'}),...prev]);fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:e.contact_email||user.email,recipientName:e.contact_name,senderName:'South Jersey Vendor Market',senderType:'host',eventName:e.event_name,messagePreview:`Applications for ${e.event_name} have been reopened. Vendors can now see and apply to your event.`})}).catch(()=>{});}} style={{background:'#d4f4e0',color:'#1a6b3a',border:'none',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Reopen Applications</button>
                    </>
                  )}
                  <button onClick={()=>{
                    // Detect recurring series: match by event_name (multiple events with same name = series)
                    const sameNameEvents = userEvents.filter(ue=>ue.event_name===e.event_name).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
                    const seriesEvents = sameNameEvents.length > 1 ? sameNameEvents : null;
                    if (seriesEvents) {
                      setCancelEventModal({event:e, seriesEvents});
                    } else {
                      // Single event — simple confirm and delete
                      (async()=>{
                        const hasVendors = applications.some(a=>a.event_name===e.event_name&&(a.status==='accepted'||a.status==='pending'));
                        if (hasVendors) { const reason=window.prompt('This event has vendors. Enter a reason for cancellation:'); if(reason===null)return; await deleteEvents([e],reason); }
                        else { if(!window.confirm('Delete this event? This cannot be undone.'))return; await deleteEvents([e]); }
                      })();
                    }
                  }} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel Event</button>
                </div>
              </div>
              {e.status==='rejected' && e.rejection_reason && (
                <div style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:6,padding:'8px 12px',marginTop:8,fontSize:12,color:'#8b1a1a'}}>
                  <strong>Reason:</strong> {e.rejection_reason}
                </div>
              )}
              {/* Vendor activity for this event */}
              {e.status === 'approved' && (
                <div style={{marginTop:8}}>
                  {(() => {
                    const eventApps = applications.filter(a=>a.event_name===e.event_name);
                    const applied = eventApps.filter(a=>a.status==='pending'&&a.session_id==='vendor-application');
                    const invitesPending = eventApps.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application');
                    const confirmed = eventApps.filter(a=>a.status==='accepted');
                    const cats = [
                      {key:'confirmed',label:'Confirmed',items:confirmed,bg:'#d4f4e0',color:'#1a6b3a',border:'#b8e8c8'},
                      {key:'invites',label:'Pending Invites',items:invitesPending,bg:'#e8f4fd',color:'#1a4a6b',border:'#b8d8f0'},
                      {key:'applied',label:'Applied',items:applied,bg:'#fdf4dc',color:'#7a5a10',border:'#ffd966'},
                    ];
                    return (
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {cats.map(c=>(
                          <span key={c.key} onClick={c.items.length>0?()=>setExpandedVendorList(prev=>prev===e.id+'_'+c.key?null:e.id+'_'+c.key):undefined}
                            style={{background:c.bg,color:c.color,border:'1px solid '+c.border,padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,cursor:c.items.length>0?'pointer':'default',opacity:c.items.length===0?0.6:1}}>
                            {c.label}: {c.items.length}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  {(() => {
                    const eventApps = applications.filter(a=>a.event_name===e.event_name);
                    const lists = {
                      [e.id+'_confirmed']: eventApps.filter(a=>a.status==='accepted'),
                      [e.id+'_invites']: eventApps.filter(a=>a.status==='pending'&&a.session_id!=='vendor-application'),
                      [e.id+'_applied']: eventApps.filter(a=>a.status==='pending'&&a.session_id==='vendor-application'),
                    };
                    const items = lists[expandedVendorList];
                    if (!items || items.length === 0) return null;
                    return (
                      <div style={{marginTop:6,background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 12px'}}>
                        {items.map(a=>(
                          <div key={a.id} style={{fontSize:12,color:'#1a1410',padding:'3px 0',display:'flex',justifyContent:'space-between'}}>
                            <span>{a.vendor_name||'Unknown vendor'}</span>
                            <span style={{fontSize:11,color:'#a89a8a'}}>{a.vendor_category||''}{a.event_date?' · '+fmtDate(a.event_date):''}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              {viewingEvent===e.id && !editingEvent && (
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e8ddd0'}}>
                  {(e.event_photos||[]).length > 0 && (
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                      {e.event_photos.map((url,i)=><img key={i} src={url} alt={`Event photo ${i+1}`} style={{width:90,height:90,objectFit:'cover',borderRadius:6,border:'1px solid #e8ddd0'}} />)}
                    </div>
                  )}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px',fontSize:13,marginBottom:12}}>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Type:</span> {e.event_type}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Date:</span> {fmtDate(e.date)}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Time:</span> {e.start_time ? fmtTime(e.start_time) : '—'}{e.end_time ? ' – '+fmtTime(e.end_time) : ''}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Location:</span> Zip {e.zip}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Event Fee:</span> {e.booth_fee||'—'}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Spots:</span> {e.spots||0}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Ticketed:</span> {e.is_ticketed ? `Yes — ${e.ticket_price||'TBD'}` : 'Free'}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Deadline:</span> {e.deadline ? fmtDate(e.deadline) : '—'}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Duplicates (Cat):</span> {e.allow_duplicate_categories!==false ? 'Allowed' : 'One per category'}</div>
                    <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Duplicates (Sub):</span> {e.allow_duplicate_subcategories!==false ? 'Allowed' : 'One per specialty'}</div>
                  </div>
                  {e.notes && <div style={{fontSize:13,color:'#7a6a5a',marginBottom:10,padding:'8px 10px',background:'#fdf9f5',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{e.notes}</div>}
                  {e.event_link && <div style={{marginBottom:8}}><a href={e.event_link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b'}}>🔗 Event Page</a></div>}
                  <div style={{fontSize:11,color:'#a89a8a'}}>This is how your event appears to vendors.</div>
                </div>
              )}
              {editingEvent===e.id && (
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e8ddd0'}}>
                  <div className="form-grid" style={{gap:10,marginBottom:12}}>
                    <div className="form-group"><label>Event Name</label><input value={eventForm.event_name} onChange={ev=>eSet('event_name',ev.target.value)} /></div>
                    <div className="form-group"><label>Event Type</label><select value={eventForm.event_type} onChange={ev=>eSet('event_type',ev.target.value)}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Date</label><input type="date" value={eventForm.date} onChange={ev=>eSet('date',ev.target.value)} /></div>
                    <div className="form-group"><label>Zip Code</label><input value={eventForm.zip} onChange={ev=>eSet('zip',ev.target.value.replace(/\D/g,'').slice(0,5))} maxLength={5} /></div>
                    <div className="form-group"><label>Start Time</label><input type="time" value={eventForm.start_time} onChange={ev=>eSet('start_time',ev.target.value)} /></div>
                    <div className="form-group"><label>End Time</label><input type="time" value={eventForm.end_time} onChange={ev=>eSet('end_time',ev.target.value)} /></div>
                    <div className="form-group"><label>Event Fee</label><input value={eventForm.booth_fee} onChange={ev=>eSet('booth_fee',ev.target.value)} placeholder="e.g. $50/vendor" /></div>
                    <div className="form-group"><label>Vendor Spots</label><input type="number" value={eventForm.spots} onChange={ev=>eSet('spots',+ev.target.value)} /></div>
                    <div className="form-group"><label>Apply By Date</label><input type="date" value={eventForm.deadline} onChange={ev=>eSet('deadline',ev.target.value)} /></div>
                    <div className="form-group"><label>Event Website / Facebook Link</label><input value={eventForm.event_link} onChange={ev=>eSet('event_link',ev.target.value)} placeholder="https://..." /></div>
                    <div className="form-group"><label>Ticketed Event</label><select value={eventForm.is_ticketed?'yes':'no'} onChange={ev=>eSet('is_ticketed',ev.target.value==='yes')}><option value="no">No — Free admission</option><option value="yes">Yes — Ticketed</option></select></div>
                    {eventForm.is_ticketed && <div className="form-group"><label>Ticket Price</label><input value={eventForm.ticket_price} onChange={ev=>eSet('ticket_price',ev.target.value)} placeholder="e.g. $10" /></div>}
                    <div className="form-group"><label>Duplicate Vendors (Category)</label><select value={eventForm.allow_duplicate_categories?'yes':'no'} onChange={ev=>eSet('allow_duplicate_categories',ev.target.value==='yes')}><option value="yes">Allow multiple per category</option><option value="no">One per category only</option></select></div>
                    <div className="form-group"><label>Duplicate Vendors (Subcategory)</label><select value={eventForm.allow_duplicate_subcategories?'yes':'no'} onChange={ev=>eSet('allow_duplicate_subcategories',ev.target.value==='yes')}><option value="yes">Allow multiple per specialty</option><option value="no">One per specialty only</option></select></div>
                    <div className="form-group full">
                      <label>Event Description / Notes</label>
                      <textarea value={eventForm.notes} onChange={ev=>{if(ev.target.value.length<=500)eSet('notes',ev.target.value);}} style={{minHeight:70}} maxLength={500} />
                      <div style={{fontSize:11,color:(eventForm.notes||'').length>450?'#c0392b':'#a89a8a',textAlign:'right',marginTop:2}}>{(eventForm.notes||'').length}/500</div>
                    </div>
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

      {/* ── Confirmed Vendor Lineup ── */}
      {applications.filter(a=>a.status==='accepted').length > 0 && (
        <div style={{background:'#fff',border:'2px solid #b8e8c8',borderRadius:10,padding:'16px 20px',marginBottom:24}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:18,margin:'0 0 12px',color:'#1a6b3a'}}>Confirmed Vendor Lineup</h3>
          {userEvents.filter(e=>e.status==='approved').map(evt => {
            const confirmed = applications.filter(a=>a.status==='accepted'&&a.event_name===evt.event_name);
            if (confirmed.length === 0) return null;
            return (
              <div key={evt.id} style={{marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1a1410',marginBottom:6}}>{evt.event_name} — {fmtDate(evt.date)} <span style={{fontWeight:400,color:'#7a6a5a'}}>({confirmed.length} of {evt.spots||'?'} spots filled)</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {confirmed.map(a=>(
                    <span key={a.id} style={{background:'#d4f4e0',color:'#1a6b3a',padding:'4px 12px',borderRadius:16,fontSize:12,fontWeight:600}}>{a.vendor_name}{a.vendor_category ? ` · ${a.vendor_category}`:''}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── My Calendar ── */}
      <UnifiedDashboardCalendar authUser={user} vendorProfile={null} userEvents={userEvents} setTab={setTab} />

      {/* Contact & Feedback */}
      <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:10,padding:'16px 20px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{fontSize:13,color:'#7a6a5a'}}>Need help? Have questions about your events?</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowFeedbackModal(true)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Give Feedback</button>
          <button onClick={()=>setShowContactModal(true)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Contact Us</button>
        </div>
      </div>

      {/* Account management */}
      <div style={{borderTop:'1px solid #e8ddd0',paddingTop:20,marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:700,color:'#a89a8a',letterSpacing:1,textTransform:'uppercase',marginBottom:12}}>Account Management</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={async()=>{if(!window.confirm('Delete your host account? This removes ALL events, vendor applications, messages, and your login. This cannot be undone.'))return;if(!window.confirm('Are you absolutely sure? This is permanent.'))return;for(const evt of userEvents){await supabase.from('booking_requests').delete().eq('event_name',evt.event_name).catch(()=>{});await supabase.from('events').delete().eq('id',evt.id).catch(()=>{});}await supabase.from('messages').delete().or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).catch(()=>{});await supabase.from('event_goers').delete().eq('email',user.email).catch(()=>{});await supabase.auth.signOut();window.location.reload();}} style={{background:'none',border:'1px solid #e0d5c5',color:'#8b1a1a',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Delete Entire Account</button>
        </div>
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:8}}>Vendor Applications & Responses</h3>
      <div style={{fontSize:12,color:'#7a6a5a',marginBottom:16,lineHeight:1.5}}>Before accepting a vendor, confirm their insurance coverage, business licenses, and any details important to your event. All contracts and payments are handled directly between you and the vendor.</div>
      {loadingApps ? <div style={{color:'#a89a8a',padding:20}}>Loading...</div>
      : applications.length === 0 ? (
        <div className="empty-state"><div className="big">📭</div><p>No vendor applications yet.</p><p style={{fontSize:13,color:'#a89a8a',maxWidth:400,margin:'8px auto 0'}}>Applications appear here when vendors find your event in the directory and apply. You can also <button style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',textDecoration:'underline',fontSize:13,fontFamily:'inherit'}} onClick={()=>setTab('matches')}>browse and invite vendors</button> directly.</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {applications.map(a => {
            const isReviewing = String(reviewingApp) === String(a.id);
            const v = isReviewing ? reviewVendor : null;
            const m = v ? (v.metadata || {}) : {};
            const isService = m.vendorType === 'service' || m.vendorType === 'both' || m.isServiceProvider;
            const isMarket = !m.vendorType || m.vendorType === 'market' || m.vendorType === 'both';
            return (
            <div key={a.id} style={{background:'#fff',border: isReviewing ? '2px solid #c8a84b' : '1px solid #e8ddd0',borderRadius:10,padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{a.vendor_name || 'Vendor'}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>For: {a.event_name} · {fmtDate(a.event_date)}</div>
                  <div style={{fontSize:12,color:'#a89a8a'}}>{a.vendor_category}</div>
                  {a.notes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4,fontStyle:'italic'}}>"{a.notes}"</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  {(a.status === 'pending' || a.status === 'reviewing') && (
                    <>
                      <button onClick={()=>respond(a.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept</button>
                      <button onClick={()=>{setShowDeclinePrompt(a.id);setDeclineReason('');}} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline</button>
                    </>
                  )}
                  {a.status === 'cancelled' && <span style={{background:'#f5f0ea',color:'#7a6a5a',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:600}}>Cancelled</span>}
                  {a.status === 'withdrawn' && <span style={{background:'#f5f0ea',color:'#7a6a5a',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:600}}>Withdrawn</span>}
                  {(a.status === 'accepted' || a.status === 'declined') && (
                    <span style={{background:a.status==='accepted'?'#d4f4e0':'#fdecea',color:a.status==='accepted'?'#1a6b3a':'#8b1a1a',padding:'4px 10px',borderRadius:10,fontSize:11,fontWeight:600}}>{a.status}</span>
                  )}
                  {a.status === 'accepted' && (
                    <button onClick={async()=>{const reason=window.prompt('Reason for removing this vendor (sent to vendor):');if(reason===null)return;await supabase.from('booking_requests').update({status:'removed',vendor_message:reason||'Removed by host'}).eq('id',a.id);setApplications(prev=>prev.map(x=>x.id===a.id?{...x,status:'removed'}:x));if(a.vendor_id){const{data:vr}=await supabase.from('vendors').select('contact_email,contact_name').eq('id',a.vendor_id).limit(1);if(vr?.[0]?.contact_email){fetch('/api/send-message-notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientEmail:vr[0].contact_email,recipientName:vr[0].contact_name,senderName:user.email,senderType:'host',eventName:a.event_name,messagePreview:`You have been removed from ${a.event_name}.${reason?' Reason: '+reason:''} Browse other events on South Jersey Vendor Market.`})}).catch(()=>{});}}}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Remove Vendor</button>
                  )}
                  {openMessage && a.vendor_id && (
                    <button onClick={()=>openMessage({id:a.vendor_id,name:a.vendor_name,emoji:'',category:a.vendor_category})} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Message</button>
                  )}
                  <button onClick={()=>handleReview(a)} style={{background: isReviewing ? '#c8a84b' : '#fdf4dc',color: isReviewing ? '#1a1410' : '#7a5a10',border: isReviewing ? 'none' : '1px solid #ffd966',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{isReviewing ? 'Close' : 'Review'}</button>
                </div>
              </div>

              {/* Decline reason prompt */}
              {showDeclinePrompt === a.id && (
                <div style={{marginTop:12,padding:14,background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:8}}>
                  <div style={{fontSize:14,fontWeight:700,color:'#8b1a1a',marginBottom:4}}>Decline {a.vendor_name}?</div>
                  <div style={{fontSize:12,color:'#7a6a5a',marginBottom:8}}>Let the vendor know why so they can improve for future events. This will be sent to them.</div>
                  <textarea value={declineReason} onChange={e=>setDeclineReason(e.target.value)} placeholder="e.g. We already have a vendor in this category, but we'd love to have you at a future event!" style={{width:'100%',minHeight:70,border:'1px solid #f5c6c6',borderRadius:6,padding:10,fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'vertical',boxSizing:'border-box'}} maxLength={500} />
                  <div style={{fontSize:11,color:'#a89a8a',marginTop:4,marginBottom:8}}>{declineReason.length}/500 characters</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>respond(a.id,'declined',declineReason)} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline Vendor</button>
                    <button onClick={()=>setShowDeclinePrompt(null)} style={{background:'#fff',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Vendor profile panel */}
              {isReviewing && (
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e8ddd0'}}>
                  {loadingVendor ? (
                    <div style={{color:'#a89a8a',padding:20,textAlign:'center',fontSize:13}}>Loading vendor profile...</div>
                  ) : !v ? (
                    <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:16,textAlign:'center'}}>
                      <div style={{fontSize:13,color:'#7a6a5a',marginBottom:8}}>Full vendor profile not available.</div>
                      {a.notes && <div style={{fontSize:13,color:'#1a1410',padding:'8px 10px',background:'#fff',borderRadius:6,borderLeft:'3px solid #e8c97a',textAlign:'left',marginBottom:8}}>{a.notes}</div>}
                      <div style={{fontSize:12,color:'#a89a8a'}}>Vendor: {a.vendor_name} · Category: {a.vendor_category || '—'}{a.host_email ? ` · Email: ${a.host_email}` : ''}</div>
                    </div>
                  ) : (
                    <div>
                      {/* Vendor header */}
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        {(m.photoUrls||[])[0] && <img src={m.photoUrls[0]} alt={v.name} style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:'1px solid #e8ddd0'}} />}
                        <div>
                          <div style={{fontWeight:700,fontSize:16,color:'#1a1410'}}>{v.name}</div>
                          <div style={{fontSize:13,color:'#7a6a5a'}}>{v.contact_name}</div>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:2}}>
                            {isService && <span style={{display:'inline-block',background:'#1a1410',color:'#e8c97a',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700}}>Service Provider</span>}
                            {isMarket && <span style={{display:'inline-block',background:'#f5f0ea',color:'#7a6a5a',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700}}>Market Vendor</span>}
                          </div>
                        </div>
                      </div>

                      {/* Application message */}
                      {a.notes && (
                        <div style={{fontSize:13,color:'#1a1410',lineHeight:1.6,marginBottom:12,padding:'8px 10px',background:'#fdf4dc',borderRadius:6,borderLeft:'3px solid #ffd966'}}>
                          <div style={{fontSize:11,fontWeight:600,color:'#7a5a10',marginBottom:4}}>Vendor's Message:</div>
                          {a.notes}
                        </div>
                      )}

                      {/* Description */}
                      {(v.description || m.description) && <div style={{fontSize:13,color:'#7a6a5a',lineHeight:1.6,marginBottom:12,padding:'8px 10px',background:'#fdf9f5',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{v.description || m.description}</div>}

                      {/* Photos */}
                      {(m.photoUrls || []).length > 0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#a89a8a',marginBottom:6}}>Photos</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            {m.photoUrls.map((url,i) => <img key={i} src={url} alt={`${v.name} photo ${i+1}`} style={{width:80,height:80,objectFit:'cover',borderRadius:6,border:'1px solid #e8ddd0'}} />)}
                          </div>
                        </div>
                      )}

                      {/* Categories & details */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px',fontSize:13,marginBottom:12}}>
                        {isMarket && v.category && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Category:</span> {v.category}</div>}
                        {isMarket && (v.subcategories||[]).length > 0 && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Specialties:</span> {v.subcategories.join(', ')}</div>}
                        {isService && m.serviceCategories && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Services:</span> {(Array.isArray(m.serviceCategories) ? m.serviceCategories : [m.serviceCategories]).join(', ')}</div>}
                        {isService && m.serviceSubcategories && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Service Types:</span> {(Array.isArray(m.serviceSubcategories) ? m.serviceSubcategories : [m.serviceSubcategories]).join(', ')}</div>}
                        <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Location:</span> Zip {v.home_zip} ({v.radius || 20}mi radius)</div>
                        {(v.tags||[]).length > 0 && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Tags:</span> {v.tags.join(', ')}</div>}
                        {m.priceRange && <div><span style={{color:'#a89a8a',fontSize:11,fontWeight:600}}>Pricing:</span> {m.priceRange}</div>}
                      </div>

                      {/* Service provider details */}
                      {isService && (m.serviceRateMin || m.serviceDescription || m.equipmentNotes || m.availabilityNotes || m.minBookingDuration) && (
                        <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:8,padding:12,marginBottom:12}}>
                          <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:8}}>Service Details</div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 16px',fontSize:12}}>
                            {(m.serviceRateMin || m.serviceRateMax) && <div><span style={{color:'#a89a8a',fontWeight:600}}>Rate:</span> {m.serviceRateType==='hourly'?'Hourly':'Fixed'} ${m.serviceRateMin||'—'}{m.serviceRateMax ? '–$'+m.serviceRateMax : ''}</div>}
                            {m.minBookingDuration && <div><span style={{color:'#a89a8a',fontWeight:600}}>Min Duration:</span> {m.minBookingDuration}</div>}
                            {m.bookingLeadTime && <div><span style={{color:'#a89a8a',fontWeight:600}}>Lead Time:</span> {m.bookingLeadTime}</div>}
                          </div>
                          {m.serviceDescription && <div style={{fontSize:12,color:'#7a6a5a',marginTop:6}}>{m.serviceDescription}</div>}
                          {m.equipmentNotes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}><strong>Equipment:</strong> {m.equipmentNotes}</div>}
                          {m.availabilityNotes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}><strong>Availability:</strong> {m.availabilityNotes}</div>}
                        </div>
                      )}

                      {/* Social links & website */}
                      {(v.website || m.website || v.instagram || m.instagram || m.facebook || m.tiktok) && (
                        <div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:12,marginBottom:12}}>
                          {(v.website||m.website) && <a href={v.website||m.website} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b'}}>Website</a>}
                          {(v.instagram||m.instagram) && <a href={`https://instagram.com/${(v.instagram||m.instagram).replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b'}}>Instagram</a>}
                          {m.facebook && <a href={m.facebook} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b'}}>Facebook</a>}
                          {m.tiktok && <a href={`https://tiktok.com/@${m.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{color:'#1a4a6b'}}>TikTok</a>}
                        </div>
                      )}

                      {/* Contact info — only shown if accepted */}
                      {a.status === 'accepted' && (
                        <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:8,padding:12,marginBottom:12}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1a6b3a',marginBottom:6}}>Contact Information</div>
                          <div style={{fontSize:13,color:'#1a1410'}}>{v.contact_name} · <a href={`mailto:${v.contact_email}`} style={{color:'#1a4a6b'}}>{v.contact_email}</a>{v.contact_phone ? ` · ${v.contact_phone}` : ''}</div>
                        </div>
                      )}

                      {/* Action buttons while reviewing */}
                      {(a.status === 'pending' || a.status === 'reviewing') && (
                        <div style={{display:'flex',gap:8,marginTop:8}}>
                          <button onClick={()=>respond(a.id,'accepted')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Accept Vendor</button>
                          <button onClick={()=>{setShowDeclinePrompt(a.id);setDeclineReason('');}} style={{background:'#8b1a1a',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Decline Vendor</button>
                          <button onClick={()=>{setReviewingApp(null);setReviewVendor(null);}} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Close</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Cancel Recurring Event Modal */}
      {cancelEventModal && <CancelSeriesModal cancelEventModal={cancelEventModal} setCancelEventModal={setCancelEventModal} applications={applications} deleteEvents={deleteEvents} />}

      {/* Vendor Profile Modal */}
      {profileModalVendor && <VendorProfileModal v={profileModalVendor} onClose={()=>setProfileModalVendor(null)} openMessage={openMessage} setTab={setTab} />}
    </div>
  );
}

// ─── Cancel Recurring Series Modal ──────────────────────────────────────────────
function CancelSeriesModal({ cancelEventModal, setCancelEventModal, applications, deleteEvents }) {
  const { event: cancelEvt, seriesEvents } = cancelEventModal;
  const [selectedIds, setSelectedIds] = useState(seriesEvents.map(s=>s.id));
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const toggle = (id) => setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const hasVendors = seriesEvents.some(s=>applications.some(a=>a.event_name===s.event_name&&a.event_date===s.date&&(a.status==='accepted'||a.status==='pending')));

  const handleCancel = async (ids) => {
    setDeleting(true);
    const eventsToDelete = seriesEvents.filter(s=>ids.includes(s.id));
    await deleteEvents(eventsToDelete, reason||undefined);
    setDeleting(false);
    setCancelEventModal(null);
  };

  return (
    <div onClick={()=>setCancelEventModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:480,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{background:'#1a1410',padding:'20px 24px',borderRadius:'16px 16px 0 0'}}>
          <div style={{fontSize:14,color:'#a89a8a'}}>Cancel Recurring Event</div>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>{cancelEvt.event_name}</div>
          <div style={{fontSize:13,color:'#c8a850',marginTop:4}}>{seriesEvents.length} dates in this series</div>
        </div>
        <div style={{padding:'20px 24px'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#1a1410',marginBottom:10}}>Select dates to cancel:</div>
          <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:16}}>
            {seriesEvents.map(s=>{
              const evtApps = applications.filter(a=>a.event_name===s.event_name&&a.event_date===s.date&&(a.status==='accepted'||a.status==='pending'));
              return (
                <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',padding:'6px 0',fontWeight:selectedIds.includes(s.id)?600:400,color:'#1a1410'}}>
                  <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={()=>toggle(s.id)} style={{width:16,height:16}} />
                  <span>{fmtDate(s.date)}</span>
                  {evtApps.length>0 && <span style={{fontSize:11,color:'#8b1a1a',fontWeight:600}}>({evtApps.length} vendor{evtApps.length!==1?'s':''})</span>}
                </label>
              );
            })}
          </div>
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            <button onClick={()=>setSelectedIds(seriesEvents.map(s=>s.id))} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:4,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Select All</button>
            <button onClick={()=>setSelectedIds([])} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:4,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Clear All</button>
          </div>
          {hasVendors && (
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,fontWeight:600,color:'#8b1a1a',display:'block',marginBottom:4}}>Reason for cancellation (vendors will be notified)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Optional: let vendors know why..." rows={2} style={{width:'100%',borderRadius:8,border:'1px solid #e0d5c5',padding:'8px 12px',fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'vertical'}} />
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <button disabled={selectedIds.length===0||deleting} onClick={()=>handleCancel(selectedIds)} style={{flex:2,background:selectedIds.length>0?'#8b1a1a':'#e8ddd0',color:selectedIds.length>0?'#fff':'#a89a8a',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:selectedIds.length>0?'pointer':'default',fontFamily:'DM Sans,sans-serif'}}>
              {deleting ? 'Cancelling...' : selectedIds.length===seriesEvents.length ? `Cancel Entire Series (${seriesEvents.length} dates)` : `Cancel ${selectedIds.length} Date${selectedIds.length!==1?'s':''}`}
            </button>
            <button onClick={()=>setCancelEventModal(null)} disabled={deleting} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Keep Events</button>
          </div>
        </div>
      </div>
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

  // Filter events matching preferences (type + distance)
  const guestZipOk = form.zip && form.zip.length === 5 && isKnownZip(form.zip);
  const matched = opps.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    if (o.date < today) return false;
    if (o.shareWithEventGoers === false) return false;
    if (form.eventTypes.length > 0 && !form.eventTypes.includes(o.eventType)) return false;
    if (guestZipOk && form.radius) {
      const dist = distanceMiles(form.zip, o.zip);
      if (dist !== null && dist > form.radius) return false;
    }
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

      {/* Saved events */}
      {(() => { try { const saved = JSON.parse(localStorage.getItem('sjvm_saved_events')||'[]'); const savedOpps = opps.filter(o=>saved.includes(o.id)&&o.date>=new Date().toISOString().split('T')[0]); return savedOpps.length > 0 ? (
        <div style={{marginBottom:24}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:20,marginBottom:12}}>My Saved Events ({savedOpps.length})</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {savedOpps.map(o=>(
              <div key={o.id} style={{background:'#fdf9f0',border:'1px solid #ffd966',borderRadius:10,padding:'12px 16px'}}>
                <div style={{fontWeight:700,fontSize:14,color:'#1a1410'}}>{o.eventName}</div>
                <div style={{fontSize:12,color:'#7a6a5a'}}>{o.eventType} · {fmtDate(o.date)} · {getCityFromZip(o.zip)||'Zip '+o.zip}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null; } catch { return null; } })()}

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

      {/* Account management */}
      <div style={{borderTop:'1px solid #e8ddd0',paddingTop:20,marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:700,color:'#a89a8a',letterSpacing:1,textTransform:'uppercase',marginBottom:12}}>Account Management</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={async()=>{if(!window.confirm('Stop receiving event alerts? You can always sign up again later.'))return;await supabase.from('event_goers').update({active:false,email_frequency:'none'}).eq('id',profile.id);alert('Event alerts cancelled. You will no longer receive emails.');window.location.reload();}} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Stop Event Alerts</button>
          <button onClick={async()=>{if(!window.confirm('Delete your account and all data? This cannot be undone.'))return;if(!window.confirm('Are you absolutely sure?'))return;await supabase.from('event_goers').delete().eq('id',profile.id).catch(()=>{});await supabase.auth.signOut();window.location.reload();}} style={{background:'none',border:'1px solid #e0d5c5',color:'#8b1a1a',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Delete Entire Account</button>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Profile Modal ─────────────────────────────────────────────────────
function VendorProfileModal({ v, onClose, bookingAccepted, sendBookingRequest, hostEvent, bookingRequests, openMessage, setTab, matchPct }) {
  const req = bookingRequests && bookingRequests.find(r => r.vendorId === v.id && (!hostEvent?.eventId || r.eventId === hostEvent.eventId || r.eventName === hostEvent?.eventName));
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
              {matchPct != null && <div style={{background:'#1a1410',color:'#e8c97a',borderRadius:8,padding:'8px 14px',fontSize:14,fontWeight:700}}>{matchPct}% match</div>}
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
                📋 Invite to {hostEvent?.eventName || 'My Event'}
              </button>
            )}
            {req && (
              <div style={{
                padding:'10px 16px', borderRadius:8, fontSize:13, fontWeight:600,
                background: req.status==='accepted'?'#d4f4e0':req.status==='declined'?'#fdecea':'#fdf4dc',
                color: req.status==='accepted'?'#1a6b3a':req.status==='declined'?'#8b1a1a':'#7a5a10',
                border: '1px solid '+(req.status==='accepted'?'#b8e8c8':req.status==='declined'?'#f5c6c6':'#ffd966')
              }}>
                {req.status==='pending' && `⏳ Invite Pending for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='accepted' && `✅ Accepted for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='declined' && `❌ Declined for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='withdrawn' && '↩ Withdrawn'}
              </div>
            )}
            {req && req.status==='pending' && (
              <button onClick={async()=>{if(!window.confirm('Withdraw this invite?'))return;const{error:delErr}=await supabase.from('booking_requests').delete().eq('id',req.id);if(delErr){console.error('Withdraw invite failed:',delErr);alert('Failed to withdraw invite. Please try again.');return;}onClose();}}
                style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Withdraw Invite</button>
            )}
            {openMessage && (
              <button onClick={()=>{openMessage(v); onClose();}}
                style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                💬 Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteDatePickerModal({ vendor, series, hostEvent, sendBookingRequest, onClose }) {
  const [selected, setSelected] = useState(series.map(s=>s.id));
  const [sending, setSending] = useState(false);
  const toggle = (id) => setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:460,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{background:'#1a1410',padding:'20px 24px',borderRadius:'16px 16px 0 0'}}>
          <div style={{fontSize:14,color:'#a89a8a'}}>Invite to Recurring Series</div>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>{vendor.name}</div>
          <div style={{fontSize:13,color:'#c8a850',marginTop:4}}>{hostEvent?.eventName} — {series.length} dates</div>
        </div>
        <div style={{padding:'20px 24px'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#1a1410',marginBottom:10}}>Select dates to invite this vendor:</div>
          <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:16}}>
            {series.map(s=>(
              <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',padding:'6px 0',textTransform:'none',letterSpacing:0,fontWeight:selected.includes(s.id)?600:400,color:'#1a1410'}}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)} style={{width:16,height:16}} />
                {fmtDate(s.date)}
              </label>
            ))}
          </div>
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            <button onClick={()=>setSelected(series.map(s=>s.id))} style={{background:'#1a4a6b',color:'#fff',border:'none',borderRadius:4,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Select All</button>
            <button onClick={()=>setSelected([])} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:4,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Clear All</button>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button disabled={selected.length===0||sending} onClick={async()=>{
              setSending(true);
              for(const s of series.filter(s=>selected.includes(s.id))){
                const {data:existing}=await supabase.from('booking_requests').select('id').eq('vendor_id',vendor.id).eq('event_name',s.event_name).eq('event_date',s.date).limit(1);
                if(existing?.[0])continue;
                await sendBookingRequest(vendor,{...hostEvent,date:s.date,eventId:s.id});
              }
              setSending(false);
              onClose();
              alert(`Invited ${vendor.name} to ${selected.length} date${selected.length!==1?'s':''}.`);
            }} style={{flex:2,background:selected.length>0?'#c8a84b':'#e8ddd0',color:selected.length>0?'#1a1410':'#a89a8a',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:selected.length>0?'pointer':'default',fontFamily:'DM Sans,sans-serif'}}>{sending?'Sending...':` Invite to ${selected.length} Date${selected.length!==1?'s':''}`}</button>
            <button onClick={onClose} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
function VendorCard({ v, contacted, setContacted, showDist, outOfRange, openMessage, sendBookingRequest, bookingRequests, setBookingRequests, hostEvent, setTab, vendorCalendars, setVendorCalendars, authUser, setShowAuthModal, matchPct, setInquiryModal, setEventMessageModal, userEvents }) {
  const [showProfile, setShowProfile] = useState(false);
  const [inviteDatePicker, setInviteDatePicker] = useState(null); // {vendor, series}
  const req = bookingRequests && bookingRequests.find(r => r.vendorId === v.id && (!hostEvent?.eventId || r.eventId === hostEvent.eventId || r.eventName === hostEvent?.eventName));
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
            {v.isServiceProvider && v.serviceCategories?.length > 0
              ? v.serviceCategories.join(', ')
              : (v.allCategories || [v.category]).length > 1
                ? `${v.category} +${(v.allCategories || [v.category]).length - 1} more`
                : v.category}
          </div>
          {v.isServiceProvider && <div style={{fontSize:11,color:'#c8a850',marginBottom:4}}>Service Provider</div>}
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
          <div className="match-score" style={{position:'absolute',top:10,right:10}}>{matchPct !== null && matchPct !== undefined ? `${matchPct}%` : `${v.matchScore}%`} match</div>
        </div>
      ) : (
        <div className="vendor-card-top">
          {v.emoji}
          <div className="match-score">{matchPct !== null && matchPct !== undefined ? `${matchPct}%` : `${v.matchScore}%`} match</div>
        </div>
      )}
      <div className="vendor-card-body">
        <div className="vendor-name">{v.name}</div>
        <div className="vendor-category">
          {v.isServiceProvider && v.serviceCategories?.length > 0
            ? v.serviceCategories.join(', ')
            : (v.allCategories || [v.category]).length > 1
              ? `${v.category} +${(v.allCategories || [v.category]).length - 1} more`
              : v.category}
        </div>
        {v.isServiceProvider && <div style={{fontSize:11,color:'#c8a850',marginBottom:4}}>Service Provider{v.serviceType ? ` · ${v.serviceType}` : ''}</div>}
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
                {req.status==='pending' && `⏳ Invite Pending for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='accepted' && `✅ Accepted for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='declined' && `❌ Declined for ${req.eventName || hostEvent?.eventName || 'Event'}`}
                {req.status==='cancelled' && '↩ Request Cancelled'}
                {req.status==='withdrawn' && '↩ Withdrawn'}
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                <button className="contact-btn" style={{background:'#c8a84b',color:'#1a1410',fontWeight:700,fontSize:13}} onClick={()=>{
                  if (hostEvent?.source === 'Recurring Series' && userEvents) {
                    const series = userEvents.filter(ue=>ue.event_name===hostEvent.eventName&&ue.status==='approved').sort((a,b)=>(a.date||'').localeCompare(b.date||''));
                    if (series.length > 1) { setInviteDatePicker({vendor:v, series}); return; }
                  }
                  sendBookingRequest(v, hostEvent);
                }}>
                  📋 Invite to {hostEvent?.eventName || 'My Event'}{hostEvent?.date ? ' — '+fmtDate(hostEvent.date) : ''}
                  {hostEvent?.source === 'Recurring Series' && userEvents && userEvents.filter(ue=>ue.event_name===hostEvent.eventName&&ue.status==='approved').length > 1 ? ' ▼' : ''}
                </button>
              </div>
            )
          )}
          {req && req.status==='pending' && (
            <button className="contact-btn" style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',fontSize:11,fontWeight:600}} onClick={async(e)=>{e.stopPropagation();if(!window.confirm('Withdraw this invite?'))return;const delId=req.id;const{error:delErr}=await supabase.from('booking_requests').delete().eq('id',delId);if(delErr){console.error('Withdraw invite failed:',delErr);alert('Failed to withdraw invite. Please try again.');return;}setBookingRequests(prev=>prev.filter(x=>String(x.id)!==String(delId)));}}>Withdraw Invite</button>
          )}
          {openMessage && authUser && (
            <button className="contact-btn" style={{background:'#1a1410',color:'#e8c97a',fontWeight:700,fontSize:13}} onClick={()=>hostEvent ? (setEventMessageModal && setEventMessageModal({vendor:v, eventName: hostEvent.eventName + (hostEvent.date ? ' — ' + fmtDate(hostEvent.date) : '')})) : (setInquiryModal && setInquiryModal({vendor:v}))}>
              💬 Message Vendor
            </button>
          )}
          {!authUser && (
            <button className="contact-btn" style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',fontWeight:600,fontSize:13}} onClick={()=>setShowAuthModal && setShowAuthModal(true)}>
              Log In to Message
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
        bookingRequests={bookingRequests} openMessage={openMessage} setTab={setTab} matchPct={matchPct} />
    )}
    {inviteDatePicker && (
      <InviteDatePickerModal
        vendor={inviteDatePicker.vendor}
        series={inviteDatePicker.series}
        hostEvent={hostEvent}
        sendBookingRequest={sendBookingRequest}
        onClose={()=>setInviteDatePicker(null)}
      />
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
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>setTab('my-calendar')} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
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
        {hostConfirm?.isPending
          ? ' Once your event is approved, you can invite these vendors.'
          : ' Send a booking request to any vendor below.'}
      </p>
      {hostConfirm?.isPending && (
        <div style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#7a5a10'}}>
          Your event is pending admin approval. Once approved, you will be able to see full vendor details and invite vendors to your event.
        </div>
      )}

      {matched.length === 0
        ? <div className="empty-state"><div className="big">🔍</div><p>No approved vendors match your categories yet — check back as more sign up!</p></div>
        : <div className="vendor-grid">
            {matched.map(v => (
              <VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} userEvents={[]} />
            ))}
          </div>
      }
    </div>
  );
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function MatchesPage({ vendors=[], openMessage, sendBookingRequest, bookingRequests, setBookingRequests, hostEvent, setHostEvent, userEvents, setTab, vendorCalendars, setVendorCalendars, authUser, setShowAuthModal, setInquiryModal, setEventMessageModal }) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInsurance, setFilterInsurance] = useState('');
  const [filterVendorType, setFilterVendorType] = useState('');
  const [filterService, setFilterService] = useState('');
  const [hostZip, setHostZip] = useState(hostEvent?.eventZip || '');
  const approvedEvents = (userEvents||[]).filter(e => e.status === 'approved' || e.status === 'concierge_active');
  const switchEvent = (e) => {
    const svcNeeded = (() => { try { return typeof e.services_needed === 'string' ? JSON.parse(e.services_needed) : (e.services_needed || []); } catch { return []; } })();
    setHostEvent({ eventName:e.event_name, eventType:e.event_type, eventZip:e.zip, date:e.date, startTime:e.start_time, endTime:e.end_time, contactName:e.contact_name, email:e.contact_email, vendorCategories:e.categories_needed||[], servicesNeeded:svcNeeded, vendorCount:e.spots, budget:e.booth_fee, notes:e.notes, eventId:e.id, source:e.source });
    setHostZip(e.zip || '');
  };
  const [contacted, setContacted] = useState([]);
  const hasZip = hostZip.length === 5 && isValidZip(hostZip);

  const enriched = vendors
    .filter(v => {
      if (!filterVendorType) return true;
      if (filterVendorType === 'market') return !v.isServiceProvider || v.vendorType?.market;
      if (filterVendorType === 'service') return v.isServiceProvider || v.vendorType?.service;
      return true;
    })
    .filter(v => {
      if (!filterCategory) return true;
      const allCats = [...(v.allCategories || [v.category]), ...(v.serviceCategories || [])];
      return allCats.includes(filterCategory);
    })
    .filter(v => !filterService || (v.serviceSubcategories||[]).includes(filterService) || v.serviceType === filterService)
    .filter(v => !filterInsurance || (filterInsurance==='yes' ? v.insurance : !v.insurance))
    .map(v => {
      const dist    = hasZip ? distanceMiles(v.homeZip, hostZip) : null;
      const inRange = !hasZip ? true : (dist === null ? true : dist <= v.radius);
      return { ...v, dist, inRange };
    });

  const inRange  = enriched.filter(v => v.inRange).sort((a,b)=>(a.dist??999)-(b.dist??999)||b.matchScore-a.matchScore);
  const outRange = enriched.filter(v => !v.inRange);

  // Calculate match percentage — how well does this vendor fit this event?
  // A vendor is 100% match if ALL of their categories are needed by the event.
  // A vendor is a partial match if some of their categories are needed.
  // neededCats includes both market vendor categories AND service categories from servicesNeeded
  const neededMarketCats = hostEvent?.vendorCategories || [];
  const neededServiceCats = (hostEvent?.servicesNeeded || []).map(s => s.type).filter(Boolean);
  const neededCats = [...neededMarketCats, ...neededServiceCats];
  const calcMatch = (v) => {
    if (neededCats.length === 0) return null;
    const vendorCats = [...(v.allCategories || [v.category]).filter(Boolean), ...(v.serviceCategories || [])];
    if (vendorCats.length === 0) return 0;
    const matched = vendorCats.filter(c => neededCats.includes(c)).length;
    return Math.round((matched / vendorCats.length) * 100);
  };

  return (
    <div className="section" style={{ maxWidth:1060 }}>
      <div className="section-title">{hostEvent ? `Vendors for ${hostEvent.eventName || 'Your Event'}` : 'Vendor Directory'}</div>
      <p className="section-sub">{hostEvent ? `Find and invite vendors to ${hostEvent.eventName || 'your event'} on ${hostEvent.date || ''}` : 'Browse all active South Jersey vendors. Enter your event zip code to see who can travel to you.'}</p>
      {/* Event picker — switch between approved events */}
      {approvedEvents.length > 0 && (
        <div style={{background:'#1a1410',borderRadius:10,padding:'12px 18px',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <label style={{fontSize:11,color:'#a89a8a',fontWeight:600,whiteSpace:'nowrap'}}>Finding vendors for:</label>
              {approvedEvents.length === 1 ? (
                <div style={{fontSize:13,color:'#e8c97a',fontWeight:700}}>{approvedEvents[0].event_name}</div>
              ) : (
                <select value={hostEvent?.eventId || ''} onChange={e=>{const ev=approvedEvents.find(x=>x.id===e.target.value); if(ev)switchEvent(ev);}}
                  style={{background:'#2d2118',color:'#e8c97a',border:'1px solid #c8a84b',borderRadius:6,padding:'4px 10px',fontSize:13,fontWeight:700,fontFamily:'DM Sans,sans-serif',cursor:'pointer'}}>
                  {!hostEvent?.eventId && <option value="">Select an event...</option>}
                  {approvedEvents.map(ev=><option key={ev.id} value={ev.id}>{ev.event_name} — {ev.date}</option>)}
                </select>
              )}
            </div>
            {hostEvent && (
              <div style={{fontSize:11,color:'#a89a8a'}}>{hostEvent.date} · {hostEvent.eventType} · Zip {hostEvent.eventZip}</div>
            )}
          </div>
          {neededCats.length > 0 && <div style={{fontSize:10,color:'#a89a8a',marginTop:6}}>Looking for: {neededCats.join(', ')}</div>}
        </div>
      )}
      <div className="match-filters">
        <div className="match-filter-group" style={{ maxWidth:200 }}>
          <label>{hostEvent ? 'Event Zip Code' : 'My Zip Code'}</label>
          <input placeholder="e.g. 08033" value={hostZip} maxLength={5} onChange={e=>setHostZip(e.target.value.replace(/\D/g,'').slice(0,5))} />
          {hasZip && <div className={`zip-feedback ${isKnownZip(hostZip)?'zip-ok':'zip-warn'}`}>{isKnownZip(hostZip)?'✓ Showing vendors in range':'⚠ Zip unverified — results may vary'}</div>}
          {!hostEvent && !hasZip && <div style={{fontSize:11,color:'#a89a8a',marginTop:2}}>Enter zip to filter by distance</div>}
        </div>
        <div className="match-filter-group">
          <label>Vendor Type</label>
          <select value={filterVendorType} onChange={e=>{setFilterVendorType(e.target.value);if(e.target.value==='market'){setFilterService('');}if(e.target.value==='service'){setFilterCategory('');}}}>
            <option value="">All Vendors</option>
            <option value="market">Market Vendors</option>
            <option value="service">Service Providers</option>
          </select>
        </div>
        {filterVendorType !== 'service' && (
          <div className="match-filter-group">
            <label>Product Category</label>
            <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        {filterVendorType !== 'market' && (
          <div className="match-filter-group">
            <label>Service Type</label>
            <select value={filterService} onChange={e=>setFilterService(e.target.value)}>
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.flatMap(cat=>(SERVICE_SUBCATEGORIES[cat]||[]).filter(s=>s!=='Other')).map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="match-filter-group">
          <label>Insurance</label>
          <select value={filterInsurance} onChange={e=>setFilterInsurance(e.target.value)}>
            <option value="">Any</option><option value="yes">Insured Only</option><option value="no">Not Required</option>
          </select>
        </div>
      </div>

      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#7a6a5a',lineHeight:1.5}}>
        Vendor profiles are self-reported. Before booking, verify insurance, licenses, and any information important to your event. All agreements and payments are between you and the vendor.
      </div>
      <div className="results-header">
        <div className="results-count"><strong>{inRange.length}</strong> {hasZip?'vendors within travel range':'vendors found'}</div>
        {hasZip && <div style={{ fontSize:13, color:'#7a6a5a' }}>Sorted nearest → farthest from {hostZip}</div>}
      </div>

      {inRange.length===0
        ? <div className="empty-state"><div className="big">🔍</div><p>No vendors match your filters.</p></div>
        : <div className="vendor-grid">{inRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist={hasZip} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} matchPct={calcMatch(v)} setInquiryModal={setInquiryModal} setEventMessageModal={setEventMessageModal} userEvents={userEvents} />)}</div>
      }

      {hasZip && outRange.length>0 && (
        <>
          <div style={{ marginTop:48, marginBottom:16, borderTop:'2px dashed #e0d5c5', paddingTop:32 }}>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:4 }}>Outside Travel Range</div>
            <p style={{ fontSize:14, color:'#a89a8a' }}>These vendors are beyond their stated travel radius for zip {hostZip}.</p>
          </div>
          <div className="vendor-grid" style={{ opacity:0.5 }}>
            {outRange.map(v=><VendorCard key={v.id} v={v} contacted={contacted} setContacted={setContacted} showDist outOfRange openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} hostEvent={hostEvent} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} userEvents={userEvents} />)}
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
      </div>
      <div style={{textAlign:'center',marginTop:24,padding:'16px 20px',background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:10}}>
        <p style={{fontSize:13,color:'#7a6a5a',lineHeight:1.6,margin:0}}>South Jersey Vendor Market is a matching and discovery platform. All event fees, service rates, and event contracts are negotiated and paid directly between vendors and hosts — not through this site.</p>
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
const ADMIN_PW = process.env.REACT_APP_ADMIN_PASSWORD;
if (!ADMIN_PW) console.error('REACT_APP_ADMIN_PASSWORD is not set — admin login will not work until this environment variable is configured.');

function AdminPage({ opps=[], setOpps=()=>{}, allEvents=[], setAllEvents=()=>{}, vendorSubs=[], vendors=[], setVendors=()=>{}, pendingVendors=[], setPendingVendors=()=>{}, isAdmin=false, eventGoers=[], setEventGoers=()=>{} }) {
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
          <PasswordInput value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}}
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
        }).catch(e=>console.error('API call failed:',e));
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
        }).catch(e=>console.error('API call failed:',e));
      }
    } else if (type === 'event_guest') {
      const g = eventGoers.find(x => x.id === id);
      const { error } = await supabase.from('event_goers').update({ active: false }).eq('id', id);
      if (error) { alert('Failed to remove event guest: ' + error.message); return; }
      setEventGoers(prev => prev.filter(x => x.id !== id));
      if (g?.email) {
        fetch('/api/send-approval-email', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to:g.email, name:g.name, type:'vendor', entityName:'Event Guest Account', approved:false, reason:'Your event guest account has been removed: '+removeReason }),
        }).catch(e=>console.error('API call failed:',e));
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
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminNoteText, setAdminNoteText] = useState({});
  const [adminMessageModal, setAdminMessageModal] = useState(null); // {to, name, type}
  const [adminMessageText, setAdminMessageText] = useState('');
  const [adminMessageSubject, setAdminMessageSubject] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [allApplications, setAllApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [editingAdminEntity, setEditingAdminEntity] = useState(null); // {type, id}
  const [adminEditForm, setAdminEditForm] = useState({});
  const [savingAdminEdit, setSavingAdminEdit] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [showAdminPostForm, setShowAdminPostForm] = useState(false);

  // Load all booking applications
  useEffect(() => {
    supabase.from('booking_requests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAllApplications(data); setLoadingApps(false); });
  }, []);

  const sendAdminMessage = async () => {
    if (!adminMessageText.trim() || !adminMessageModal) return;
    setSendingMessage(true);
    try {
      await fetch('/api/send-contact', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:'South Jersey Vendor Market', email:'tiffany@southjerseyvendormarket.com', subject: adminMessageSubject || `Message from South Jersey Vendor Market`, message: `Hi ${adminMessageModal.name},\n\n${adminMessageText}\n\n— South Jersey Vendor Market Team`, to: adminMessageModal.to }),
      });
      alert('Message sent to ' + adminMessageModal.to);
    } catch { alert('Failed to send. Try again.'); }
    setSendingMessage(false);
    setAdminMessageModal(null); setAdminMessageText(''); setAdminMessageSubject('');
  };

  const bulkApproveVendors = async () => {
    if (!window.confirm(`Approve all ${pendingVendors.length} pending vendors?`)) return;
    setBulkApproving(true);
    let succeeded = 0, failed = 0;
    const approved = [];
    for (const v of pendingVendors) {
      const { error } = await supabase.from('vendors').update({status:'approved'}).eq('id',v.id);
      if (error) { failed++; continue; }
      succeeded++;
      approved.push(v);
      fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:v.contact_email,name:v.contact_name,type:'vendor',entityName:v.name,approved:true})}).catch(e=>console.error('API call failed:',e));
    }
    setVendors(prev => [...approved.map(v=>dbVendorToApp({...v,status:'approved'})), ...prev]);
    setPendingVendors(prev => prev.filter(v => !approved.some(a=>a.id===v.id)));
    setBulkApproving(false);
    if (failed > 0) alert(`Approved ${succeeded}/${succeeded+failed} — ${failed} failed. Check and retry.`);
  };

  const bulkApproveEvents = async () => {
    if (!window.confirm(`Approve all ${pendingEvents.length} pending events?`)) return;
    setBulkApproving(true);
    let succeeded = 0, failed = 0;
    const approvedIds = [];
    for (const evt of pendingEvents) {
      const { error } = await supabase.from('events').update({status:'approved'}).eq('id',evt.id);
      if (error) { failed++; continue; }
      succeeded++;
      approvedIds.push(evt.id);
      fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:evt.contactEmail,name:evt.contactName,type:'event',entityName:evt.eventName,approved:true})}).catch(e=>console.error('API call failed:',e));
    }
    setAllEvents(prev => prev.map(e => approvedIds.includes(e.id) ? {...e, status:'approved'} : e));
    setOpps(prev => [...pendingEvents.filter(e=>approvedIds.includes(e.id)).map(e=>({...e,status:'approved'})), ...prev]);
    setBulkApproving(false);
    if (failed > 0) alert(`Approved ${succeeded}/${succeeded+failed} — ${failed} failed. Check and retry.`);
  };

  const saveAdminEdit = async () => {
    setSavingAdminEdit(true);
    const { type, id } = editingAdminEntity;
    if (type === 'vendor') {
      const v = vendors.find(x=>x.id===id) || pendingVendors.find(x=>x.id===id);
      const { error } = await supabase.from('vendors').update({ name: adminEditForm.name, contact_email: adminEditForm.contact_email, contact_name: adminEditForm.contact_name, home_zip: adminEditForm.home_zip, category: adminEditForm.category }).eq('id', id);
      if (error) { alert('Failed: ' + error.message); setSavingAdminEdit(false); return; }
      setVendors(prev => prev.map(x => x.id===id ? {...x, name:adminEditForm.name, contactEmail:adminEditForm.contact_email, contactName:adminEditForm.contact_name, homeZip:adminEditForm.home_zip, category:adminEditForm.category} : x));
    } else if (type === 'event') {
      const { error } = await supabase.from('events').update({ event_name: adminEditForm.event_name, date: adminEditForm.date, zip: adminEditForm.zip, event_type: adminEditForm.event_type, booth_fee: adminEditForm.booth_fee || null }).eq('id', id);
      if (error) { alert('Failed: ' + error.message); setSavingAdminEdit(false); return; }
      const updater = e => e.id===id ? {...e, eventName:adminEditForm.event_name, date:adminEditForm.date, zip:adminEditForm.zip, eventType:adminEditForm.event_type, boothFee:adminEditForm.booth_fee} : e;
      setAllEvents(prev => prev.map(updater));
      setOpps(prev => prev.map(updater));
    }
    setSavingAdminEdit(false);
    setEditingAdminEntity(null);
    alert('Saved.');
  };

  const saveAdminNote = async (entityType, entityId, entityName) => {
    const note = adminNoteText[`${entityType}_${entityId}`] || '';
    if (!note.trim()) return;
    await supabase.from('change_log').insert({ entity_type:entityType, entity_id:entityId, entity_name:entityName, changed_by:'admin', changes:{admin_note:note}, significant:false });
    if (entityType==='vendor') await supabase.from('vendors').update({ metadata: { ...(vendors.find(v=>v.id===entityId)||pendingVendors.find(v=>v.id===entityId))?.metadata, admin_notes: note } }).eq('id', entityId);
    if (entityType==='event') await supabase.from('events').update({ admin_notes: note }).eq('id', entityId);
    setAdminNoteText(n=>({...n,[`${entityType}_${entityId}`]:''}));
    alert('Note saved.');
  };

  // Search filter
  const searchLower = adminSearch.toLowerCase();
  const filteredVendors = vendors.filter(v => !searchLower || v.name?.toLowerCase().includes(searchLower) || v.contactEmail?.toLowerCase().includes(searchLower));
  const filteredPendingVendors = pendingVendors.filter(v => !searchLower || v.name?.toLowerCase().includes(searchLower) || v.contact_email?.toLowerCase().includes(searchLower));
  const filteredEvents = allEvents.filter(e => !searchLower || e.eventName?.toLowerCase().includes(searchLower) || e.contactEmail?.toLowerCase().includes(searchLower) || e.contactName?.toLowerCase().includes(searchLower));
  const filteredEventGoers = eventGoers.filter(g => !searchLower || g.name?.toLowerCase().includes(searchLower) || g.email?.toLowerCase().includes(searchLower));
  const filteredPendingEvents = pendingEvents.filter(e => !searchLower || e.eventName?.toLowerCase().includes(searchLower) || e.contactEmail?.toLowerCase().includes(searchLower) || e.contactName?.toLowerCase().includes(searchLower));
  const filteredOpps = opps.filter(e => !searchLower || e.eventName?.toLowerCase().includes(searchLower) || e.contactEmail?.toLowerCase().includes(searchLower));

  const approveEvent = async (evt) => {
    const notes = eventNotes[evt.id] || '';
    const updatePayload = { status: 'approved' };
    if (notes) updatePayload.admin_notes = notes;
    const { error } = await supabase.from('events').update(updatePayload).eq('id', evt.id);
    if (error) { alert('Failed to approve event: ' + error.message); return; }
    const updated = { ...evt, status: 'approved', adminNotes: notes };
    setAllEvents(prev => prev.map(e => e.id === evt.id ? updated : e));
    setOpps(prev => [updated, ...prev]);
    fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:evt.contactEmail,name:evt.contactName,type:'event',entityName:evt.eventName,approved:true})}).catch(e=>console.error('API call failed:',e));
  };

  const rejectEvent = async (evt) => {
    const reason = rejectReasons[evt.id] || '';
    if (!reason) { alert('Please provide a rejection reason.'); return; }
    const { error } = await supabase.from('events').update({ status: 'rejected', rejection_reason: reason, admin_notes: eventNotes[evt.id] || null }).eq('id', evt.id);
    if (error) { alert('Failed to reject event: ' + error.message); return; }
    setAllEvents(prev => prev.map(e => e.id === evt.id ? { ...e, status: 'rejected', rejectionReason: reason } : e));
    // Send rejection notification email
    fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:evt.contactEmail,name:evt.contactName,type:'event',entityName:evt.eventName,approved:false,reason})}).catch(e=>console.error('API call failed:',e));
  };

  const markConciergeActive = async (evt) => {
    const { error } = await supabase.from('events').update({ status: 'concierge_active' }).eq('id', evt.id);
    if (error) { alert('Failed to update: ' + error.message); return; }
    setAllEvents(prev => prev.map(e => e.id === evt.id ? { ...e, status: 'concierge_active' } : e));
    setOpps(prev => [{ ...evt, status: 'concierge_active' }, ...prev]);
  };

  const eventStatusPill = (status, vendorStatus) => {
    const styles = {
      pending_review:    { bg:'#fdf4dc', color:'#7a5a10', label:'Pending Review' },
      approved:          { bg:'#d4f4e0', color:'#1a6b3a', label:'Live' },
      rejected:          { bg:'#fdecea', color:'#8b1a1a', label:'Rejected' },
      cancelled:         { bg:'#f5f0ea', color:'#7a6a5a', label:'Cancelled' },
      concierge_pending: { bg:'#fdf4dc', color:'#7a5a10', label:'Pending Review' },
      concierge_active:  { bg:'#d4f4e0', color:'#1a6b3a', label:'Live' },
    };
    const s = styles[status] || styles.approved;
    const vendorStyles = { fully_booked: { bg:'#1a1410', color:'#e8c97a', label:'Fully Booked' }, closed: { bg:'#f5f0ea', color:'#7a6a5a', label:'Apps Closed' } };
    const vs = vendorStatus ? vendorStyles[vendorStatus] : null;
    return <>{<span style={{background:s.bg,color:s.color,padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{s.label}</span>}{vs && <span style={{background:vs.bg,color:vs.color,padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,whiteSpace:'nowrap',marginLeft:4}}>{vs.label}</span>}</>;
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
        <div className="admin-stat"><div className="admin-stat-num">{vendors.length}</div><div className="admin-stat-label">Approved Vendors</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{opps.length}</div><div className="admin-stat-label">Live Events</div></div>
        <div className="admin-stat"><div className="admin-stat-num" style={{color:'#1a6b3a'}}>{eventGoers.length}</div><div className="admin-stat-label">Event Guests</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{new Set(allEvents.map(e=>e.userId||e.contactEmail).filter(Boolean)).size}</div><div className="admin-stat-label">Unique Hosts</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{allApplications.length}</div><div className="admin-stat-label">Total Applications</div></div>
      </div>
      {/* Category breakdown */}
      <div style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,padding:'14px 16px',marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Top Vendor Categories</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {Object.entries(vendors.reduce((acc,v)=>{const c=v.category||'Other';acc[c]=(acc[c]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([cat,count])=>(
            <span key={cat} style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:16,padding:'3px 10px',fontSize:11,color:'#5a4a3a'}}>{cat} ({count})</span>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{marginBottom:24}}>
        <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Search vendors, events, or users by name or email..."
          style={{width:'100%',padding:'12px 16px',border:'2px solid #e8ddd0',borderRadius:10,fontSize:14,fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',outline:'none',background:'#fff'}} />
        {adminSearch && <div style={{fontSize:12,color:'#a89a8a',marginTop:4}}>Showing results for "{adminSearch}" — {filteredVendors.length + filteredPendingVendors.length} vendors, {filteredEvents.filter(e=>e.status!=='rejected').length} events, {filteredEventGoers.length} guests</div>}
      </div>

      {/* ── Pending Event Review ─────────────────────────────── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:40,marginBottom:16,flexWrap:'wrap',gap:8}}>
        <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, margin:0 }}>🔍 Events Pending Review ({pendingEvents.length})</h3>
        {pendingEvents.length > 1 && <button disabled={bulkApproving} onClick={bulkApproveEvents} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:bulkApproving?0.6:1}}>{bulkApproving?'Approving...':'Approve All Events'}</button>}
      </div>
      {pendingEvents.length===0
        ? <div className="empty-state"><div className="big">✅</div><p>No events awaiting review.</p></div>
        : <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {filteredPendingEvents.map(evt=>(
            <div key={evt.id} style={{background:'#fff',border:'2px solid #ffd966',borderRadius:12,overflow:'hidden'}}>
              <div style={{background:'#fdf9f0',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,cursor:'pointer'}} onClick={()=>setExpandedEvent(expandedEvent===evt.id?null:evt.id)}>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:'#1a1410'}}>{evt.eventName}</div>
                  <div style={{fontSize:13,color:'#7a6a5a'}}>{evt.eventType} · {fmtDate(evt.date)} · Zip {evt.zip}</div>
                  <div style={{fontSize:12,color:'#a89a8a',marginTop:2}}>Host: {evt.contactName} ({evt.contactEmail})</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {eventStatusPill(evt.status, evt.vendorStatus)}
                  <span style={{fontSize:18,color:'#a89a8a'}}>{expandedEvent===evt.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedEvent===evt.id && (
                <div style={{padding:'20px',borderTop:'1px solid #f0e8dc'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:16}}>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Time:</span> {fmtTime(evt.startTime)} – {fmtTime(evt.endTime)}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Event Fee:</span> {evt.boothFee || '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Spots:</span> {evt.spots}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Deadline:</span> {evt.deadline ? fmtDate(evt.deadline) : '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Phone:</span> {evt.contactPhone || '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Source:</span> {evt.source}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Ticketed:</span> {evt.isTicketed ? `Yes — ${evt.ticketPrice||'Price TBD'}` : 'No — Free admission'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Contact Email:</span> {evt.contactEmail || '—'}</div>
                    <div style={{gridColumn:'1/-1'}}><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Categories Needed:</span> {(evt.categoriesNeeded||[]).join(', ') || '—'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Same Category:</span> {evt.allowDuplicateCategories ? '✓ Multiple vendors OK' : '✗ One per category'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Same Subcategory:</span> {evt.allowDuplicateSubcategories ? '✓ Multiple OK' : '✗ One per specialty'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Vendor Discovery:</span> {evt.vendorDiscovery==='both'?'Browse + Apply':evt.vendorDiscovery==='browse'?'Browse Only':evt.vendorDiscovery==='apply'?'Applications Only':'Both'}</div>
                    <div><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Visible to Guests:</span> {evt.shareWithEventGoers===false ? 'No — vendors only' : 'Yes'}</div>
                    {(evt.vendorNotes || evt.notes) && <div style={{gridColumn:'1/-1',background:'#fdf9f5',borderRadius:6,padding:'8px 12px',borderLeft:'3px solid #e8c97a'}}><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Vendor Notes:</span><div style={{fontSize:13,color:'#1a1410',marginTop:4}}>{evt.vendorNotes || evt.notes}</div></div>}
                    {evt.eventGoerNotes && <div style={{gridColumn:'1/-1',background:'#fdf9f5',borderRadius:6,padding:'8px 12px',borderLeft:'3px solid #1a6b3a'}}><span style={{fontSize:11,color:'#a89a8a',fontWeight:600}}>Guest Notes:</span><div style={{fontSize:13,color:'#1a1410',marginTop:4}}>{evt.eventGoerNotes}</div></div>}
                  </div>
                  {/* Services Needed */}
                  {evt.servicesNeeded && evt.servicesNeeded.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:8}}>Services Needed ({evt.servicesNeeded.length})</div>
                      {evt.servicesNeeded.map((svc,i)=>(
                        <div key={i} style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 12px',marginBottom:6,fontSize:13}}>
                          <strong>{svc.type||'Service'}{svc.subType && svc.subType!=='Other' ? ` — ${svc.subType}` : ''}{svc.otherType ? ` — ${svc.otherType}`:''}</strong>
                          <span style={{color:'#7a6a5a'}}> · {svc.duration}{svc.otherDuration ? ` (${svc.otherDuration})`:''}</span>
                          <span style={{color:'#7a6a5a'}}> · Budget: {svc.budgetType==='open'?'Open to quotes':svc.budgetType==='fixed'?(svc.budgetAmount||'TBD'):`${svc.budgetMin||'?'} – ${svc.budgetMax||'?'}`}</span>
                          {svc.notes && <div style={{fontSize:12,color:'#a89a8a',marginTop:2,fontStyle:'italic'}}>{svc.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Event photos */}
                  {((evt.eventPhotos && evt.eventPhotos.length > 0) || evt.photoUrl) && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#1a1410',marginBottom:8}}>Event Photos ({(evt.eventPhotos||[]).length || (evt.photoUrl ? 1 : 0)})</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {(evt.eventPhotos && evt.eventPhotos.length > 0 ? evt.eventPhotos : evt.photoUrl ? [evt.photoUrl] : []).map((url,i)=>(
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
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:40,marginBottom:16,flexWrap:'wrap',gap:8}}>
        <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, margin:0 }}>🔍 Pending Vendor Applications ({pendingVendors.length})</h3>
        {pendingVendors.length > 1 && <button disabled={bulkApproving} onClick={bulkApproveVendors} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:bulkApproving?0.6:1}}>{bulkApproving?'Approving...':'Approve All Vendors'}</button>}
      </div>
      {pendingVendors.length===0
        ? <div className="empty-state"><div className="big">✅</div><p>No pending vendor submissions.</p></div>
        : <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {filteredPendingVendors.map(v=>(
              <PendingVendorCard key={v.id} v={v}
                onApprove={async()=>{
                  const{error}=await supabase.from('vendors').update({status:'approved'}).eq('id',v.id);
                  if(error){alert('Error approving vendor. Please try again.');return;}
                  setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                  setVendors(prev=>[dbVendorToApp({...v,status:'approved'}), ...prev]);
                  fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:v.contact_email,name:v.contact_name,type:'vendor',entityName:v.name,approved:true})}).catch(e=>console.error('API call failed:',e));
                }}
                onReject={async()=>{
                  const reason = window.prompt(`Reject "${v.name}"? Enter a reason (sent to vendor):`);
                  if(!reason) return;
                  const{error}=await supabase.from('vendors').update({status:'rejected'}).eq('id',v.id);
                  if(error){alert('Error rejecting vendor. Please try again.');return;}
                  setPendingVendors(p=>p.filter(x=>x.id!==v.id));
                  fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:v.contact_email,name:v.contact_name,type:'vendor',entityName:v.name,approved:false,reason})}).catch(e=>console.error('API call failed:',e));
                }}
              />
            ))}
          </div>
      }


      <div style={{marginTop:40,marginBottom:16}}>
        <button onClick={()=>setShowAdminPostForm(s=>!s)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
          {showAdminPostForm ? 'Hide Post Form ▲' : '+ Post New Opportunity ▼'}
        </button>
      </div>
      {showAdminPostForm && <AdminPostForm onPost={async opp => {
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
      }} />}

      {/* ── Live Events ──────────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Live Events ({opps.length})</h3>
      {opps.length===0
        ? <div className="empty-state"><div className="big">&#128221;</div><p>No live events yet.</p></div>
        : <div style={{overflowX:'auto'}}><table className="admin-table">
            <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Location</th><th>Host</th><th>Spots</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredOpps.map(o=>(
                <tr key={o.id}>
                  <td><strong>{o.eventName}</strong>{o.eventLink && <a href={o.eventLink} target="_blank" rel="noopener noreferrer" style={{marginLeft:6,fontSize:11,color:'#1a4a6b'}}>🔗</a>}{o.shareWithEventGoers===false && <span style={{marginLeft:4,fontSize:9,color:'#7a5a10',background:'#fdf4dc',padding:'1px 5px',borderRadius:4}}>Private</span>}</td>
                  <td style={{fontSize:12}}>{o.eventType}</td>
                  <td style={{fontSize:12,whiteSpace:'nowrap'}}>{fmtDate(o.date)}</td>
                  <td style={{fontSize:12}}>Zip {o.zip}</td>
                  <td style={{fontSize:12}}>{o.contactName}<br/><span style={{color:'#a89a8a',fontSize:10}}>{o.contactEmail}</span></td>
                  <td>{o.spots||'—'}</td>
                  <td style={{fontSize:12}}>{o.boothFee||'Free'}</td>
                  <td>{eventStatusPill(o.status, o.vendorStatus)}</td>
                  <td style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    <button onClick={()=>{setAdminEditForm({event_name:o.eventName,date:o.date,zip:o.zip,event_type:o.eventType,booth_fee:o.boothFee||''});setEditingAdminEntity({type:'event',id:o.id});}} style={{background:'#e8f4fd',color:'#1a4a6b',border:'1px solid #b8d8f0',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Edit</button>
                    {o.contactEmail && <button onClick={()=>{setAdminMessageModal({to:o.contactEmail,name:o.contactName||o.eventName,type:'host'});setAdminMessageSubject('');setAdminMessageText('');}} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Msg</button>}
                    <button onClick={()=>setRemoveDialog({type:'event',id:o.id,name:o.eventName})} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
      }

      {/* ── Approved Vendors ────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Approved Vendors ({vendors.length})</h3>
      {vendors.length===0
        ? <div className="empty-state"><div className="big">🛍️</div><p>No approved vendors yet.</p></div>
        : <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filteredVendors.map(v=>{
              const photos = v.photoUrls || [];
              const m = v.metadata || {};
              const isExpanded = expandedVendor === v.id;
              return (
              <div key={v.id} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:10,overflow:'hidden'}}>
                <div style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:200}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>{v.name}{v.foundingVendor && <span style={{marginLeft:6,background:'#c8a850',color:'#1a1410',padding:'1px 6px',borderRadius:8,fontSize:9,fontWeight:700}}>FOUNDING</span>}{v.isServiceProvider && <span style={{marginLeft:6,background:'#1a1410',color:'#e8c97a',padding:'1px 6px',borderRadius:8,fontSize:9,fontWeight:700}}>SERVICE</span>}</div>
                      <div style={{fontSize:12,color:'#7a6a5a'}}>{v.isServiceProvider ? (v.serviceCategories||[]).join(', ') : v.category} · {v.homeZip} · {v.contactEmail}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <button onClick={()=>setExpandedVendor(isExpanded?null:v.id)} style={{background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>{isExpanded?'▾ Close':'▸ View'}</button>
                    <button onClick={()=>{setAdminEditForm({name:v.name,contact_email:v.contactEmail,contact_name:v.contactName,home_zip:v.homeZip,category:v.category});setEditingAdminEntity({type:'vendor',id:v.id});}} style={{background:'#e8f4fd',color:'#1a4a6b',border:'1px solid #b8d8f0',borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Edit</button>
                    <button onClick={()=>{setAdminMessageModal({to:v.contactEmail,name:v.contactName||v.name,type:'vendor'});setAdminMessageSubject('');setAdminMessageText('');}} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Message</button>
                    <button onClick={async()=>{const nv=!v.foundingVendor;const{error}=await supabase.from('vendors').update({founding_vendor:nv}).eq('id',v.id);if(error){alert('Failed');return;}setVendors(p=>p.map(x=>x.id===v.id?{...x,foundingVendor:nv}:x));}} style={{background:v.foundingVendor?'#c8a850':'#fff',color:v.foundingVendor?'#1a1410':'#7a6a5a',border:`1px solid ${v.foundingVendor?'#c8a850':'#e8ddd0'}`,borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>{v.foundingVendor?'✓ Founding':'Mark Founding'}</button>
                    <button onClick={()=>setRemoveDialog({type:'vendor',id:v.id,name:v.name})} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Remove</button>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{borderTop:'1px solid #e8ddd0',padding:'16px',background:'#faf8f5'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px 20px',marginBottom:12,fontSize:13}}>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Contact:</span> {v.contactName||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Phone:</span> {v.contactPhone||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Email:</span> {v.contactEmail||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Zip:</span> {v.homeZip}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Radius:</span> {v.radius}mi</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Insurance:</span> {v.insurance?'✓ Yes':'No'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Years:</span> {v.yearsActive||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Setup Time:</span> {v.setupTime ? v.setupTime+' min' : '—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Table/Space:</span> {v.tableSize||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Electric:</span> {v.needsElectric?'Yes':'No'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Response Time:</span> {v.responseTime||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Booking Lead:</span> {v.bookingLeadTime||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Event Frequency:</span> {v.eventFrequency||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Max Event Fee:</span> {v.price||'—'}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Categories:</span> {(v.allCategories||[v.category]).join(', ')}</div>
                      <div><span style={{color:'#a89a8a',fontWeight:600,fontSize:11}}>Subcategories:</span> {(v.subcategories||[]).join(', ')||'—'}</div>
                    </div>
                    {v.description && <div style={{fontSize:13,color:'#7a6a5a',marginBottom:12,padding:'8px 10px',background:'#fff',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{v.description}</div>}
                    {/* Links */}
                    {[{l:'🌐 Website',u:v.website},{l:'📸 Instagram',u:v.instagram},{l:'👤 Facebook',u:v.facebook},{l:'🎵 TikTok',u:v.tiktok},{l:'▶️ YouTube',u:v.youtube},{l:'🔗 Other',u:v.otherSocial}].filter(x=>x.u).length > 0 && (
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',marginBottom:6}}>LINKS</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                          {[{l:'🌐 Website',u:v.website},{l:'📸 Instagram',u:v.instagram},{l:'👤 Facebook',u:v.facebook},{l:'🎵 TikTok',u:v.tiktok},{l:'▶️ YouTube',u:v.youtube},{l:'🔗 Other',u:v.otherSocial}].filter(x=>x.u).map(x=>(
                            <a key={x.l} href={x.u.startsWith('http')?x.u:'https://'+x.u} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b',textDecoration:'none',background:'#e8f4fd',padding:'4px 10px',borderRadius:6}}>{x.l}</a>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Service provider details */}
                    {v.isServiceProvider && (
                      <div style={{marginBottom:12,background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,padding:'10px 14px'}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#c8a850',marginBottom:8}}>SERVICE PROVIDER DETAILS</div>
                        <div style={{fontSize:13,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 16px'}}>
                          <div><span style={{color:'#a89a8a',fontSize:11}}>Type:</span> {v.serviceType||'—'}</div>
                          <div><span style={{color:'#a89a8a',fontSize:11}}>Rate:</span> {v.serviceRateType==='quote'?'Quote based':v.serviceRateType==='range'?`${v.serviceRateMin} – ${v.serviceRateMax}`:v.serviceRateMin||'—'}</div>
                          <div><span style={{color:'#a89a8a',fontSize:11}}>Min Duration:</span> {v.minBookingDuration||'—'}</div>
                          <div><span style={{color:'#a89a8a',fontSize:11}}>Booking Lead:</span> {v.bookingLeadTime||'—'}</div>
                          <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontSize:11}}>Service Categories:</span> {(v.serviceCategories||[]).join(', ')||'—'}</div>
                          <div style={{gridColumn:'1/-1'}}><span style={{color:'#a89a8a',fontSize:11}}>Subcategories:</span> {(v.serviceSubcategories||[]).join(', ')||'—'}</div>
                        </div>
                        {v.serviceDescription && <div style={{fontSize:12,color:'#7a6a5a',marginTop:6}}><strong>What's included:</strong> {v.serviceDescription}</div>}
                        {v.availabilityNotes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}><strong>Availability:</strong> {v.availabilityNotes}</div>}
                        {v.equipmentNotes && <div style={{fontSize:12,color:'#7a6a5a',marginTop:4}}><strong>Equipment:</strong> {v.equipmentNotes}</div>}
                      </div>
                    )}
                    {/* Photos */}
                    {photos.length > 0 && (
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',marginBottom:6}}>PHOTOS ({photos.length})</div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          {photos.map((url,i)=>(
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={`Photo ${i+1}`} style={{width:100,height:100,objectFit:'cover',borderRadius:6,border:'1px solid #e0d5c5'}} /></a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:8}}>
                      {v.lookbookUrl && <a href={v.lookbookUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b',background:'#e8f4fd',padding:'4px 10px',borderRadius:6,textDecoration:'none'}}>📋 Lookbook/Menu</a>}
                      {(m.coiUrl || v.coiUrl) && <a href={m.coiUrl || v.coiUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a6b3a',background:'#d4f4e0',padding:'4px 10px',borderRadius:6,textDecoration:'none'}}>📄 Certificate of Insurance</a>}
                    </div>
                    {/* Admin Notes */}
                    <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e8ddd0'}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#a89a8a',marginBottom:4}}>ADMIN NOTE (internal only)</div>
                      <div style={{display:'flex',gap:8}}>
                        <input value={adminNoteText[`vendor_${v.id}`]||''} onChange={e=>setAdminNoteText(n=>({...n,[`vendor_${v.id}`]:e.target.value}))} placeholder="Add a note about this vendor..." style={{flex:1,border:'1px solid #e0d5c5',borderRadius:6,padding:'6px 10px',fontSize:12,fontFamily:'DM Sans,sans-serif'}} />
                        <button onClick={()=>saveAdminNote('vendor',v.id,v.name)} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'6px 14px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Save Note</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
      }

      {/* ── Event Guests ────────────────────────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>Event Guests ({eventGoers.length})</h3>
      {eventGoers.length===0
        ? <div className="empty-state"><div className="big">📬</div><p>No event guests signed up yet.</p></div>
        : <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Zip</th><th>Radius</th><th>Event Types</th><th>Frequency</th><th>Signed Up</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredEventGoers.map(eg=>(
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

      {/* ── Booking Applications Overview ──────────────────── */}
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>📋 Vendor Applications ({allApplications.length})</h3>
      {loadingApps ? <div style={{color:'#a89a8a',padding:20}}>Loading...</div>
      : allApplications.length === 0
        ? <div className="empty-state"><div className="big">📭</div><p>No vendor applications yet.</p></div>
        : <div style={{maxHeight:400,overflowY:'auto',border:'1px solid #e8ddd0',borderRadius:10}}>
            <table className="admin-table">
              <thead><tr><th>Vendor</th><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {allApplications.slice(0,100).map(a=>(
                  <tr key={a.id} style={{background:a.status==='pending'?'#fdf9f0':undefined}}>
                    <td><strong>{a.vendor_name||'—'}</strong><br/><span style={{fontSize:11,color:'#a89a8a'}}>{a.vendor_category||''}</span></td>
                    <td>{a.event_name||'—'}</td>
                    <td style={{fontSize:12}}>{a.event_date ? fmtDate(a.event_date) : '—'}</td>
                    <td><span style={{background:a.status==='accepted'?'#d4f4e0':a.status==='declined'?'#fdecea':'#fdf4dc',color:a.status==='accepted'?'#1a6b3a':a.status==='declined'?'#8b1a1a':'#7a5a10',padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700}}>{a.status}</span></td>
                    <td>
                      {a.host_email && <button onClick={()=>{setAdminMessageModal({to:a.host_email,name:a.vendor_name||'Vendor',type:'vendor'});setAdminMessageSubject(`Re: ${a.event_name||'Event'} Application`);setAdminMessageText('');}} style={{background:'#fff',color:'#1a1410',border:'1px solid #e8ddd0',borderRadius:4,padding:'2px 8px',fontSize:10,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Message</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {/* ── Rejected Events ─────────────────────────────────── */}
      {allEvents.filter(e=>e.status==='rejected').length > 0 && (
        <>
          <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, marginBottom:16, marginTop:40 }}>❌ Rejected Events ({allEvents.filter(e=>e.status==='rejected').length})</h3>
          <table className="admin-table">
            <thead><tr><th>Event</th><th>Host</th><th>Date</th><th>Reason</th><th>Actions</th></tr></thead>
            <tbody>
              {allEvents.filter(e=>e.status==='rejected').map(e=>(
                <tr key={e.id}>
                  <td><strong>{e.eventName}</strong></td>
                  <td style={{fontSize:12}}>{e.contactName}<br/><span style={{color:'#a89a8a'}}>{e.contactEmail}</span></td>
                  <td style={{fontSize:12}}>{fmtDate(e.date)}</td>
                  <td style={{fontSize:12,color:'#8b1a1a',maxWidth:200}}>{e.rejectionReason||'—'}</td>
                  <td>
                    <button onClick={async()=>{const{error}=await supabase.from('events').update({status:'approved',rejection_reason:null}).eq('id',e.id);if(error){alert('Error');return;}setAllEvents(prev=>prev.map(x=>x.id===e.id?{...x,status:'approved',rejectionReason:null}:x));setOpps(prev=>[{...e,status:'approved'},...prev]);fetch('/api/send-approval-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:e.contactEmail,name:e.contactName,type:'event',entityName:e.eventName,approved:true})}).catch(e=>console.error('API call failed:',e));}} style={{background:'#1a6b3a',color:'#fff',border:'none',borderRadius:4,padding:'3px 10px',fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600}}>Re-approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Admin Message Modal ────────────────────────────── */}
      {adminMessageModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:12,maxWidth:480,width:'100%',padding:'24px 28px'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:18,marginBottom:4}}>Send Message</div>
            <div style={{fontSize:13,color:'#7a6a5a',marginBottom:16}}>To: <strong>{adminMessageModal.name}</strong> ({adminMessageModal.to})</div>
            <div className="form-group" style={{marginBottom:12}}>
              <label>Subject</label>
              <input value={adminMessageSubject} onChange={e=>setAdminMessageSubject(e.target.value)} placeholder="Message from South Jersey Vendor Market" />
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label>Message</label>
              <textarea value={adminMessageText} onChange={e=>setAdminMessageText(e.target.value)} placeholder="Type your message..." style={{minHeight:100}} />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button disabled={sendingMessage||!adminMessageText.trim()} onClick={sendAdminMessage} style={{flex:1,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'10px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:sendingMessage?0.6:1}}>{sendingMessage?'Sending...':'Send'}</button>
              <button onClick={()=>setAdminMessageModal(null)} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Edit Modal ───────────────────────────────── */}
      {editingAdminEntity && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:12,maxWidth:480,width:'100%',padding:'24px 28px'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:18,marginBottom:16}}>Edit {editingAdminEntity.type === 'vendor' ? 'Vendor' : 'Event'}</div>
            <div className="form-grid" style={{gap:10,marginBottom:16}}>
              {editingAdminEntity.type === 'vendor' ? (<>
                <div className="form-group"><label>Business Name</label><input value={adminEditForm.name||''} onChange={e=>setAdminEditForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="form-group"><label>Contact Name</label><input value={adminEditForm.contact_name||''} onChange={e=>setAdminEditForm(f=>({...f,contact_name:e.target.value}))} /></div>
                <div className="form-group"><label>Email</label><input value={adminEditForm.contact_email||''} onChange={e=>setAdminEditForm(f=>({...f,contact_email:e.target.value}))} /></div>
                <div className="form-group"><label>Home Zip</label><input value={adminEditForm.home_zip||''} onChange={e=>setAdminEditForm(f=>({...f,home_zip:e.target.value}))} maxLength={5} /></div>
                <div className="form-group full"><label>Primary Category</label><input value={adminEditForm.category||''} onChange={e=>setAdminEditForm(f=>({...f,category:e.target.value}))} /></div>
              </>) : (<>
                <div className="form-group"><label>Event Name</label><input value={adminEditForm.event_name||''} onChange={e=>setAdminEditForm(f=>({...f,event_name:e.target.value}))} /></div>
                <div className="form-group"><label>Event Type</label><select value={adminEditForm.event_type||''} onChange={e=>setAdminEditForm(f=>({...f,event_type:e.target.value}))}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>Date</label><input type="date" value={adminEditForm.date||''} onChange={e=>setAdminEditForm(f=>({...f,date:e.target.value}))} /></div>
                <div className="form-group"><label>Zip Code</label><input value={adminEditForm.zip||''} onChange={e=>setAdminEditForm(f=>({...f,zip:e.target.value}))} maxLength={5} /></div>
                <div className="form-group full"><label>Event Fee</label><input value={adminEditForm.booth_fee||''} onChange={e=>setAdminEditForm(f=>({...f,booth_fee:e.target.value}))} placeholder="e.g. $50/vendor" /></div>
              </>)}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button disabled={savingAdminEdit} onClick={saveAdminEdit} style={{flex:1,background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:6,padding:'10px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:savingAdminEdit?0.6:1}}>{savingAdminEdit?'Saving...':'Save Changes'}</button>
              <button onClick={()=>setEditingAdminEntity(null)} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:6,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
function VendorApplyModal({ opp, allOpps, onClose }) {
  const seriesDates = (allOpps||[]).filter(o=>o.eventName===opp.eventName&&o.source==='Recurring Series'&&o.id!==opp.id).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const isSeries = seriesDates.length > 0;
  const [selectedDates, setSelectedDates] = useState([opp.id]);
  const toggleDate = (id) => setSelectedDates(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const [form, setForm] = useState({ vendorName:'', contactName:'', email:'', phone:'', category:'', message:'', vendorId:null });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [vendorProfiles, setVendorProfiles] = useState([]);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const fillFrom = (data) => {
    if (!data) return;
    setForm(f => ({
      ...f,
      vendorName: data.name || '',
      contactName: data.contact_name || '',
      email: data.contact_email || '',
      phone: data.contact_phone || '',
      category: data.category || '',
      vendorId: data.id || null,
    }));
    setAutoFilled(true);
  };

  // Load all vendor profiles for this user
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profiles = [];
        const { data: byId } = await supabase.from('vendors').select('id,name,contact_name,contact_email,contact_phone,category').eq('user_id', session.user.id);
        if (byId) profiles.push(...byId);
        const { data: byEmail } = await supabase.from('vendors').select('id,name,contact_name,contact_email,contact_phone,category').ilike('contact_email', session.user.email);
        if (byEmail) byEmail.forEach(v => { if (!profiles.some(p=>p.id===v.id)) profiles.push(v); });
        setVendorProfiles(profiles);
        if (profiles.length > 0) fillFrom(profiles[0]);
      } else {
        const vid = localStorage.getItem('sjvm_calendar_vendor_id');
        if (vid) {
          const { data } = await supabase.from('vendors').select('id,name,contact_name,contact_email,contact_phone,category').eq('id', vid).limit(1);
          if (data?.[0]) { setVendorProfiles([data[0]]); fillFrom(data[0]); }
        }
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!form.vendorName || !form.email || !form.contactName) { alert('Please fill in your business name, contact name, and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) { alert('Please enter a valid email.'); return; }
    setSubmitting(true);
    // Build list of events to apply to (current + selected recurring dates)
    const eventsToApply = [opp];
    if (isSeries) {
      seriesDates.forEach(s => { if (selectedDates.includes(s.id)) eventsToApply.push(s); });
    }
    let anyError = false;
    let firstToken = null;
    for (const evt of eventsToApply) {
      // Check if already applied
      if (form.vendorId) {
        const { data: existing } = await supabase.from('booking_requests').select('id').eq('vendor_id', form.vendorId).eq('event_name', evt.eventName).eq('event_date', evt.date).limit(1);
        if (existing?.[0]) continue; // skip already applied dates
      }
      const responseToken = crypto.randomUUID();
      if (!firstToken) firstToken = responseToken;
      const payload = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        session_id: 'vendor-application',
        vendor_id: form.vendorId || null, vendor_name: form.vendorName,
        vendor_emoji: '', vendor_category: form.category || '',
        host_name: evt.contactName || opp.contactName, host_email: evt.contactEmail || opp.contactEmail,
        event_name: evt.eventName, event_type: evt.eventType,
        event_zip: evt.zip, event_date: evt.date,
        start_time: evt.startTime || null, end_time: evt.endTime || null,
        address: '', attendance: '', vendor_count: String(evt.spots || ''),
        budget: evt.boothFee || '', notes: form.message || null,
        status: 'pending', sent_at: new Date().toISOString(),
        response_token: responseToken,
      };
      let { error } = await supabase.from('booking_requests').insert(payload);
      if (error && (error.code === '42703' || error.message?.includes('column'))) {
        const { response_token: _rt, ...fallback } = payload;
        ({ error } = await supabase.from('booking_requests').insert(fallback));
      }
      if (error) { console.error('[VENDOR APPLY] FAILED for', evt.date, ':', error.message, error.code, error.details, error.hint); anyError = true; }
    }
    const error = anyError;
    if (error) {
      console.error('Application error:', error);
      alert('Failed to submit application. Please try again.');
      setSubmitting(false);
      return;
    }
    // Email the host: "A vendor has applied to your event"
    if (opp.contactEmail) {
      fetch('/api/send-message-notification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: opp.contactEmail,
          recipientName: opp.contactName,
          senderName: form.vendorName,
          senderType: 'vendor',
          recipientType: 'host',
          eventName: opp.eventName,
          messagePreview: `${form.vendorName} (${form.category || 'Vendor'}) has applied to ${opp.eventName} on ${opp.date}. Log in to your Host Dashboard to review, accept, or decline.`,
        }),
      }).catch(err => console.error('Failed to send host notification:', err));
    }
    // Email the vendor: confirm application was submitted
    if (form.email) {
      fetch('/api/send-message-notification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: form.email,
          recipientName: form.contactName || form.vendorName,
          senderName: opp.contactName || 'Event Host',
          senderType: 'host',
          recipientType: 'vendor',
          eventName: opp.eventName,
          messagePreview: `Your application to ${opp.eventName} on ${opp.date} has been submitted! The host will review and respond. You'll receive an email when they accept or decline.`,
        }),
      }).catch(err => console.error('Failed to send vendor confirmation:', err));
    }
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
              {autoFilled ? (
                <>
                  {vendorProfiles.length > 1 && (
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#7a6a5a',marginBottom:6}}>Apply as:</div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {vendorProfiles.map(p=>(
                          <button key={p.id} onClick={()=>fillFrom(p)} style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:form.vendorId===p.id?'2px solid #c8a850':'1px solid #e8ddd0',background:form.vendorId===p.id?'#fdf9f0':'#fff',color:'#1a1410'}}>{p.name}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,color:'#1a6b3a'}}>
                    <strong>Applying as:</strong> {form.vendorName} ({form.email}){form.category ? ` · ${form.category}` : ''}
                  </div>
                  {isSeries && (
                    <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:8,padding:'12px 14px',marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1a4a6b',marginBottom:6}}>🔄 This is a recurring event series</div>
                      <div style={{fontSize:12,color:'#1a4a6b',marginBottom:8}}>Select the dates you'd like to apply for:</div>
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',padding:'4px 0',fontWeight:600,color:'#1a1410',textTransform:'none',letterSpacing:0}}>
                          <input type="checkbox" checked={true} disabled style={{width:16,height:16}} />
                          {fmtDate(opp.date)} (this event)
                        </label>
                        {seriesDates.map(s=>(
                          <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',padding:'4px 0',textTransform:'none',letterSpacing:0,fontWeight:400,color:'#1a1410'}}>
                            <input type="checkbox" checked={selectedDates.includes(s.id)} onChange={()=>toggleDate(s.id)} style={{width:16,height:16}} />
                            {fmtDate(s.date)}
                          </label>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button type="button" onClick={()=>setSelectedDates([opp.id,...seriesDates.map(s=>s.id)])} style={{background:'#1a4a6b',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Select All</button>
                        <button type="button" onClick={()=>setSelectedDates([opp.id])} style={{background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e0d5c5',borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>This Date Only</button>
                      </div>
                    </div>
                  )}
                  <div className="form-group" style={{marginBottom:16}}>
                    <label>Message to Host (optional)</label>
                    <textarea value={form.message} onChange={e=>set('message',e.target.value)} rows={3}
                      placeholder="Tell the host about your products, experience, or any questions..." />
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={handleSubmit} disabled={submitting}
                      style={{flex:2,background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',opacity:submitting?0.5:1}}>
                      {submitting ? 'Submitting...' : 'Apply to Vend'}
                    </button>
                    <button onClick={onClose}
                      style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming Events (public calendar) ──────────────────────────────────────
function UpcomingMarketsPage({ opps, setTab, setShowAuthModal, setShowEventGoerSignup }) {
  const [filterType, setFilterType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterTicketed, setFilterTicketed] = useState("");
  const [myZip, setMyZip] = useState("");
  const [myRadius, setMyRadius] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [savedEvents, setSavedEvents] = useState(() => { try { return JSON.parse(localStorage.getItem('sjvm_saved_events')||'[]'); } catch { return []; } });
  const [filterSaved, setFilterSaved] = useState('');
  const toggleSave = (id) => { setSavedEvents(s => { const next = s.includes(id) ? s.filter(x=>x!==id) : [...s,id]; localStorage.setItem('sjvm_saved_events',JSON.stringify(next)); return next; }); };
  const shareEvent = (opp) => { const url = window.location.origin; const text = `${opp.eventName} — ${fmtDate(opp.date)} in ${getCityFromZip(opp.zip)||'South Jersey'}`; if (navigator.share) navigator.share({title:opp.eventName,text,url}).catch(()=>{}); else { navigator.clipboard.writeText(`${text}\n${url}`).then(()=>alert('Event link copied!')).catch(()=>{}); } };
  const [vendorsByEvent, setVendorsByEvent] = useState({});
  const [loadingVendors, setLoadingVendors] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];
  const zipOk = myZip.length===5 && isKnownZip(myZip);
  const upcoming = opps
    .filter(o => o.date >= todayStr)
    .filter(o => o.shareWithEventGoers !== false)
    .filter(o => !filterType || o.eventType===filterType)
    .filter(o => !filterDateFrom || o.date >= filterDateFrom)
    .filter(o => !filterDateTo || o.date <= filterDateTo)
    .filter(o => !filterTicketed || (filterTicketed==='yes' ? o.isTicketed : !o.isTicketed))
    .map(o => ({ ...o, dist: zipOk ? distanceMiles(myZip, o.zip) : null }))
    .filter(o => !myRadius || !zipOk || o.dist === null || o.dist <= myRadius)
    .sort((a,b) => { if (a.dist!==null && b.dist!==null) return a.dist - b.dist; return a.date.localeCompare(b.date); });
  const filteredUpcoming = filterSaved === 'saved' ? upcoming.filter(o => savedEvents.includes(o.id)) : upcoming;

  // Batch-load confirmed vendors for all visible events
  useEffect(() => {
    const eventNames = upcoming.map(o => o.eventName).filter(Boolean);
    if (eventNames.length === 0) return;
    supabase.from('booking_requests').select('vendor_name,vendor_category,vendor_emoji,status,event_name')
      .in('event_name', eventNames).eq('status', 'accepted')
      .then(({ data }) => {
        if (!data) return;
        const byEvent = {};
        upcoming.forEach(o => { byEvent[o.id] = []; });
        data.forEach(v => {
          const opp = upcoming.find(o => o.eventName === v.event_name);
          if (opp) byEvent[opp.id].push(v);
        });
        setVendorsByEvent(prev => ({...prev, ...byEvent}));
      });
  }, [upcoming.map(o=>o.id).join(',')]); // eslint-disable-line

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
            {myZip.length===5 && <div className={`zip-feedback ${zipOk?'zip-ok':'zip-warn'}`}>{zipOk ? (myRadius ? `✓ Within ${myRadius} miles` : '✓ Sorted by distance') : '⚠ Zip unverified'}</div>}
          </div>
          {zipOk && (
            <div className="match-filter-group" style={{maxWidth:160}}>
              <label>Radius</label>
              <select value={myRadius} onChange={e=>setMyRadius(+e.target.value)}>
                <option value={0}>Any distance</option>
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={15}>15 miles</option>
                <option value={20}>20 miles</option>
                <option value={30}>30 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>
          )}
          <div className="match-filter-group">
            <label>Event Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="match-filter-group">
            <label>From Date</label>
            <input type="date" value={filterDateFrom} min={todayStr} onChange={e=>setFilterDateFrom(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>To Date</label>
            <input type="date" value={filterDateTo} min={filterDateFrom||todayStr} onChange={e=>setFilterDateTo(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>Ticketed</label>
            <select value={filterTicketed} onChange={e=>setFilterTicketed(e.target.value)}>
              <option value="">All Events</option>
              <option value="yes">Ticketed Only</option>
              <option value="no">Free Only</option>
            </select>
          </div>
          {savedEvents.length > 0 && (
            <div className="match-filter-group" style={{maxWidth:160}}>
              <label>Saved</label>
              <select value={filterSaved} onChange={e=>setFilterSaved(e.target.value)}>
                <option value="">All Events</option>
                <option value="saved">My Saved Only ({savedEvents.length})</option>
              </select>
            </div>
          )}
        </div>
        <div className="results-header">
          <div className="results-count"><strong>{filteredUpcoming.length}</strong> upcoming events{filterSaved==='saved' ? ' (saved)' : ''}</div>
        </div>
        {filteredUpcoming.length===0
          ? <div className="empty-state"><div className="big">📭</div><p>No upcoming events match your filters.</p></div>
          : (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {filteredUpcoming.map(opp => {
              const isOpen = expandedId === opp.id;
              const vendors = vendorsByEvent[opp.id] || [];
              const loading = loadingVendors[opp.id];
              return (
              <div key={opp.id} style={{ background:"#fff", border:"1px solid #e8ddd0", borderRadius:12, overflow:"hidden" }}>
                {/* Card header */}
                <div style={{ background:"linear-gradient(135deg,#1a1410,#2d2118)", padding:"18px 24px" }}>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:22, color:"#fff", marginBottom:2, lineHeight:1.3 }}>{opp.eventName}</div>
                  <div style={{ fontSize:12, color:"#a89a8a", letterSpacing:"1px", textTransform:"uppercase" }}>{opp.eventType}</div>
                  {opp.vendorStatus === 'fully_booked' && <span style={{display:'inline-block',marginTop:6,background:'#e8c97a',color:'#1a1410',padding:'3px 12px',borderRadius:12,fontSize:11,fontWeight:700}}>Fully Booked</span>}
                  {opp.source === 'Recurring Series' && <span style={{display:'inline-block',marginTop:6,marginLeft:4,background:'#e8f4fd',color:'#1a4a6b',padding:'3px 12px',borderRadius:12,fontSize:11,fontWeight:700}}>🔄 Recurring Series</span>}
                </div>
                {/* Event details — always visible */}
                <div style={{ padding:"16px 24px" }}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'12px 24px',marginBottom:12}}>
                    <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Date </span><span style={{fontSize:14,fontWeight:500}}>{fmtDate(opp.date)}</span></div>
                    {(opp.startTime || opp.endTime) && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Time </span><span style={{fontSize:14,fontWeight:500}}>{fmtTime(opp.startTime)}{opp.endTime ? ' – '+fmtTime(opp.endTime) : ''}</span></div>}
                    <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Location </span><span style={{fontSize:14,fontWeight:500}}>{getCityFromZip(opp.zip) || 'Zip '+opp.zip}{opp.dist!==null ? ` · ${opp.dist.toFixed(1)} mi away` : ''}</span></div>
                    {opp.isTicketed && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Admission </span><span style={{fontSize:14,fontWeight:500}}>🎟️ {opp.ticketPrice || 'Ticketed'}</span></div>}
                    {!opp.isTicketed && <div><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#a89a8a',fontWeight:600}}>Admission </span><span style={{fontSize:14,fontWeight:500,color:'#1a6b3a'}}>Free</span></div>}
                  </div>
                  {(opp.eventGoerNotes || opp.notes) && <p style={{fontSize:13,color:'#7a6a5a',lineHeight:1.5,margin:'0 0 12px',padding:'10px 12px',background:'#fdf9f5',borderRadius:6,borderLeft:'3px solid #e8c97a'}}>{opp.eventGoerNotes || opp.notes}</p>}
                  {opp.eventLink && <div style={{marginBottom:12}}><a href={opp.eventLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#1a4a6b',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>🔗 Event Page</a></div>}
                </div>
                {/* Vendors attending — always visible */}
                <div style={{borderTop:'1px solid #e8ddd0',padding:'16px 24px',background:'#fdf9f5'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1a1410',letterSpacing:0.5,marginBottom:8}}>Vendors Attending</div>
                  {loading ? (
                    <div style={{color:'#a89a8a',fontSize:13,padding:'4px 0'}}>Loading vendors...</div>
                  ) : vendors.length === 0 ? (
                    <div style={{color:'#7a6a5a',fontSize:13,padding:'4px 0'}}>No confirmed vendors yet. Check back closer to the event date!</div>
                  ) : (
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {vendors.map((v,i) => (
                        <div key={i} style={{background:'#fff',border:'1px solid #e8ddd0',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                          {v.vendor_emoji && <span style={{fontSize:16}}>{v.vendor_emoji}</span>}
                          <div>
                            <div style={{fontWeight:700,fontSize:12,color:'#1a1410'}}>{v.vendor_name}</div>
                            {v.vendor_category && <div style={{fontSize:10,color:'#7a6a5a'}}>{v.vendor_category}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Save & Share */}
                <div style={{borderTop:'1px solid #e8ddd0',padding:'10px 24px',display:'flex',gap:8}}>
                  <button onClick={()=>toggleSave(opp.id)} style={{flex:1,background:savedEvents.includes(opp.id)?'#fdf4dc':'#f5f0ea',color:savedEvents.includes(opp.id)?'#7a5a10':'#7a6a5a',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{savedEvents.includes(opp.id)?'♥ Saved':'♡ Save'}</button>
                  <button onClick={()=>shareEvent(opp)} style={{flex:1,background:'#f5f0ea',color:'#7a6a5a',border:'1px solid #e8ddd0',borderRadius:6,padding:'8px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>↗ Share</button>
                </div>
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

function OpportunitiesPage({ opps, authUser, vendorProfile, allVendorProfiles, setVendorProfile, setShowAuthModal, messageEventHost }) {
  const isVendor = !!vendorProfile;
  const canSeeFullDetails = authUser && isVendor;
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [myZip, setMyZip] = useState(vendorProfile?.home_zip || "");
  const [myRadius, setMyRadius] = useState(0);
  const [saved, setSaved] = useState([]);
  const [applyOpp, setApplyOpp] = useState(null);
  const [showSection, setShowSection] = useState('open');
  const [showMatching, setShowMatching] = useState(!!vendorProfile);
  const zipOk = myZip.length===5 && isKnownZip(myZip);

  const todayStr = new Date().toISOString().split('T')[0];
  const vendorCats = vendorProfile ? [...(vendorProfile.subcategories||[]), vendorProfile.category, ...(vendorProfile.metadata?.serviceCategories||[]), ...(vendorProfile.metadata?.allCategories||[])].filter(Boolean) : [];
  const future = opps
    .filter(o => o.date >= todayStr)
    .filter(o => o.vendorDiscovery !== 'closed')
    .filter(o => !filterType || o.eventType===filterType)
    .filter(o => !filterCat  || o.categoriesNeeded.includes(filterCat))
    .filter(o => !filterDateFrom || o.date >= filterDateFrom)
    .filter(o => !filterDateTo || o.date <= filterDateTo)
    .filter(o => !showMatching || vendorCats.length === 0 || o.categoriesNeeded.length === 0 || o.categoriesNeeded.some(c => vendorCats.includes(c)))
    .map(o => {
      const dist = zipOk ? distanceMiles(myZip, o.zip) : null;
      return {...o, dist};
    })
    .filter(o => !myRadius || !zipOk || o.dist === null || o.dist <= myRadius)
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
                {zipOk ? (myRadius ? `\u2713 Within ${myRadius} miles` : "\u2713 Sorted by distance") : "\u26a0 Zip unverified"}
              </div>
            )}
          </div>
          {zipOk && (
            <div className="match-filter-group" style={{maxWidth:160}}>
              <label>Radius</label>
              <select value={myRadius} onChange={e=>setMyRadius(+e.target.value)}>
                <option value={0}>Any distance</option>
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={15}>15 miles</option>
                <option value={20}>20 miles</option>
                <option value={30}>30 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>
          )}
          <div className="match-filter-group">
            <label>Event Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="match-filter-group">
            <label>From Date</label>
            <input type="date" value={filterDateFrom} min={todayStr} onChange={e=>setFilterDateFrom(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>To Date</label>
            <input type="date" value={filterDateTo} min={filterDateFrom||todayStr} onChange={e=>setFilterDateTo(e.target.value)} />
          </div>
          <div className="match-filter-group">
            <label>Category Needed</label>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {vendorProfile && (
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {allVendorProfiles && allVendorProfiles.length > 1 && (
              <div style={{display:'flex',gap:4,marginRight:8}}>
                {allVendorProfiles.map(p=>(
                  <button key={p.id} onClick={()=>setVendorProfile(p)} style={{padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',border:vendorProfile?.id===p.id?'2px solid #c8a850':'1px solid #e8ddd0',background:vendorProfile?.id===p.id?'#fdf9f0':'#fff',color:'#1a1410'}}>{p.name||p.contact_name}</button>
                ))}
              </div>
            )}
            <button onClick={()=>setShowMatching(!showMatching)} style={{
              background:showMatching?'#1a6b3a':'#f5f0ea', color:showMatching?'#fff':'#7a6a5a',
              border:showMatching?'none':'1px solid #e8ddd0', borderRadius:6, padding:'6px 14px',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif'
            }}>{showMatching ? '✓ Showing matching events' : 'Show all events'}</button>
            {showMatching && <span style={{fontSize:11,color:'#1a6b3a'}}>Filtered to events matching your categories & location</span>}
          </div>
        )}
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
                  {opp.vendorStatus === 'fully_booked' && <span style={{display:'inline-block',marginTop:8,background:'#e8c97a',color:'#1a1410',padding:'3px 12px',borderRadius:12,fontSize:11,fontWeight:700}}>Fully Booked</span>}
                  {opp.vendorStatus === 'closed' && <span style={{display:'inline-block',marginTop:8,background:'#f5f0ea',color:'#7a6a5a',padding:'3px 12px',borderRadius:12,fontSize:11,fontWeight:700}}>Applications Closed</span>}
                  {(!opp.vendorStatus || opp.vendorStatus === 'open') && opp.deadline && (() => { const d = new Date(opp.deadline); const now = new Date(); const hrs = (d - now)/(1000*60*60); return hrs > 0 && hrs <= 48 ? <span style={{display:'inline-block',marginTop:8,background:'#fdecea',color:'#8b1a1a',padding:'3px 12px',borderRadius:12,fontSize:11,fontWeight:700}}>Closing Soon</span> : null; })()}
                </div>
                <div style={{ padding:"20px 24px" }}>
                  {/* Preview fields — visible to everyone */}
                  {(opp.vendorNotes || opp.notes) && <p style={{ fontSize:13, color:"#7a6a5a", lineHeight:1.6, marginBottom:14, padding:12, background:"#fdf9f5", borderRadius:6, borderLeft:"3px solid #e8c97a" }}>{opp.vendorNotes || opp.notes}</p>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px',marginBottom:14}}>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Date</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtDate(opp.date)}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Time</div><div style={{ fontSize:14, fontWeight:500 }}>{fmtTime(opp.startTime)}{opp.endTime ? ' – '+fmtTime(opp.endTime) : ''}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Event Fee</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.boothFee || 'Not specified'}</div></div>
                    <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Admission</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.isTicketed ? '🎟️ '+(opp.ticketPrice||'Ticketed') : 'Free'}</div></div>
                    {opp.deadline && <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Apply By</div><div style={{ fontSize:14, fontWeight:500, color:isUrgent(opp.deadline)?'#8b0000':'#1a1410' }}>{isUrgent(opp.deadline)?'🔥 ':''}{fmtDate(opp.deadline)}</div></div>}
                  </div>

                  {/* Vendor full details */}
                  {canSeeFullDetails ? (
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px',marginBottom:14,paddingTop:14,borderTop:'1px solid #e8ddd0'}}>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Host</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.contactName}</div></div>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Location</div><div style={{ fontSize:14, fontWeight:500 }}>{getCityFromZip(opp.zip) || 'Zip '+opp.zip}{opp.dist!==null ? ` · ${opp.dist.toFixed(1)}mi away` : ""}</div></div>
                        <div><div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:"#a89a8a", fontWeight:600 }}>Spots Open</div><div style={{ fontSize:14, fontWeight:500 }}>{opp.spots || '—'} total</div></div>
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
                              <strong style={{color:'#1a1410'}}>{svc.type || 'Service'}{svc.subType && svc.subType!=='Other' ? ` — ${svc.subType}` : ''}{svc.otherType ? ` — ${svc.otherType}` : ''}</strong>
                              <span style={{color:'#7a6a5a'}}> · {svc.duration}</span>
                              <span style={{color:'#7a6a5a'}}> · Budget: {svc.budgetType==='open' ? 'Open to quotes' : svc.budgetType==='fixed' ? (svc.budgetAmount||'TBD') : (svc.budgetMin||'?')+' – '+(svc.budgetMax||'?')}</span>
                              {svc.notes && <div style={{fontSize:11,color:'#a89a8a',marginTop:2}}>{svc.notes}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:10, flexWrap:'wrap' }}>
                        {opp.vendorStatus === 'fully_booked' ? (
                          <div style={{ flex:2, minWidth:140, padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:700, textAlign:'center', background:'#1a1410', color:'#e8c97a' }}>Fully Booked</div>
                        ) : opp.vendorStatus === 'closed' ? (
                          <div style={{ flex:2, minWidth:140, padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, textAlign:'center', background:'#f5f0ea', color:'#a89a8a', border:'1px solid #e8ddd0' }}>Applications Closed</div>
                        ) : showSection==='closed' ? (
                          <div style={{ flex:2, minWidth:140, padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:600, textAlign:'center', background:'#f5f0ea', color:'#a89a8a', border:'1px solid #e8ddd0' }}>Past Deadline</div>
                        ) : (opp.vendorDiscovery === 'apply' || opp.vendorDiscovery === 'both') ? (
                          <button onClick={()=>setApplyOpp(opp)} style={{ flex:2, minWidth:140, background:"#c8a84b", color:"#1a1410", border:"none", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
                            Apply to Vend
                          </button>
                        ) : null}
                        {messageEventHost && authUser && vendorProfile && (
                          <button onClick={()=>messageEventHost(opp)} style={{ flex:1, minWidth:100, background:"#1a1410", color:"#e8c97a", border:"none", padding:"10px 16px", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
                            💬 Message Host
                          </button>
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
      {applyOpp && <VendorApplyModal opp={applyOpp} allOpps={opps} onClose={()=>setApplyOpp(null)} />}
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
        <div className="form-group"><label>Event Fee</label><input placeholder="e.g. $50/vendor or Free" value={form.boothFee} onChange={e=>set("boothFee",e.target.value)} /></div>
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
      try {
        const { data, error: fetchErr } = await supabase
          .from('booking_requests').select('*').eq('response_token', token).single();
        if (fetchErr || !data) {
          setError(`This booking request link is invalid or has expired.${fetchErr ? ' (' + fetchErr.message + ')' : ''}`);
          setLoading(false);
          return;
        }
        setRequest(data);
        setLoading(false);
      } catch (err) {
        console.error('[VendorResponse] Unexpected error:', err);
        setError('Something went wrong loading this booking request. Please try again.');
        setLoading(false);
      }
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
  const [authModalMode, setAuthModalMode] = useState(null);
  const [authModalRole, setAuthModalRole] = useState(null);
  const openSignup = (role) => { setAuthModalMode('signup'); setAuthModalRole(role||null); setShowAuthModal(true); };
  const openLogin = () => { setAuthModalMode(null); setAuthModalRole(null); setShowAuthModal(true); };
  const [authEmail, setAuthEmail] = useState('');
  const [vendorProfile, setVendorProfile] = useState(null); // active vendor profile (raw DB row)
  const [allVendorProfiles, setAllVendorProfiles] = useState([]); // all vendor profiles for this user
  const [userEvents, setUserEvents] = useState([]); // raw DB rows for logged-in host
  const [hasBeenHost, setHasBeenHost] = useState(false); // sticky flag: true once user has/had events
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

  // Route to dashboard on login (when not a fresh signup)
  useEffect(() => {
    if (!authUser) return;
    if (localStorage.getItem('sjvm_pending_roles')) return; // fresh signup handled above
    // Only redirect to dashboard if currently on home page
    if (tab === 'home') {
      // Wait briefly for profile/events to load, then route
      const timer = setTimeout(() => {
        if (vendorProfile && userEvents.length > 0) setTab('vendor-dashboard');
        else if (vendorProfile) setTab('vendor-dashboard');
        else if (userEvents.length > 0) setTab('host-dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authUser, vendorProfile, userEvents]);

  // Load vendor profile and host events for logged-in user
  useEffect(() => {
    if (!authUser) { setVendorProfile(null); setAllVendorProfiles([]); setUserEvents([]); setEventGoerProfile(null); return; }
    // Load all user data sequentially to avoid race conditions
    (async () => {
      // Event guest profile
      const { data: goerData } = await supabase.from('event_goers').select('*').eq('email', authUser.email).limit(1);
      if (goerData?.[0]) setEventGoerProfile(goerData[0]);

      // Vendor profiles — by user_id first, then by email, deduplicate
      const profiles = [];
      const { data: byId } = await supabase.from('vendors').select('*').eq('user_id', authUser.id);
      if (byId) profiles.push(...byId);
      const { data: byEmail } = await supabase.from('vendors').select('*').ilike('contact_email', authUser.email);
      if (byEmail) {
        for (const v of byEmail) {
          if (!profiles.some(p => p.id === v.id)) {
            if (!v.user_id) supabase.from('vendors').update({ user_id: authUser.id }).eq('id', v.id).then(() => {});
            profiles.push(v);
          }
        }
      }
      setAllVendorProfiles(profiles);
      if (profiles.length > 0) setVendorProfile(p => p || profiles[0]);

      // Events — by user_id first, then by email, deduplicate
      const allEvts = [];
      const { data: evtsById } = await supabase.from('events').select('*').eq('user_id', authUser.id).order('date', { ascending: false });
      if (evtsById) allEvts.push(...evtsById);
      const { data: evtsByEmail } = await supabase.from('events').select('*').ilike('contact_email', authUser.email).order('date', { ascending: false });
      if (evtsByEmail) {
        for (const e of evtsByEmail) {
          if (!allEvts.some(x => x.id === e.id)) {
            if (!e.user_id) supabase.from('events').update({ user_id: authUser.id }).eq('id', e.id).then(() => {});
            allEvts.push(e);
          }
        }
      }
      setUserEvents(allEvts);
      if (allEvts.length > 0) setHasBeenHost(true);
    })();
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
    setAuthUser(null); setVendorProfile(null); setUserEvents([]); setHasBeenHost(false);
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [inquiryModal, setInquiryModal] = useState(null); // { vendor } — for messaging without an event
  const [eventMessageModal, setEventMessageModal] = useState(null); // { vendor, eventName } — for messaging with an event
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

  // Escape key closes any open modal
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false); setShowContactModal(false);
        setShowFeedbackModal(false); setShowEventGoerSignup(false);
        setMobileMenuOpen(false); setInquiryModal(null); setEventMessageModal(null);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
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
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations from Supabase
  const loadMessages = useCallback(async () => {
    if (!authUser) { setConversations([]); setUnreadCount(0); return; }
    try {
    const uid = authUser.id;
    const { data: msgs, error } = await supabase.from('messages').select('*')
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order('created_at', { ascending: true });
    if (error || !msgs) return;
    // Group by conversation_id
    // Collect unique vendor IDs to look up names
    const vendorIds = new Set();
    msgs.forEach(m => {
      if (m.sender_type === 'vendor') vendorIds.add(m.sender_id);
      if (m.recipient_type === 'vendor') vendorIds.add(m.recipient_id);
    });
    // Look up vendor names by auth user_id (filter out invalid IDs like 'unknown')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validVendorIds = [...vendorIds].filter(id => uuidRegex.test(id));
    const vendorNames = {};
    if (validVendorIds.length > 0) {
      const { data: vendorRows } = await supabase.from('vendors').select('user_id,name,contact_name').in('user_id', validVendorIds);
      if (vendorRows) vendorRows.forEach(v => { if (v.user_id) vendorNames[v.user_id] = v.name || v.contact_name || 'Vendor'; });
    }
    const convMap = {};
    msgs.forEach(m => {
      if (!convMap[m.conversation_id]) convMap[m.conversation_id] = { id: m.conversation_id, messages: [], vendorId: null, vendorName: '', hostName: '', eventName: m.event_name || '', status: 'active' };
      const conv = convMap[m.conversation_id];
      if (m.sender_type === 'vendor') { conv.vendorId = m.sender_id; conv.vendorName = conv.vendorName || vendorNames[m.sender_id] || 'Vendor'; }
      if (m.sender_type === 'host') { conv.hostName = conv.hostName || 'Host'; }
      if (m.recipient_type === 'vendor') { conv.vendorId = conv.vendorId || m.recipient_id; conv.vendorName = conv.vendorName || vendorNames[m.recipient_id] || 'Vendor'; }
      if (m.event_name) conv.eventName = m.event_name;
      const senderLabel = m.sender_type === 'system' ? 'System' : m.sender_type === 'vendor' ? (vendorNames[m.sender_id] || 'Vendor') : (m.sender_id === uid ? 'You' : 'Host');
      conv.messages.push({ id: m.id, from: m.sender_id === uid ? 'host' : (m.sender_type === 'system' ? 'system' : 'vendor'), text: m.message_text, ts: m.created_at, senderName: senderLabel, attachments: m.attachments || undefined });
    });
    // Filter out broken conversations (must contain current user's ID and have messages)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}/i;
    const validConvos = Object.values(convMap).filter(c => {
      // Must have the current user's ID in the conversation_id
      if (!c.id.includes(uid)) return false;
      // First two segments of conversation_id must look like UUIDs
      // Format: uuid1_uuid2 or uuid1_uuid2_evt_eventId
      const parts = c.id.split('_');
      if (parts.length < 2 || !uuidPattern.test(parts[0]) || !uuidPattern.test(parts[1])) return false;
      // Must have at least one message
      if (c.messages.length === 0) return false;
      return true;
    });
    setConversations(validConvos);
    setUnreadCount(msgs.filter(m => m.recipient_id === uid && !m.is_read).length);
    } catch (e) { console.error('loadMessages error:', e); }
  }, [authUser]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Realtime subscription for instant message delivery
  useEffect(() => {
    if (!authUser) return;
    let debounceTimer = null;
    const debouncedLoad = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadMessages, 300); };
    const channel = supabase.channel(`messages-${authUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `recipient_id=eq.${authUser.id}` },
        () => debouncedLoad()
      )
      .subscribe();
    // Fallback polling every 60 seconds in case realtime disconnects
    const interval = setInterval(loadMessages, 60000);
    return () => { clearTimeout(debounceTimer); supabase.removeChannel(channel); clearInterval(interval); };
  }, [authUser, loadMessages]);

  // Migrate localStorage messages to Supabase on first load
  useEffect(() => {
    if (!authUser) return;
    const lsKey = CONVERSATIONS_LS_KEY;
    try {
      const old = JSON.parse(localStorage.getItem(lsKey) || '[]');
      if (old.length === 0) return;
      const uid = authUser.id;
      const inserts = [];
      old.forEach(conv => {
        const convoId = conv.vendorId ? `${uid}_${conv.vendorId}` : conv.id?.toString() || `legacy_${Date.now()}`;
        (conv.messages || []).forEach(msg => {
          if (msg.from === 'system') return;
          inserts.push({
            conversation_id: convoId,
            sender_id: msg.from === 'host' ? uid : (conv.vendorId || 'unknown'),
            sender_type: msg.from === 'host' ? 'host' : 'vendor',
            recipient_id: msg.from === 'host' ? (conv.vendorId || 'unknown') : uid,
            recipient_type: msg.from === 'host' ? 'vendor' : 'host',
            event_name: conv.eventName || '',
            message_text: msg.text || '(file attachment)',
            attachments: msg.attachments || null,
            is_read: true,
            created_at: msg.ts || new Date().toISOString(),
          });
        });
      });
      if (inserts.length > 0) {
        supabase.from('messages').insert(inserts).then(() => {
          localStorage.removeItem(lsKey);
          loadMessages();
        }).catch(() => {});
      }
    } catch {}
  }, [authUser]);

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
    // Check if vendor already has a booking for this specific event date
    let dupQuery = supabase.from('booking_requests').select('id,status').eq('vendor_id', vendor.id).eq('event_name', eventDetails.eventName);
    if (eventDetails.date) dupQuery = dupQuery.eq('event_date', eventDetails.date);
    const { data: existingBooking } = await dupQuery.limit(1);
    if (existingBooking?.[0]) {
      alert(`${vendor.name} already has a ${existingBooking[0].status} application for ${eventDetails.eventName}${eventDetails.date ? ' on ' + eventDetails.date : ''}.`);
      return;
    }
    const responseToken = crypto.randomUUID();
    const req = {
      id: Date.now(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmoji: vendor.emoji,
      vendorCategory: vendor.category,
      hostName: eventDetails.contactName || 'Host',
      hostEmail: eventDetails.email || '',
      eventId: eventDetails.eventId || null,
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
      event_id: req.eventId || null,
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
    if (brErr) {
      console.error('Booking insert failed, retrying without optional columns:', brErr.message);
      const { response_token:_rt, recurrence_frequency:_rf, recurrence_day:_rd, recurrence_end_type:_ret, recurrence_end_date:_red, recurrence_count:_rc, recurrence_notes:_rn, categories_needed:_cn, subcategories_needed:_sn, is_recurring:_ir, event_id:_ei, ...safePayload } = brPayload;
      const { error: brErr2 } = await supabase.from('booking_requests').insert(safePayload);
      if (brErr2) console.error('Booking insert retry also failed:', brErr2.message);
      else brErr = null;
    }

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

  };

  const openMessage = async (vendor, inquiryType, inquiryMessage) => {
    const uid = authUser?.id || 'anon';
    // Resolve vendor's auth user_id (different from vendors table row id)
    let vendorAuthId = vendor.userId || vendor.user_id || null;
    if (!vendorAuthId) {
      const { data } = await supabase.from('vendors').select('user_id').eq('id', vendor.id).limit(1);
      vendorAuthId = data?.[0]?.user_id;
    }
    if (!vendorAuthId) { alert('Unable to message this vendor — their account may not be linked. Please try again later.'); return; }
    const hasEvent = !!hostEvent?.eventName;
    const eventId = hasEvent ? (hostEvent.eventId || null) : null;
    const convoId = getConvoId(uid, vendorAuthId, eventId);
    const existing = conversations.find(c => c.id === convoId);
    if (existing) { setActiveConvoId(convoId); setTab("messages"); return; }
    const eventLabel = hasEvent ? (hostEvent.eventName + (hostEvent.date ? ' — ' + fmtDate(hostEvent.date) : '')) : null;
    const contextLabel = eventLabel || inquiryType || 'General Inquiry';
    const eventDetails = hasEvent ? [
      hostEvent.eventName,
      hostEvent.date ? fmtDate(hostEvent.date) : null,
      hostEvent.startTime ? fmtTime(hostEvent.startTime) + (hostEvent.endTime ? ' – ' + fmtTime(hostEvent.endTime) : '') : null,
      hostEvent.eventZip ? (getCityFromZip(hostEvent.eventZip) || 'Zip ' + hostEvent.eventZip) : null,
      hostEvent.notes ? 'Notes: ' + hostEvent.notes : null,
    ].filter(Boolean).join(' · ') : null;
    const sysText = hasEvent
      ? `Conversation about ${eventLabel}.\n${eventDetails}\nContact info is shared only after a booking is confirmed.`
      : `${authUser?.email || 'A host'} started a conversation with ${vendor.name}. Inquiry: ${contextLabel}.${inquiryMessage ? ' "'+inquiryMessage+'"' : ''}\nContact info is shared only after a booking is confirmed.`;
    const evtName = eventLabel || contextLabel;
    // Build conversation messages
    const ts = new Date().toISOString();
    const msgs = [{ id: Date.now(), from: 'system', text: sysText, ts }];
    // If there's an actual user message, add it
    if (inquiryMessage && inquiryMessage.trim()) {
      msgs.push({ id: Date.now()+1, from: 'host', senderName: authUser?.email || 'Host', text: inquiryMessage.trim(), ts });
    }
    const newConvo = {
      id: convoId, vendorId: vendorAuthId, vendorName: vendor.name,
      vendorEmoji: vendor.emoji || '', vendorCategory: vendor.category || '',
      hostName: authUser?.email || 'Host', eventName: evtName, status: 'active',
      messages: msgs,
    };
    setConversations(c => [newConvo, ...c.filter(x=>x.id!==convoId)]);
    setActiveConvoId(convoId);
    setTab("messages");
    // Save to Supabase in background — system messages for both parties
    supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: uid, recipient_type: 'host', event_name: evtName, message_text: sysText, is_read: true }).then(({error})=>{if(error)console.error('openMessage sys1:',error.message);});
    supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: vendorAuthId, recipient_type: 'vendor', event_name: evtName, message_text: sysText, is_read: false }).then(({error})=>{if(error)console.error('openMessage sys2:',error.message);});
    // Save user message if provided
    if (inquiryMessage && inquiryMessage.trim()) {
      supabase.from('messages').insert({ conversation_id: convoId, sender_id: uid, sender_type: 'host', recipient_id: vendorAuthId, recipient_type: 'vendor', event_name: evtName, message_text: inquiryMessage.trim(), is_read: false }).then(({error})=>{if(error)console.error('openMessage userMsg:',error.message);});
    }
    // Send vendor email notification with event details
    const { data: vendorRow } = await supabase.from('vendors').select('contact_email,contact_name').eq('id', vendor.id).single();
    if (vendorRow?.contact_email) {
      const emailPreview = inquiryMessage ? inquiryMessage.trim() : (eventDetails ? 'Event: ' + eventDetails : '');
      fetch('/api/send-message-notification', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ recipientEmail: vendorRow.contact_email, recipientName: vendorRow.contact_name || vendor.name, senderName: authUser?.email || 'A host', senderType: 'host', recipientType: 'vendor', eventName: evtName, messagePreview: emailPreview }),
      }).catch(e=>console.error('API call failed:',e));
    }
  };

  // Vendor messages an event host from Opportunities page
  const messageEventHost = async (opp) => {
    if (!authUser) return;
    const uid = authUser.id;
    // Look up host's auth user_id from the event
    let hostUserId = null;
    if (opp.userId) { hostUserId = opp.userId; }
    else {
      const { data } = await supabase.from('events').select('user_id').eq('id', opp.id).limit(1);
      hostUserId = data?.[0]?.user_id;
    }
    if (!hostUserId) {
      const { data } = await supabase.from('events').select('user_id').eq('event_name', opp.eventName).limit(1);
      hostUserId = data?.[0]?.user_id;
    }
    if (!hostUserId) { alert('Unable to message this host. Please try again later.'); return; }
    const convoId = getConvoId(uid, hostUserId, opp.id || null);
    const existing = conversations.find(c => c.id === convoId);
    if (existing) { setActiveConvoId(convoId); setTab('messages'); return; }
    const eventLabel = (opp.eventName || '') + (opp.date ? ' — ' + fmtDate(opp.date) : '');
    const sysText = `Conversation started by ${vendorProfile?.name || 'a vendor'} about ${eventLabel}. Contact info is shared only after a booking is confirmed.`;
    await supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: uid, recipient_type: 'vendor', event_name: eventLabel, message_text: sysText, is_read: true });
    await supabase.from('messages').insert({ conversation_id: convoId, sender_id: 'system', sender_type: 'system', recipient_id: hostUserId, recipient_type: 'host', event_name: eventLabel, message_text: sysText, is_read: false });
    const newConvo = {
      id: convoId, vendorId: uid, vendorName: vendorProfile?.name || '',
      vendorEmoji: vendorProfile?.emoji || '', vendorCategory: vendorProfile?.category || '',
      hostName: opp.contactName || 'Host', eventName: eventLabel, status: 'active',
      messages: [{ id: Date.now(), from: 'system', text: sysText, ts: new Date().toISOString() }],
    };
    setConversations(c => [newConvo, ...c]);
    setActiveConvoId(convoId);
    setTab('messages');
    // Email the host
    if (opp.contactEmail) {
      fetch('/api/send-message-notification', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ recipientEmail: opp.contactEmail, recipientName: opp.contactName, senderName: vendorProfile?.name || 'A vendor', senderType: 'vendor', recipientType: 'host', eventName: eventLabel, messagePreview: '' }),
      }).catch(e=>console.error('API call failed:',e));
    }
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
    const { data: existing } = await supabase.from('vendors').select('id').ilike('contact_email', form.email).limit(1);
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
      serviceType: form.serviceType || form.serviceSubcategories?.[0] || form.serviceCategories?.[0] || null,
      serviceRateMin: form.serviceRateMin || null,
      serviceRateMax: form.serviceRateMax || null,
      serviceRateType: form.serviceRateType || 'fixed',
      minBookingDuration: form.minBookingDuration || null,
      serviceDescription: form.serviceDescription || null,
    };
    const vendorPayload = {
      name:                form.businessName,
      contact_name:        form.ownerName     || null,
      category:            form.categories?.[0] || form.serviceCategories?.[0] || CATEGORIES[0],
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
        setPendingVendors(p => [{ id: newVendor.id, name: form.businessName, contact_name: form.ownerName, category: form.categories?.[0] || form.serviceCategories?.[0] || CATEGORIES[0], home_zip: form.homeZip, radius: form.radius, contact_email: form.email, contact_phone: form.phone, status: 'pending', created_at: new Date().toISOString(), metadata: { ...metadataPayload }, subcategories: form.subcategories || [] }, ...p]);
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
          category: form.categories?.[0] || form.serviceCategories?.[0] || CATEGORIES[0],
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
    if (form.eventLink && !/^https?:\/\/.+/.test(form.eventLink)) {
      alert('Please provide a valid URL (starting with http:// or https://) or leave the field blank.');
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
      notes: form.vendorNotes || form.eventGoerNotes || form.notes || null,
      vendor_notes: form.vendorNotes || form.notes || null,
      event_goer_notes: form.eventGoerNotes || null,
      share_with_event_goers: form.shareWithEventGoers !== false,
      deadline: form.applyByDate || null,
      source: form.isRecurring ? 'Recurring Series' : 'Host Submitted',
      status: 'pending_review',
      event_link: form.eventLink || null,
      is_ticketed: form.isTicketedEvent || false,
      ticket_price: form.isTicketedEvent ? (form.ticketPrice || null) : null,
      services_needed: form.servicesNeeded.length > 0 ? JSON.stringify(form.servicesNeeded) : null,
      allow_duplicate_categories: form.allowDuplicateCategories,
      allow_duplicate_subcategories: form.allowDuplicateSubcategories,
      vendor_discovery: form.vendorDiscovery || 'both',
      ...(hostUserId ? { user_id: hostUserId } : {}),
    };
    let { data: newEvent, error: eventErr } = await supabase.from('events').insert(eventPayload).select().single();
    // Retry without newer columns if they don't exist yet
    if (eventErr && (eventErr.code === '42703' || eventErr.code === 'PGRST204' || eventErr.message?.includes('column'))) {
      const { vendor_discovery: _vd, event_link: _el, vendor_notes: _vn, event_goer_notes: _egn, share_with_event_goers: _sweg, allow_duplicate_categories: _adc, allow_duplicate_subcategories: _ads, ...fallback } = eventPayload;
      ({ data: newEvent, error: eventErr } = await supabase.from('events').insert(fallback).select().single());
    }
    if (eventErr) {
      console.error('Event submit error:', eventErr);
      alert(`Failed to submit event: ${eventErr.message}\n\nPlease try again or contact support@southjerseyvendormarket.com`);
      return;
    }
    // Send concierge email with payment link
    // Upload event photos
    if (newEvent && files.eventPhotos && files.eventPhotos.length > 0) {
      const bucket = 'vendor-files';
      const eid = newEvent.id;
      const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const photoUrls = [];
      for (let i = 0; i < Math.min(files.eventPhotos.length, 6); i++) {
        const f = files.eventPhotos[i];
        const path = `events/${eid}/photos/${i}-${safeName(f.name)}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, f, { upsert: true, contentType: f.type });
        if (upErr) {
          console.error('Event photo upload error:', upErr);
          // Try alternate bucket name
          const { error: upErr2 } = await supabase.storage.from('event-photos').upload(path, f, { upsert: true, contentType: f.type });
          if (upErr2) { console.error('Alternate bucket also failed:', upErr2); continue; }
          photoUrls.push(supabase.storage.from('event-photos').getPublicUrl(path).data.publicUrl);
        } else {
          photoUrls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
        }
      }
      if (photoUrls.length > 0) {
        // Save first photo to photo_url (column that definitely exists)
        const { error: puErr } = await supabase.from('events').update({ photo_url: photoUrls[0] }).eq('id', eid);
        if (puErr) console.error('photo_url update failed:', puErr.message);
        // Try saving all photos to event_photos array column
        const { error: epErr } = await supabase.from('events').update({ event_photos: photoUrls }).eq('id', eid);
        if (epErr) console.error('event_photos update failed:', epErr.message);
        // Update local state
        newEvent.photo_url = photoUrls[0];
        newEvent.event_photos = photoUrls;
      }
    }
    // Send host confirmation email
    try {
      await fetch('/api/send-host-confirmation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostEmail: form.email, hostName: form.contactName, eventName: form.eventName || form.eventType, eventDate: form.date, eventType: form.eventType }),
      });
    } catch (e) { console.error('Host confirmation email failed:', e); }
    // Notify admin of new event submission (styled email with gold button)
    fetch('/api/send-event-admin-notification', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ eventName: form.eventName||form.eventType, hostName: form.contactName, hostEmail: form.email, eventDate: form.date, eventType: form.eventType, eventZip: form.eventZip }),
    }).catch(e=>console.error('API call failed:',e));

    // Generate individual event rows for recurring events
    const allNewEvents = newEvent ? [newEvent] : [];
    if (newEvent && form.isRecurring) {
      try {
        const baseDate = new Date(form.date + 'T12:00:00');
        const dates = [];
        const maxOccurrences = form.recurrenceEndType === 'after' ? (form.recurrenceCount || 4) : 26; // default max 26 weeks
        const endDate = form.recurrenceEndType === 'ondate' && form.recurrenceEndDate ? new Date(form.recurrenceEndDate + 'T12:00:00') : new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        if (form.recurrenceFrequency === 'daily') {
          for (let i = 1; i < maxOccurrences; i++) {
            const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
            if (d > endDate) break;
            dates.push(d);
          }
        } else if (form.recurrenceFrequency === 'weekly') {
          for (let i = 1; i < maxOccurrences; i++) {
            const d = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
            if (d > endDate) break;
            dates.push(d);
          }
        } else if (form.recurrenceFrequency === 'biweekly') {
          for (let i = 1; i < maxOccurrences; i++) {
            const d = new Date(baseDate.getTime() + i * 14 * 24 * 60 * 60 * 1000);
            if (d > endDate) break;
            dates.push(d);
          }
        } else if (form.recurrenceFrequency === 'monthly') {
          for (let i = 1; i < maxOccurrences; i++) {
            const d = new Date(baseDate);
            d.setMonth(d.getMonth() + i);
            if (d > endDate) break;
            dates.push(d);
          }
        } else if (form.recurrenceFrequency === 'custom' && form.recurrenceWeekInterval) {
          for (let i = 1; i < maxOccurrences; i++) {
            const d = new Date(baseDate.getTime() + i * form.recurrenceWeekInterval * 7 * 24 * 60 * 60 * 1000);
            if (d > endDate) break;
            dates.push(d);
          }
        }

        // Insert each occurrence as a separate event row
        for (const d of dates) {
          const dateStr = d.toISOString().split('T')[0];
          const recurPayload = { ...eventPayload, date: dateStr, source: 'Recurring Series' };
          // Remove columns that might not exist
          const { vendor_discovery: _vd, event_link: _el, vendor_notes: _vn, event_goer_notes: _egn, share_with_event_goers: _sweg, allow_duplicate_categories: _adc, allow_duplicate_subcategories: _ads, ...safePayload } = recurPayload;
          const { data: recurEvent } = await supabase.from('events').insert(safePayload).select().single();
          if (recurEvent) allNewEvents.push(recurEvent);
        }
      } catch (recurErr) { console.error('Recurring event generation error:', recurErr); }
    }

    // Add all events to state (original + recurring instances)
    if (allNewEvents.length > 0) {
      const mapped = allNewEvents.map(dbEventToApp);
      setUserEvents(prev => { const ids = new Set(prev.map(e=>e.id)); return [...mapped.filter(e=>!ids.has(e.id)), ...prev]; });
      setAllEvents(prev => { const ids = new Set(prev.map(e=>e.id)); return [...mapped.filter(e=>!ids.has(e.id)), ...prev]; });
    }
    setHostEvent(form);
    setHostConfirm({ ref: generateRef(), email: form.email, eventName: form.eventName || form.eventType, isPending: true });
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
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
          {isAdmin && (
            <button onClick={()=>{setTab('admin');window.scrollTo({top:0});}} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>
              Admin{(pendingVendors.length + allEvents.filter(e=>e.status==='pending_review').length) > 0 ? ` (${pendingVendors.length + allEvents.filter(e=>e.status==='pending_review').length})` : ''}
            </button>
          )}
          {authUser && vendorProfile && tab !== 'vendor-dashboard' && (
            <button onClick={()=>{setTab('vendor-dashboard');window.scrollTo({top:0});}} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>My Vendor Dashboard</button>
          )}
          {authUser && hasBeenHost && tab !== 'host-dashboard' && (
            <button onClick={()=>{setTab('host-dashboard');window.scrollTo({top:0});}} style={{background:'#c8a850',color:'#1a1410',border:'none',borderRadius:6,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>My Host Dashboard</button>
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
                    {hasBeenHost && <button className={`mobile-menu-item${tab==='host-dashboard'?' active':''}`} onClick={()=>navTo('host-dashboard')}>Host Dashboard</button>}
                    {eventGoerProfile && <button className={`mobile-menu-item${tab==='event-goer-dashboard'?' active':''}`} onClick={()=>navTo('event-goer-dashboard')}>Event Guest Dashboard</button>}
                    {isAdmin && <button className={`mobile-menu-item${tab==='admin'?' active':''}`} onClick={()=>navTo('admin')} style={{color:'#e8c97a'}}>Admin Panel</button>}
                    <button className="mobile-menu-item" style={{color:'#c8a850'}} onClick={()=>{handleLogout();setMobileMenuOpen(false);}}>Log Out</button>
                  </>
                ) : (
                  <button className="mobile-menu-item" style={{color:'#c8a850',fontWeight:700}} onClick={()=>{setShowAuthModal(true);setMobileMenuOpen(false);}}>Log In / Sign Up</button>
                )}
              </div>
              {authUser && (
                <div className="mobile-menu-section">
                  <div className="mobile-menu-label">My Stuff</div>
                  <button className={`mobile-menu-item${tab==='messages'?' active':''}`} onClick={()=>navTo('messages')}>Messages{unreadCount>0?` (${unreadCount})`:''}</button>
                  <button className={`mobile-menu-item${tab==='my-calendar'||tab==='calendar'||tab==='host-calendar'?' active':''}`} onClick={()=>navTo('my-calendar')}>My Calendar</button>
                </div>
              )}
              <div className="mobile-menu-section">
                <div className="mobile-menu-label">Quick Actions</div>
                {(authUser && userEvents.length > 0) && <button className={`mobile-menu-item${tab==='matches'?' active':''}`} onClick={()=>navTo('matches')}>Browse Vendors</button>}
                <button className={`mobile-menu-item${tab==='host'?' active':''}`} onClick={()=>navTo('host')}>Add an Event</button>
                <button className={`mobile-menu-item${tab==='vendor'?' active':''}`} onClick={()=>navTo('vendor')}>Add a Vendor Profile</button>
                <button className={`mobile-menu-item${tab==='opportunities'?' active':''}`} onClick={()=>navTo('opportunities')}>Browse Opportunities</button>
              </div>
              <div className="mobile-menu-section">
                <div className="mobile-menu-label">Explore</div>
                <button className={`mobile-menu-item${tab==='home'?' active':''}`} onClick={()=>navTo('home')}>Home</button>
                <button className={`mobile-menu-item${tab==='upcoming-markets'?' active':''}`} onClick={()=>navTo('upcoming-markets')}>Upcoming Events</button>
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
            <button className={`nav-tab${tab==="upcoming-markets"?" active":""}`} onClick={()=>{setTab("upcoming-markets");window.scrollTo({top:0});}}>Upcoming Events</button>
            <div className="nav-group">
              <div className="nav-group-label">&#128717; Vendors</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="vendor"?" active":""}`} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>Add a Vendor Profile</button>
                <button className={`nav-tab${tab==="opportunities"?" active":""}`} onClick={()=>{setTab("opportunities");window.scrollTo({top:0});}}>Opportunities</button>
                <button className={`nav-tab${tab==="messages"?" active":""}`} onClick={()=>{setTab("messages");window.scrollTo({top:0});}}>
                  Messages{unreadCount>0?` (${unreadCount})`:''}
                </button>
              </div>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">&#127918; Hosts</div>
              <div className="nav-group-items">
                <button className={`nav-tab${tab==="host"?" active":""}`} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>Add an Event</button>
                {(!vendorProfile || userEvents.length > 0) && <button className={`nav-tab${tab==="matches"?" active":""}`} onClick={()=>{setTab("matches");window.scrollTo({top:0});}}>Browse Vendors</button>}
                <button className={`nav-tab${tab==="messages"?" active":""}`} onClick={()=>{setTab("messages");window.scrollTo({top:0});}}>
                  Messages{unreadCount>0?` (${unreadCount})`:''}
                </button>
              </div>
            </div>
            <button className={`nav-tab${tab==="pricing"?" active":""}`} onClick={()=>{setTab("pricing");window.scrollTo({top:0});}}>Pricing</button>
            <button className="nav-tab" onClick={()=>setShowContactModal(true)}>Contact Us</button>
            <button className={`nav-tab${tab==="tos"?" active":""}`} onClick={()=>{setTab("tos");window.scrollTo({top:0});}}>Terms</button>
            {isAdmin && <button className={`nav-tab${tab==="admin"?" active":""}`} onClick={()=>{setTab("admin");window.scrollTo({top:0});}}>Admin</button>}
            {authUser ? (
              <div className="nav-group">
                <div className="nav-group-label">&#128100; Account{vendorProfile && hasBeenHost ? ' (Vendor + Host)' : vendorProfile ? ' (Vendor)' : hasBeenHost ? ' (Host)' : ''}</div>
                <div className="nav-group-items">
                  {vendorProfile && <button className={`nav-tab${tab==="vendor-dashboard"?" active":""}`} onClick={()=>{setTab("vendor-dashboard");window.scrollTo({top:0});}}>Vendor Dashboard</button>}
                  {hasBeenHost && <button className={`nav-tab${tab==="host-dashboard"?" active":""}`} onClick={()=>{setTab("host-dashboard");window.scrollTo({top:0});}}>Host Dashboard</button>}
                  {vendorProfile && !hasBeenHost && <button className="nav-tab" style={{fontSize:12,color:'#a89a8a'}} onClick={()=>{setTab("host");window.scrollTo({top:0});}}>+ Add Host Role</button>}
                  {!vendorProfile && hasBeenHost && <button className="nav-tab" style={{fontSize:12,color:'#a89a8a'}} onClick={()=>{setTab("vendor");window.scrollTo({top:0});}}>+ Add Vendor Role</button>}
                  <button className={`nav-tab${tab==="my-calendar"?" active":""}`} onClick={()=>{setTab("my-calendar");window.scrollTo({top:0});}}>My Calendar</button>
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

            {/* How It Works — toggle */}
            <div style={{textAlign:'center',marginTop:20,marginBottom:8}}>
              <button onClick={()=>setShowHowItWorks(s=>!s)} style={{background:'none',border:'1px solid rgba(200,168,80,0.4)',color:'#c8a850',borderRadius:8,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Public Sans',sans-serif",letterSpacing:0.3}}>
                {showHowItWorks ? 'Hide How It Works ▲' : 'How It Works ▼'}
              </button>
            </div>
            {showHowItWorks && (
              <div style={{padding:'0 24px',maxWidth:1200,margin:'0 auto',width:'100%',boxSizing:'border-box'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
                  {[
                    {title:'For Vendors',steps:['Create your profile — pick your category, set your travel radius, and upload photos. Offer more than one product or service? You can create separate listings for each under one account.','Get matched & discovered — hosts can find you and request you for their event, or you can browse open events and apply directly to the ones that fit.','Respond & manage — accept or decline host requests, message hosts directly, and manage all your events from your dashboard.']},
                    {title:'For Event Hosts',steps:['Add your event — enter your event details, pick the vendor categories you need, and set your preferences.','Find vendors — browse matched vendors in your area, or let vendors come to you through applications.','Book & manage — review applications, send booking requests, and coordinate everything in one place.']},
                    {title:'For Event Guests',steps:['Sign up for alerts — enter your zip code and pick the event types you love.','Discover events — browse upcoming markets, pop-ups, and festivals near you.','See who\'s there — check which vendors are attending before you go.']},
                  ].map(col=>(
                    <div key={col.title} style={{background:'rgba(200,168,80,0.08)',border:'1px solid rgba(200,168,80,0.2)',borderRadius:10,padding:'20px 18px'}}>
                      <div style={{fontFamily:"'Lexend Deca',sans-serif",fontSize:15,color:'#c8a850',fontWeight:700,marginBottom:12}}>{col.title}</div>
                      {col.steps.map((step,i)=>(
                        <div key={i} style={{display:'flex',gap:10,marginBottom:10}}>
                          <div style={{width:22,height:22,borderRadius:'50%',background:'#c8a850',color:'#0e0c0a',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>{i+1}</div>
                          <div style={{fontSize:13,color:'#c8b898',lineHeight:1.5}}><strong style={{color:'#fff'}}>{step.split(' — ')[0]}</strong> — {step.split(' — ')[1]}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p style={{textAlign:'center',fontSize:12,color:'#a89a8a',lineHeight:1.6,maxWidth:600,margin:'16px auto 0'}}>
                  <strong style={{color:'#c8a850'}}>No event fees through our platform.</strong> South Jersey Vendor Market is a matching service — all event fees, service rates, and contracts are handled directly between vendors and hosts. We connect you; you handle the rest.
                </p>
              </div>
            )}

            {/* Three cards */}
            <div className="home-columns" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:1200,width:'100%',margin:'0 auto',padding:'32px 32px 0'}}>
              {[
                { title:'Vendors', desc:'Create your profile, set your travel radius, and get matched with events looking for what you offer.',
                  buttons:[{label:'Add a Vendor Profile',tab:'vendor',signupRole:'vendor'},{label:'Browse Opportunities',tab:'opportunities'},...(authUser?[{label:'My Calendar',tab:'calendar'}]:[])] },
                { title:'Event Hosts', desc:'Post your event for free, browse vendor profiles, send booking requests, and manage it all in one place.',
                  buttons:[{label:'Add an Event',tab:'host',signupRole:'host'},{label:'Browse Vendors',tab:'matches'},...(authUser?[{label:'My Calendar',tab:'host-calendar'}]:[])] },
                { title:'Event Guests', desc:'Discover local markets, craft fairs, food festivals, and pop-up events happening across South Jersey.',
                  buttons:[{label:'Get Event Alerts',action:'eventGoerSignup',signupRole:'eventGoer'},{label:'Browse Upcoming Events',tab:'upcoming-markets'}] },
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
                      <button key={b.label} onClick={()=>{
                        // If not logged in and this is a primary signup action, open unified signup
                        if (!authUser && b.signupRole) { openSignup(b.signupRole); return; }
                        if (b.action==='eventGoerSignup') { if(authUser) setShowEventGoerSignup(true); else openSignup('eventGoer'); return; }
                        setTab(b.tab); window.scrollTo({top:0});
                      }}
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
                      <a href={`mailto:${vendorConfirm.email}?subject=Your SJVM Add a Vendor Profile — ${vendorConfirm.ref}&body=Hi ${vendorConfirm.name},%0A%0AThank you for registering with South Jersey Vendor Market!%0A%0AYour confirmation number is: ${vendorConfirm.ref}%0A%0AWhat happens next:%0A• Your listing will be reviewed within 24 hours%0A• You'll be matched with nearby events automatically%0A• Check Messages for booking requests from hosts%0A%0A— South Jersey Vendor Market%0Asupport@southjerseyvendormarket.com`}
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
                <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:10,padding:'16px 20px',marginTop:24}}>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a4a6b',marginBottom:6}}>Have another business or service?</div>
                  <p style={{fontSize:13,color:'#1a4a6b',lineHeight:1.6,margin:'0 0 12px'}}>You can create multiple listings under one account — one for each thing you offer. Each listing gets its own categories, photos, pricing, and event matches.</p>
                  <button style={{background:'#1a4a6b',color:'#fff',border:'none',borderRadius:6,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}} onClick={()=>{setVendorSuccess(false);setVendorConfirm(null);}}>+ Add Another Listing</button>
                </div>
              </>
            ) : (
              <>
                <div className="section-title">Add a Vendor Profile</div>
                <p className="section-sub">Join South Jersey's growing vendor community and get matched with events near you.</p>
                {authUser && vendorProfile && (
      <div style={{background:'#e8f4fd',border:'1px solid #b8d8f0',borderRadius:10,padding:'16px 20px',marginBottom:20,fontSize:14,color:'#1a4a6b',lineHeight:1.6}}>
        <strong>Adding another listing?</strong> This will create a separate profile under your account. Each listing gets its own categories, photos, and pricing — perfect if you offer different products or services.
      </div>
    )}
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
                <div className="section-title">Add an Event</div>
                <p className="section-sub">Tell us about your event and we'll find the perfect vendors for you.</p>
                <HostForm onSubmit={handleHostSubmit} setTab={setTab} authUser={authUser} setShowAuthModal={setShowAuthModal} />
              </>
            )}
          </div>
        )}

        {tab==="matches"      && (loading
            ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading vendors…</div>
            : <MatchesPage vendors={vendors} openMessage={openMessage} sendBookingRequest={sendBookingRequest} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} hostEvent={hostEvent} setHostEvent={setHostEvent} userEvents={userEvents} setTab={setTab} vendorCalendars={vendorCalendars} setVendorCalendars={setVendorCalendars} authUser={authUser} setShowAuthModal={setShowAuthModal} setInquiryModal={setInquiryModal} setEventMessageModal={setEventMessageModal} />)}
        {tab==="upcoming-markets" && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading events…</div>
          : <UpcomingMarketsPage opps={opps} setTab={setTab} setShowAuthModal={setShowAuthModal} setShowEventGoerSignup={setShowEventGoerSignup} />)}
        {tab==="opportunities" && (loading
          ? <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading events…</div>
          : <OpportunitiesPage opps={opps} authUser={authUser} vendorProfile={vendorProfile} allVendorProfiles={allVendorProfiles} setVendorProfile={setVendorProfile} setShowAuthModal={setShowAuthModal} messageEventHost={messageEventHost} />)}
        {tab==="pricing"       && <PricingPage setTab={setTab} authUser={authUser} vendorProfile={vendorProfile} userEvents={userEvents} setShowAuthModal={setShowAuthModal} setShowContactModal={setShowContactModal} />}
        {tab==="admin"         && <AdminPage opps={opps} setOpps={setOpps} allEvents={allEvents} setAllEvents={setAllEvents} vendorSubs={vendorSubs} vendors={vendors} setVendors={setVendors} pendingVendors={pendingVendors} setPendingVendors={setPendingVendors} isAdmin={isAdmin} eventGoers={eventGoers} setEventGoers={setEventGoers} />}
        {tab==="messages"      && <MessagesPage conversations={conversations} setConversations={setConversations} activeConvoId={activeConvoId} setActiveConvoId={setActiveConvoId} bookingRequests={bookingRequests} setBookingRequests={setBookingRequests} authUser={authUser} vendorProfile={vendorProfile} loadMessages={loadMessages} setTab={setTab} />}
        {tab==="tos"           && <TosPage setTab={setTab} />}
        {(tab==="my-calendar" || tab==="calendar" || tab==="host-calendar") && <MyCalendarPage authUser={authUser} vendorProfile={vendorProfile} userEvents={userEvents} setTab={setTab} />}
        {tab==="vendor-dashboard" && authUser && vendorProfile && <VendorDashboard user={authUser} vendorProfile={vendorProfile} setVendorProfile={setVendorProfile} allVendorProfiles={allVendorProfiles} bookingRequests={bookingRequests} setTab={setTab} setShowContactModal={setShowContactModal} setShowFeedbackModal={setShowFeedbackModal} conversations={conversations} setConversations={setConversations} setActiveConvoId={setActiveConvoId} unreadCount={unreadCount} opps={opps} />}
        {tab==="host-dashboard"   && authUser && <HostDashboard user={authUser} userEvents={userEvents} setUserEvents={setUserEvents} setTab={setTab} setShowContactModal={setShowContactModal} setShowFeedbackModal={setShowFeedbackModal} unreadCount={unreadCount} conversations={conversations} openMessage={openMessage} setAllEvents={setAllEvents} setOpps={setOpps} setHostEventFromDashboard={(e)=>{const svcNeeded=(()=>{try{return typeof e.services_needed==='string'?JSON.parse(e.services_needed):(e.services_needed||[]);}catch{return[];}})();setHostEvent({eventName:e.event_name,eventType:e.event_type,eventZip:e.zip,date:e.date,startTime:e.start_time,endTime:e.end_time,contactName:e.contact_name,email:e.contact_email,vendorCategories:e.categories_needed||[],servicesNeeded:svcNeeded,vendorCount:e.spots,budget:e.booth_fee,notes:e.notes,eventId:e.id,source:e.source});}} />}
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
      {showAuthModal && <AuthModal onClose={()=>{setShowAuthModal(false);setAuthModalMode(null);setAuthModalRole(null);}} onAuth={()=>{}} defaultEmail={authEmail} setTab={setTab} setShowEventGoerSignup={setShowEventGoerSignup} defaultMode={authModalMode} defaultRole={authModalRole} />}
      {showContactModal && <ContactModal onClose={()=>setShowContactModal(false)} userName={authUser?.user_metadata?.full_name||''} userEmail={authUser?.email||''} />}
      {showFeedbackModal && <FeedbackModal onClose={()=>setShowFeedbackModal(false)} userEmail={authUser?.email||''} />}
      {showEventGoerSignup && <EventGoerSignupModal onClose={()=>setShowEventGoerSignup(false)} defaultEmail={authUser?.email||''} defaultName={vendorProfile?.contact_name||''} onSuccess={()=>{ supabase.from('event_goers').select('*').eq('active',true).then(({data})=>{if(data)setEventGoers(data);}); if(authUser) supabase.from('event_goers').select('*').eq('email',authUser.email).limit(1).single().then(({data})=>{if(data)setEventGoerProfile(data);}); }} />}
      {inquiryModal && <InquiryModal vendor={inquiryModal.vendor} onClose={()=>setInquiryModal(null)} onSend={(type,msg)=>{openMessage(inquiryModal.vendor,type,msg);setInquiryModal(null);}} />}
      {eventMessageModal && <EventMessageModal vendor={eventMessageModal.vendor} eventName={eventMessageModal.eventName} onClose={()=>setEventMessageModal(null)} onSend={async(msg)=>{await openMessage(eventMessageModal.vendor,null,msg);setEventMessageModal(null);}} />}
    </>
  );
}

function InquiryModal({ vendor, onClose, onSend }) {
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const types = ['Planning a Future Event','Checking Availability','General Inquiry'];
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:460,width:'100%',overflow:'hidden'}}>
        <div style={{background:'#1a1410',padding:'20px 24px'}}>
          <div style={{fontSize:14,color:'#a89a8a'}}>Message Vendor</div>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>{vendor?.name}</div>
        </div>
        <div style={{padding:'24px'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#1a1410',marginBottom:10}}>What is this inquiry about?</div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {types.map(t=>(
              <button key={t} onClick={()=>setInquiryType(t)} style={{textAlign:'left',padding:'10px 14px',borderRadius:8,border:inquiryType===t?'2px solid #c8a850':'1px solid #e8ddd0',background:inquiryType===t?'#fdf9f0':'#fff',cursor:'pointer',fontSize:14,fontWeight:inquiryType===t?600:400,color:'#1a1410',fontFamily:'DM Sans,sans-serif'}}>{t}</button>
            ))}
          </div>
          <div className="form-group" style={{marginBottom:16}}>
            <label>Message (optional)</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Tell the vendor what you're looking for..." style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'10px 14px',fontSize:14,fontFamily:'DM Sans,sans-serif',resize:'vertical',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{fontSize:11,color:'#a89a8a',marginBottom:16,lineHeight:1.5}}>
            Vendor contact info is not shared through general messaging. Contact details are only revealed after an accepted booking on a posted event.
          </div>
          <div style={{display:'flex',gap:10}}>
            <button disabled={!inquiryType} onClick={()=>onSend(inquiryType,message)} style={{flex:2,background:inquiryType?'#1a1410':'#e8ddd0',color:inquiryType?'#e8c97a':'#a89a8a',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:inquiryType?'pointer':'default',fontFamily:'DM Sans,sans-serif'}}>Send Message</button>
            <button onClick={onClose} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventMessageModal({ vendor, eventName, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:480,width:'100%',overflow:'hidden'}}>
        <div style={{background:'#1a1410',padding:'20px 24px'}}>
          <div style={{fontSize:14,color:'#a89a8a'}}>Message Vendor</div>
          <div style={{fontSize:20,fontWeight:700,color:'#e8c97a',fontFamily:'Playfair Display,serif'}}>{vendor?.name}</div>
          {eventName && <div style={{fontSize:13,color:'#c8a850',marginTop:4}}>📋 Regarding: {eventName}</div>}
        </div>
        <div style={{padding:'24px'}}>
          <div className="form-group" style={{marginBottom:16}}>
            <label>Your Message *</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Introduce yourself, ask about availability, discuss event details..." style={{width:'100%',border:'1.5px solid #e0d5c5',borderRadius:8,padding:'10px 14px',fontSize:14,fontFamily:'DM Sans,sans-serif',resize:'vertical',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{fontSize:11,color:'#a89a8a',marginBottom:16,lineHeight:1.5}}>
            Vendor contact info is not shared through messaging. Contact details are only revealed after an accepted booking on a posted event.
          </div>
          <div style={{display:'flex',gap:10}}>
            <button disabled={!message.trim()||sending} onClick={async()=>{setSending(true);await onSend(message.trim());setSending(false);}} style={{flex:2,background:message.trim()?'#1a1410':'#e8ddd0',color:message.trim()?'#e8c97a':'#a89a8a',border:'none',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:700,cursor:message.trim()?'pointer':'default',fontFamily:'DM Sans,sans-serif'}}>{sending?'Sending...':'Send Message'}</button>
            <button onClick={onClose} style={{flex:1,background:'#f5f0ea',color:'#1a1410',border:'1px solid #e0d5c5',borderRadius:8,padding:'12px 0',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const respondToken = new URLSearchParams(window.location.search).get('respond');
  if (respondToken) return <ErrorBoundary><VendorResponsePage token={respondToken} /></ErrorBoundary>;
  return <ErrorBoundary><AppInner /></ErrorBoundary>;
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
function MessagesPage({ conversations, setConversations, activeConvoId, setActiveConvoId, bookingRequests, setBookingRequests, authUser, vendorProfile, loadMessages, setTab }) {
  const [draft, setDraft] = useState('');
  const senderName = vendorProfile?.contact_name || vendorProfile?.name || authUser?.email || 'User';
  const [uploading, setUploading] = useState(false);
  const [stagedAttachments, setStagedAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  // Scroll to bottom of messages container (not the page)
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeConvo?.messages?.length]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!activeConvoId || !authUser) return;
    supabase.from('messages').update({ is_read: true })
      .eq('conversation_id', activeConvoId)
      .eq('recipient_id', authUser.id)
      .eq('is_read', false)
      .then(() => { if (loadMessages) loadMessages(); })
      .catch(() => {});
  }, [activeConvoId, authUser]); // eslint-disable-line

  const addMessage = async (text, attachments) => {
    const uid = authUser?.id || 'anon';
    const conv = conversations.find(c => c.id === activeConvoId);
    if (!conv) return;
    const isVendor = !!vendorProfile;
    // Determine recipient from canonical convoId: the other party's ID
    const convoIdParts = activeConvoId.split('_');
    const otherId = convoIdParts[0] === uid ? convoIdParts[1] : convoIdParts[0];
    const recipientId = otherId || conv.vendorId || 'unknown';
    const ts = new Date().toISOString();
    // Update UI immediately
    const myFrom = isVendor ? 'vendor' : 'host';
    setConversations(convos => convos.map(c => {
      if (c.id !== activeConvoId) return c;
      return { ...c, messages: [...c.messages, { id: Date.now(), from: myFrom, senderName, text: text || '', ts, ...(attachments && attachments.length > 0 ? { attachments } : {}) }] };
    }));
    // Save to Supabase — try with attachments, fall back without
    const msgPayload = {
      conversation_id: activeConvoId,
      sender_id: uid, sender_type: isVendor ? 'vendor' : 'host',
      recipient_id: recipientId, recipient_type: isVendor ? 'host' : 'vendor',
      event_name: conv.eventName || '',
      message_text: text || '(file attachment)',
      is_read: false,
    };
    let saved = false;
    if (attachments && attachments.length > 0) {
      const { error } = await supabase.from('messages').insert({ ...msgPayload, attachments });
      if (error) {
        console.error('Message with attachments failed, retrying without:', error.message);
        const { error: e2 } = await supabase.from('messages').insert(msgPayload);
        saved = !e2;
        if (e2) console.error('Message save failed:', e2.message);
      } else { saved = true; }
    } else {
      const { error } = await supabase.from('messages').insert(msgPayload);
      saved = !error;
      if (error) console.error('Message save failed:', error.message);
    }
    // Send email notification to recipient — always try regardless of save status
    (async () => {
      try {
        let recipientEmail = null, recipientName = null;
        if (isVendor) {
          // Vendor sending to host — look up by user_id in events table
          const { data } = await supabase.from('events').select('contact_email,contact_name').eq('user_id', recipientId).limit(1);
          if (data?.[0]) { recipientEmail = data[0].contact_email; recipientName = data[0].contact_name; }
        } else {
          // Host sending to vendor — look up by user_id in vendors table
          const { data } = await supabase.from('vendors').select('contact_email,contact_name').eq('user_id', recipientId).limit(1);
          if (data?.[0]) { recipientEmail = data[0].contact_email; recipientName = data[0].contact_name; }
        }
        if (recipientEmail) {
          fetch('/api/send-message-notification', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ recipientEmail, recipientName, senderName, senderType: isVendor ? 'vendor' : 'host', recipientType: isVendor ? 'host' : 'vendor', eventName: conv.eventName || '', messagePreview: text || '' }),
          }).catch(e=>console.error('Message notification failed:',e));
        }
      } catch (e) { console.error('Email lookup error:', e); }
    })();
  };

  const sendMessage = () => {
    if (!draft.trim() && stagedAttachments.length === 0) return;
    addMessage(draft.trim() || (stagedAttachments.length > 0 ? '' : ''), stagedAttachments.length > 0 ? stagedAttachments : undefined);
    setDraft('');
    setStagedAttachments([]);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversized = files.find(f => f.size > maxSize);
    if (oversized) { alert(`"${oversized.name}" is too large. Maximum file size is 10MB.`); return; }
    setUploading(true);
    const bucket = 'vendor-files';
    const convoId = activeConvoId;
    const uploaded = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
      const path = `messages/${convoId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { console.error('Upload error:', upErr); continue; }
      const url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      uploaded.push({ name: file.name, url, type: file.type, size: file.size });
    }
    if (uploaded.length > 0) {
      setStagedAttachments(prev => [...prev, ...uploaded]);
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
      const uid = authUser?.id || 'anon';
      const convoId = conversations.find(c => c.vendorId === req.vendorId)?.id || `${uid}_${req.vendorId}`;
      const msg = status === 'accepted'
        ? `✅ Booking accepted! ${vendorMsg ? 'Vendor note: ' + vendorMsg : ''} The host will be in touch to confirm details. You're all set for ${req.eventName || 'the event'}!`
        : `❌ Booking declined. ${vendorMsg ? 'Reason: ' + vendorMsg : 'The vendor is unavailable for this date.'} We recommend messaging other vendors.`;
      supabase.from('messages').insert({
        conversation_id: convoId, sender_id: 'system', sender_type: 'system',
        recipient_id: uid, recipient_type: 'host',
        event_name: req.eventName || '', message_text: msg, is_read: false,
      }).catch(e=>console.error('API call failed:',e));
      setConversations(convos => convos.map(c => {
        if (c.vendorId !== req.vendorId) return c;
        return {...c, status: status==='accepted'?'booked':'active', messages: [...c.messages, {id:Date.now(), from:'system', text: msg, ts:new Date().toISOString()}]};
      }));
      // Email host about booking response
      if (req.hostEmail) {
        fetch('/api/send-booking-response', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ hostEmail:req.hostEmail, hostName:req.hostName, vendorName:req.vendorName, vendorCategory:req.vendorCategory, eventName:req.eventName, eventDate:req.eventDate, status, vendorMessage:vendorMsg }),
        }).catch(e=>console.error('API call failed:',e));
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
              {c.eventName && <div style={{ fontSize:11, color:'#c8a850', marginBottom:2, fontWeight:600 }}>📋 {c.eventName}</div>}
              <div style={{ fontSize:12, color:'#a89a8a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {c.messages[c.messages.length - 1]?.text?.slice(0, 50)}
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
                <button onClick={()=>{if(setTab){setTab(vendorProfile ? 'vendor-dashboard' : 'matches');window.scrollTo({top:0});}}} style={{background:'none',border:'none',padding:0,cursor:'pointer',fontFamily:'Playfair Display,serif',fontSize:18,color:'#1a1410',textDecoration:'underline',textDecorationColor:'#e8ddd0',textAlign:'left'}}>{activeConvo.vendorName}</button>
                <div style={{ fontSize:12, color:'#a89a8a', textTransform:'uppercase', letterSpacing:1 }}>{activeConvo.vendorCategory}</div>
                {activeConvo.eventName && <button onClick={()=>{if(setTab){
                  const isVendorUser = !!vendorProfile;
                  if (!isVendorUser) { setTab('host-dashboard'); }
                  else {
                    // Check if vendor is booked for this event
                    const bookedForEvent = (bookingRequests||[]).some(r=>r.status==='accepted'&&activeConvo.eventName.includes(r.eventName||r.event_name));
                    setTab(bookedForEvent ? 'vendor-dashboard' : 'opportunities');
                  }
                  window.scrollTo({top:0});
                }}} style={{background:'none',border:'none',padding:0,cursor:'pointer',fontSize:12,color:'#c8a850',fontWeight:600,marginTop:2,textAlign:'left'}}>📋 {activeConvo.eventName} →</button>}
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={async()=>{if(!window.confirm('Delete this conversation permanently? This cannot be undone.'))return;const cid=activeConvoId;const uid=authUser?.id;const{error}=await supabase.from('messages').delete().eq('conversation_id',cid);if(error){console.error('Delete failed:',error.message);const{error:e2}=await supabase.from('messages').delete().eq('conversation_id',cid).or(`sender_id.eq.${uid},recipient_id.eq.${uid}`);if(e2)console.error('Filtered delete also failed:',e2.message);}setConversations(cs=>cs.filter(c=>c.id!==cid));setActiveConvoId(null);if(loadMessages)setTimeout(loadMessages,300);}} style={{background:'#fdecea',color:'#8b1a1a',border:'1px solid #f5c6c6',borderRadius:6,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Delete</button>
            </div>
          </div>

          {/* Platform protection notice */}
          <div style={{ background:'#fdf9f5', borderBottom:'1px solid #e8ddd0', padding:'7px 24px', fontSize:12, color:'#7a6a5a', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            🔒 <strong>Secure platform messaging.</strong> Contact info is shared only after a booking is confirmed. All interactions are covered by our <button onClick={()=>{if(setTab){setTab('tos');window.scrollTo({top:0});}}} style={{background:'none',border:'none',padding:0,color:'#c8a84b',textDecoration:'underline',fontWeight:600,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>Terms of Service</button>.
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
            {/* Staged attachments preview */}
            {stagedAttachments.length > 0 && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10,padding:'8px 10px',background:'#fdf9f5',borderRadius:8,border:'1px solid #e8ddd0'}}>
                {stagedAttachments.map((att,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,background:'#fff',border:'1px solid #e0d5c5',borderRadius:6,padding:'4px 8px',fontSize:12}}>
                    {att.type?.startsWith('image/') ? <img src={att.url} alt={att.name} style={{width:32,height:32,objectFit:'cover',borderRadius:4}} /> : <span>📎</span>}
                    <span style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{att.name}</span>
                    <button onClick={()=>setStagedAttachments(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'#c0392b',cursor:'pointer',fontSize:14,padding:0,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            )}
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
            <div style={{ fontSize:11, color:'#a89a8a', marginTop:6, lineHeight:1.5 }}>
              📎 Share documents, images, or links<br/>This conversation is protected under the <button onClick={()=>{if(setTab){setTab('tos');window.scrollTo({top:0});}}} style={{background:'none',border:'none',padding:0,color:'#c8a84b',fontWeight:700,cursor:'pointer',fontSize:11,fontFamily:'inherit',textDecoration:'underline'}}>South Jersey Vendor Market Non-Circumvention Agreement</button>. Vendor contact info is shared only after an accepted booking on a posted event.
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
          <button className="btn-primary" onClick={()=>setTab('vendor')}>Add a Vendor Profile</button>
          <button className="btn-outline" onClick={()=>setTab('host')}>Add an Event</button>
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

// ─── Unified My Calendar Page ─────────────────────────────────────────────────
function MyCalendarPage({ authUser, vendorProfile, userEvents, setTab }) {
  const [hostEvents, setHostEvents] = useState(userEvents || []);
  const [vendorBookings, setVendorBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockedDates, setBlockedDates] = useState(() => { try { return JSON.parse(localStorage.getItem('sjvm_blocked_dates')||'[]'); } catch { return []; } });
  const toggleBlockDate = (ds) => { setBlockedDates(bd => { const next = bd.includes(ds) ? bd.filter(d=>d!==ds) : [...bd,ds]; localStorage.setItem('sjvm_blocked_dates',JSON.stringify(next)); return next; }); };

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const dateStr = (d) => `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayStr = today.toISOString().split('T')[0];
  const prev = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const next = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const fmt12 = (t) => { if(!t)return''; const[h,m]=t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`; };
  const fmtD = (d) => d ? new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      // Fetch host events
      const { data: evts } = await supabase.from('events').select('*')
        .or(`user_id.eq.${authUser.id},contact_email.ilike.${authUser.email}`)
        .order('date', { ascending: true });
      if (mounted && evts) setHostEvents(evts);

      // Fetch vendor bookings
      let allReqs = [];
      if (vendorProfile?.id) {
        const { data } = await supabase.from('booking_requests').select('*').eq('vendor_id', vendorProfile.id);
        if (data) allReqs = data;
      }
      if (allReqs.length === 0 && vendorProfile?.contact_email) {
        const { data } = await supabase.from('booking_requests').select('*').ilike('host_email', vendorProfile.contact_email);
        if (data) allReqs = data;
      }
      if (allReqs.length === 0 && vendorProfile?.name) {
        const { data } = await supabase.from('booking_requests').select('*').ilike('vendor_name', vendorProfile.name);
        if (data) allReqs = data;
      }
      const seen = new Set(); allReqs = allReqs.filter(r => { if(seen.has(r.id)) return false; seen.add(r.id); return true; });
      if (mounted) setVendorBookings(allReqs);
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [authUser, vendorProfile]);

  // Navigate to first upcoming event
  useEffect(() => {
    const allDates = [...hostEvents.map(e=>e.date), ...vendorBookings.map(b=>b.event_date)].filter(Boolean).sort();
    const upcoming = allDates.find(d => d >= todayStr) || allDates[0];
    if (upcoming) { const [y,mo] = upcoming.split('-').map(Number); setViewYear(y); setViewMonth(mo-1); }
  }, [loading]);

  if (!authUser) {
    return (
      <div style={{textAlign:'center',padding:'80px 40px',color:'#7a6a5a'}}>
        <div style={{fontSize:48,marginBottom:16}}>📅</div>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:28,marginBottom:12,color:'#1a1410'}}>My Calendar</div>
        <p style={{fontSize:16,maxWidth:440,margin:'0 auto'}}>Log in to see your calendar.</p>
      </div>
    );
  }
  if (loading) return <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading calendar...</div>;

  // Build unified date map
  const dateMap = {};
  hostEvents.forEach(e => {
    if (!e.date) return;
    if (!dateMap[e.date]) dateMap[e.date] = { hostEvents:[], accepted:[], pending:[], service:[] };
    dateMap[e.date].hostEvents.push(e);
  });
  vendorBookings.forEach(b => {
    if (!b.event_date) return;
    if (!dateMap[b.event_date]) dateMap[b.event_date] = { hostEvents:[], accepted:[], pending:[], service:[] };
    const m = vendorProfile?.metadata || {};
    const isService = m.vendorType === 'service' || m.vendorType === 'both' || m.isServiceProvider;
    if (b.status === 'accepted') dateMap[b.event_date].accepted.push(b);
    else if (b.status === 'pending' && isService) dateMap[b.event_date].service.push(b);
    else if (b.status === 'pending') dateMap[b.event_date].pending.push(b);
  });

  const getCellColor = (ds) => {
    const d = dateMap[ds];
    if (!d) return null;
    if (d.accepted.length > 0) return '#1a6b3a'; // green — accepted vendor
    if (d.hostEvents.length > 0) return '#c8a84b'; // gold — host event
    if (d.service.length > 0) return '#2563eb'; // blue — service provider pending
    if (d.pending.length > 0) return '#d4a017'; // yellow — pending vendor
    return null;
  };

  const selectedInfo = selectedDate ? dateMap[selectedDate] : null;

  const acceptedTotal = vendorBookings.filter(b=>b.status==='accepted').length;
  const pendingTotal = vendorBookings.filter(b=>b.status==='pending').length;

  return (
    <div className="section" style={{maxWidth:900}}>
      <div className="section-title">My Calendar</div>
      <p className="section-sub">All your events and bookings in one view</p>

      {/* Legend */}
      <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:20,padding:'10px 16px',background:'#f5f0ea',borderRadius:8,border:'1px solid #e8ddd0'}}>
        {hostEvents.length > 0 && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#1a1410'}}><div style={{width:12,height:12,borderRadius:3,background:'#c8a84b'}}/> My Events (Host)</div>}
        {acceptedTotal > 0 && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#1a1410'}}><div style={{width:12,height:12,borderRadius:3,background:'#1a6b3a'}}/> Confirmed Bookings</div>}
        {pendingTotal > 0 && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#1a1410'}}><div style={{width:12,height:12,borderRadius:3,background:'#d4a017'}}/> Pending Applications</div>}
        {vendorBookings.some(b=>b.status==='pending'&&(vendorProfile?.metadata?.vendorType==='service'||vendorProfile?.metadata?.isServiceProvider)) && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#1a1410'}}><div style={{width:12,height:12,borderRadius:3,background:'#2563eb'}}/> Service Provider Apps</div>}
      </div>

      {/* Stats bar */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {hostEvents.length > 0 && <div style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700}}>{hostEvents.length} event{hostEvents.length!==1?'s':''} posted</div>}
        {acceptedTotal > 0 && <div style={{background:'#d4f4e0',color:'#1a6b3a',border:'1px solid #b8e8c8',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700}}>{acceptedTotal} confirmed booking{acceptedTotal!==1?'s':''}</div>}
        {pendingTotal > 0 && <div style={{background:'#fdf4dc',color:'#7a5a10',border:'1px solid #ffd966',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700}}>{pendingTotal} pending</div>}
      </div>

      {/* Calendar grid */}
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e8ddd0',overflow:'hidden',marginBottom:20}}>
        <div style={{background:'#1a1410',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={prev} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:20,fontWeight:700}}>‹</button>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#e8c97a'}}>{MONTHS[viewMonth]} {viewYear}</div>
          <button onClick={next} style={{background:'none',border:'none',color:'#c8a84b',cursor:'pointer',fontSize:20,fontWeight:700}}>›</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center'}}>
          {DAYS.map(d=><div key={d} style={{fontSize:11,color:'#a89a8a',fontWeight:600,padding:'8px 0',borderBottom:'1px solid #e8ddd0'}}>{d}</div>)}
          {Array(firstDay).fill(null).map((_,i)=><div key={'e'+i} style={{minHeight:70,borderRight:'1px solid #f0e8e0',borderBottom:'1px solid #f0e8e0',background:'#fafaf8'}}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d=i+1, ds=dateStr(d);
            const cellColor=getCellColor(ds);
            const isToday=ds===todayStr;
            const isSel=ds===selectedDate;
            const info=dateMap[ds];
            return (
              <div key={d} onClick={()=>setSelectedDate(isSel?null:ds)}
                style={{minHeight:70,borderRight:'1px solid #f0e8e0',borderBottom:'1px solid #f0e8e0',padding:'6px 4px',
                  cursor:'pointer',background:blockedDates.includes(ds)?'#fdecea':isSel?'#fdf9f5':'#fff',
                  boxShadow:isToday?'inset 0 0 0 2px #c8a84b':'none'}}>
                <div style={{fontSize:13,fontWeight:isToday?800:500,color:blockedDates.includes(ds)?'#8b1a1a':isToday?'#c8a84b':'#4a3a28',marginBottom:2}}>{d}{blockedDates.includes(ds)?'⛔':''}</div>
                {info && (
                  <div style={{display:'flex',flexDirection:'column',gap:2}}>
                    {info.hostEvents.map(e=>(
                      <div key={e.id} style={{background:'#c8a84b',color:'#1a1410',borderRadius:3,padding:'1px 4px',fontSize:9,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {e.event_name||e.event_type}
                      </div>
                    ))}
                    {info.accepted.map(b=>(
                      <div key={b.id} style={{background:'#1a6b3a',color:'#fff',borderRadius:3,padding:'1px 4px',fontSize:9,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {b.event_name||'Booking'}
                      </div>
                    ))}
                    {info.pending.map(b=>(
                      <div key={b.id} style={{background:'#d4a017',color:'#fff',borderRadius:3,padding:'1px 4px',fontSize:9,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {b.event_name||'Pending'}
                      </div>
                    ))}
                    {info.service.map(b=>(
                      <div key={b.id} style={{background:'#2563eb',color:'#fff',borderRadius:3,padding:'1px 4px',fontSize:9,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {b.event_name||'Service'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selectedDate && (
        <div style={{background:'#fff',borderRadius:12,border:'2px solid #c8a84b',padding:20,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'#1a1410'}}>{fmtD(selectedDate)}</div>
            <div style={{display:'flex',gap:6}}>
              {vendorProfile && (
                <button onClick={()=>toggleBlockDate(selectedDate)} style={{background:blockedDates.includes(selectedDate)?'#d4f4e0':'#fdecea',color:blockedDates.includes(selectedDate)?'#1a6b3a':'#8b1a1a',border:'none',borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{blockedDates.includes(selectedDate)?'✓ Unblock Date':'⛔ Block Date'}</button>
              )}
              <button onClick={()=>setSelectedDate(null)} style={{background:'#f5f0ea',border:'1px solid #e0d5c5',borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',color:'#7a6a5a',fontFamily:'DM Sans,sans-serif'}}>Close</button>
            </div>
          </div>
          {blockedDates.includes(selectedDate) && <div style={{background:'#fdecea',borderRadius:6,padding:'8px 12px',marginBottom:12,fontSize:12,color:'#8b1a1a',fontWeight:600}}>This date is marked as unavailable</div>}
          {selectedInfo && (<>
          {/* Host events on this date */}
          {selectedInfo.hostEvents.map(e=>(
            <div key={e.id} style={{background:'#1a1410',borderRadius:10,padding:'14px 18px',marginBottom:10}}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#c8a84b',marginBottom:4}}>Your Event (Host)</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#e8c97a',marginBottom:6}}>{e.event_name||e.event_type}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:12,fontSize:12,color:'#a89a8a'}}>
                {e.event_type && <span>🎪 {e.event_type}</span>}
                {e.start_time && <span>🕐 {fmt12(e.start_time)}{e.end_time?` – ${fmt12(e.end_time)}`:''}</span>}
                <span>📍 Zip {e.zip}</span>
                {e.spots && <span>🏪 {e.spots} spots</span>}
                <span style={{color:e.status==='approved'?'#a3e8bb':'#ffd966'}}>{e.status==='approved'?'Live':e.status}</span>
              </div>
            </div>
          ))}
          {/* Accepted vendor bookings on this date */}
          {selectedInfo.accepted.map(b=>(
            <div key={b.id} style={{background:'#d4f4e0',border:'1px solid #b8e8c8',borderRadius:10,padding:'12px 16px',marginBottom:8}}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#1a6b3a',marginBottom:4}}>Confirmed Booking (Vendor)</div>
              <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{b.event_name||'Event'}</div>
              <div style={{fontSize:12,color:'#2d7a50',marginTop:4}}>
                {b.event_type&&`${b.event_type} · `}{b.start_time&&`${fmt12(b.start_time)} · `}Zip {b.event_zip||'—'}
              </div>
              <div style={{fontSize:12,color:'#1a6b3a',marginTop:4}}>Host: {b.host_name||'—'}{b.host_email?` · ${b.host_email}`:''}</div>
            </div>
          ))}
          {/* Pending vendor applications */}
          {selectedInfo.pending.map(b=>(
            <div key={b.id} style={{background:'#fdf4dc',border:'1px solid #ffd966',borderRadius:10,padding:'12px 16px',marginBottom:8}}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#7a5a10',marginBottom:4}}>Pending Application (Vendor)</div>
              <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{b.event_name||'Event'}</div>
              <div style={{fontSize:12,color:'#7a5a10',marginTop:4}}>
                {b.event_type&&`${b.event_type} · `}Zip {b.event_zip||'—'} · Awaiting host response
              </div>
            </div>
          ))}
          {/* Service provider applications */}
          {selectedInfo.service.map(b=>(
            <div key={b.id} style={{background:'#dbeafe',border:'1px solid #93c5fd',borderRadius:10,padding:'12px 16px',marginBottom:8}}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#1d4ed8',marginBottom:4}}>Service Provider Application</div>
              <div style={{fontWeight:700,fontSize:15,color:'#1a1410'}}>{b.event_name||'Event'}</div>
              <div style={{fontSize:12,color:'#2563eb',marginTop:4}}>
                {b.event_type&&`${b.event_type} · `}Zip {b.event_zip||'—'} · Awaiting response
              </div>
            </div>
          ))}
      </>)}
        </div>
      )}

      {/* Empty state */}
      {hostEvents.length === 0 && vendorBookings.length === 0 && (
        <div style={{background:'#f5f0ea',border:'1px solid #e8ddd0',borderRadius:12,padding:32,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>📅</div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:18,color:'#1a1410',marginBottom:8}}>Your calendar is empty</div>
          <p style={{fontSize:13,color:'#7a6a5a',marginBottom:16}}>Add an event as a host or apply to events as a vendor to see them here.</p>
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <button onClick={()=>setTab('host')} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Add an Event</button>
            <button onClick={()=>setTab('opportunities')} style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Browse Events</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vendor Calendar Page (legacy, kept for availability management) ──────────
function VendorCalendarPage({ vendorId, vendorCalendars, setVendorCalendars, authUser, vendorProfile }) {
  const [vendorBookings, setVendorBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Fetch live booking data from Supabase
  useEffect(() => {
    if (!vendorId && !vendorProfile && !authUser) { setLoadingBookings(false); return; }
    let mounted = true;
    (async () => {
      const vid = vendorId || vendorProfile?.id;
      const vEmail = vendorProfile?.contact_email || authUser?.email;
      const vName = vendorProfile?.name;
      let allReqs = [];
      // Try by vendor_id
      if (vid) {
        const { data } = await supabase.from('booking_requests').select('*').eq('vendor_id', vid);
        if (data) allReqs = data;
      }
      // Also try by vendor email (host_email field in application flow)
      if (vEmail && allReqs.length === 0) {
        const { data } = await supabase.from('booking_requests').select('*').ilike('host_email', vEmail);
        if (data && data.length > 0) allReqs = [...allReqs, ...data];
      }
      // Also try by vendor name
      if (vName && allReqs.length === 0) {
        const { data } = await supabase.from('booking_requests').select('*').ilike('vendor_name', vName);
        if (data && data.length > 0) allReqs = [...allReqs, ...data];
      }
      // Dedupe by id
      const seen = new Set();
      allReqs = allReqs.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
      if (mounted) setVendorBookings(allReqs);
      if (mounted) setLoadingBookings(false);
    })();
    return () => { mounted = false; };
  }, [vendorId, vendorProfile, authUser]);

  if (!vendorId && !vendorProfile) {
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
  const isBooked   = (ds) => cal.bookedDates?.includes(ds) || vendorBookings.some(b => (b.event_date) === ds && b.status === 'accepted');
  const isPending  = (ds) => vendorBookings.some(b => (b.event_date) === ds && b.status === 'pending');
  const getBookingsForDate = (ds) => vendorBookings.filter(b => (b.event_date) === ds);

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
  const bookedCount = new Set([...(cal.bookedDates||[]), ...vendorBookings.filter(b=>b.status==='accepted').map(b=>b.event_date)]).size;
  const pendingBookingCount = vendorBookings.filter(b=>b.status==='pending').length;
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
    if (isPending(ds))                       return {bg:'#fdf4dc', color:'#7a5a10', border:'#ffd966', label:'PENDING'};
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
            {label:'Pending',  count:pendingBookingCount, bg:'#fff3cd',color:'#856404',border:'#ffeeba'},
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
                  {(isBooked(ds)||isPending(ds)) && getBookingsForDate(ds).length > 0 && (
                    <div style={{fontSize:6,marginTop:1}}>{getBookingsForDate(ds)[0].event_name?.slice(0,10)||'Event'}</div>
                  )}
                  {entry?.startTime && !isBooked(ds) && !isPending(ds) && (
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

          {/* Upcoming Bookings from Supabase */}
          {vendorBookings.length > 0 && (
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e8ddd0',padding:16}}>
              <div style={{fontWeight:700,color:'#1a1410',fontSize:14,marginBottom:10}}>My Bookings</div>
              {loadingBookings ? <div style={{fontSize:12,color:'#a89a8a'}}>Loading...</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {vendorBookings.filter(b=>b.event_date >= new Date().toISOString().split('T')[0]).sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||'')).slice(0,8).map(b => (
                    <div key={b.id} style={{padding:'8px 10px',borderRadius:6,fontSize:12,
                      background:b.status==='accepted'?'#d4f4e0':b.status==='pending'?'#fdf4dc':'#f5f0ea',
                      border:`1px solid ${b.status==='accepted'?'#b8e8c8':b.status==='pending'?'#ffd966':'#e8ddd0'}`}}>
                      <div style={{fontWeight:600,color:'#1a1410'}}>{b.event_name||'Event'}</div>
                      <div style={{color:'#7a6a5a'}}>{b.event_date ? new Date(b.event_date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'} · {b.status==='accepted'?'Confirmed':b.status==='pending'?'Pending':'—'}</div>
                      {b.status==='accepted' && b.host_name && <div style={{color:'#1a6b3a',marginTop:2}}>Host: {b.host_name}{b.host_email ? ` · ${b.host_email}` : ''}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
function HostCalendarPage({ authUser, userEvents, setTab, hostConfirm, clearHostConfirm }) {
  const [events, setEvents] = useState(userEvents || []);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingCal, setLoadingCal] = useState(true);

  // Fetch live data from Supabase
  useEffect(() => {
    if (!authUser) { setLoadingCal(false); return; }
    let mounted = true;
    (async () => {
      // Fetch host's events
      const { data: evts } = await supabase.from('events').select('*')
        .or(`user_id.eq.${authUser.id},contact_email.ilike.${authUser.email}`)
        .order('date', { ascending: true });
      if (mounted && evts) setEvents(evts);
      // Fetch booking requests for all host events
      const eventNames = (evts || []).map(e => e.event_name).filter(Boolean);
      if (eventNames.length > 0) {
        const { data: reqs } = await supabase.from('booking_requests').select('*')
          .in('event_name', eventNames).order('created_at', { ascending: false });
        if (mounted && reqs) setBookingRequests(reqs);
      }
      if (mounted) setLoadingCal(false);
    })();
    return () => { mounted = false; };
  }, [authUser]);

  if (!authUser) {
    return (
      <div style={{ textAlign:'center', padding:'80px 40px', color:'#7a6a5a' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:28, marginBottom:12, color:'#1a1410' }}>Your Event Calendar</div>
        <p style={{ fontSize:16, maxWidth:440, margin:'0 auto', marginBottom:24 }}>Log in to see your event calendar.</p>
      </div>
    );
  }
  if (loadingCal) {
    return <div style={{textAlign:'center',padding:'80px 20px',color:'#a89a8a',fontSize:16}}>Loading calendar...</div>;
  }
  if (events.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'80px 40px', color:'#7a6a5a' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:28, marginBottom:12, color:'#1a1410' }}>Your Event Calendar</div>
        <p style={{ fontSize:16, maxWidth:440, margin:'0 auto', marginBottom:24 }}>Add an event to see your calendar with booking requests and vendor lineup.</p>
        <button onClick={()=>setTab('host')} style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,padding:'12px 28px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Add an Event</button>
      </div>
    );
  }
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dayView,   setDayView]   = useState(null);
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

  // Navigate to first upcoming event month on load
  useEffect(() => {
    const upcoming = events.find(e => e.date >= new Date().toISOString().split('T')[0]);
    const target = upcoming || events[0];
    if (target?.date) {
      const [y, mo] = target.date.split('-').map(Number);
      setViewYear(y);
      setViewMonth(mo - 1);
    }
  }, []);

  // Build events by date map
  const eventsByDate = {};
  events.forEach(e => {
    if (e.date) {
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    }
  });

  // Group booking requests by date
  const requestsByDate = {};
  bookingRequests.forEach(req => {
    const d = req.event_date;
    if (d) {
      if (!requestsByDate[d]) requestsByDate[d] = [];
      requestsByDate[d].push(req);
    }
  });

  const allEventDates = new Set([
    ...Object.keys(eventsByDate),
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
    events.forEach(ev => {
      if (!ev.date) return;
      const d = ev.date.replace(/-/g,'');
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,
        `SUMMARY:${ev.event_name || ev.event_type || 'My Event'} - South Jersey Vendor Market`,
        `UID:event-${ev.id}@sjvendormarket`,'STATUS:CONFIRMED','END:VEVENT');
    });
    bookingRequests.filter(r => r.status === 'accepted').forEach(req => {
      const d = (req.event_date||'').replace(/-/g,'');
      if (!d) return;
      lines.push('BEGIN:VEVENT',`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d}`,
        `SUMMARY:Booked: ${req.vendor_name||req.vendorName} (${req.vendor_category||req.vendorCategory})`,
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

        {/* Event blocks for this day */}
        {(eventsByDate[dayView]||[]).map(ev => (
          <div key={ev.id} style={{background:'#1a1410',borderRadius:12,padding:'18px 22px',marginBottom:16}}>
            <div style={{fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:4}}>Your Event</div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#e8c97a',marginBottom:6}}>
              {ev.event_name || ev.event_type || 'Your Event'}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
              {ev.event_type && <div style={{fontSize:13,color:'#a89a8a'}}>🎪 {ev.event_type}</div>}
              {ev.start_time && (
                <div style={{fontSize:13,color:'#a89a8a'}}>
                  🕐 {fmt12(ev.start_time)}{ev.end_time ? ` – ${fmt12(ev.end_time)}` : ''}
                </div>
              )}
              <div style={{fontSize:13,color:'#a89a8a'}}>📍 Zip {ev.zip}</div>
              {ev.spots && <div style={{fontSize:13,color:'#a89a8a'}}>🏪 {ev.spots} vendor spots{acceptedCount > 0 ? ` (${dayReqs.filter(r=>r.event_name===ev.event_name&&r.status==='accepted').length} filled)` : ''}</div>}
              {ev.booth_fee && <div style={{fontSize:13,color:'#a89a8a'}}>💰 {ev.booth_fee}</div>}
              <div style={{fontSize:13,color:'#a89a8a'}}>📋 {ev.status === 'approved' ? 'Live' : ev.status}</div>
            </div>
            {ev.notes && (
              <div style={{marginTop:10,fontSize:13,color:'#7a6a5a',fontStyle:'italic',lineHeight:1.6}}>"{ev.notes}"</div>
            )}
          </div>
        ))}

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
                      <div style={{fontSize:28}}>{req.vendor_emoji||req.vendorEmoji || '🏪'}</div>
                      <div>
                        <div style={{fontWeight:700,color:'#1a1410',fontSize:16}}>{req.vendor_name||req.vendorName}</div>
                        <div style={{fontSize:12,color:'#7a6a5a'}}>{req.vendor_category||req.vendorCategory}</div>
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
                    <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:(req.vendor_message||req.vendorMessage)?12:0}}>
                      {(req.start_time||req.startTime) && (
                        <div style={{fontSize:13,color:'#4a3a28'}}>
                          🕐 <span style={{color:'#7a6a5a'}}>{fmt12(req.start_time||req.startTime)}{(req.end_time||req.endTime) ? ` – ${fmt12(req.end_time||req.endTime)}` : ''}</span>
                        </div>
                      )}
                      {(req.budget) && (
                        <div style={{fontSize:13,color:'#4a3a28'}}>
                          💰 <span style={{color:'#7a6a5a'}}>{req.budget}</span>
                        </div>
                      )}
                      {(req.sent_at||req.sentAt) && (
                        <div style={{fontSize:12,color:'#a89a8a'}}>
                          Requested {new Date(req.sent_at||req.sentAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </div>
                      )}
                      {(req.responded_at||req.respondedAt) && (
                        <div style={{fontSize:12,color:'#a89a8a'}}>
                          · Responded {new Date(req.responded_at||req.respondedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </div>
                      )}
                    </div>
                    {(req.vendor_message||req.vendorMessage||req.notes) && (
                      <div style={{background:'#fdf9f5',border:'1px solid #e8ddd0',borderRadius:8,
                        padding:'10px 14px',fontSize:13,color:'#4a3a28',fontStyle:'italic',lineHeight:1.6}}>
                        "{req.vendor_message||req.vendorMessage||req.notes}"
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
          <div style={{fontSize:14,color:'#7a6a5a',marginTop:6}}>
            {events.length} event{events.length!==1?'s':''} · {acceptedCount} vendor{acceptedCount!==1?'s':''} confirmed
          </div>
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
          <button onClick={downloadICal}
            style={{background:'#f5f0ea',color:'#4a3a28',border:'1px solid #e0d5c5',borderRadius:8,
              padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            ⬇ Export .ics
          </button>
          <button onClick={()=>setTab('matches')}
            style={{background:'#1a1410',color:'#e8c97a',border:'none',borderRadius:8,
              padding:'9px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
            Browse Vendors →
          </button>
        </div>
      </div>

      {/* Post another event banner */}
      {events.length > 0 && (
        <div style={{background:'#fdf9f5',border:'1.5px dashed #e0d5c5',borderRadius:12,
          padding:'18px 24px',marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{fontSize:28}}>📅</div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontWeight:700,color:'#1a1410',fontSize:15,marginBottom:2}}>Your Events</div>
            <div style={{fontSize:13,color:'#7a6a5a'}}>All your events and vendor bookings appear on this calendar. Click any date with an event to see details.</div>
          </div>
          <button onClick={()=>setTab('host')}
            style={{background:'#c8a84b',color:'#1a1410',border:'none',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>
            Post an Event →
          </button>
        </div>
      )}

      {/* Next-step CTA: event posted but no requests sent yet */}
      {events.length > 0 && bookingRequests.length === 0 && (
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
                {isEv && (eventsByDate[ds]||[]).map(ev => (
                  <div key={ev.id} style={{background:'rgba(0,0,0,0.18)',color:cm.color,borderRadius:4,
                    padding:'2px 6px',fontSize:10,fontWeight:700,marginBottom:4,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    📅 {ev.event_name || ev.event_type || 'Event'}
                    {ev.start_time && ` · ${fmt12(ev.start_time)}`}
                  </div>
                ))}

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
                        {isAcc?'✓':isPend?'·':'–'} {req.vendor_name||req.vendorName}
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
