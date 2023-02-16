const MAX_WIDTH = 118;
const MAX_HEIGHT = 36;
const COLUMN_DELIMITER = '|';
const ROW_DELIMITER = '-';
const FILLER_CHAR = ' ';
const DEFAULT_PAD_LEFT = 1;

/**
 * builds text grid using
 *  column definition:
 * [{
 *  width: number,   // does not include COLUMN_DELIMITER character
 *  title: string,   // title of the column
 *  key: string,     // value used to as key in row (see: someKey below)
 *  padLeft: number, // optional, characters to pad with FILLER_CHAR to left of value
 *  process: (value) => string // processes column value to string
 * }, ...]
 *  row definition:
 * [{
 *  someKey: string // someKey is string defined by key in colDef
 *  divide: boolean // optional, if true will set the row as a divider row and ignore someKey
 * }, ...]
 * 
 */
const buildTextGrid = (
  columnDefs,
  rows,
  gridTitle,
  colDelimiter = COLUMN_DELIMITER,
  rowDelimiter = ROW_DELIMITER,
  defaultPadLeft = DEFAULT_PAD_LEFT
) => {
  const numberOfRows = rows.length + (gridTitle && 1);
  if (numberOfRows > MAX_HEIGHT) {
    return `buildTextGrid input results in more row(s) than MAX_HEIGHT: ${MAX_HEIGHT} rows. Calculated rows: ${numberOfRows}`;
  }

  let o = `\`\`\`${gridTitle ? gridTitle + '\n' : ''}`;

  // create divideLine
  const divideLine = buildDivideLine(columnDefs, colDelimiter, rowDelimiter);

  let maxRowLength = columnDefs.length;

  // create column titles row
  const titlesRow = columnDefs.reduce((acc, colDef) => {
    acc[colDef.key] = colDef.title;

    maxRowLength += colDef.width;

    return acc;
  }, {});

  if (maxRowLength > MAX_WIDTH) {
    return `buildTextGrid input results in row(s) wider than MAX_WIDTH: ${MAX_WIDTH}`;
  }

  // add title row
  rows.unshift(titlesRow);

  // add lines to output for each row
  rows.forEach((row, rowIdx) => {
    if (row.divide) {
      o += divideLine;
    } else {
      columnDefs.forEach((colDef, colIdx) => {
        // process string if process function is passed
        let valueAsString = colDef.process ? colDef.process(row[colDef.key]) : `${row[colDef.key]}`;

        // add left padding
        const padLeft = (colDef.padLeft && colDef.padLeft !== 0) ?? defaultPadLeft;
        valueAsString = valueAsString.padStart(padLeft + valueAsString.length, FILLER_CHAR);

        // pad filler characters after value and add column delimiter if not the last column
        o += valueAsString.padEnd(colDef.width, FILLER_CHAR);
        if (colIdx !== columnDefs.length - 1) {
          o += COLUMN_DELIMITER;
        }
      });

      o += '\n';
    }
  });

  o += '```';
  return o;
};

const buildDivideLine = (columnDefs, colDelimiter = COLUMN_DELIMITER, rowDelimiter = ROW_DELIMITER) => {
  let divideLine = '';

  columnDefs.forEach((colDef, idx) => {
    divideLine += ''.padEnd(colDef.width, rowDelimiter);
    if (idx !== columnDefs.length - 1) {
      divideLine += colDelimiter;
    }
  });

  return `${divideLine}\n`;
}

module.exports = {
  buildTextGrid,
  buildDivideLine
};