import axios, { AxiosResponse } from "axios";
import { notification } from "antd";
import { ListResponse } from "../types/Response";
import Account from "../types/Account";
import Problem from "../types/Problem";
import Statistics from "../types/Statistics";
import Contest from "../types/Contest";

export const R_LC = 'leetcode.com';
export const R_CC = 'codechef.com';

const client = axios.create({
    baseURL: 'https://clist.by/api/v4',
    headers: {
        Authorization: process.env.REACT_APP_CLIST_API_AUTH,
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

export function getAccountByHandle(resource: string, handle__regex: string) {
    return extractItem(client.get<ListResponse<Account>>('/account/', {
        params: {
            resource,
            handle__regex,
        },
    }));
}

export function getContestList(resource: string, event__regex: string, page = 0) {
    return client.get<ListResponse<Contest>>('/contest/', {
        params: {
            limit: 10,
            offset: page * 10,
            resource,
            event__regex, 
            total_count: 'true',
            with_problems: 'true',
            order_by: '-start',
        },
    }).catch(() => {
        return null;
    });
}

export function getProblemList(resource: string) {
    return extractList(client.get<ListResponse<Problem>>('/problem/', {
        params: {
            resource,
            order_by: '-id',
            limit: 50,
        },
    }));
}

export function getStatisticsByAccountId(account_id: number, contestIds: number[]) {
    return extractList(client.get<ListResponse<Statistics>>('/statistics/', {
        params: {
            account_id,
            contest_id__in: contestIds.join(','),
            with_problems: 'true',
            order_by: '-date',
        },
    }));
}
