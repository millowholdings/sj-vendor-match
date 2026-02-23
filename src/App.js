import { useState } from "react";

const CATEGORIES = [
  "Food & Beverage", "Jewelry & Accessories", "Art & Prints", "Candles & Home Decor",
  "Clothing & Apparel", "Beauty & Skincare", "Plants & Floral", "Crafts & Handmade",
  "Health & Wellness", "Kids & Baby", "Pet Products", "Photography & Media"
];

const SUBCATEGORIES = {
  "Food & Beverage": ["Baked Goods", "Snacks & Jerky", "Sauces & Condiments", "Beverages & Juices", "Candy & Chocolates", "Meal Prep & Catering"],
  "Jewelry & Accessories": ["Earrings", "Necklaces & Pendants", "Bracelets & Bangles", "Rings", "Hair Accessories", "Bags & Purses", "Sunglasses"],
  "Art & Prints": ["Illustrations & Drawing", "Paintings", "Digital Prints", "Custom Portraits", "Stickers & Postcards", "Mixed Media"],
  "Candles & Home Decor": ["Soy Candles", "Wax Melts", "Diffusers & Oils", "Wall Art", "Throw Pillows", "Seasonal Decor"],
  "Clothing & Apparel": ["T-Shirts & Hoodies", "Dresses & Skirts", "Kids Clothing", "Hats & Beanies", "Activewear", "Custom/Personalized"],
  "Beauty & Skincare": ["Skincare & Serums", "Body Butters & Lotions", "Lip Care", "Hair Care", "Bath Products", "Makeup & Cosmetics"],
  "Plants & Floral": ["Succulents & Cacti", "Tropical Plants", "Floral Arrangements", "Dried Florals", "Seeds & Bulbs", "Terrariums"],
  "Crafts & Handmade": ["Woodwork", "Ceramics & Pottery", "Knit & Crochet", "Resin Art", "Macramé", "Paper Crafts"],
  "Health & Wellness": ["Supplements & Vitamins", "Essential Oils", "Crystals & Spiritual", "Teas & Herbal", "Fitness Products", "Mental Wellness"],
  "Kids & Baby": ["Toys & Games", "Clothing", "Nursery Decor", "Books", "Personalized Gifts", "Educational"],
  "Pet Products": ["Treats & Food", "Toys", "Collars & Leashes", "Grooming", "Apparel", "Beds & Accessories"],
  "Photography & Media": ["Event Photography", "Portrait Sessions", "Digital Downloads", "Prints & Albums", "Video Services", "Headshots"]
};

const EVENT_TYPES = [
  "Pop-Up Market", "Corporate Event", "Birthday Party", "Wedding Reception",
  "Community Festival", "Farmers Market", "Bridal Shower", "Fundraiser",
  "Grand Opening", "Holiday Market", "Block Party", "Private Party"
];

const SJ_TOWNS = [
  "Cherry Hill", "Haddonfield", "Collingswood", "Moorestown", "Marlton",
  "Voorhees", "Medford", "Mullica Hill", "Haddon Township", "Turnersville",
  "Washington Township", "Mount Laurel", "Evesham", "Vineland", "Bridgeton",
  "Ocean City", "Cape May", "Wildwood", "Avalon", "Stone Harbor"
];

const SAMPLE_OPPORTUNITIES = [
  {
    id: 1,
    eventName: "Collingswood Spring Pop-Up Market",
    eventType: "Pop-Up Market",
    town: "Collingswood",
    date: "2026-04-12",
    startTime: "10:00",
    endTime: "16:00",
    boothFee: "$50/vendor",
    spotsAvailable: 20,
    categoriesNeeded: ["Food & Beverage", "Jewelry & Accessories", "Art & Prints", "Candles & Home Decor"],
    contactName: "Maria Lopez",
    contactEmail: "maria@collmarkets.com",
    contactPhone: "(856) 555-0101",
    fbLink: "https://facebook.com/events/example1",
    deadline: "2026-04-01",
    notes: "Outdoor market in Knight Park. Tables not provided. Electric available for 5 spots.",
    postedBy: "admin",
    source: "Facebook Group"
  },
  {
    id: 2,
    eventName: "Haddonfield Summer Artisan Fair",
    eventType: "Community Festival",
    town: "Haddonfield",
    date: "2026-06-07",
    startTime: "09:00",
    endTime: "17:00",
    boothFee: "Free (vendors keep all sales)",
    spotsAvailable: 35,
    categoriesNeeded: ["Art & Prints", "Crafts & Handmade", "Jewelry & Accessories", "Plants & Floral"],
    contactName: "Haddonfield Events Committee",
    contactEmail: "events@haddonfield.com",
    contactPhone: "(856) 555-0202",
    fbLink: "https://facebook.com/events/example2",
    deadline: "2026-05-15",
    notes: "Annual summer fair on Kings Highway. High foot traffic. Tents required.",
    postedBy: "admin",
    source: "Facebook Group"
  },
  {
    id: 3,
    eventName: "Voorhees Wellness & Self-Care Expo",
    eventType: "Pop-Up Market",
    town: "Voorhees",
    date: "2026-03-29",
    startTime: "11:00",
    endTime: "15:00",
    boothFee: "$75/vendor",
    spotsAvailable: 12,
    categoriesNeeded: ["Health & Wellness", "Beauty & Skincare", "Candles & Home Decor", "Plants & Floral"],
    contactName: "Jasmine Reed",
    contactEmail: "jasmine@wellnessexpo.com",
    contactPhone: "(856) 555-0303",
    fbLink: "https://facebook.com/events/example3",
    deadline: "2026-03-20",
    notes: "Indoor venue. Tables provided. Looking for insured vendors only.",
    postedBy: "host",
    source: "Host Submitted"
  }
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #f5f0ea;
    color: #1a1410;
    min-height: 100vh;
  }

  .app { min-height: 100vh; }

  .nav {
    background: #1a1410;
    padding: 18px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    flex-wrap: wrap;
    gap: 10px;
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #e8c97a;
    letter-spacing: 1px;
  }
  .nav-logo span { color: #fff; font-style: italic; }
  .nav-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
  .nav-tab {
    background: none;
    border: 1px solid transparent;
    color: #a89a8a;
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }
  .nav-tab:hover { color: #e8c97a; border-color: #e8c97a30; }
  .nav-tab.active { background: #e8c97a; color: #1a1410; border-color: #e8c97a; }

  .hero {
    background: linear-gradient(135deg, #1a1410 0%, #2d2118 50%, #1a1410 100%);
    padding: 90px 40px 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, #e8c97a15, transparent);
  }
  .hero-eyebrow {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #e8c97a;
    margin-bottom: 20px;
    position: relative;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(38px, 6vw, 68px);
    color: #fff;
    line-height: 1.1;
    margin-bottom: 20px;
    position: relative;
  }
  .hero h1 em { color: #e8c97a; font-style: italic; }
  .hero p {
    color: #a89a8a;
    font-size: 17px;
    max-width: 560px;
    margin: 0 auto 40px;
    line-height: 1.7;
    position: relative;
  }
  .hero-btns { display: flex; gap: 16px; justify-content: center; position: relative; flex-wrap: wrap; }
  .btn-primary {
    background: #e8c97a;
    color: #1a1410;
    border: none;
    padding: 14px 32px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary:hover { background: #f0d88a; transform: translateY(-1px); }
  .btn-outline {
    background: none;
    color: #fff;
    border: 1px solid #ffffff40;
    padding: 14px 32px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-outline:hover { border-color: #e8c97a; color: #e8c97a; }

  .stats-bar {
    background: #e8c97a;
    padding: 20px 40px;
    display: flex;
    justify-content: center;
    gap: 60px;
    flex-wrap: wrap;
  }
  .stat { text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #1a1410; }
  .stat-label { font-size: 12px; color: #4a3a28; letter-spacing: 1px; text-transform: uppercase; }

  .section { padding: 70px 40px; max-width: 900px; margin: 0 auto; }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    margin-bottom: 8px;
    color: #1a1410;
  }
  .section-sub { color: #7a6a5a; font-size: 16px; margin-bottom: 40px; }

  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 60px; }
  .pricing-card {
    background: #fff;
    border: 1px solid #e8ddd0;
    border-radius: 8px;
    padding: 32px 28px;
    position: relative;
  }
  .pricing-card.featured { background: #1a1410; color: #fff; border-color: #1a1410; }
  .pricing-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #e8c97a;
    color: #1a1410;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 20px;
  }
  .pricing-type { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #e8c97a; margin-bottom: 8px; }
  .pricing-card:not(.featured) .pricing-type { color: #a89a8a; }
  .pricing-name { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 4px; }
  .pricing-card.featured .pricing-name { color: #fff; }
  .pricing-price { font-size: 36px; font-weight: 700; margin: 16px 0 4px; }
  .pricing-card.featured .pricing-price { color: #e8c97a; }
  .pricing-period { font-size: 13px; color: #a89a8a; margin-bottom: 20px; }
  .pricing-features { list-style: none; }
  .pricing-features li { font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f0e8dc; display: flex; align-items: center; gap: 8px; }
  .pricing-card.featured .pricing-features li { border-color: #2d2118; color: #c8b898; }
  .pricing-features li::before { content: '✓'; color: #e8c97a; font-weight: 700; flex-shrink: 0; }

  .form-card {
    background: #fff;
    border: 1px solid #e8ddd0;
    border-radius: 12px;
    padding: 48px;
    box-shadow: 0 4px 40px #1a141008;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 13px; font-weight: 600; color: #4a3a28; letter-spacing: 0.5px; text-transform: uppercase; }
  input, select, textarea {
    border: 1.5px solid #e0d5c5;
    border-radius: 6px;
    padding: 11px 14px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1410;
    background: #fdf9f5;
    transition: border-color 0.2s;
    outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: #e8c97a; background: #fff; }
  textarea { resize: vertical; min-height: 100px; }
  .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 12px;
    border: 1.5px solid #e0d5c5;
    border-radius: 6px;
    transition: all 0.15s;
    background: #fdf9f5;
    text-transform: none;
    font-weight: 400;
    letter-spacing: 0;
  }
  .checkbox-item:hover { border-color: #e8c97a; }
  .checkbox-item.checked { border-color: #e8c97a; background: #fdf4dc; font-weight: 500; }
  .checkbox-item input { display: none; }
  .upload-zone {
    border: 2px dashed #d4c4a8;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    background: #fdf9f5;
    transition: all 0.2s;
    color: #7a6a5a;
    font-size: 14px;
  }
  .upload-zone:hover { border-color: #e8c97a; background: #fdf4dc; }
  .upload-icon { font-size: 28px; margin-bottom: 8px; }
  .form-divider { border: none; border-top: 1px solid #e8ddd0; margin: 32px 0; }
  .form-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 20px;
    color: #1a1410;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .form-section-title .dot { width: 8px; height: 8px; background: #e8c97a; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .range-display { font-size: 18px; font-weight: 600; color: #e8c97a; text-align: center; margin-top: 6px; }
  input[type=range] { width: 100%; accent-color: #e8c97a; }
  .form-submit { margin-top: 32px; text-align: center; }
  .btn-submit {
    background: #1a1410;
    color: #e8c97a;
    border: none;
    padding: 16px 48px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.5px;
    transition: all 0.2s;
  }
  .btn-submit:hover { background: #2d2118; transform: translateY(-1px); }

  .match-filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 32px;
    padding: 24px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ddd0;
  }
  .match-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
  .match-filter-group label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7a6a5a; font-weight: 600; }
  .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .results-count { font-size: 14px; color: #7a6a5a; }
  .results-count strong { color: #1a1410; }
  .vendor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .vendor-card {
    background: #fff;
    border: 1px solid #e8ddd0;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
  }
  .vendor-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px #1a141015; }
  .vendor-card-top {
    height: 100px;
    background: linear-gradient(135deg, #1a1410, #2d2118);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    position: relative;
  }
  .match-score {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #e8c97a;
    color: #1a1410;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .vendor-card-body { padding: 20px; }
  .vendor-name { font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 4px; }
  .vendor-category { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #a89a8a; margin-bottom: 12px; }
  .vendor-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .vendor-tag {
    background: #f5f0ea;
    border: 1px solid #e8ddd0;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    color: #5a4a3a;
  }
  .vendor-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #f0e8dc; }
  .vendor-price { font-size: 14px; font-weight: 600; color: #1a1410; }
  .vendor-location { font-size: 12px; color: #a89a8a; }
  .contact-btn {
    width: 100%;
    background: #1a1410;
    color: #e8c97a;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s;
  }
  .contact-btn:hover { background: #2d2118; }
  .empty-state { text-align: center; padding: 60px 20px; color: #a89a8a; }
  .empty-state .big { font-size: 48px; margin-bottom: 16px; }

  /* OPPORTUNITIES */
  .opp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
  .opp-card {
    background: #fff;
    border: 1px solid #e8ddd0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }
  .opp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px #1a141015; }
  .opp-card-header {
    background: linear-gradient(135deg, #1a1410, #2d2118);
    padding: 20px 24px;
    position: relative;
  }
  .opp-source-badge {
    display: inline-block;
    background: #e8c97a;
    color: #1a1410;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 10px;
  }
  .opp-event-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #fff;
    margin-bottom: 4px;
    line-height: 1.3;
  }
  .opp-event-type { font-size: 12px; color: #a89a8a; letter-spacing: 1px; text-transform: uppercase; }
  .opp-card-body { padding: 20px 24px; }
  .opp-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .opp-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .opp-meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a89a8a; font-weight: 600; }
  .opp-meta-value { font-size: 14px; font-weight: 500; color: #1a1410; }
  .opp-categories { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .opp-cat-tag {
    background: #f5f0ea;
    border: 1px solid #e8ddd0;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    color: #5a4a3a;
  }
  .opp-notes {
    font-size: 13px;
    color: #7a6a5a;
    line-height: 1.6;
    margin-bottom: 16px;
    padding: 12px;
    background: #fdf9f5;
    border-radius: 6px;
    border-left: 3px solid #e8c97a;
  }
  .opp-contact { font-size: 13px; color: #7a6a5a; margin-bottom: 16px; }
  .opp-contact strong { color: #1a1410; }
  .opp-deadline {
    display: inline-block;
    background: #fff3cd;
    border: 1px solid #ffd966;
    color: #7a5a10;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  .opp-deadline.urgent { background: #fde8e8; border-color: #f5a0a0; color: #8b0000; }
  .opp-actions { display: flex; gap: 10px; }
  .opp-btn-primary {
    flex: 1;
    background: #1a1410;
    color: #e8c97a;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s;
    text-align: center;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .opp-btn-primary:hover { background: #2d2118; }
  .opp-btn-secondary {
    background: #f5f0ea;
    color: #1a1410;
    border: 1px solid #e0d5c5;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .opp-btn-secondary:hover { border-color: #e8c97a; background: #fdf4dc; }
  .opp-filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 32px;
    padding: 20px 24px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ddd0;
    align-items: flex-end;
  }
  .opp-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 140px; }
  .opp-filter-group label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7a6a5a; font-weight: 600; }
  .opportunities-header {
    background: linear-gradient(135deg, #1a1410, #2d2118);
    padding: 48px 40px;
    margin-bottom: 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .opportunities-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 50% 50%, #e8c97a10, transparent);
  }
  .opportunities-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    color: #fff;
    margin-bottom: 8px;
    position: relative;
  }
  .opportunities-header h2 em { color: #e8c97a; font-style: italic; }
  .opportunities-header p { color: #a89a8a; font-size: 16px; max-width: 520px; margin: 0 auto; position: relative; }

  /* ADMIN POST FORM */
  .admin-post-section {
    background: #fff;
    border: 2px solid #e8c97a;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 40px;
  }
  .admin-post-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .admin-tag {
    display: inline-block;
    background: #e8c97a;
    color: #1a1410;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
  }

  /* SUCCESS */
  .success-banner {
    background: linear-gradient(135deg, #1a1410, #2d2118);
    color: #fff;
    padding: 48px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 40px;
  }
  .success-icon { font-size: 48px; margin-bottom: 16px; }
  .success-banner h2 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; }
  .success-banner p { color: #a89a8a; font-size: 16px; }
  .success-highlight { color: #e8c97a; font-weight: 600; }

  /* ADMIN */
  .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .admin-stat { background: #fff; border: 1px solid #e8ddd0; border-radius: 8px; padding: 24px; }
  .admin-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; color: #e8c97a; }
  .admin-stat-label { font-size: 13px; color: #7a6a5a; margin-top: 4px; }
  .admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e8ddd0; }
  .admin-table th { background: #1a1410; color: #e8c97a; padding: 14px 18px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  .admin-table td { padding: 14px 18px; border-bottom: 1px solid #f0e8dc; font-size: 14px; }
  .admin-table tr:last-child td { border-bottom: none; }
  .status-pill {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .status-active { background: #d4f4e0; color: #1a6b3a; }
  .status-pending { background: #fdf4dc; color: #7a5a10; }

  .subcategory-section {
    margin-top: 12px;
    padding: 16px;
    background: #fdf9f5;
    border: 1px solid #e8ddd0;
    border-radius: 8px;
  }
  .subcategory-label {
    font-size: 12px;
    font-weight: 600;
    color: #7a6a5a;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  @media (max-width: 640px) {
    .nav { padding: 14px 20px; }
    .nav-tab { padding: 6px 10px; font-size: 11px; }
    .hero { padding: 60px 20px; }
    .section { padding: 50px 20px; }
    .form-card { padding: 28px 20px; }
    .form-grid { grid-template-columns: 1fr; }
    .stats-bar { gap: 30px; }
    .opp-meta-grid { grid-template-columns: 1fr; }
  }
`;

const SAMPLE_VENDORS = [
  { id: 1, name: "Subtle Boujee", category: "Jewelry & Accessories", subcategory: "Earrings", town: "Cherry Hill", emoji: "💎", tags: ["Handmade", "Luxury", "Custom"], price: "$150–$300/day", matchScore: 98, description: "Elevated handmade jewelry and accessories for every occasion.", insurance: true, setupTime: 45 },
  { id: 2, name: "Ian's Essentials", category: "Health & Wellness", subcategory: "Essential Oils", town: "Collingswood", emoji: "🌿", tags: ["Organic", "Self-care", "Local"], price: "$100–$200/day", matchScore: 95, description: "Curated wellness and essential products made with care.", insurance: true, setupTime: 30 },
  { id: 3, name: "Shore Thing Candles", category: "Candles & Home Decor", subcategory: "Soy Candles", town: "Ocean City", emoji: "🕯️", tags: ["Hand-poured", "Shore-inspired", "Gift-ready"], price: "$75–$150/day", matchScore: 91, description: "Hand-poured soy candles inspired by South Jersey's shoreline.", insurance: false, setupTime: 20 },
  { id: 4, name: "Rooted & Raw Botanicals", category: "Plants & Floral", subcategory: "Floral Arrangements", town: "Haddonfield", emoji: "🌸", tags: ["Sustainable", "Seasonal", "Local"], price: "$200–$400/day", matchScore: 88, description: "Locally grown plants, floral arrangements, and botanical wellness.", insurance: true, setupTime: 60 },
  { id: 5, name: "The Dough Collective", category: "Food & Beverage", subcategory: "Baked Goods", town: "Moorestown", emoji: "🥐", tags: ["Baked goods", "Allergen-friendly", "Custom orders"], price: "$125–$250/day", matchScore: 84, description: "Artisan baked goods with allergen-friendly options for every crowd.", insurance: true, setupTime: 30 },
  { id: 6, name: "Pine Barrens Print Co.", category: "Art & Prints", subcategory: "Photography", town: "Medford", emoji: "🎨", tags: ["NJ-inspired", "Photography", "Custom framing"], price: "$80–$180/day", matchScore: 79, description: "Photography and art prints celebrating New Jersey's landscapes.", insurance: false, setupTime: 25 },
];

function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };
  return (
    <div className="checkbox-grid">
      {options.map(opt => (
        <label key={opt} className={`checkbox-item ${selected.includes(opt) ? 'checked' : ''}`}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

function UploadZone({ label, hint }) {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="upload-zone" onClick={() => setUploaded(!uploaded)}>
      <div className="upload-icon">{uploaded ? '✅' : '📎'}</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{uploaded ? `${label} uploaded!` : `Upload ${label}`}</div>
      <div style={{ fontSize: 13, color: '#a89a8a' }}>{hint}</div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function isUrgent(deadline) {
  if (!deadline) return false;
  const today = new Date();
  const dl = new Date(deadline + 'T12:00:00');
  const diff = (dl - today) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

// VENDOR FORM
function VendorForm({ onSubmit }) {
  const [form, setForm] = useState({
    businessName: '', ownerName: '', email: '', phone: '',
    town: '', category: '', subcategory: '', description: '', website: '',
    eventTypes: [], towns: [], priceMin: 75, priceMax: 300,
    setupTime: 30, tableSize: '6ft', needsElectric: false,
    yearsActive: ''
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const subcats = form.category ? SUBCATEGORIES[form.category] || [] : [];

  return (
    <div className="form-card">
      <h2 className="form-section-title"><span className="dot"></span>Vendor Profile</h2>
      <p style={{ color: '#7a6a5a', marginBottom: 32, fontSize: 15 }}>
        Join South Jersey's premier vendor network. Get matched with events and hosts looking for exactly what you offer.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>Business Name *</label>
          <input placeholder="e.g. Subtle Boujee" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Owner Name *</label>
          <input placeholder="Your full name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input placeholder="(609) 555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Main Category *</label>
          <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }}>
            <option value="">Select a category...</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Subcategory {form.category ? '*' : ''}</label>
          <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} disabled={!form.category}>
            <option value="">{form.category ? 'Select subcategory...' : 'Choose a category first'}</option>
            {subcats.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {form.category && form.subcategory && (
          <div className="form-group full">
            <div className="subcategory-section">
              <div className="subcategory-label">✓ Selected: {form.category} → {form.subcategory}</div>
              <div style={{ fontSize: 13, color: '#7a6a5a' }}>Your profile will appear in both the main category and subcategory searches.</div>
            </div>
          </div>
        )}
        <div className="form-group">
          <label>Home Base Town</label>
          <select value={form.town} onChange={e => set('town', e.target.value)}>
            <option value="">Select town...</option>
            {SJ_TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Years in Business</label>
          <input placeholder="e.g. 3" value={form.yearsActive} onChange={e => set('yearsActive', e.target.value)} />
        </div>
        <div className="form-group full">
          <label>Business Description *</label>
          <textarea placeholder="Tell hosts what makes your business special..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-group full">
          <label>Website / Instagram / Social Link</label>
          <input placeholder="https://instagram.com/yourbusiness" value={form.website} onChange={e => set('website', e.target.value)} />
        </div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot"></span>Event Fit</h3>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label>Event Types You're Open To</label>
        <CheckboxGroup options={EVENT_TYPES} selected={form.eventTypes} onChange={v => set('eventTypes', v)} />
      </div>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label>Towns / Areas You'll Travel To</label>
        <CheckboxGroup options={SJ_TOWNS} selected={form.towns} onChange={v => set('towns', v)} />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Daily Booth Fee — Min (${form.priceMin})</label>
          <input type="range" min={25} max={500} step={25} value={form.priceMin} onChange={e => set('priceMin', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Daily Booth Fee — Max (${form.priceMax})</label>
          <input type="range" min={25} max={1000} step={25} value={form.priceMax} onChange={e => set('priceMax', +e.target.value)} />
          <div className="range-display">${form.priceMin} – ${form.priceMax}/day</div>
        </div>
        <div className="form-group">
          <label>Setup Time Needed ({form.setupTime} min)</label>
          <input type="range" min={10} max={120} step={5} value={form.setupTime} onChange={e => set('setupTime', +e.target.value)} />
        </div>
        <div className="form-group">
          <label>Table / Space Size</label>
          <select value={form.tableSize} onChange={e => set('tableSize', e.target.value)}>
            <option>6ft</option><option>8ft</option><option>10x10 tent</option><option>10x20 tent</option><option>Flexible</option>
          </select>
        </div>
        <div className="form-group">
          <label>Need Electrical Access?</label>
          <select value={form.needsElectric ? 'yes' : 'no'} onChange={e => set('needsElectric', e.target.value === 'yes')}>
            <option value="no">No</option><option value="yes">Yes</option>
          </select>
        </div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot"></span>Documents & Photos</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Business Photos</label>
          <UploadZone label="Photos" hint="JPG, PNG — products, booth setup, branding" />
        </div>
        <div className="form-group">
          <label>Certificate of Insurance</label>
          <UploadZone label="Insurance COI" hint="PDF or image — required for many events" />
        </div>
        <div className="form-group full">
          <label>Price Menu / Lookbook (Optional)</label>
          <UploadZone label="Price Sheet / Lookbook" hint="PDF — helps hosts understand your offerings" />
        </div>
      </div>

      <div className="form-submit">
        <button className="btn-submit" onClick={() => onSubmit(form)}>Submit Vendor Profile →</button>
        <p style={{ fontSize: 13, color: '#a89a8a', marginTop: 12 }}>
          Your profile will be reviewed and activated within 24 hours. Monthly fee: <strong style={{ color: '#1a1410' }}>$15/month</strong>
        </p>
      </div>
    </div>
  );
}

// HOST FORM
function HostForm({ onSubmit }) {
  const [form, setForm] = useState({
    orgName: '', contactName: '', email: '', phone: '',
    eventName: '', eventType: '', town: '', address: '',
    date: '', startTime: '', endTime: '',
    expectedAttendance: '', indoorOutdoor: 'outdoor',
    vendorCategories: [], vendorCount: 5,
    electricAvailable: true, tableProvided: false,
    budget: '', notes: '', managedBooking: false
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="form-card">
      <h2 className="form-section-title"><span className="dot"></span>Host an Event</h2>
      <p style={{ color: '#7a6a5a', marginBottom: 32, fontSize: 15 }}>
        Tell us about your event and we'll match you with the perfect South Jersey vendors.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>Organization / Business Name</label>
          <input placeholder="Your org or event name" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Contact Name *</label>
          <input placeholder="Your full name" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input placeholder="(856) 555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Event Name *</label>
          <input placeholder="e.g. Haddonfield Holiday Market" value={form.eventName} onChange={e => set('eventName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Event Type *</label>
          <select value={form.eventType} onChange={e => set('eventType', e.target.value)}>
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Town / Location *</label>
          <select value={form.town} onChange={e => set('town', e.target.value)}>
            <option value="">Select town...</option>
            {SJ_TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Venue Address</label>
          <input placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Event Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Expected Attendance</label>
          <select value={form.expectedAttendance} onChange={e => set('expectedAttendance', e.target.value)}>
            <option value="">Estimate...</option>
            <option>Under 50</option><option>50–150</option><option>150–300</option>
            <option>300–500</option><option>500+</option>
          </select>
        </div>
        <div className="form-group">
          <label>Indoor or Outdoor?</label>
          <select value={form.indoorOutdoor} onChange={e => set('indoorOutdoor', e.target.value)}>
            <option value="outdoor">Outdoor</option>
            <option value="indoor">Indoor</option>
            <option value="both">Mixed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Vendor Spots ({form.vendorCount})</label>
          <input type="range" min={1} max={50} value={form.vendorCount} onChange={e => set('vendorCount', +e.target.value)} />
          <div className="range-display">{form.vendorCount} vendors</div>
        </div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot"></span>Vendor Preferences</h3>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label>Vendor Categories You Want</label>
        <CheckboxGroup options={CATEGORIES} selected={form.vendorCategories} onChange={v => set('vendorCategories', v)} />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Electricity Available?</label>
          <select value={form.electricAvailable ? 'yes' : 'no'} onChange={e => set('electricAvailable', e.target.value === 'yes')}>
            <option value="yes">Yes</option><option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tables Provided by Host?</label>
          <select value={form.tableProvided ? 'yes' : 'no'} onChange={e => set('tableProvided', e.target.value === 'yes')}>
            <option value="no">No — vendors bring their own</option>
            <option value="yes">Yes — we provide tables</option>
          </select>
        </div>
        <div className="form-group">
          <label>Vendor Budget / Booth Fee Offered</label>
          <select value={form.budget} onChange={e => set('budget', e.target.value)}>
            <option value="">Select...</option>
            <option>Free (vendor keeps all sales)</option>
            <option>$25–$50/vendor</option>
            <option>$50–$100/vendor</option>
            <option>$100–$200/vendor</option>
            <option>$200+/vendor</option>
          </select>
        </div>
      </div>

      <hr className="form-divider" />
      <h3 className="form-section-title"><span className="dot"></span>Service Level</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <label className={`checkbox-item ${!form.managedBooking ? 'checked' : ''}`} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 20, cursor: 'pointer' }} onClick={() => set('managedBooking', false)}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Self-Serve Matching</div>
          <div style={{ fontSize: 13, color: '#7a6a5a' }}>Get a curated list of matched vendors. You reach out and book directly.</div>
          <div style={{ marginTop: 8, color: '#e8c97a', fontWeight: 700 }}>$25 one-time or $49/mo</div>
        </label>
        <label className={`checkbox-item ${form.managedBooking ? 'checked' : ''}`} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 20, cursor: 'pointer' }} onClick={() => set('managedBooking', true)}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Managed Booking</div>
          <div style={{ fontSize: 13, color: '#7a6a5a' }}>We contact, confirm, and coordinate all your vendors. Completely hands-off.</div>
          <div style={{ marginTop: 8, color: '#e8c97a', fontWeight: 700 }}>$150–$300/event</div>
        </label>
      </div>

      <div className="form-group" style={{ marginTop: 20 }}>
        <label>Additional Notes</label>
        <textarea placeholder="Anything else vendors or our team should know..." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <div className="form-submit">
        <button className="btn-submit" onClick={() => onSubmit(form)}>Find My Vendors →</button>
      </div>
    </div>
  );
}

// MATCHES PAGE
function MatchesPage() {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterInsurance, setFilterInsurance] = useState('');
  const [contacted, setContacted] = useState([]);

  const filtered = SAMPLE_VENDORS
    .filter(v => !filterCategory || v.category === filterCategory)
    .filter(v => !filterTown || v.town === filterTown)
    .filter(v => !filterInsurance || (filterInsurance === 'yes' ? v.insurance : !v.insurance))
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="section" style={{ maxWidth: 1000 }}>
      <div className="section-title">Vendor Directory</div>
      <p className="section-sub">Browse all active South Jersey vendors or submit an event form to get a personalized match list.</p>

      <div className="match-filters">
        <div className="match-filter-group">
          <label>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="match-filter-group">
          <label>Town</label>
          <select value={filterTown} onChange={e => setFilterTown(e.target.value)}>
            <option value="">All Towns</option>
            {SJ_TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="match-filter-group">
          <label>Insurance</label>
          <select value={filterInsurance} onChange={e => setFilterInsurance(e.target.value)}>
            <option value="">Any</option>
            <option value="yes">Insured Only</option>
            <option value="no">Not Required</option>
          </select>
        </div>
      </div>

      <div className="results-header">
        <div className="results-count"><strong>{filtered.length}</strong> vendors found</div>
      </div>

      <div className="vendor-grid">
        {filtered.map(v => (
          <div key={v.id} className="vendor-card">
            <div className="vendor-card-top">
              {v.emoji}
              <div className="match-score">{v.matchScore}% match</div>
            </div>
            <div className="vendor-card-body">
              <div className="vendor-name">{v.name}</div>
              <div className="vendor-category">{v.category} {v.subcategory ? `· ${v.subcategory}` : ''}</div>
              <div className="vendor-tags">
                {v.tags.map(t => <span key={t} className="vendor-tag">{t}</span>)}
                {v.insurance && <span className="vendor-tag" style={{ background: '#d4f4e0', color: '#1a6b3a', borderColor: '#b8e8c8' }}>✓ Insured</span>}
              </div>
              <p style={{ fontSize: 13, color: '#7a6a5a', lineHeight: 1.5, marginBottom: 12 }}>{v.description}</p>
              <div className="vendor-meta">
                <div className="vendor-price">{v.price}</div>
                <div className="vendor-location">📍 {v.town}</div>
              </div>
              <button className="contact-btn"
                onClick={() => setContacted(c => c.includes(v.id) ? c : [...c, v.id])}
                style={contacted.includes(v.id) ? { background: '#1a6b3a', color: '#fff' } : {}}>
                {contacted.includes(v.id) ? '✓ Request Sent' : 'Request Contact Info'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// OPPORTUNITIES PAGE
function OpportunitiesPage({ opportunities }) {
  const [filterType, setFilterType] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [saved, setSaved] = useState([]);

  const filtered = opportunities
    .filter(o => !filterType || o.eventType === filterType)
    .filter(o => !filterTown || o.town === filterTown)
    .filter(o => !filterCat || o.categoriesNeeded.includes(filterCat));

  return (
    <>
      <div className="opportunities-header">
        <h2>Vendor <em>Opportunities</em></h2>
        <p>Events, pop-ups, and markets across South Jersey actively looking for vendors — curated so you don't have to search.</p>
      </div>

      <div className="section" style={{ maxWidth: 1100, paddingTop: 40 }}>
        <div className="opp-filters">
          <div className="opp-filter-group">
            <label>Event Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="opp-filter-group">
            <label>Town</label>
            <select value={filterTown} onChange={e => setFilterTown(e.target.value)}>
              <option value="">All Towns</option>
              {SJ_TOWNS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="opp-filter-group">
            <label>Category Needed</label>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="results-header">
          <div className="results-count"><strong>{filtered.length}</strong> opportunities available</div>
          <div style={{ fontSize: 13, color: '#a89a8a' }}>Updated regularly — check back often</div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="big">📭</div>
            <p>No opportunities match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="opp-grid">
            {filtered.map(opp => (
              <div key={opp.id} className="opp-card">
                <div className="opp-card-header">
                  <div className="opp-source-badge">{opp.source}</div>
                  <div className="opp-event-name">{opp.eventName}</div>
                  <div className="opp-event-type">{opp.eventType}</div>
                </div>
                <div className="opp-card-body">
                  <div className="opp-meta-grid">
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">📅 Date</div>
                      <div className="opp-meta-value">{formatDate(opp.date)}</div>
                    </div>
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">⏰ Time</div>
                      <div className="opp-meta-value">{formatTime(opp.startTime)} – {formatTime(opp.endTime)}</div>
                    </div>
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">📍 Location</div>
                      <div className="opp-meta-value">{opp.town}, NJ</div>
                    </div>
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">💰 Booth Fee</div>
                      <div className="opp-meta-value">{opp.boothFee}</div>
                    </div>
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">🪑 Spots Open</div>
                      <div className="opp-meta-value">{opp.spotsAvailable} available</div>
                    </div>
                    <div className="opp-meta-item">
                      <div className="opp-meta-label">👤 Contact</div>
                      <div className="opp-meta-value">{opp.contactName}</div>
                    </div>
                  </div>

                  <div className="opp-categories">
                    {opp.categoriesNeeded.map(c => <span key={c} className="opp-cat-tag">{c}</span>)}
                  </div>

                  {opp.notes && <div className="opp-notes">{opp.notes}</div>}

                  <div className="opp-contact">
                    <strong>Contact:</strong> {opp.contactEmail} {opp.contactPhone ? `· ${opp.contactPhone}` : ''}
                  </div>

                  {opp.deadline && (
                    <div className={`opp-deadline ${isUrgent(opp.deadline) ? 'urgent' : ''}`}>
                      {isUrgent(opp.deadline) ? '🔥 Deadline soon: ' : '📌 Apply by: '}{formatDate(opp.deadline)}
                    </div>
                  )}

                  <div className="opp-actions">
                    {opp.fbLink && (
                      <a href={opp.fbLink} target="_blank" rel="noopener noreferrer" className="opp-btn-primary">
                        📘 View on Facebook
                      </a>
                    )}
                    <button
                      className="opp-btn-secondary"
                      onClick={() => setSaved(s => s.includes(opp.id) ? s.filter(x => x !== opp.id) : [...s, opp.id])}>
                      {saved.includes(opp.id) ? '★ Saved' : '☆ Save'}
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

// ADMIN POST OPPORTUNITY FORM
function AdminPostOpportunity({ onPost }) {
  const [form, setForm] = useState({
    eventName: '', eventType: '', town: '', date: '',
    startTime: '', endTime: '', boothFee: '', spotsAvailable: '',
    categoriesNeeded: [], contactName: '', contactEmail: '',
    contactPhone: '', fbLink: '', deadline: '', notes: '',
    source: 'Facebook Group', postedBy: 'admin'
  });
  const [posted, setPosted] = useState(false);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePost = () => {
    if (!form.eventName || !form.eventType || !form.town || !form.date) {
      alert('Please fill in Event Name, Type, Town, and Date.');
      return;
    }
    onPost({ ...form, id: Date.now(), spotsAvailable: parseInt(form.spotsAvailable) || 0 });
    setPosted(true);
    setForm({ eventName: '', eventType: '', town: '', date: '', startTime: '', endTime: '', boothFee: '', spotsAvailable: '', categoriesNeeded: [], contactName: '', contactEmail: '', contactPhone: '', fbLink: '', deadline: '', notes: '', source: 'Facebook Group', postedBy: 'admin' });
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <div className="admin-post-section">
      <div className="admin-post-title">
        <span>Post New Opportunity</span>
        <span className="admin-tag">Admin</span>
      </div>
      <p style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 24 }}>
        Post events you've found on Facebook or from approved hosts. They'll appear instantly on the Opportunities board.
      </p>

      {posted && (
        <div style={{ background: '#d4f4e0', border: '1px solid #b8e8c8', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#1a6b3a', fontWeight: 600 }}>
          ✅ Opportunity posted successfully! It's now live on the board.
        </div>
      )}

      <div className="form-grid">
        <div className="form-group full">
          <label>Event Name *</label>
          <input placeholder="e.g. Collingswood Spring Pop-Up Market" value={form.eventName} onChange={e => set('eventName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Event Type *</label>
          <select value={form.eventType} onChange={e => set('eventType', e.target.value)}>
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Source</label>
          <select value={form.source} onChange={e => set('source', e.target.value)}>
            <option>Facebook Group</option>
            <option>Facebook Event</option>
            <option>Host Submitted</option>
            <option>Instagram</option>
            <option>Email Tip</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Town *</label>
          <select value={form.town} onChange={e => set('town', e.target.value)}>
            <option value="">Select town...</option>
            {SJ_TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Event Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Booth Fee</label>
          <input placeholder="e.g. $50/vendor or Free" value={form.boothFee} onChange={e => set('boothFee', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Spots Available</label>
          <input type="number" placeholder="e.g. 20" value={form.spotsAvailable} onChange={e => set('spotsAvailable', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Application Deadline</label>
          <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Facebook Group / Event Link</label>
          <input placeholder="https://facebook.com/events/..." value={form.fbLink} onChange={e => set('fbLink', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Host Contact Name</label>
          <input placeholder="Who vendors contact" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Host Contact Email</label>
          <input type="email" placeholder="host@email.com" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Host Contact Phone</label>
          <input placeholder="(856) 555-0000" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
        </div>
        <div className="form-group full">
          <label>Vendor Categories Needed</label>
          <CheckboxGroup options={CATEGORIES} selected={form.categoriesNeeded} onChange={v => set('categoriesNeeded', v)} />
        </div>
        <div className="form-group full">
          <label>Notes for Vendors</label>
          <textarea placeholder="Tent required? Tables provided? Insured vendors only? Electric available?" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn-submit" onClick={handlePost}>Post to Opportunities Board →</button>
      </div>
    </div>
  );
}

// PRICING PAGE
function PricingPage({ setTab }) {
  return (
    <div className="section" style={{ maxWidth: 1000 }}>
      <div className="section-title">Simple, Transparent Pricing</div>
      <p className="section-sub">Whether you're a vendor looking for leads or a host planning an event, we have a plan for you.</p>

      <h3 style={{ fontSize: 13, marginBottom: 20, color: '#7a6a5a', letterSpacing: 1, textTransform: 'uppercase' }}>FOR VENDORS</h3>
      <div className="pricing-grid" style={{ marginBottom: 48 }}>
        <div className="pricing-card">
          <div className="pricing-type">Vendor</div>
          <div className="pricing-name">Basic Listing</div>
          <div className="pricing-price">$15</div>
          <div className="pricing-period">per month</div>
          <ul className="pricing-features">
            <li>Profile in vendor directory</li>
            <li>Category + subcategory listing</li>
            <li>Photo gallery & doc uploads</li>
            <li>Matched to relevant events</li>
            <li>Access to Opportunities board</li>
            <li>Lead notifications by email</li>
          </ul>
        </div>
        <div className="pricing-card featured">
          <div className="pricing-badge">MOST POPULAR</div>
          <div className="pricing-type">Vendor</div>
          <div className="pricing-name">Featured</div>
          <div className="pricing-price">$35</div>
          <div className="pricing-period">per month</div>
          <ul className="pricing-features">
            <li>Everything in Basic</li>
            <li>Top placement in search results</li>
            <li>Featured on homepage</li>
            <li>Priority match notifications</li>
            <li>Social media feature (monthly)</li>
            <li>Early access to new opportunities</li>
          </ul>
        </div>
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 20, color: '#7a6a5a', letterSpacing: 1, textTransform: 'uppercase' }}>FOR HOSTS & EVENT ORGANIZERS</h3>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-type">Host</div>
          <div className="pricing-name">Single Event</div>
          <div className="pricing-price">$25</div>
          <div className="pricing-period">one-time fee</div>
          <ul className="pricing-features">
            <li>AI-matched vendor list</li>
            <li>Up to 20 vendor results</li>
            <li>Filter by category & town</li>
            <li>Direct vendor contact info</li>
            <li>You manage booking yourself</li>
          </ul>
        </div>
        <div className="pricing-card">
          <div className="pricing-type">Host</div>
          <div className="pricing-name">Monthly Access</div>
          <div className="pricing-price">$49</div>
          <div className="pricing-period">per month</div>
          <ul className="pricing-features">
            <li>Unlimited event submissions</li>
            <li>Unlimited vendor matching</li>
            <li>Early access to new vendors</li>
            <li>Event calendar listing</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div className="pricing-card featured">
          <div className="pricing-badge">WHITE GLOVE</div>
          <div className="pricing-type">Host</div>
          <div className="pricing-name">Managed Booking</div>
          <div className="pricing-price">$150+</div>
          <div className="pricing-period">per event</div>
          <ul className="pricing-features">
            <li>We contact every vendor for you</li>
            <li>Confirmations & follow-ups handled</li>
            <li>Day-of coordination checklist</li>
            <li>Vendor contract management</li>
            <li>Dedicated event coordinator</li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button className="btn-submit" onClick={() => setTab('vendor')}>Join as a Vendor →</button>
        <span style={{ margin: '0 20px', color: '#a89a8a' }}>or</span>
        <button className="btn-submit" style={{ background: '#e8c97a', color: '#1a1410' }} onClick={() => setTab('host')}>Post Your Event →</button>
      </div>
    </div>
  );
}

// ADMIN PAGE
function AdminPage({ opportunities, onPost }) {
  return (
    <div className="section" style={{ maxWidth: 1000 }}>
      <div className="section-title">Admin Dashboard</div>
      <p className="section-sub">Manage vendors, hosts, bookings, and post opportunities across South Jersey.</p>

      <div className="admin-grid">
        <div className="admin-stat"><div className="admin-stat-num">47</div><div className="admin-stat-label">Active Vendors</div></div>
        <div className="admin-stat"><div className="admin-stat-num">12</div><div className="admin-stat-label">Pending Review</div></div>
        <div className="admin-stat"><div className="admin-stat-num">{opportunities.length}</div><div className="admin-stat-label">Live Opportunities</div></div>
        <div className="admin-stat"><div className="admin-stat-num">$1,840</div><div className="admin-stat-label">Monthly Revenue</div></div>
        <div className="admin-stat"><div className="admin-stat-num">8</div><div className="admin-stat-label">Managed Bookings</div></div>
      </div>

      <AdminPostOpportunity onPost={onPost} />

      <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 16, marginTop: 40 }}>Live Opportunities ({opportunities.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Town</th>
            <th>Date</th>
            <th>Spots</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map(o => (
            <tr key={o.id}>
              <td><strong>{o.eventName}</strong></td>
              <td>{o.town}</td>
              <td>{formatDate(o.date)}</td>
              <td>{o.spotsAvailable}</td>
              <td>{o.source}</td>
              <td><span className="status-pill status-active">Live</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 16, marginTop: 40 }}>Recent Vendor Submissions</h3>
      <table className="admin-table">
        <thead>
          <tr><th>Business</th><th>Category</th><th>Subcategory</th><th>Town</th><th>Insurance</th><th>Status</th></tr>
        </thead>
        <tbody>
          {SAMPLE_VENDORS.map(v => (
            <tr key={v.id}>
              <td><strong>{v.name}</strong></td>
              <td>{v.category}</td>
              <td>{v.subcategory || '—'}</td>
              <td>{v.town}</td>
              <td>{v.insurance ? '✅ Yes' : '—'}</td>
              <td><span className={`status-pill ${v.id < 4 ? 'status-active' : 'status-pending'}`}>{v.id < 4 ? 'Active' : 'Pending'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [vendorSuccess, setVendorSuccess] = useState(false);
  const [hostSuccess, setHostSuccess] = useState(false);
  const [opportunities, setOpportunities] = useState(SAMPLE_OPPORTUNITIES);

  const handleVendorSubmit = (form) => {
    if (!form.businessName || !form.email || !form.category) {
      alert('Please fill in Business Name, Email, and Category to continue.');
      return;
    }
    setVendorSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHostSubmit = (form) => {
    if (!form.contactName || !form.email || !form.eventType) {
      alert('Please fill in Contact Name, Email, and Event Type to continue.');
      return;
    }
    setHostSuccess(true);
    setTab('matches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostOpportunity = (opp) => {
    setOpportunities(prev => [opp, ...prev]);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">SJ<span>Vendor</span>Match</div>
          <div className="nav-tabs">
            {[
              ['home','Home'],
              ['vendor','Join as Vendor'],
              ['host','Host Event'],
              ['matches','Browse Vendors'],
              ['opportunities','Opportunities'],
              ['pricing','Pricing'],
              ['admin','Admin']
            ].map(([id, label]) => (
              <button key={id} className={`nav-tab ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); window.scrollTo({top:0}); }}>{label}</button>
            ))}
          </div>
        </nav>

        {tab === 'home' && (
          <>
            <div className="hero">
              <div className="hero-eyebrow">South Jersey's Vendor Network</div>
              <h1>Connect. Vend. <em>Thrive.</em></h1>
              <p>The smarter way to match South Jersey's best small vendors with events, pop-ups, markets, and hosts who need them.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => setTab('vendor')}>Join as a Vendor</button>
                <button className="btn-outline" onClick={() => setTab('opportunities')}>Browse Opportunities</button>
              </div>
            </div>
            <div className="stats-bar">
              <div className="stat"><div className="stat-num">47+</div><div className="stat-label">Active Vendors</div></div>
              <div className="stat"><div className="stat-num">20</div><div className="stat-label">SJ Towns Covered</div></div>
              <div className="stat"><div className="stat-num">12</div><div className="stat-label">Categories</div></div>
              <div className="stat"><div className="stat-num">{opportunities.length}</div><div className="stat-label">Open Opportunities</div></div>
            </div>
            <div className="section" style={{ textAlign: 'center' }}>
              <div className="section-title">How It Works</div>
              <p className="section-sub">Three simple steps to connect vendors and hosts across South Jersey.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 32 }}>
                {[
                  { icon: '📋', title: 'Create Your Profile', desc: 'Vendors build a rich profile with photos, insurance, pricing, and availability.' },
                  { icon: '📣', title: 'Browse Opportunities', desc: 'See curated events and pop-ups across South Jersey actively looking for vendors.' },
                  { icon: '🤝', title: 'Book & Vend', desc: 'Apply directly or let us manage the entire booking process for you.' },
                ].map(s => (
                  <div key={s.title} style={{ background: '#fff', border: '1px solid #e8ddd0', borderRadius: 10, padding: 32 }}>
                    <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 8 }}>{s.title}</div>
                    <p style={{ fontSize: 14, color: '#7a6a5a', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 48, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-submit" onClick={() => setTab('opportunities')}>View Opportunities →</button>
                <button className="btn-submit" style={{ background: '#e8c97a', color: '#1a1410' }} onClick={() => setTab('vendor')}>Join as a Vendor →</button>
              </div>
            </div>
          </>
        )}

        {tab === 'vendor' && (
          <div className="section">
            {vendorSuccess ? (
              <>
                <div className="success-banner">
                  <div className="success-icon">🎉</div>
                  <h2>You're in the network!</h2>
                  <p>Your vendor profile has been submitted. We'll review and activate your listing within <span className="success-highlight">24 hours</span>. Welcome to SJVendorMatch.</p>
                </div>
                <button className="btn-submit" onClick={() => setVendorSuccess(false)}>Submit Another Profile</button>
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

        {tab === 'host' && (
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

        {tab === 'matches' && <MatchesPage />}
        {tab === 'opportunities' && <OpportunitiesPage opportunities={opportunities} />}
        {tab === 'pricing' && <PricingPage setTab={setTab} />}
        {tab === 'admin' && <AdminPage opportunities={opportunities} onPost={handlePostOpportunity} />}
      </div>
    </>
  );
}
