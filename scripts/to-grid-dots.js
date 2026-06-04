const problems = require('./problems.json')

const g = problems
    .filter(o => o.difficulty === 'Hard')
    .map(o => {
        if (o.isPaidOnly) return 'L'
        return o.status === 'ac' ? 'S' : (o.status === 'notac' ? 'X' : '.')
    })

const per = 50
for (let i = 0; i < g.length; i += per) {
    console.log(g.slice(i, i + per).join(''))
}
