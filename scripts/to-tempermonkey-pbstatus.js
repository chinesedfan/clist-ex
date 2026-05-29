const problems = require('./problems.json')
const pbstatus = require('./pbstatus.json')

const map = problems.reduce((o, x) => {
    o[x.questionFrontendId] = x.status
    return o
}, {})

let cnt = 0
for (const k in pbstatus) {
    const o = pbstatus[k]
    // fill ac status
    if (map[o.id] === 'ac') {
        o.status = 'SOLVED'
        cnt++
    }
}
console.log(`SOLVED = ${cnt}`)

require('fs').writeFileSync('./pbstatus.json', JSON.stringify(pbstatus))
