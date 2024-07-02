import axios from 'axios';
import { load } from 'cheerio';

export async function crawlWikipedia() {
  const games = [];
  try {
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_drinking_games');
    const $ = load(response.data);
    
    // Find all h2 elements that contain single letters or "0–9"
    $('h2').each((i, el) => {
      const headingText = $(el).find('.mw-headline').text().trim();
      
      // Check if the heading is a single letter or "0–9"
      if (/^[A-Z]$/.test(headingText) || headingText === "0–9") {
        // Get the list items following this heading
        $(el).nextUntil('h2', 'ul').find('li > a:first-child').each((i, gameEl) => {
          const title = $(gameEl).text().trim();
          const link = 'https://en.wikipedia.org' + $(gameEl).attr('href');
          
          if (title && link && !link.includes('#')) {
            games.push({ title, link });
          }
        });
      }
    });

    console.log(`Found ${games.length} games`);

    // Fetch details for each game
    for (const game of games) {
      try {
        const gameResponse = await axios.get(game.link);
        const $game = load(gameResponse.data);
        
        let gameInfo = {
          description: '',
          sections: {}
        };

        // Extract description (usually the first few paragraphs before any header)
        $game('.mw-parser-output > p').each((i, el) => {
          if (i < 3 && $game(el).prev().is(':not(h2, h3, h4)')) { // Limit to first 3 paragraphs before any header
            gameInfo.description += $game(el).text() + '\n';
          }
        });
        gameInfo.description = gameInfo.description.trim();

        // Function to extract content until the next h2 or end of content
        const extractUntilNextH2 = (startElement) => {
          let content = '';
          let currentElement = startElement;
          while (currentElement.length && !currentElement.is('h2')) {
            if (currentElement.is('p, ul, ol')) {
              content += currentElement.text() + '\n';
            }
            currentElement = currentElement.next();
          }
          return content.trim();
        };

        // Extract sections based on h3 headers
        $game('h2').each((i, el) => {
          const sectionTitle = $game(el).text().trim();
          const sectionContent = extractUntilNextH2($game(el).next());
          if (sectionContent) {
            gameInfo.sections[sectionTitle] = sectionContent;
          }
        });

        // If no h3 headers were found, try to get all content after description until next h2
        if (Object.keys(gameInfo.sections).length === 0) {
          let firstH2 = $game('.mw-parser-output > h2').first();
          if (firstH2.length) {
            gameInfo.sections['General Information'] = extractUntilNextH2(firstH2.next());
          }
        }

        game.details = gameInfo;
      } catch (error) {
        console.error(`Error fetching details for ${game.title}:`, error);
        game.details = {
          description: "Unable to fetch game details.",
          sections: {}
        };
      }
    }

    console.log(`Crawled ${games.length} games`);
    return games;
  } catch (error) {
    console.error('Error crawling Wikipedia:', error);
    return [];
  }
}