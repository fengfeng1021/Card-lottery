import { PrizePool } from '../types';
import { PRESET_ID_PREFIX } from '../lib/pools';

/**
 * Built-in preset roster, used to seed an empty install so the app opens with
 * sample data instead of a blank carousel.
 *
 * Source: 115 學年度第 21 屆畢業專題製作分組名單（2026.08.31 修正）.
 * One group = one prize pool; the pool's items are that group's members.
 */
interface RosterMember {
  /** Stable id fragment of the member, kept with the roster so seeded pools survive storage round-trips. */
  key: string;
  name: string;
}

interface RosterGroup {
  group: number;
  title: string;
  color: string;
  gradientTo: string;
  members: RosterMember[];
}

const ROSTER: RosterGroup[] = [
  {
    group: 1,
    title: '燈還亮著',
    color: '#ff4fd8',
    gradientTo: '#4b0082',
    members: [
      { key: 'nc3gn3o', name: '王子維' },
      { key: 'iuv95yz', name: '蔣宇' },
      { key: 'ftb8cc9', name: '賴桐樂' },
      { key: 're81mkj', name: '吳秉軒' },
    ],
  },
  {
    group: 2,
    title: '暗涌',
    color: '#56e0ff',
    gradientTo: '#004f73',
    members: [
      { key: 'lrl6obv', name: '陳韋辰' },
      { key: 'zs0mokc', name: '林哲瑋' },
      { key: 'l3lbr9o', name: '吳秉融' },
    ],
  },
  {
    group: 3,
    title: '再說',
    color: '#ff6b9d',
    gradientTo: '#7a0b3d',
    members: [
      { key: 'qnfa7xc', name: '蔡佳誼' },
      { key: 'tyd58in', name: '詹承潔' },
      { key: 'yf97tqm', name: '黃煜婷' },
      { key: 'p8aiq3g', name: '陳信穎' },
      { key: '02lz4aj', name: '蔡儀蓁' },
      { key: 'dd4t0kl', name: '廖悅靜' },
    ],
  },
  {
    group: 4,
    title: '這趟旅行如你所願',
    color: '#ffd166',
    gradientTo: '#ff6b00',
    members: [
      { key: 'mn4tzb1', name: '廖翊君' },
      { key: 'cn1fkai', name: '洪鳴姿' },
      { key: 'i91wbti', name: '郭子慈' },
      { key: 'ex9se9t', name: '葉子睿' },
      { key: '42lcsdz', name: '鄭博云' },
      { key: 'uu6ladb', name: '徐嘉宏' },
    ],
  },
  {
    group: 5,
    title: '聚光燈下',
    color: '#b39dff',
    gradientTo: '#4b2ea8',
    members: [
      { key: 'at6y8oz', name: '盧俊諺' },
      { key: 'vuo6avn', name: '江芷誼' },
      { key: 'mdye7le', name: '許慈芳' },
      { key: 'd1m7lxp', name: '許庭綺' },
      { key: 'kunzk67', name: '李怡臻' },
    ],
  },
  {
    group: 6,
    title: '心案',
    color: '#00fbfb',
    gradientTo: '#fe00fe',
    members: [
      { key: 'bogw94o', name: '張景硯' },
      { key: 'f09ehbe', name: '蔡瑋晟' },
      { key: 'gakikhl', name: '穆佳妡' },
      { key: 'ss4r5wz', name: '駱玠樺' },
      { key: 'ohuqej9', name: '歐于甄' },
      { key: 'veiap3j', name: '江嘉儀' },
    ],
  },
  {
    group: 7,
    title: '廟知 廟哉',
    color: '#00ffa3',
    gradientTo: '#00623c',
    members: [
      { key: 'sjb6d8g', name: '余承臻' },
      { key: 'oaacwk5', name: '余佳蓉' },
      { key: 'aufvi8l', name: '林姿宜' },
      { key: 'z0w3hkq', name: '林祐晟' },
      { key: 'qvv8k8p', name: '賴怡蓁' },
      { key: 'm3o76ie', name: '蘇玟綾' },
    ],
  },
  {
    group: 8,
    title: '鄧凱元',
    color: '#a9c6ff',
    gradientTo: '#2b2b6b',
    members: [
      { key: 'k1tyk1o', name: '鄧凱元' },
    ],
  },
  {
    group: 9,
    title: '人生試用期',
    color: '#ffabf3',
    gradientTo: '#e9ddff',
    members: [
      { key: 'm8b1mbm', name: '王婕羽' },
      { key: '66189eq', name: '張溶晏' },
      { key: 'b8qxgdg', name: '陳筱蓁' },
      { key: 'c63pjjz', name: '黃俐文' },
      { key: 's1lv5fo', name: '胡家毓' },
      { key: 'k4d6xfa', name: '林毅蒼' },
    ],
  },
  {
    group: 10,
    title: '匹克球推廣',
    color: '#00dddd',
    gradientTo: '#007070',
    members: [
      { key: 'l2acuds', name: '林仁歆' },
      { key: 'h8qb0hb', name: '林渝喬' },
      { key: 'gqjxce2', name: '賴俊瑋' },
      { key: 'm05mezi', name: '蔡欣芸' },
      { key: 'qwbasfw', name: '何芝賢' },
      { key: 'a80apst', name: '翁嘉亨' },
    ],
  },
  {
    group: 11,
    title: '眠境',
    color: '#ff8fc7',
    gradientTo: '#6a0040',
    members: [
      { key: 'ea81zod', name: '蔡炘洋' },
      { key: 'ftax7fw', name: '洪川育' },
      { key: 'v7mrurw', name: '游翔喻' },
      { key: 's05qwgr', name: '郭維昕' },
      { key: 'qf5gfuq', name: '賴淨安' },
      { key: 'jqfc3uh', name: '李恩宇' },
    ],
  },
  {
    group: 12,
    title: '耍廢日記',
    color: '#7cffcb',
    gradientTo: '#00916e',
    members: [
      { key: 'i5jd7ci', name: '董嫚諼' },
      { key: 'noi0ckm', name: '陳省翰' },
      { key: 'gweulrn', name: '羅文妏' },
      { key: 'ulcopa3', name: '劉晏慈' },
    ],
  },
  {
    group: 13,
    title: '過氧',
    color: '#c6ff4f',
    gradientTo: '#3d7a00',
    members: [
      { key: 'exqvu2b', name: '紀卉柔' },
    ],
  },
  {
    group: 14,
    title: '浪歸途',
    color: '#e9ddff',
    gradientTo: '#7829ff',
    members: [
      { key: 'b8en95o', name: '王婕安' },
      { key: 'jk6xnpv', name: '蘇米宣' },
      { key: 'm97igxq', name: '沈宜萱' },
      { key: 'gv40kem', name: '盧昱臻' },
      { key: 'h79evjd', name: '王苡榛' },
    ],
  },
  {
    group: 15,
    title: '共飲',
    color: '#7cd4ff',
    gradientTo: '#0b3d91',
    members: [
      { key: 'e87bfau', name: '黃豐禾' },
      { key: 'c4acjzh', name: '翁宗邑' },
      { key: '8lh1xeb', name: '黃晨祐' },
      { key: 'mdr0gli', name: '葉至洋' },
      { key: 'mc4bpbg', name: '鄭珈宜' },
      { key: '4sia7xo', name: '汪俊鋒' },
    ],
  },
  {
    group: 16,
    title: '0.1公分的距離',
    color: '#fe00fe',
    gradientTo: '#380038',
    members: [
      { key: 'ant2he6', name: '楊梓涵' },
      { key: 'lo80sjo', name: '陳旻析' },
      { key: 'lc5c9ag', name: '梁貴豪' },
      { key: 'f9tpw0i', name: '林宸均' },
      { key: 'by9p1hd', name: '鄭婕安' },
      { key: 'm8ll3xw', name: '陳昱如' },
    ],
  },
];

/** Ids stay stable across reloads so the seeded pools survive storage round-trips. */
const poolId = (group: number) => `${PRESET_ID_PREFIX}g${String(group).padStart(2, '0')}`;

/**
 * Fresh copy of the preset on every call, so React state can never mutate the
 * module-level roster.
 */
export const createDefaultPrizePools = (): PrizePool[] =>
  ROSTER.map((entry) => ({
    id: poolId(entry.group),
    title: `第${entry.group}組｜${entry.title}`,
    color: entry.color,
    gradientTo: entry.gradientTo,
    items: entry.members.map((member) => ({
      id: `${poolId(entry.group)}-${member.key}`,
      name: member.name,
    })),
    allowRepeat: true,
  }));
