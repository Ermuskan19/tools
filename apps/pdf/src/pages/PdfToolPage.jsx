import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToolLayout, ToolLanding } from '@zegnite/shared-ui';
import { Icons } from '@zegnite/shared-ui';
import {
  PdfMerger, PdfSplitter, PdfCompressor, PdfToWord, WordToPdf,
  PdfToJpg, JpgToPdf, PdfToTxt, TxtToPdf, WordToTxt,
  PdfToExcel, ExcelToPdf, PdfToPpt, PptToPdf, UrlToPdf, HtmlToPdf, ScanToPdf,
  RemovePdfPages, RotatePdf, ReorderPdfPages, ExtractImages,
  OcrPdf, ComparePdfs,
  EditPdf, SignPdf, AddWatermark, PageNumbers,
  ProtectPdf, UnlockPdf, PdfRedact,
  ApplicationBundleMaker, BankStatementToExcel, KycWatermark, MaskAadhaarPdf
} from '@zegnite/pdf-tools';
import { pdfToolsBySlug } from '../data/pdfTools';

const LIVE_TOOLS = {
  'pdf-merger': PdfMerger,
  'pdf-splitter': PdfSplitter,
  'pdf-compressor': PdfCompressor,
  'pdf-to-word': PdfToWord,
  'word-to-pdf': WordToPdf,
  'pdf-to-jpg': PdfToJpg,
  'jpg-to-pdf': JpgToPdf,
  'pdf-to-txt': PdfToTxt,
  'txt-to-pdf': TxtToPdf,
  'word-to-txt': WordToTxt,
  'pdf-to-excel': PdfToExcel,
  'excel-to-pdf': ExcelToPdf,
  'pdf-to-ppt': PdfToPpt,
  'ppt-to-pdf': PptToPdf,
  'url-to-pdf': UrlToPdf,
  'html-to-pdf': HtmlToPdf,
  'scan-to-pdf': ScanToPdf,
  'remove-pdf-pages': RemovePdfPages,
  'rotate-pdf': RotatePdf,
  'reorder-pdf-pages': ReorderPdfPages,
  'extract-images': ExtractImages,
  'ocr-pdf': OcrPdf,
  'compare-pdfs': ComparePdfs,
  'edit-pdf': EditPdf,
  'sign-pdf': SignPdf,
  'add-watermark': AddWatermark,
  'page-numbers': PageNumbers,
  'protect-pdf': ProtectPdf,
  'unlock-pdf': UnlockPdf,
  'pdf-redact': PdfRedact,
  'application-bundle-maker': ApplicationBundleMaker,
  'bank-statement-to-excel': BankStatementToExcel,
  'kyc-watermark': KycWatermark,
  'mask-aadhaar-pdf': MaskAadhaarPdf
};

function useLocationParams() {
  const location = useLocation();
  const parts = location.pathname.split('/');
  return { slug: parts[1] || null };
}

const ComingSoon = ({ tool, related }) => (
  <ToolLayout title={tool.title} description={tool.tagline}>
    <div className="tool-pane-single">
      <div className="empty-state">
        <h2>Coming soon</h2>
        <p>{tool.title} is being added to 3toOne PDF. Like every tool here, it will run entirely in your browser — nothing is uploaded.</p>
        <a href="/" className="tool-btn tool-btn-primary">Browse PDF tools</a>
      </div>
      <ToolLanding tool={tool} related={related} />
    </div>
  </ToolLayout>
);

const NotFound = () => (
  <div className="tool-page">
    <div className="tool-page-header">
      <a href="/" className="tool-back">
        <Icons.ArrowLeft className="back-arrow" /> Back to PDF tools
      </a>
      <div className="tool-info">
        <h1 className="tool-title">Tool not found</h1>
        <p className="tool-desc">The PDF tool you're looking for doesn't exist.</p>
      </div>
    </div>
  </div>
);

export const PdfToolPage = () => {
  const { slug } = useLocationParams();
  const tool = pdfToolsBySlug[slug];
  const Component = LIVE_TOOLS[slug];

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem('3toone-recent');
      let recent = stored ? JSON.parse(stored) : [];
      recent = [slug, ...recent.filter(s => s !== slug)].slice(0, 6);
      localStorage.setItem('3toone-recent', JSON.stringify(recent));
    } catch { /* storage unavailable (private mode) — ignore */ }
  }, [slug]);

  if (!tool) return <NotFound />;

  const related = Object.values(pdfToolsBySlug)
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4)
    .map((t) => ({ ...t, href: `/${t.slug}` }));

  if (!Component) return <ComingSoon tool={tool} related={related} />;

  return (
    <>
      <Component title={tool.title} description={tool.tagline} />
      <div className="container">
        <ToolLanding tool={tool} related={related} />
      </div>
    </>
  );
};

export default PdfToolPage;
