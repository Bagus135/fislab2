import Head from 'next/head';

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Head>
        <title>Web Page</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
      </Head>
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 p-8">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <img
            src="https://storage.googleapis.com/a1aa/image/hMyqMajCLmMGyOQUwwJ_02thB8wJirol-3dtpBxX1rg.jpg"
            alt="Image of Maria Mikhailovna Kujou"
            className="rounded-full mx-auto mb-4"
            width="100"
            height="100"
          />
          <h2 className="text-lg font-bold">Maria Mikhailovna Kujou</h2>
          <p className="text-gray-400">Penghibur</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <img
            src="https://storage.googleapis.com/a1aa/image/QaFkXV6VBfsgzVxGBs3ZesTUPrelwPu6_YmkZKEz2l4.jpg"
            alt="Image of Shiina Mahiru"
            className="rounded-full mx-auto mb-4"
            width="100"
            height="100"
          />
          <h2 className="text-lg font-bold">Shiina Mahiru</h2>
          <p className="text-gray-400">Penghibur</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <img
            src="https://storage.googleapis.com/a1aa/image/hMyqMajCLmMGyOQUwwJ_02thB8wJirol-3dtpBxX1rg.jpg"
            alt="Image of Maria Mikhailovna Kujou"
            className="rounded-full mx-auto mb-4"
            width="100"
            height="100"
          />
          <h2 className="text-lg font-bold">Maria Mikhailovna Kujou</h2>
          <p className="text-gray-400">Penghibur</p>
        </div>
      </div>
      <div className="border-t border-gray-600 mt-8"></div>
      <div className="flex flex-col md:flex-row justify-between items-center p-8 space-y-4 md:space-y-0">
        <div className="bg-gray-600 rounded-lg p-4 text-center">
          <p>Ini Logo</p>
        </div>
        <div className="text-center">
          <p>Departemen Fisika | FSAD</p>
          <p>Lantai 3 Laboratorium Fisika Madya</p>
          <p>Email : fisikamadya@gmail.com</p>
        </div>
        <div className="text-center">
          <p>Sukolilo | Manyar | Tjokroaminoto</p>
          <p>Kampus Institut Teknologi Sepuluh Nopember Surabaya</p>
          <p>Phone: 031-5994251-54, 5947274, 5945472</p>
          <p>Fax: 031-5923465, 5947845</p>
        </div>
      </div>
      <div className="text-center p-4">
        <p>@2025 Fislab II, inc</p>
      </div>
    </div>
  );
}
