const problems = require('./problems.json')

const map = {
    'ac': 'AC',
    'notac': 'TOO_HARD',
    'null': 'WORKING',
}
const upload = problems.reduce((o, x) => {
    o[x.questionFrontendId] = map[x.status]
    return o
}, {})
console.log(JSON.stringify(upload))
