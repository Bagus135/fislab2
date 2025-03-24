import Credit from '@/components/home/credits';
import Footer from '@/components/home/footer';
import MadyaLab from '@/components/home/madya-intro';
import MainHome from '@/components/home/main';

export default function Home() {
  return (
    <div className='flex flex-col w-full'>
      <MainHome/>
      <MadyaLab/>
      <Credit/>
      <Footer/>
    </div>
  );
}

