const axios = require('axios');


const RAPIDAPI_KEY2 = process.env.RAPIDAPI_KEY2;
const RAPIDAPI_HOST2 = process.env.RAPIDAPI_HOST2;


class globalModel {
    /**
     * Fetches the latest news for a given region.
     * @param {string} region - The region to fetch news for (e.g., 'US').
     * @returns {Promise<Array<{title: string, link: string}>>} A list of news articles.
     */
    static async fetchNews(region = 'US') {
        const options = {
            method: 'POST',
            url: `https://${RAPIDAPI_HOST2}/news/v2/list`,
            params: {
                region: region,
                snippetCount: 10 // Fetch 10 articles
            },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY2,
                'x-rapidapi-host': RAPIDAPI_HOST2
            }
        };

        try {
            const response = await axios.request(options);

            // Safely access the list of news articles in the response
            const articles = response.data?.data?.main?.stream || [];

            // Map over the articles to extract only the title and link
            const newsList = articles.map(article => {
                const content = article.content;
                // The primary link is often in 'clickThroughUrl', fallback to 'canonicalUrl'
                const link = content.clickThroughUrl?.url || content.canonicalUrl?.url || '';
                
                return {
                    title: content.title,
                    link: link
                };
            }).filter(item => item.title && item.link); // Filter out any items that might be missing a title or link

            return newsList;

        } catch (error) {
            console.error(`API call for news failed for ${region}:`, error.response ? error.response.data : error.message);
            throw new Error(`获取 ${region} 地区的新闻失败。`);
        }
    }

}
module.exports = globalModel;