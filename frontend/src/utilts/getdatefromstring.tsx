function  getDatefromString(dateString : string) {
    const [year, month, date] = dateString.split('-').map(Number);
    return { 
        year,
        month,
        date 
    };
}
