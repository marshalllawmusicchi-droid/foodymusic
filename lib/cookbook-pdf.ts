import PDFDocument from "pdfkit";
import type { CookbookRecipe, CookbookSection, CookbookWithContents } from "../src/types/cookbook";

const PAGE = { width: 612, height: 792, margin: 54 };

const addFooter = (doc: PDFKit.PDFDocument, label: string) => {
  doc.fontSize(9).fillColor("#666666").text(label, PAGE.margin, PAGE.height - 36, {
    width: PAGE.width - PAGE.margin * 2,
    align: "center",
  });
};

const addCoverPage = (doc: PDFKit.PDFDocument, cookbook: CookbookWithContents) => {
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#111111");
  doc.fillColor("#f59e0b").fontSize(12).text("FOODY MUSIC COOKBOOK", PAGE.margin, 120, {
    width: PAGE.width - PAGE.margin * 2,
    align: "center",
    characterSpacing: 2,
  });
  doc.fillColor("#ffffff").fontSize(34).text(cookbook.title, PAGE.margin, 180, {
    width: PAGE.width - PAGE.margin * 2,
    align: "center",
  });
  if (cookbook.subtitle) {
    doc.fontSize(16).fillColor("#d4d4d8").text(cookbook.subtitle, PAGE.margin, doc.y + 12, {
      width: PAGE.width - PAGE.margin * 2,
      align: "center",
    });
  }
  if (cookbook.authorName) {
    doc.fontSize(14).fillColor("#a1a1aa").text(`by ${cookbook.authorName}`, PAGE.margin, PAGE.height - 160, {
      width: PAGE.width - PAGE.margin * 2,
      align: "center",
    });
  }
};

const addDedicationPage = (doc: PDFKit.PDFDocument, cookbook: CookbookWithContents) => {
  doc.addPage();
  doc.fillColor("#111111").fontSize(12).text("DEDICATION", PAGE.margin, 100, { characterSpacing: 2 });
  doc.fontSize(16).fillColor("#27272a").text(
    cookbook.dedication || "For everyone who cooks with heart, hunger, and a great playlist.",
    PAGE.margin,
    150,
    { width: PAGE.width - PAGE.margin * 2, lineGap: 8 },
  );
};

const addTableOfContents = (
  doc: PDFKit.PDFDocument,
  cookbook: CookbookWithContents,
  sectionPageMap: Map<string, number>,
) => {
  doc.addPage();
  doc.fillColor("#111111").fontSize(20).text("Table of Contents", PAGE.margin, PAGE.margin);
  let y = PAGE.margin + 40;

  cookbook.sections.forEach((section) => {
    const sectionRecipes = cookbook.recipes.filter((recipe) => recipe.sectionId === section.id);
    if (sectionRecipes.length === 0) return;

    doc.fontSize(13).fillColor("#b45309").text(section.title, PAGE.margin, y);
    y += 20;

    sectionRecipes.forEach((recipe) => {
      const page = sectionPageMap.get(recipe.id) ?? "-";
      doc.fontSize(11).fillColor("#3f3f46").text(recipe.recipeSnapshot.title, PAGE.margin + 16, y, {
        continued: true,
        width: PAGE.width - PAGE.margin * 2 - 40,
      });
      doc.text(String(page), { align: "right" });
      y += 18;
      if (y > PAGE.height - PAGE.margin) {
        doc.addPage();
        y = PAGE.margin;
      }
    });
    y += 8;
  });
};

const addSectionDivider = (doc: PDFKit.PDFDocument, section: CookbookSection) => {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#fef3c7");
  doc.fillColor("#92400e").fontSize(28).text(section.title, PAGE.margin, PAGE.height / 2 - 20, {
    width: PAGE.width - PAGE.margin * 2,
    align: "center",
  });
};

const addRecipePage = (doc: PDFKit.PDFDocument, recipe: CookbookRecipe) => {
  const snapshot = recipe.recipeSnapshot;
  doc.addPage();
  doc.fillColor("#111111").fontSize(22).text(snapshot.title, PAGE.margin, PAGE.margin, {
    width: PAGE.width - PAGE.margin * 2,
  });
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#71717a").text(
    `${snapshot.cuisine} · ${snapshot.servings} servings · ${snapshot.prepTime} min prep · ${snapshot.cookTime} min cook`,
  );
  doc.moveDown(0.8);
  doc.fontSize(11).fillColor("#3f3f46").text(snapshot.description, {
    width: PAGE.width - PAGE.margin * 2,
    lineGap: 4,
  });
  doc.moveDown(1);
  doc.fontSize(12).fillColor("#b45309").text("Ingredients");
  doc.moveDown(0.3);
  snapshot.ingredients.forEach((item) => {
    doc.fontSize(10).fillColor("#27272a").text(`• ${item.name} — ${item.qty}`);
  });
  doc.moveDown(0.8);
  doc.fontSize(12).fillColor("#b45309").text("Instructions");
  doc.moveDown(0.3);
  snapshot.steps.forEach((step, index) => {
    doc.fontSize(10).fillColor("#27272a").text(`${index + 1}. ${step}`, {
      width: PAGE.width - PAGE.margin * 2,
      lineGap: 4,
    });
    doc.moveDown(0.3);
  });
  if (recipe.personalNotes) {
    doc.moveDown(0.6);
    doc.fontSize(11).fillColor("#b45309").text("Personal Notes");
    doc.fontSize(10).fillColor("#52525b").text(recipe.personalNotes, {
      width: PAGE.width - PAGE.margin * 2,
      lineGap: 4,
    });
  }
  addFooter(doc, snapshot.title);
};

export const renderCookbookPdf = (cookbook: CookbookWithContents): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const sectionPageMap = new Map<string, number>();
    let pageNumber = 4;

    cookbook.sections.forEach((section) => {
      const sectionRecipes = cookbook.recipes.filter((recipe) => recipe.sectionId === section.id);
      if (sectionRecipes.length === 0) return;
      pageNumber += 1;
      sectionRecipes.forEach((recipe) => {
        sectionPageMap.set(recipe.id, pageNumber + 1);
        pageNumber += 2;
      });
    });

    const doc = new PDFDocument({ size: "LETTER", margin: PAGE.margin });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    addCoverPage(doc, cookbook);
    addDedicationPage(doc, cookbook);
    addTableOfContents(doc, cookbook, sectionPageMap);

    cookbook.sections.forEach((section) => {
      const sectionRecipes = cookbook.recipes.filter((recipe) => recipe.sectionId === section.id);
      if (sectionRecipes.length === 0) return;
      addSectionDivider(doc, section);
      sectionRecipes.forEach((recipe) => addRecipePage(doc, recipe));
    });

    doc.end();
  });
