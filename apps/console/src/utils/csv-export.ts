import { isValid, parseISO, format } from 'date-fns';
import {saveAs} from 'file-saver'
import Papa from 'papaparse'

interface Header<T> {
  label: string;
  key: keyof T | string;
  formatter?: (item: T) => string;
}

export const exportCSVFn = async <T>(
  data: T[],
  headers: Header<T>[],
  filename = "export.csv"
): Promise<void> => {
  try {
    const csvContent = generateCSVContent(data, headers);
    // Prepend a UTF-8 BOM so Excel reads currency symbols (₦) and other
    // non-ASCII characters correctly instead of mangling them.
    const blob = new Blob(["﻿" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, filename);
  } catch (error) {
    console.error("Error exporting CSV", error);
    throw new Error("Failed to export CSV");
  }
};

const generateCSVContent = <T,>(
  data: T[],
  headers: {
    label: string;
    key: keyof T | string;
    formatter?: (item: T) => string;
  }[]
): string => {
  const formattedData = data.map((row) => {
    const formattedRow: Record<string, any> = {};
    headers.forEach((header) => {
      if (header.formatter) {
        const formattedValue = header.formatter(row);
        if (formattedValue) {
          formattedRow[header.label] = formattedValue;
        }
      } else {
        if ((header.key as string).includes("+++")) {
          // Handle concatenating values without key names
          const keys = (header.key as string).split("+++");
          const combinedValue = keys
            .map((key) => formatValue(row[key?.trim() as keyof T]))
            .filter(Boolean) // Remove null or empty values
            .join(" ");

          if (combinedValue) {
            formattedRow[header.label] = combinedValue;
          }
        } else if ((header.key as string).includes("---")) {
          // Handle combined fields by filtering out empty values
          const keys = (header.key as string).split("---");

          const combinedValue = keys
            .map((key) => {
              let value = formatValue(row[key?.trim() as keyof T]);
        
              // Check if the value is a valid date-time string
              if (typeof value === 'string' && isValid(parseISO(value))) {
                value = format(parseISO(value), "MM-dd-yyyy");
              }
        
              return value ? `${formatHeaderLabel(key)}: ${value}` : null;
            })
            .filter(Boolean) // Remove null values
            .join(", ");
        
          if (combinedValue) {
            formattedRow[header.label] = combinedValue;
          }
        } else {
          // Handle regular fields
          formattedRow[header.label] = formatValue(row[header.key as keyof T]);
        }
      }
    });
    return formattedRow;
  });

  return Papa.unparse(formattedData, {
    header: true,
    skipEmptyLines: true,
  });
};

const formatHeaderLabel = (label: string): string => {
  // Split the label into words based on common delimiters and capital letters
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Convert to title case
};

const formatValue = (value: any): string => {
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (Array.isArray(value)) {
    return value.join(";"); // Handle arrays, e.g., for image URLs
  }
  return value !== undefined && value !== null ? value.toString() : ""; // Ensure undefined or null values return as an empty string
};