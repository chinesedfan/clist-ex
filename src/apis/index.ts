import axios, { AxiosError, AxiosResponse } from "axios";
import { notification } from "antd";
import { BoolString, ListResponse } from "../types/Response";
import Account from "../types/Account";
import Problem from "../types/Problem";
import Statistics from "../types/Statistics";
import Contest from "../types/Contest";
import { loadLocalObject, LOCAL_SETTINGS, SettingsKey } from "../services/localstorage";

export const R_LC = 'leetcode.com';
export const R_CC = 'codechef.com';

const client = axios.create({
    baseURL: 'https://clist.by/api/v4',
    timeout: 5000,
});
client.interceptors.request.use(config => {
    const apiKey = loadLocalObject(LOCAL_SETTINGS, SettingsKey.Apikey);
    config.headers.Authorization =
        apiKey || process.env.REACT_APP_CLIST_API_AUTH;
    return config;
});
client.interceptors.response.use(data => data, (error: AxiosError) => {
    let message = error.message;
    if (error.response?.status === 429) {
        message = error.response.statusText;
    }
    notification.error({
        message,
        description: error.config?.url,
    });
    throw error;
});

function extractItem<T>(p: Promise<AxiosResponse<ListResponse<T>>>) {
    return p.then(res => {
        const list = res.data.objects;
        return list[0];
    }).catch(() => {
        return undefined;
    });
}
function extractList<T>(p: Promise<AxiosResponse<ListResponse<T>> | undefined>) {
    return p.then(res => {
        if (!res) return [];

        const list = res.data.objects;
        return list;
    }).catch(() => {
        return [];
    });
}

export function getAccountsByHandle(resource: string, handle__startswith: string) {
    return extractList(client.get<ListResponse<Account>>('/account/', {
        params: {
            resource,
            handle__startswith,
            limit: 5,
        },
    }));
}

interface PaginationParams {
    limit?: number;
    offset?: number;
}
export interface GetContestListParams extends PaginationParams {
    resource: string;
    event__regex?: string;
    upcoming?: BoolString;
    total_count?: BoolString;
    with_problems?: BoolString;
    order_by?: 'id' | '-id' | 'start' | '-start';
}
async function getRawContestList(params: GetContestListParams) {
    try {
        return client.get<ListResponse<Contest<any>>>('/contest/', {
            params,
        });
    } catch (e) {
        return undefined;
    }
}

export async function getContestTotalCount(resource: string, event__regex?: string) {
    const res = await getRawContestList({
        resource,
        limit: 1,
        total_count: 'true',
        event__regex,
        upcoming: 'false',
    });
    return res?.data.meta.total_count;
}
export async function getContestList(params: GetContestListParams) {
    return extractList(getRawContestList(params));
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
