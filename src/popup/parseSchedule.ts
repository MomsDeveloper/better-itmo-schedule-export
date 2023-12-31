// get user token from cookies
export async function getAuthToken(): Promise<string> {
    return await new Promise((resolve, reject) => {
        chrome.cookies.get(
            { url: 'https://my.itmo.ru', name: 'auth._id_token.itmoId' },
            function (cookie) {
                if (cookie) {
                    resolve(cookie.value);
                } else {
                    reject('Can\'t get cookie');
                }
            }
        );
    });
}


interface Lesson {
    subject: string;
    time_start: string;
    time_end: string;
    type: string;
    teacher_name: string;
    format: string;
    building: string;
}


interface Day {
    date: string;
    lessons: Lesson[];
}


export async function fetchSchedule(authToken: string, dateFrom: Date, dateTo: Date): Promise<Day[]> {
    const apiUrl = 'https://my.itmo.ru/api/schedule/schedule/personal';

    const params = new URLSearchParams({
        date_start: dateFrom.toISOString().slice(0, 10),
        date_end: dateTo.toISOString().slice(0, 10),
    });

    const urlWithParams = `${apiUrl}?${params.toString()}`;

    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json');
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
    requestHeaders.set('Accept-Language', 'ru');

    const response = await fetch(urlWithParams, {
        headers: requestHeaders
    });

    const json = await response.json();
    return json['data'];
}


export function scheduleToIcs(schedule: Day[]): string {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let result: string = "";

    result += "BEGIN:VCALENDAR\n";
    result += "VERSION:2.0\n";
    result += "PRODID:-//Apple Computer\\, Inc//iCal 1.5//EN\n";
    result += "CALSCALE:GREGORIAN\n";
    result += "X-WR-CALNAME:my.itmo\n";
    result += `X-WR-TIMEZONE:${timeZone}\n`;
    result += "X-PUBLISHED-TTL:PT10M\n";
    result += "REFRESH-INTERVAL;VALUE=DURATION:PT10M\n";
    for (const day of schedule) {
        for (const lesson of day.lessons) {
            const time_start = joinIcsDateTime(day.date, lesson.time_start);
            const time_end = joinIcsDateTime(day.date, lesson.time_end);
            result += "BEGIN:VEVENT\n";
            result += `SUMMARY:${lesson.subject}\n`;
            result += `DTSTART;VALUE=DATE-TIME:${time_start}\n`;
            result += `DTEND;VALUE=DATE-TIME:${time_end}\n`;
            result += `DESCRIPTION:${lesson.type} - ${lesson.teacher_name}\n`;
            result += "END:VEVENT\n";
        }
    }
    result += "END:VCALENDAR";

    return result;
}


function joinIcsDateTime(dateString: string, timeString: string): string {
    const [year, month, day] = dateString.split('-');
    const [hours, minutes] = timeString.split(':');

    const datePart = `${year}${month}${day}`;
    const timePart = `${hours}${minutes}00`;
    return `${datePart}T${timePart}Z`
}
