/** Synced from mobile-app/src/App.jsx (canonical) */

export type FilterTag = { label: string; slug: string }

export const DEFAULT_FILTER_TAGS: FilterTag[] = [
  { label: 'Y2K', slug: 'y2k' },
  { label: 'Going Out', slug: 'going-out' },
  { label: 'Minimalist', slug: 'minimalist' },
  { label: 'Coastal', slug: 'coastal' },
]

export type FeedItem = {
  id: number
  filter: string
  image: string
  aspectRatio: number
  user: string
  avatar: string
  likes: number
  desc: string
  tags: string[]
  userId?: string
}

export const MOCK_FEED: FeedItem[] = [
  {
    id: 401,
    filter: 'minimalist',
    image: 'https://i.pinimg.com/736x/f8/be/0f/f8be0ff9016bead77eeaff91060fe826.jpg',
    aspectRatio: 0.85,
    user: 'Chic Style',
    avatar: 'https://i.pravatar.cc/150?u=chic',
    likes: 612,
    desc: 'Oversized linen blazer, ribbed tank, tailored wide-leg trousers.',
    tags: ['chic', 'layers'],
  },
  {
    id: 402,
    filter: 'minimalist',
    image: 'https://i.pinimg.com/736x/d0/da/e0/d0dae0f6ecdae7f438a95fcc156e0da7.jpg',
    aspectRatio: 0.56,
    user: 'Modern Minimal',
    avatar: 'https://i.pravatar.cc/150?u=mod',
    likes: 844,
    desc: 'Cashmere sweater, straight-leg denim, pointed boots.',
    tags: ['minimal', 'modern'],
  },
  {
    id: 301,
    filter: 'going-out',
    image:
      'https://img.ltwebstatic.com/v4/j/ssms/2025/12/08/98/176517802406eeaa10fc33833c369290b28242b73d_thumbnail_420x.webp',
    aspectRatio: 0.75,
    user: 'Night Out Wardrobe',
    avatar: 'https://i.pravatar.cc/150?u=night',
    likes: 580,
    desc: 'Satin slip dress, strappy heels, metallic clutch.',
    tags: ['goingout', 'weekend'],
  },
  {
    id: 501,
    filter: 'y2k',
    image: 'https://i.pinimg.com/736x/d0/50/01/d050018a2250b92ba154b148d2d6e26f.jpg',
    aspectRatio: 0.76,
    user: 'Vintage Finds',
    avatar: 'https://i.pravatar.cc/150?u=v1',
    likes: 432,
    desc: 'Throwback aesthetic for the weekend.',
    tags: ['y2k', 'vintage'],
  },
  {
    id: 503,
    filter: 'minimalist',
    image: 'https://i.pinimg.com/736x/c2/3d/6d/c23d6da086bd35893755ab8cb33ff280.jpg',
    aspectRatio: 0.63,
    user: 'Neutral Palette',
    avatar: 'https://i.pravatar.cc/150?u=v3',
    likes: 554,
    desc: 'Clean lines and neutral tones.',
    tags: ['minimal', 'clean'],
  },
  {
    id: 507,
    filter: 'y2k',
    image:
      'https://img.ltwebstatic.com/v4/j/pi/2026/02/10/2d/17707311586d4e11f7e561bbebc27b6a8b83049aac_thumbnail_420x.webp',
    aspectRatio: 0.75,
    user: 'Trend Setter',
    avatar: 'https://i.pravatar.cc/150?u=v7',
    likes: 489,
    desc: 'Bringing back the early 2000s.',
    tags: ['trendy', 'y2k'],
  },
  {
    id: 508,
    filter: 'going-out',
    image:
      'https://www.meshki.us/cdn/shop/files/241119_MESHKI_SegrettiReshoots_17_882.jpg?v=1775956764&width=1206',
    aspectRatio: 0.67,
    user: 'Glamour Look',
    avatar: 'https://i.pravatar.cc/150?u=v8',
    likes: 920,
    desc: 'Sleek and sophisticated evening wear.',
    tags: ['evening', 'sophisticated'],
  },
  {
    id: 509,
    filter: 'coastal',
    image: 'https://i.pinimg.com/1200x/d6/04/ad/d604ad4e4a3fe22e874347be6b0154c1.jpg',
    aspectRatio: 0.8,
    user: 'Breezy Style',
    avatar: 'https://i.pravatar.cc/150?u=v9',
    likes: 315,
    desc: 'Catching the coastal breeze.',
    tags: ['coastal', 'breezy'],
  },
]

export const ONBOARDING_HERO_IMAGES = [
  'https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg',
  'https://i.pinimg.com/1200x/e9/4c/27/e94c27c886d87d47d655a85b8a98fe44.jpg',
  'https://i.pinimg.com/736x/aa/70/62/aa70622a9ecdac7f1b54307b61a41207.jpg',
  'https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg',
  'https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg',
]

export const INSTAGRAM_SYNC_ITEMS = [
  {
    brand: 'Instagram Save',
    name: 'Cream zip knit',
    image: 'https://i.pinimg.com/1200x/75/5a/98/755a98d93f917608e6eb73c2a77e7481.jpg',
    category: 'Tops',
  },
  {
    brand: 'Instagram Save',
    name: 'Relaxed denim',
    image: 'https://i.pinimg.com/1200x/80/03/27/8003277e7ed81a18ae2ce4279550ec77.jpg',
    category: 'Bottoms',
  },
  {
    brand: 'Instagram Save',
    name: 'Suede shoulder bag',
    image: 'https://i.pinimg.com/736x/74/db/da/74dbda7b91e9f033d41a304c38b2bc1b.jpg',
    category: 'Bags',
  },
  {
    brand: 'Instagram Save',
    name: 'Clean white sneaker',
    image: 'https://i.pinimg.com/736x/66/e9/47/66e9479e255e594de1f29fe1c3c27067.jpg',
    category: 'Shoes',
  },
  {
    brand: 'Instagram Save',
    name: 'Rib tank dress',
    image: 'https://i.pinimg.com/736x/e4/b7/dc/e4b7dc51ed6b81854e9d9b777c49cc22.jpg',
    category: 'Dresses',
  },
  {
    brand: 'Instagram Save',
    name: 'Gold hoop stack',
    image: 'https://i.pinimg.com/1200x/7d/e3/53/7de3538ae2b7310729e56955323bf767.jpg',
    category: 'Jewelry',
  },
]

export const INSTAGRAM_SIGNAL_CARDS = [
  { title: 'Follows', detail: 'Taste graph' },
  { title: 'Posts', detail: 'Daily routine' },
  { title: 'Full-body', detail: 'Try-on base' },
  { title: 'Wardrobe', detail: 'Item extraction' },
]

export const ONBOARDING_VOICE_QUESTIONS = [
  {
    id: 'lifestyle',
    label: 'Weekly routine',
    prompt: 'What does your week usually look like?',
    placeholder: 'Work, gym, coffee runs...',
    suggestions: ['School + gym', 'Work + coffee runs', 'Pickup kids + errands', 'Remote work + dinners out'],
  },
  {
    id: 'icon',
    label: 'Style inspiration',
    prompt: 'Who has a style you really love?',
    placeholder: 'Hailey Bieber, Jennie, Bella Hadid...',
    suggestions: ['Hailey Bieber', 'Jennie', 'Bella Hadid', 'Alix Earle'],
  },
  {
    id: 'emotionalGoal',
    label: 'Style goals',
    prompt: 'Is there any style you’ve been wanting to try lately?',
    placeholder: 'More feminine, classy, new trends...',
    suggestions: ['More feminine', 'Classy', 'New trends', 'Out of comfort zone'],
  },
] as const

export const DEFAULT_STYLIST_REPLY =
  'Tell me what you are shopping for — city, occasion, or a vibe — and I will curate a fresh feed for you.'
