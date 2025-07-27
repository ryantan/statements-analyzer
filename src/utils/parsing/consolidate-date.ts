import { TextItem } from 'pdfjs-dist/types/src/display/api';

// interface Item {
//   str: string;
//   transform: number[];
//   hasEOL?: boolean;
// }

export type WordItem = TextItem & {
  items: TextItem[];
  left: number;
  right: number;
  top: number;
  bottom: number;
};

// export function consolidateDate(items: TextItem[]): TextItem[] {
//   const result: TextItem[] = [];
//   let i = 0;
//
//   while (i < items.length) {
//     if (
//       i <= items.length - 4 &&
//       items[i].str === 'D' &&
//       items[i + 1].str === 'a' &&
//       items[i + 2].str === 't' &&
//       items[i + 3].str === 'e'
//     ) {
//       result.push({
//         ...items[i],
//         str: '[Date]',
//       });
//       i += 4;
//     } else {
//       result.push(items[i]);
//       i++;
//     }
//   }
//
//   return result;
// }

export function consolidateString(
  items: TextItem[],
  targetString: string
): TextItem[] {
  const result: TextItem[] = [];
  let i = 0;
  const targetLength = targetString.length;

  while (i < items.length) {
    if (i <= items.length - targetLength) {
      let matches = true;
      for (let j = 0; j < targetLength; j++) {
        if (items[i + j].str !== targetString[j]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        result.push({
          ...items[i],
          str: `[${targetString}]`,
        });
        i += targetLength;
        continue;
      }
    }

    result.push(items[i]);
    i++;
  }

  return result;
}

export function groupByDelimiters(items: TextItem[]): WordItem[] {
  const groups: WordItem[] = [];
  let currentGroup: TextItem[] = [];

  const addGroup = () => {
    const groupString = currentGroup.map((item) => item.str).join('');
    const wordItem: WordItem = {
      ...currentGroup[0],
      str: groupString,
      items: currentGroup,
      left: currentGroup[0].transform[4],
      right:
        currentGroup[currentGroup.length - 1].transform[4] +
        currentGroup[0].width,
      top: currentGroup[0].transform[5] - currentGroup[0].height,
      bottom: currentGroup[0].transform[5],
      hasEOL: true,
    };

    groups.push(wordItem);
  };

  for (const item of items) {
    if (item.str === ' ' || item.hasEOL) {
      // if (item.hasEOL) {
      if (currentGroup.length > 0) {
        addGroup();
        currentGroup = [];
      }
    } else {
      currentGroup.push(item);
    }
  }

  if (currentGroup.length > 0) {
    addGroup();
  }

  return groups;
}
