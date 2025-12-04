import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, ShadingType, WidthType } from 'docx';
import FileSaver from 'file-saver';
import { BudgetState } from '../types';

const translations = {
  es: {
    title: "RESUMEN DE PRESUPUESTO",
    beneficiary: "Beneficiario:",
    mainWorker: "Albañil Principal:",
    materials: "MATERIALES UTILIZADOS",
    labor: "TRABAJOS REALIZADOS",
    diets: "DIETAS",
    materialsTotal: "TOTAL MATERIALES:",
    laborTotal: "TOTAL MANO DE OBRA:",
    dietsTotal: "TOTAL DIETAS:",
    finalTotal: "PRESUPUESTO TOTAL:",
    approvedBy: "Aprobado por:",
    date: "Fecha:",
    description: "Descripción",
    quantity: "Cant.",
    unit: "Unidad",
    unitPrice: "P. Unitario",
    total: "Total",
    workDescription: "Descripción del Trabajo",
    cost: "Costo",
    workers: "trabajadores",
    days: "días",
    perMeal: "por dieta",
    currency: "MN"
  },
  en: {
    title: "BUDGET SUMMARY",
    beneficiary: "Beneficiary:",
    mainWorker: "Main Worker:",
    materials: "MATERIALS USED",
    labor: "WORK PERFORMED",
    diets: "MEALS",
    materialsTotal: "TOTAL MATERIALS:",
    laborTotal: "TOTAL LABOR:",
    dietsTotal: "TOTAL MEALS:",
    finalTotal: "TOTAL BUDGET:",
    approvedBy: "Approved by:",
    date: "Date:",
    description: "Description",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Unit Price",
    total: "Total",
    workDescription: "Work Description",
    cost: "Cost",
    workers: "workers",
    days: "days",
    perMeal: "per meal",
    currency: "MN"
  }
};

export const generateWordDocument = async (state: BudgetState, lang: 'es' | 'en', totals: { materials: number, labor: number, diet: number, final: number }) => {
  const t = translations[lang];
  
  // Create table header style
  const headerShading = {
    fill: "3498db",
    type: ShadingType.SOLID,
    color: "FFFFFF"
  };

  const headerText = (text: string) => new Paragraph({
    text: text,
    bold: true,
    size: 20, // 10pt
    color: "FFFFFF"
  });

  const cellText = (text: string, bold = false) => new Paragraph({
    text: text,
    bold: bold,
    size: 20 // 10pt
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } // 0.5 inch margins
      },
      children: [
        // Title
        new Paragraph({
          text: t.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),

        // Project Info
        new Paragraph({
          children: [
            new TextRun({ text: t.beneficiary + " ", bold: true }),
            new TextRun({ text: state.projectInfo.beneficiary || "-" })
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
            children: [
              new TextRun({ text: t.mainWorker + " ", bold: true }),
              new TextRun({ text: state.workers[0]?.name || "-" })
            ],
            spacing: { after: 240 }
        }),

        // Materials Section
        new Paragraph({
          text: t.materials,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [headerText(t.description)], shading: headerShading }),
                new TableCell({ children: [headerText(t.quantity)], shading: headerShading }),
                new TableCell({ children: [headerText(t.unit)], shading: headerShading }),
                new TableCell({ children: [headerText(t.unitPrice)], shading: headerShading }),
                new TableCell({ children: [headerText(t.total)], shading: headerShading }),
              ]
            }),
            ...state.materials.filter(m => m.description).map(m => new TableRow({
              children: [
                new TableCell({ children: [cellText(m.description)] }),
                new TableCell({ children: [cellText(m.quantity.toString())] }),
                new TableCell({ children: [cellText(m.unit)] }),
                new TableCell({ children: [cellText(`$${m.unitPrice.toFixed(2)}`)] }),
                new TableCell({ children: [cellText(`$${(m.quantity * m.unitPrice).toFixed(2)}`)] }),
              ]
            }))
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({ text: t.materialsTotal + " ", bold: true }),
            new TextRun({ text: `$${totals.materials.toFixed(2)} ${t.currency}` })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 120, after: 240 }
        }),

        // Labor Section
        new Paragraph({
          text: t.labor,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [headerText(t.workDescription)], shading: headerShading }),
                new TableCell({ children: [headerText(t.cost)], shading: headerShading }),
              ]
            }),
            ...state.labor.filter(l => l.description).map(l => new TableRow({
              children: [
                new TableCell({ children: [cellText(l.description)] }),
                new TableCell({ children: [cellText(`$${l.cost.toFixed(2)}`)] }),
              ]
            }))
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({ text: t.laborTotal + " ", bold: true }),
            new TextRun({ text: `$${totals.labor.toFixed(2)} ${t.currency}` })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 120, after: 240 }
        }),

        // Diet Section
        new Paragraph({
          text: t.diets,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 }
        }),

        new Paragraph({
            text: `${state.diet.workersCount} ${t.workers} × ${state.diet.workDays} ${t.days} × $${state.diet.costPerDiet.toFixed(2)} ${t.perMeal}`,
            spacing: { after: 120 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: t.dietsTotal + " ", bold: true }),
            new TextRun({ text: `$${totals.diet.toFixed(2)} ${t.currency}` })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 120, after: 360 }
        }),

        // Grand Total
        new Paragraph({
            children: [
                new TextRun({ text: "________________________________________________", size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 }
        }),
        
        new Paragraph({
            children: [
                new TextRun({ text: t.finalTotal + " ", bold: true, size: 32 }),
                new TextRun({ text: `$${totals.final.toFixed(2)} ${t.currency}`, bold: true, size: 32 })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),

        // Signatures
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: t.approvedBy, bold: true }), new TextRun({ text: " " + state.signatures.approverName })] }),
                                new Paragraph({ text: " ", spacing: { before: 400 } }),
                                new Paragraph({ text: "_________________________" }),
                                new Paragraph({ text: "Firma" })
                            ],
                            borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: t.date, bold: true }), new TextRun({ text: " " + state.signatures.approvalDate })] })
                            ],
                            borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                        })
                    ]
                })
            ]
        }),

        // Observations
        ...(state.signatures.observations ? [
            new Paragraph({ text: "Observaciones:", bold: true, spacing: { before: 400, after: 120 } }),
            new Paragraph({ text: state.signatures.observations })
        ] : [])
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${state.projectInfo.projectName.replace(/\s+/g, '_') || 'Presupuesto'}_${lang}.docx`;
  
  // Handle file-saver export (default vs named)
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, fileName);
};