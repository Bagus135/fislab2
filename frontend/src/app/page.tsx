import Credit from '@/components/home/credits';
import MadyaLab from '@/components/home/madya-intro';
import MainHome from '@/components/home/main';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {

  return (
    <div className='flex flex-col w-full'>
      <MainHome/>
      <MadyaLab/>
      <Credit/>
    </div>
  );
}