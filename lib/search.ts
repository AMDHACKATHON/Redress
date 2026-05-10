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

/**
 * Searches for the public customer service / complaints contact email of a company.
 * @param company The organization name being complained about.
 * @param country Optional country to scope the search.
 * @returns A string containing snippets from the top search results.
 */
export async function searchCompanyContact(
  company: string,
  country?: string
): Promise<string> {
  if (!company) return '';
  try {
    const scope = country ? ` ${country}` : '';
    const query = `"${company}${scope} customer service complaint contact email support"`;
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
    console.error('Tavily company contact search failed:', error);
    return '';
  }
}
