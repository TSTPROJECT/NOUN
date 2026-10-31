/**
 * Original character information for Noun (นาวน์).
 *
 * Every Thai string in this file is the owner's original wording and must be
 * kept exactly as written: do not rephrase, translate, "fix" spelling or drop
 * lines. UI chrome around it may change; this text may not.
 */

export const IMAGE_SRC = `${import.meta.env.BASE_URL}images/noun.webp`;
export const IMAGE_WIDTH = 1500;
export const IMAGE_HEIGHT = 2000;
export const IMAGE_ALT =
  'Noun: a young man with pale mint hair with a teal streak and a small leaf sprouting from the top, blue eyes, wearing a light blue shirt and dark teal tie, sipping from a paper snack cup.';

export const identity = {
  name: 'Noun',
  nameTh: 'นาวน์',
  subtitle: 'IT Developer / Logic Enthusiast',
  tagline: 'Another day, another bug to fix.',
};

export const about = {
  heading: 'About Noun นาวน์ (Noun)',
  paragraphs: [
    'หนุ่มไอทีทรงงานหนัก ขอบตาดำนิดๆ จากการปั่นโค้ดและดูแลระบบเว็บไซต์ แต่ปกติเป็นคนเรียบร้อย สุภาพ และอารมณ์ชิลๆ มีความสนใจและหลงใหลในตัวเลข การคำนวณสถิติ และตรรกศาสตร์ทางคณิตศาสตร์เป็นพิเศษ',
    'เวลาว่างมักจะนั่งจิบเครื่องดื่ม กินขนม และนั่งแก้บั๊กงานอย่างเงียบๆ แม้จะดูนิ่งๆนั่งมุมห้อง แต่ถ้ามีใครเดินเข้ามาทักทายก็พร้อมคุยด้วยอย่างเป็นมิตรเสมอ',
  ],
};

export const triggers = {
  heading: 'Triggers Character',
  items: ['เสียงดังโวยวายฉับพลัน', 'งานระบบล่มกะทันหันในวันหยุด'],
};

export const personalNotes = {
  heading: 'Personal Notes',
  items: [
    'ติดนิสัยชอบแก้โจทย์คณิตศาสตร์หรือมองทุกอย่างรอบตัวให้กลายเป็นสมการเวลาเครียด',
    'ถ้าถึงเวลากินขนม/พักผ่อน ใครมาตามงานไอทีอาจจะโดนส่งสายตาเนือยๆใส่เล็กน้อยก่อนยอมไปทำตามหน้าที่',
  ],
};

export const preferences = {
  preferencesLabel: 'Preferences',
  preferences: ['HL', 'BL', 'Switch'],
  statusLabel: 'Status',
  status: 'No lock love',
  note: 'จีบได้ แต่จีบไม่เท่ากับติดนะครับ',
};

export const parent = {
  heading: 'About parent',
  intro:
    'ผู้ดูแล 20+ สะดวกเล่นเรทหรือคู่กับคาร์ที่หลังม่านบรรลุนิติภาวะแล้ว โอเคกับเนื้อหาแนวติดเรททุกรูปแบบค้าบ',
  items: [
    'เวลาแอคทีพเรื่อยๆ ถึง 00:00',
    'ชอบเมา บางวันพิมพ์มั่วหรือหายคือ ไปแล้ว',
    'ถ้าคุณเทโรล เมิน ดองแชท อ่านไม่ตอบ อิสโอเค',
    'เปิดโรลได้เลยโดยไม่ต้องขอก่อน',
    'เสาร์อาทิตย์ติดงาน อาจจะหายยาวเลย',
    'โอเคกับการเล่นกับใจ สารพัดการกระทำไม่ดี เล่นตามคาร์ได้อิสระ กั้กได้ เป็นตัวสำรองได้ ความสัมพันธ์แบบเปิดก็โอเค คบแล้วเลิก ก็โอเค แต่ไม่โอเคกับการเอาไปเป็นมือที่สามของความสัมพันธ์อื่น (เช่นล็อคคู่มาแล้วแต่มาขอมีซัมติงกัน)',
  ],
  footnote: 'เป็นตัวละคร ยืมเมจ',
};

export const sections = [
  { id: 'home', index: '01', label: 'Boot' },
  { id: 'about', index: '02', label: 'About' },
  { id: 'details', index: '03', label: 'Details' },
  { id: 'preferences', index: '04', label: 'Preferences' },
  { id: 'workspace', index: '05', label: 'Workspace' },
  { id: 'parent', index: '06', label: 'Parent' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
