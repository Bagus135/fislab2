import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function GuidesPresenceCard (){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attention !!</CardTitle>
                <CardDescription>GuideBook Presence</CardDescription>
            </CardHeader>
            <CardContent>
                <ul>
                    <li>1. Sebelum generate code wajib mengatur jadwal</li>
                    <li>2. Code dapat digenerate hanya ketika di hari dan tanggal yang sesuai dengan jadwal</li>
                    <li>3. Code yang digenerate akan expired setelah 30 menit</li>
                    <li>4. Code yang belum expired ketika digenerate tidak akan hilang meskipun anda generate code berkali-kali</li>
                    <li>5. Code yang sudah expired atau lebih dari 30 menit, code baru wajib digenerate ulang agar muncul code baru</li>
                    <li>6. Setelah selesai praktikum, klik tombol show attendance lalu klik finish agar status praktikum berubah menjadi finished dan code expired</li>
                </ul>
            </CardContent>
        </Card>
    )
}