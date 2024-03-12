import axios, { AxiosResponse } from "axios";
import { notification } from "antd";
import { ListResponse } from "../types/Response";
import Account from "../types/Account";
import Problem from "../types/Problem";
import Statistics from "../types/Statistics";
import Contest from "../types/Contest";

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

function extractItem<T>(p: Promise<AxiosResponse<ListResponse<T>>>) {
    return p.then(res => {
        const list = res.data.objects;
        return list[0];
    }).catch(() => {
        return null;
    });
}
function extractList<T>(p: Promise<AxiosResponse<ListResponse<T>>>) {
    return p.then(res => {
        const list = res.data.objects;
        return list;
    }).catch(() => {
        return [];
    });
}

export function getAccountByHandle(handle__regex: string, resource = R_LC) {
    return extractItem(client.get<ListResponse<Account>>('/account', {
        params: {
            resource,
            handle__regex,
        },
    }));
}

export function getContestList(resource = R_LC) {
    return extractList(client.get<ListResponse<Contest>>('/contest', {
        params: {
            resource,
            with_problems: 'true',
            order_by: 'id',
        },
    }));
}

export function getProblemList(resource = R_LC) {
    return extractList(client.get<ListResponse<Problem>>('/problem', {
        params: {
            resource,
            order_by: '-id',
        },
    }));
}

export function getStatisticsByAccountId(account_id: number) {
    return extractList(client.get<ListResponse<Statistics>>('/statistics', {
        params: {
            account_id,
            with_problems: 'true',
            order_by: '-date',
        },
    }));
}
