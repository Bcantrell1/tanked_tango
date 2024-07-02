import { crawlWikipedia } from '../../../lib/crawler';
import { NextResponse } from 'next/server';

let games = [];
let lastCrawl = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const now = Date.now();
  if (games.length === 0 || now - lastCrawl > CACHE_DURATION) {
    games = await crawlWikipedia();
    lastCrawl = now;
  }

  if (games.length === 0) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }

  const randomGame = games[Math.floor(Math.random() * games.length)];
  return NextResponse.json(randomGame);
}