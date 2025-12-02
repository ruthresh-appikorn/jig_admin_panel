/**
 * Professional PDF Generator for Test Reports
 * Inspired by Flutter implementation with jsPDF
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface TestData {
  COMPONENT?: {
    NAME?: string;
    TYPE?: string;
  };
  TESTING_ID?: string;
  TESTER_NAME?: string;
  DETAILS?: Array<{
    TEST_NAME?: string;
    REMARKS?: string;
    DATAS?: Array<{
      SUB_COMPONENT_SERIAL_NO?: string;
      REASON?: string;
      QC_STATUS?: string;
      INSPECTION?: string;
      CRITERIA?: Array<{
        VALUE?: string;
        DESC?: string;
      }>;
    }>;
  }>;
  TIME?: string;
  COMPONENT_SERIAL_NO?: string;
  COMPONENT_ID?: string;
}

/**
 * Safely converts any value to string, handling null values
 */
function safeToString(value: any): string {
  if (value === null || value === undefined) return "-";
  if (
    typeof value === "string" &&
    (value.trim() === "" || value.toLowerCase() === "null")
  )
    return "-";
  return value.toString();
}

/**
 * Formats millisecond timestamp to readable date
 */
function formatDateTime(ms: string | number): string {
  const timestamp = typeof ms === "string" ? parseInt(ms) : ms;
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Builds professional header with logo and title
 */
function buildProfessionalHeader(
  doc: jsPDF,
  title: string,
  pageNumber: number
) {
  if (pageNumber !== 1) return;

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  // Company name/logo placeholder
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("SCHOPIQ", 14, 15);

  // Title - centered
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const titleWidth = doc.getTextWidth(title.toUpperCase());
  doc.text(title.toUpperCase(), (pageWidth - titleWidth) / 2, 22);
}

/**
 * Builds professional footer
 */
function buildProfessionalFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

  // Footer text
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This document is a system generated report", 14, pageHeight - 12);

  const poweredByText = "Powered by Schopiq";
  const poweredByWidth = doc.getTextWidth(poweredByText);
  doc.text(poweredByText, pageWidth - 14 - poweredByWidth, pageHeight - 12);
}

/**
 * Builds a section with title and key-value table
 */
function buildSection(
  doc: jsPDF,
  title: string,
  data: Record<string, string>,
  startY: number
): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, startY);

  const tableData = Object.entries(data).map(([key, value]) => [
    key,
    safeToString(value),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Builds pump test table
 */
function buildPumpTestTable(
  doc: jsPDF,
  title: string,
  pumpTests: any[],
  startY: number
): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, startY);

  const tableData = pumpTests.map((pump) => [
    safeToString(pump.serial_no),
    safeToString(pump.component_name),
    safeToString(pump.status),
    safeToString(pump.info?.flowmeter),
    safeToString(pump.info?.duration),
    safeToString(pump.info?.status),
    safeToString(pump.override_report?.reason),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [
      [
        "Serial No",
        "Component",
        "Status",
        "Flowmeter",
        "Duration (s)",
        "Reason",
        "Remark",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      2: {
        cellWidth: 25,
        halign: "center",
      },
    },
    didParseCell: function (data) {
      if (data.column.index === 2 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "PASSED") {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "FAILED") {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Builds advanced pump test table
 */
function buildAdvancedPumpTestTable(
  doc: jsPDF,
  title: string,
  advTests: any[],
  startY: number
): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, startY);

  const tableData = advTests.map((test) => [
    safeToString(test.serial_no),
    safeToString(test.name),
    safeToString(test.status),
    safeToString(test.flowmeter),
    safeToString(test.duration),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [["Serial No", "Name", "Status", "Flowmeter", "Duration (s)"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    didParseCell: function (data) {
      if (data.column.index === 2 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "PASSED") {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "FAILED") {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Builds boiler test table
 */
function buildBoilerTestTable(
  doc: jsPDF,
  title: string,
  boilers: any[],
  startY: number
): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, startY);

  const tableData = boilers.map((boiler) => [
    safeToString(boiler.serial_no),
    safeToString(boiler.component_name),
    safeToString(boiler.inlet_pressure_gauge),
    safeToString(boiler.outlet_pressure_gauge),
    safeToString(boiler.observed_duration),
    safeToString(boiler.noticed_any_air_leakage),
    safeToString(boiler.selected_issue),
    safeToString(boiler.qc_status),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [
      [
        "Serial No",
        "Component",
        "Inlet (bar)",
        "Outlet (bar)",
        "Duration (s)",
        "Air Leakage",
        "Issue",
        "QC Status",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 7,
    },
    didParseCell: function (data) {
      if (data.column.index === 7 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "PASSED") {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "FAILED") {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Builds simple test table for 3-in-1 components
 */
function buildSimpleTestTable(
  doc: jsPDF,
  title: string,
  tests: any[],
  startY: number
): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, startY);

  const tableData = tests.map((test) => [
    safeToString(test.inspection),
    safeToString(test.qc_status),
    safeToString(test.remarks),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [["Name", "QC Status", "Remarks"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    didParseCell: function (data) {
      if (data.column.index === 2 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "PASSED") {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = "bold";
        } else if (status === "FAILED") {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Handles PDF output based on mode
 */
function handlePdfOutput(
  doc: jsPDF,
  fileName: string,
  mode: "download" | "view"
) {
  if (mode === "view") {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } else {
    doc.save(fileName);
  }
}

/**
 * Downloads or views pump PDF with professional formatting
 */
export async function downloadPumpPdf(
  data: TestData,
  mode: "download" | "view" = "download"
): Promise<void> {
  const doc = new jsPDF();
  let yPosition = 40;

  // Header
  buildProfessionalHeader(doc, "Pump Test Report", 1);

  // Jig Details
  yPosition = buildSection(
    doc,
    "Jig Details",
    {
      Component: data.COMPONENT?.NAME || "-",
      "Component Type": data.COMPONENT?.TYPE || "-",
      "Machine Name": data.COMPONENT_SERIAL_NO || "-",
      "QC Tester Name": data.TESTER_NAME || "-",
      "Date Time": formatDateTime(data.TIME || "0"),
    },
    yPosition
  );

  // Visual Test (if available)
  const visualTest = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "visual_test"
  );
  if (visualTest?.DATAS?.[0]) {
    yPosition = buildSection(
      doc,
      "Visual Test",
      {
        Status: visualTest.DATAS[0].QC_STATUS || "-",
      },
      yPosition
    );
  }

  // Check if we need a new page
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Pump Tests
  const pumpTests = data.DETAILS?.filter(
    (d) =>
      d.TEST_NAME?.toLowerCase() === "on_off" ||
      d.TEST_NAME?.toLowerCase() === "pump_test"
  );

  if (pumpTests && pumpTests.length > 0) {
    const pumpTestData = pumpTests.flatMap((test) =>
      (test.DATAS || []).map((pumpData) => {
        let flowmeter = "0";
        let time = "0";

        if (pumpData.CRITERIA) {
          for (const criteria of pumpData.CRITERIA) {
            if (criteria.DESC?.toLowerCase() === "flowmeter") {
              flowmeter = criteria.VALUE || "0";
            } else if (criteria.DESC?.toLowerCase() === "time") {
              time = criteria.VALUE || "0";
            }
          }
        }

        return {
          serial_no: pumpData.SUB_COMPONENT_SERIAL_NO || "N/A",
          component_name: pumpData.INSPECTION || "N/A",
          status: pumpData.QC_STATUS?.toUpperCase() || "IDLE",
          info: {
            flowmeter,
            duration: time,
            status: pumpData.REASON || "-",
          },
          override_report: {
            reason: test.REMARKS || "-",
          },
        };
      })
    );

    yPosition = buildPumpTestTable(doc, "Pump Tests", pumpTestData, yPosition);
  }

  // Advanced Leakage Tests
  const advLeakageTests = data.DETAILS?.filter(
    (d) =>
      d.TEST_NAME?.toLowerCase() === "adv_leakage" ||
      d.TEST_NAME?.toLowerCase() === "adv_block_and_leakage_test"
  );

  if (advLeakageTests && advLeakageTests.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    const advTestData = advLeakageTests.flatMap((test) =>
      (test.DATAS || []).map((data) => {
        let flowmeter = "0";
        let time = "0";

        if (data.CRITERIA) {
          for (const criteria of data.CRITERIA) {
            if (criteria.DESC?.toLowerCase() === "flowmeter") {
              flowmeter = criteria.VALUE || "0";
            } else if (criteria.DESC?.toLowerCase() === "time") {
              time = criteria.VALUE || "0";
            }
          }
        }

        return {
          serial_no: data.SUB_COMPONENT_SERIAL_NO || "N/A",
          name: data.INSPECTION || "N/A",
          status: data.QC_STATUS?.toUpperCase() || "IDLE",
          flowmeter,
          duration: time,
        };
      })
    );

    yPosition = buildAdvancedPumpTestTable(
      doc,
      "Advanced Block and Leakage Test",
      advTestData,
      yPosition
    );
  }

  // Engineering Remarks
  const enggRemarks = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "engg_remarks"
  );

  if (enggRemarks?.DATAS?.[0]) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    const criteriaList = enggRemarks.DATAS[0].CRITERIA || [];
    const noticedIssue =
      criteriaList.find((c) => c.VALUE?.toLowerCase() === "noticed issue")
        ?.DESC || "No";
    const remarks =
      criteriaList.find((c) => c.VALUE?.toLowerCase() === "remark")?.DESC ||
      "-";

    buildSection(
      doc,
      "Engineering Remarks",
      {
        "Noticed Any Leakage": noticedIssue,
        Remark: remarks,
      },
      yPosition
    );
  }

  // Footer
  buildProfessionalFooter(doc, 1);

  // Output PDF
  const fileName = `pump-${
    data.COMPONENT_SERIAL_NO || "report"
  }-${Date.now()}.pdf`;
  handlePdfOutput(doc, fileName, mode);
}

/**
 * Downloads or views boiler PDF with professional formatting
 */
export async function downloadBoilerPdf(
  data: TestData,
  mode: "download" | "view" = "download"
): Promise<void> {
  const doc = new jsPDF();
  let yPosition = 40;

  // Header
  buildProfessionalHeader(doc, "Boiler Test Report", 1);

  // Jig Details
  yPosition = buildSection(
    doc,
    "Jig Details",
    {
      Component: data.COMPONENT?.NAME || "-",
      "Component Type": data.COMPONENT?.TYPE || "-",
      "Machine Name": data.COMPONENT_SERIAL_NO || "-",
      "QC Tester Name": data.TESTER_NAME || "-",
      "Date Time": formatDateTime(data.TIME || "0"),
    },
    yPosition
  );

  // Visual Test
  const visualTest = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "visual_test"
  );
  if (visualTest?.DATAS?.[0]) {
    yPosition = buildSection(
      doc,
      "Visual Test",
      {
        Status: visualTest.DATAS[0].QC_STATUS || "-",
      },
      yPosition
    );
  }

  // Boiler Tests
  const boilerTests = data.DETAILS?.filter(
    (d) => d.TEST_NAME?.toLowerCase() === "boiler_test"
  );

  if (boilerTests && boilerTests.length > 0) {
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }

    const boilerTestData = boilerTests.flatMap((test) =>
      (test.DATAS || []).map((boilerData) => {
        let inlet = "0";
        let outlet = "0";
        let anyLeakage = "no";
        let issue = "-";

        if (boilerData.CRITERIA) {
          for (const criteria of boilerData.CRITERIA) {
            const desc = criteria.DESC?.toLowerCase() || "";
            if (desc === "inlet") {
              inlet = criteria.VALUE || "0";
            } else if (desc === "outlet") {
              outlet = criteria.VALUE || "0";
            } else if (desc === "any leakage") {
              anyLeakage = criteria.VALUE || "no";
            } else if (desc === "issue") {
              issue = criteria.VALUE || "-";
            }
          }
        }

        // Determine QC status
        const inletValue = parseFloat(inlet) || 0;
        const outletValue = parseFloat(outlet) || 0;
        const leakage = anyLeakage.toLowerCase();

        let qcStatus;
        if (leakage !== "no") {
          qcStatus = "FAILED";
        } else if (inletValue === 0 || outletValue === 0) {
          qcStatus = "IDLE";
        } else if (
          Math.abs(inletValue - outletValue) <= 0.5 &&
          leakage === "no"
        ) {
          qcStatus = "PASSED";
        } else {
          qcStatus = "FAILED";
        }

        return {
          serial_no: boilerData.SUB_COMPONENT_SERIAL_NO || "N/A",
          component_name: boilerData.INSPECTION || "N/A",
          inlet_pressure_gauge: inlet,
          outlet_pressure_gauge: outlet,
          observed_duration: "30",
          noticed_any_air_leakage: anyLeakage,
          selected_issue: qcStatus === "PASSED" ? "-" : issue,
          qc_status: qcStatus,
        };
      })
    );

    yPosition = buildBoilerTestTable(
      doc,
      "Boiler Test Results",
      boilerTestData,
      yPosition
    );
  }

  // Footer
  buildProfessionalFooter(doc, 1);

  // Output PDF
  const fileName = `boiler-${
    data.COMPONENT_SERIAL_NO || "report"
  }-${Date.now()}.pdf`;
  handlePdfOutput(doc, fileName, mode);
}

/**
 * Downloads or views 3-in-1 PDF with professional formatting
 */
export async function download3In1Pdf(
  data: TestData,
  mode: "download" | "view" = "download"
): Promise<void> {
  const doc = new jsPDF();
  let yPosition = 40;

  // Header
  buildProfessionalHeader(doc, "3-in-1 JIG Test Report", 1);

  // Jig Details
  yPosition = buildSection(
    doc,
    "Jig Details",
    {
      Component: data.COMPONENT?.NAME || "-",
      "Component Type": data.COMPONENT?.TYPE || "-",
      "Machine Name": data.COMPONENT_SERIAL_NO || "-",
      "QC Tester Name": data.TESTER_NAME || "-",
      "Date Time": formatDateTime(data.TIME || "0"),
    },
    yPosition
  );

  // Visual Test, SMPS Test, Touch Test
  const visualTest = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "visual_test"
  );
  const smpsTest = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "smps_test"
  );
  const touchTest = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "touch_test"
  );

  if (visualTest?.DATAS?.[0] || smpsTest?.DATAS?.[0] || touchTest?.DATAS?.[0]) {
    yPosition = buildSection(
      doc,
      "Basic Tests",
      {
        "Visual Test": visualTest?.DATAS?.[0]?.QC_STATUS || "-",
        "SMPS Test": smpsTest?.DATAS?.[0]?.QC_STATUS || "-",
        "Touch Test": touchTest?.DATAS?.[0]?.QC_STATUS || "-",
      },
      yPosition
    );
  }

  // Helper to process simple tests
  const processSimpleTests = (testName: string) => {
    const tests = data.DETAILS?.filter(
      (d) => d.TEST_NAME?.toLowerCase() === testName
    );
    if (!tests || tests.length === 0) return [];

    return tests.flatMap((test) =>
      (test.DATAS || []).map((d) => ({
        serial_no: d.SUB_COMPONENT_SERIAL_NO || "N/A",
        inspection: d.INSPECTION || "N/A",
        qc_status: d.QC_STATUS?.toUpperCase() || "IDLE",
      }))
    );
  };

  // 24V Tests (Valves)
  const valveTests = processSimpleTests("24v_test");
  if (valveTests.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = buildSimpleTestTable(
      doc,
      "24V Tests",
      valveTests,
      yPosition
    );
  }

  // 230V Tests (Heaters)
  const heaterTests = processSimpleTests("230v_test");
  if (heaterTests.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = buildSimpleTestTable(
      doc,
      "230V Tests",
      heaterTests,
      yPosition
    );
  }

  // Motors Tests (Pumps)
  const motorTests = processSimpleTests("motors_test");
  if (motorTests.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = buildSimpleTestTable(
      doc,
      "Motors Tests",
      motorTests,
      yPosition
    );
  }

  // Sensors Tests
  const sensorTests = processSimpleTests("sensors_test");
  if (sensorTests.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = buildSimpleTestTable(
      doc,
      "Sensors Tests",
      sensorTests,
      yPosition
    );
  }

  // Engineering Remarks
  const enggRemarks = data.DETAILS?.find(
    (d) => d.TEST_NAME?.toLowerCase() === "engg_remarks"
  );

  if (enggRemarks?.DATAS?.[0]) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    const criteriaList = enggRemarks.DATAS[0].CRITERIA || [];
    const noticedIssue =
      criteriaList.find((c) => c.VALUE?.toLowerCase() === "noticed issue")
        ?.DESC || "No";
    const remarks =
      criteriaList.find((c) => c.VALUE?.toLowerCase() === "remark")?.DESC ||
      "-";

    buildSection(
      doc,
      "Engineering Remarks",
      {
        "Noticed Any Leakage": noticedIssue,
        Remark: remarks,
      },
      yPosition
    );
  }

  // Footer
  buildProfessionalFooter(doc, 1);

  // Output PDF
  const fileName = `3-in-1-${
    data.COMPONENT_SERIAL_NO || "report"
  }-${Date.now()}.pdf`;
  handlePdfOutput(doc, fileName, mode);
}
