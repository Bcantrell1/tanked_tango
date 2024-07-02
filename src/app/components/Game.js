'use client';

import { useState, useEffect } from 'react';

export function Game() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Failed to fetch game');
        const data = await response.json();
        setGame(data);
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!game) {
    return <div className="text-center text-2xl text-gray-600 mt-10">No game found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{game.title}</h2>
      {game.details.description && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">{game.details.description}</p>
        </div>
      )}
      {Object.entries(game.details.sections).map(([sectionTitle, sectionContent]) => (
        <div key={sectionTitle} className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">{sectionTitle}</h3>
          <p className="text-gray-600 leading-relaxed">{sectionContent}</p>
        </div>
      ))}
    </div>
  );
}