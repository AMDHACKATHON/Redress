'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PDFDownloadButtonProps {
  letter: string;
  filename: string;
}

export default function PDFDownloadButton({ letter, filename }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Add Redress Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Redress', margin, 25);

      // Add a horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 30, pageWidth - margin, 30);

      // Add Letter Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      const splitText = doc.splitTextToSize(letter, contentWidth);
      
      // Starting Y position for the letter text
      let y = 45;
      
      // Handle multi-page if necessary
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], margin, y);
        y += 6; // Line height
      }

      doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
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
