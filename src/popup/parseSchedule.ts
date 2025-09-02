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
    teacher_id?: number;
    format: string;
    format_id: number;
    building: string;
    room?: string;
    note?: string;
    zoom_url?: string;
    zoom_password?: string;
    zoom_info?: string;
    group?: string;
    work_type?: string;
    work_type_id?: number;
    pair_id?: number;
    subject_id?: number;
    flow_id?: number;
    flow_type_id?: number;
    bld_id?: number;
}


interface Day {
    date: string;
    day_number: number;
    week_number: number;
    lessons: Lesson[];
    intersections?: number[][];
    note?: string;
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


export function scheduleToIcs(schedule: Day[], timeZone: string): string {

    let result: string = "";

    result += "BEGIN:VCALENDAR\n";
    result += "VERSION:2.0\n";
    result += "PRODID:-//Better ITMO Schedule Export//EN\n";
    result += "CALSCALE:GREGORIAN\n";
    result += "METHOD:PUBLISH\n";
    result += "X-WR-CALNAME:ITMO Schedule\n";
    result += "X-WR-TIMEZONE:Europe/Moscow\n";
    result += "REFRESH-INTERVAL;VALUE=DURATION:PT10M\n";
    
    for (const day of schedule) {
        for (const lesson of day.lessons) {
            const time_start = castToUTC(day.date, lesson.time_start, timeZone);
            const time_end = castToUTC(day.date, lesson.time_end, timeZone);
            
            result += "BEGIN:VEVENT\n";
            
            // Use pair_id as unique identifier if available
            if (lesson.pair_id) {
                result += `UID:${lesson.pair_id}@my.itmo.ru\n`;
            }
            
            // Enhanced summary with lesson type
            const summary = lesson.type ? `${lesson.subject} (${lesson.type})` : lesson.subject;
            result += `SUMMARY:${escapeIcsText(summary)}\n`;
            
            // Date and time
            result += `DTSTART;VALUE=DATE-TIME:${time_start}\n`;
            result += `DTEND;VALUE=DATE-TIME:${time_end}\n`;
            
            // Location: combine room and building
            let location = "";
            if (lesson.room && lesson.building) {
                location = `${lesson.room}, ${lesson.building}`;
            } else if (lesson.room) {
                location = lesson.room;
            } else if (lesson.building) {
                location = lesson.building;
            } else if (lesson.format === "Дистанционный" || lesson.format_id === 3) {
                location = "Online";
            }
            if (location) {
                result += `LOCATION:${escapeIcsText(location)}\n`;
            }
            
            // Build detailed description
            let description = "";
            
            // Teacher information
            if (lesson.teacher_name) {
                description += `Преподаватель: ${lesson.teacher_name}\\n`;
            }
            
            // Group information
            if (lesson.group) {
                description += `Группа: ${lesson.group}\\n`;
            }
            
            // Format information
            if (lesson.format) {
                description += `Формат: ${lesson.format}\\n`;
            }
            
            // Work type if different from type
            if (lesson.work_type && lesson.work_type !== lesson.type) {
                description += `Тип занятия: ${lesson.work_type}\\n`;
            }
            
            // Note if present
            if (lesson.note) {
                description += `\\nПримечание: ${lesson.note}\\n`;
            }
            
            // Zoom link if present
            if (lesson.zoom_url) {
                description += `\\nZoom: ${lesson.zoom_url}\\n`;
                if (lesson.zoom_password) {
                    description += `Пароль: ${lesson.zoom_password}\\n`;
                }
                if (lesson.zoom_info) {
                    description += `${lesson.zoom_info}\\n`;
                }
            }
            
            if (description) {
                result += `DESCRIPTION:${escapeIcsText(description.trim())}`;
                result += "\n";
            }
            
            // Add URL if zoom link is present
            if (lesson.zoom_url) {
                result += `URL:${lesson.zoom_url}\n`;
            }
            
            // Categories based on format
            const categories = [];
            if (lesson.type) categories.push(lesson.type);
            if (lesson.format_id === 1) categories.push("Очный");
            else if (lesson.format_id === 2) categories.push("Гибридный");
            else if (lesson.format_id === 3) categories.push("Дистанционный");
            
            if (categories.length > 0) {
                result += `CATEGORIES:${categories.join(",")}\n`;
            }
            
            // Status
            result += "STATUS:CONFIRMED\n";
            
            // Transparency (for sports activities, mark as free time)
            if (lesson.work_type_id === 11) {
                result += "TRANSP:TRANSPARENT\n";
            } else {
                result += "TRANSP:OPAQUE\n";
            }
            
            result += "END:VEVENT\n";
        }
    }
    result += "END:VCALENDAR";

    return result;
}

// Helper function to escape special characters in ICS text fields
function escapeIcsText(text: string): string {
    if (!text) return "";
    // Escape special characters according to ICS specification
    return text
        .replace(/\\/g, "\\\\")  // Escape backslashes first
        .replace(/;/g, "\\;")     // Escape semicolons
        .replace(/,/g, "\\,")     // Escape commas
        .replace(/\n/g, "\\n")    // Escape newlines
        .replace(/\r/g, "");      // Remove carriage returns
}

function castToUTC(date: string, time: string, timezone: string): string {
    const d = new Date(`${date}T${time}`);
    const utc = d.toLocaleString('en-US', { timeZone: timezone });
    return new Date(utc).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
