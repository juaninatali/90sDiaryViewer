import fs from 'fs';
import path from 'path';

const entriesDir = path.join(process.cwd(), 'content/entries');

export function getAllEntries() {
    const filenames = fs.readdirSync(entriesDir);
    return filenames.map((filename) => {
        const filePath = path.join(entriesDir, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const entry = JSON.parse(fileContents);
        entry.text = entry.text.replace(/\\n/g, '\n');
        if (entry.images) {
            entry.images = entry.images.map((img: string) => {
                const cleaned = img.replace(/^(?:\/?images\/)+/, '');
                return `/images/${cleaned}`;
            });
        }
        return entry;
    });
}

export function getEntryById(id: string) {
    const filePath = path.join(entriesDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const entry = JSON.parse(fileContents);
    entry.text = entry.text.replace(/\\n/g, '\n');
    if (entry.images) {
        entry.images = entry.images.map((img: string) => {
            const cleaned = img.replace(/^(?:\/?images\/)+/, '');
            return `/images/${cleaned}`;
        });
    }
    return entry;
}

export function getAllEntryIds() {
    return fs.readdirSync(entriesDir).map((filename) => ({
        params: { id: filename.replace(/\.json$/, '') },
    }));
}
