// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';

import { AlgoliaApi } from '@builderdao/apis';
import {
  NEXT_PUBLIC_ALGOLIA_APP_ID,
  ALGOLIA_WRITE_API_KEY,
  NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
} from '@app/constants';
import { captureException } from '@app/utils/errorLogging';

type ResponseData = {
  success: boolean;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  const { id, ...data } = req.body;

  const algoliaApi = new AlgoliaApi({
    appId: NEXT_PUBLIC_ALGOLIA_APP_ID,
    accessKey: ALGOLIA_WRITE_API_KEY,
    indexName: NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
  });

  try {
    await algoliaApi.updateTutorial(id, data);
  } catch (err) {
    console.log('ERR', err);
    captureException(err);
  }

  res.status(200).json({
    success: true,
  });
};

export default withSentry(handler);
