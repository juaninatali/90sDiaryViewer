export function isReportImage(src: string): boolean {
  const filename = src.split(/[\\/]/).pop() || src;
  return /report/i.test(filename);
}
