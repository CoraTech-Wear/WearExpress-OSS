export function updateTime() {
    const now = new Date()
    let hours = now.getHours()
    let minutes = now.getMinutes()
    //@ts-ignore
    hours = hours < 10 ? "0" + hours : hours
    //@ts-ignore
    minutes = minutes < 10 ? "0" + minutes : minutes
    return `${hours}:${minutes}`;
}