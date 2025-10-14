# clist-ex

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), as an extension based on the great website [clist.by](https://clist.by/).

It adds contest dashboard for LeetCode and CodeChef, which is inspired by [cftracker](https://cftracker.netlify.app/) and [kenkoooo/AtCoderProblems](https://kenkoooo.com/atcoder#/).

![Screenshot Leetcode](public/screenshot-leetcode.png)

![Screenshot CodeChef](public/screenshot-codechef.png)

## Core Dependencies

React + Antd/SASS + Axios

## How to run

1. Prepare your API key according to [clist.by docs](https://clist.by/api/v4/doc/), and save it in a new file `.env.development.local`. Learn more in [CRA docs](https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env).

```
REACT_APP_CLIST_API_AUTH="ApiKey xxx"
```

2. Install dependencies and run like normal CRA apps, `yarn && yarn start`.

## Cache

We save cache data in browser's IndexedDB, with fixed ObjectStore names.

- db: clist-ex
    - store: contest-lc
    - store: contest-cc
- db: statistics-<account_id>
    - store: statistics
- db: leetcode-<user_name>
    - store: lc-problems

## Similar Repository

- [huxulm/lc-rating (for LeetCode CN)](https://github.com/huxulm/lc-rating)
