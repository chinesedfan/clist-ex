import { createContext } from "react";
import { RadioChangeEvent } from "antd";

export const ProblemFilterContext = createContext<{
    onSearch?: (value: string) => void,
    onRadioChange?: (e: RadioChangeEvent) => void,
}>({});
