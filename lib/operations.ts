import type { Operation } from "./generator";

export function getOperationSymbol(operation: Operation) {
  switch (operation) {
    case "addition":
      return "+";
    case "subtraction":
      return "−";
    case "division":
      return "÷";
    case "multiplication":
    default:
      return "×";
  }
}

export function getWorksheetTitle(operation?: Operation) {
  if (!operation) {
    return "Calculation Practice";
  }

  switch (operation) {
    case "addition":
      return "Addition Practice";
    case "subtraction":
      return "Subtraction Practice";
    case "division":
      return "Division Practice";
    case "multiplication":
    default:
      return "Multiplication Practice";
  }
}
