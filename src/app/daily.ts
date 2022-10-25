import { appSettings } from "./settings.js";

/*
getting the current day requires settings for:
- server clock or browser clock
- GMT or local time zone

and rendering will be blocked until the date has loaded (optionally from the server)
... this could be mitigated by storing the client-server clock skew in settings
*/

export function toDayNumber(date?:Date, useLocalTimezone=false): number {
    date ||= new Date();
    let day0;
    const gameTimezone = appSettings.getItem("game-timezone");
    if (gameTimezone === "local") {
        // origin date in local time zone
        day0 = new Date(2022,9,1);
    }
    else {
        // origin date in UTC time zone (default)
        day0 = new Date(Date.UTC(2022,9,1));
    }
    const dayOffset = (date.valueOf() - day0.valueOf()) / (24 * 60 * 60 * 1000);
    return Math.floor(dayOffset);
}

export async function fetchServerDate(): Promise<Date> {
    const response = await fetch(document.location as unknown as URL, {method: "HEAD"});
    return new Date(response.headers.get("Date")!);
}

export async function getGameDate(): Promise<Date> {
    const gameClock = appSettings.getItem("game-clock");
    if (gameClock === "browser") {
        // use browser clock
        return new Date();
    }
    else {
        // use server clock (default)
        return fetchServerDate();
    }
}
