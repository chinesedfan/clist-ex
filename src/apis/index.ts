import axios from "axios";
import { ListResponse } from "../types/Response";
import Account from "../types/Account";

const client = axios.create({
    baseURL: 'https://clist.by/api/v4',
    headers: {
        Authorization: 'TODO://',
    },
});

export function getAccount(handle__regex: string, resource = 'leetcode.com') {
    return client.get<ListResponse<Account>>('/account', {
        params: {
            resource,
            handle__regex,
        }
    }).then(res => {
        const list = res.data.objects;
        return list[0];
    });
}
