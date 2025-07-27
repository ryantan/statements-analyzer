import { TextItem } from 'pdfjs-dist/types/src/display/api';

export function isNotRotated(item: TextItem): boolean {
  if (!item.transform) {
    return false;
  }

  return item.transform[1] === 0 && item.transform[2] === 0;
}
