import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Head from 'next/head';
import _ from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import fs from 'fs-extra';
import path from 'path';
import {
  getFileByPath,
  getFileParse,
  getPathForFile,
  getRelativePathForFile,
  getPathForRootFolder,
  getTutorialContentByPath,
  PostType,
} from '@builderdao/md-utils';
import { getMDXComponents } from '@builderdao/ui';
import React from 'react';
import { TutorialLayout } from 'layouts/tutorial-layout';
import { serializeContent } from '@app/lib/md/serializeContent';
import { ArweaveApi } from '@builderdao/apis';
import {
  NEXT_PUBLIC_ARWEAVE_HOST,
  NEXT_PUBLIC_ARWEAVE_PORT,
  NEXT_PUBLIC_ARWEAVE_PROTOCOL,
  NODE_ENV,
} from '@app/constants';
import { getFileFromGithub, getGithubUrl } from '@app/lib/api/github';
import { getApplicationFetcher } from '../../hooks/useDapp';
import { BuilderDaoConfigJson, BuilderDaoLockJson } from '@builderdao/cli';

const getFile = (slug, pathForFile) => {
  if (NODE_ENV === 'production') {
    return getGithubUrl(slug, pathForFile);
  } else {
    return path.join('/tutorials/', slug, pathForFile);
  }
};

const TutorialPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = props => {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  const { mdxSource, frontMatter, toc } = props.post;
  const { config, lock, relativePath, rootFolder, servedFrom } = props;
  return (
    <>
      <Head>
        <title>Kafé by Builder DAO - {config.title}</title>
      </Head>
      <NextSeo
        title={frontMatter.title}
        description={frontMatter.description}
        twitter={{
          handle: '@TheBuilderDAO',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />
      <TutorialLayout
        tutorialId={lock.proposalId}
        frontMatter={frontMatter}
        config={config}
        lock={lock}
        toc={toc}
        next={frontMatter.next}
        prev={frontMatter.prev}
      >
        <MDXRemote
          components={getMDXComponents({ lock, rootFolder, getFile })}
          {...mdxSource}
          scope={{ config, lock }}
        />
        <div className="p-2 mt-16 border border-black divide-y-[1px] divide-gray-600 rounded-lg dark:border-white dark:text-kafewhite bg-kafegold dark:bg-kafedarker shadow:sm">
          <div className="p-2">
            <span>Digest</span>:{' '}
            <span className="font-mono text-xs">
              {lock?.content[relativePath].digest}
            </span>
          </div>
          <div className="p-2">
            <span>Arweave Hash</span>:{' '}
            <a
              href={`https://viewblock.io/arweave/tx/${lock?.content[relativePath].arweaveHash}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-mono text-sm">
                {lock?.content[relativePath].arweaveHash}
              </span>
            </a>
          </div>
          <div className="p-2">
            <span>Served From</span>:{' '}
            <span className="font-mono text-sm">{servedFrom}</span>
          </div>
        </div>
      </TutorialLayout>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [], // arweave download takes time. skip it
    fallback: 'blocking', // false or 'blocking' /
  };
}

export const getStaticProps: GetStaticProps = async context => {
  const slug = context.params.slug as string[];
  let servedFrom: 'local' | 'arweave' | 'github' = 'local';
  const relativePath = getRelativePathForFile(slug[1]);
  const getBuilderdaoConfigLock = async (
    tutorialSlug: string,
  ): Promise<{
    config: BuilderDaoConfigJson;
    lock: BuilderDaoLockJson;
  }> => {
    try {
      if (NODE_ENV === 'production') {
        const applicationFetcher = getApplicationFetcher();
        const tutorial = await applicationFetcher.getTutorialBySlug(
          tutorialSlug,
        );
        const rootFolder = getPathForRootFolder(tutorialSlug);
        let content = tutorial.content;
        if (fs.existsSync(rootFolder)) {
          const { config, lock } = await getTutorialContentByPath({
            rootFolder,
          });
          content = { ...lock.content, ...content };
        }
        return {
          config: {
            title: tutorial.title,
            description: tutorial.description,
            // TODO:  Ceramic calls it tags lock file calls it categories.
            categories: tutorial.tags,
            imageUrl: '',
          },
          lock: {
            proposalId: tutorial.id,
            creator: tutorial.creator,
            content,
            slug: tutorial.slug,
            reviewers: {
              reviewer1: {
                pubkey: tutorial.reviewer1.toString(),
              },
              reviewer2: {
                pubkey: tutorial.reviewer2.toString(),
              },
            },
            href: `learn/${tutorial.slug}`,
          },
        };
      } else {
        const rootFolder = getPathForRootFolder(tutorialSlug);
        const { config, lock } = await getTutorialContentByPath({ rootFolder });
        return {
          config,
          lock,
        };
      }
    } catch (err) {
      console.log(err);
      const rootFolder = getPathForRootFolder(tutorialSlug);
      const { config, lock } = await getTutorialContentByPath({ rootFolder });
      return {
        config,
        lock,
      };
    }
  };

  const getPost = async (): Promise<{ content: string; data: any }> => {
    if (NODE_ENV === 'production') {
      try {
        const applicationFetcher = getApplicationFetcher();

        const tutorial = await applicationFetcher.getTutorialBySlug(slug[0]);
        const arweave = new ArweaveApi({
          host: NEXT_PUBLIC_ARWEAVE_HOST,
          port: parseInt(NEXT_PUBLIC_ARWEAVE_PORT),
          protocol: NEXT_PUBLIC_ARWEAVE_PROTOCOL,
        });

        const arweaveHash = tutorial.content[relativePath].arweaveHash;

        const response = await arweave.getTutorialByHash(arweaveHash);
        if (response) {
          servedFrom = 'arweave';
          return getFileParse<PostType.TUTORIAL>(response.data);
        }
      } catch (err) {
        console.log(err);
        servedFrom = 'github';
        const file = await getFileFromGithub(slug[0], relativePath);
        return getFileParse<PostType.TUTORIAL>(file);
      }
    } else if (NODE_ENV === 'production') {
      const file = await getFileFromGithub(slug[0], relativePath);
      servedFrom = 'github';
      return getFileParse<PostType.TUTORIAL>(file);
    } else {
      servedFrom = 'local';
      const pathForFile = getPathForFile(slug[0], slug[1]);
      return await getFileByPath<PostType.TUTORIAL>(pathForFile);
    }
  };

  const { config, lock } = await getBuilderdaoConfigLock(slug[0]);
  const post = await getPost();

  const content = await serializeContent({
    content: post.content,
    data: post.data,
  });
  return {
    props: {
      config,
      lock,
      relativePath,
      post: { ...post, ...content },
      slug,
      servedFrom,
    },
    revalidate: 60 * 10, // In seconds
  };
};

export default TutorialPage;
