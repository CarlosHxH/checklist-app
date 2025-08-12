export default function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        return 'N/A';
    }
}

const options = {
    timeZone: 'America/Cuiaba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Use 24-hour format
} as any;

const dateInCuiaba = new Intl.DateTimeFormat('en-CA', options).format(new Date());
export const formattedDate = dateInCuiaba.replace(',', '').replace(/\//g, '-').replace(' ', 'T');
