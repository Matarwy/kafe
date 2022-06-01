import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import routes from '../routes';
import { useTutorialProgram } from './useTutorialProgram';

export const useProposeTutorial = <AD>(): [
  (data: AD) => Promise<string | undefined>,
  {
    submitting: boolean;
    error: Error | null;
  },
] => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const tutorialProgram = useTutorialProgram();

  const handleAction = useCallback(
    async (data: AD) => {
      try {
        setError(null);
        setSubmitting(true);
        // TODO: add types for create Tutorial.
        const txHash = await tutorialProgram?.createTutorial(data as any);

        console.log('TX Hash', txHash);

        mutate(routes.daoState);

        return txHash;
      } catch (err) {
        if (err instanceof Error) {
          console.log('Err:', err);
          setError(err);
        }

        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [tutorialProgram],
  );

  return [handleAction, { submitting, error }];
};
