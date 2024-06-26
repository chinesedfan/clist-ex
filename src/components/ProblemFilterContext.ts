import { createContext } from "react";
import { RadioChangeEvent } from "antd";
import Account from "../types/Account";

export const ProblemFilterContext = createContext<{
    onSearch?: (value: string, setLoading: (loading: boolean) => void) => void,
    onRadioChange?: (e: RadioChangeEvent) => void,
    account?: Account,
}>({});
