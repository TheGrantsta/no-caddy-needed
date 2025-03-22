export const getTwoDigitDayAndMonth = (dateAsString: string) => {
    const date = new Date(dateAsString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}/${month}`;
};