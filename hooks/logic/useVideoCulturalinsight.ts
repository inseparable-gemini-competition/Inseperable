import { useQuery, UseQueryResult } from 'react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

interface CulturalInsightsResponse {
  culturalInsights: string;
}

interface CulturalInsightsParams {
  url: string;
  language: string;
}

const extractCulturalInsights = httpsCallable<CulturalInsightsParams, CulturalInsightsResponse>(
  functions,
  'extractCulturalVideoAnalysis',
  {
    timeout: 540000
  }
);


export const useExtractCulturalInsights = (youtubeUrl: string, language: string = 'unknown'): UseQueryResult<string, Error> => {
  return useQuery<string, Error>(
    ['culturalInsights', youtubeUrl, language],
    async () => {
      try {
        const result = await extractCulturalInsights({ url: youtubeUrl, language });
        return result.data.culturalInsights;
      } catch (error) {
        console.error('Error calling Firebase function:', error);
        throw error;
      }
    },
    {
      enabled: false,
      retry: 1,
    }
  );
};