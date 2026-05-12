import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Bell,
  Bookmark,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Edit2,
  Gift,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  PlayCircle,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Volume2,
  X,
  ZoomIn
} from "lucide-react";

const API_KEY =
  typeof window !== "undefined" && window.__FALSHION_API_KEY__
    ? window.__FALSHION_API_KEY__
    : "";
const GEMINI_MODEL = "gemini-1.5-flash-latest";

const fetchWithRetry = async (url, options, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
  }
  return null;
};

const STYLE_LIBRARY = `## Style Library
### Aesthetics & Vibes
**athleisure** (48 pins): Hybrid athletic/leisure clothing (Lululemon, Athleta). Leggings, joggers, hoodies.
**Old Money trend** (20 pins): Quiet luxury, understated elegance, neutral palettes, tailored pieces.
### Key garment types
**Linen outfits** (12 pins): Relaxed elegance, coastal chic, natural wrinkles. Use neutral palettes, mix textures.
**midi skirt** (12 pins): Versatile, hits mid-calf. Casual with tees/sneakers, formal with blazers/pumps.
**Rugby POLO** (14 pins): Preppy, 20th-century collegiate. Thick horizontal stripes, rubber buttons.
**white linen maxi skirt** (9 pins): Minimalist, feminine summer staple. Pair with neutral tops or waistcoats.
### Key 2026 Color Trends
Color of the Year (2026): Cloud Dancer (soft off-white).
Key Colors: Transformative Teal, Electric Fuchsia, Blue Aura, Amber Haze, Lava Falls.
Combinations: Tomato Red & Cobalt Blue, Lime Green & Burgundy, Butter Yellow & Cool Blue.`;

const callGeminiText = async (prompt) => {
  if (!API_KEY) {
    return "API Key missing. Please set window.__FALSHION_API_KEY__ before using.";
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [
        {
          text: `You are fAIshion.AI, an elite, trendy personal AI stylist. Keep responses concise, punchy, modern, and highly actionable. Use emojis. Reference the curated style library:\n\n${STYLE_LIBRARY}`
        }
      ]
    }
  };
  try {
    const data = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't think of anything right now!";
  } catch {
    return "Oops! My fashion servers are a bit overloaded. Try asking again.";
  }
};

const callGeminiVisionJson = async (prompt, base64Image, mimeType = "image/jpeg") => {
  if (!API_KEY) {
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const base64Data = base64Image.split(",")[1] || base64Image;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          brand: { type: "STRING" },
          name: { type: "STRING" },
          category: { type: "STRING" }
        },
        required: ["brand", "name", "category"]
      }
    }
  };
  try {
    const data = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return jsonText ? JSON.parse(jsonText) : null;
  } catch {
    return null;
  }
};

const callGeminiImageEdit = async (prompt, base64Image, mimeType = "image/jpeg") => {
  if (!API_KEY) {
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`;
  const base64Data = base64Image.split(",")[1] || base64Image;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }]
      }
    ],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
  };
  try {
    const data = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const resultBase64 = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    return resultBase64 ? `data:image/png;base64,${resultBase64}` : null;
  } catch {
    return null;
  }
};

const callGeminiTTS = async (text) => {
  if (!API_KEY) {
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
      }
    },
    model: "gemini-2.5-flash-preview-tts"
  };
  try {
    const data = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

let currentAudioSource = null;
let audioCtx = null;

const playPCM16Audio = (base64Data, sampleRate = 24000) =>
  new Promise((resolve, reject) => {
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const float32Array = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < float32Array.length; i += 1) {
        float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);
      if (currentAudioSource) {
        try {
          currentAudioSource.stop();
        } catch {
          // noop
        }
      }
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        currentAudioSource = null;
        resolve();
      };
      source.start();
      currentAudioSource = source;
    } catch (error) {
      reject(error);
    }
  });

const MOCK_FEED = [
  {
    id: 401,
    filter: "minimalist",
    image: "https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg",
    user: "Chic Style",
    avatar: "https://i.pravatar.cc/150?u=chic",
    likes: 612,
    desc: "Oversized linen blazer, ribbed tank, tailored wide-leg trousers.",
    tags: ["chic", "layers"]
  },
  {
    id: 402,
    filter: "minimalist",
    image: "https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg",
    user: "Modern Minimal",
    avatar: "https://i.pravatar.cc/150?u=mod",
    likes: 844,
    desc: "Cashmere sweater, straight-leg denim, pointed boots.",
    tags: ["minimal", "modern"]
  },
  {
    id: 301,
    filter: "going-out",
    image: "https://img.ltwebstatic.com/v4/j/ssms/2025/12/08/98/176517802406eeaa10fc33833c369290b28242b73d_thumbnail_420x.webp",
    user: "Night Out Wardrobe",
    avatar: "https://i.pravatar.cc/150?u=night",
    likes: 580,
    desc: "Satin slip dress, strappy heels, metallic clutch.",
    tags: ["goingout", "weekend"]
  },
  {
    id: 302,
    filter: "boho",
    image: "https://showmeyourmumu.com/cdn/shop/files/YI5XiqLg_1440x.progressive.jpg?v=1766090892",
    user: "Show Me Your Mumu",
    avatar: "https://i.pravatar.cc/150?u=mumu",
    likes: 1240,
    desc: "Floral flutter sleeve mini, suede ankle boots.",
    tags: ["spring", "floral"]
  },
  {
    id: 503,
    filter: "minimalist",
    image: "https://i.pinimg.com/736x/c2/3d/6d/c23d6da086bd35893755ab8cb33ff280.jpg",
    user: "Neutral Palette",
    avatar: "https://i.pravatar.cc/150?u=v3",
    likes: 554,
    desc: "Clean lines and neutral tones.",
    tags: ["minimal", "clean"]
  },
  {
    id: 508,
    filter: "going-out",
    image: "https://www.meshki.us/cdn/shop/files/241119_MESHKI_SegrettiReshoots_17_882.jpg?v=1775956764&width=1206",
    user: "Glamour Look",
    avatar: "https://i.pravatar.cc/150?u=v8",
    likes: 920,
    desc: "Sleek and sophisticated evening wear.",
    tags: ["evening", "sophisticated"]
  },
  {
    id: 509,
    filter: "coastal",
    image: "https://i.pinimg.com/1200x/d6/04/ad/d604ad4e4a3fe22e874347be6b0154c1.jpg",
    user: "Breezy Style",
    avatar: "https://i.pravatar.cc/150?u=v9",
    likes: 315,
    desc: "Catching the coastal breeze.",
    tags: ["coastal", "breezy"]
  }
];

const INITIAL_WARDROBE = [
  {
    id: 1,
    brand: "Polo Ralph Lauren",
    name: "Striped rugby polo",
    image: "https://i.pinimg.com/1200x/75/5a/98/755a98d93f917608e6eb73c2a77e7481.jpg",
    category: "Tops"
  },
  {
    id: 2,
    brand: "MANGO",
    name: "Straw tote bag",
    image: "https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg",
    category: "Bags"
  },
  {
    id: 3,
    brand: "Larroudé",
    name: "Red ballet flats",
    image: "https://i.pinimg.com/736x/66/e9/47/66e9479e255e594de1f29fe1c3c27067.jpg",
    category: "Shoes"
  },
  {
    id: 4,
    brand: "ZARA",
    name: "Pleated mini skirt",
    image: "https://i.pinimg.com/736x/98/8c/44/988c44232d4e09159f3820c238e3586c.jpg",
    category: "Bottoms"
  },
  {
    id: 5,
    brand: "Workwear",
    name: "Black top",
    image: "https://i.pinimg.com/1200x/52/f6/57/52f65798fb399c2c00a8e0c46b3bf5b8.jpg",
    category: "Tops"
  },
  {
    id: 6,
    brand: "Workwear",
    name: "Skirt",
    image: "https://i.pinimg.com/1200x/80/03/27/8003277e7ed81a18ae2ce4279550ec77.jpg",
    category: "Bottoms"
  },
  {
    id: 7,
    brand: "Everyday",
    name: "Denim shirt",
    image: "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg",
    category: "Tops"
  },
  {
    id: 8,
    brand: "Everyday",
    name: "Floral Skirt",
    image: "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg",
    category: "Bottoms"
  },
  {
    id: 9,
    brand: "Bonnie Clyde",
    name: "Sunglasses",
    image: "https://bonnieclyde.la/cdn/shop/files/Baby.Black.Brown.jpg?v=1773273081&width=1000",
    category: "Jewelry"
  },
  {
    id: 10,
    brand: "Everyday",
    name: "Bag",
    image: "https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg",
    category: "Bags"
  },
  {
    id: 11,
    brand: "Everyday",
    name: "High heels",
    image: "https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg",
    category: "Shoes"
  },
  {
    id: 12,
    brand: "Everyday",
    name: "Kitten-heel",
    image: "https://i.pinimg.com/1200x/cc/1c/8d/cc1c8d1eff8e5442bb72864fbfd3d337.jpg",
    category: "Shoes"
  }
];

const MOCK_WISHLIST = [
  {
    id: 101,
    brand: "ZARA",
    name: "Satin maxi dress",
    price: "$89",
    image: "https://cdn.mos.cms.futurecdn.net/kS7tzWxXP88T2GY46gju99-1600-80.jpg.webp",
    category: "Dresses"
  },
  {
    id: 102,
    brand: "SSENSE",
    name: "Summer tote",
    price: "$340",
    image: "https://cdn.mos.cms.futurecdn.net/5iP9pDMJAgVMfnbkGVjWhd-1600-80.jpg.webp",
    category: "Bags"
  },
  {
    id: 103,
    brand: "MANGO",
    name: "Pleated trousers",
    price: "$99",
    image: "https://cdn.mos.cms.futurecdn.net/myGZ3oP99vpGPSukjsfGLi-1600-80.jpg.webp",
    category: "Bottoms"
  },
  {
    id: 104,
    brand: "Reformation",
    name: "Linen waistcoat",
    price: "$128",
    image: "https://cdn.mos.cms.futurecdn.net/V2Phz4BcHo7yoDwLtXKMgQ-1600-80.jpg.webp",
    category: "Tops"
  }
];

const WEDDING_ITEMS = [
  {
    id: "w_d1",
    brand: "12th Tribe",
    name: "Pink Satin Sorbet Maxi",
    price: "$89.00",
    image: "https://www.12thtribe.com/cdn/shop/files/MirabellaPinkSatinSorbetMaxiDress_2_ee231900-fb9e-457b-83f5-b38399d221f4.jpg?v=1771439261&width=832",
    link: "https://www.12thtribe.com/products/mirabella-pink-satin-sorbet-maxi-dress",
    category: "Dresses"
  },
  {
    id: "w_d2",
    brand: "Lulus",
    name: "Pastel Floral Maxi",
    price: "$78.00",
    image: "https://www.lulus.com/images/product/xlarge/2812751_New_01_hero_2026-04-24.jpg?w=617&hdpi=1",
    category: "Dresses"
  },
  {
    id: "w_d3",
    brand: "Lulus",
    name: "Yellow Tie-Strap Midi",
    price: "$65.00",
    image: "https://www.lulus.com/images/product/xlarge/11626201_2382031.jpg?w=560",
    link: "https://www.lulus.com/products/summer-invite-yellow-tie-strap-tiered-midi-dress/2382031.html",
    category: "Dresses"
  },
  {
    id: "w_j1",
    brand: "12th Tribe",
    name: "Gold Cuff Bangles",
    price: "$25.00",
    image: "https://www.12thtribe.com/cdn/shop/files/RunyonSetof2GoldCuffBangles2_48a45fb8-b1ab-42e1-871a-ee5cc7909a5e.jpg?v=1771595860&width=1600",
    category: "Jewelry"
  },
  {
    id: "w_j2",
    brand: "12th Tribe",
    name: "Coin Earrings",
    price: "$22.00",
    image: "https://www.12thtribe.com/cdn/shop/files/Golden_Dune_Coin_Earrings2.png?v=1775706476&width=1600",
    category: "Jewelry"
  },
  {
    id: "w_j3",
    brand: "Lulus",
    name: "Rhinestone Drop Earrings",
    price: "$18.00",
    image: "https://www.lulus.com/images/product/xlarge/2820591_New_02_topdown_2026-03-18.jpg?w=278&hdpi=1",
    category: "Jewelry"
  },
  {
    id: "w_s1",
    brand: "Lulus",
    name: "Gold Lace-Up Heels",
    price: "$44.00",
    image: "https://www.lulus.com/images/product/xlarge/11224641_1034742.jpg?w=278&hdpi=1",
    category: "Shoes"
  },
  {
    id: "w_s4",
    brand: "Lulus",
    name: "White Leather Heels",
    price: "$49.00",
    image: "https://www.lulus.com/images/product/xlarge/12577541_2659331.jpg?w=375&hdpi=1",
    category: "Shoes"
  }
];

const LINEN_SKIRT_ITEMS = [
  {
    id: "ls_1",
    brand: "Nordstrom",
    name: "Linen Midi Pencil Skirt",
    price: "$89.00",
    image: "https://i.pinimg.com/736x/f1/14/eb/f114ebfe6189b40dfeae6954a9d94223.jpg",
    link: "http://nordstrom.com/s/linen-midi-pencil-skirt/8909660",
    category: "Bottoms"
  },
  {
    id: "ls_2",
    brand: "Boutique",
    name: "White Peplum Shirt",
    price: "$55.00",
    image: "https://i.pinimg.com/1200x/72/35/1a/72351ac3f9cddc17159afe5490feb0b4.jpg",
    category: "Tops"
  },
  {
    id: "ls_3",
    brand: "Abercrombie & Fitch",
    name: "Smocked Halter Top",
    price: "$40.00",
    image: "https://i.pinimg.com/1200x/96/8b/65/968b65eb73081db085aaeffc04f76546.jpg",
    category: "Tops"
  },
  {
    id: "ls_4",
    brand: "H&M",
    name: "Pointelle-Knit Peplum Top",
    price: "$24.99",
    image: "https://image.hm.com/assets/hm/9a/e0/9ae0bdf0cba705e943fb47be45cfb7bc0b7b5bce.jpg?imwidth=1536",
    category: "Tops"
  },
  {
    id: "ls_5",
    brand: "Boutique",
    name: "Cotton Blend Skirt Set",
    price: "$98.00",
    image: "https://i.pinimg.com/1200x/5b/02/06/5b02060ebd4ab5b5334ea26a2629839d.jpg",
    category: "Sets"
  },
  {
    id: "ls_8",
    brand: "Capazo",
    name: "Linen Top Handle Bag",
    price: "$120.00",
    image: "https://i.pinimg.com/1200x/01/81/73/018173835836526c9ef259e54e2ecb65.jpg",
    category: "Bags"
  },
  {
    id: "ls_10",
    brand: "Steve Madden",
    name: "Slide Sandals",
    price: "$79.95",
    image: "https://i.pinimg.com/736x/40/85/24/408524472fa2303f2767fd03d026874c.jpg",
    category: "Shoes"
  }
];

const MOCK_TRENDS = [
  {
    id: "sporty",
    title: "Athleisure",
    subtitle: "",
    image: "https://reaverfit.com/cdn/shop/articles/Design_sans_titre_72f4415a-e36b-4aa2-8fca-546c4404a713.jpg?v=1747426637&width=2048"
  },
  {
    id: "office",
    title: "Office Chic",
    subtitle: "",
    image: "https://img.abercrombie.com/is/image/anf/ANF-2026-FebWk4-D-Category-Office-Approved-New.jpg"
  },
  {
    id: "linen",
    title: "Breezy Linen",
    subtitle: "",
    image: "https://i.cbc.ca/ais/1.5118938,1556741576000/full/max/0/default.jpg?im=Crop%2Crect%3D%280%2C0%2C1280%2C720%29%3B"
  }
];

const MOCK_SHOP_ITEMS = {
  sporty: [
    {
      id: "s1",
      brand: "Alo Yoga",
      name: "Airlift High-Waist Legging",
      price: "$128.00",
      image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTjNvZR91MjYAeLpjq6tD3fQY3BWEUncWD6ZLb9sJ3FVVwDgq5ZPec9T5abHkF8q3JhxitRxFONbnF3sjdxMZRkH_1J4D9xOpo9dO2XRQc9u_ZykIe_IloHHw&usqp=CAc"
    },
    {
      id: "s2",
      brand: "Lululemon",
      name: "Define Jacket",
      price: "$118.00",
      image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRtukOZwfWskQvKhQ27lfMPhBeEc6I78G5s2t6_6_E8TB1gcFT8S4_eKKyQStyH5sVWDxJ7EbifMsM9U9HoK8eVJrGEPafFC9f15--5EYBd7uOqi7Sh_Kolb3hmL0Xju4xagaC1kA&usqp=CAc"
    }
  ],
  office: [
    {
      id: "o1",
      brand: "Abercrombie",
      name: "Tailored Drape Blazer",
      price: "$120.00",
      image: "https://img.abercrombie.com/is/image/anf/KIC_144-6093-00466-401_model1?policy=product-medium"
    },
    {
      id: "o2",
      brand: "Banana Republic",
      name: "Wide Leg Trousers",
      price: "$110.00",
      image: "https://bananarepublic.gap.com/webcontent/0060/268/424/cn60268424.jpg"
    }
  ],
  linen: [
    {
      id: "l1",
      brand: "Mango",
      name: "100% Linen Shirt",
      price: "$59.99",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
    }
  ]
};

const MOCK_SHOP_ALL_ITEMS = [
  {
    id: "all1",
    brand: "ZARA",
    name: "Ribbed Knit Top",
    price: "$29.90",
    numPrice: 29.9,
    category: "Tops",
    demographic: "Women's",
    sortTag: "New",
    reviews: 120,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "all2",
    brand: "Levi's",
    name: "501 Original Fit Jeans",
    price: "$98.00",
    numPrice: 98,
    category: "Bottoms",
    demographic: "Unisex",
    sortTag: "Recommended",
    reviews: 450,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "all_new_1",
    brand: "Mate",
    name: "Organic Cotton Shrunken Tee",
    price: "$58.00",
    numPrice: 58,
    category: "Tops",
    image: "https://matethelabel.com/cdn/shop/files/20250128_LightWork_MateTheLabel_ApparelFlats_SetA_OrganicCottonShrunkenTee_BON_0258_2f6eb46a-e321-49bb-bde8-09f2b83a777a_1080x.jpg?v=1743108909"
  },
  {
    id: "all_new_2",
    brand: "Glassons",
    name: "High Boat Neck Fitted Tank",
    price: "$19.99",
    numPrice: 19.99,
    category: "Tops",
    image: "https://www.glassons.com/content/products/prima-slash-neck-tank-fudge-fantasy-clearcut-tv317661pon.jpg?optimize=high&width=1500"
  },
  {
    id: "all_new_3",
    brand: "H&M",
    name: "Lace-Trimmed Slip Dress",
    price: "$39.99",
    numPrice: 39.99,
    category: "Dresses",
    image: "https://image.hm.com/assets/hm/8e/00/8e002ec2b34e50f4e78bf80a2552e68bb2e7746b.jpg?imwidth=2160"
  },
  {
    id: "all_new_4",
    brand: "Aritzia",
    name: "The '80s Comfy Denim Shirt",
    price: "$98.00",
    numPrice: 98,
    category: "Tops",
    image: "https://assets.aritzia.com/image/upload/c_crop,ar_1920:2623,g_south/q_auto,f_auto,dpr_auto,w_1500/s26_a02_114191_29866_off_a"
  },
  {
    id: "all_new_5",
    brand: "Mango",
    name: "Polka dot balloon jeans",
    price: "$89.99",
    numPrice: 89.99,
    category: "Bottoms",
    image: "https://media.mango.com/is/image/punto/27057159-32-021?wid=2048"
  },
  {
    id: "all_new_6",
    brand: "Old Navy",
    name: "Smocked-Waist Midi Skirt",
    price: "$19.99",
    numPrice: 19.99,
    category: "Bottoms",
    image: "https://oldnavy.gap.com/webcontent/0061/865/520/cn61865520.jpg"
  },
  {
    id: "all_new_7",
    brand: "Gap",
    name: "Linen-Blend Easy Wide-Leg Pants",
    price: "$79.95",
    numPrice: 79.95,
    category: "Bottoms",
    image: "https://www.gap.com/webcontent/0061/640/904/cn61640904.jpg"
  }
];

const MOCK_MIX_GALLERY = [
  {
    id: "m1",
    image: "https://i.pinimg.com/736x/14/05/40/140540fb8d71f81d3faee97ae16c13d6.jpg",
    title: "Look #2",
    date: "17d",
    published: true,
    user: { name: "Alex Schwan", avatar: "A" },
    components: [
      {
        id: "c1",
        image: "https://i.pinimg.com/1200x/a8/4a/d8/a84ad8cca0937277c206578757b1e234.jpg",
        name: "Top"
      },
      {
        id: "c2",
        image: "https://www.gap.com/webcontent/0062/045/335/cn62045335.jpg",
        name: "Bottoms"
      },
      {
        id: "c3",
        image: "https://i.pinimg.com/1200x/4c/4e/8f/4c4e8f7994b4264ea9d047aa0807dbb7.jpg",
        name: "Shoes"
      }
    ]
  }
];

const EXTRACTED_DATA_MOCK = {
  scene: "Sunset beach with golden hour lighting, soft waves in the background, warm sand",
  items: [
    {
      id: "e1",
      name: "Yellow Satin Maxi",
      category: "DRESSES",
      matchesCount: 12,
      matchData: [
        {
          id: "m1",
          brand: "Reformation",
          name: "YELLOW SATIN MAXI",
          price: 189,
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
        },
        {
          id: "m2",
          brand: "Zara",
          name: "YELLOW SATIN MAXI",
          price: 189,
          image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=600"
        }
      ]
    },
    {
      id: "e2",
      name: "Pink Strappy Heel",
      category: "SHOES",
      matchesCount: 8,
      matchData: [
        {
          id: "m5",
          brand: "Steve Madden",
          name: "PINK STRAPPY HEEL",
          price: 95,
          image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600"
        }
      ]
    }
  ]
};

const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (newState) => {
      state = typeof newState === "function" ? newState(state) : newState;
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

const mixStore = createStore([]);
const feedStore = createStore(MOCK_FEED);
const myPostsStore = createStore(MOCK_MIX_GALLERY);
const wishlistStore = createStore(MOCK_WISHLIST);
const wardrobeStore = createStore(INITIAL_WARDROBE);
const wardrobeUploadStore = createStore(null);
const outfitsStore = createStore({
  outfits: [
    {
      id: 1,
      title: "Cute everyday outfit",
      source: "Saved from Wardrobe",
      items: [
        { type: "image", content: "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg" },
        { type: "image", content: "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg" },
        { type: "image", content: "https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg" },
        { type: "image", content: "https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg" }
      ],
      tags: [{ label: "CASUAL", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }]
    },
    {
      id: 2,
      title: "Work outfit",
      source: "Saved from Wardrobe",
      items: [
        { type: "image", content: "https://i.pinimg.com/1200x/52/f6/57/52f65798fb399c2c00a8e0c46b3bf5b8.jpg" },
        { type: "image", content: "https://i.pinimg.com/1200x/80/03/27/8003277e7ed81a18ae2ce4279550ec77.jpg" },
        { type: "image", content: "https://i.pinimg.com/736x/45/d8/0e/45d80e89945ab6d354a12280e9071d7c.jpg" }
      ],
      tags: [{ label: "WORKWEAR", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }]
    }
  ],
  unread: 0
});
const flyingStore = createStore(null);

const triggerFlyingAnimation = (src, e) => {
  if (!e?.currentTarget) {
    return;
  }
  const rect = e.currentTarget.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  flyingStore.setState({ id: Date.now(), src, startX, startY });
  setTimeout(() => flyingStore.setState(null), 700);
};

const useStore = (store) => {
  const [state, setState] = useState(store.getState());
  useEffect(() => store.subscribe(setState), [store]);
  return [state, store.setState.bind(store)];
};

const useGlobalMix = () => {
  const [mix] = useStore(mixStore);
  const setMix = (newItems) => {
    mixStore.setState(typeof newItems === "function" ? newItems(mixStore.getState()) : newItems);
  };
  return [mix, setMix];
};

const useUnreadOutfits = () => {
  const [state] = useStore(outfitsStore);
  const clearUnread = () => outfitsStore.setState((s) => ({ ...s, unread: 0 }));
  return [state.unread, clearUnread];
};

const addGlobalOutfit = (outfit) => {
  outfitsStore.setState((s) => ({
    outfits: [outfit, ...s.outfits],
    unread: s.unread + 1
  }));
};

const useWishlist = () => {
  const [wishlist] = useStore(wishlistStore);
  const toggleWishlist = (item) => {
    const current = wishlistStore.getState();
    const exists = current.find((w) => w.id === item.id);
    if (exists) {
      wishlistStore.setState(current.filter((w) => w.id !== item.id));
    } else {
      wishlistStore.setState([
        {
          id: item.id,
          brand: item.user || item.brand || "Saved",
          name: item.desc || item.name || "Look",
          price: item.price || "-",
          image: item.image,
          category: item.category || "Tops"
        },
        ...current
      ]);
    }
  };
  return [wishlist, toggleWishlist, wishlistStore.setState.bind(wishlistStore)];
};

function OutfitBento({ items }) {
  const images = (items || []).filter((item) => item.type === "image").map((item) => item.content || item.image || item);
  const len = images.length;
  if (len === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-[#999999] text-[10px] font-bold uppercase tracking-widest bg-[#f5f3ef]">
        Empty Mix
      </div>
    );
  }
  const renderImage = (img, index, extraClass = "") => (
    <div
      key={index}
      className={`w-full h-full bg-[#f5f3ef] relative overflow-hidden flex items-center justify-center ${extraClass}`}
    >
      <img
        src={img}
        className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        alt="Outfit item"
      />
    </div>
  );
  let gridContent;
  let containerClass = "absolute inset-0 bg-white pointer-events-none ";
  let inlineStyle = {};
  if (len === 1) {
    containerClass += "flex";
    gridContent = renderImage(images[0], 0);
  } else if (len === 2) {
    containerClass += "grid grid-cols-2 gap-[2px]";
    gridContent = images.map((img, i) => renderImage(img, i));
  } else if (len === 3) {
    containerClass += "grid grid-cols-2 grid-rows-2 gap-[2px]";
    gridContent = (
      <>
        {renderImage(images[0], 0, "row-span-2")}
        {renderImage(images[1], 1)}
        {renderImage(images[2], 2)}
      </>
    );
  } else if (len === 4) {
    containerClass += "grid grid-cols-2 grid-rows-2 gap-[2px]";
    gridContent = images.map((img, i) => renderImage(img, i));
  } else {
    containerClass += "grid grid-cols-3 grid-rows-2 gap-[2px]";
    gridContent = images.slice(0, 6).map((img, i) => renderImage(img, i));
  }
  return (
    <div className={containerClass} style={inlineStyle}>
      {gridContent}
    </div>
  );
}

function OutfitCollage({ items, interactive = false }) {
  const images = (items || []).filter((item) => item.type === "image").map((item) => item.content || item.image || item);
  const containerRef = useRef(null);
  const defaultPositions = [
    { x: 8, y: 5, w: 55, h: 45, z: 10 },
    { x: 12, y: 40, w: 50, h: 55, z: 20 },
    { x: 50, y: 12, w: 45, h: 55, z: 30 },
    { x: 57, y: 65, w: 35, h: 30, z: 40 },
    { x: 2, y: 45, w: 35, h: 35, z: 50 },
    { x: 65, y: 5, w: 25, h: 20, z: 50 }
  ];
  const [transforms, setTransforms] = useState({});
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    setTransforms((prev) => {
      const next = { ...prev };
      let changed = false;
      images.forEach((_, idx) => {
        if (!next[idx]) {
          next[idx] = { ...defaultPositions[idx % defaultPositions.length] };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [images]);

  const dragInfo = useRef({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    initW: 0,
    initH: 0
  });

  const handlePointerDown = (e, idx, isResize = false) => {
    if (!interactive) {
      return;
    }
    e.stopPropagation();
    setActiveIdx(idx);
    e.target.setPointerCapture(e.pointerId);
    dragInfo.current = {
      isDragging: !isResize,
      isResizing: isResize,
      startX: e.clientX,
      startY: e.clientY,
      initX: transforms[idx].x,
      initY: transforms[idx].y,
      initW: transforms[idx].w,
      initH: transforms[idx].h
    };
  };

  const handlePointerMove = (e, idx) => {
    if (!interactive || activeIdx !== idx || !containerRef.current) {
      return;
    }
    const info = dragInfo.current;
    if (!info.isDragging && !info.isResizing) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - info.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - info.startY) / rect.height) * 100;
    setTransforms((prev) => {
      const updated = { ...prev };
      const item = { ...updated[idx] };
      if (info.isDragging) {
        item.x = info.initX + deltaX;
        item.y = info.initY + deltaY;
      } else {
        const scaleFactor = 1 + Math.max(deltaX, deltaY) / Math.max(info.initW, info.initH);
        item.w = Math.max(5, info.initW * scaleFactor);
        item.h = Math.max(5, info.initH * scaleFactor);
      }
      updated[idx] = item;
      return updated;
    });
  };

  const handlePointerUp = (e) => {
    if (!interactive) {
      return;
    }
    dragInfo.current.isDragging = false;
    dragInfo.current.isResizing = false;
    if (e.target.hasPointerCapture?.(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-[#999999] text-[10px] font-bold uppercase tracking-widest bg-[#f5f3ef]">
        Empty Mix
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${interactive ? "" : "pointer-events-none"}`}
      onClick={() => setActiveIdx(null)}
    >
      {images.map((img, idx) => {
        const t = transforms[idx] || defaultPositions[idx % defaultPositions.length];
        const isActive = activeIdx === idx;
        return (
          <div
            key={idx}
            className={`absolute flex justify-center items-center ${interactive ? "cursor-move touch-none" : ""}`}
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.w}%`,
              height: `${t.h}%`,
              zIndex: isActive ? 60 : t.z,
              mixBlendMode: "multiply"
            }}
            onPointerDown={(e) => handlePointerDown(e, idx, false)}
            onPointerMove={(e) => handlePointerMove(e, idx)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img src={img} alt="Outfit item" className="max-w-full max-h-full object-contain" style={{ pointerEvents: "none" }} />
            {interactive && isActive && (
              <div
                className="absolute -bottom-3 -right-3 w-8 h-8 bg-white border border-[#e5e5e5] rounded-full cursor-nwse-resize shadow-md flex items-center justify-center z-[70]"
                onPointerDown={(e) => handlePointerDown(e, idx, true)}
                onPointerMove={(e) => handlePointerMove(e, idx)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <ZoomIn size={14} className="text-[#1a1a1a] pointer-events-none" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubView({ title, onBack, children }) {
  return (
    <div className="bg-[#f5f3ef] min-h-full pb-24 flex flex-col animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 sm:pt-14 bg-[#f5f3ef] border-b border-[#e5e5e5] sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-[#1a1a1a] hover:bg-[#e8e5df] transition border border-[#e5e5e5]">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-serif italic text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="p-4 space-y-6 overflow-y-auto">{children}</div>
    </div>
  );
}

function ShopItemOverlay({ initialItem, onClose, wishlist, toggleWishlist, showToast }) {
  const [history, setHistory] = useState([initialItem]);
  const currentItem = history[history.length - 1];
  const scrollRef = useRef(null);

  useEffect(() => {
    setHistory([initialItem]);
  }, [initialItem]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [history]);

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    } else {
      onClose();
    }
  };

  const similarItems = MOCK_SHOP_ALL_ITEMS.filter((i) => i.id !== currentItem.id);

  return (
    <div className="fixed inset-0 z-[90] bg-[#f5f3ef] flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 sticky top-0 z-10 bg-[#f5f3ef]/80 backdrop-blur-xl border-b border-[#e5e5e5]/50">
        <button onClick={handleBack} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-serif text-[#1a1a1a] text-lg">Shop Item</span>
        <div className="w-10" />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-20">
        <div className="w-full relative bg-[#e6e2d6] h-[60vh] border-b border-[#e5e5e5] shrink-0 rounded-b-[2.5rem] overflow-hidden shadow-sm">
          <img src={currentItem.image} className="w-full h-full object-cover" alt={currentItem.name} />
        </div>
        <div className="p-6 bg-[#f5f3ef] flex flex-col gap-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#1a1a1a] tracking-wide leading-snug">
                {currentItem.brand && (
                  <>
                    {currentItem.brand}
                    <br />
                  </>
                )}
                <span className="text-xl italic text-[#6B655F]">{currentItem.name}</span>
              </h1>
              {currentItem.price && <p className="text-2xl font-bold text-[#1a1a1a] mt-3">{currentItem.price}</p>}
            </div>
            <button
              onClick={() => {
                toggleWishlist(currentItem);
                showToast(wishlist.some((w) => w.id === currentItem.id) ? "Removed from Wishlist" : "Saved to Wishlist");
              }}
              className={`p-3 rounded-full bg-white border border-[#e5e5e5] shadow-sm shrink-0 transition-colors ${wishlist.some((w) => w.id === currentItem.id) ? "text-red-500" : "text-[#1a1a1a] hover:text-red-500"}`}
            >
              <Heart size={24} fill={wishlist.some((w) => w.id === currentItem.id) ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={() => {
              showToast("Opening Shop...");
              setTimeout(() => {
                window.open(
                  currentItem.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${currentItem.brand || ""} ${currentItem.name || ""}`)}`,
                  "_blank"
                );
              }, 1000);
            }}
            className="w-full py-4 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          >
            <ShoppingCart size={16} /> SHOP ITEM
          </button>
          <div className="mt-2 pt-6 border-t border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-[#1a1a1a]" />
              <h3 className="font-serif text-xl text-[#1a1a1a]">More like this</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-6">
              {similarItems.slice(0, 6).map((simItem) => (
                <div key={simItem.id} onClick={() => setHistory([...history, simItem])} className="flex flex-col gap-1.5 cursor-pointer group relative">
                  <div className="relative aspect-[4/5] bg-[#e6e2d6] rounded-3xl border border-[#e5e5e5] overflow-hidden mb-1">
                    <img src={simItem.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={simItem.name} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#999999] uppercase tracking-tight font-bold">{simItem.brand}</p>
                    <p className="text-xs font-bold text-[#1a1a1a] line-clamp-1">{simItem.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-[#1a1a1a]">{simItem.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="py-2 flex flex-col items-center justify-center gap-3 text-[#999999]">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Refining your style</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingFeed({ aura }) {
  const [activeTab, setActiveTab] = useState("COMMUNITY");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCommunityFilter, setActiveCommunityFilter] = useState("All");
  const [mixItems, setMixItems] = useGlobalMix();
  const [feedData, setFeedData] = useStore(feedStore);
  const [wishlist, toggleWishlist] = useWishlist();
  const [outfitsState] = useStore(outfitsStore);
  const localOutfits = outfitsState.outfits;
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [inlineSearch, setInlineSearch] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [postHistory, setPostHistory] = useState([]);
  const [isRemixed, setIsRemixed] = useState(false);
  const postScrollRef = useRef(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);

  const filterTags = [
    { label: "Y2K", slug: "y2k" },
    { label: "Going Out", slug: "going-out" },
    { label: "Minimalist", slug: "minimalist" },
    { label: "Coastal", slug: "coastal" }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleAskStylist = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      return;
    }
    setIsSearchFocused(false);
    aura.setInputText(query);
    aura.processPrompt(query);
    if (!API_KEY) {
      aura.setAuraMessage(await callGeminiText(query));
    }
    setSearchQuery("");
  };

  const handleInlineSearch = (item) => {
    setInlineSearch((prev) => ({ ...prev, [item.id]: { status: "scanning" } }));
    setTimeout(() => {
      const matches = [...MOCK_SHOP_ALL_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 3);
      setInlineSearch((prev) => ({
        ...prev,
        [item.id]: { status: "results", results: matches }
      }));
    }, 1500);
  };

  const handlePressStart = (e, item) => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }
      setContextMenu(item.id);
    }, 450);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleMenuAction = (action, item, e) => {
    if (action === "search") {
      handleInlineSearch(item);
    } else if (action === "Added to Mix") {
      triggerFlyingAnimation(item.image, e);
      const combined = [{ id: Date.now(), image: item.image }, ...mixItems].slice(0, 5);
      setMixItems(combined);
      showToast("Added to Try-On Mix");
    } else {
      showToast(action);
    }
    setContextMenu(null);
  };

  const handleCardClick = (item) => {
    if (!isLongPress.current && !contextMenu) {
      setPostHistory([item]);
      setIsRemixed(false);
    }
  };

  const selectedPost = postHistory[postHistory.length - 1] || null;

  return (
    <div className="bg-[#f5f3ef] min-h-full pb-24 relative">
      {toastMessage && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap flex items-center gap-2">
          {toastMessage}
        </div>
      )}
      <div className="sticky top-0 z-30 flex flex-col bg-[#f5f3ef]/90 backdrop-blur-xl">
        {!isSearchFocused && (
          <div className="flex justify-between items-center px-4 pt-12 pb-3 sm:pt-14">
            <h1 className="text-3xl font-serif italic text-[#1a1a1a] tracking-tight">fAIshion</h1>
            <button onClick={() => showToast("No new notifications")} className="text-[#1a1a1a] hover:text-black transition active:scale-95">
              <Bell size={22} />
            </button>
          </div>
        )}
        <div className={`px-4 pb-2 ${isSearchFocused ? "pt-12 sm:pt-14" : ""}`}>
          <form
            onSubmit={handleAskStylist}
            className={`flex flex-col gap-3 bg-white rounded-full px-5 py-3.5 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border transition-all ${isSearchFocused ? "border-black ring-4 ring-black/5" : "border-[#e5e5e5] focus-within:border-black focus-within:ring-4 focus-within:ring-black/5"}`}
          >
            <div className="flex items-center gap-3 w-full">
              {isSearchFocused ? (
                <button type="button" onClick={() => setIsSearchFocused(false)} className="text-[#999999] hover:text-[#1a1a1a] shrink-0 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <Sparkles size={18} className="text-[#1a1a1a] shrink-0" />
              )}
              <input
                type="text"
                placeholder="Ask your AI stylist..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1a1a1a] placeholder:text-[#999999] min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              <button type="button" onClick={() => aura.openAura()} className="text-[#999999] hover:text-[#1a1a1a] transition shrink-0">
                <Camera size={18} />
              </button>
              <button type="submit" className="text-[#999999] hover:text-[#1a1a1a] transition shrink-0">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
        {!isSearchFocused && (
          <div className="flex px-4 pt-2 border-b border-[#e5e5e5]">
            <button
              onClick={() => {
                setActiveTab("COMMUNITY");
                setSelectedTrend(null);
              }}
              className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === "COMMUNITY" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#999999] hover:text-[#1a1a1a] transition-colors"}`}
            >
              COMMUNITY
            </button>
            <button
              onClick={() => setActiveTab("SHOP")}
              className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === "SHOP" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#999999] hover:text-[#1a1a1a] transition-colors"}`}
            >
              SHOP
            </button>
          </div>
        )}
      </div>
      {aura.auraMessage && !isSearchFocused && (
        <div className="px-4 mb-6 mt-4 flex items-start justify-between gap-3 animate-in fade-in bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#1a1a1a] font-medium leading-relaxed">{aura.auraMessage}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => aura.toggleSpeech(aura.auraMessage)}
              className={`p-1.5 rounded-full transition ${aura.isSpeaking ? "bg-purple-100 text-purple-600" : "text-[#999999] hover:text-[#1a1a1a] hover:bg-gray-100"}`}
            >
              {aura.isSpeaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
            </button>
            <button onClick={aura.clearAuraMessage} className="p-1.5 rounded-full text-[#999999] hover:text-[#1a1a1a] hover:bg-gray-100 transition">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {isSearchFocused && (
        <div className="px-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
          <h3 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-4">Trending Searches</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {["Linen dresses", "Spring wedding guest", "Chic office wear", "Y2K denim"].map((trend) => (
              <button
                key={trend}
                onClick={() => {
                  setSearchQuery(trend);
                  setIsSearchFocused(false);
                  aura.setInputText(trend);
                  aura.processPrompt(trend);
                }}
                className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-full text-xs font-bold text-[#1a1a1a] shadow-sm hover:bg-gray-50 flex items-center gap-2 transition active:scale-95"
              >
                <TrendingUp size={12} className="text-[#999999]" />
                {trend}
              </button>
            ))}
          </div>
        </div>
      )}
      {!isSearchFocused && (
        <>
          {activeTab === "COMMUNITY" ? (
            <>
              <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide animate-in slide-in-from-top-2">
                <button
                  onClick={() => setActiveCommunityFilter("All")}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${activeCommunityFilter === "All" ? "bg-[#1a1a1a] text-white" : "border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f3ef]"}`}
                >
                  All
                </button>
                {filterTags.map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => setActiveCommunityFilter(tag.slug)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${activeCommunityFilter === tag.slug ? "bg-[#1a1a1a] text-white border-transparent" : "border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f3ef]"}`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <div className="columns-2 gap-3 px-4 pt-2">
                {feedData
                  .filter((item) => activeCommunityFilter === "All" || item.filter === activeCommunityFilter)
                  .map((item) => {
                    const isLiked = localOutfits.some((o) => o.id === item.id);
                    return (
                      <div key={item.id} className="mb-4 break-inside-avoid relative group flex flex-col">
                        <div
                          className="relative rounded-[2rem] overflow-hidden bg-[#e6e2d6] active:scale-[0.98] transition-all duration-300 select-none cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => handleCardClick(item)}
                          onTouchStart={(e) => handlePressStart(e, item)}
                          onTouchEnd={cancelPress}
                          onTouchMove={cancelPress}
                          onMouseDown={(e) => handlePressStart(e, item)}
                          onMouseUp={cancelPress}
                          onMouseMove={cancelPress}
                          onMouseLeave={cancelPress}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <img src={item.image} alt="post" className="w-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isLiked) {
                                outfitsStore.setState((s) => ({ ...s, outfits: s.outfits.filter((o) => o.id !== item.id) }));
                                showToast("Removed from Outfits");
                              } else {
                                addGlobalOutfit({
                                  id: item.id,
                                  title: `${item.user}'s Look`,
                                  source: "Saved from Community",
                                  coverImage: item.image,
                                  items: MOCK_SHOP_ALL_ITEMS.slice(0, 4).map((c) => ({ type: "image", content: c.image })),
                                  tags: [{ label: "Wishlist Looks", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }]
                                });
                                showToast("Saved to Outfits");
                              }
                            }}
                            className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full transition shadow-sm z-10 ${isLiked ? "text-red-500" : "text-[#1a1a1a] hover:text-red-500"}`}
                          >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                          </button>
                          {contextMenu === item.id && (
                            <div className="absolute inset-0 bg-black/20 z-20 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}>
                              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white/95 backdrop-blur-md rounded-3xl px-3 py-2 shadow-xl animate-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Saved to Outfits", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                                  <Bookmark size={14} />
                                  <span className="text-[8px] font-bold uppercase tracking-wide">Save</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Mix", item, e); }} className="flex flex-col items-center gap-0.5 bg-black text-white rounded-full p-2.5 -mt-8 shadow-md hover:scale-105 transition-transform border-4 border-[#e6e2d6]">
                                  <Layers size={14} />
                                  <span className="text-[8px] font-bold mt-0.5">Mix</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleMenuAction("search", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                                  <Search size={14} />
                                  <span className="text-[8px] font-bold uppercase tracking-wide">Similar</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {inlineSearch[item.id] && (
                          <div className="mt-2 bg-white rounded-2xl border border-[#e5e5e5] p-3 shadow-sm animate-in slide-in-from-top-2 z-10 relative cursor-default" onClick={(e) => e.stopPropagation()}>
                            {inlineSearch[item.id].status === "scanning" ? (
                              <div className="flex flex-col items-center justify-center py-3">
                                <Loader2 size={18} className="animate-spin text-[#999999] mb-2" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#999999]">Searching Google...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <Search size={10} className="text-blue-500" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]">Google Matches</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInlineSearch((prev) => {
                                        const next = { ...prev };
                                        delete next[item.id];
                                        return next;
                                      });
                                    }}
                                    className="text-[#999999] hover:text-[#1a1a1a] p-1 -mr-1 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                                  {inlineSearch[item.id].results.map((res) => (
                                    <div
                                      key={res.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${res.brand} ${res.name}`)}`, "_blank");
                                      }}
                                      className="w-16 shrink-0 flex flex-col gap-1 cursor-pointer group"
                                    >
                                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f3ef] border border-[#e5e5e5]">
                                        <img src={res.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={res.name} />
                                      </div>
                                      <span className="text-[9px] font-bold text-[#1a1a1a] truncate w-full">{res.price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="pt-2 animate-in fade-in duration-300">
              {!selectedTrend ? (
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
                    {MOCK_TRENDS.map((trend) => (
                      <div key={trend.id} onClick={() => setSelectedTrend(trend)} className="w-64 shrink-0 relative rounded-3xl overflow-hidden h-48 group cursor-pointer active:scale-[0.98] transition-transform shadow-sm">
                        <img src={trend.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={trend.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                          <div>
                            <h3 className="text-white font-serif text-xl leading-tight">{trend.title}</h3>
                            <p className="text-[#e5e5e5] text-[10px] mt-1 font-bold line-clamp-1">{trend.subtitle}</p>
                          </div>
                          <button className="w-6 h-6 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <ArrowLeft size={12} className="rotate-180" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 mt-4">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-6">
                      {MOCK_SHOP_ALL_ITEMS.map((item) => (
                        <div key={item.id} onClick={() => setSelectedShopItem(item)} className="flex flex-col gap-1.5 cursor-pointer group relative">
                          <div className="relative aspect-[4/5] bg-[#e6e2d6] rounded-3xl border border-[#e5e5e5] overflow-hidden mb-1">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#999999] uppercase tracking-tight font-bold">{item.brand}</p>
                            <p className="text-xs font-bold text-[#1a1a1a] line-clamp-1">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-[#1a1a1a]">{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setSelectedTrend(null)} className="p-2 bg-white border border-[#e5e5e5] rounded-full text-[#1a1a1a] hover:bg-[#f5f3ef] transition">
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-3xl font-serif text-[#1a1a1a] tracking-tight">{selectedTrend.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-6">
                    {(MOCK_SHOP_ITEMS[selectedTrend.id] || []).map((item) => (
                      <div key={item.id} className="flex flex-col gap-1.5 cursor-pointer group relative" onClick={() => setSelectedShopItem(item)}>
                        <div className="relative aspect-[4/5] bg-[#e6e2d6] rounded-3xl border border-[#e5e5e5] overflow-hidden mb-1">
                          <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                        </div>
                        <div>
                          <p className="text-[10px] text-[#999999] uppercase tracking-tight font-bold">{item.brand}</p>
                          <p className="text-xs font-bold text-[#1a1a1a] line-clamp-1">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-bold text-[#1a1a1a]">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {selectedPost && (
        <div className="fixed inset-0 z-[80] bg-[#f5f3ef] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 border-b border-[#e5e5e5] bg-[#f5f3ef] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPostHistory((prev) => prev.slice(0, -1));
                  setIsRemixed(false);
                }}
                className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-[#e8e5df] transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 cursor-pointer group">
                <img src={selectedPost.avatar || "https://i.pravatar.cc/150?u=default"} alt="avatar" className="w-10 h-10 rounded-full border border-[#e5e5e5] object-cover group-hover:opacity-80 transition" />
                <div className="flex flex-col group-hover:opacity-80 transition">
                  <span className="font-bold text-sm text-[#1a1a1a]">{selectedPost.user}</span>
                  <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">10d ago</span>
                </div>
              </div>
            </div>
            <button onClick={() => setPostHistory([])} className="text-[#999999] hover:text-[#1a1a1a] ml-2 transition">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-20" ref={postScrollRef}>
            <div className="w-full relative bg-[#e6e2d6]">
              <img src={selectedPost.image} className="w-full object-cover max-h-[60vh] object-top" alt="post" referrerPolicy="no-referrer" />
            </div>
            <div className="p-6 pb-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[#1a1a1a]">Shop the look</h3>
                <button
                  onClick={() => {
                    const newGarments = MOCK_SHOP_ALL_ITEMS.slice(0, 4).map((item) => ({ id: Date.now() + Math.random(), image: item.image }));
                    setMixItems((prev) => [...newGarments, ...prev].slice(0, 5));
                    setIsRemixed(true);
                    showToast("Items added to Try-On Mix");
                  }}
                  className={isRemixed ? "bg-[#e5e5e5] text-[#1a1a1a] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition" : "bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md hover:bg-gray-800 transition active:scale-95"}
                >
                  {isRemixed ? <Check size={14} /> : <Layers size={14} />} {isRemixed ? "Remixed" : "Remix"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {MOCK_SHOP_ALL_ITEMS.slice(0, 4).map((c) => (
                  <div key={c.id} onClick={() => setSelectedShopItem(c)} className="flex flex-col gap-2 cursor-pointer group relative bg-white p-2 rounded-3xl border border-[#e5e5e5] shadow-sm">
                    <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden relative">
                      <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.name} />
                    </div>
                    <div className="px-1 pb-1 mt-1">
                      <p className="text-[9px] font-bold text-[#999999] uppercase tracking-widest line-clamp-1">{c.brand}</p>
                      <p className="text-[11px] font-bold text-[#1a1a1a] line-clamp-1 leading-tight">{c.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedShopItem && <ShopItemOverlay initialItem={selectedShopItem} onClose={() => setSelectedShopItem(null)} wishlist={wishlist} toggleWishlist={toggleWishlist} showToast={showToast} />}
    </div>
  );
}

function WardrobeTab({ aura }) {
  const [wardrobe, setWardrobe] = useStore(wardrobeStore);
  const [uploadState, setUploadState] = useStore(wardrobeUploadStore);
  const [showFilters, setShowFilters] = useState(true);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const categories = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Bags", "Jewelry"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const viewingItem = viewHistory.length > 0 ? viewHistory[viewHistory.length - 1] : null;
  const viewingItemScrollRef = useRef(null);
  const [viewingOutfit, setViewingOutfit] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const [mixItems, setMixItems] = useGlobalMix();
  const [toastMessage, setToastMessage] = useState(null);
  const [inlineSearch, setInlineSearch] = useState({});
  const [unreadOutfits, clearUnreadOutfits] = useUnreadOutfits();
  const [outfitsState] = useStore(outfitsStore);
  const localOutfits = outfitsState.outfits;
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("Wardrobe");
  const [wishlist, toggleWishlist, setWishlistState] = useWishlist();
  const [activeMenu, setActiveMenu] = useState(null);
  const [wishlistFilter, setWishlistFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (viewingItemScrollRef.current) {
      viewingItemScrollRef.current.scrollTop = 0;
    }
  }, [viewHistory]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleAskStylist = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearchFocused(false);
    aura.setInputText(searchQuery);
    aura.processPrompt(searchQuery);
    if (!API_KEY) {
      aura.setAuraMessage(await callGeminiText(searchQuery));
    }
    setSearchQuery("");
  };

  const filteredWardrobe = activeCategory === "All" ? wardrobe : wardrobe.filter((item) => item.category === activeCategory);
  const filteredWishlist = wishlistFilter === "All" ? wishlist : wishlist.filter((item) => item.category === wishlistFilter);

  const handleDragStart = (e, id) => setDraggedItemId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      return;
    }
    const draggedIdx = wardrobe.findIndex((i) => i.id === draggedItemId);
    const targetIdx = wardrobe.findIndex((i) => i.id === targetId);
    const newWardrobe = [...wardrobe];
    const [draggedItem] = newWardrobe.splice(draggedIdx, 1);
    newWardrobe.splice(targetIdx, 0, draggedItem);
    setWardrobe(newWardrobe);
    setDraggedItemId(null);
  };

  const handlePressStart = (e, itemId) => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }
      setContextMenu(itemId);
    }, 450);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleInlineSearch = (item) => {
    setInlineSearch((prev) => ({ ...prev, [item.id]: { status: "scanning" } }));
    setTimeout(() => {
      const matches = [...MOCK_SHOP_ALL_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 3);
      setInlineSearch((prev) => ({ ...prev, [item.id]: { status: "results", results: matches } }));
    }, 1500);
  };

  const handleMenuAction = (action, item, e) => {
    if (action === "Added to Mix" && item) {
      triggerFlyingAnimation(item.image, e);
      const combined = [{ id: Date.now(), image: item.image }, ...mixItems].slice(0, 5);
      setMixItems(combined);
      showToast("Added to Try-On Mix");
    } else if (action === "Added to Wardrobe" && item) {
      setWardrobe((prev) => [{ id: Date.now(), brand: item.brand || "Saved", name: item.name, category: item.category || "Tops", image: item.image }, ...prev]);
      showToast("Added to Wardrobe");
    } else if (action === "search") {
      handleInlineSearch(item);
    } else {
      showToast(action);
    }
    setContextMenu(null);
  };

  const handleItemClick = (item) => {
    if (!isLongPress.current && !contextMenu) {
      setViewHistory([item]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadState("scanning");
    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result;
      const metadata = await callGeminiVisionJson("Analyze this clothing item. We need to categorize it for a digital wardrobe.", base64String, file.type);
      setUploadState("removing_bg");
      const editedImage = await callGeminiImageEdit("Remove the background completely. Keep only the main clothing item or model. Make the background transparent and remove any remaining text.", base64String, file.type);
      const newItem = {
        id: Date.now(),
        brand: metadata?.brand || "Scanned",
        name: metadata?.name || "Imported Garment",
        category: metadata?.category || "Tops",
        image: editedImage || base64String,
        link: ""
      };
      if (activeMainTab === "Wishlist") {
        setWishlistState((prev) => [newItem, ...prev]);
        setEditingItem(newItem);
      } else {
        setWardrobe((prev) => [newItem, ...prev]);
      }
      setUploadState(null);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#f5f3ef] min-h-full pb-24 relative">
      {toastMessage && <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap flex items-center gap-2">{toastMessage}</div>}
      <div className="sticky top-0 z-30 flex flex-col bg-[#f5f3ef]/90 backdrop-blur-xl">
        <div className="px-4 pt-12 pb-2 sm:pt-14">
          <form onSubmit={handleAskStylist} className={`flex flex-col gap-3 bg-white rounded-full px-5 py-3.5 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border transition-all ${isSearchFocused ? "border-black ring-4 ring-black/5" : "border-[#e5e5e5] focus-within:border-black focus-within:ring-4 focus-within:ring-black/5"}`}>
            <div className="flex items-center gap-3 w-full">
              {isSearchFocused ? (
                <button type="button" onClick={() => setIsSearchFocused(false)} className="text-[#999999] hover:text-[#1a1a1a] shrink-0 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <Sparkles size={18} className="text-[#1a1a1a] shrink-0" />
              )}
              <input
                type="text"
                placeholder="Ask your AI stylist..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1a1a1a] placeholder:text-[#999999] min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              <button type="button" onClick={() => aura.openAura()} className="text-[#999999] hover:text-[#1a1a1a] transition shrink-0">
                <Camera size={18} />
              </button>
              <button type="submit" className="text-[#999999] hover:text-[#1a1a1a] transition shrink-0">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
        {!isSearchFocused && (
          <div className="flex px-4 pt-2 border-b border-[#e5e5e5]">
            <div className="flex gap-6 w-full">
              {[
                { id: "Wardrobe", label: "Wardrobe" },
                { id: "Wishlist", label: "Wishlist" },
                { id: "Outfits", label: "Outfits" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveMainTab(tab.id);
                    if (tab.id === "Outfits") {
                      clearUnreadOutfits();
                    }
                  }}
                  className={`flex-1 relative pb-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeMainTab === tab.id ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-transparent text-[#999999] hover:text-[#1a1a1a]"}`}
                >
                  {tab.label}
                  {tab.id === "Outfits" && unreadOutfits > 0 && <span className="ml-1 text-red-500">({unreadOutfits})</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {aura.auraMessage && !isSearchFocused && (
        <div className="px-4 mb-6 mt-4 flex items-start justify-between gap-3 animate-in fade-in bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#1a1a1a] font-medium leading-relaxed">{aura.auraMessage}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => aura.toggleSpeech(aura.auraMessage)} className={`p-1.5 rounded-full transition ${aura.isSpeaking ? "bg-purple-100 text-purple-600" : "text-[#999999] hover:text-[#1a1a1a] hover:bg-gray-100"}`}>
              {aura.isSpeaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
            </button>
            <button onClick={aura.clearAuraMessage} className="p-1.5 rounded-full text-[#999999] hover:text-[#1a1a1a] hover:bg-gray-100 transition">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {isSearchFocused && (
        <div className="px-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
          <h3 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-4">Try Asking</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {["Style my white skirt", "Outfits for a date", "Workwear looks", "Make an outfit from my wardrobe"].map((trend) => (
              <button
                key={trend}
                onClick={() => {
                  setSearchQuery(trend);
                  setIsSearchFocused(false);
                  aura.setInputText(trend);
                  aura.processPrompt(trend);
                }}
                className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-full text-xs font-bold text-[#1a1a1a] shadow-sm hover:bg-gray-50 flex items-center gap-2 transition active:scale-95"
              >
                <Sparkles size={12} className="text-[#999999]" />
                {trend}
              </button>
            ))}
          </div>
        </div>
      )}
      {!isSearchFocused && (
        <>
          {activeMainTab === "Wardrobe" && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-[#f5f3ef] border-b border-[#e5e5e5] scrollbar-hide animate-in slide-in-from-top-2 items-center">
              <button onClick={() => setShowFilters(!showFilters)} className="w-8 h-8 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#1a1a1a] transition-colors shadow-sm shrink-0">
                {!showFilters ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
              </button>
              {showFilters &&
                categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeCategory === cat ? "bg-black text-white border-black" : "bg-white text-[#1a1a1a] border-[#e5e5e5] hover:bg-gray-50"}`}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          )}
          {activeMainTab === "Wishlist" && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-[#f5f3ef] border-b border-[#e5e5e5] scrollbar-hide animate-in slide-in-from-top-2 items-center">
              <button onClick={() => setShowFilters(!showFilters)} className="w-8 h-8 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-[#1a1a1a] transition-colors shadow-sm shrink-0">
                {!showFilters ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
              </button>
              {showFilters &&
                categories.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setWishlistFilter(filter)}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${wishlistFilter === filter ? "bg-black text-white border-black" : "bg-white text-[#1a1a1a] border-[#e5e5e5] hover:bg-gray-50"}`}
                  >
                    {filter}
                  </button>
                ))}
            </div>
          )}
          {activeMenu && <div className="fixed inset-0 z-[45]" onClick={() => setActiveMenu(null)} />}
          <div className="p-4">
            {activeMainTab === "Wardrobe" && (
              <div className="grid grid-cols-2 gap-4">
                {filteredWardrobe.map((item) => (
                  <div
                    key={item.id}
                    draggable={activeCategory === "All"}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onClick={() => handleItemClick(item)}
                    className={`flex flex-col cursor-pointer active:scale-[0.98] transition-all relative ${draggedItemId === item.id ? "opacity-50" : ""}`}
                  >
                    <div
                      className="aspect-[4/5] bg-[#e6e2d6] rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow relative mb-3 overflow-hidden select-none"
                      onTouchStart={(e) => handlePressStart(e, item.id)}
                      onTouchEnd={cancelPress}
                      onTouchMove={cancelPress}
                      onMouseDown={(e) => handlePressStart(e, item.id)}
                      onMouseUp={cancelPress}
                      onMouseMove={cancelPress}
                      onMouseLeave={cancelPress}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                      {contextMenu === item.id && (
                        <div className="absolute inset-0 bg-black/20 z-50 animate-in fade-in duration-200 rounded-md" onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}>
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white/95 backdrop-blur-md rounded-xl px-2 py-1.5 shadow-xl animate-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("search", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                              <Search size={12} />
                              <span className="text-[7px] font-bold uppercase tracking-wide">Similar</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Mix", item, e); }} className="flex flex-col items-center gap-0.5 bg-black text-white rounded-full p-2 -mt-6 shadow-md hover:scale-105 transition-transform border-4 border-[#e6e2d6]">
                              <Layers size={12} />
                              <span className="text-[7px] font-bold mt-0.5">Mix</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); setContextMenu(null); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                              <Edit2 size={12} />
                              <span className="text-[7px] font-bold uppercase tracking-wide">Edit</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {inlineSearch[item.id] && (
                      <div className="mb-3 bg-white rounded-2xl border border-[#e5e5e5] p-3 shadow-sm animate-in slide-in-from-top-2 z-10 relative cursor-default" onClick={(e) => e.stopPropagation()}>
                        {inlineSearch[item.id].status === "scanning" ? (
                          <div className="flex flex-col items-center justify-center py-2">
                            <Loader2 size={16} className="animate-spin text-[#999999] mb-1.5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#999999]">Searching Google...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Search size={10} className="text-blue-500" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#1a1a1a]">Google Matches</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInlineSearch((prev) => {
                                    const next = { ...prev };
                                    delete next[item.id];
                                    return next;
                                  });
                                }}
                                className="text-[#999999] hover:text-[#1a1a1a] p-1 -mr-1 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                              {inlineSearch[item.id].results.map((res) => (
                                <div
                                  key={res.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${res.brand} ${res.name}`)}`, "_blank");
                                  }}
                                  className="w-[52px] shrink-0 flex flex-col gap-1 cursor-pointer group"
                                >
                                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#f5f3ef] border border-[#e5e5e5]">
                                    <img src={res.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={res.name} />
                                  </div>
                                  <span className="text-[8px] font-bold text-[#1a1a1a] truncate w-full">{res.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col pointer-events-none px-1">
                      <p className="text-[11px] font-bold text-[#1a1a1a] uppercase tracking-widest font-serif">{item.brand}</p>
                      <p className="text-sm text-[#6B655F] mt-1">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeMainTab === "Wishlist" && (
              <div className="grid grid-cols-2 gap-4 relative">
                {filteredWishlist.map((item) => (
                  <div key={item.id} className={`flex flex-col relative transition-all ${activeMenu === item.id ? "z-[50]" : "z-0"}`}>
                    <div
                      className="aspect-[4/5] bg-[#e6e2d6] rounded-md relative mb-3 overflow-hidden active:scale-[0.98] transition-transform duration-200 select-none cursor-pointer"
                      onClick={() => handleItemClick(item)}
                      onTouchStart={(e) => handlePressStart(e, item.id)}
                      onTouchEnd={cancelPress}
                      onTouchMove={cancelPress}
                      onMouseDown={(e) => handlePressStart(e, item.id)}
                      onMouseUp={cancelPress}
                      onMouseMove={cancelPress}
                      onMouseLeave={cancelPress}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                      {contextMenu === item.id && (
                        <div className="absolute inset-0 bg-black/20 z-50 animate-in fade-in duration-200 rounded-md" onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}>
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white/95 backdrop-blur-md rounded-xl px-2 py-1.5 shadow-xl animate-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Wardrobe", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                              <Shirt size={12} />
                              <span className="text-[7px] font-bold uppercase tracking-wide">Wardrobe</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Mix", item, e); }} className="flex flex-col items-center gap-0.5 bg-black text-white rounded-full p-2 -mt-6 shadow-md hover:scale-105 transition-transform border-4 border-[#e6e2d6]">
                              <Layers size={12} />
                              <span className="text-[7px] font-bold mt-0.5">Mix</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("search", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] hover:text-black transition-colors">
                              <Search size={12} />
                              <span className="text-[7px] font-bold uppercase tracking-wide">Similar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-1 flex flex-col relative">
                      <div className="flex justify-between items-start">
                        <div className="pr-1 flex-1">
                          <p className="text-[11px] font-bold text-[#1a1a1a] uppercase tracking-widest font-serif">{item.brand}</p>
                          <p className="text-sm text-[#4a4a4a] mt-1 line-clamp-1">{item.name}</p>
                        </div>
                        <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} className="text-[#999999] hover:text-[#1a1a1a] p-1 -mt-1 -mr-1 rounded-full transition-colors shrink-0">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <p className="text-[#1a1a1a] text-sm mt-1">{item.price}</p>
                      {activeMenu === item.id && (
                        <div className="absolute bottom-8 right-0 w-44 bg-white rounded-2xl shadow-xl border border-[#e5e5e5] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast("Opening Shop...");
                              if (item.link) {
                                setTimeout(() => window.open(item.link, "_blank"), 1000);
                              }
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <ShoppingCart size={16} /> Shop Item
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction("Added to Mix", item, e);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <Layers size={16} /> Add to Mix
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <Edit2 size={16} /> Edit Item
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(item);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <Trash2 size={16} className="text-red-500" /> Remove Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeMainTab === "Outfits" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {localOutfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col overflow-hidden">
                    <div onClick={() => setViewingOutfit(outfit)} className="relative w-full aspect-[2/3] bg-[#f5f3ef] cursor-pointer group overflow-hidden isolate">
                      <button onClick={(e) => { e.stopPropagation(); setEditingOutfit({ ...outfit, _wardrobeSearch: "" }); }} className="absolute top-2 right-2 p-2 text-[#1a1a1a] hover:bg-white transition bg-white/80 backdrop-blur rounded-full z-20 shadow-sm">
                        <Edit2 size={12} />
                      </button>
                      {outfit.coverImage ? <img src={outfit.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Outfit cover" /> : <OutfitCollage items={outfit.items} />}
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 bg-white relative z-20 border-t border-[#e5e5e5]">
                      <h3 className="font-bold text-[#1a1a1a] text-[13px] leading-tight line-clamp-1">{outfit.title}</h3>
                      {outfit.tags && outfit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {outfit.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="inline-block px-2.5 py-0.5 bg-[#f5f3ef] text-[#6B655F] text-[9px] font-bold uppercase tracking-widest rounded-full border border-[#e5e5e5]">
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {uploadState === "selecting" && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in" onClick={() => setUploadState(null)} />
          <div className="bg-[#f5f3ef] rounded-t-[3rem] p-6 relative z-10 animate-in slide-in-from-bottom-full duration-300 pb-safe">
            <div className="w-12 h-1.5 bg-[#d1d1d1] rounded-full mx-auto mb-6" />
            <h3 className="font-serif text-[#1a1a1a] text-xl mb-4 text-center">{activeMainTab === "Wishlist" ? "Save an Item" : "Add to Wardrobe"}</h3>
            <div className="space-y-3">
              <button onClick={() => cameraInputRef.current?.click()} className="w-full py-4 bg-white text-[#1a1a1a] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#e8e5df] transition border border-[#e5e5e5]">
                <Camera size={20} className="text-black" /> Take Photo
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-white text-[#1a1a1a] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#e8e5df] transition border border-[#e5e5e5]">
                <ImageIcon size={20} className="text-black" /> Upload from Library
              </button>
            </div>
            <button onClick={() => setUploadState(null)} className="w-full py-4 mt-2 text-[#999999] font-bold uppercase tracking-widest text-xs hover:text-[#1a1a1a] transition">
              Cancel
            </button>
          </div>
        </div>
      )}
      {(uploadState === "scanning" || uploadState === "removing_bg") && (
        <div className="fixed inset-0 z-[80] bg-[#f5f3ef]/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-[#e5e5e5]">
            <Loader2 size={32} className="animate-spin text-black" />
          </div>
          <h3 className="font-serif text-[#1a1a1a] text-xl mb-2 text-center">{uploadState === "scanning" ? "Scanning item..." : "Automatic background removal..."}</h3>
          <p className="text-sm font-bold text-[#999999] uppercase tracking-widest text-center px-6 leading-relaxed">
            {uploadState === "scanning" ? "AI Stylist is processing" : "Applying AI image enhancement for clean, Pinterest-style outfit collages"}
          </p>
        </div>
      )}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleFileUpload} />
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      {viewingItem && !editingItem && (
        <div className="fixed inset-0 z-[60] bg-[#f5f3ef] flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 sticky top-0 z-10 bg-white border-b border-[#e5e5e5]">
            <button onClick={() => { if (viewHistory.length > 1) setViewHistory(viewHistory.slice(0, -1)); else setViewHistory([]); }} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-serif text-[#1a1a1a] text-lg">Item Details</span>
            <div className="flex items-center gap-2 w-10 justify-end">
              {viewHistory.length === 1 && (
                <button onClick={() => { setEditingItem(viewingItem); setViewHistory([]); }} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-gray-50 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              )}
            </div>
          </div>
          <div ref={viewingItemScrollRef} className="flex-1 overflow-y-auto pb-safe flex flex-col">
            <div className="w-full relative bg-[#e6e2d6] h-[55vh] shrink-0 border-b border-[#e5e5e5]">
              <img src={viewingItem.image} className="w-full h-full object-cover" alt={viewingItem.name} />
            </div>
            <div className="p-6 bg-[#f5f3ef] flex-1 flex flex-col">
              <p className="text-[11px] font-bold text-[#999999] uppercase tracking-widest font-serif mb-1">{viewingItem.brand}</p>
              <h2 className="text-2xl font-serif text-[#1a1a1a] leading-tight">{viewingItem.name}</h2>
              {viewingItem.price ? <p className="text-xl font-bold text-[#1a1a1a] mt-2">{viewingItem.price}</p> : <p className="text-sm font-bold text-[#6B655F] mt-2 capitalize">{viewingItem.category}</p>}
              <button
                onClick={() => {
                  showToast("Opening Shop...");
                  setTimeout(() => {
                    window.open(viewingItem.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${viewingItem.brand || ""} ${viewingItem.name || ""}`)}`, "_blank");
                  }, 1000);
                }}
                className="w-full py-4 mt-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-[0.98] shadow-md"
              >
                <ShoppingCart size={16} /> SHOP ITEM
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingOutfit && !editingOutfit && (
        <div className="fixed inset-0 z-[55] bg-[#f5f3ef] flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 sticky top-0 z-10 bg-[#f5f3ef] border-b border-[#e5e5e5]">
            <button onClick={() => setViewingOutfit(null)} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-serif text-[#1a1a1a] truncate px-4">Outfit Details</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingOutfit(viewingOutfit); setViewingOutfit(null); }} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-gray-50 transition-colors">
                <Edit2 size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-safe flex flex-col">
            <div className="w-full relative bg-[#e6e2d6] h-[55vh] shrink-0 isolate overflow-hidden">
              {viewingOutfit.coverImage ? <img src={viewingOutfit.coverImage} className="w-full h-full object-cover" alt={viewingOutfit.title} /> : <OutfitCollage items={viewingOutfit.items} interactive />}
              {!viewingOutfit.coverImage && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a] pointer-events-none z-[100] flex items-center gap-1.5">
                  <LayoutGrid size={12} /> Tap & drag to rearrange
                </div>
              )}
            </div>
            <div className="p-6 bg-[#f5f3ef] border-t border-[#e5e5e5] flex-1">
              <h2 className="text-2xl font-serif text-[#1a1a1a] leading-tight mb-6">{viewingOutfit.title}</h2>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[#1a1a1a]">Items in this look</h3>
                <button
                  onClick={() => {
                    const newItems = viewingOutfit.items.filter((i) => i.type === "image").map((item) => ({ id: Date.now() + Math.random(), image: item.content }));
                    setMixItems((prev) => [...newItems, ...prev].slice(0, 5));
                    showToast("Items added to Try-On Mix");
                  }}
                  className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md hover:bg-gray-800 transition active:scale-95"
                >
                  <Layers size={14} /> Remix
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {viewingOutfit.items.filter((i) => i.type === "image").map((item, idx) => {
                  const matchedItem = [...wardrobe, ...wishlist].find((w) => w.image === item.content) || {
                    id: idx,
                    brand: "Saved Item",
                    name: "Garment",
                    image: item.content,
                    category: "Apparel"
                  };
                  return (
                    <div key={idx} onClick={() => setViewHistory([matchedItem])} className="flex flex-col gap-2 cursor-pointer group relative bg-white p-2 rounded-3xl border border-[#e5e5e5] shadow-sm">
                      <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden relative">
                        <img src={matchedItem.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={matchedItem.name} />
                      </div>
                      <div className="px-1 pb-1 mt-1">
                        <p className="text-[9px] font-bold text-[#999999] uppercase tracking-widest line-clamp-1">{matchedItem.brand}</p>
                        <p className="text-[11px] font-bold text-[#1a1a1a] line-clamp-1 leading-tight">{matchedItem.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in" onClick={() => setEditingItem(null)} />
          <div className="bg-[#f5f3ef] rounded-t-[3rem] p-6 relative z-10 animate-in slide-in-from-bottom-full duration-300 pb-safe max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-[#1a1a1a] text-xl">Edit Item details</h3>
              <button onClick={() => setEditingItem(null)} className="text-[#999999] hover:text-[#1a1a1a] bg-white border border-[#e5e5e5] p-2 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 rounded-3xl bg-white p-2 shrink-0 border border-[#e5e5e5] shadow-sm">
                <img src={editingItem.image} className="w-full h-full object-contain mix-blend-multiply" alt="editing" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-1.5 block">Brand</label>
                  <input type="text" value={editingItem.brand} onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })} className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all" />
                </div>
              </div>
            </div>
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-1.5 block">Description</label>
                <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-1.5 block">Shop Link (Optional)</label>
                <input type="url" value={editingItem.link || ""} onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })} placeholder="https://..." className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3 block">Tag Category</label>
                <div className="flex flex-wrap gap-2">
                  {["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Jewelry"].map((cat) => (
                    <button key={cat} onClick={() => setEditingItem({ ...editingItem, category: cat })} className={`px-4 py-2 rounded-full text-xs font-bold transition border ${editingItem.category === cat ? "bg-black text-white border-black" : "bg-white text-[#1a1a1a] border-[#e5e5e5] hover:bg-[#e8e5df]"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (wishlist.some((i) => i.id === editingItem.id) || activeMainTab === "Wishlist") {
                    setWishlistState(wishlist.filter((i) => i.id !== editingItem.id));
                  } else {
                    setWardrobe(wardrobe.filter((i) => i.id !== editingItem.id));
                  }
                  setEditingItem(null);
                }}
                className="w-14 shrink-0 py-4 bg-white border border-[#e5e5e5] text-red-500 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => {
                  if (wishlist.some((i) => i.id === editingItem.id) || activeMainTab === "Wishlist") {
                    setWishlistState(wishlist.map((i) => (i.id === editingItem.id ? editingItem : i)));
                  } else {
                    setWardrobe(wardrobe.map((i) => (i.id === editingItem.id ? editingItem : i)));
                  }
                  setEditingItem(null);
                }}
                className="flex-1 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-[0.98]"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
      {editingOutfit && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in" onClick={() => setEditingOutfit(null)} />
          <div className="bg-[#f5f3ef] rounded-t-[3rem] p-6 relative z-10 animate-in slide-in-from-bottom-full duration-300 pb-safe max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-[#1a1a1a] text-xl">Edit Outfit</h3>
              <button onClick={() => setEditingOutfit(null)} className="text-[#999999] hover:text-[#1a1a1a] bg-white border border-[#e5e5e5] p-2 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 mb-6">
              <div>
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-1.5 block">Title</label>
                <input type="text" value={editingOutfit.title} onChange={(e) => setEditingOutfit({ ...editingOutfit, title: e.target.value })} className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-1.5 block">Labels (comma separated)</label>
                <input
                  type="text"
                  value={editingOutfit.tags ? editingOutfit.tags.map((t) => t.label).join(", ") : ""}
                  onChange={(e) => {
                    const newTags = e.target.value
                      .split(",")
                      .map((t) => ({ label: t.trim(), classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }))
                      .filter((t) => t.label);
                    setEditingOutfit({ ...editingOutfit, tags: newTags });
                  }}
                  className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { outfitsStore.setState((s) => ({ ...s, outfits: s.outfits.filter((o) => o.id !== editingOutfit.id) })); setEditingOutfit(null); }} className="w-14 shrink-0 py-4 bg-white border border-[#e5e5e5] text-red-500 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center">
                <Trash2 size={20} />
              </button>
              <button onClick={() => { const { _wardrobeSearch, ...cleanOutfit } = editingOutfit; outfitsStore.setState((s) => ({ ...s, outfits: s.outfits.map((o) => (o.id === cleanOutfit.id ? cleanOutfit : o)) })); setEditingOutfit(null); }} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-[0.98]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TryOnTab() {
  const [step, setStep] = useState("setup");
  const [loadingText, setLoadingText] = useState("Analyzing fabric logic...");
  const [modelImg, setModelImg] = useState("https://cizaro.net/cdn/shop/files/CZ-MF-10369-_7.jpg?v=1769085672&width=1000");
  const fileInputRef = useRef(null);
  const [garments, setGarments] = useGlobalMix();
  const [scenario, setScenario] = useState("");
  const resultImg = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80";
  const [toastMessage, setToastMessage] = useState(null);
  const [isSavedMix, setIsSavedMix] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const [, setFeedData] = useStore(feedStore);
  const [myPosts, setMyPosts] = useStore(myPostsStore);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    setIsSavedMix(false);
  }, [garments]);

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => setLoadingText("Mapping garment to body shape..."), 1200);
    setTimeout(() => setLoadingText("Adjusting lighting and shadows..."), 2400);
    setTimeout(() => setLoadingText("Finalizing photorealistic render..."), 3600);
    setTimeout(() => setStep("result"), 4500);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setModelImg(reader.result);
      setIsViewingPhoto(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8 pb-20 bg-[#f5f3ef]">
        <div className="relative w-56 h-72 rounded-[3rem] overflow-hidden shadow-2xl border border-white/50">
          <img src={modelImg} alt="Model" className="w-full h-full object-cover opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          <div className="absolute left-0 w-full h-[2px] bg-black animate-[scanline_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine size={48} className="text-[#1a1a1a] animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-serif text-[#1a1a1a] flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-black animate-pulse" /> AI is generating mix...
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-[#999999] h-6 transition-all duration-300">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="p-4 h-full flex flex-col pb-24 bg-[#f5f3ef] animate-in fade-in relative">
        {toastMessage && <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap">{toastMessage}</div>}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 sm:pt-14 bg-[#f5f3ef] sticky top-0 z-20">
          <button onClick={() => setStep("setup")} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-[#e8e5df] transition">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-3xl font-serif text-[#1a1a1a] italic">Your Virtual Fit</h2>
        </div>
        <div className="flex-1 relative rounded-[3rem] overflow-hidden mb-6 shadow-xl border border-[#e5e5e5]">
          <img src={resultImg} alt="Try-on Result" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#1a1a1a] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-1.5 border border-[#e5e5e5] shadow-sm">
            <Sparkles size={14} /> Render
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setMyPosts((prev) => [
                {
                  id: Date.now(),
                  image: resultImg,
                  title: "My Try-On Mix",
                  date: "Just now",
                  published: false,
                  user: { name: "Alex Schwan", avatar: "A" },
                  components: garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }))
                },
                ...prev
              ]);
              showToast("Saved to My Mixes");
            }}
            className="flex-1 py-4 bg-white text-[#1a1a1a] rounded-full font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-[#e8e5df] transition border border-[#e5e5e5] shadow-sm"
          >
            <Bookmark size={18} /> Save
          </button>
          <button
            onClick={() => {
              const newPostId = Date.now();
              setMyPosts((prev) => [
                {
                  id: newPostId,
                  image: resultImg,
                  title: "My Try-On Mix",
                  date: "Just now",
                  published: true,
                  user: { name: "Alex Schwan", avatar: "A" },
                  components: garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }))
                },
                ...prev
              ]);
              setFeedData((prev) => [
                {
                  id: newPostId,
                  image: resultImg,
                  user: "Alex Schwan",
                  avatar: "https://i.pravatar.cc/150?u=alex",
                  likes: 0,
                  desc: scenario || "My latest virtual try-on mix! ✨",
                  tags: ["ai", "tryon"]
                },
                ...prev
              ]);
              showToast("Posted to Community!");
            }}
            className="flex-1 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg hover:bg-gray-800 transition"
          >
            <Send size={18} /> Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f3ef] min-h-full pb-24 relative">
      {toastMessage && <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap">{toastMessage}</div>}
      <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 bg-[#f5f3ef] sticky top-0 z-20 border-b border-[#e5e5e5]">
        <h2 className="text-3xl font-serif italic text-[#1a1a1a]">Mix</h2>
        <div className="relative">
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
          <button onClick={() => setIsViewingPhoto(true)} className="w-10 h-10 rounded-full overflow-hidden border border-[#e5e5e5] shadow-sm hover:opacity-80 transition active:scale-95">
            <img src={modelImg} className="w-full h-full object-cover" alt="Try-on" />
          </button>
        </div>
      </div>
      <div className="p-4 animate-in fade-in duration-300 mt-2">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Outfit Pieces · {garments.length} OF 5</p>
          {garments.length > 0 && (
            <button onClick={() => setGarments([])} className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest hover:text-red-500 transition">
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {garments.map((g) => (
            <div key={g.id} className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-sm group">
              <img src={g.image} className="w-full h-full object-cover" alt="Garment" />
              <button onClick={() => setGarments(garments.filter((item) => item.id !== g.id))} className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#1a1a1a] shadow-sm hover:bg-gray-100 transition">
                <X size={14} />
              </button>
            </div>
          ))}
          {garments.length < 5 && (
            <button className="aspect-[3/4] bg-transparent border border-dashed border-[#d1d1d1] rounded-3xl flex flex-col items-center justify-center text-[#999999] hover:border-black hover:text-black transition gap-2 active:scale-[0.98]">
              <Plus size={28} />
            </button>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#999999]" />
            <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Try-on Scene Prompt</label>
          </div>
          <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="Describe the vibe... (e.g. 'Parisian Cafe, sunny morning, 90s minimalistic')" className="w-full bg-transparent border border-[#e5e5e5] rounded-2xl p-5 text-sm font-medium text-[#1a1a1a] outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none h-24 placeholder:text-[#999999]" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (garments.length === 0) {
                showToast("Add items to save outfit");
                return;
              }
              addGlobalOutfit({
                id: Date.now(),
                title: "Custom Mix",
                source: "Saved from Try-On Editor",
                items: garments.map((g) => ({ type: "image", content: g.image })),
                tags: [{ label: "Owned Outfits", classes: "bg-[#e6e2d6] text-[#1a1a1a]" }]
              });
              setIsSavedMix(true);
              showToast("Saved to Outfits");
            }}
            className={`w-14 shrink-0 flex items-center justify-center border rounded-2xl transition active:scale-[0.98] ${isSavedMix ? "bg-black border-black text-white" : "bg-white border-[#e5e5e5] text-[#1a1a1a] hover:bg-gray-50"}`}
          >
            {isSavedMix ? <Check size={22} /> : <Bookmark size={22} />}
          </button>
          <button onClick={handleGenerate} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-[0.98] uppercase tracking-widest text-xs">
            <Sparkles size={16} /> TRY ON
          </button>
        </div>
      </div>
      {isViewingPhoto && (
        <div className="fixed inset-0 z-[100] bg-[#f5f3ef] flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 sticky top-0 z-10 border-b border-[#e5e5e5]">
            <button onClick={() => setIsViewingPhoto(false)} className="p-2 bg-white rounded-full text-[#1a1a1a] shadow-sm border border-[#e5e5e5] hover:bg-[#e8e5df] transition">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-serif text-[#1a1a1a]">Try-On Photo</h2>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto pb-24">
            <div className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-[#e5e5e5] mb-8 bg-[#e6e2d6]">
              <img src={modelImg} className="w-full h-full object-cover" alt="Try-on Full" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="w-full max-w-sm py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg">
              <Camera size={18} /> Change Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListItem({ icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#f5f3ef] transition">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#f5f3ef] border border-[#e5e5e5]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1a1a1a]">{title}</p>
        <p className="text-[11px] font-medium text-[#999999] mt-0.5 truncate">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-[#999999]" />
    </div>
  );
}

function ProfileTab() {
  const [view, setView] = useState("main");
  const [profileTab, setProfileTab] = useState("mixes");
  const [preferences, setPreferences] = useState(["Minimal", "Feminine", "Street"]);
  const [newStyle, setNewStyle] = useState("");
  const [userProfile, setUserProfile] = useState({
    name: "Alex Schwan",
    handle: "alex",
    email: "alexandria.schwan@gmail.com",
    avatar: null
  });
  const avatarInputRef = useRef(null);
  const [, setFeedData] = useStore(feedStore);
  const [myPosts, setMyPosts] = useStore(myPostsStore);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [wishlist, toggleWishlist] = useWishlist();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserProfile({ ...userProfile, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddStyle = (e) => {
    e.preventDefault();
    if (newStyle.trim() && !preferences.map((p) => p.toLowerCase()).includes(newStyle.trim().toLowerCase())) {
      setPreferences([...preferences, newStyle.trim()]);
      setNewStyle("");
    }
  };

  if (view === "support") {
    return (
      <SubView title="Support" onBack={() => setView("settings")}>
        <div className="bg-white border border-[#e5e5e5] rounded-3xl p-5 shadow-sm mb-6">
          <h2 className="text-xl font-serif text-[#1a1a1a] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-bold text-sm text-[#1a1a1a] cursor-pointer list-none flex justify-between items-center">
                What can fAIshion do? <ChevronDown size={16} className="text-[#999999] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-[#6B655F] mt-2 leading-relaxed">
                Users can create AI-generated outfits from their owned wardrobe, wishlist, or a mix of both. They can prompt the AI for specific needs like work outfits, trip packing, or styling one item they are considering buying. Saved outfits can be organized with tags such as Work, Owned Outfits, Wishlist Looks, or Paris Trip.
              </p>
            </details>
          </div>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded-3xl p-5 shadow-sm">
          <h2 className="text-xl font-serif text-[#1a1a1a] mb-2">Get in Touch</h2>
          <p className="text-xs text-[#6B655F] mb-4">Have concerns, questions, or suggestions? We'd love to hear from you!</p>
          <form onSubmit={(e) => { e.preventDefault(); showToast("Feedback submitted! Thank you."); e.target.reset(); }} className="flex flex-col gap-3">
            <div className="relative">
              <select required defaultValue="" className="w-full bg-[#f5f3ef] border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none appearance-none pr-10">
                <option value="" disabled>
                  Select a topic...
                </option>
                <option value="suggestion">Suggestion</option>
                <option value="question">Question</option>
                <option value="concern">Concern / Issue</option>
              </select>
              <ChevronDown size={16} className="text-[#999999] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <textarea placeholder="Tell us more..." required className="w-full bg-[#f5f3ef] border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-medium text-[#1a1a1a] outline-none focus:border-black transition-all resize-none h-32" />
            <button type="submit" className="w-full py-4 mt-2 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-[0.98]">
              Submit Message
            </button>
          </form>
        </div>
      </SubView>
    );
  }

  if (view === "referrals") {
    return (
      <SubView title="Referrals" onBack={() => setView("main")}>
        <div className="bg-white rounded-3xl p-6 border border-[#e5e5e5] shadow-sm">
          <h3 className="text-xl font-serif text-[#1a1a1a] text-center mb-2">Invite Friends & Earn Bonus Credits</h3>
        </div>
      </SubView>
    );
  }

  if (view === "accountInfo") {
    return (
      <SubView title="Account Info" onBack={() => setView("main")}>
        <div className="bg-white border border-[#e5e5e5] rounded-3xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-[10px] font-bold text-[#999999] uppercase tracking-wider mb-1.5 block">Display Name</label>
            <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} className="w-full bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none" />
          </div>
        </div>
      </SubView>
    );
  }

  if (view === "billing") {
    return (
      <SubView title="Billing" onBack={() => setView("main")}>
        <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-serif text-[#1a1a1a] mb-3">Free Tier</h2>
          <p className="text-sm text-[#999999] mb-6 font-medium">No active paid subscription.</p>
        </div>
      </SubView>
    );
  }

  if (view === "preferences") {
    return (
      <SubView title="Aesthetics" onBack={() => setView("main")}>
        <div className="bg-white rounded-3xl p-5 border border-[#e5e5e5] shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">Your Styles</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {preferences.map((pref) => (
              <span key={pref} className="px-4 py-2 bg-black text-white border border-black rounded-full text-xs font-bold flex items-center gap-2">
                <button onClick={() => setPreferences(preferences.filter((s) => s !== pref))}>
                  <X size={12} />
                </button>
                {pref}
              </span>
            ))}
          </div>
          <form onSubmit={handleAddStyle} className="flex gap-2">
            <input type="text" value={newStyle} onChange={(e) => setNewStyle(e.target.value)} placeholder="Add style..." className="flex-1 bg-[#f5f3ef] border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none" />
            <button type="submit" disabled={!newStyle.trim()} className="bg-black text-white px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold">
              Add
            </button>
          </form>
        </div>
      </SubView>
    );
  }

  if (view === "settings") {
    return (
      <SubView title="Settings" onBack={() => setView("main")}>
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3 px-2">Account</p>
            <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden divide-y divide-[#e5e5e5]">
              <ListItem icon={<User size={18} className="text-[#1a1a1a]" />} title="Account Info" subtitle="Update your details" onClick={() => setView("accountInfo")} />
              <ListItem icon={<CreditCard size={18} className="text-[#1a1a1a]" />} title="Billing" subtitle="Manage subscription" onClick={() => setView("billing")} />
              <ListItem icon={<Gift size={18} className="text-[#1a1a1a]" />} title="Referrals" subtitle="Invite friends, earn credits" onClick={() => setView("referrals")} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3 px-2">Style Profile</p>
            <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden divide-y divide-[#e5e5e5]">
              <ListItem icon={<Sparkles size={18} className="text-[#1a1a1a]" />} title="Aesthetics" subtitle="Manage your style tags" onClick={() => setView("preferences")} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3 px-2">Support & About</p>
            <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden divide-y divide-[#e5e5e5]">
              <ListItem icon={<HelpCircle size={18} className="text-[#1a1a1a]" />} title="Help / Support" subtitle="FAQs and contact us" onClick={() => setView("support")} />
              <ListItem icon={<PlayCircle size={18} className="text-[#1a1a1a]" />} title="Tutorials" subtitle="Learn how to use fAIshion" />
            </div>
          </div>
          <button onClick={() => showToast("Logged out successfully")} className="w-full py-4 text-red-500 font-bold text-sm bg-white rounded-3xl border border-[#e5e5e5] shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 transition active:scale-[0.98]">
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </SubView>
    );
  }

  return (
    <div className="bg-[#f5f3ef] min-h-full pb-24 relative">
      {toastMessage && <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap flex items-center gap-2">{toastMessage}</div>}
      <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14">
        <h2 className="text-3xl font-serif italic text-[#1a1a1a]">Profile</h2>
        <div className="flex items-center gap-4 text-[#1a1a1a]">
          <button onClick={() => showToast("No new notifications")} className="text-[#1a1a1a] hover:text-black transition">
            <Bell size={22} />
          </button>
          <button onClick={() => setView("settings")} className="text-[#1a1a1a] hover:text-black transition">
            <Settings size={22} />
          </button>
        </div>
      </div>
      <div className="px-4 flex items-center gap-5 pb-4">
        <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={handleAvatarUpload} />
        <div onClick={() => avatarInputRef.current?.click()} className="relative w-[72px] h-[72px] rounded-full bg-[#e6e2d6] flex items-center justify-center text-[#1a1a1a] text-3xl font-serif shrink-0 cursor-pointer overflow-hidden border border-[#e5e5e5]">
          {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Avatar" /> : userProfile.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-serif text-[#1a1a1a] leading-tight mb-1">{userProfile.name}</h2>
          <p className="text-xs font-bold text-[#999999]">@{userProfile.handle}</p>
          <div className="flex gap-3 mt-2 text-[9px] font-bold text-[#1a1a1a] uppercase tracking-widest">
            <span>{myPosts.length} posts</span>
            <span>1.2k followers</span>
            <span>342 following</span>
          </div>
        </div>
      </div>
      <div className="flex w-full border-b border-[#e5e5e5] mb-4">
        <button onClick={() => setProfileTab("mixes")} className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${profileTab === "mixes" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#999999] border-b-2 border-transparent hover:text-[#1a1a1a]"}`}>
          My Mixes
        </button>
        <button onClick={() => setProfileTab("published")} className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${profileTab === "published" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#999999] border-b-2 border-transparent hover:text-[#1a1a1a]"}`}>
          Published
        </button>
      </div>
      <div className="px-2">
        {profileTab === "mixes" && (
          <div className="grid grid-cols-2 gap-3 px-2">
            {myPosts.filter((p) => !p.published).map((post) => (
              <div key={post.id} className="relative aspect-[3/4] bg-[#e6e2d6] rounded-3xl overflow-hidden shadow-sm border border-[#e5e5e5] group cursor-pointer active:scale-[0.98] transition-transform" onClick={() => { setEditingPost(post); setIsEditMode(false); }}>
                <img src={post.image} className="w-full h-full object-cover" alt={post.title} referrerPolicy="no-referrer" />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest mb-1">AI Render</p>
                  <p className="text-sm font-bold text-white line-clamp-1">{post.title}</p>
                </div>
              </div>
            ))}
            {myPosts.filter((p) => !p.published).length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-[#999999]">
                <Layers size={32} className="mb-4 opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No unpublished mixes</p>
              </div>
            )}
          </div>
        )}
        {profileTab === "published" && (
          <div className="columns-2 gap-3 px-2">
            {myPosts.filter((p) => p.published).map((post) => (
              <div key={post.id} className="mb-3 break-inside-avoid relative rounded-3xl overflow-hidden bg-[#e6e2d6] border border-[#e5e5e5] cursor-pointer group active:scale-[0.98] transition-transform" onClick={() => { setEditingPost(post); setIsEditMode(false); }}>
                <img src={post.image} className="w-full object-cover" alt="post" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#1a1a1a] shadow-sm">
                  <MoreHorizontal size={14} />
                </div>
              </div>
            ))}
            {myPosts.filter((p) => p.published).length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-[#999999]">
                <Send size={32} className="mb-4 opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No published posts yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-[#f5f3ef] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 border-b border-[#e5e5e5] bg-[#f5f3ef] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#e5e5e5] text-[#1a1a1a] flex items-center justify-center font-serif text-lg shadow-sm overflow-hidden">
                {userProfile.avatar ? <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" /> : userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#1a1a1a]">{userProfile.name}</span>
                <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">{editingPost.date || "Just now"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditMode(!isEditMode)} className={`p-2 rounded-full transition ${isEditMode ? "bg-black text-white" : "bg-white text-[#1a1a1a] hover:bg-[#e8e5df] border border-[#e5e5e5]"}`}>
                <Edit2 size={18} />
              </button>
              <button onClick={() => { setMyPosts(myPosts.filter((p) => p.id !== editingPost.id)); setEditingPost(null); setIsEditMode(false); }} className="p-2 bg-white text-red-500 rounded-full border border-[#e5e5e5] hover:bg-red-50 transition shadow-sm">
                <Trash2 size={18} />
              </button>
              <button onClick={() => { setEditingPost(null); setIsEditMode(false); }} className="text-[#999999] hover:text-[#1a1a1a] ml-1 transition">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="w-full relative bg-[#e6e2d6]">
              <img src={editingPost.image} className="w-full object-cover max-h-[60vh] object-top" alt="post" referrerPolicy="no-referrer" />
            </div>
            <div className="p-6">
              {isEditMode ? (
                <div className="mb-6 bg-white p-5 rounded-3xl border border-[#e5e5e5] shadow-sm animate-in fade-in">
                  <h3 className="font-serif text-[#1a1a1a] text-lg mb-4">Edit Post</h3>
                  <label className="text-[10px] font-bold text-[#999999] uppercase tracking-wider mb-1.5 block">Post Title / Caption</label>
                  <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full bg-[#f5f3ef] border border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-black transition-all mb-4" />
                  <button onClick={() => { setMyPosts(myPosts.map((p) => (p.id === editingPost.id ? editingPost : p))); setIsEditMode(false); }} className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-[0.98]">
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  {!editingPost.published ? (
                    <div className="mb-6 animate-in fade-in">
                      <h2 className="text-2xl font-serif text-[#1a1a1a] mb-6 border-b border-[#e5e5e5] pb-5">
                        <span className="text-[10px] uppercase font-sans font-bold text-[#999999] tracking-widest block mb-1">AI RENDER</span>
                        {editingPost.title}
                      </h2>
                      {editingPost.components && editingPost.components.length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3">Items in this look</p>
                          <div className="grid grid-cols-3 gap-4 mb-8">
                            {editingPost.components.map((c) => (
                              <div key={c.id} onClick={() => setSelectedShopItem(c)} className="flex flex-col gap-2 cursor-pointer group bg-white p-2 rounded-3xl border border-[#e5e5e5] shadow-sm">
                                <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden relative">
                                  <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.name} />
                                  <div className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={12} />
                                  </div>
                                </div>
                                <p className="text-[10px] font-bold text-[#1a1a1a] line-clamp-1 text-center px-1 pb-1">{c.name}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setMyPosts(myPosts.map((p) => (p.id === editingPost.id ? { ...p, published: true } : p)));
                          setFeedData((prev) => [
                            {
                              id: Date.now(),
                              image: editingPost.image,
                              user: userProfile.name,
                              avatar: userProfile.avatar || "https://i.pravatar.cc/150?u=default",
                              likes: 0,
                              desc: `${editingPost.title} ✨`,
                              tags: ["ai", "tryon"]
                            },
                            ...prev
                          ]);
                          setEditingPost({ ...editingPost, published: true });
                          showToast("Posted to Community!");
                        }}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg hover:bg-gray-800 transition active:scale-[0.98]"
                      >
                        <Send size={18} /> Post to Community
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 animate-in fade-in">
                      {editingPost.components && editingPost.components.length > 0 && (
                        <div className="mb-6">
                          <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3">Items in this look</p>
                          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                            {editingPost.components.map((comp) => (
                              <div key={comp.id} onClick={() => setSelectedShopItem(comp)} className="w-[72px] shrink-0 cursor-pointer group">
                                <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden border border-[#e5e5e5] shadow-sm mb-2 relative">
                                  <img src={comp.image} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={12} />
                                  </div>
                                </div>
                                <p className="text-[9px] font-bold text-[#1a1a1a] line-clamp-2 leading-tight text-center">{comp.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        <button className="text-[#1a1a1a] hover:text-red-500 transition flex items-center gap-1.5">
                          <Heart size={24} />
                          <span className="text-sm font-bold">{editingPost.likes || 124}</span>
                        </button>
                        <button className="text-[#1a1a1a] hover:text-gray-600 transition flex items-center gap-1.5">
                          <MessageCircle size={24} />
                          <span className="text-sm font-bold">{editingPost.comments?.length || 12}</span>
                        </button>
                      </div>
                      <p className="text-sm text-[#1a1a1a] leading-relaxed">
                        <span className="font-bold mr-2">{userProfile.handle}</span>
                        {editingPost.title}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {!isEditMode && editingPost.published && (
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#e5e5e5] z-20 pb-safe">
              <div className="flex items-center gap-3 bg-[#f5f3ef] rounded-full px-5 py-3.5 border border-[#e5e5e5] focus-within:border-black transition-all">
                <input type="text" placeholder="Add a comment..." className="flex-1 bg-transparent text-sm font-bold text-[#1a1a1a] outline-none placeholder:text-[#999999]" />
                <button className="text-black hover:text-gray-700 transition active:scale-95">
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedShopItem && <ShopItemOverlay initialItem={selectedShopItem} onClose={() => setSelectedShopItem(null)} wishlist={wishlist} toggleWishlist={toggleWishlist} showToast={showToast} />}
    </div>
  );
}

function useAuraStylist() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("input");
  const [auraMessage, setAuraMessage] = useState("");
  const [inputText, setInputText] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activeDetectedItem, setActiveDetectedItem] = useState(null);
  const [narrowQuery, setNarrowQuery] = useState("");
  const [promptResults, setPromptResults] = useState([]);
  const [promptCategorizedItems, setPromptCategorizedItems] = useState({});
  const [refinementSuggestions, setRefinementSuggestions] = useState([]);
  const [isAuraLoading, setIsAuraLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = useCallback(
    async (text) => {
      if (isSpeaking) {
        if (currentAudioSource) {
          try {
            currentAudioSource.stop();
          } catch {
            // noop
          }
          currentAudioSource = null;
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        return;
      }
      setIsSpeaking(true);
      try {
        const pcmData = await callGeminiTTS(text);
        if (pcmData) {
          await playPCM16Audio(pcmData);
        } else if (window.speechSynthesis) {
          await new Promise((resolve) => {
            const u = new SpeechSynthesisUtterance(text);
            u.onend = resolve;
            u.onerror = resolve;
            window.speechSynthesis.speak(u);
          });
        }
      } catch (error) {
        console.error("Speech playback error:", error);
      } finally {
        setIsSpeaking(false);
      }
    },
    [isSpeaking]
  );

  const openAura = useCallback((initialState = null) => {
    setIsOpen(true);
    if (initialState) {
      setUploadedImage(initialState.image);
      setActiveDetectedItem(initialState.item);
      setStep("matches");
    } else {
      setStep("input");
    }
  }, []);

  const closeAura = useCallback(() => {
    setIsOpen(false);
    if (currentAudioSource) {
      try {
        currentAudioSource.stop();
      } catch {
        // noop
      }
      currentAudioSource = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setTimeout(() => {
      setInputText("");
      setStep("input");
      setUploadedImage(null);
      setActiveDetectedItem(null);
      setNarrowQuery("");
      setPromptResults([]);
      setPromptCategorizedItems({});
      setRefinementSuggestions([]);
      setAttachedImages([]);
    }, 300);
  }, []);

  const handleImageAttach = useCallback((file) => {
    if (file) {
      setAttachedImages((prev) => [...prev, URL.createObjectURL(file)]);
    }
  }, []);

  const processPrompt = useCallback(
    (text = inputText) => {
      if (!text.trim() && attachedImages.length === 0) {
        return;
      }
      if (attachedImages.length > 0 && !text.trim()) {
        if (attachedImages.length === 1) {
          setUploadedImage(attachedImages[0]);
          setStep("extract");
          setAttachedImages([]);
          setInputText("");
          return;
        }
        text = "Find items matching these inspiration photos";
      }
      setIsOpen(true);
      setInputText("");
      setStep("search_results");
      setIsAuraLoading(true);
      const currentAttached = attachedImages;
      setAttachedImages([]);

      setTimeout(() => {
        const lower = text.toLowerCase();
        let msg = `Here are some pieces I curated for "${text}"...`;
        let suggestions = ["Under $100", "Different color", "More casual", "Add accessories"];
        let results = [];
        let categories = {};

        if (currentAttached.length > 0) {
          msg = `I analyzed your ${currentAttached.length} inspiration photo${currentAttached.length > 1 ? "s" : ""} and found these matching pieces, adjusted for: "${text}".`;
          suggestions = ["Try a different pattern", "Cheaper alternatives", "Show matching shoes"];
          results = [
            {
              id: "ai-outfit-inspo-1",
              title: "Inspired Look 1",
              items: [
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[0].image },
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[4].image },
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[1].image }
              ]
            },
            {
              id: "ai-outfit-inspo-2",
              title: "Inspired Look 2",
              items: [
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[2].image },
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[6].image },
                { type: "image", content: MOCK_SHOP_ALL_ITEMS[3].image }
              ]
            }
          ];
          categories = {
            "Matches: Tops": MOCK_SHOP_ALL_ITEMS.filter((i) => i.category === "Tops").slice(0, 4),
            "Matches: Bottoms": MOCK_SHOP_ALL_ITEMS.filter((i) => i.category === "Bottoms").slice(0, 4)
          };
        } else if (lower.includes("wedding") || lower.includes("summer beach")) {
          msg = "For a summer beach wedding, satin, pastel, and floral dresses would work great.";
          suggestions = ["Add heels", "Needs a clutch", "Pastel colors only"];
          results = [
            {
              id: "w-outfit-1",
              title: "Pink Satin Guest",
              items: [
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_d1").image },
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_j1").image },
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_j2").image }
              ]
            },
            {
              id: "w-outfit-2",
              title: "Pastel Floral Look",
              items: [
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_d2").image },
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_j3").image },
                { type: "image", content: WEDDING_ITEMS.find((i) => i.id === "w_s1").image }
              ]
            }
          ];
          categories = {
            Dresses: WEDDING_ITEMS.filter((i) => i.category === "Dresses"),
            Shoes: WEDDING_ITEMS.filter((i) => i.category === "Shoes"),
            Jewelry: WEDDING_ITEMS.filter((i) => i.category === "Jewelry")
          };
        } else if (lower.includes("linen skirt")) {
          msg = "Here are a few gorgeous ways to style a white linen skirt, ranging from peplum tops to effortless matching sets.";
          suggestions = ["Add a pop of color", "More casual", "Evening look", "Different bag"];
          results = [
            {
              id: "ls-outfit-1",
              title: "Peplum Chic",
              items: [
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_1").image },
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_2").image },
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_8").image }
              ]
            },
            {
              id: "ls-outfit-2",
              title: "Smocked Halter",
              items: [
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_1").image },
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_3").image },
                { type: "image", content: LINEN_SKIRT_ITEMS.find((i) => i.id === "ls_10").image }
              ]
            }
          ];
          categories = {
            "Tops & Skirts": LINEN_SKIRT_ITEMS.filter((i) => ["Tops", "Bottoms"].includes(i.category)),
            "Linen Sets": LINEN_SKIRT_ITEMS.filter((i) => i.category === "Sets"),
            "Bags & Shoes": LINEN_SKIRT_ITEMS.filter((i) => ["Bags", "Shoes"].includes(i.category))
          };
        } else {
          const stylistCuratedItems = {
            whiteBlouse: {
              id: "p1",
              brand: "Mango",
              name: "White Short-Sleeve Blouse",
              price: "$49.99",
              image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=400&q=80",
              category: "Tops"
            },
            blackTrousers: {
              id: "p2",
              brand: "Zara",
              name: "Tailored Black Trousers",
              price: "$59.90",
              image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=400&q=80",
              category: "Bottoms"
            },
            brownLoafers: {
              id: "p3",
              brand: "Sam Edelman",
              name: "Brown Leather Loafers",
              price: "$130.00",
              image: "https://images.unsplash.com/photo-1549428236-47ea09bc6625?auto=format&fit=crop&w=400&q=80",
              category: "Shoes"
            },
            whiteTank: {
              id: "p4",
              brand: "Alo Yoga",
              name: "Ribbed White Tank",
              price: "$58.00",
              image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
              category: "Tops"
            },
            blackAthleticShorts: {
              id: "p5",
              brand: "Lululemon",
              name: "Align Black Shorts",
              price: "$64.00",
              image: "https://images.unsplash.com/photo-1538330627166-33d1908c210d?auto=format&fit=crop&w=400&q=80",
              category: "Bottoms"
            },
            whiteSneakers: {
              id: "p6",
              brand: "New Balance",
              name: "Chunky White Sneakers",
              price: "$110.00",
              image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
              category: "Shoes"
            },
            stripedMaxi: {
              id: "p7",
              brand: "Reformation",
              name: "Striped Linen Maxi",
              price: "$248.00",
              image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80",
              category: "Dresses"
            },
            strawBag: {
              id: "p8",
              brand: "Loewe",
              name: "Woven Straw Tote",
              price: "$650.00",
              image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80",
              category: "Bags"
            },
            sunnies: {
              id: "p9",
              brand: "Celine",
              name: "Oval Sunglasses",
              price: "$420.00",
              image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80",
              category: "Accessories"
            },
            sweaterVest: {
              id: "p10",
              brand: "Ralph Lauren",
              name: "Cream Cable Knit Vest",
              price: "$128.00",
              image: "https://images.unsplash.com/photo-1604644401890-0bd678c83788?auto=format&fit=crop&w=400&q=80",
              category: "Tops"
            },
            creamTrousers: {
              id: "p11",
              brand: "Aritzia",
              name: "Effortless Cream Pants",
              price: "$148.00",
              image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80",
              category: "Bottoms"
            },
            neutralBag: {
              id: "p12",
              brand: "Polène",
              name: "Numéro Neuf Bag",
              price: "$520.00",
              image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80",
              category: "Bags"
            }
          };
          results = [
            {
              id: `ai-outfit-${Math.random()}`,
              title: "Summer Office",
              items: [
                { type: "image", content: stylistCuratedItems.whiteBlouse.image },
                { type: "image", content: stylistCuratedItems.blackTrousers.image },
                { type: "image", content: stylistCuratedItems.brownLoafers.image }
              ]
            },
            {
              id: `ai-outfit-${Math.random()}`,
              title: "Athleisure",
              items: [
                { type: "image", content: stylistCuratedItems.whiteTank.image },
                { type: "image", content: stylistCuratedItems.blackAthleticShorts.image },
                { type: "image", content: stylistCuratedItems.whiteSneakers.image }
              ]
            },
            {
              id: `ai-outfit-${Math.random()}`,
              title: "Coastal Maxi",
              items: [
                { type: "image", content: stylistCuratedItems.stripedMaxi.image },
                { type: "image", content: stylistCuratedItems.sunnies.image },
                { type: "image", content: stylistCuratedItems.strawBag.image }
              ]
            },
            {
              id: `ai-outfit-${Math.random()}`,
              title: "Old Money Preppy",
              items: [
                { type: "image", content: stylistCuratedItems.sweaterVest.image },
                { type: "image", content: stylistCuratedItems.creamTrousers.image },
                { type: "image", content: stylistCuratedItems.neutralBag.image }
              ]
            }
          ];
          const allCuratedItems = Object.values(stylistCuratedItems);
          categories = {
            "Tops & Dresses": allCuratedItems.filter((i) => ["Tops", "Dresses"].includes(i.category)),
            Bottoms: allCuratedItems.filter((i) => i.category === "Bottoms"),
            "Bags & Shoes": allCuratedItems.filter((i) => ["Bags", "Shoes", "Accessories"].includes(i.category))
          };
          suggestions = ["More office appropriate", "Preppier vibe", "Add yellow", "Linen only"];
          msg = lower.includes("wardrobe") || lower.includes("wishlist") ? "Mixing your existing wardrobe with a few wishlist items. Here's a curated look just for you." : `Here are some pieces I curated for "${text}"...`;
        }
        setPromptResults(results);
        setPromptCategorizedItems(categories);
        setRefinementSuggestions(suggestions);
        setAuraMessage(msg);
        setIsAuraLoading(false);
      }, 1500);
    },
    [inputText, attachedImages]
  );

  const handleImageUpload = useCallback((file) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setStep("extract");
    }
  }, []);

  const getDisplayMatches = useCallback(() => {
    if (!activeDetectedItem) {
      return [];
    }
    return activeDetectedItem.matchData.filter((item) => {
      if (!narrowQuery) {
        return true;
      }
      const q = narrowQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.price.toString().includes(q);
    });
  }, [activeDetectedItem, narrowQuery]);

  return {
    isOpen,
    step,
    inputText,
    auraMessage,
    uploadedImage,
    activeDetectedItem,
    narrowQuery,
    promptResults,
    promptCategorizedItems,
    refinementSuggestions,
    isAuraLoading,
    attachedImages,
    isSpeaking,
    displayMatches: getDisplayMatches(),
    extractedDataMap: EXTRACTED_DATA_MOCK,
    setInputText,
    setNarrowQuery,
    setStep,
    setActiveDetectedItem,
    setAttachedImages,
    setAuraMessage,
    openAura,
    closeAura,
    processPrompt,
    handleImageUpload,
    handleImageAttach,
    toggleSpeech,
    clearAuraMessage: () => setAuraMessage("")
  };
}

function AuraExtractAndChat({ aura }) {
  const {
    isOpen,
    step,
    inputText,
    setInputText,
    processPrompt,
    handleImageUpload,
    handleImageAttach,
    closeAura,
    uploadedImage,
    extractedDataMap,
    activeDetectedItem,
    displayMatches,
    setStep,
    setActiveDetectedItem,
    setNarrowQuery,
    narrowQuery,
    promptResults,
    promptCategorizedItems,
    refinementSuggestions,
    isAuraLoading,
    auraMessage,
    attachedImages,
    setAttachedImages,
    isSpeaking,
    toggleSpeech
  } = aura;
  const inputRef = useRef(null);
  const [mixItems, setMixItems] = useGlobalMix();
  const [addedItems, setAddedItems] = useState(new Set());
  const [wardrobe] = useStore(wardrobeStore);
  const [wishlist] = useStore(wishlistStore);
  const [selectedStylistItems, setSelectedStylistItems] = useState(new Set());
  const [viewingOutfit, setViewingOutfit] = useState(null);
  const [viewingItemHistory, setViewingItemHistory] = useState([]);
  const viewingItem = viewingItemHistory.length > 0 ? viewingItemHistory[viewingItemHistory.length - 1] : null;
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedStylistItems(new Set());
      setViewingOutfit(null);
      setViewingItemHistory([]);
      setExpandedCategory(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSaveOutfit = (outfit, e) => {
    e.stopPropagation();
    setAddedItems((prev) => new Set([...prev, outfit.id]));
    addGlobalOutfit({
      id: Date.now(),
      title: outfit.title,
      source: "AI Stylist",
      items: outfit.items,
      tags: outfit.tags
    });
  };

  const handleAddToMix = (item, e) => {
    e.stopPropagation();
    const combined = [{ id: Date.now(), image: item.image }, ...mixItems].slice(0, 5);
    setMixItems(combined);
    setAddedItems((prev) => new Set([...prev, item.id]));
    triggerFlyingAnimation(item.image, e);
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={closeAura} />
      <div className="relative mt-auto flex flex-col bg-white w-full max-h-[90vh] rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-full pb-safe">
        {step !== "input" && (
          <div className="px-6 pt-12 pb-4 sm:pt-14 flex justify-between items-center border-b border-[#e5e5e5] bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {(step === "matches" || step === "search_results" || step === "select_wardrobe_items") && (
                <button onClick={() => setStep(step === "matches" ? "extract" : "input")} className="p-2 -ml-2 text-[#999999] hover:text-[#1a1a1a] transition">
                  <ChevronLeft size={20} />
                </button>
              )}
              <h2 className="text-3xl font-serif italic text-[#1a1a1a]">
                {step === "extract" ? "Extract" : step === "search_results" ? "Stylist" : step === "select_wardrobe_items" ? "Select Items" : "Refine Matches"}
              </h2>
            </div>
            <button onClick={closeAura} className="p-2 text-[#999999] hover:text-[#1a1a1a] transition">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {step === "input" && (
            <div className="pt-4">
              <div className="w-12 h-1.5 bg-[#e5e5e5] rounded-full mx-auto mb-6" />
              <label className="block bg-[#f5f3ef] border border-[#e5e5e5] rounded-2xl p-6 mb-6 cursor-pointer hover:bg-[#e8e5df] transition-colors relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-sm font-bold text-[#1a1a1a] mb-2 flex items-center gap-2">
                    <Camera size={16} /> Saw a fit you like?
                  </div>
                  <div className="text-xs text-[#6B655F] leading-relaxed mt-1">Upload outfit inspo to instantly find and shop similar pieces.</div>
                </div>
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
              </label>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#999999] mb-4 mt-8">Try these prompts</div>
              <div className="space-y-3">
                {[
                  { id: "occasion", icon: "🎯", text: "Create outfits for a summer beach wedding." },
                  { id: "item", icon: "🧩", text: "Style looks around a white linen skirt." },
                  { id: "wardrobe", icon: "👗", text: "Make outfits from my wardrobe & wishlist." }
                ].map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => (pt.id === "wardrobe" ? setStep("select_wardrobe_items") : processPrompt(pt.text))}
                    className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-[#e5e5e5] flex items-center gap-4 hover:scale-[1.02] transition-transform active:scale-95"
                  >
                    <div className="text-xl shrink-0">{pt.icon}</div>
                    <div className="text-[13px] font-bold text-[#1a1a1a] leading-tight">{pt.text}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === "select_wardrobe_items" && (
            <div className="animate-in fade-in pb-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#999999] mb-4">Tap items to include, or skip to use any</p>
              <div className="grid grid-cols-3 gap-3">
                {[...wardrobe, ...wishlist].map((item, index) => {
                  const isSelected = selectedStylistItems.has(item.id);
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      onClick={() => {
                        const next = new Set(selectedStylistItems);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        setSelectedStylistItems(next);
                      }}
                      className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? "border-black scale-[0.96]" : "border-transparent bg-[#e6e2d6] hover:scale-[1.02]"}`}
                    >
                      <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-black text-white rounded-full p-0.5 shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step === "search_results" && (
            <div className="animate-in fade-in slide-in-from-right-4 pb-8">
              {isAuraLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#999999]">
                  <Sparkles size={32} className="animate-pulse mb-4 text-[#1a1a1a]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">Stylist is curating...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-3 relative pr-8">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                      <Sparkles size={14} />
                    </div>
                    <div className="bg-[#f5f3ef] p-4 rounded-2xl rounded-tl-none border border-[#e5e5e5] text-sm font-medium text-[#1a1a1a] leading-relaxed shadow-sm">{auraMessage}</div>
                    <button onClick={() => toggleSpeech(auraMessage)} className={`absolute top-0 right-0 p-2 rounded-full transition ${isSpeaking ? "text-purple-600" : "text-[#999999] hover:text-[#1a1a1a]"}`}>
                      {isSpeaking ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {promptResults.map((outfit) => (
                      <div key={outfit.id} onClick={() => setViewingOutfit(outfit)} className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm flex flex-col overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="relative w-full aspect-[2/3] bg-[#f5f3ef] overflow-hidden isolate">
                          <button onClick={(e) => handleSaveOutfit(outfit, e)} className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 z-50 ${addedItems.has(outfit.id) ? "bg-black text-white scale-110" : "bg-white/90 backdrop-blur text-[#1a1a1a] hover:bg-white hover:scale-110"}`}>
                            {addedItems.has(outfit.id) ? <Check size={14} strokeWidth={3} /> : <Bookmark size={14} strokeWidth={2.5} />}
                          </button>
                          <OutfitBento items={outfit.items} />
                        </div>
                        <div className="p-3 flex flex-col gap-1.5 bg-white relative z-20 border-t border-[#e5e5e5]">
                          <h3 className="font-bold text-[#1a1a1a] text-[13px] leading-tight line-clamp-1">{outfit.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 mt-4 border-t border-[#e5e5e5]">
                    <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">Shop the Vibe</h3>
                    {Object.entries(promptCategorizedItems).map(([catName, items]) =>
                      items.length > 0 ? (
                        <div key={catName} className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">{catName}</h4>
                            <button onClick={() => setExpandedCategory({ name: catName, items })} className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest hover:text-gray-600 transition">
                              Shop All
                            </button>
                          </div>
                          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
                            {items.map((item) => (
                              <div key={item.id} onClick={() => setViewingItemHistory([item])} className="w-[100px] shrink-0 cursor-pointer group">
                                <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden border border-[#e5e5e5] mb-2 shadow-sm relative">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <button onClick={(e) => handleAddToMix(item, e)} className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 z-10 ${addedItems.has(item.id) ? "bg-black text-white" : "bg-white/90 backdrop-blur text-[#1a1a1a] hover:bg-white"}`}>
                                    {addedItems.has(item.id) ? <Check size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                                  </button>
                                </div>
                                <p className="text-[9px] font-bold text-[#999999] uppercase tracking-widest truncate">{item.brand}</p>
                                <p className="text-[11px] font-bold text-[#1a1a1a] truncate">{item.name}</p>
                                <p className="text-xs font-bold text-[#1a1a1a] mt-0.5">{item.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#999999] mb-3 flex items-center gap-1.5">
                      <SlidersHorizontal size={12} /> Refine further
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {refinementSuggestions.map((sug) => (
                        <button key={sug} onClick={() => processPrompt(sug)} className="px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-full text-xs font-bold text-[#1a1a1a] shadow-sm hover:border-black transition active:scale-95">
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === "extract" && (
            <div className="animate-in fade-in pb-8">
              <img src={uploadedImage} alt="Uploaded Look" className="w-full h-64 object-cover rounded-2xl shadow-sm mb-6" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#999999] mb-4">Detected Items</div>
              <div className="space-y-3">
                {extractedDataMap.items.map((item) => (
                  <div key={item.id} onClick={() => { setActiveDetectedItem(item); setStep("matches"); }} className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5e5e5] flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="w-12 h-12 bg-[#f5f3ef] border border-[#e5e5e5] rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#1a1a1a]">{item.name}</div>
                      <div className="text-[10px] text-[#999999] uppercase tracking-widest mt-1">{item.category}</div>
                    </div>
                    <div className="px-3 py-1 bg-[#f5f3ef] text-[#1a1a1a] border border-[#e5e5e5] rounded-full text-[10px] uppercase tracking-widest font-bold">{item.matchesCount} Matches</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === "matches" && (
            <div className="animate-in fade-in slide-in-from-right-4 pb-8 grid grid-cols-2 gap-4">
              {displayMatches.map((match) => (
                <div key={match.id} className="flex flex-col group cursor-pointer">
                  <div className="relative aspect-[3/4] bg-[#e6e2d6] border border-[#e5e5e5] rounded-2xl overflow-hidden mb-2">
                    <img src={match.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={match.name} />
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#999999] truncate mt-1">{match.brand}</div>
                  <div className="text-xs font-bold text-[#1a1a1a] truncate mt-0.5">{match.name}</div>
                  <div className="text-sm font-bold mt-1 text-[#1a1a1a]">${match.price}</div>
                </div>
              ))}
              {displayMatches.length === 0 && <div className="col-span-2 py-10 text-center text-[#999999] italic font-serif text-sm">No items match your refinement.</div>}
            </div>
          )}
        </div>
        {step === "select_wardrobe_items" ? (
          <div className="p-4 bg-gradient-to-t from-white via-white/90 to-transparent sticky bottom-0 z-20 mt-auto pt-8">
            <button
              onClick={() => {
                let prompt = "Make outfits from my wardrobe & wishlist.";
                if (selectedStylistItems.size > 0) {
                  const selectedNames = [...wardrobe, ...wishlist].filter((w) => selectedStylistItems.has(w.id)).map((w) => w.name).join(", ");
                  prompt = `Create outfits using these items from my closet: ${selectedNames}. Suggest complementary pieces.`;
                }
                processPrompt(prompt);
                setSelectedStylistItems(new Set());
              }}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center hover:bg-[#2a2a2a] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
            >
              {selectedStylistItems.size > 0 ? `Style ${selectedStylistItems.size} Selected Items` : "Style Any Items"}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-t from-white via-white/90 to-transparent sticky bottom-0 z-20 mt-auto pt-8">
            <div className="flex flex-col bg-white rounded-3xl border border-[#e5e5e5] shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 transition-all p-1.5 mx-1 mb-2">
              {attachedImages.length > 0 && (
                <div className="flex gap-2 mx-2 mt-2 mb-1 overflow-x-auto scrollbar-hide py-1">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0 animate-in zoom-in-95 duration-200">
                      <img src={img} className="w-full h-full object-cover rounded-xl border border-[#e5e5e5] shadow-sm" alt="Attached" />
                      <button onClick={() => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1">
                {step !== "input" && (
                  <button
                    onClick={() => {
                      setInputText("");
                      setAttachedImages([]);
                      setNarrowQuery("");
                      setStep("input");
                    }}
                    className="cursor-pointer hover:bg-[#e8e5df] rounded-full p-1.5 transition-colors shrink-0 flex items-center justify-center"
                    title="New Chat"
                  >
                    <Plus size={20} className="text-[#1a1a1a]" />
                  </button>
                )}
                {step !== "matches" && (
                  <label className="cursor-pointer hover:bg-[#e8e5df] rounded-full p-1.5 transition-colors shrink-0 flex items-center justify-center">
                    <ImageIcon size={20} className="text-[#1a1a1a]" />
                    <input
                      type="file"
                      multiple
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        Array.from(e.target.files).forEach((file) => handleImageAttach(file));
                        e.target.value = null;
                      }}
                    />
                  </label>
                )}
                <input
                  ref={inputRef}
                  value={step === "matches" ? narrowQuery : inputText}
                  onChange={(e) => (step === "matches" ? setNarrowQuery(e.target.value) : setInputText(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && step !== "matches") {
                      processPrompt();
                    }
                  }}
                  placeholder={step === "matches" ? "Type to refine (e.g. 'under $100', 'silk')..." : step === "search_results" ? "Refine your results..." : "Describe a vibe or drop a photo..."}
                  className="flex-1 bg-transparent text-sm outline-none py-2 px-1 text-[#1a1a1a] placeholder:text-[#999999] font-medium min-w-0"
                  disabled={isAuraLoading}
                />
                <button
                  onClick={() => step !== "matches" && processPrompt()}
                  disabled={isAuraLoading || (step === "matches" ? !narrowQuery.trim() : !inputText.trim() && attachedImages.length === 0)}
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${isAuraLoading || (step === "matches" ? !narrowQuery.trim() : !inputText.trim() && attachedImages.length === 0) ? "bg-[#e5e5e5] text-[#999999] cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}
        {expandedCategory && !viewingItem && (
          <div className="absolute inset-0 bg-[#f5f3ef] z-[65] flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-[#e5e5e5] bg-white shrink-0 sticky top-0 z-10">
              <button onClick={() => setExpandedCategory(null)} className="p-2 -ml-2 text-[#1a1a1a] hover:bg-[#f5f3ef] rounded-full transition border border-[#e5e5e5]">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-serif text-[#1a1a1a] truncate px-4">Shop {expandedCategory.name}</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto pb-safe p-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {expandedCategory.items.map((item) => (
                  <div key={item.id} onClick={() => setViewingItemHistory([item])} className="flex flex-col gap-2 cursor-pointer group bg-white p-2 rounded-3xl border border-[#e5e5e5] shadow-sm">
                    <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button onClick={(e) => handleAddToMix(item, e)} className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 z-10 ${addedItems.has(item.id) ? "bg-black text-white" : "bg-white/90 backdrop-blur text-[#1a1a1a] hover:bg-white"}`}>
                        {addedItems.has(item.id) ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                      </button>
                    </div>
                    <div className="px-1 pb-1 mt-1">
                      <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest line-clamp-1">{item.brand}</p>
                      <p className="text-xs font-bold text-[#1a1a1a] line-clamp-1 leading-tight mt-0.5">{item.name}</p>
                      <p className="text-sm font-bold text-[#1a1a1a] mt-1.5">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {viewingOutfit && !viewingItem && (
          <div className="absolute inset-0 bg-[#f5f3ef] z-[60] flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-[#e5e5e5] bg-white shrink-0 sticky top-0 z-10">
              <button onClick={() => setViewingOutfit(null)} className="p-2 -ml-2 text-[#1a1a1a] hover:bg-[#f5f3ef] rounded-full transition border border-[#e5e5e5]">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-serif text-[#1a1a1a] truncate px-4">Outfit Details</h2>
              <button onClick={(e) => { handleSaveOutfit(viewingOutfit, e); setViewingOutfit(null); }} className="text-[#1a1a1a] hover:text-black">
                <Bookmark size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-safe flex flex-col">
              <div className="w-full relative bg-[#e6e2d6] h-[55vh] shrink-0 isolate overflow-hidden">
                <OutfitCollage items={viewingOutfit.items} interactive />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a] pointer-events-none z-[100] flex items-center gap-1.5">
                  <LayoutGrid size={12} /> Tap & drag to rearrange
                </div>
              </div>
              <div className="p-6 bg-[#f5f3ef] flex-1">
                <h2 className="text-2xl font-serif text-[#1a1a1a] leading-tight mb-6">{viewingOutfit.title}</h2>
                <h3 className="font-serif text-xl text-[#1a1a1a] mb-6">Items in this look</h3>
                <div className="grid grid-cols-3 gap-4">
                  {viewingOutfit.items.filter((i) => i.type === "image").map((item, idx) => {
                    const matchedItem = [...MOCK_SHOP_ALL_ITEMS, ...wardrobe, ...wishlist, ...WEDDING_ITEMS, ...LINEN_SKIRT_ITEMS].find((w) => w.image === item.content) || {
                      id: idx,
                      brand: "Suggested",
                      name: "Garment",
                      image: item.content,
                      category: "Apparel",
                      price: "$45.00"
                    };
                    return (
                      <div key={idx} onClick={() => setViewingItemHistory([matchedItem])} className="flex flex-col gap-2 cursor-pointer group bg-white p-2 rounded-3xl border border-[#e5e5e5] shadow-sm">
                        <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl overflow-hidden relative">
                          <img src={matchedItem.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={matchedItem.name} />
                        </div>
                        <div className="px-1 pb-1 mt-1">
                          <p className="text-[9px] font-bold text-[#999999] uppercase tracking-widest line-clamp-1">{matchedItem.brand}</p>
                          <p className="text-[11px] font-bold text-[#1a1a1a] line-clamp-1 leading-tight">{matchedItem.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {viewingItem && (
          <div className="absolute inset-0 bg-[#f5f3ef] z-[70] flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="px-6 pt-12 pb-4 sm:pt-14 flex justify-between items-center border-b border-[#e5e5e5] bg-white shrink-0 sticky top-0 z-10">
              <button onClick={() => setViewingItemHistory((prev) => prev.slice(0, -1))} className="p-2 -ml-2 text-[#1a1a1a] hover:bg-[#f5f3ef] rounded-full transition border border-[#e5e5e5]">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-serif text-[#1a1a1a]">Item Details</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto pb-safe">
              <div className="w-full relative bg-[#e6e2d6] h-[50vh] shrink-0 border-b border-[#e5e5e5]">
                <img src={viewingItem.image} className="w-full h-full object-cover" alt={viewingItem.name} />
              </div>
              <div className="p-6 bg-[#f5f3ef]">
                <p className="text-[11px] font-bold text-[#999999] uppercase tracking-widest font-serif mb-1">{viewingItem.brand}</p>
                <h2 className="text-2xl font-serif text-[#1a1a1a] leading-tight">{viewingItem.name}</h2>
                {viewingItem.price && <p className="text-xl font-bold text-[#1a1a1a] mt-2">{viewingItem.price}</p>}
                <button onClick={() => { window.open(viewingItem.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${viewingItem.brand || ""} ${viewingItem.name || ""}`)}`, "_blank"); }} className="w-full py-4 mt-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-[0.98] shadow-md">
                  <ShoppingCart size={16} /> SHOP ITEM
                </button>
                <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles size={18} className="text-[#1a1a1a]" />
                    <h3 className="font-serif text-xl text-[#1a1a1a]">More like this</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-6">
                    {[...MOCK_SHOP_ALL_ITEMS, ...WEDDING_ITEMS, ...LINEN_SKIRT_ITEMS]
                      .filter((i) => i.id !== viewingItem.id)
                      .slice(0, 4)
                      .map((simItem, simIdx) => (
                        <div key={simItem.id || simIdx} onClick={() => setViewingItemHistory([...viewingItemHistory, simItem])} className="flex flex-col gap-1.5 cursor-pointer group relative">
                          <div className="relative aspect-[4/5] bg-[#e6e2d6] rounded-3xl border border-[#e5e5e5] overflow-hidden mb-1">
                            <img src={simItem.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={simItem.name} />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#999999] uppercase tracking-tight font-bold">{simItem.brand}</p>
                            <p className="text-xs font-bold text-[#1a1a1a] line-clamp-1">{simItem.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-[#1a1a1a]">{simItem.price}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, active, onClick, badge, actionIcon, onActionClick }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-[60px] h-[60px]">
      <button onClick={onClick} className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-400 ease-out ${active ? "text-[#1a1a1a]" : "text-[#a39f98] hover:text-[#1a1a1a]"}`}>
        <div className={`transition-transform duration-400 ease-out flex items-center justify-center h-full ${active ? "-translate-y-1.5 scale-110" : "scale-100"}`}>{icon}</div>
        <div className={`absolute bottom-1 w-1 h-1 bg-[#1a1a1a] rounded-full transition-all duration-300 ${active ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
        {badge > 0 && <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-[#ff4d4d] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{badge}</div>}
      </button>
      {actionIcon && (
        <button onClick={onActionClick} className={`absolute ${active ? "-top-1.5 -right-1.5 scale-110" : "top-0 right-0 scale-100"} bg-black text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-black/20 hover:scale-125 transition-all duration-300 z-10 border-2 border-white`}>
          {actionIcon}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("trending");
  const [mixItems] = useGlobalMix();
  const [flyingItem] = useStore(flyingStore);
  const aura = useAuraStylist();

  return (
    <div className="min-h-screen bg-[#e8e5df] sm:p-6 flex items-center justify-center font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            * { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-serif { font-family: 'Playfair Display', serif !important; }
            @keyframes scan {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(200px); }
            }
            @keyframes scanline {
              0%, 100% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              40% { opacity: 1; }
              50% { top: 100%; opacity: 0; }
            }
            @keyframes flyToBottom {
              0% { transform: scale(1) translate(0, 0) rotate(0deg); opacity: 1; }
              20% { transform: scale(1.1) translate(0, -10px) rotate(5deg); opacity: 1; }
              100% { transform: scale(0.1) translate(var(--tx), var(--ty)) rotate(-10deg); opacity: 0; }
            }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .custom-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: black;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .custom-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: black;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
          `
        }}
      />
      <div
        id="mobile-frame"
        className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] bg-[#f5f3ef] sm:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden sm:border-[8px] border-[#1a1a1a] relative flex flex-col text-[#1a1a1a]"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-black rounded-full z-[9999] hidden sm:flex items-center justify-end px-3 shadow-md pointer-events-none">
          <div className="w-3 h-3 bg-[#121212] rounded-full shadow-inner shadow-black/50 border border-white/5" />
        </div>
        <main className="flex-1 overflow-hidden relative bg-[#f5f3ef]" style={{ transform: "translateZ(0)" }}>
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
            {activeTab === "trending" && <TrendingFeed aura={aura} />}
            {activeTab === "wardrobe" && <WardrobeTab aura={aura} />}
            {activeTab === "tryon" && <TryOnTab aura={aura} />}
            {activeTab === "profile" && <ProfileTab />}
          </div>
          <AuraExtractAndChat aura={aura} />
        </main>
        <nav className="absolute bottom-6 left-6 right-6 shrink-0 bg-white/75 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-50 rounded-[2rem] overflow-hidden">
          <div className="flex justify-around items-center px-2 h-[4.5rem]">
            <NavItem icon={<Activity strokeWidth={activeTab === "trending" ? 2.5 : 2} size={22} />} active={activeTab === "trending"} onClick={() => setActiveTab("trending")} />
            <NavItem
              icon={<Shirt strokeWidth={activeTab === "wardrobe" ? 2.5 : 2} size={22} />}
              active={activeTab === "wardrobe"}
              onClick={() => setActiveTab("wardrobe")}
              actionIcon={<Plus size={14} strokeWidth={3} />}
              onActionClick={(e) => {
                e.stopPropagation();
                setActiveTab("wardrobe");
                wardrobeUploadStore.setState("selecting");
              }}
            />
            <NavItem icon={<Sparkles size={24} strokeWidth={activeTab === "tryon" ? 2.5 : 2} />} active={activeTab === "tryon"} onClick={() => setActiveTab("tryon")} badge={mixItems.length} />
            <NavItem icon={<User strokeWidth={activeTab === "profile" ? 2.5 : 2} size={22} />} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          </div>
        </nav>
      </div>
      {flyingItem && (
        <img
          key={flyingItem.id}
          src={flyingItem.src}
          className="fixed z-[9999] object-cover rounded-2xl shadow-2xl pointer-events-none mix-blend-multiply bg-white"
          style={{
            width: "80px",
            height: "80px",
            left: flyingItem.startX - 40,
            top: flyingItem.startY - 40,
            "--tx": `${(typeof window !== "undefined" ? window.innerWidth / 2 : 0) - flyingItem.startX}px`,
            "--ty": `${(typeof window !== "undefined" ? window.innerHeight - 40 : 0) - flyingItem.startY}px`,
            animation: "flyToBottom 0.7s cubic-bezier(0.2, 1, 0.3, 1) forwards"
          }}
          alt="flying"
        />
      )}
    </div>
  );
}
