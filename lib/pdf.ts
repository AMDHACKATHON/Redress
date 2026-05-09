import { jsPDF } from 'jspdf';
import { Letter, EscalationLetter } from '@/types';

export const generateComplaintPDF = (letter: Letter) => {
  const doc = new jsPDF();
  const date = new Date(letter.createdAt).toLocaleDateString();

  doc.setFontSize(20);
  doc.text('Formal Complaint Letter', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 30);
  doc.text(`To: ${letter.recipient}`, 20, 35);
  doc.text(`Channel: ${letter.channel}`, 20, 40);

  doc.setFontSize(12);
  const splitLetter = doc.splitTextToSize(letter.letter, 170);
  doc.text(splitLetter, 20, 55);

  const bottomY = doc.internal.pageSize.getHeight() - 40;
  doc.setFontSize(10);
  doc.text('Regulatory Information:', 20, bottomY);
  doc.text(`Regulator: ${letter.regulatorName}`, 20, bottomY + 7);
  doc.text(`Contact: ${letter.regulatorContact}`, 20, bottomY + 14);
  doc.text(`Country: ${letter.regulatorCountry}`, 20, bottomY + 21);

  doc.save(`Complaint_Letter_${letter._id}.pdf`);
};

export const generateEscalationPDF = (escalation: EscalationLetter) => {
  const doc = new jsPDF();
  const date = new Date(escalation.createdAt).toLocaleDateString();

  doc.setFontSize(20);
  doc.text('Escalation Letter to Regulator', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 20, 30);
  doc.text(`Regulator: ${escalation.regulatorName}`, 20, 35);

  doc.setFontSize(12);
  const splitLetter = doc.splitTextToSize(escalation.escalationLetter, 170);
  doc.text(splitLetter, 20, 55);

  doc.setFontSize(10);
  doc.text('Filing Instructions:', 20, 200);
  const splitInstructions = doc.splitTextToSize(escalation.filingInstructions, 170);
  doc.text(splitInstructions, 20, 210);

  const bottomY = doc.internal.pageSize.getHeight() - 20;
  doc.text(`Regulator Contact: ${escalation.regulatorContact}`, 20, bottomY);

  doc.save(`Escalation_Letter_${escalation._id}.pdf`);
};
