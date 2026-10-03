import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface MemoryMatchGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const EMOJI_POOL = ['🌸', '🍎', '🐱', '🌞', '🚗', '🎨', '🧩', '🎈', '⭐', '☕', '📚', '🦉'];

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    let pairCount = 4; // EASY: 8 cards (4 pairs)
    if (difficulty === 'MEDIUM') pairCount = 6; // 12 cards
    if (difficulty === 'HARD') pairCount = 8; // 16 cards

    const selectedEmojis = EMOJI_POOL.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
  }, [difficulty]);

  const handleCardClick = (id: number) => {
    if (isBusy) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const nextFlipped = [...flippedIds, id];
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsBusy(true);

      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find((c) => c.id === firstId);

      if (firstCard && firstCard.emoji === clickedCard.emoji) {
        // Match!
        setTimeout(() => {
          let isWin = false;
          let finalAcc = 100;

          setCards((prev) => {
            const updatedCards = prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            );
            const allMatched = updatedCards.every((c) => c.isMatched);
            if (allMatched) {
              isWin = true;
              finalAcc = Math.min(100, Math.max(50, Math.round((updatedCards.length / (moves + 1)) * 50)));
            }
            return updatedCards;
          });

          setFlippedIds([]);
          setIsBusy(false);
          setScore((s) => s + 25);

          if (isWin) {
            onFinishGame(100, finalAcc);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setIsBusy(false);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
        Moves: <span className="text-slate-900 dark:text-white font-black">{moves}</span>
      </div>

      <div
        className={`grid gap-3 sm:gap-4 ${
          cards.length <= 8
            ? 'grid-cols-4'
            : cards.length <= 12
            ? 'grid-cols-4'
            : 'grid-cols-4 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched}
              className={`h-24 sm:h-28 rounded-2xl border-2 text-3xl sm:text-4xl flex items-center justify-center transition-all transform duration-300 shadow-sm ${
                card.isMatched
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 opacity-90 scale-95'
                  : card.isFlipped
                  ? 'bg-blue-50 dark:bg-blue-950/80 border-[#0052CC] scale-100'
                  : 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600 hover:bg-slate-700 active:scale-95'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
