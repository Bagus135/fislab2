export function addTwoHours(time : string) {
    // Memisahkan jam dan menit
    const [hours, minutes] = time.split(':').map(Number); // Mengonversi string ke angka

    // Menambahkan 2 jam
    const newHours = (hours + 2) % 24; // Menggunakan modulus 24 untuk menghindari overflow jam

    // Mengonversi kembali ke format string dengan dua digit
    const formattedHours = newHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}