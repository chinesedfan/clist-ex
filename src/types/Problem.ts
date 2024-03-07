export default interface Problem {
    id?: number;
    name?: string;
    contests_ids?: Array<number | string>;
    resource?: string;
    resource_id?: number;
    slug: string;
    short: string;
    url: string;
    archive_url: string;
    n_attempts: number;
    n_accepted: number;
    n_partial: number;
    n_hidden: number;
    n_total: number;
    rating: number;
    favorite: boolean;
    note: string | null;
    system_solved?: boolean;
    system_reject?: boolean;
    user_solved?: boolean;
    user_todo?: boolean;
    user_reject?: boolean;
    [key: string]: any;
}
