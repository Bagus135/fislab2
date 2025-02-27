import Head from "next/head";
import Image from "next/image";

export default function MadyaIntro() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Head>
        <title>Madya Features</title>
      </Head>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">
          Whats in Fislab?
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Everything you need to pass physics labortory course.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg">
           <Image
                width={600}
                height={400}
                src="/image/madya/labmadya.jpeg"
                alt="logo"
                className="mb-4"
                />
            <h2 className="text-xl font-bold mb-2">
              Madya Laboratory
            </h2>
            <p className="text-gray-400">
              A wonderful place for practicum
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
          <Image
                width={600}
                height={400}
                src="/image/madya/osiloskop.jpeg"
                alt="logo"
                className="mb-4"
                />
            <h2 className="text-xl font-bold mb-2">
              Electronical Practicum
            </h2>
            <p className="text-gray-400">
            Makes you understand how electronic circuits work
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
          <Image
                width={600}
                height={400}
                src="/image/madya/frankhertz.jpeg"
                alt="logo"
                className="mb-4"
                />
            <h2 className="text-xl font-bold mb-2">
              Waves and Modern Physics Practicum
            </h2>
            <p className="text-gray-400">
              Makes you understand the physical symptoms of waves and experiments from modern physics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}