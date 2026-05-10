'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PDFDownloadButtonProps {
  letter: string;
  userName?: string | null;
  orgName?: string | null;
  variant?: 'complaint' | 'escalation';
}

function slugify(s: string): string {
  return s
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function extractOrg(recipient: string): string {
  const parts = recipient.split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || recipient;
}

export default function PDFDownloadButton({
  letter,
  userName,
  orgName,
  variant = 'complaint',
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 22;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 6.2;
      const paragraphGap = 4;
      const topY = 30;
      const bottomLimit = pageHeight - 22;

      const drawWatermark = () => {
        doc.saveGraphicsState();
        // very faint grey, large, rotated 45° across the page center
        doc.setTextColor(225, 225, 225);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(120);
        doc.text('Redress', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          baseline: 'middle',
          angle: 35,
        });
        doc.restoreGraphicsState();
      };

      const drawFooter = () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(
          'Generated with Redress',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      };

      const startPage = () => {
        drawWatermark();
        drawFooter();
        // Reset to body text style
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11.5);
        doc.setTextColor(30, 30, 30);
      };

      startPage();

      let y = topY;

      const paragraphs = letter
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

      for (const paragraph of paragraphs) {
        const lines: string[] = doc.splitTextToSize(paragraph, contentWidth);
        for (const line of lines) {
          if (y > bottomLimit) {
            doc.addPage();
            startPage();
            y = topY;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += paragraphGap;
      }

      const safeUser = userName ? slugify(userName) : 'user';
      const safeOrg = orgName ? slugify(extractOrg(orgName)) : 'recipient';
      const docKind = variant === 'escalation' ? 'escalation' : 'complaint';
      const filename = `${safeOrg}_${docKind}_${safeUser}_Redress.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center justify-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
    >
      {isGenerating ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Download size={18} />
      )}
      <span>{isGenerating ? 'Generating...' : 'Download as PDF'}</span>
    </button>
  );
}
