import Image from "next/image";

export default function Footer() {
    return (
  <div className="bg-black text-white p-4">
   <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
    <div className="flex items-center mb-4 md:mb-0">
     <div className="rounded-md p-2 flex items-center">
        <Image
            width={80}
            height={80}
            src="/whitephi.png"
            alt="logo"
            className="mb-4"
            />
     </div>
     <div className="ml-4">
      <p>
       Departemen Fisika | FSAD
      </p>
      <p>
       Lantai 3 Laboratorium Fisika Madya
      </p>
      <p>
       Email: fisikamady@gmail.com
      </p>
     </div>
    </div>
    <div className="text-left md:text-right">
     <p>
      Sukolilo | Manyar | Tjokroaminoto
     </p>
     <p>
      Kampus Institut Teknologi Sepuluh Nopember Surabaya
     </p>
     <p>
      Phone: 031-5994251-54, 5947274, 5945472
     </p>
     <p>
      Fax: 031-5923465, 5947845
     </p>
    </div>
   </div>
   <div className="text-center mt-4">
    <p>
     @Fisika 2022
    </p>
   </div>
  </div>
  );
  };