import React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import routes from 'routes';
import HomeCTA from '@app/components/Index/HomeCTA';
import GuidesCarousel from '@app/components/Carousel/GuidesCarousel';
import ProposalsCarousel from '@app/components/Carousel/ProposalsCarousel';
import PropL from 'public/assets/images/prop_card_l.png';
import PropD from 'public/assets/images/prop_card_d.png';
import ProposeLight from 'public/assets/images/propose_l.png';
import ProposeDark from 'public/assets/images/propose_d.jpeg';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const LandingPage: NextPage = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return (
    <div>
      <Head>
        <title>Builder DAO</title>
      </Head>
      <div className="relative z-0 flex">
        <div className="w-0.5 h-[1500px] -mt-24 bg-gradient-to-b from-[#B58954] via-[#6F086F] to-[#AE4F61]"></div>
        <main className="z-10 flex flex-col w-9/12 px-24 pt-60">
          <div className="z-10 flex">
            <div className="text-kafedarkred">
              <HomeCTA
                headline="Learn from guides written by our community"
                path={routes.learn.index}
                cta="view all guides"
              />
            </div>
            <div className="-mt-8">
              <GuidesCarousel />
            </div>
          </div>

          <div className="z-10 flex items-center mt-44">
            <ProposalsCarousel />
            <div className="z-10 pl-48 text-kafedarkpurple">
              <HomeCTA
                headline="Vote on proposals for guides you want to be written"
                path={routes.vote.index}
                cta="view all proposals"
              />
            </div>
          </div>

          <div className="relative z-0 flex justify-between py-16">
            <div className="mr-48 text-kafedarkred">
              <HomeCTA
                headline="Create your own proposal and get rewarded in KAFE"
                path={routes.write.index}
                cta="create a proposal"
              />
            </div>
            <div className="relative w-[5000px]">
              <div className="absolute -left-40 -top-36">
                {dark && (
                  <Image
                    src={ProposeDark}
                    width={400}
                    height={400}
                    alt="create"
                    priority={true}
                  />
                )}
                {!dark && (
                  <Image
                    src={ProposeLight}
                    width={400}
                    height={400}
                    alt="create"
                    priority={true}
                  />
                )}
              </div>
              <div className="absolute inset-0 w-[457px]">
                {dark && (
                  <Image
                    src={PropD}
                    width={457}
                    height={280}
                    alt="propose"
                    priority={true}
                  />
                )}
                {!dark && (
                  <Image
                    src={PropL}
                    width={457}
                    height={280}
                    alt="propose"
                    priority={true}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
