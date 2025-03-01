import { parse, addHours, isWithinInterval } from 'date-fns';

export function isWithinTwoHours(date: string, time: string): boolean {
    // Gabungkan tanggal dan waktu menjadi satu string
    const dateTimeString = `${date} ${time}`; // Format: 'YYYY-MM-DD HH:mm'

    // Parse the combined date and time
    const parsedDateTime = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());

    // Calculate the end time (2 hours later)
    const endTime = addHours(parsedDateTime, 2);

    // Get the current time
    const currentTime = new Date();

    // Check if the current time is within the range
    return isWithinInterval(currentTime, { start: parsedDateTime, end: endTime });
}

// Example usage
const dateToCheck = '2023-03-01'; // Format: 'YYYY-MM-DD'
const timeToCheck = '09:00'; // Format: 'HH:mm'
const result = isWithinTwoHours(dateToCheck, timeToCheck);
console.log(`Is the current time within 2 hours of ${dateToCheck} ${timeToCheck}? ${result}`);