// Exam document format registry — popular Indian recruitment / entrance exams.
//
// Each exam spec describes the scanned image the candidate must upload.
// Where the official notice gives KB + cm but NO pixel size, pixels are an
// approximation at the stated DPI and are labelled "approx." — candidates must
// verify against the latest notification before submitting.
//
// kb = file size in KB (1 KB = 1024 bytes). dpi = pixels-per-inch used for
// cm→px conversion when the notice only states centimetres.

export const EXAM_FORMATS = {
  ssc: {
    id: 'ssc',
    label: 'SSC (CGL / CHSL / GD / MTS)',
    body: 'Staff Selection Commission',
    note: '2026+ SSC captures the photo live in the app (no photo file). Signature only: JPEG, about 6×2 cm, 10–20 KB.',
    photo: { width: 200, height: 230, minKb: 20, maxKb: 50, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 20, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [],
  },
  cuet: {
    id: 'cuet',
    label: 'CUET (UG / PG) — NTA',
    body: 'Common University Entrance Test',
    note: 'Photo 10–200 KB, signature 10–50 KB, JPEG. 80% face, white background. Live photo also captured in-app.',
    photo: { width: 200, height: 230, minKb: 10, maxKb: 200, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 50, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'disability', label: 'Disability / UDID Certificate', minKb: 50, maxKb: 300, format: 'application/pdf' },
      { id: 'idproof', label: 'Identity Proof (non-Aadhaar)', minKb: 10, maxKb: 200, format: 'image/jpeg' },
    ],
  },
  neet: {
    id: 'neet',
    label: 'NEET (UG) — NTA',
    body: 'National Eligibility cum Entrance Test',
    note: 'Photo 10–200 KB, signature 10–100 KB, JPEG. No fixed pixel size in the notice.',
    photo: { width: 200, height: 230, minKb: 10, maxKb: 200, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 100, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'idproof', label: 'Identity Proof', minKb: 10, maxKb: 200, format: 'image/jpeg' },
    ],
  },
  jee: {
    id: 'jee',
    label: 'JEE (Main) — NTA',
    body: 'Joint Entrance Examination Main',
    note: 'Photo 10–200 KB, signature 10–100 KB, JPEG. No fixed pixel size in the notice.',
    photo: { width: 200, height: 230, minKb: 10, maxKb: 200, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 100, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'idproof', label: 'Identity Proof', minKb: 10, maxKb: 200, format: 'image/jpeg' },
    ],
  },
  nda: {
    id: 'nda',
    label: 'NDA / NA — UPSC',
    body: 'National Defence Academy / Naval Academy',
    note: 'Photo & signature JPEG, 20–200 KB / 20–100 KB. Photo needs name + date banner at bottom (white strip). Face ≥75%, plain white bg.',
    photo: { width: 350, height: 350, minKb: 20, maxKb: 200, format: 'image/jpeg', dpi: 100, banner: true },
    signature: { width: 350, height: 350, minKb: 20, maxKb: 100, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'idproof', label: 'Photo ID (non-Aadhaar)', minKb: 20, maxKb: 200, format: 'image/jpeg' },
      { id: 'cert', label: 'Matriculation / 10th Certificate', minKb: 50, maxKb: 300, format: 'application/pdf' },
    ],
  },
  upsc: {
    id: 'upsc',
    label: 'UPSC (CSE / CDS / CAPF / OTR)',
    body: 'Union Public Service Commission',
    note: 'Strict 1:1 square, min 350×350 px, max 1000×1000 px, 20–300 KB, JPEG. Photo needs name + date banner at bottom.',
    photo: { width: 350, height: 350, minKb: 20, maxKb: 300, format: 'image/jpeg', dpi: 100, banner: true },
    signature: { width: 350, height: 350, minKb: 20, maxKb: 300, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'cert', label: 'Certificate / Document', minKb: 50, maxKb: 300, format: 'application/pdf' },
    ],
  },
  ibps: {
    id: 'ibps',
    label: 'IBPS (PO / Clerk / SO / RRB)',
    body: 'Institute of Banking Personnel Selection',
    note: 'Photo 200×230 px 20–50 KB, signature 140×60 px 10–20 KB, JPEG. Left thumb + handwritten declaration also needed.',
    photo: { width: 200, height: 230, minKb: 20, maxKb: 50, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 20, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [
      { id: 'thumb', label: 'Left Thumb Impression', minKb: 20, maxKb: 50, format: 'image/jpeg' },
      { id: 'declaration', label: 'Handwritten Declaration', minKb: 50, maxKb: 100, format: 'application/pdf' },
    ],
  },
  ctet: {
    id: 'ctet',
    label: 'CTET — CBSE',
    body: 'Central Teacher Eligibility Test',
    note: 'Photo 3.5×4.5 cm (≈413×531 px), 10–100 KB. Signature 3.5×1.5 cm (≈413×177 px), 4–30 KB. JPEG.',
    photo: { width: 413, height: 531, minKb: 10, maxKb: 100, format: 'image/jpeg', dpi: 300, banner: false },
    signature: { width: 413, height: 177, minKb: 4, maxKb: 30, format: 'image/jpeg', dpi: 300, banner: false },
    documents: [],
  },
  gate: {
    id: 'gate',
    label: 'GATE',
    body: 'Graduate Aptitude Test in Engineering',
    note: 'Photo 240×320 px 5–500 KB, signature 160×100 px 5–500 KB. JPEG.',
    photo: { width: 240, height: 320, minKb: 5, maxKb: 500, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 160, height: 100, minKb: 5, maxKb: 500, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [],
  },
  sbi: {
    id: 'sbi',
    label: 'SBI (PO / Clerk / SO)',
    body: 'State Bank of India',
    note: 'Photo 200×230 px 20–50 KB, signature 140×60 px 10–20 KB. JPEG.',
    photo: { width: 200, height: 230, minKb: 20, maxKb: 50, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: 140, height: 60, minKb: 10, maxKb: 20, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [],
  },
  custom: {
    id: 'custom',
    label: 'Custom dimensions',
    body: 'Your own size',
    note: 'Enter your own width, height, KB target and format.',
    photo: { width: null, height: null, minKb: null, maxKb: null, format: 'image/jpeg', dpi: 100, banner: false },
    signature: { width: null, height: null, minKb: null, maxKb: null, format: 'image/jpeg', dpi: 100, banner: false },
    documents: [],
  },
};

export const DOCUMENT_TYPES = ['photo', 'signature', 'document'];

export function getExam(id) {
  return EXAM_FORMATS[id] ?? EXAM_FORMATS.custom;
}

export function listExams() {
  return Object.values(EXAM_FORMATS);
}
