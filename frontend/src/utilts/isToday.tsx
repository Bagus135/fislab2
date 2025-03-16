import { isBefore, isToday, parse } from "date-fns";

export const isSameOrAfterDate = (dateString: string) => {
    if(dateString === "1-01-01") return false
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    const currentDate = new Date();
    return isBefore(parsedDate, currentDate);
};

export const isTodayDate = (dateString:string) => {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return isToday(parsedDate);
};