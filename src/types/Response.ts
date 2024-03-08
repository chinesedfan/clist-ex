
export interface Meta {
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total_count: number;
}

export interface ListResponse<T> {
    meta: Meta;
    objects: T[];
}
