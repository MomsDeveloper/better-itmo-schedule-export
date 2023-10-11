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
