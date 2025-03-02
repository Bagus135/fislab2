export function formatPhoneNumber(input: string): string {
    // Menghapus semua karakter yang bukan angka
    let cleanedInput = input.replace(/\D/g, '');

    // Memeriksa panjang input
    if (cleanedInput.length === 0) {
        return ''; // Jika input kosong, kembalikan string kosong
    }

    // Jika nomor sudah diawali dengan '62', tambahkan '+' di depannya
    if (cleanedInput.startsWith('62')) {
        return '+' + cleanedInput;
    }

    // Jika nomor diawali dengan '0', ganti '0' dengan '62'
    if (cleanedInput.startsWith('0')) {
        cleanedInput = '62' + cleanedInput.slice(1);
    } else {
        // Jika nomor tidak diawali dengan '0', tambahkan '62' di depan
        cleanedInput = '62' + cleanedInput;
    }

    // Kembalikan nomor yang diformat dengan awalan '+'
    return '+' + cleanedInput;
}