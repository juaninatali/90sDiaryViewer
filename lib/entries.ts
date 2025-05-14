import fs from 'fs';
import path from 'path';

const entriesDir = path.join(process.cwd(), 'content/entries');

export function getAllEntries() {
    const filenames = fs.readdirSync(entriesDir);
    return filenames.map((filename) => {
        const filePath = path.join(entriesDir, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    });
}

export function getEntryById(id: string) {
    const filePath = path.join(entriesDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export function getAllEntryIds() {
    return fs.readdirSync(entriesDir).map((filename) => ({
        params: { id: filename.replace(/\.json$/, '') },
    }));
}
