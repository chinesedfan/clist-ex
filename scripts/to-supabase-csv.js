const problems = require('./problems.json')

const COLUMNS = [
    'questionFrontendId',
    'title',
    'titleSlug',
    'difficulty',
    'acRate',
    'freqBar',
    'status',
    'isFavor',
    'isPaidOnly',
    'hasSolution',
    'hasVideoSolution',
    'topicTags',
];

function escapeCell(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function rowToCSV(problem) {
    return COLUMNS.map(col => {
        if (col === 'topicTags') {
            // join topicTags by |
            const tags = problem.topicTags;
            if (!Array.isArray(tags) || tags.length === 0) return '';
            const names = tags.map(t => t.name || t.slug || '').join(' | ');
            return escapeCell(names);
        }
        return escapeCell(problem[col]);
    }).join(',');
}

const header = COLUMNS.join(',');
const rows = problems.map(rowToCSV);

process.stdout.write([header, ...rows].join('\n') + '\n');
