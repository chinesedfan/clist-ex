import axios from "axios";
import { ListResponse } from "../types/Response";
import Account from "../types/Account";
import Problem from "../types/Problem";

const R_LC = 'leetcode.com';

const client = axios.create({
    baseURL: 'https://clist.by/api/v4',
    headers: {
        Authorization: 'TODO://',
    },
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
    });
}
