import Head from "next/head";
import Image from "next/image";

export default function Credits() {
  return (
    <div className="bg-gray-900 min-h-screen py-10">
      <Head>
        <title>Fislab credits</title>
      </Head>
      <div className="container mx-auto px-4">
        <StaffSection/>
        <CoordinatorLabSection/>
        <WebDevSection/>
      </div>
    </div>
  );
}

const StaffSection = () => (
  <div className="mb-10">
    <h2 className="text-white text-2xl font-bold mb-6">Staff</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/bu-fahmi.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Fahmi Astuti, M.Si., Ph.D.</h2>
            <p className="text-gray-400">Head of Madya Laboratory</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/pak-eko.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Eko Andri Wahyudi</h2>
            <p className="text-gray-400">Laboran of Madya Laboratory</p>
        </div>
    </div>
  </div>
);

const CoordinatorLabSection = () => (
  <div className="mb-10">
    <h2 className="text-white text-2xl font-bold mb-6">Coordinator Lab</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
               src="/image/credits/baha.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">M. Bahaulloh Kholidi</h2>
            <p className="text-gray-400">Administrative Coordinator</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/alief.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Alief Hisyam Al Hasany MR</h2>
            <p className="text-gray-400">Modul Coordinator</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/hugo.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Hugo Pramaditya</h2>
            <p className="text-gray-400">Practicum Coordinator</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/taqim.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Bagus Mustaqim</h2>
            <p className="text-gray-400">Web Dev Coordinator</p>
        </div>
    </div>
  </div>
);

const WebDevSection = () => (
  <div className="mb-10">
    <h2 className="text-white text-2xl font-bold mb-6">Web Dev</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/taqim.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Bagus Mustaqim</h2>
            <p className="text-gray-400">Head of Web Developer</p>
            <p className="text-gray-400">UI UX Designer</p>
            <p className="text-gray-400">Frontend Developer</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/agung.jpeg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Agung Sedayu Septiawan</h2>
            <p className="text-gray-400">Backend Developer</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <Image
              width={100}
              height={100}
              src="/image/credits/ilham.jpg"
              alt="credits picture"
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-white text-lg font-bold">Ilham Rasyid Machfudi</h2>
            <p className="text-gray-400">UI UX Designer</p>
        </div>
    </div>
  </div>
);

