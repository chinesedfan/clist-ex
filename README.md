# clist-ex

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), as an extension based on the great website [clist.by](https://clist.by/).

It adds contest dashboard for LeetCode and CodeChef, which is inspired by [cftracker](https://cftracker.netlify.app/) and [kenkoooo/AtCoderProblems](https://kenkoooo.com/atcoder#/).

## Core Dependencies

React + Antd/SASS + Axios

## Cache

We save cache data in browser's IndexedDB, with following ObjectStore names,

- contest-lc
- contest-cc
- statistics-<account_id>
