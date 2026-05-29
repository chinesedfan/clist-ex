const fs = require('fs');
const { LeetCode, Credential } = require('leetcode-query');

// cookie LEETCODE_SESSION
const LEETCODE_SESSION = ''

const LIMIT = 100;
const DELAY_MS = 1500;

async function main() {
    let skip = 0;
    let total = null;
    // LCRawProblem[]
    let all = [];

    const credential = new Credential()
    await credential.init(LEETCODE_SESSION)
    const lc = new LeetCode(credential);

    while (true) {
        const res = await lc.problems({
            offset: skip,
            limit: LIMIT,
            // filters: { difficulty: 'HARD' },
        });

        if (total === null) total = res.total;
        all.push(...res.questions);

        console.log(`loaded ${all.length}/${total} problems`);

        if (all.length >= total) break;

        skip += LIMIT;
        await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    fs.writeFileSync(
        'problems.json',
        JSON.stringify(all, null, 2),
        'utf-8'
    );
    console.log(`Saved to problems.json, total = ${all.length}`);
}

main();
