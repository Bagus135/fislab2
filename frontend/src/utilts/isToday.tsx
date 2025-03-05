import { isToday, parse } from "date-fns";

export const isTodayDate = (dateString:string) => {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return isToday(parsedDate);
};