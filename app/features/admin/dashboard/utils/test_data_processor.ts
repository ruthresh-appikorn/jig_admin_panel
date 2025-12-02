/**
 * Helper functions for processing dashboard test data
 */

// Type definitions for test data
export interface TestData {
  COMPONENT?: {
    COMPONENT_ID?: string;
    NAME?: string;
    PART_NUMBER?: string | null;
    STATUS?: string | null;
    TIME?: string;
    TYPE?: string;
    _id?: string;
    NOTES?: string | null;
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
  createdAt?: string;
  updatedAt?: string;
  id?: string;
}

export interface TableRowData {
  srNo: string;
  componentName: string;
  testName: string;
  dateTime: string;
  qcStatus: string;
  downloadData: {
    type: string;
    data: TestData;
  };
}

/**
 * Checks if a test entity is a pump component
 */
export function isPumpComponent(test: TestData): boolean {
  const componentName = test.COMPONENT?.NAME?.toLowerCase() ?? "";
  return componentName.includes("pump");
}

/**
 * Checks if a test entity is a boiler component
 */
export function isBoilerComponent(test: TestData): boolean {
  const componentName = test.COMPONENT?.NAME?.toLowerCase() ?? "";
  return componentName.includes("boiler");
}

/**
 * Checks if a test entity is a 3-in-1 component
 */
export function is3In1Component(test: TestData): boolean {
  const componentType = test.COMPONENT?.TYPE?.toLowerCase() ?? "";
  return componentType.includes("3-in-1");
}

/**
 * Normalizes QC status string to standard format
 */
export function normalizeQcStatus(status?: string): string {
  if (!status || status.trim() === "") return "N/A";

  const lowerStatus = status.toLowerCase().trim();

  if (lowerStatus.startsWith("p")) {
    return "PASSED";
  } else if (lowerStatus === "idle") {
    return "IDLE";
  } else if (lowerStatus === "n/a") {
    return "N/A";
  } else {
    return "FAIL";
  }
}

/**
 * Formats millisecond timestamp to readable date
 */
export function formatMillis(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Processes pump test data and returns structured table data rows
 */
export function processPumpTestData(test: TestData): TableRowData[] {
  const tableData: TableRowData[] = [];

  // Get component name and type
  let componentName = test.COMPONENT?.NAME ?? "Unknown";
  const componentType = test.COMPONENT?.TYPE ?? "";
  if (componentType) {
    componentName = componentType;
  }

  // Use TIME field from test for date/time
  const formattedDateTime = test.TIME ?? test.createdAt ?? "N/A";
  const timestamp = parseInt(formattedDateTime) || 0;

  // Process on_off test rows
  const onOffTests =
    test.DETAILS?.filter((detail) => {
      const testName = detail.TEST_NAME?.toLowerCase() ?? "";
      return testName === "pump_test" || testName === "on_off";
    }) ?? [];

  for (const onOffTest of onOffTests) {
    if (onOffTest.DATAS) {
      for (const onOffData of onOffTest.DATAS) {
        const serialNo = onOffData.SUB_COMPONENT_SERIAL_NO ?? "";
        const qcStatus = normalizeQcStatus(onOffData.QC_STATUS);
        const inspection = onOffData.INSPECTION ?? "N/A";

        tableData.push({
          srNo: serialNo || "N/A",
          componentName,
          testName: `ON/OFF (${inspection})`,
          dateTime: formatMillis(timestamp),
          qcStatus,
          downloadData: {
            type: "pump",
            data: test,
          },
        });
      }
    }
  }

  // Process adv_leakage test rows
  const advLeakageTests =
    test.DETAILS?.filter((detail) => {
      const testName = detail.TEST_NAME?.toLowerCase() ?? "";
      return (
        testName === "adv_block_and_leakage_test" || testName === "adv_leakage"
      );
    }) ?? [];

  for (const advLeakageTest of advLeakageTests) {
    if (advLeakageTest.DATAS) {
      for (const leakageData of advLeakageTest.DATAS) {
        const serialNo = leakageData.SUB_COMPONENT_SERIAL_NO ?? "";
        const qcStatus = normalizeQcStatus(leakageData.QC_STATUS);
        const inspection = leakageData.INSPECTION ?? "N/A";

        tableData.push({
          srNo: serialNo || "N/A",
          componentName,
          testName: `Leakage (${inspection})`,
          dateTime: formatMillis(timestamp),
          qcStatus,
          downloadData: {
            type: "pump",
            data: test,
          },
        });
      }
    }
  }

  return tableData;
}

/**
 * Processes boiler test data and returns structured table data rows
 */
export function processBoilerTestData(test: TestData): TableRowData[] {
  const tableData: TableRowData[] = [];

  // Get component name and type
  let componentName = test.COMPONENT?.NAME ?? "Unknown";
  const componentType = test.COMPONENT?.TYPE ?? "";
  if (componentType) {
    componentName = componentType;
  }

  // Use TIME field from test for date/time
  const formattedDateTime = test.TIME ?? test.createdAt ?? "N/A";
  const timestamp = parseInt(formattedDateTime) || 0;

  // Process boiler_test rows
  const boilerTests =
    test.DETAILS?.filter((detail) => {
      const testName = detail.TEST_NAME?.toLowerCase() ?? "";
      return testName === "boiler_test";
    }) ?? [];

  for (const boilerTest of boilerTests) {
    if (boilerTest.DATAS) {
      for (const boilerData of boilerTest.DATAS) {
        const serialNo = boilerData.SUB_COMPONENT_SERIAL_NO ?? "";
        const qcStatus = normalizeQcStatus(boilerData.QC_STATUS);
        const inspection = boilerData.INSPECTION ?? "N/A";

        tableData.push({
          srNo: serialNo || "N/A",
          componentName,
          testName: `Boiler Test (${inspection})`,
          dateTime: formatMillis(timestamp),
          qcStatus,
          downloadData: {
            type: "boiler",
            data: test,
          },
        });
      }
    }
  }

  return tableData;
}

/**
 * Processes 3-in-1 test data and returns structured table data rows
 */
export function process3In1TestData(test: TestData): TableRowData[] {
  const tableData: TableRowData[] = [];

  // Get component name and type
  let componentName = test.COMPONENT?.NAME ?? "Unknown";
  const componentType = test.COMPONENT?.TYPE ?? "";
  if (componentType) {
    componentName = componentType;
  }

  // Use TIME field from test for date/time
  const formattedDateTime = test.TIME ?? test.createdAt ?? "N/A";
  const timestamp = parseInt(formattedDateTime) || 0;

  // Process SMPS test
  const smpsTest = test.DETAILS?.find(
    (detail) => detail.TEST_NAME?.toLowerCase() === "smps_test"
  );

  if (smpsTest?.DATAS) {
    for (const smpsData of smpsTest.DATAS) {
      const serialNo = smpsData.SUB_COMPONENT_SERIAL_NO ?? "";
      const qcStatus = normalizeQcStatus(smpsData.QC_STATUS);

      tableData.push({
        srNo: serialNo || "N/A",
        componentName,
        testName: "SMPS Test",
        dateTime: formatMillis(timestamp),
        qcStatus,
        downloadData: {
          type: "3-in-1",
          data: test,
        },
      });
    }
  }

  // Process Touch test
  const touchTest = test.DETAILS?.find(
    (detail) => detail.TEST_NAME?.toLowerCase() === "touch_test"
  );

  if (touchTest?.DATAS) {
    for (const touchData of touchTest.DATAS) {
      const serialNo = touchData.SUB_COMPONENT_SERIAL_NO ?? "";
      const qcStatus = normalizeQcStatus(touchData.QC_STATUS);

      tableData.push({
        srNo: serialNo || "N/A",
        componentName,
        testName: "Touch Test",
        dateTime: formatMillis(timestamp),
        qcStatus,
        downloadData: {
          type: "3-in-1",
          data: test,
        },
      });
    }
  }

  return tableData;
}
