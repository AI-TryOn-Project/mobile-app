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
  Compass,
  CreditCard,
  Edit2,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  Lock,
  LogOut,
  Globe,
  MessageCircle,
  Mic,
  MoreHorizontal,
  PlayCircle,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings,
  Share2,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Volume2,
  Wand2,
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

const PROFILE_VISIBILITY = { PUBLIC: "PUBLIC", FOLLOWERS: "FOLLOWERS", PRIVATE: "PRIVATE" };

const MOCK_USERS = [
  {
    id: "chic-style",
    name: "Chic Style",
    handle: "chic.style",
    avatar: "https://i.pravatar.cc/150?u=chic",
    bio: "Tailoring + clean lines. NYC.",
    followers: 12400,
    following: 286,
    skills: ["minimalist", "tailored", "layering"],
    wardrobeIds: [1, 2, 5, 9],
    wishlistIds: [101, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    handle: "modern.minimal",
    avatar: "https://i.pravatar.cc/150?u=mod",
    bio: "Less is more.",
    followers: 8200,
    following: 142,
    skills: ["minimalist", "neutral", "clean"],
    wardrobeIds: [5, 6, 11, 12],
    wishlistIds: [103, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "night-out-wardrobe",
    name: "Night Out Wardrobe",
    handle: "nightout.wardrobe",
    avatar: "https://i.pravatar.cc/150?u=night",
    bio: "Built for evenings.",
    followers: 5400,
    following: 410,
    skills: ["going-out", "evening", "sleek"],
    wardrobeIds: [3, 4, 11],
    wishlistIds: [101, 102],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "show-me-your-mumu",
    name: "Show Me Your Mumu",
    handle: "showmeyourmumu",
    avatar: "https://i.pravatar.cc/150?u=mumu",
    bio: "Boho dreams, floral schemes.",
    followers: 22100,
    following: 98,
    skills: ["boho", "floral", "spring"],
    wardrobeIds: [4, 7, 8, 12],
    wishlistIds: [101, 103],
    wardrobeVisibility: PROFILE_VISIBILITY.FOLLOWERS,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "vintage-finds",
    name: "Vintage Finds",
    handle: "vintage.finds",
    avatar: "https://i.pravatar.cc/150?u=v1",
    bio: "2002 was a vibe.",
    followers: 3100,
    following: 540,
    skills: ["y2k", "vintage", "retro"],
    wardrobeIds: [2, 4, 9],
    wishlistIds: [102, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PRIVATE,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "neutral-palette",
    name: "Neutral Palette",
    handle: "neutral.palette",
    avatar: "https://i.pravatar.cc/150?u=v3",
    bio: "Beige all day.",
    followers: 6700,
    following: 220,
    skills: ["neutral", "minimalist", "clean"],
    wardrobeIds: [1, 5, 6, 7],
    wishlistIds: [103, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "glamour-look",
    name: "Glamour Look",
    handle: "glamour.look",
    avatar: "https://i.pravatar.cc/150?u=v8",
    bio: "After dark.",
    followers: 9800,
    following: 175,
    skills: ["evening", "sophisticated", "satin"],
    wardrobeIds: [3, 4, 11],
    wishlistIds: [101, 102],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.FOLLOWERS
  },
  {
    id: "trend-setter",
    name: "Trend Setter",
    handle: "trend.setter",
    avatar: "https://i.pravatar.cc/150?u=v7",
    bio: "Early adopter.",
    followers: 14500,
    following: 312,
    skills: ["y2k", "trendy", "statement"],
    wardrobeIds: [2, 9, 11, 12],
    wishlistIds: [102, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "breezy-style",
    name: "Breezy Style",
    handle: "breezy.style",
    avatar: "https://i.pravatar.cc/150?u=v9",
    bio: "Beach to brunch.",
    followers: 4200,
    following: 188,
    skills: ["coastal", "breezy", "summer"],
    wardrobeIds: [7, 8, 10],
    wishlistIds: [101, 103],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "everyday-chic",
    name: "Everyday Chic",
    handle: "everyday.chic",
    avatar: "https://i.pravatar.cc/150?u=v6",
    bio: "Easy outfits, everyday.",
    followers: 5800,
    following: 240,
    skills: ["casual", "easy", "layering"],
    wardrobeIds: [1, 7, 10, 11],
    wishlistIds: [104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "downtown-edge",
    name: "Downtown Edge",
    handle: "downtown.edge",
    avatar: "https://i.pravatar.cc/150?u=v7",
    bio: "NYC nights.",
    followers: 7300,
    following: 154,
    skills: ["edgy", "night", "leather"],
    wardrobeIds: [5, 11, 12],
    wishlistIds: [101, 102],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "night-mode",
    name: "Night Mode",
    handle: "night.mode",
    avatar: "https://i.pravatar.cc/150?u=v9",
    bio: "Dinner reservation core.",
    followers: 4400,
    following: 132,
    skills: ["night", "leather", "slinky"],
    wardrobeIds: [3, 11],
    wishlistIds: [102],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "gallery-mood",
    name: "Gallery Mood",
    handle: "gallery.mood",
    avatar: "https://i.pravatar.cc/150?u=v2",
    bio: "Chelsea opening regular.",
    followers: 6100,
    following: 89,
    skills: ["art", "sculptural", "neutral"],
    wardrobeIds: [1, 5, 9],
    wishlistIds: [103, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "art-walk",
    name: "Art Walk",
    handle: "art.walk",
    avatar: "https://i.pravatar.cc/150?u=v5",
    bio: "Bold knits, wide legs.",
    followers: 3800,
    following: 210,
    skills: ["bold-knit", "gallery", "wide-leg"],
    wardrobeIds: [6, 10],
    wishlistIds: [101, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "anna-curates",
    name: "Anna Curates",
    handle: "anna_curates",
    avatar: "https://i.pravatar.cc/120?img=47",
    bio: "Royal off-duty references, polished vintage, and quietly iconic proportions.",
    followers: 12400,
    following: 167,
    skills: ["royal-off-duty", "polished-vintage", "loafer-styling"],
    wardrobeIds: [1, 3, 7, 9],
    wishlistIds: [101, 102],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  },
  {
    id: "kstyle-curates",
    name: "K Style Curates",
    handle: "kstyle_curates",
    avatar: "https://i.pravatar.cc/120?img=12",
    bio: "Sharp proportions, luxe textures, and a playful it-girl finish.",
    followers: 18600,
    following: 203,
    skills: ["k-style", "mini-silhouettes", "luxe-classics"],
    wardrobeIds: [3, 4, 9, 12],
    wishlistIds: [102, 104],
    wardrobeVisibility: PROFILE_VISIBILITY.PUBLIC,
    wishlistVisibility: PROFILE_VISIBILITY.PUBLIC
  }
];

const USER_ID_BY_NAME = Object.fromEntries(MOCK_USERS.map((u) => [u.name, u.id]));
const findUserById = (id) => MOCK_USERS.find((u) => u.id === id);

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
    id: 501,
    filter: "y2k",
    image: "https://i.pinimg.com/736x/d0/50/01/d050018a2250b92ba154b148d2d6e26f.jpg",
    user: "Vintage Finds",
    avatar: "https://i.pravatar.cc/150?u=v1",
    likes: 432,
    desc: "Throwback aesthetic for the weekend.",
    tags: ["y2k", "vintage"]
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
    id: 507,
    filter: "y2k",
    image: "https://img.ltwebstatic.com/v4/j/pi/2026/02/10/2d/17707311586d4e11f7e561bbebc27b6a8b83049aac_thumbnail_420x.webp",
    user: "Trend Setter",
    avatar: "https://i.pravatar.cc/150?u=v7",
    likes: 489,
    desc: "Bringing back the early 2000s.",
    tags: ["trendy", "y2k"]
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

const HAWAII_FEED = [
  {
    id: 901,
    filter: "beach-day",
    image: "https://i.pinimg.com/1200x/48/e8/a2/48e8a25b8d14b5260bbca92fb8195350.jpg",
    user: "Summer Ready",
    avatar: "https://i.pravatar.cc/150?u=v5",
    likes: 340,
    desc: "Bikini, oversized shirt, straw tote — barefoot to the water.",
    tags: ["hawaii", "beach", "swim"]
  },
  {
    id: 902,
    filter: "beach-day",
    image: "https://i.pinimg.com/1200x/d6/04/ad/d604ad4e4a3fe22e874347be6b0154c1.jpg",
    user: "Breezy Style",
    avatar: "https://i.pravatar.cc/150?u=v9",
    likes: 315,
    desc: "Cover-up over swim, sandals, sunnies. Pool to lounge chair.",
    tags: ["hawaii", "beach", "poolside"]
  },
  {
    id: 905,
    filter: "brunch",
    image: "https://i.pinimg.com/736x/d0/50/01/d050018a2250b92ba154b148d2d6e26f.jpg",
    user: "Tropical Brunch",
    avatar: "https://i.pravatar.cc/150?u=v1",
    likes: 528,
    desc: "Linen mini dress with raffia bag — beachside brunch with the girls.",
    tags: ["hawaii", "brunch", "linen"]
  },
  {
    id: 906,
    filter: "brunch",
    image: "https://i.pinimg.com/736x/c2/3d/6d/c23d6da086bd35893755ab8cb33ff280.jpg",
    user: "Island Chic",
    avatar: "https://i.pravatar.cc/150?u=v3",
    likes: 412,
    desc: "Crochet top + flowy skirt — daytime cafe energy.",
    tags: ["hawaii", "brunch", "crochet"]
  },
  {
    id: 903,
    filter: "resort-dinner",
    image: "https://farmrio.com/cdn/shop/files/348438_01.jpg?format=pjpg&v=1770068694&width=1080",
    user: "Tropical Vibes",
    avatar: "https://i.pravatar.cc/150?u=v2",
    likes: 891,
    desc: "Bold tropical print maxi for sunset cocktails at the resort.",
    tags: ["hawaii", "resort", "dinner"]
  },
  {
    id: 904,
    filter: "resort-dinner",
    image: "https://showmeyourmumu.com/cdn/shop/files/YI5XiqLg_1440x.progressive.jpg?v=1766090892",
    user: "Show Me Your Mumu",
    avatar: "https://i.pravatar.cc/150?u=mumu",
    likes: 1240,
    desc: "Floral mini dress and heeled sandals — dressy beach dinner.",
    tags: ["hawaii", "resort", "dressy"]
  },
  {
    id: 907,
    filter: "sunset-walk",
    image: "https://i.pinimg.com/1200x/d6/04/ad/d604ad4e4a3fe22e874347be6b0154c1.jpg",
    user: "Golden Hour",
    avatar: "https://i.pravatar.cc/150?u=v8",
    likes: 297,
    desc: "Slip dress and barefoot — golden hour shoreline stroll.",
    tags: ["hawaii", "sunset", "slip"]
  },
  {
    id: 908,
    filter: "sunset-walk",
    image: "https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg",
    user: "Easy Evening",
    avatar: "https://i.pravatar.cc/150?u=chic",
    likes: 363,
    desc: "Light cardigan over slip — breeze-ready after sundown.",
    tags: ["hawaii", "sunset", "evening"]
  }
];

const HAWAII_SCENES = [
  { label: "Beach Day", slug: "beach-day" },
  { label: "Brunch", slug: "brunch" },
  { label: "Resort Dinner", slug: "resort-dinner" },
  { label: "Sunset Walk", slug: "sunset-walk" }
];

const NEW_YORK_FEED = [
  {
    id: 911,
    filter: "office",
    image: "https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg",
    user: "Chic Style",
    avatar: "https://i.pravatar.cc/150?u=chic",
    likes: 612,
    desc: "Sharp tailored blazer + trousers — Monday meeting energy.",
    tags: ["newyork", "office", "tailored"]
  },
  {
    id: 912,
    filter: "office",
    image: "https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg",
    user: "Modern Minimal",
    avatar: "https://i.pravatar.cc/150?u=mod",
    likes: 844,
    desc: "Cashmere knit + sleek pants — polished office staple.",
    tags: ["newyork", "office", "minimal"]
  },
  {
    id: 913,
    filter: "coffee-run",
    image: "https://i.pinimg.com/736x/c2/3d/6d/c23d6da086bd35893755ab8cb33ff280.jpg",
    user: "Neutral Palette",
    avatar: "https://i.pravatar.cc/150?u=v3",
    likes: 554,
    desc: "Oversized sweater, denim, sneakers — casual SoHo coffee run.",
    tags: ["newyork", "casual", "coffee"]
  },
  {
    id: 914,
    filter: "coffee-run",
    image: "https://i.pinimg.com/736x/49/34/46/493446095e8d4f3d4e59263a866ebaba.jpg",
    user: "Everyday Chic",
    avatar: "https://i.pravatar.cc/150?u=v6",
    likes: 610,
    desc: "Trench + jeans — easy walk-around-the-block layer.",
    tags: ["newyork", "casual", "trench"]
  },
  {
    id: 915,
    filter: "night-out",
    image: "https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg",
    user: "Downtown Edge",
    avatar: "https://i.pravatar.cc/150?u=v7",
    likes: 712,
    desc: "Slinky black dress + heels — downtown bar after-hours.",
    tags: ["newyork", "night", "dress"]
  },
  {
    id: 916,
    filter: "night-out",
    image: "https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg",
    user: "Night Mode",
    avatar: "https://i.pravatar.cc/150?u=v9",
    likes: 488,
    desc: "Leather pants + silk top — late dinner reservation look.",
    tags: ["newyork", "night", "leather"]
  },
  {
    id: 917,
    filter: "gallery",
    image: "https://i.pinimg.com/1200x/72/35/1a/72351ac3f9cddc17159afe5490feb0b4.jpg",
    user: "Gallery Mood",
    avatar: "https://i.pravatar.cc/150?u=v2",
    likes: 392,
    desc: "Sculptural jacket + neutral palette — Chelsea opening night.",
    tags: ["newyork", "gallery", "art"]
  },
  {
    id: 918,
    filter: "gallery",
    image: "https://i.pinimg.com/1200x/96/8b/65/968b65eb73081db085aaeffc04f76546.jpg",
    user: "Art Walk",
    avatar: "https://i.pravatar.cc/150?u=v5",
    likes: 354,
    desc: "Wide-leg trousers + bold knit — gallery hop in style.",
    tags: ["newyork", "gallery", "knit"]
  }
];

const NEW_YORK_SCENES = [
  { label: "Office", slug: "office" },
  { label: "Coffee Run", slug: "coffee-run" },
  { label: "Night Out", slug: "night-out" },
  { label: "Gallery", slug: "gallery" }
];

const DEFAULT_FILTER_TAGS = [
  { label: "Y2K", slug: "y2k" },
  { label: "Going Out", slug: "going-out" },
  { label: "Minimalist", slug: "minimalist" },
  { label: "Coastal", slug: "coastal" }
];

const UPLOADED_ITEM_STYLE_FEED = [
  MOCK_FEED.find((item) => item.id === 401),
  MOCK_FEED.find((item) => item.id === 402),
  MOCK_FEED.find((item) => item.id === 503),
  MOCK_FEED.find((item) => item.id === 506),
  MOCK_FEED.find((item) => item.id === 302),
  MOCK_FEED.find((item) => item.id === 508)
].filter(Boolean).map((item, index) => ({
  ...item,
  id: 930 + index,
  tags: ["uploaded", "style", ...(item.tags || [])]
}));

// Attach userId to every feed item so cards can link to a profile.
[MOCK_FEED, NEW_YORK_FEED, UPLOADED_ITEM_STYLE_FEED].forEach((arr) => {
  arr.forEach((item) => {
    if (item && !item.userId) item.userId = USER_ID_BY_NAME[item.user];
  });
});

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
    category: "Tops",
    type: "ITEM"
  },
  {
    id: 105,
    brand: "Chic Style",
    name: "Minimalist Blazer Look",
    price: "Style",
    image: "https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg",
    category: "Styles",
    type: "STYLE"
  },
  {
    id: 106,
    brand: "Modern Minimal",
    name: "Cashmere & Denim",
    price: "Style",
    image: "https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg",
    category: "Styles",
    type: "STYLE"
  },
  {
    id: 107,
    brand: "Night Out",
    name: "Satin Slip Style",
    price: "Style",
    image: "https://img.ltwebstatic.com/v4/j/ssms/2025/12/08/98/176517802406eeaa10fc33833c369290b28242b73d_thumbnail_420x.webp",
    category: "Styles",
    type: "STYLE"
  }
];

const INSTAGRAM_SIGNAL_CARDS = [
  {
    title: "Follows",
    detail: "Taste graph"
  },
  {
    title: "Posts",
    detail: "Daily routine"
  },
  {
    title: "Full-body",
    detail: "Try-on base"
  },
  {
    title: "Wardrobe",
    detail: "Item extraction"
  }
];

const ONBOARDING_VOICE_QUESTIONS = [
  {
    id: "lifestyle",
    label: "Weekly routine",
    prompt: "What does your week usually look like?",
    explanation: "Like do you mostly go to work, school, gym, coffee shops, events, travel, or stay home a lot? This helps me understand what kinds of outfits actually fit your lifestyle.",
    voicePrompt: "What does your week usually look like? Like do you mostly go to work, school, gym, coffee shops, events, travel, or stay home a lot? This helps me understand what kinds of outfits actually fit your lifestyle.",
    placeholder: "Work, gym, coffee runs...",
    suggestions: ["School + gym", "Work + coffee runs", "Pickup kids + errands", "Remote work + dinners out"]
  },
  {
    id: "icon",
    label: "Style inspiration",
    prompt: "Who has a style you really love?",
    explanation: "Could be a celebrity, influencer, Pinterest vibe, or even a friend. This helps me understand your fashion taste and overall aesthetic.",
    voicePrompt: "Who has a style you really love? Could be a celebrity, influencer, Pinterest vibe, or even a friend. This helps me understand your fashion taste and overall aesthetic.",
    placeholder: "Hailey Bieber, Jennie, Bella Hadid...",
    suggestions: ["Hailey Bieber", "Jennie", "Bella Hadid", "Alix Earle"]
  },
  {
    id: "emotionalGoal",
    label: "Style goals",
    prompt: "Is there any style you’ve been wanting to try lately?",
    explanation: "Maybe dressing more feminine, more classy, less oversized, trying new trends, or just getting out of your comfort zone. This helps me explore new outfit ideas that still feel like you.",
    voicePrompt: "Is there any style you’ve been wanting to try lately? Maybe dressing more feminine, more classy, less oversized, trying new trends, or just getting out of your comfort zone. This helps me explore new outfit ideas that still feel like you.",
    placeholder: "More feminine, classy, new trends...",
    suggestions: ["More feminine", "Classy", "New trends", "Out of comfort zone"]
  }
];

const INSTAGRAM_SYNC_ITEMS = [
  {
    brand: "Instagram Save",
    name: "Cream zip knit",
    image: "https://i.pinimg.com/1200x/75/5a/98/755a98d93f917608e6eb73c2a77e7481.jpg",
    category: "Tops"
  },
  {
    brand: "Instagram Save",
    name: "Relaxed denim",
    image: "https://i.pinimg.com/1200x/80/03/27/8003277e7ed81a18ae2ce4279550ec77.jpg",
    category: "Bottoms"
  },
  {
    brand: "Instagram Save",
    name: "Suede shoulder bag",
    image: "https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg",
    category: "Bags"
  },
  {
    brand: "Instagram Save",
    name: "Clean white sneaker",
    image: "https://i.pinimg.com/736x/66/e9/47/66e9479e255e594de1f29fe1c3c27067.jpg",
    category: "Shoes"
  },
  {
    brand: "Instagram Save",
    name: "Rib tank dress",
    image: "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg",
    category: "Dresses"
  },
  {
    brand: "Instagram Save",
    name: "Gold hoop stack",
    image: "https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg",
    category: "Jewelry"
  }
];

const ONBOARDING_HERO_IMAGES = [
  "https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg",
  "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg",
  "https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg",
  "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg",
  "https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg"
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
    id: "m888",
    title: "Summer Weekend Look",
    date: "Yesterday",
    published: false,
    isResult: false,
    user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
    components: [
      { id: "c101", image: "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg" },
      { id: "c102", image: "https://i.pinimg.com/736x/98/8c/44/988c44232d4e09159f3820c238e3586c.jpg" },
      { id: "c103", image: "https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg" },
      { id: "c104", image: "https://i.pinimg.com/736x/66/e9/47/66e9479e255e594de1f29fe1c3c27067.jpg" }
    ]
  },
  {
    id: "m999",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    title: "Tropical Resort Mix",
    date: "2h ago",
    published: false,
    isResult: true,
    user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
    components: [
      { id: "c101", image: "https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg" },
      { id: "c102", image: "https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg" }
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
const discoveryStylistStore = createStore({
  reply: "Tell me the occasion and I will help style it.",
  tags: DEFAULT_FILTER_TAGS,
  source: "default"
});
const tryOnDraftStore = createStore({
  title: "",
  scenario: ""
});
const wardrobeUploadStore = createStore(null);
const wardrobeMainTabStore = createStore("Owned");
const tryOnStatusStore = createStore({
  phase: "idle",
  loadingText: "",
  profileNotificationCount: 0,
  runId: null
});
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
const wardrobeFilterStore = createStore("All");
const wardrobeWishlistFilterStore = createStore("Items");
const profileTabStore = createStore("closet");
const mixesSubTabStore = createStore("Generated");
const wardrobeNoticeStore = createStore(0);
const videoStylistStore = createStore(false);

const loadFromStorage = (key, fallback) => {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const persistedFollowedIds = loadFromStorage("faishion.followedUsers", []);
const persistedPrivacy = loadFromStorage("faishion.privacy", {
  wardrobe: PROFILE_VISIBILITY.PUBLIC,
  wishlist: PROFILE_VISIBILITY.PUBLIC
});
const followedUsersStore = createStore(Array.isArray(persistedFollowedIds) ? persistedFollowedIds : []);
const userPrivacyStore = createStore(persistedPrivacy);
const viewingProfileStore = createStore(null); // userId being viewed, or null

followedUsersStore.subscribe((s) => {
  try { window.localStorage.setItem("faishion.followedUsers", JSON.stringify(s)); } catch {}
});
userPrivacyStore.subscribe((s) => {
  try { window.localStorage.setItem("faishion.privacy", JSON.stringify(s)); } catch {}
});

const TRY_ON_RESULT_IMAGE = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80";

const AUTH_STORAGE_KEY = "faishion.authOnboarding";

const buildOnboardingProfile = (form, answers) => {
  const name = form.name.trim() || "Style Insider";
  const instagramHandle = (form.instagram.trim() || name.toLowerCase().replace(/\s+/g, "")).replace(/^@*/, "");
  return {
    name,
    email: form.email.trim(),
    instagramHandle: `@${instagramHandle || "styledaily"}`,
    answers
  };
};

const getStoredAuthState = () => ({
  completed: false,
  profile: null
});

const persistAuthState = (state) => {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // noop
  }
};

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

const startBackgroundTryOnRun = ({ garments, title = "My Try-on" }) => {
  const runId = Date.now();
  tryOnStatusStore.setState({
    phase: "generating",
    loadingText: "Analyzing fabric logic...",
    profileNotificationCount: 0,
    runId
  });

  window.setTimeout(() => {
    if (tryOnStatusStore.getState().runId !== runId) return;
    tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Mapping garment to body shape..." }));
  }, 1200);

  window.setTimeout(() => {
    if (tryOnStatusStore.getState().runId !== runId) return;
    tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Adjusting lighting and shadows..." }));
  }, 2400);

  window.setTimeout(() => {
    if (tryOnStatusStore.getState().runId !== runId) return;
    tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Finalizing photorealistic render..." }));
  }, 3600);

  window.setTimeout(() => {
    if (tryOnStatusStore.getState().runId !== runId) return;
    mixStore.setState([]);
    myPostsStore.setState((prev) => [
      {
        id: runId,
        image: TRY_ON_RESULT_IMAGE,
        title,
        date: "Just now",
        published: false,
        user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
        components: garments
      },
      ...prev.filter((post) => post.id !== runId)
    ]);
    tryOnStatusStore.setState((prev) => ({
      ...prev,
      phase: "result",
      loadingText: "Render complete",
      profileNotificationCount: 1
    }));
  }, 4500);
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

const getShoppingLinkForItem = (item) => {
  if (!item) {
    return "https://www.google.com/search?tbm=shop&q=women%27s+fashion";
  }
  if (item.link) {
    return item.link;
  }
  const searchTerm = [item.brand || item.user, item.name || item.desc || item.category]
    .filter(Boolean)
    .join(" ")
    .trim();
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchTerm || "women's fashion")}`;
};

const openShoppingLink = (item) => {
  const url = getShoppingLinkForItem(item);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return url;
};

function OutfitBento({ items }) {
  const images = (items || []).filter((item) => item.type === "image").map((item) => item.content || item.image || item);
  const len = images.length;
  if (len === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-[#999999] text-[10px] font-bold uppercase tracking-widest bg-[#f5f3ef]">
        Empty Try-on
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
        Empty Try-on
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
        <button onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
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
        <button onClick={handleBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
          <ArrowLeft size={20} />
        </button>
        <span className="font-serif text-[#1a1a1a] text-lg">Item Details</span>
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
              openShoppingLink(currentItem);
              showToast("Opening retailer site");
            }}
            className="w-full py-4 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          >
            <ShoppingCart size={16} /> SHOP NOW
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

const buildStylistShopOptions = (term) => [
  {
    label: "Google Shopping",
    brand: "Live Search",
    price: "Shop",
    href: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(term)}`
  },
  {
    label: "Pinterest Similar",
    brand: "Visual Match",
    price: "Moodboard",
    href: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(term)}`
  },
  {
    label: "Web Search",
    brand: "Search",
    price: "Compare",
    href: `https://www.google.com/search?q=${encodeURIComponent(term)}`
  }
];

const formatUploadItemName = (fileName = "") => {
  const clean = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  if (!clean) {
    return "Saved Piece";
  }
  return clean
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getPostBreakdown = (post) => {
  if (post.shoppingItems?.length) {
    return post.shoppingItems;
  }
  return MOCK_SHOP_ALL_ITEMS.slice(0, 4).map((item, index) => ({
    id: `${post.id || "post"}-${index}`,
    category: item.category,
    name: item.name,
    brand: item.brand,
    price: item.price,
    image: item.image,
    link: item.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${item.brand} ${item.name}`)}`,
    shopOptions: buildStylistShopOptions(`${item.brand} ${item.name}`)
  }));
};

function DiscoverySkillCardMedia({ item }) {
  const pieces = getPostBreakdown(item).slice(0, 4);

  return (
    <div className="flex gap-2.5 p-2.5">
      <div className="relative min-h-[260px] w-[43%] shrink-0 overflow-hidden rounded-[1.5rem] bg-[#ece6dc]">
        <img
          src={item.referenceImage || item.image}
          alt={item.title || item.sourceSkill || "Skill reference"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 rounded-[1.4rem] bg-white p-2">
        {pieces.map((piece) => (
          <div key={piece.id} className="overflow-hidden rounded-[1rem] border border-[#efe7dc] bg-[#faf7f2]">
            <div className="aspect-[0.92] overflow-hidden bg-white">
              <img src={piece.image} alt={piece.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingFeed({ aura, setActiveTab, uploadIntent, onUploadPromptSubmit, onCancelUpload }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUploadSuggestion, setSelectedUploadSuggestion] = useState(null);
  const [activeCommunityFilter, setActiveCommunityFilter] = useState("All");
  const [mixItems, setMixItems] = useGlobalMix();
  const [feedData, setFeedData] = useStore(feedStore);
  const [discoveryStylist, setDiscoveryStylist] = useStore(discoveryStylistStore);
  const [wishlist, toggleWishlist] = useWishlist();
  const [outfitsState] = useStore(outfitsStore);
  const localOutfits = outfitsState.outfits;
  const [inlineSearch, setInlineSearch] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [postHistory, setPostHistory] = useState([]);
  const [isStylistCollapsed, setIsStylistCollapsed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const postScrollRef = useRef(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const recognitionRef = useRef(null);
  const stylistCollapseTimerRef = useRef(null);

  const uploadPromptSuggestions = [
    { id: "shop", label: "Shop similar", prompt: "Find similar pieces I can buy." },
    { id: "style-inspo", label: "More like this", prompt: "Show me more influencer outfits with this style." },
    { id: "save-wardrobe", label: "Save as inspiration", prompt: "Save this as outfit inspiration and show me similar looks." },
    { id: "try-on", label: "Try on me", prompt: "Try this on me." }
  ];

  const showToast = (msg, action = null) => {
    setToastMessage({ msg, action });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeStylistMessage = discoveryStylist.reply;
  const filterTags = discoveryStylist.tags || DEFAULT_FILTER_TAGS;

  const buildQueryFeed = useCallback((query, lowerQuery) => {
    if (lowerQuery.includes("hawaii") || lowerQuery.includes("夏威夷")) {
      return {
        reply: "Hawaii has a few different vibes — I split it into the scenes you'll actually live in: Beach Day for swim + sun, Brunch for chic daytime, Resort Dinner for sunset cocktails, and Sunset Walk for breezy evenings. Tap a scene to filter.",
        items: HAWAII_FEED,
        tags: HAWAII_SCENES
      };
    }

    if (lowerQuery.includes("new york") || lowerQuery.includes("newyork") || lowerQuery.includes("nyc")) {
      return {
        reply: "NYC moves through a few scenes a day — I broke it down: Office for tailored mornings, Coffee Run for casual SoHo errands, Night Out for downtown dinners, and Gallery for art-walk energy. Tap a scene to filter.",
        items: NEW_YORK_FEED,
        tags: NEW_YORK_SCENES
      };
    }

    const scored = [...MOCK_FEED]
      .map((item) => {
        const haystack = [item.filter, item.user, item.desc, ...(item.tags || [])].join(" ").toLowerCase();
        const terms = lowerQuery.split(/\s+/).filter(Boolean);
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 2 : 0), 0) + (haystack.includes(lowerQuery) ? 3 : 0);
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    return {
      reply: `I pulled a fresh set of looks for ${query}.`,
      items: scored,
      tags: DEFAULT_FILTER_TAGS
    };
  }, []);

  const runStylistFeed = useCallback(
    (rawQuery) => {
      const query = rawQuery.trim();
      if (!query) {
        return;
      }

      const { reply, items, tags } = buildQueryFeed(query, query.toLowerCase());
      setDiscoveryStylist({
        reply,
        tags: tags || DEFAULT_FILTER_TAGS,
        source: "query"
      });
      setFeedData(items);
      setActiveCommunityFilter("All");
      setSearchQuery("");
    },
    [buildQueryFeed, setDiscoveryStylist, setFeedData]
  );

  const handleAskStylist = (e) => {
    e.preventDefault();
    if (uploadIntent) {
      const prompt = searchQuery.trim() || selectedUploadSuggestion?.prompt || "";
      if (!prompt) {
        return;
      }
      onUploadPromptSubmit({ prompt });
      setSelectedUploadSuggestion(null);
      setSearchQuery("");
      return;
    }
    runStylistFeed(searchQuery);
  };

  useEffect(() => {
    if (!uploadIntent) {
      setSelectedUploadSuggestion(null);
      return;
    }
    setSelectedUploadSuggestion(null);
    setSearchQuery("");
  }, [uploadIntent]);

  useEffect(() => {
    recognitionRef.current?.stop?.();
    return () => recognitionRef.current?.stop?.();
  }, []);

  useEffect(() => {
    setIsStylistCollapsed(false);
  }, [activeStylistMessage]);

  const collapseStylistReply = useCallback(() => {
    if (stylistCollapseTimerRef.current) {
      window.clearTimeout(stylistCollapseTimerRef.current);
      stylistCollapseTimerRef.current = null;
    }
    setIsStylistCollapsed(true);
  }, []);

  const handleInlineSearch = (item) => {
    setInlineSearch((prev) => ({ ...prev, [item.id]: { status: "scanning" } }));
    setTimeout(() => {
      const sourceItems = getPostBreakdown(item);
      const matches = sourceItems.slice(0, 3);
      setInlineSearch((prev) => ({
        ...prev,
        [item.id]: { status: "results", results: matches }
      }));
    }, 900);
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
    } else if (action === "Added to Try-on") {
      triggerFlyingAnimation(item.image, e);
      const combined = [{ id: Date.now(), image: item.image }, ...mixItems];
      setMixItems(combined);
      showToast("Added to Try-on");
    } else {
      showToast(action);
    }
    setContextMenu(null);
  };

  const handleCardClick = (item) => {
    if (!isLongPress.current && !contextMenu) {
      setPostHistory([item]);
    }
  };

  const toggleSelectedPostMix = () => {
    if (selectedPostItems.length === 0) {
      return;
    }

    if (isSelectedPostMixed) {
      const selectedImages = new Set(selectedPostItems.map((item) => item.image));
      setMixItems((prev) => prev.filter((item) => !selectedImages.has(item.image)));
      showToast("Removed from Try-on");
      return;
    }

    const itemsToAdd = selectedPostItems
      .filter((item) => !mixItems.some((mixItem) => mixItem.image === item.image))
      .map((item) => ({ id: Date.now() + Math.random(), image: item.image }));

    setMixItems((prev) => [...itemsToAdd, ...prev]);
    showToast("Items added to Try-on", {
      onClick: () => setActiveTab("tryon")
    });
  };

  const toggleSingleMixItem = (item, e) => {
    e.stopPropagation();
    const isAdded = mixItems.some((mixItem) => mixItem.image === item.image);

    if (isAdded) {
      setMixItems((prev) => prev.filter((mixItem) => mixItem.image !== item.image));
      showToast("Removed from Try-on");
      return;
    }

    setMixItems((prev) => [{ id: Date.now() + Math.random(), image: item.image }, ...prev]);
    triggerFlyingAnimation(item.image, e);
    showToast("Added to Try-on", {
      onClick: () => setActiveTab("tryon")
    });
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input is not supported on this device");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("");
      setSearchQuery(transcript);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      showToast("Voice input failed");
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const filteredFeed = feedData.filter((item) => activeCommunityFilter === "All" || item.filter === activeCommunityFilter);
  const selectedPost = postHistory[postHistory.length - 1] || null;
  const selectedPostItems = selectedPost ? getPostBreakdown(selectedPost) : [];
  const isSkillFeed = filteredFeed.length > 0 && filteredFeed.every((item) => item.renderAs === "skill_outfit");
  const ownedItems = selectedPostItems.filter((item) => item.source === "wardrobe");
  const recommendedItems = selectedPostItems.filter((item) => item.source !== "wardrobe");
  const isSelectedPostMixed =
    selectedPostItems.length > 0 &&
    selectedPostItems.every((item) => mixItems.some((mixItem) => mixItem.image === item.image));
  const hasTypedInput = searchQuery.trim().length > 0;
  const canSendComposer = uploadIntent ? hasTypedInput || Boolean(selectedUploadSuggestion) : hasTypedInput;

  return (
    <div className={`relative min-h-full bg-[#f5f3ef] ${uploadIntent ? "pb-64" : "pb-44"}`} onWheel={collapseStylistReply} onTouchMove={collapseStylistReply}>
      {toastMessage && (
        <div className="fixed left-1/2 top-32 z-[100] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 border border-white/10 cursor-pointer"
             onClick={() => { if (toastMessage.action) { toastMessage.action.onClick(); setToastMessage(null); } }}>
          <div className="flex items-center gap-1.5">
            {toastMessage.action ? (
              <>
                {toastMessage.msg?.includes("Wishlist Style") ? (
                  <>
                    {toastMessage.msg.split("Wishlist Style")[0]}
                    <span className="underline decoration-white/40 underline-offset-4 font-bold">Wishlist Style</span>
                  </>
                ) : toastMessage.msg?.includes("Try-on") ? (
                  <>
                    {toastMessage.msg.split("Try-on")[0]}
                    <span className="underline decoration-white/40 underline-offset-4 font-bold">Try-on</span>
                    {toastMessage.msg.split("Try-on")[1]}
                  </>
                ) : (
                  toastMessage.msg || toastMessage
                )}
                <span className="text-xs opacity-60 ml-1">→</span>
              </>
            ) : (toastMessage.msg || toastMessage)}
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-[#f5f3ef]/92 backdrop-blur-xl">
        <div className="px-4 pb-3 pt-12 sm:pt-14">
          <div className={`flex w-full gap-2.5 border border-[#ebe5db] bg-white px-3 shadow-[0_8px_26px_rgba(0,0,0,0.05)] transition-all duration-300 ${isStylistCollapsed ? "items-center rounded-full py-2" : "items-start rounded-[1.6rem] py-2.5"}`}>
            <div className="shrink-0">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-[#ebe5db] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80"
                  alt="Stylist avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-[12px] text-[#2b2723] transition-all duration-300 ${
                  isStylistCollapsed ? "truncate whitespace-nowrap" : "whitespace-normal break-words leading-5"
                }`}
              >
                {activeStylistMessage}
              </p>
            </div>
          </div>
        </div>

      </div>

      <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide animate-in slide-in-from-top-2">
            <button
              onClick={() => setActiveCommunityFilter("All")}
              className={`rounded-full px-5 py-1.5 text-xs font-bold whitespace-nowrap transition ${activeCommunityFilter === "All" ? "bg-[#1a1a1a] text-white" : "border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f3ef]"}`}
            >
              All
            </button>
            {filterTags.map((tag) => (
              <button
                key={tag.slug}
                onClick={() => setActiveCommunityFilter(tag.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition ${activeCommunityFilter === tag.slug ? "border-transparent bg-[#1a1a1a] text-white" : "border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f3ef]"}`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className={isSkillFeed ? "flex flex-col gap-4 px-4 pt-2" : "columns-2 gap-3 px-4 pt-2"}>
              {filteredFeed.map((item, index) => {
                const isLiked = localOutfits.some((o) => o.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative group flex flex-col ${isSkillFeed ? "" : "mb-4 break-inside-avoid"}`}
                  >
                    <div
                      className="relative cursor-pointer select-none overflow-hidden rounded-[2rem] bg-[#e6e2d6] shadow-sm transition-all duration-300 active:scale-[0.98] hover:shadow-md"
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
                      {item.renderAs === "skill_outfit" ? (
                        <DiscoverySkillCardMedia item={item} />
                      ) : (
                        <img src={item.image} alt="post" className="w-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                      )}

                      {/* Removed Heart button from feed cards per user request */}

                      {contextMenu === item.id && (
                        <div
                          className="absolute inset-0 z-20 animate-in fade-in duration-200 bg-black/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu(null);
                          }}
                        >
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-3xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Saved to Outfits", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] transition-colors hover:text-black">
                              <Bookmark size={14} />
                              <span className="text-[8px] font-bold uppercase tracking-wide">Save</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Try-on", item, e); }} className="flex flex-col items-center gap-0.5 rounded-full border-4 border-[#e6e2d6] bg-black p-2.5 text-white shadow-md transition-transform hover:scale-105 -mt-8">
                              <Layers size={14} />
                              <span className="mt-0.5 text-[8px] font-bold">Try-on</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("search", item, e); }} className="flex flex-col items-center gap-0.5 text-[#1a1a1a] transition-colors hover:text-black">
                              <Search size={14} />
                              <span className="text-[8px] font-bold uppercase tracking-wide">Similar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {inlineSearch[item.id] && (
                      <div className="relative z-10 mt-2 cursor-default rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-sm animate-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                        {inlineSearch[item.id].status === "scanning" ? (
                          <div className="flex flex-col items-center justify-center py-3">
                            <Loader2 size={18} className="mb-2 animate-spin text-[#999999]" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#999999]">Searching Google...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Search size={10} className="text-blue-500" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]">Shopping Options</span>
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
                                className="p-1 -mr-1 text-[#999999] transition-colors hover:text-[#1a1a1a]"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                              {inlineSearch[item.id].results.map((res) => (
                                <div
                                  key={res.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openShoppingLink(res);
                                  }}
                                  className="group flex w-16 shrink-0 cursor-pointer flex-col gap-1"
                                >
                                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#e5e5e5] bg-[#f5f3ef]">
                                    <img src={res.image} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt={res.name} />
                                  </div>
                                  <span className="w-full truncate text-[9px] font-bold text-[#1a1a1a]">{res.price}</span>
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

      {!selectedPost && (
        <div className="fixed bottom-6 left-[4.15rem] z-40 w-[calc(100%-5rem)] max-w-[304px]">
            {uploadIntent && (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {selectedUploadSuggestion ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUploadSuggestion(null);
                        setSearchQuery("");
                      }}
                      className="shrink-0 rounded-full border border-[#ded8cf] bg-white px-3 py-1.5 text-[12px] font-bold text-[#1a1a1a] shadow-sm"
                    >
                      Back
                    </button>
                    <button type="button" className="shrink-0 rounded-full bg-[#1a1a1a] px-4 py-1.5 text-[12px] font-bold text-white shadow-sm">
                      {selectedUploadSuggestion.label}
                    </button>
                  </>
                ) : (
                  uploadPromptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        setSelectedUploadSuggestion(suggestion);
                        setSearchQuery(suggestion.prompt);
                      }}
                      className="shrink-0 rounded-full border border-[#ded8cf] bg-white px-4 py-1.5 text-[12px] font-bold text-[#1a1a1a] shadow-sm transition active:scale-[0.98]"
                    >
                      {suggestion.label}
                    </button>
                  ))
                )}
              </div>
            )}

          <form onSubmit={handleAskStylist} className={`overflow-hidden border border-[#ebe5db] bg-white shadow-[0_8px_26px_rgba(0,0,0,0.05)] ${uploadIntent ? "rounded-[1.65rem]" : "rounded-full"}`}>
                  {uploadIntent && (
                    <div className="flex gap-2 px-3 pt-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f5f3ef] shadow-sm">
                        <img src={uploadIntent.previewUrl} alt="Uploaded preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUploadSuggestion(null);
                            setSearchQuery("");
                            onCancelUpload();
                          }}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/85 text-white"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
            <div className="flex items-center gap-2.5 px-3 py-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={uploadIntent ? "Ask about this photo..." : "Ask the stylist..."}
                      className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-[#2b2723] outline-none placeholder:text-[#999999]"
                    />
                    {canSendComposer ? (
                      <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800">
                        <Send size={14} />
                      </button>
                    ) : (
                      <button type="button" onClick={handleVoiceInput} className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isRecording ? "bg-[#1a1a1a] text-white" : "bg-[#f5f3ef] text-[#1a1a1a] hover:bg-[#ece7ff]"}`}>
                        {isRecording ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
                      </button>
                    )}
                  </div>
          </form>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#f5f3ef] animate-in slide-in-from-bottom-full duration-300">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e5e5] bg-[#f5f3ef] px-4 pb-4 pt-12 sm:pt-14">
            <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPostHistory((prev) => prev.slice(0, -1));
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white"
                >
                  <ArrowLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPost.userId) {
                    viewingProfileStore.setState(selectedPost.userId);
                  }
                }}
                disabled={!selectedPost.userId}
                className="group flex items-center gap-3 text-left transition active:scale-[0.98] disabled:cursor-default"
              >
                <img src={selectedPost.avatar || "https://i.pravatar.cc/150?u=default"} alt="avatar" className="h-10 w-10 rounded-full border border-[#e5e5e5] object-cover transition group-hover:opacity-80" />
                <div className="flex flex-col transition group-hover:opacity-80">
                  <span className="text-sm font-bold text-[#1a1a1a]">{selectedPost.user}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">10d ago</span>
                </div>
              </button>
            </div>
            <button onClick={() => setPostHistory([])} className="text-[#999999] transition hover:text-[#1a1a1a]">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-20" ref={postScrollRef}>
            {selectedPost.renderAs === "skill_outfit" ? (
              <div className="border-b border-[#e5e5e5] bg-white px-6 py-6">
                <div className="overflow-hidden rounded-[2rem] border border-[#eee6da] bg-[#f7f1e8] shadow-sm">
                  <div className="relative">
                    <img src={selectedPost.referenceImage || selectedPost.image} className="max-h-[46vh] w-full object-cover object-top" alt="reference" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex items-center gap-2 border-t border-[#eee6da] px-5 py-4">
                    {ownedItems.length > 0 && <div className="h-3 w-3 rounded-full bg-black" />}
                    {recommendedItems.length > 0 && <div className="h-3 w-3 rounded-full border border-[#1a1a1a] bg-white" />}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleSelectedPostMix}
                        className={isSelectedPostMixed ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#efe8ff] text-[#6c5ce7] shadow-md transition" : "flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-md transition hover:bg-gray-800 active:scale-95"}
                      >
                        {isSelectedPostMixed ? <Check size={18} /> : <Layers size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full bg-[#e6e2d6]">
                <img src={selectedPost.image} className="max-h-[60vh] w-full object-cover object-top" alt="post" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="p-6 pb-2">
              {selectedPost.renderAs !== "skill_outfit" && (
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-serif text-[#1a1a1a] whitespace-nowrap">Shop the look</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isSaved = localOutfits.some((o) => o.id === selectedPost.id);
                        if (isSaved) {
                          outfitsStore.setState((s) => ({ ...s, outfits: s.outfits.filter((o) => o.id !== selectedPost.id) }));
                          showToast("Removed from Wishlist");
                        } else {
                          addGlobalOutfit({
                            id: selectedPost.id,
                            title: selectedPost.title || `${selectedPost.user}'s Look`,
                            source: selectedPost.renderAs === "skill_outfit" ? `${selectedPost.sourceSkill} Skill` : "Saved from Discovery",
                            coverImage: selectedPost.image,
                            items: getPostBreakdown(selectedPost).map((c) => ({ type: "image", content: c.image })),
                            tags: [{ label: "Wishlist Style", classes: "bg-white border border-[#e5e5e5] text-[#1a1a1a]" }]
                          });
                          showToast("Saved to Wishlist Style", {
                            onClick: () => {
                              setActiveTab("profile");
                              profileTabStore.setState("wishlist");
                            }
                          });
                        }
                      }}
                      className={`p-2 transition-all ${
                        localOutfits.some((o) => o.id === selectedPost.id) ? "text-[#1a1a1a] " : "text-[#999999]"
                      }`}
                    >
                      <Bookmark size={24} fill={localOutfits.some((o) => o.id === selectedPost.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={toggleSelectedPostMix}
                      className={isSelectedPostMixed ? "flex items-center justify-center rounded-full bg-[#efe8ff] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6c5ce7] shadow-md transition whitespace-nowrap shrink-0" : "flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-gray-800 active:scale-95 whitespace-nowrap shrink-0"}
                    >
                      {isSelectedPostMixed ? <Check size={14} className="mr-1.5" /> : null}
                      {isSelectedPostMixed ? "Added" : "+Try-on"}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPostItems.map((item) => {
                  const isItemMixed = mixItems.some((mixItem) => mixItem.image === item.image);
                  return (
                  <div key={item.id} onClick={() => setSelectedShopItem(item)} className="group relative flex cursor-pointer flex-col gap-2 rounded-3xl border border-[#e5e5e5] bg-white p-2 shadow-sm">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e6e2d6]">
                      <img src={item.image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.name} />
                      {selectedPost.renderAs === "skill_outfit" && (
                        <div className={`absolute left-2 top-2 h-3.5 w-3.5 rounded-full shadow-sm ${
                          item.source === "wardrobe" ? "bg-black" : "border border-[#1a1a1a] bg-white"
                        }`} />
                      )}
                      <button
                        onClick={(e) => toggleSingleMixItem(item, e)}
                        className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
                          isItemMixed
                            ? "bg-[#efe8ff] text-[#6c5ce7]"
                            : "bg-white/92 text-[#1a1a1a] backdrop-blur hover:bg-white"
                        }`}
                      >
                        {isItemMixed ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                )})}
              </div>
              {selectedPost.renderAs === "skill_outfit" && (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      mixStore.setState(selectedPostItems.map((item) => ({ id: item.id, image: item.image, name: item.name })));
                      tryOnDraftStore.setState({
                        title: selectedPost.title || "Skill Look",
                        scenario: `Try this styled look on me: ${selectedPost.title || "Skill Look"}`
                      });
                      setPostHistory([]);
                      setActiveTab("tryon");
                    }}
                    className="flex-1 rounded-full bg-black px-5 py-4 text-white shadow-lg transition hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles size={18} />
                      <User size={18} />
                    </div>
                  </button>
                  {recommendedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstRecommended = recommendedItems[0];
                        if (firstRecommended) {
                          setSelectedShopItem(firstRecommended);
                        }
                      }}
                      className="rounded-full border border-[#dcd3c7] bg-white px-5 py-4 text-[#1a1a1a] shadow-sm transition hover:bg-[#f7f1e8]"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedShopItem && <ShopItemOverlay initialItem={selectedShopItem} onClose={() => setSelectedShopItem(null)} wishlist={wishlist} toggleWishlist={toggleWishlist} showToast={showToast} />}
    </div>
  );
}

function WardrobeTab({ aura, setActiveTab, embedded = false }) {
  const [wardrobe, setWardrobe] = useStore(wardrobeStore);
  const [uploadState, setUploadState] = useStore(wardrobeUploadStore);
  const [showFilters, setShowFilters] = useState(true);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const categories = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Bags", "Jewelry"];
  const [activeCategory, setActiveCategory] = useStore(wardrobeFilterStore);
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
  const [activeMainTab, setActiveMainTab] = useStore(wardrobeMainTabStore);
  const [wishlist, toggleWishlist, setWishlistState] = useWishlist();
  const [activeMenu, setActiveMenu] = useState(null);
  const [wishlistFilter, setWishlistFilter] = useStore(wardrobeWishlistFilterStore);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (viewingItemScrollRef.current) {
      viewingItemScrollRef.current.scrollTop = 0;
    }
  }, [viewHistory]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
  const filteredWishlist = activeCategory === "All" 
    ? wishlist 
    : (activeCategory === "Styles" 
        ? wishlist.filter((item) => item.type === "STYLE")
        : wishlist.filter((item) => item.category === activeCategory)
      );

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
    if (action === "Added to Try-on" && item) {
      triggerFlyingAnimation(item.image, e);
      const combined = [{ id: Date.now(), image: item.image }, ...mixItems];
      setMixItems(combined);
      showToast("Added to Try-on");
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
      {toastMessage && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap border border-white/10 cursor-pointer"
             onClick={() => { if (toastMessage.action) { toastMessage.action.onClick(); setToastMessage(null); } }}>
          <div className="flex items-center gap-1.5">
            {toastMessage.action ? (
              <>
                {toastMessage.msg?.includes("Try-on") ? (
                  <>
                    {toastMessage.msg.split("Try-on")[0]}
                    <span className="underline decoration-white/40 underline-offset-4 font-bold">Try-on</span>
                    {toastMessage.msg.split("Try-on")[1]}
                  </>
                ) : toastMessage.msg}
                <span className="text-xs opacity-60 ml-1">→</span>
              </>
            ) : (toastMessage.msg || toastMessage)}
          </div>
        </div>
      )}
      {!embedded && (
      <div className="sticky top-0 z-30 flex flex-col bg-[#f5f3ef]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 sm:pt-14">
          <button
            type="button"
            onClick={() => setActiveTab?.("trending")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-3xl font-serif italic text-[#1a1a1a]">Closet</h2>
        </div>
        <div className="px-4 pb-2">
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
                { id: "Owned", label: "Owned" },
                { id: "Wishlist", label: "Wishlist" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex-1 relative pb-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeMainTab === tab.id ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-transparent text-[#999999] hover:text-[#1a1a1a]"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
      {!embedded && aura.auraMessage && !isSearchFocused && (
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
          {activeMainTab === "Owned" && !embedded && (
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
          {activeMainTab === "Wishlist" && !embedded && (
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
            {activeMainTab === "Owned" && (
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
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Try-on", item, e); }} className="flex flex-col items-center gap-0.5 bg-black text-white rounded-full p-2 -mt-6 shadow-md hover:scale-105 transition-transform border-4 border-[#e6e2d6]">
                              <Layers size={12} />
                              <span className="text-[7px] font-bold mt-0.5">Try-on</span>
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
                                    openShoppingLink(res);
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
              <div className="grid grid-cols-2 gap-4">
                {filteredWishlist.map((item) => (
                  <div key={item.id} className={`flex flex-col relative transition-all ${activeMenu === item.id ? "z-[50]" : "z-0"}`}>
                    <div
                      className={`${activeCategory === "Styles" ? "aspect-[3/4]" : "aspect-[4/5]"} bg-[#e6e2d6] rounded-md relative mb-3 overflow-hidden active:scale-[0.98] transition-transform duration-200 select-none cursor-pointer`}
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
                            <button onClick={(e) => { e.stopPropagation(); handleMenuAction("Added to Try-on", item, e); }} className="flex flex-col items-center gap-0.5 bg-black text-white rounded-full p-2 -mt-6 shadow-md hover:scale-105 transition-transform border-4 border-[#e6e2d6]">
                              <Layers size={12} />
                              <span className="text-[7px] font-bold mt-0.5">Try-on</span>
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
                          <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest font-serif">{item.brand}</p>
                          <p className="text-[13px] text-[#4a4a4a] mt-0.5 line-clamp-1">{item.name}</p>
                        </div>
                        {item.type !== "STYLE" && (
                          <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)} className="text-[#999999] hover:text-[#1a1a1a] p-1 -mt-1 -mr-1 rounded-full transition-colors shrink-0">
                            <MoreHorizontal size={18} />
                          </button>
                        )}
                      </div>
                      {item.type !== "STYLE" && <p className="text-[#1a1a1a] text-sm mt-1">{item.price}</p>}
                      {activeMenu === item.id && (
                        <div className="absolute bottom-8 right-0 w-44 bg-white rounded-2xl shadow-xl border border-[#e5e5e5] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openShoppingLink(item);
                              showToast("Opening retailer site");
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <ShoppingCart size={16} /> Shop now
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction("Added to Try-on", item, e);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f5f3ef] flex items-center gap-2"
                          >
                            <Layers size={16} /> Add to Try-on
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
          </div>
        </>
      )}
      {uploadState === "selecting" && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in" onClick={() => setUploadState(null)} />
          <div className="bg-[#f5f3ef] rounded-t-[3rem] p-6 relative z-10 animate-in slide-in-from-bottom-full duration-300 pb-safe">
            <div className="w-12 h-1.5 bg-[#d1d1d1] rounded-full mx-auto mb-6" />
            <h3 className="font-serif text-[#1a1a1a] text-xl mb-4 text-center">{activeMainTab === "Wishlist" ? "Save an Item" : "Add Item"}</h3>
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
            <button onClick={() => { if (viewHistory.length > 1) setViewHistory(viewHistory.slice(0, -1)); else setViewHistory([]); }} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
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
                  openShoppingLink(viewingItem);
                  showToast("Opening retailer site");
                }}
                className="w-full py-4 mt-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-[0.98] shadow-md"
              >
                <ShoppingCart size={16} /> SHOP NOW
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingOutfit && !editingOutfit && (
        <div className="fixed inset-0 z-[55] bg-[#f5f3ef] flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 sticky top-0 z-10 bg-[#f5f3ef] border-b border-[#e5e5e5]">
            <button onClick={() => setViewingOutfit(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
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
                    setMixItems((prev) => [...newItems, ...prev]);
                    showToast("Items added to Try-on");
                  }}
                  className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md hover:bg-gray-800 transition active:scale-95 whitespace-nowrap"
                >
                  <Plus size={14} /> Try-on
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

function TryOnTab({ setActiveTab, returnTab }) {
  const [modelImg, setModelImg] = useState("https://cizaro.net/cdn/shop/files/CZ-MF-10369-_7.jpg?v=1769085672&width=1000");
  const fileInputRef = useRef(null);
  const [garments, setGarments] = useGlobalMix();
  const [scenario, setScenario] = useState("");
  const [tryOnDraft, setTryOnDraft] = useStore(tryOnDraftStore);
  const resultImg = TRY_ON_RESULT_IMAGE;
  const [toastMessage, setToastMessage] = useState(null);
  const [isSavedMix, setIsSavedMix] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const [, setFeedData] = useStore(feedStore);
  const [myPosts, setMyPosts] = useStore(myPostsStore);
  const [tryOnStatus, setTryOnStatus] = useStore(tryOnStatusStore);
  const [lastSavedDraftId, setLastSavedDraftId] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [wardrobe] = useStore(wardrobeStore);
  const [wishlist, setWishlistState] = useStore(wishlistStore);
  const step = tryOnStatus.phase || "setup";
  const loadingText = tryOnStatus.loadingText;

  const showToast = (msg, action = null) => {
    setToastMessage({ msg, action });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    // Force sync with global store on mount
    const currentGlobal = mixStore.getState();
    if (currentGlobal.length > 0 && garments.length === 0) {
      setGarments(currentGlobal);
    }
  }, []);

  useEffect(() => {
    setIsSavedMix(false);
  }, [garments]);

  useEffect(() => {
    if (tryOnDraft.scenario) {
      setScenario(tryOnDraft.scenario);
    }
  }, [tryOnDraft.scenario]);

  const handleGenerate = () => {
    const runId = Date.now();
    const garmentSnapshot = garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }));
    const scenarioSnapshot = scenario;
    setTryOnStatus({
      phase: "generating",
      loadingText: "Analyzing fabric logic...",
      profileNotificationCount: 0,
      runId
    });
    setActiveTab(returnTab);

    window.setTimeout(() => {
      if (tryOnStatusStore.getState().runId !== runId) return;
      tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Mapping garment to body shape..." }));
    }, 1200);
    window.setTimeout(() => {
      if (tryOnStatusStore.getState().runId !== runId) return;
      tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Adjusting lighting and shadows..." }));
    }, 2400);
    window.setTimeout(() => {
      if (tryOnStatusStore.getState().runId !== runId) return;
      tryOnStatusStore.setState((prev) => ({ ...prev, loadingText: "Finalizing photorealistic render..." }));
    }, 3600);
    window.setTimeout(() => {
      if (tryOnStatusStore.getState().runId !== runId) return;
      setGarments([]);
      setTryOnDraft({ title: "", scenario: "" });
      myPostsStore.setState((prev) => [
        {
          id: runId,
          image: resultImg,
          title: tryOnDraft.title || scenarioSnapshot || "My Try-On Mix",
          date: "Just now",
          published: false,
          isResult: true,
          user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
          components: garmentSnapshot
        },
        ...prev.filter((post) => post.id !== runId)
      ]);
      tryOnStatusStore.setState((prev) => ({
        ...prev,
        phase: "result",
        loadingText: "Render complete",
        profileNotificationCount: 1
      }));
    }, 4500);
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
        {toastMessage && (
          <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap border border-white/10"
               onClick={() => { if (toastMessage.action) { toastMessage.action.onClick(); setToastMessage(null); } }}>
            <div className="flex items-center gap-2">
              {toastMessage.action ? (
                <>
                  {toastMessage.msg}
                  <span className="text-xs opacity-60">→</span>
                </>
              ) : (toastMessage.msg || toastMessage)}
            </div>
          </div>
        )}
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
                  isResult: false,
                  user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
                  components: garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }))
                },
                ...prev
              ]);
              showToast("Saved to My Mixes");
              // Reset try-on state and notification
              tryOnStatusStore.setState({ phase: "setup", profileNotificationCount: 0 });
              setGarments([]);
              setScenario("");
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
                  user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
                  components: garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }))
                },
                ...prev
              ]);
              setFeedData((prev) => [
                {
                  id: newPostId,
                  image: resultImg,
                  user: "Alex Schwan",
                  avatar: "https://i.pravatar.cc/150?u=chic",
                  likes: 0,
                  desc: scenario || "My latest virtual try-on mix! ✨",
                  tags: ["ai", "tryon"]
                },
                ...prev
              ]);
              showToast("Posted to Community!");
              // Reset try-on state and notification
              tryOnStatusStore.setState({ phase: "setup", profileNotificationCount: 0 });
              setGarments([]);
              setScenario("");
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
      {toastMessage && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap border border-white/10 cursor-pointer"
             onClick={() => { if (toastMessage.action) { toastMessage.action.onClick(); setToastMessage(null); } }}>
          <div className="flex items-center gap-1.5">
            {toastMessage.action ? (
              <>
                {toastMessage.msg?.includes("Try-on") ? (
                  <>
                    {toastMessage.msg.split("Try-on")[0]}
                    <span className="underline decoration-white/40 underline-offset-4 font-bold">Try-on</span>
                    {toastMessage.msg.split("Try-on")[1]}
                  </>
                ) : toastMessage.msg}
                <span className="text-xs opacity-60 ml-1">→</span>
              </>
            ) : (toastMessage.msg || toastMessage)}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 bg-[#f5f3ef] sticky top-0 z-20 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-3xl font-serif italic text-[#1a1a1a]">Try-on</h2>
        </div>
        <div className="relative">
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
          <button onClick={() => setIsViewingPhoto(true)} className="w-10 h-10 rounded-full overflow-hidden border border-[#e5e5e5] shadow-sm hover:opacity-80 transition active:scale-95">
            <img src={modelImg} className="w-full h-full object-cover" alt="Try-on" />
          </button>
        </div>
      </div>
      <div className="p-4 animate-in fade-in duration-300 mt-2">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Outfit Pieces · {garments.length}</p>
          {garments.length > 0 && (
            <button onClick={() => setGarments([])} className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest hover:text-red-500 transition">
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {garments.map((g) => {
            const matchedItem = [...wardrobe, ...wishlist].find((w) => w.image === g.image) || {
              id: g.id,
              brand: "Custom Item",
              name: "Garment",
              image: g.image,
              category: "Apparel"
            };
            return (
              <div key={g.id} onClick={() => setSelectedShopItem(matchedItem)} className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-sm group cursor-pointer">
                <img src={g.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Garment" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setGarments(garments.filter((item) => item.id !== g.id));
                  }} 
                  className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#1a1a1a] shadow-sm hover:bg-white transition border border-black/5"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          <button 
            onClick={() => {
              setActiveTab("closet");
              wardrobeMainTabStore.setState("Owned");
            }}
            className="aspect-[3/4] bg-white border border-dashed border-[#d1d1d1] rounded-3xl flex flex-col items-center justify-center text-[#999999] hover:border-black hover:text-black transition gap-2 active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Add More</span>
          </button>
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
                showToast("Add items to save draft");
                return;
              }
              
              if (isSavedMix && lastSavedDraftId) {
                // Unsave logic
                setMyPosts((prev) => prev.filter(p => p.id !== lastSavedDraftId));
                setIsSavedMix(false);
                setLastSavedDraftId(null);
                showToast("Removed from Drafts");
              } else {
                // Save logic
                const draftId = Date.now();
                setMyPosts((prev) => [
                  {
                    id: draftId,
                    image: garments[0].image,
                    title: scenario || "Try-on Draft",
                    date: "Just now",
                    published: false,
                    user: { name: "Alex Schwan", avatar: "https://i.pravatar.cc/150?u=chic" },
                    components: garments.map((g) => ({ id: g.id, image: g.image, name: g.name || "Garment" }))
                  },
                  ...prev
                ]);
                setIsSavedMix(true);
                setLastSavedDraftId(draftId);
                showToast("Saved to Try-on Drafts", {
                  onClick: () => {
                    setActiveTab("profile");
                    profileTabStore.setState("mixes");
                    mixesSubTabStore.setState("Drafts");
                  }
                });
                // Clear inputs after saving draft
                setGarments([]);
                setScenario("");
                setIsSavedMix(false);
              }
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
          <div className="flex justify-between items-center px-4 pt-12 pb-4 sm:pt-14 border-b border-[#e5e5e5] sticky top-0 z-10">
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
      {selectedShopItem && (
        <ShopItemOverlay 
          initialItem={selectedShopItem} 
          onClose={() => setSelectedShopItem(null)} 
          wishlist={wishlist} 
          toggleWishlist={(item) => {
            if (wishlist.some(i => i.id === item.id)) {
              setWishlistState(wishlist.filter(i => i.id !== item.id));
            } else {
              setWishlistState([item, ...wishlist]);
            }
          }} 
          showToast={showToast} 
        />
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

function PrivacySubView({ onBack }) {
  const [privacy] = useStore(userPrivacyStore);

  const options = [
    { value: PROFILE_VISIBILITY.PUBLIC, label: "Public", sub: "Anyone", Icon: Globe },
    { value: PROFILE_VISIBILITY.FOLLOWERS, label: "Followers", sub: "People you follow", Icon: User },
    { value: PROFILE_VISIBILITY.PRIVATE, label: "Private", sub: "Only you", Icon: Lock }
  ];

  const update = (key, value) => {
    userPrivacyStore.setState((s) => ({ ...s, [key]: value }));
  };

  const Section = ({ keyName, label, desc }) => (
    <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden p-5">
      <div className="mb-3">
        <p className="text-sm font-bold text-[#1a1a1a]">{label}</p>
        <p className="mt-1 text-[11px] text-[#999999]">{desc}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, label: oLabel, sub, Icon }) => {
          const active = privacy[keyName] === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => update(keyName, value)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition active:scale-[0.98] ${
                active ? "border-black bg-[#1a1a1a] text-white" : "border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f3ef]"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[11px] font-bold">{oLabel}</span>
              <span className={`text-[9px] text-center leading-tight ${active ? "text-white/70" : "text-[#999999]"}`}>{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <SubView title="Privacy" onBack={onBack}>
      <div className="space-y-5">
        <p className="px-2 text-[12px] text-[#6B655F] leading-snug">
          Choose who can see each section of your public profile. Posts you publish stay visible to everyone who can see your profile. Mixes follow each post&apos;s visibility.
        </p>
        <Section keyName="wardrobe" label="Wardrobe" desc="Items in your closet." />
        <Section keyName="wishlist" label="Wishlist" desc="Items you have saved." />
      </div>
    </SubView>
  );
}

function ProfileTab({ setActiveTab, aura }) {
  const [view, setView] = useState("main");
  const [wardrobe] = useStore(wardrobeStore);
  const [profileTab, setProfileTab] = useStore(profileTabStore);
  const [preferences, setPreferences] = useState(["Minimal", "Feminine", "Street"]);
  const [newStyle, setNewStyle] = useState("");
  const [userProfile, setUserProfile] = useState({
    name: "Alex Schwan",
    handle: "alex",
    email: "alexandria.schwan@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=chic"
  });
  const avatarInputRef = useRef(null);
  const [, setFeedData] = useStore(feedStore);
  const [myPosts, setMyPosts] = useStore(myPostsStore);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [wishlist, toggleWishlist] = useWishlist();
  const [activeCategory, setActiveCategory] = useStore(wardrobeFilterStore);
  const [wishlistFilter, setWishlistFilter] = useStore(wardrobeWishlistFilterStore);
  const [activeSubTab, setActiveSubTab] = useStore(mixesSubTabStore);
  const [outfitsState] = useStore(outfitsStore);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  if (view === "privacy") {
    return <PrivacySubView onBack={() => setView("settings")} />;
  }

  if (view === "settings") {
    return (
      <SubView title="Settings" onBack={() => setView("main")}>
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-3 px-2">Account</p>
            <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden divide-y divide-[#e5e5e5]">
              <ListItem icon={<User size={18} className="text-[#1a1a1a]" />} title="Account Info" subtitle="Update your details" onClick={() => setView("accountInfo")} />
              <ListItem icon={<Lock size={18} className="text-[#1a1a1a]" />} title="Privacy" subtitle="Who can see your profile" onClick={() => setView("privacy")} />
              <ListItem icon={<CreditCard size={18} className="text-[#1a1a1a]" />} title="Billing" subtitle="Manage subscription" onClick={() => setView("billing")} />
              <ListItem icon={<Gift size={18} className="text-[#1a1a1a]" />} title="Referrals" subtitle="Invite friends, earn credits" onClick={() => setView("referrals")} />
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
    <div className="bg-white min-h-full pb-24 relative">
      {/* Xiaohongshu-style Gradient Header Background */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#f5f5f7] to-white pointer-events-none" />
      
      {toastMessage && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap border border-white/10 cursor-pointer"
             onClick={() => { if (toastMessage.action) { toastMessage.action.onClick(); setToastMessage(null); } }}>
          <div className="flex items-center gap-1.5">
            {toastMessage.action ? (
              <>
                {toastMessage.msg?.includes("Wishlist Style") ? (
                  <>
                    {toastMessage.msg.split("Wishlist Style")[0]}
                    <span className="underline decoration-white/40 underline-offset-4 font-bold">Wishlist Style</span>
                  </>
                ) : toastMessage.msg}
                <span className="text-xs opacity-60 ml-1">→</span>
              </>
            ) : (toastMessage.msg || toastMessage)}
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-center px-4 pt-10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur text-[#333] shadow-sm active:scale-95 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 text-[#333] active:opacity-60 transition"><Share2 size={22} /></button>
            <button onClick={() => setView("settings")} className="p-2 text-[#333] active:opacity-60 transition">
              <Settings size={22} />
            </button>
          </div>
        </div>

        <div className="px-5 flex items-center gap-6 pt-2 pb-6">
          <div onClick={() => avatarInputRef.current?.click()} className="relative shrink-0 cursor-pointer">
            <div className="w-[82px] h-[82px] rounded-full overflow-hidden border-2 border-white shadow-md bg-[#f0f0f0]">
              {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center bg-[#e6e2d6] text-3xl font-serif">{userProfile.name.charAt(0)}</div>}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#ffdb00] rounded-full border-2 border-white flex items-center justify-center text-[#1a1a1a]">
              <Plus size={14} strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-[22px] font-bold text-[#333] leading-tight mb-0.5">{userProfile.name}</h2>
            <p className="text-[12px] text-[#999] mb-3">@{userProfile.handle}</p>
          </div>
        </div>

        <div className="px-5 flex gap-8 pb-6 text-[14px] font-medium text-[#333]">
          <div className="flex flex-col items-start">
            <span className="font-bold text-[18px]">{myPosts.length}</span>
            <span className="text-[#999] text-[12px]">Posts</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-[18px]">1.2k</span>
            <span className="text-[#999] text-[12px]">Followers</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-[18px]">342</span>
            <span className="text-[#999] text-[12px]">Following</span>
          </div>
        </div>

        {/* Xiaohongshu-style Tab Bar (Text Only for clarity) */}
        <div className="relative flex w-full border-b border-[#f2f2f2] bg-white sticky top-0 z-20">
          {[
            { id: "mixes", label: "Try-ons" },
            { id: "wishlist", label: "Wishlist" },
            { id: "closet", label: "Owned" },
            { id: "published", label: "Published" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setProfileTab(tab.id);
                if (tab.id === "closet") wardrobeMainTabStore.setState("Owned");
                if (tab.id === "wishlist") wardrobeMainTabStore.setState("Wishlist");
              }}
              className={`flex-1 flex flex-col items-center justify-center py-4 transition-colors relative ${
                profileTab === tab.id ? "text-[#333]" : "text-[#999]"
              }`}
            >
              <span className={`text-[14px] transition-all ${profileTab === tab.id ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
              {profileTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff2442] rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        {/* Xiaohongshu-style Integrated Category Filter (Replacing Secondary Info Bar) */}
        {profileTab === "closet" && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-[#f9f9f9] scrollbar-hide items-center">
            {["All", "Tops", "Bottoms", "Dresses", "Shoes", "Bags", "Jewelry"].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${isActive ? "bg-[#1a1a1a] text-white" : "bg-[#f5f5f7] text-[#999] hover:text-[#333]"}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
        {profileTab === "wishlist" && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-[#f9f9f9] scrollbar-hide items-center">
            {["All", "Styles", "Tops", "Bottoms", "Dresses", "Shoes", "Bags", "Jewelry"].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${isActive ? "bg-[#1a1a1a] text-white" : "bg-[#f5f5f7] text-[#999] hover:text-[#333]"}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
        {profileTab === "mixes" && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-[#f9f9f9] scrollbar-hide items-center">
            {[
              { label: "Generated", count: myPosts.filter(p => !p.published && p.isResult).length },
              { label: "Drafts", count: myPosts.filter(p => !p.published && !p.isResult).length }
            ].map((item) => {
              const isActive = activeSubTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveSubTab(item.label)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                    isActive ? "bg-[#1a1a1a] text-white" : "bg-[#f5f5f7] text-[#999] hover:text-[#333]"
                  }`}
                >
                  {item.label} {item.count}
                </button>
              );
            })}
          </div>
        )}

      </div>

      <div className={profileTab === "closet" || profileTab === "wishlist" ? "bg-white px-2" : "px-2 bg-white"}>
        {profileTab === "closet" && <WardrobeTab aura={aura} embedded />}
        
        {profileTab === "wishlist" && (
          <div className="pt-4 pb-20">
            <div className="grid grid-cols-2 gap-3">
              {[
                ...outfitsState.outfits
                  .filter(o => o.tags?.some(t => t.label === "Wishlist Style"))
                  .map(o => ({ ...o, type: "STYLE", isWishlist: true })),
                ...wardrobe.filter(i => {
                  if (!i.wishlist) return false;
                  if (activeCategory === "All") return true;
                  if (activeCategory === "Styles") return false;
                  return i.category === activeCategory;
                }).map(i => ({ ...i, type: "ITEM", isWishlist: true }))
              ]
              .sort((a, b) => b.id - a.id)
              .map((item) => {
                if (item.type === "STYLE") {
                  return (
                    <div key={`style-${item.id}`} className="relative aspect-[3/4] bg-[#f0f0f0] rounded-2xl overflow-hidden shadow-sm border border-[#f0f0f0] group cursor-pointer active:scale-[0.98] transition-transform">
                      <img src={item.coverImage || (item.items[0]?.content)} className="w-full h-full object-cover" alt={item.title} referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-[10px] font-bold text-white line-clamp-1">{item.title}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={`item-${item.id}`} className="flex flex-col cursor-pointer active:scale-[0.98] transition-all relative">
                    <div className="aspect-[4/5] bg-[#e6e2d6] rounded-2xl shadow-sm hover:shadow-md transition-shadow relative mb-2 overflow-hidden select-none">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                    </div>
                    <div className="px-1 flex flex-col">
                      <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest truncate">{item.brand}</p>
                      <p className="text-[12px] text-[#4a4a4a] mt-0.5 line-clamp-1">{item.name}</p>
                      <p className="text-[12px] font-bold text-[#1a1a1a] mt-1">{item.price || "$--"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {profileTab === "mixes" && (
          <div className="grid grid-cols-2 gap-3 px-2 pt-4">
            {myPosts.filter((p) => {
              if (p.published) return false;
              if (activeSubTab === "Generated") return p.isResult;
              if (activeSubTab === "Drafts") return !p.isResult;
              return false;
            }).map((post) => {
              const isDraft = !post.isResult;
              return (
                <div 
                  key={post.id} 
                  className="relative aspect-[3/4] bg-[#f0f0f0] rounded-2xl overflow-hidden shadow-sm border border-[#f0f0f0] group cursor-pointer active:scale-[0.98] transition-transform" 
                  onClick={() => { 
                    if (isDraft) {
                      // Restore draft to editor
                      mixStore.setState(post.components || []);
                      tryOnDraftStore.setState({ title: post.title, scenario: post.title === "Try-on Draft" ? "" : post.title });
                      setActiveTab("tryon");
                    } else {
                      setEditingPost(post); 
                      setIsEditMode(false); 
                    }
                  }}
                >
                  {isDraft ? (
                    <div className="w-full h-full p-2 grid grid-cols-2 gap-1 bg-[#e6e2d6]/30">
                      {post.components?.slice(0, 4).map((comp, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden bg-white shadow-sm border border-white/50">
                          <img src={comp.image} className="w-full h-full object-cover" alt="component" />
                        </div>
                      ))}
                      {(!post.components || post.components.length === 0) && (
                        <div className="col-span-2 flex items-center justify-center h-full text-[10px] font-bold text-[#999] uppercase tracking-widest">No Items</div>
                      )}
                      {post.components?.length > 4 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">+{post.components.length - 4}</div>
                      )}
                    </div>
                  ) : (
                    <img src={post.image} className="w-full h-full object-cover" alt={post.title} referrerPolicy="no-referrer" />
                  )}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] font-bold text-white line-clamp-1">{isDraft ? "Draft: " + post.title : post.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {profileTab === "published" && (
          <div className="columns-2 gap-3 px-2 pt-4">
            {myPosts.filter((p) => p.published).map((post) => (
              <div key={post.id} className="mb-3 break-inside-avoid relative rounded-2xl overflow-hidden bg-[#f0f0f0] border border-[#f0f0f0] cursor-pointer group active:scale-[0.98] transition-transform" onClick={() => { setEditingPost(post); setIsEditMode(false); }}>
                <img src={post.image} className="w-full object-cover" alt="post" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#1a1a1a] shadow-sm">
                  <MoreHorizontal size={14} />
                </div>
              </div>
            ))}
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
    (text = inputText, attachedOverride = null) => {
      const resolvedAttachedImages = attachedOverride ?? attachedImages;
      if (!text.trim() && resolvedAttachedImages.length === 0) {
        return;
      }
      if (resolvedAttachedImages.length > 0 && !text.trim()) {
        if (resolvedAttachedImages.length === 1) {
          setUploadedImage(resolvedAttachedImages[0]);
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
      const currentAttached = resolvedAttachedImages;
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
    const combined = [{ id: Date.now(), image: item.image }, ...mixItems];
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
                <button
                  onClick={() => openShoppingLink(viewingItem)}
                  className="w-full py-4 mt-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-[0.98] shadow-md"
                >
                  <ShoppingCart size={16} /> SHOP NOW
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

const inferUploadIntentAction = (prompt) => {
  const text = prompt.toLowerCase();
  if (/\b(try on|try-on|on me|wear it|fit check|virtual fit)\b/.test(text)) {
    return "try-on";
  }
  if (/\b(buy|shop|link|url|where to get|find this item|purchase|similar item)\b/.test(text)) {
    return "shop";
  }
  if (/\b(save|keep|bookmark).*\b(inspiration|moodboard|style|look)\b|\b(save|add).*\b(wardrobe|closet)\b|\b(wardrobe|closet).*\b(save|add)\b/.test(text)) {
    return "save-wardrobe";
  }
  if (/\b(more like this|similar looks|similar style|influencer outfits|inspo|inspiration|same vibe|this style|style like)\b/.test(text)) {
    return "style-inspo";
  }
  return "custom";
};

function UploadIntentSheet({ uploadIntent, onClose, onSubmit }) {
  const [prompt, setPrompt] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    if (uploadIntent) {
      setPrompt("");
      setSelectedAction(null);
    }
  }, [uploadIntent]);

  if (!uploadIntent) {
    return null;
  }

  const actionItems = [
    {
      id: "shop",
      label: "Find where to buy it",
      subtitle: "Break down the look and search shoppable links",
      prompt: "Find where I can buy items like this.",
      icon: <ShoppingCart size={18} />
    },
    {
      id: "style-inspo",
      label: "More like this",
      subtitle: "Use this photo as style inspiration",
      prompt: "Show me more influencer outfits with this style.",
      icon: <Sparkles size={18} />
    },
    {
      id: "save-wardrobe",
      label: "Save as inspiration",
      subtitle: "Keep this look and refresh similar outfit ideas",
      prompt: "Save this as outfit inspiration and show me similar looks.",
      icon: <Shirt size={18} />
    },
    {
      id: "try-on",
      label: "Try it on me",
      subtitle: "Run try-on in the background and save it to My Mixes",
      prompt: "Try this on me.",
      icon: <PlayCircle size={18} />
    }
  ];
  const selectedItem = actionItems.find((item) => item.id === selectedAction);
  const canSubmit = prompt.trim().length > 0 || Boolean(selectedItem);
  const submitUploadPrompt = () => {
    const text = prompt.trim() || selectedItem?.prompt || "";
    if (!text) return;
    onSubmit({
      actionId: selectedAction || inferUploadIntentAction(text),
      prompt: text
    });
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col justify-end">
      <button type="button" aria-label="Close upload options" className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative rounded-t-[2.5rem] bg-[#f5f3ef] px-5 pb-safe pt-5 shadow-[0_-18px_60px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom-full duration-300">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d6d0c7]" />
        <div className="mb-5 flex items-center gap-4">
          <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[1.6rem] border border-[#e5e5e5] bg-white shadow-sm">
            <img src={uploadIntent.previewUrl} alt="Uploaded preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a9188]">Upload image</p>
            <h3 className="mt-1 text-[26px] leading-7 font-serif text-[#1a1a1a]">What should I do with this photo?</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#6b655f]">Type your own prompt or pick a shortcut.</p>
          </div>
        </div>
        <div className="pb-5">
          {selectedItem ? (
            <div className="mb-4 rounded-[1.6rem] border border-[#e5e5e5] bg-white p-4 shadow-sm">
              <button type="button" onClick={() => setSelectedAction(null)} className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#8c847d]">
                <ArrowLeft size={15} /> Back
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f3ef] text-[#1a1a1a]">{selectedItem.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-semibold text-[#1a1a1a]">{selectedItem.label}</div>
                  <div className="mt-1 text-[12px] leading-5 text-[#8c847d]">{selectedItem.subtitle}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAction(item.id);
                    setPrompt(item.prompt);
                  }}
                  className="flex min-h-[92px] flex-col items-start gap-2 rounded-[1.45rem] border border-[#e5e5e5] bg-white p-3 text-left shadow-sm transition hover:border-black active:scale-[0.99]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f3ef] text-[#1a1a1a]">{item.icon}</div>
                  <div className="text-[13px] font-bold leading-4 text-[#1a1a1a]">{item.label}</div>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white p-2 pl-4 shadow-sm focus-within:border-black">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) submitUploadPrompt();
              }}
              placeholder="Ask the stylist anything..."
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#1a1a1a] outline-none placeholder:text-[#999999]"
            />
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submitUploadPrompt}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${canSubmit ? "bg-black text-white" : "bg-[#e5e5e5] text-[#999999]"}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoStylistOverlay({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  const tips = ["Raise the belt slightly", "Front-tuck the shirt", "Smooth the shoulder seam", "Pull hair behind one ear"];
  const homeStylingPreview = "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/20241008_163702-PIdCLLy6LDcFhSJ1RlI8qDrrK6nTMt.webp";

  return (
    <div className="fixed inset-0 z-[92] flex flex-col bg-[#101010] text-white animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 sm:pt-14">
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/15">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Live Styling</p>
          <h2 className="font-serif text-xl">Stylist Call</h2>
        </div>
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/15">
          <X size={20} />
        </button>
      </div>

      <div className="relative mx-5 flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[#252525] shadow-2xl">
        <img src={homeStylingPreview} alt="Live stylist preview" className="h-full w-full object-cover object-center opacity-80" />
        <div className="absolute inset-x-5 top-5 rounded-3xl bg-black/45 p-4 backdrop-blur-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Stylist says</p>
          <p className="mt-1 text-sm font-semibold leading-5">Move the belt a bit higher, tuck only the front, then clean up the hair around your neckline.</p>
        </div>
        <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-2">
          {tips.map((tip) => (
            <div key={tip} className="rounded-full bg-white/90 px-3 py-2 text-center text-[11px] font-bold text-[#1a1a1a] shadow-sm">
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 px-6 py-6 pb-safe">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
          <Mic size={20} />
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <Camera size={22} />
        </button>
        <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function formatStat(n) {
  if (n == null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function UserProfileScreen({ userId, onClose }) {
  const targetUser = findUserById(userId);
  const [feed] = useStore(feedStore);
  const [followedIds] = useStore(followedUsersStore);
  const [activeTab, setActiveTab] = useState("posts");
  const [openItem, setOpenItem] = useState(null); // expanded post

  if (!targetUser) {
    return null;
  }

  const isFollowing = followedIds.includes(targetUser.id);
  const followerCount = targetUser.followers + (isFollowing ? 1 : 0);

  const toggleFollow = () => {
    const cur = followedUsersStore.getState();
    followedUsersStore.setState(
      isFollowing ? cur.filter((id) => id !== targetUser.id) : [...cur, targetUser.id]
    );
  };

  const userPosts = feed.filter((p) => p.userId === targetUser.id);
  const userMixes = userPosts; // mock: published mixes = posts for now
  const wardrobeItems = (targetUser.wardrobeIds || []).map((id) => INITIAL_WARDROBE.find((w) => w.id === id)).filter(Boolean);
  const wishlistItems = (targetUser.wishlistIds || []).map((id) => MOCK_WISHLIST.find((w) => w.id === id)).filter(Boolean);

  const sectionAccess = (visibility) => {
    if (visibility === PROFILE_VISIBILITY.PUBLIC) return "visible";
    if (visibility === PROFILE_VISIBILITY.PRIVATE) return "private";
    return isFollowing ? "visible" : "followers-only";
  };
  const wardrobeAccess = sectionAccess(targetUser.wardrobeVisibility);
  const wishlistAccess = sectionAccess(targetUser.wishlistVisibility);

  const Locked = ({ access, label }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f3ef]">
        {access === "followers-only" ? <User size={22} className="text-[#999999]" /> : <X size={22} className="text-[#999999]" />}
      </div>
      <p className="text-sm font-bold text-[#1a1a1a]">
        {access === "followers-only" ? `${label} is for followers` : `${label} is private`}
      </p>
      <p className="mt-1 text-[11px] text-[#999999]">
        {access === "followers-only" ? "Follow to unlock this section." : "The owner has chosen not to share this."}
      </p>
      {access === "followers-only" && (
        <button
          onClick={toggleFollow}
          className="mt-4 rounded-full bg-black px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white active:scale-[0.98]"
        >
          Follow
        </button>
      )}
    </div>
  );

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "wardrobe", label: "Wardrobe" },
    { id: "wishlist", label: "Wishlist" },
    { id: "mixes", label: "Mixes" }
  ];

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#f5f3ef] animate-in slide-in-from-right duration-300">
      {/* Header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e5e5] bg-[#f5f3ef] px-3 pt-12 pb-3 sm:pt-14">
        <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold text-[#1a1a1a]">@{targetUser.handle}</span>
        <button className="rounded-full border border-[#e5e5e5] bg-white p-2 text-[#1a1a1a] hover:bg-[#e8e5df] transition">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Profile header */}
        <div className="px-4 pt-5">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#e5e5e5]">
              <img src={targetUser.avatar} alt={targetUser.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl text-[#1a1a1a] leading-tight">{targetUser.name}</h1>
              <p className="mt-0.5 text-[11px] font-bold text-[#999999]">@{targetUser.handle}</p>
              {targetUser.bio && <p className="mt-2 text-[13px] text-[#1a1a1a] leading-snug">{targetUser.bio}</p>}
            </div>
          </div>

          <div className="mt-4 flex gap-5 text-[#1a1a1a]">
            <div><span className="text-base font-bold">{formatStat(followerCount)}</span> <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">followers</span></div>
            <div><span className="text-base font-bold">{formatStat(targetUser.following)}</span> <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">following</span></div>
            <div><span className="text-base font-bold">{userPosts.length}</span> <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">posts</span></div>
          </div>

          {targetUser.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999] self-center mr-1">Skills</span>
              {targetUser.skills.map((s) => (
                <span key={s} className="rounded-full bg-white border border-[#e5e5e5] px-3 py-1 text-[10px] font-bold text-[#1a1a1a]">
                  {s}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={toggleFollow}
            className={`mt-4 w-full rounded-full py-3 text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] ${
              isFollowing ? "bg-white text-[#1a1a1a] border border-[#e5e5e5]" : "bg-black text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex w-full border-b border-[#e5e5e5] px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === t.id ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-transparent text-[#999999] hover:text-[#1a1a1a]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-2 pt-3">
          {activeTab === "posts" && (
            userPosts.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-[#999999]">No posts yet</div>
            ) : (
              <div className="columns-2 gap-3 px-2">
                {userPosts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setOpenItem(p)}
                    className="mb-3 break-inside-avoid relative cursor-pointer overflow-hidden rounded-3xl bg-[#e6e2d6] border border-[#e5e5e5] active:scale-[0.98] transition"
                  >
                    <img src={p.image} alt={p.desc || "post"} className="w-full object-cover" referrerPolicy="no-referrer" />
                    {p.likes != null && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <Heart size={10} fill="currentColor" /> {p.likes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "wardrobe" && (
            wardrobeAccess !== "visible" ? (
              <Locked access={wardrobeAccess} label="Wardrobe" />
            ) : wardrobeItems.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-[#999999]">No items</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                {wardrobeItems.map((it) => (
                  <div key={it.id} className="relative aspect-square overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white shadow-sm">
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/80">{it.brand}</p>
                      <p className="text-[11px] font-bold text-white line-clamp-1">{it.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "wishlist" && (
            wishlistAccess !== "visible" ? (
              <Locked access={wishlistAccess} label="Wishlist" />
            ) : wishlistItems.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-[#999999]">Nothing saved</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                {wishlistItems.map((it) => (
                  <div key={it.id} className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white shadow-sm">
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/80">{it.brand}</p>
                      <p className="text-[11px] font-bold text-white line-clamp-1">{it.name}</p>
                      {it.price && <p className="mt-0.5 text-[10px] font-bold text-white/90">{it.price}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "mixes" && (
            userMixes.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-[#999999]">No mixes published</div>
            ) : (
              <div className="grid grid-cols-3 gap-1 px-2">
                {userMixes.map((p) => (
                  <div key={p.id} onClick={() => setOpenItem(p)} className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-[#e6e2d6] active:scale-[0.98] transition">
                    <img src={p.image} alt="mix" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Post detail overlay */}
      {openItem && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f5f3ef] animate-in fade-in duration-200">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e5e5] bg-[#f5f3ef] px-3 pt-12 pb-3 sm:pt-14">
            <button onClick={() => setOpenItem(null)} className="rounded-full border border-[#e5e5e5] bg-white p-2 text-[#1a1a1a] hover:bg-[#e8e5df] transition">
              <ArrowLeft size={20} />
            </button>
            <span className="text-sm font-bold text-[#1a1a1a]">{targetUser.name}</span>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white shadow-sm">
              <img src={openItem.image} alt={openItem.desc || "post"} className="w-full object-cover" referrerPolicy="no-referrer" />
              {openItem.desc && <p className="px-4 py-3 text-sm text-[#1a1a1a]">{openItem.desc}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleNavigation({ activeTab, setActiveTab, mixItems, aura, onUploadImageSelected, instagramSync }) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [tryOnStatus, setTryOnStatus] = useStore(tryOnStatusStore);
  const [wardrobeNoticeCount, setWardrobeNoticeCount] = useStore(wardrobeNoticeStore);
  const isTryOnRunning = tryOnStatus.phase === "generating";
  const tryOnReadyCount = tryOnStatus.phase === "result" ? tryOnStatus.profileNotificationCount : 0;

  const navActive = activeTab === "wardrobe" ? "profile" : activeTab;

  const navItems = [
    { id: "trending", label: "Discover", icon: <Compass size={22} strokeWidth={navActive === "trending" ? 2.6 : 2.2} /> },
    {
      id: "skills",
      label: "Skills",
      icon: <Wand2 size={22} strokeWidth={navActive === "skills" ? 2.6 : 2.2} />
    },
    {
      id: "tryon",
      label: "Try-on",
      count: mixItems,
      highlighted: mixItems > 0,
      icon: <Sparkles size={22} strokeWidth={navActive === "tryon" ? 2.6 : 2.2} />
    },
    {
      id: "profile",
      label: "Me",
      count: (tryOnReadyCount > 0 ? tryOnReadyCount : 0) + (wardrobeNoticeCount > 0 ? wardrobeNoticeCount : 0),
      notification: tryOnReadyCount > 0 || wardrobeNoticeCount > 0,
      icon: <User size={22} strokeWidth={navActive === "profile" ? 2.6 : 2.2} />
    }
  ];

  const toolItems = [
    {
      id: "upload",
      label: "Upload image",
      description: "Find similar pieces from photos",
      icon: <ImageIcon size={19} />,
      onClick: () => fileInputRef.current?.click()
    },
    {
      id: "stylist-call",
      label: "Stylist Call",
      description: "Live fit check and detail advice",
      icon: <PlayCircle size={19} />,
      onClick: () => videoStylistStore.setState(true)
    }
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      <div className="pointer-events-none absolute bottom-6 left-4 z-50">
        <div className="pointer-events-none flex flex-col items-start gap-3">
          <div
            className={`pointer-events-auto w-[232px] rounded-[2rem] border border-white/10 bg-[#171717]/96 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Tools</div>
          <div className="space-y-1.5">
            {toolItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-[1.25rem] px-3 py-3 text-left text-white/92 transition hover:bg-white/[0.06]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white">{item.icon}</div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{item.label}</div>
                  <div className="truncate text-[11px] text-white/45">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-white/8" />
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Navigate</div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  // Clear notification badges as requested, but PRESERVE item data
                  setWardrobeNoticeCount(0);
                  setTryOnStatus((prev) => ({ ...prev, profileNotificationCount: 0 }));
                  
                  if (item.id === "profile") {
                    profileTabStore.setState("mixes");
                    mixesSubTabStore.setState("Generated");
                  }
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-[1.2rem] px-3 py-2.5 text-left transition ${
                  navActive === item.id
                    ? item.id === "tryon"
                      ? "bg-[#6c5ce7] text-white"
                      : item.id === "profile" && item.notification
                        ? "bg-[#27ae60] text-white"
                      : "bg-white/[0.08] text-white"
                    : item.highlighted
                      ? "bg-[#6c5ce7]/18 text-[#cfc4ff] hover:bg-[#6c5ce7]/24"
                      : item.notification
                        ? "bg-[#27ae60]/18 text-[#9be2b5] hover:bg-[#27ae60]/24"
                      : "text-white/84 hover:bg-white/[0.05]"
                }`}
              >
                <div className={item.notification ? "text-[#9be2b5]" : item.highlighted ? "text-[#cfc4ff]" : "text-white/88"}>{item.icon}</div>
                <span className="flex-1 text-[14px] font-semibold tracking-[0.01em]">{item.label}</span>
                {item.count > 0 && item.id !== "tryon" && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.notification ? "bg-[#27ae60] text-white" : navActive === item.id ? "bg-white/18 text-white" : "bg-[#6c5ce7] text-white"}`}>{item.count}</span>
                )}
                {item.id === "tryon" && item.count > 0 && activeTab !== "tryon" && (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-[#6c5ce7] text-white">{item.count}</span>
                )}
              </button>
            ))}
          </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              // Clear notification badges when menu is interacted with, but PRESERVE data
              setWardrobeNoticeCount(0);
              setTryOnStatus((prev) => ({ ...prev, profileNotificationCount: 0 }));
            }}
            className={`pointer-events-auto relative flex h-[48px] w-[48px] items-center justify-center rounded-full border border-white/10 bg-[#141414] text-white shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition-all duration-300 ${
              isOpen ? "rotate-45 bg-[#1b1b1b]" : "hover:bg-[#1d1d1d]"
            }`}
          >
            <Plus size={18} strokeWidth={2.5} />
            {(isTryOnRunning || tryOnReadyCount > 0 || wardrobeNoticeCount > 0 || mixItems > 0) && (
              <span
                className={`absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-[1px] text-center text-[10px] font-bold text-white ${
                  isTryOnRunning
                    ? "bg-[#6c5ce7] shadow-[0_6px_14px_rgba(108,92,231,0.35)]"
                    : tryOnReadyCount > 0 || wardrobeNoticeCount > 0
                      ? "bg-[#27ae60] shadow-[0_6px_14px_rgba(39,174,96,0.35)]"
                      : activeTab === "tryon" ? "hidden" : "bg-[#6c5ce7] shadow-[0_6px_14px_rgba(108,92,231,0.35)]"
                }`}
              >
                {isTryOnRunning ? <Loader2 size={10} className="animate-spin" /> : tryOnReadyCount > 0 ? tryOnReadyCount : wardrobeNoticeCount > 0 ? wardrobeNoticeCount : (activeTab === "tryon" ? 0 : mixItems)}
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return;
              }
              onUploadImageSelected(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </>
  );
}

const formatSkillAuthorName = (author = "") =>
  author
    .replace(/^@/, "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildClosetPiece = (item, source = "wardrobe") => ({
  ...item,
  price: source === "wishlist" ? item.price || "Wishlist" : "In wardrobe",
  source,
  sourceLabel: source === "wishlist" ? "Wishlist anchor" : "Closet anchor",
  link: item.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${item.brand} ${item.name}`)}`,
  shopOptions: buildStylistShopOptions(`${item.brand} ${item.name}`)
});

const pickSkillPiece = (items, usedIds, keywords = [], predicate = null) => {
  const byKeyword = items.find((item) => {
    if (usedIds.has(item.id)) {
      return false;
    }
    const haystack = `${item.brand} ${item.name} ${item.category}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });

  if (byKeyword) {
    usedIds.add(byKeyword.id);
    return byKeyword;
  }

  if (predicate) {
    const fallback = items.find((item) => !usedIds.has(item.id) && predicate(item));
    if (fallback) {
      usedIds.add(fallback.id);
      return fallback;
    }
  }

  return null;
};

const createSkillDiscoverySession = (skill, wardrobe, wishlist) => {
  const closet = wardrobe.map((item) => buildClosetPiece(item, "wardrobe"));
  const saved = wishlist.map((item) => buildClosetPiece(item, "wishlist"));
  const pool = [...closet, ...saved];

  if (skill.id === "diana-royal") {
    const usedIds = new Set();
    const polo = pickSkillPiece(pool, usedIds, ["rugby", "polo"], (item) => item.category === "Tops");
    const trousers = pickSkillPiece(pool, usedIds, ["pleated trouser", "pleated trousers", "trouser"], (item) => item.category === "Bottoms");
    const flats = pickSkillPiece(pool, usedIds, ["ballet", "flat", "loafer"], (item) => item.category === "Shoes");
    const sunglasses = pickSkillPiece(pool, usedIds, ["sunglasses"], (item) => item.category === "Jewelry");

    const usedIdsLookTwo = new Set([polo?.id].filter(Boolean));
    const blackTop = pickSkillPiece(pool, usedIdsLookTwo, ["black top"], (item) => item.category === "Tops");
    const skirt = pickSkillPiece(pool, usedIdsLookTwo, ["skirt"], (item) => item.category === "Bottoms");
    const lowHeels = pickSkillPiece(pool, usedIdsLookTwo, ["kitten", "heel"], (item) => item.category === "Shoes");
    const tote = pickSkillPiece(pool, usedIdsLookTwo, ["tote", "bag"], (item) => item.category === "Bags");

    const usedIdsLookThree = new Set([polo?.id, blackTop?.id].filter(Boolean));
    const denimTop = pickSkillPiece(pool, usedIdsLookThree, ["denim"], (item) => item.category === "Tops");
    const trousersRepeat =
      pool.find((item) => item.id === trousers?.id) ||
      pickSkillPiece(pool, usedIdsLookThree, ["pleated trouser", "pleated trousers"], (item) => item.category === "Bottoms");
    const sunglassesRepeat =
      pool.find((item) => item.id === sunglasses?.id) ||
      pickSkillPiece(pool, usedIdsLookThree, ["sunglasses"], (item) => item.category === "Jewelry");
    const toteRepeat =
      pool.find((item) => item.id === tote?.id) ||
      pickSkillPiece(pool, usedIdsLookThree, ["tote", "bag"], (item) => item.category === "Bags");

    const looks = [
      {
        id: `${skill.id}-core`,
        filter: "diana-core",
        title: "Alternative 1",
        hook: "Closest Diana translation from your closet",
        desc: "Your rugby polo is the strongest Diana anchor. I tightened it with tailored trousers, soft flats, and minimal sunglasses.",
        referenceImage: skill.moodboard[0] || skill.cover,
        note: "Best match for her off-duty royal uniform.",
        shoppingItems: [polo, trousers, flats, sunglasses].filter(Boolean)
      },
      {
        id: `${skill.id}-soft-tailored`,
        filter: "diana-soft-tailored",
        title: "Alternative 2",
        hook: "Polished but still weekend-easy",
        desc: "This uses your black top and skirt to echo Diana's clean proportions, then finishes with low heels and a simple tote.",
        referenceImage: skill.moodboard[1] || skill.cover,
        note: "A softer version for brunch, gallery, or errands.",
        shoppingItems: [blackTop, skirt, lowHeels, tote].filter(Boolean)
      },
      {
        id: `${skill.id}-relaxed`,
        filter: "diana-relaxed",
        title: "Alternative 3",
        hook: "Relaxed palace-errands energy",
        desc: "Your denim shirt can stand in for Diana's easy layered separates. I kept the line clean with trousers, sunnies, and a pared-back bag.",
        referenceImage: skill.portfolio?.[0] || skill.cover,
        note: "The most casual closet-led route into the skill.",
        shoppingItems: [denimTop, trousersRepeat, sunglassesRepeat, toteRepeat].filter(Boolean)
      }
    ].map((look, index) => ({
      ...look,
      image: look.referenceImage,
      renderAs: "skill_outfit",
      likes: 900 + index * 77,
      user: formatSkillAuthorName(skill.author),
      avatar: skill.avatar,
      userId: skill.userId,
      tags: ["skill", "diana", look.filter],
      sourceSkill: skill.name
    }));

    const closetAnchors = Array.from(
      new Map(
        [polo, blackTop, denimTop, trousers, flats, sunglasses, tote]
          .filter(Boolean)
          .map((item) => [item.id, item])
      ).values()
    );

    return {
      reply:
        "I analyzed your closet and found a few Diana-friendly anchors already working for you: the rugby polo, sharper separates, soft flats, and clean accessories. I turned them into three off-duty royal combinations below. Tap any alternative to see the Diana reference and exact closet pieces.",
      tags: [
        { label: "Diana Core", slug: "diana-core" },
        { label: "Soft Tailored", slug: "diana-soft-tailored" },
        { label: "Relaxed Royal", slug: "diana-relaxed" }
      ],
      items: looks,
      highlightedItems: {
        "Closet anchors": closetAnchors,
        "Skill combos": looks.flatMap((look) => look.shoppingItems).slice(0, 8)
      }
    };
  }

  return {
    reply: `I pulled your best closet matches for ${skill.name}.`,
    tags: [{ label: "Skill Picks", slug: "skill-picks" }],
    items: [],
    highlightedItems: {}
  };
};

const MOCK_SKILLS = [
  {
    id: "diana-royal",
    name: "Diana's Off-Duty Royal",
    userId: "anna-curates",
    author: "@anna_curates",
    pricingLabel: "Free",
    ctaLabel: "Get skill",
    avatar: "https://i.pravatar.cc/120?img=47",
    tagline: "Polo + high-rise denim + loafers. 80s royal pre-paparazzi.",
    followers: 12400,
    usedCount: 3200,
    rating: 4.8,
    cover: "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/diana-princess-of-wales-serpentine-gallery-082222-2000-c9c29daf9cd84be8843eead7dae46908-xw4JrDL5nKaJoFIsrnqVisA59HVPGm.jpg",
    moodboard: [
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/diana-princess-of-wales-serpentine-gallery-082222-2000-c9c29daf9cd84be8843eead7dae46908-xw4JrDL5nKaJoFIsrnqVisA59HVPGm.jpg",
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/recreating-princess-diana-s-street-style-12-tjNnUO6II9ij1THpw2RWcywn2yFwOL.webp",
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/Bild%2B3-ourac5r0UcC7TSLWUcnCGUrxFSon5b.webp"
    ],
    portfolio: [
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/sub-buzz-1583-1701466241-1-kYjmvVRC5FOMsGLN8PAcm8dFsPUivK.webp",
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/sub-buzz-916-1701465577-1-gIStToGVxUAR4kDAbpkG12IgRx9ie0.webp"
    ],
    startLabel: "Start styling Diana's off-duty look",
    startPrompt: "Style me in Princess Diana's off-duty royal aesthetic: polo or tucked tops, high-rise denim or tailored bottoms, loafers or low heels, pearl jewelry, and polished 80s royal ease.",
    rules: [
      "High-waisted bottoms, tucked tops",
      "Loafers or low-heel pumps, never sneakers",
      "Pearl jewelry, never statement pieces"
    ]
  },
  {
    id: "jennie-it-girl",
    name: "Jennie's It-Girl Codes",
    userId: "kstyle-curates",
    author: "@kstyle_curates",
    pricingLabel: "$4.99",
    ctaLabel: "Buy skill",
    avatar: "https://i.pravatar.cc/120?img=12",
    tagline: "Mini silhouettes, luxe classics, and cool-girl polish with a wink.",
    followers: 18600,
    usedCount: 4700,
    rating: 4.9,
    cover: "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%281%29-EPTlyWzhMoMz5RATLurwz6uFp5QY0H.jpeg",
    moodboard: [
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%281%29-EPTlyWzhMoMz5RATLurwz6uFp5QY0H.jpeg",
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images-NnDhbZ0oHjovM911YRlDzJxFQ2KyUB.jpeg"
    ],
    portfolio: [
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%284%29-fUo2h8d35TDYAlhUONjD8rN3LPbYaN.jpeg",
      "https://f1m2wvuqxivimpbz.public.blob.vercel-storage.com/uploads/images/cmkjtwjlb0000l804u0lxg42w/images%20%283%29-rutowZBtk330UM7rM26vpEmhYok7TT.jpeg"
    ],
    startLabel: "Start styling Jennie's it-girl look",
    startPrompt: "Style me in Jennie's it-girl aesthetic with mini silhouettes, luxe classics, sharp proportions, and one playful statement detail.",
    rules: [
      "Pair a polished hero piece with one playful or flirty accent",
      "Keep proportions sharp: cropped, fitted, or leg-lengthening silhouettes",
      "Finish with luxe texture or statement accessories, never too many at once"
    ]
  }
];

function SkillCard({ skill, onClick, isFollowed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition active:scale-[0.99]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <img src={skill.cover} alt={skill.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        {isFollowed && (
          <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6c5ce7]">
            Added
          </div>
        )}
        {!isFollowed && skill.pricingLabel && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800 backdrop-blur-sm">
            {skill.pricingLabel}
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <span className="text-amber-300">★</span>
          <span>{skill.rating}</span>
        </div>
      </div>
      <div className="px-3.5 py-2.5 text-left">
        <h3 className="truncate text-[14px] font-semibold text-neutral-900">{skill.name}</h3>
      </div>
    </button>
  );
}

function SkillDetailView({ skill, isFollowed, onToggleFollow, onBack, onUseSkill, onAuthorClick }) {
  const [tab, setTab] = useState("moodboard");
  const images = tab === "moodboard" ? skill.moodboard : skill.portfolio;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#f5f3ef]">
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <button type="button" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white">
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleFollow}
          className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
            isFollowed ? "bg-neutral-200 text-neutral-700" : "bg-[#6c5ce7] text-white"
          }`}
        >
          {isFollowed ? "Added" : skill.pricingLabel === "Free" ? "Get free" : `Buy ${skill.pricingLabel}`}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-32 scrollbar-hide">
        <button
          type="button"
          onClick={onAuthorClick}
          className="mb-3 flex items-center gap-2.5 group"
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-2 ring-white shadow-sm">
            {skill.avatar ? (
              <img src={skill.avatar} alt={skill.author} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#6c5ce7]/15 text-[12px] font-bold text-[#6c5ce7]">
                {skill.author.replace("@", "").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-[13px] font-semibold text-neutral-700 group-hover:text-neutral-900">{skill.author}</span>
        </button>
        <h1 className="text-[26px] font-bold leading-tight text-neutral-900">{skill.name}</h1>
        <p className="mt-2 text-[14px] text-neutral-600">{skill.tagline}</p>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-neutral-500">
          {skill.pricingLabel && <span className="font-semibold text-neutral-700">{skill.pricingLabel}</span>}
          <span>★ {skill.rating}</span>
          <span>{skill.followers.toLocaleString()} added</span>
          <span>{skill.usedCount.toLocaleString()} styled</span>
        </div>

        <div className="mt-6 flex gap-1.5 rounded-full bg-neutral-200/70 p-1">
          {[
            { id: "moodboard", label: "Moodboard" },
            { id: "portfolio", label: "Portfolio" }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${
                tab === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <div key={`${tab}-${i}`} className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-200">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-8 pt-3 bg-gradient-to-t from-[#f5f3ef] via-[#f5f3ef] to-transparent">
        <button
          type="button"
          onClick={onUseSkill}
          className="w-full rounded-full bg-[#6c5ce7] py-4 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(108,92,231,0.35)] active:scale-[0.98]"
        >
          {skill.startLabel || "Start styling this vibe"}
        </button>
      </div>
    </div>
  );
}

function SkillsTab({ setActiveTab }) {
  const [subTab, setSubTab] = useState("discover");
  const [followed, setFollowed] = useState(() => new Set(["diana-royal"]));
  const [selectedSkill, setSelectedSkill] = useState(null);

  const toggleFollow = (id) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleSkills = subTab === "discover" ? MOCK_SKILLS : MOCK_SKILLS.filter((s) => followed.has(s.id));

  if (selectedSkill) {
    return (
      <SkillDetailView
        skill={selectedSkill}
        isFollowed={followed.has(selectedSkill.id)}
        onToggleFollow={() => toggleFollow(selectedSkill.id)}
        onBack={() => setSelectedSkill(null)}
        onAuthorClick={() => {
          if (selectedSkill.userId) {
            viewingProfileStore.setState(selectedSkill.userId);
          }
        }}
        onUseSkill={() => {
          const session = createSkillDiscoverySession(selectedSkill, wardrobeStore.getState(), wishlistStore.getState());
          if (!followed.has(selectedSkill.id)) {
            toggleFollow(selectedSkill.id);
          }
          if (session.items.length > 0) {
            feedStore.setState(session.items);
            discoveryStylistStore.setState({
              reply: session.reply,
              tags: session.tags,
              source: "skill",
              skillId: selectedSkill.id
            });
          } else {
            feedStore.setState(MOCK_FEED.slice(0, 6));
            discoveryStylistStore.setState({
              reply: `I started a stylist session for ${selectedSkill.name}. I pulled a few inspiration looks while I map the vibe to your closet.`,
              tags: DEFAULT_FILTER_TAGS,
              source: "skill",
              skillId: selectedSkill.id
            });
          }
          setSelectedSkill(null);
          setActiveTab?.("trending");
        }}
      />
    );
  }

  return (
    <div className="px-4 pt-12 pb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab?.("trending")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">Skills</h1>
      </div>
      <p className="mt-1 text-[13px] text-neutral-500">Borrow a stylist's eye for your closet.</p>

      <div className="mt-5 flex gap-1.5 rounded-full bg-neutral-200/70 p-1">
        {[
          { id: "discover", label: "Discover" },
          { id: "mine", label: `My Skills${followed.size > 0 ? ` · ${followed.size}` : ""}` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              subTab === tab.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleSkills.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <Wand2 size={32} className="text-neutral-300" />
          <p className="mt-3 text-[14px] font-semibold text-neutral-700">No skills yet</p>
          <p className="mt-1 text-[12px] text-neutral-500">Add a skill from Discover to keep it in your toolkit.</p>
          <button
            type="button"
            onClick={() => setSubTab("discover")}
            className="mt-4 rounded-full bg-[#6c5ce7] px-5 py-2 text-[12px] font-bold text-white"
          >
            Explore Skills
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {visibleSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isFollowed={followed.has(skill.id)}
              onClick={() => setSelectedSkill(skill)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingHeroCollage({ showConnectBadge = false }) {
  return (
    <div className="relative mx-auto h-[250px] w-[290px]">
      <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ece6dc] blur-3xl" />

      <div className="absolute left-3 top-[76px] h-[112px] w-[78px] overflow-hidden rounded-[1.6rem] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
        <img src={ONBOARDING_HERO_IMAGES[0]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-[68px] top-[48px] h-[138px] w-[96px] overflow-hidden rounded-[1.8rem] shadow-[0_20px_44px_rgba(0,0,0,0.10)]">
        <img src={ONBOARDING_HERO_IMAGES[1]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[176px] w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
        <img src={ONBOARDING_HERO_IMAGES[2]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-[62px] top-[70px] h-[130px] w-[92px] overflow-hidden rounded-[1.8rem] shadow-[0_20px_44px_rgba(0,0,0,0.10)]">
        <img src={ONBOARDING_HERO_IMAGES[3]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-3 top-[98px] h-[104px] w-[72px] overflow-hidden rounded-[1.45rem] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
        <img src={ONBOARDING_HERO_IMAGES[4]} alt="" className="h-full w-full object-cover" />
      </div>

      {showConnectBadge && (
        <div className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffcc70,#ff5e62_45%,#c850c0)] text-[11px] font-bold text-white">
            IG
          </div>
          <div className="flex items-center gap-1.5 text-black/40">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171412] text-white">
            <Sparkles size={16} />
          </div>
        </div>
      )}
    </div>
  );
}

function AuthOnboardingFlow({ onComplete }) {
  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState("auth");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedHandle, setConnectedHandle] = useState("");
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [voiceError, setVoiceError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    instagram: ""
  });
  const recognitionRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  const currentQuestion = ONBOARDING_VOICE_QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === ONBOARDING_VOICE_QUESTIONS.length - 1;
  const answeredConversation = ONBOARDING_VOICE_QUESTIONS.slice(0, questionIndex).filter((question) => answers[question.id]);
  const speechSupported =
    typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (step !== "analyze") {
      return undefined;
    }
    setAnalysisIndex(0);
    const timer = window.setInterval(() => {
      setAnalysisIndex((prev) => (prev >= INSTAGRAM_SIGNAL_CARDS.length - 1 ? prev : prev + 1));
    }, 650);
    const nextStepTimer = window.setTimeout(() => {
      setStep("questions");
    }, 3200);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(nextStepTimer);
    };
  }, [step]);

  const playVoicePrompt = useCallback(async (prompt) => {
    setIsVoicePlaying(true);
    setVoiceStatus("prompt");
    try {
      const audioData = await callGeminiTTS(prompt);
      if (audioData) {
        await playPCM16Audio(audioData);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 1400));
      }
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    } finally {
      setIsVoicePlaying(false);
    }
  }, []);

  const handleSkip = () => {
    onComplete({
      name: "Guest",
      email: "",
      instagramHandle: "@guest",
      answers: {}
    });
  };

  const stopRealtimeCapture = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch {
        // noop
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const submitAnswerText = useCallback(
    (rawValue) => {
      const value = rawValue.trim();
      if (!value) {
        return;
      }
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      const nextAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(nextAnswers);
      setDraftAnswer("");
      setVoiceError("");
      setVoiceStatus("captured");
      if (isLastQuestion) {
        onComplete(buildOnboardingProfile({ ...form, instagram: connectedHandle || form.instagram }, nextAnswers));
        return;
      }
      setQuestionIndex((prev) => prev + 1);
    },
    [answers, connectedHandle, currentQuestion, form, isLastQuestion, onComplete]
  );

  const startRealtimeCapture = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported on this device.");
      setVoiceStatus("manual");
      return;
    }

    stopRealtimeCapture();
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    let latestTranscript = "";
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = window.navigator?.language || "en-US";

    setVoiceError("");
    setDraftAnswer("");
    setIsListening(true);
    setVoiceStatus("listening");

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      latestTranscript = transcript;
      setDraftAnswer(transcript);
      setVoiceStatus("capturing");
    };

    recognition.onerror = () => {
      setVoiceError("Mic access failed. You can tap and try again.");
      setIsListening(false);
      setVoiceStatus("error");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      if (latestTranscript.trim()) {
        setVoiceStatus("captured");
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          submitAnswerText(latestTranscript);
        }, 420);
        return;
      }
      setVoiceStatus("idle");
    };

    try {
      recognition.start();
    } catch {
      setVoiceError("Mic is busy. Tap again to retry.");
      setIsListening(false);
      setVoiceStatus("error");
    }
  }, [stopRealtimeCapture, submitAnswerText]);

  useEffect(() => {
    if (step !== "questions" || !currentQuestion) {
      return undefined;
    }
    setDraftAnswer(answers[currentQuestion.id] || "");
    setVoiceError("");
    let isActive = true;
    playVoicePrompt(currentQuestion.voicePrompt).finally(() => {
      if (!isActive) {
        setIsVoicePlaying(false);
        return;
      }
      if (speechSupported) {
        window.setTimeout(() => {
          if (isActive) {
            startRealtimeCapture();
          }
        }, 180);
      }
    });
    return () => {
      isActive = false;
      stopRealtimeCapture();
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [answers, currentQuestion, playVoicePrompt, speechSupported, startRealtimeCapture, step, stopRealtimeCapture]);

  useEffect(() => {
    return () => {
      stopRealtimeCapture();
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [stopRealtimeCapture]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setConnectedHandle("");
    setStep("connect");
  };

  const handleConnectInstagram = () => {
    const fallbackHandle = (form.instagram.trim() || form.name.trim() || "styledaily")
      .replace(/^@*/, "")
      .replace(/\s+/g, "")
      .toLowerCase();
    setIsConnecting(true);
    window.setTimeout(() => {
      setConnectedHandle(`@${fallbackHandle}`);
      setIsConnecting(false);
      // Skip the redundant confirmation screen and go straight to analysis
      setStep("analyze");
    }, 1300);
  };

  const handleContinueQuestion = () => {
    submitAnswerText(draftAnswer);
  };

  return (
    <div className={`relative flex h-full flex-col overflow-hidden transition-colors duration-700 ${step === "questions" ? "bg-black text-white" : "bg-[#f5f3ef] text-[#171412]"} px-5 pb-6 pt-10`}>
      <div className={`mx-auto h-1.5 w-28 rounded-full ${step === "questions" ? "bg-white/10" : "bg-black/8"}`} />

      <div className="mt-5 flex items-center justify-between">
        <button 
          type="button"
          onClick={handleSkip}
          className={`text-[11px] font-bold uppercase tracking-[0.32em] transition-colors ${step === "questions" ? "text-white/40" : "text-[#8f7d67]"} active:opacity-60`}
        >
          fAIshion.AI
        </button>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((index) => {
            const activeCount = step === "auth" ? 1 : step === "connect" ? 2 : step === "analyze" ? 3 : 4;
            return (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index < activeCount 
                    ? (step === "questions" ? "w-5 bg-white" : "w-5 bg-[#171412]") 
                    : (step === "questions" ? "w-1.5 bg-white/10" : "w-1.5 bg-black/10")
                }`}
              />
            );
          })}
        </div>
      </div>

      {step === "auth" && (
        <div className="flex flex-1 flex-col pt-6">
          <div className="flex flex-1 flex-col items-center justify-center">
            <OnboardingHeroCollage />
            <div className="mt-3 text-center">
              <h1 className="font-serif text-[34px] leading-[0.95] text-[#171412]">Connect your style graph</h1>
              <p className="mt-3 text-[13px] text-[#7a6d5d]">Sign in, connect Instagram, start discovery.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ebe5db] bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <div className="inline-flex rounded-full bg-[#f2ede6] p-1">
              {[
                { id: "signup", label: "Sign up" },
                { id: "login", label: "Log in" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                    mode === item.id ? "bg-[#171412] text-white" : "text-[#7a6d5d]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleAuthSubmit}>
              {mode === "signup" && (
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-[1.2rem] border border-[#ece4d9] bg-[#fcfaf7] px-4 py-3 text-[14px] outline-none transition focus:border-[#171412]"
                />
              )}
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="w-full rounded-[1.2rem] border border-[#ece4d9] bg-[#fcfaf7] px-4 py-3 text-[14px] outline-none transition focus:border-[#171412]"
              />
              <input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                type="password"
                className="w-full rounded-[1.2rem] border border-[#ece4d9] bg-[#fcfaf7] px-4 py-3 text-[14px] outline-none transition focus:border-[#171412]"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[#171412] px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white"
              >
                <Lock size={15} />
                {mode === "signup" ? "Create account" : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === "connect" && (
        <div className="flex flex-1 flex-col pt-6">
          <div className="flex flex-1 flex-col items-center justify-center">
            <OnboardingHeroCollage showConnectBadge />
            <div className="mt-2 text-center">
              <h2 className="font-serif text-[34px] leading-[0.95] text-[#171412]">Connect Instagram</h2>
              <p className="mt-3 text-[13px] text-[#7a6d5d]">Reads follows, posts, try-on photos, wardrobe.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ebe5db] bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <div className="rounded-[1.5rem] border border-[#ece4d9] bg-[#fcfaf7] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7d67]">Instagram</div>
              <div className="mt-3 flex items-center gap-3 rounded-[1rem] border border-[#ece4d9] bg-white px-4 py-3">
                <span className="text-[14px] text-[#8f7d67]">@</span>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value.replace(/^@*/, "") }))}
                  placeholder="yourhandle"
                  className="w-full bg-transparent text-[15px] text-[#171412] outline-none placeholder:text-[#b7ab9c]"
                />
              </div>
            </div>

            {!connectedHandle ? (
              <button
                type="button"
                onClick={handleConnectInstagram}
                disabled={isConnecting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[#171412] px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
              >
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {step === "analyze" && (
        <div className="flex flex-1 flex-col justify-center px-1">
          <div className="rounded-[2rem] border border-[#ebe5db] bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <div className="mx-auto w-fit rounded-full bg-[#f5f3ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8f7d67]">
              Live Sync
            </div>
            <h2 className="mt-4 text-center font-serif text-[34px] leading-[0.98] text-[#171412]">Building your profile</h2>
            <p className="mt-3 text-center text-[13px] text-[#7a6d5d]">
              {analysisIndex === 0
                ? "Reading who you follow."
                : analysisIndex === 1
                  ? "Reading what you post."
                  : analysisIndex === 2
                    ? "Saving full-body shots for try-on."
                    : "Pulling pieces into wardrobe."}
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {INSTAGRAM_SYNC_ITEMS.slice(0, 6).map((item, index) => (
                <div key={item.name} className="relative overflow-hidden rounded-[1.3rem] bg-[#f8f4ee] shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="aspect-[0.82] overflow-hidden">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  {index <= analysisIndex + 1 && (
                    <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#8b2cff] text-white shadow-lg">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {INSTAGRAM_SIGNAL_CARDS.map((card, index) => (
                <span
                  key={card.title}
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold transition ${
                    index <= analysisIndex ? "bg-[#171412] text-white" : "bg-white text-[#8f7d67]"
                  }`}
                >
                  {card.title}
                </span>
              ))}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#efe9de]">
              <div
                className="h-full rounded-full bg-[#171412] transition-all duration-500"
                style={{ width: `${Math.min(100, ((analysisIndex + 1) / INSTAGRAM_SIGNAL_CARDS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="flex flex-1 flex-col pt-6 relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-[13px] font-semibold text-white/80">Stylist <span className="font-normal text-white/40">Voice</span></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start px-4 text-left pt-12">
            <h2 className="text-[26px] font-medium leading-[1.35] text-white/95 transition-all duration-700">
              {currentQuestion.prompt}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-white/50 animate-in fade-in slide-in-from-bottom-3 duration-1000">
              {currentQuestion.explanation}
            </p>
            
            {draftAnswer.trim() && (
              <div className="mt-12 text-[20px] text-white/40 animate-in fade-in slide-in-from-bottom-2 duration-500">
                "{draftAnswer}"
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-end pb-32">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => {
                if (isListening) {
                  stopRealtimeCapture();
                  setVoiceStatus("paused");
                  return;
                }
                startRealtimeCapture();
              }}
            >
              <div className={`voice-orb ${isListening || isVoicePlaying ? "scale-[1.15]" : "scale-100 opacity-70"} transition-all duration-700 w-[180px] h-[180px]`}>
                <div className="voice-orb-inner" />
              </div>
              
              {isVoicePlaying && (
                <div className="absolute inset-[-40px] border border-cyan-400/10 rounded-full animate-ping" />
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center gap-2">
            <button className="h-12 w-12 flex items-center justify-center rounded-full bg-[#1a1a1a] text-white transition active:scale-95">
              <Plus size={22} />
            </button>
            
            <div className="flex-1 h-12 px-5 flex items-center rounded-full bg-[#1a1a1a] text-white/30 text-[15px]">
              {draftAnswer || "Message..."}
            </div>

            <div className="flex items-center gap-2">
              <button className="h-12 w-12 flex items-center justify-center rounded-full bg-[#1a1a1a] text-white transition active:scale-95">
                <Camera size={20} />
              </button>
              <button 
                onClick={() => {
                  if (isListening) {
                    stopRealtimeCapture();
                    setVoiceStatus("paused");
                  } else {
                    startRealtimeCapture();
                  }
                }}
                className={`h-12 w-12 flex items-center justify-center rounded-full transition active:scale-95 ${isListening ? "bg-white text-black" : "bg-[#1a1a1a] text-white"}`}
              >
                <Mic size={20} />
              </button>
              <button 
                onClick={handleContinueQuestion}
                disabled={!draftAnswer.trim()}
                className={`h-12 w-12 flex items-center justify-center rounded-full transition active:scale-95 ${draftAnswer.trim() ? "bg-white text-black" : "bg-[#1a1a1a] text-white/20"}`}
              >
                {isLastQuestion ? <Check size={20} /> : <X size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("trending");
  const [authState, setAuthState] = useState(() => getStoredAuthState());
  const [returnTab, setReturnTab] = useState("trending");
  const [uploadIntent, setUploadIntent] = useState(null);
  const [wardrobeToast, setWardrobeToast] = useState(null);
  const [instagramSync, setInstagramSync] = useState({
    active: false,
    imported: 0,
    total: INSTAGRAM_SYNC_ITEMS.length,
    lastAdded: null
  });
  const [mixItems] = useGlobalMix();
  const [flyingItem] = useStore(flyingStore);
  const [viewingProfileId] = useStore(viewingProfileStore);
  const [isVideoStylistOpen, setIsVideoStylistOpen] = useStore(videoStylistStore);
  const aura = useAuraStylist();
  const wardrobeToastTimerRef = useRef(null);
  const instagramSyncTimersRef = useRef([]);

  useEffect(() => {
    if (activeTab !== "tryon") {
      setReturnTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "wardrobe") {
      wardrobeNoticeStore.setState(0);
    }
  }, [activeTab]);

  useEffect(() => {
    persistAuthState(authState);
  }, [authState]);

  useEffect(() => {
    return () => {
      if (wardrobeToastTimerRef.current) {
        window.clearTimeout(wardrobeToastTimerRef.current);
      }
      instagramSyncTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const showWardrobeToastMessage = useCallback((message, cta = "View wardrobe") => {
    if (wardrobeToastTimerRef.current) {
      window.clearTimeout(wardrobeToastTimerRef.current);
    }
    setWardrobeToast({ message, cta });
    wardrobeToastTimerRef.current = window.setTimeout(() => {
      setWardrobeToast(null);
    }, 3400);
  }, []);

  const showWardrobeSavedToast = useCallback(() => {
    aura.setAuraMessage("I've saved that to your wardrobe. 👗");
  }, [aura]);

  const startInstagramWardrobeSync = useCallback(
    (profile, options = {}) => {
      instagramSyncTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      instagramSyncTimersRef.current = [];

      const total = INSTAGRAM_SYNC_ITEMS.length;
      setInstagramSync({
        active: true,
        imported: 0,
        total,
        lastAdded: null
      });

      INSTAGRAM_SYNC_ITEMS.forEach((item, index) => {
        const timerId = window.setTimeout(() => {
          wardrobeStore.setState((prev) => {
            if (prev.some((existing) => existing.name === item.name && existing.brand === item.brand)) {
              return prev;
            }
            return [
              {
                id: Date.now() + index,
                ...item,
                source: "instagram",
                note: `Imported from ${profile?.instagramHandle || "@styledaily"}`
              },
              ...prev
            ];
          });
          wardrobeNoticeStore.setState((count) => count + 1);
          setInstagramSync((prev) => {
            const imported = Math.min(total, prev.imported + 1);
            return {
              active: imported < total,
              imported,
              total,
              lastAdded: item.name
            };
          });
          if (index === total - 1 && !options.silent) {
            aura.setAuraMessage(`Instagram sync complete. I added ${total} pieces to your wardrobe.`);
          }
        }, 1400 + index * 1500);

        instagramSyncTimersRef.current.push(timerId);
      });
    },
    [aura]
  );

  useEffect(() => {
    if (!authState.completed) {
      return;
    }
    const hasInstagramItems = wardrobeStore.getState().some((item) => item.source === "instagram");
    if (!hasInstagramItems && instagramSync.imported === 0 && !instagramSync.active) {
      startInstagramWardrobeSync(authState.profile, { silent: true });
    }
  }, [authState, instagramSync.active, instagramSync.imported, startInstagramWardrobeSync]);

  const handleOnboardingComplete = useCallback(
    (profile) => {
      setAuthState({
        completed: true,
        profile
      });
      setActiveTab("trending");
      profileTabStore.setState("closet");
      wardrobeMainTabStore.setState("Owned");
      wardrobeNoticeStore.setState(0);
      discoveryStylistStore.setState({
        reply: `Hi ${profile.name}. I already started shaping Discover around ${profile.answers.icon || "your saved style references"} and your weekly routine.`,
        tags: DEFAULT_FILTER_TAGS,
        source: "onboarding"
      });
      aura.setAuraMessage(`Instagram connected. I'm syncing ${profile.instagramHandle} into your wardrobe now.`);
      startInstagramWardrobeSync(profile);
    },
    [aura, showWardrobeToastMessage, startInstagramWardrobeSync]
  );

  const handleUploadImageSelected = useCallback(async (file) => {
    const previewUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setUploadIntent({
      file,
      fileName: file.name,
      previewUrl
    });
    setActiveTab("trending");
  }, []);

  const handleUploadIntentAction = useCallback(
    (payload) => {
      const currentIntent = uploadIntent;
      if (!currentIntent) {
        return;
      }

      const prompt = typeof payload === "string" ? "" : payload.prompt;
      const actionId = typeof payload === "string" ? payload : payload.actionId || inferUploadIntentAction(prompt || "");
      const itemName = formatUploadItemName(currentIntent.fileName);
      setUploadIntent(null);

      if (actionId === "shop") {
        aura.openAura();
        aura.handleImageUpload(currentIntent.file);
        return;
      }

      if (actionId === "style-inspo") {
        feedStore.setState(UPLOADED_ITEM_STYLE_FEED);
        aura.setAuraMessage("I refreshed the feed with influencer looks that carry a similar vibe.");
        setActiveTab("trending");
        return;
      }

      if (actionId === "save-wardrobe") {
        wardrobeStore.setState((prev) => [
          {
            id: Date.now(),
            brand: "Uploaded",
            name: itemName,
            image: currentIntent.previewUrl,
            category: "Tops",
            link: ""
          },
          ...prev
        ]);
        wardrobeNoticeStore.setState((count) => count + 1);
        showWardrobeSavedToast();
        feedStore.setState(UPLOADED_ITEM_STYLE_FEED);
        aura.setAuraMessage("Saved as inspiration. I refreshed the feed with similar influencer-style looks.");
        setActiveTab("trending");
        return;
      }

      if (actionId === "try-on") {
        const garment = {
          id: Date.now(),
          image: currentIntent.previewUrl,
          name: itemName
        };
        mixStore.setState([garment]);
        startBackgroundTryOnRun({
          garments: [garment],
          title: `${itemName} Try-On`
        });
        return;
      }

      aura.processPrompt(prompt || "Help me style this photo.", [currentIntent.previewUrl]);
    },
    [uploadIntent, aura, showWardrobeSavedToast]
  );

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
            @keyframes orb-glow {
              0%, 100% { transform: scale(1); opacity: 0.8; filter: blur(10px); }
              50% { transform: scale(1.1); opacity: 1; filter: blur(15px); }
            }
            @keyframes orb-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .voice-orb {
              position: relative;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              background: radial-gradient(circle at center, #fff 0%, #b3e5fc 30%, #4fc3f7 60%, #0288d1 100%);
              box-shadow: 0 0 60px rgba(79, 195, 247, 0.5), 0 0 100px rgba(79, 195, 247, 0.2);
              animation: orb-glow 3s ease-in-out infinite;
            }
            .voice-orb::after {
              content: '';
              position: absolute;
              inset: -15px;
              border-radius: 50%;
              background: radial-gradient(circle at center, rgba(79, 195, 247, 0.4) 0%, transparent 70%);
              filter: blur(10px);
              animation: orb-glow 3s ease-in-out infinite reverse;
            }
            .voice-orb-inner {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.6), transparent);
              animation: orb-rotate 5s linear infinite;
              filter: blur(2px);
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

        {!authState.completed ? (
          <AuthOnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <>

            <main className="flex-1 overflow-hidden relative bg-[#f5f3ef]" style={{ transform: "translateZ(0)" }}>
              <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
                {activeTab === "trending" && (
                  <TrendingFeed
                    aura={aura}
                    setActiveTab={setActiveTab}
                    uploadIntent={uploadIntent}
                    onUploadPromptSubmit={handleUploadIntentAction}
                    onCancelUpload={() => setUploadIntent(null)}
                  />
                )}
                {activeTab === "skills" && <SkillsTab setActiveTab={setActiveTab} />}
                {activeTab === "wardrobe" && <WardrobeTab aura={aura} setActiveTab={setActiveTab} />}
                {activeTab === "tryon" && <TryOnTab setActiveTab={setActiveTab} returnTab={returnTab} />}
                {activeTab === "profile" && <ProfileTab setActiveTab={setActiveTab} aura={aura} />}
              </div>
              <AuraExtractAndChat aura={aura} />
            </main>

            <CollapsibleNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mixItems={mixItems.length}
              aura={aura}
              onUploadImageSelected={handleUploadImageSelected}
              instagramSync={instagramSync}
            />
            <VideoStylistOverlay isOpen={isVideoStylistOpen} onClose={() => setIsVideoStylistOpen(false)} />
            {viewingProfileId && (
              <UserProfileScreen userId={viewingProfileId} onClose={() => viewingProfileStore.setState(null)} />
            )}
          </>
        )}
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
