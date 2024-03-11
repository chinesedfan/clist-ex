import axios from "axios";
import { ListResponse } from "../types/Response";
import Account from "../types/Account";
import Problem from "../types/Problem";
import Statistics from "../types/Statistics";
import { notification } from "antd";

const R_LC = 'leetcode.com';

const client = axios.create({
    baseURL: 'https://clist.by/api/v4',
    headers: {
        Authorization: 'TODO://',
    },
    timeout: 2000,
});
client.interceptors.response.use(data => data, error => {
    notification.error({
        message: error.message,
        description: error.stack,
    });
    throw error;
});

export function getAccountByHandle(handle__regex: string, resource = R_LC) {
    return client.get<ListResponse<Account>>('/account', {
        params: {
            resource,
            handle__regex,
        },
    }).then(res => {
        const list = res.data.objects;
        return list[0];
    }).catch(() => {
        return null;
    });
}

export function getProblemList(resource = R_LC) {
    return client.get<ListResponse<Problem>>('/problem', {
        params: {
            resource,
            order_by: '-id',
            limit: 4 * 50,
        },
    }).then(res => {
        const list = res.data.objects;
        return list;
    }).catch(() => {
        return [];
    });
}

export function getStatisticsByAccountId(account_id: number) {
    return client.get<ListResponse<Statistics>>('/statistics', {
        params: {
            account_id,
            with_problems: 'true',
            order_by: '-date',
        },
    }).then(res => {
        const list = res.data.objects;
        return list;
    }).catch(() => {
        return [];
    });
}
