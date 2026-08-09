import ExcelJS from "exceljs";

type Cell = string | number | null | undefined;
type SheetInput = {
  name: string;
  rows: Cell[][];
  headerRow?: number; // 1-based row index to bold
};

export async function xlsxResponse(filename: string, sheets: SheetInput[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Fariman Ops";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name.slice(0, 31) || "Sheet1");
    ws.views = [{ rightToLeft: true }];

    for (const row of sheet.rows) {
      ws.addRow(row.map((v) => (v == null ? "" : v)));
    }

    const headerIdx = sheet.headerRow ?? 1;
    const header = ws.getRow(headerIdx);
    header.font = { bold: true };
    header.commit();

    // simple auto width
    const colCount = Math.max(1, ...sheet.rows.map((r) => r.length));
    for (let i = 1; i <= colCount; i++) {
      let max = 10;
      for (const r of sheet.rows) {
        const val = r[i - 1];
        const len = val == null ? 0 : String(val).length;
        if (len > max) max = Math.min(len + 2, 48);
      }
      ws.getColumn(i).width = max;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const body = Buffer.from(buffer);
  const safeName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;

  return new Response(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}
