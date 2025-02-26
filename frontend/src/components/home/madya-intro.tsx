import Head from "next/head";

export default function MadyaLab() {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <Head>
          <title>Fisika Laboratorium 2</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">ADA APA DI FISIKA</h1>
            <h2 className="text-4xl font-bold">LABORATORIUM 2?</h2>
            <p className="text-lg mt-2">Semua hal pengetahuan seputar fisika modern</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center mt-8 space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative bg-gray-800 rounded-lg p-4 w-full md:w-1/2 group">
              <h3 className="text-lg font-bold">Headline #1</h3>
              <p>Headline #1 menjelaskan tentang hal-hal seputar fisika</p>
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p>Keterangan lebih lanjut tentang Headline #1</p>
              </div>
            </div>
            <div className="relative bg-gray-800 rounded-lg p-4 w-full md:w-1/2 group">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p>Keterangan lebih lanjut tentang konten ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }