export type ProductOption = {
  label: string        // 例如：「切法」「大小」
  choices: string[]    // 例如：['整隻', '切對半', '去骨']
  required: boolean
}

export type Product = {
  id: string
  name: string
  description: string
  fullDescription?: string
  price: number
  unit: string
  image: string
  category: string
  inStock: boolean
  featured?: boolean
  options?: ProductOption[]   // 選填，沒有就不顯示
}

export const products: Product[] = [
  {
    id: 'p1',
    name: '土雞腿',
    description: '當日現宰，肉質Q彈，皮脂均勻，煮湯煮滷都適合。',
    price: 280,
    unit: '份（約600g）',
    image: '',
    category: '鮮切雞肉',
    inStock: true,
    options: [
      { label: '處理方式', choices: ['不切', '切塊', '去骨不切', '去骨切塊'], required: true },
    ],
  },
  {
    id: 'p2',
    name: '玉米雞胸',
    description: '高蛋白低脂，減脂族首選，分切好回家直接下鍋。',
    price: 220,
    unit: '份（約400g）',
    image: '',
    category: '鮮切雞肉',
    inStock: true,
    options: [
      { label: '處理方式', choices: ['帶皮', '去皮', '去皮切塊', '絞肉'], required: true },
    ],
  },
  {
    id: 'p3',
    name: '土雞全雞',
    description: '完整全雞，適合白斬雞、燉湯，當日現宰不存貨。',
    price: 580,
    unit: '隻（約1.8-2.2kg）',
    image: '',
    category: '鮮切雞肉',
    inStock: true,
    options: [
      { label: '切法', choices: ['整隻不切', '切對半', '切塊', '去骨'], required: true },
    ],
  },
  {
    id: 'p4',
    name: '濃縮土雞精',
    description: '100%純雞精，無添加，適合術後補氣、銀髮族、孕媽媽。',
    price: 480,
    unit: '盒（6入）',
    image: '',
    category: '雞精',
    inStock: true,
  },
  {
    id: 'p5',
    name: '節慶感謝禮盒',
    description: '土雞腿×2 + 雞精×3，送禮自用兩相宜，附提袋。',
    price: 980,
    unit: '盒',
    image: '',
    category: '禮盒',
    inStock: true,
  },
]
