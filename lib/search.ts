import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Searches for regulatory body information based on country and sector.
 * @param country The country to search in.
 * @param sector The industry sector (e.g., banking, telecom).
 * @returns A string containing snippets from the top search results.
 */
export async function searchRegulator(country: string, sector: string): Promise<string> {
  try {
    const query = `"${country} ${sector} regulatory body consumer complaint contact email"`;
    const response = await tvly.search(query, {
      searchDepth: 'basic',
      maxResults: 3,
    });

    if (!response.results || response.results.length === 0) {
      return '';
    }

    return response.results
      .map((result: any) => result.content)
      .join('\n\n');
  } catch (error) {
    console.error('Tavily search failed:', error);
    return '';
  }
}
