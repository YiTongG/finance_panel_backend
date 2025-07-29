const axios = require('axios');


const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

const RAPIDAPI_HOST2 = process.env.RAPIDAPI_HOST2;
class IndexModel{
    /**
     * Fetches detailed quote data for a given ticker and formats it 
     * into a "Market Summary" object.
     * @param {string} ticker The stock/index ticker symbol (e.g., '^GSPC')
     * @returns {object} A formatted Market Summary object.
     */
    static async fetchChartStats(ticker) {
     /**
     * Fetches BOTH the quote snapshot AND the historical data for a given ticker.
     * @param {string} ticker The stock/index ticker symbol (e.g., '^GSPC')
     * @returns {object} An object containing 'marketSummary' and 'historicalData'.
     */
        // 1. Configure the options for BOTH API calls
        const quoteOptions = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/api/yahoo/qu/quote/${ticker}`,
            headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST }
        };

        const historyOptions = {
            method: 'GET',
            // The URL is just the base endpoint
            url: `https://${RAPIDAPI_HOST}/api/v1/markets/stock/history`,
            // Use the 'params' object for all query string parameters
            params: {
                symbol: ticker,
                interval: '1wk', // 
                diffandsplits: 'false'
            },
            headers: { 
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST 
            }
        };
        try {
            // 2. Execute both API calls in parallel for maximum efficiency
            const [quoteResponse, historyResponse] = await Promise.all([
                axios.request(quoteOptions),
                axios.request(historyOptions)
            ]);

            // --- Process the Quote Response for Market Summary ---
            const quote = quoteResponse.data.body[0];
            if (!quote) throw new Error(`No quote data returned for ticker: ${ticker}`);
            
            const marketSummary = {
                "Previous Close": parseFloat(quote.regularMarketPreviousClose).toFixed(2),
                "Open": parseFloat(quote.regularMarketOpen).toFixed(2),
                "Day's Range": quote.regularMarketDayRange,
                "52-Week Range": quote.fiftyTwoWeekRange,
                "Volume": quote.regularMarketVolume.toLocaleString(),
                "Avg. Volume (3M)": quote.averageDailyVolume3Month.toLocaleString(),
                "50-Day Average": parseFloat(quote.fiftyDayAverage).toFixed(2),
                "200-Day Average": parseFloat(quote.twoHundredDayAverage).toFixed(2)
            };

            // --- Process the History Response for Chart Data ---
            const history = historyResponse.data.body;
            if (!history) throw new Error(`No history data returned for ticker: ${ticker}`);

            // In a real app, you would add logic here to calculate moving averages for the chart
            const historicalData = Object.entries(history).map(([timestamp, data]) => ({
                date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
                price: data.close.toFixed(2),
                volume: data.volume
            }));

            // 3. Return a single object with both sets of data
            return {
                marketSummary: marketSummary,
                historicalData: historicalData.reverse() // Reverse for chronological order
            };

        } catch (error) {
            console.error(`API calls failed for ${ticker}:`, error.response ? error.response.data : error.message);
            throw new Error(`获取 ${ticker} 的组合数据失败。`);
        }
    }
    /**
     * Fetches the count of trending tickers for all specified regions and calculates
     * each region's percentage of the total for a pie chart.
     * @returns {Array<object>} An array of objects, e.g., { region, count, percentage }.
     */
    static async getTrendingDistribution() {
        const regions = ['US', 'BR', 'AU', 'CA', 'FR', 'DE', 'HK', 'IN', 'IT', 'ES', 'GB', 'SG'];
        const allResults = [];
        
        // Define a batch size that is safely within the API's rate limit (e.g., 4 or 5)
        const batchSize = 6;
        
        console.log(`Fetching data in batches of ${batchSize}...`);

        for (let i = 0; i < regions.length; i += batchSize) {
            // Get the current batch of regions to process
            const currentBatch = regions.slice(i, i + batchSize);
            console.log(`Processing batch: [${currentBatch.join(', ')}]`);

            // Create an array of promises for the current batch
            const promises = currentBatch.map(region => {
                const options = {
                    method: 'GET',
                    url: `https://${RAPIDAPI_HOST2}/market/get-trending-tickers`,
                    params: { region: region },
                    headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST2 }
                };
                return axios.request(options)
                    .then(response => {
                        const quotes = response.data?.finance?.result[0]?.quotes || [];
                        return { region, count: quotes.length, status: 'success' };
                    })
                    .catch(error => {
                        console.error(`Failed to fetch data for region ${region}: ${error.message}`);
                        return { region, count: 0, status: 'error' };
                    });
            });

            // Wait for the current batch of API calls to complete
            const batchResults = await Promise.all(promises);
            allResults.push(...batchResults); // Add the batch results to our main array

            // IMPORTANT: Wait for a short period (e.g., 1 second) before starting the next batch
            // This check prevents waiting after the very last batch.
            if (i + batchSize < regions.length) {
                console.log("Waiting 0.1 second to respect rate limit...");
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // --- The rest of the processing logic is the same ---
        const successfulResults = allResults.filter(r => r.status === 'success');
        const totalCount = successfulResults.reduce((sum, current) => sum + current.count, 0);

        if (totalCount === 0) { /* ... error handling ... */ }

        const distributionData = successfulResults.map(result => ({
            region: result.region,
            count: result.count,
            percentage: parseFloat(((result.count / totalCount) * 100).toFixed(2))
        }));

        console.log("Distribution data successfully generated.");
        return distributionData;
    }

}

module.exports = IndexModel;
