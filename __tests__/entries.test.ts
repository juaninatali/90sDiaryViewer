import { getAllEntries, getEntryById, getAllEntryIds } from '../lib/entries';
import fs from 'fs';
import path from 'path';

describe('entries library', () => {
  const entriesDir = path.join(process.cwd(), 'content/entries');

  function readEntries() {
    const filenames = fs.readdirSync(entriesDir);
    return filenames.map((file) => {
      const filePath = path.join(entriesDir, file);
      const contents = fs.readFileSync(filePath, 'utf8');
      const entry = JSON.parse(contents);
      if (entry.images) {
        entry.images = entry.images.map((img: string) => {
          const cleaned = img.replace(/^(?:\/?images\/)+/, '');
          return `/images/${cleaned}`;
        });
      }
      return entry;
    });
  }

  test('getAllEntries returns parsed entries', () => {
    const expected = readEntries();
    expect(getAllEntries()).toEqual(expected);
  });

  test('getEntryById returns a single entry', () => {
    const expected = readEntries()[0];
    expect(getEntryById(expected.id)).toEqual(expected);
  });

  test('getAllEntryIds returns list of id params', () => {
    const expected = fs.readdirSync(entriesDir).map((file) => ({
      params: { id: file.replace(/\.json$/, '') },
    }));
    expect(getAllEntryIds()).toEqual(expected);
  });
});
