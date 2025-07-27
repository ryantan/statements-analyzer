import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 * Transform the transform matrix in each item into relative to viewport.
 *
 * @param page
 * @param textItems
 */
export const transformToViewport = (
  page: PDFPageProxy,
  textItems: TextItem[]
) => {
  const scale = 1.0;
  const viewport = page.getViewport({ scale: scale });

  const transformedItems: TextItem[] = textItems.map((item) => {
    // get item dimensions and position
    // from transform matrices
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    return {
      ...item,
      transform: tx,
    };
  });
  return transformedItems;
};
