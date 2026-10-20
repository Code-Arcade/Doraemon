import React, { useState } from 'react';

const sweetEmojis = ['🍡', '🥞', '🍩', '🍧', '🧁', '🍪', '🍮'];

export default function CopterSpawner({ playBubbleSound }) {
  const [flyingSweets, setFlyingSweets] = useState([]);

  const spawnFlyingSweet = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const randomEmoji = sweetEmojis[Math.floor(Math.random() * sweetEmojis.length)];
    const randomX = Math.random() * 85 + 5; // 5vw to 90vw
    const scale = 0.6 + Math.random() * 0.7; // 0.6 to 1.3

    const newSweet = { id, emoji: randomEmoji, left: randomX, scale };

    // Append to flying array
    setFlyingSweets((prev) => [...prev, newSweet]);

    // Remove sweet after float finishes
    setTimeout(() => {
      setFlyingSweets((prev) => prev.filter((item) => item.id !== id));
    }, 4100);
  };

  const handleSpawnerClick = () => {
    playBubbleSound();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        spawnFlyingSweet();
      }, i * 150);
    }
  };

  return (
    <>
      <div 
        className="copter-spawner-badge" 
        id="bamboo-spawner" 
        role="button" 
        title="Spawn flying sweets!"
        onClick={handleSpawnerClick}
      >
        🚁
      </div>

      {/* Render flying items natively */}
      {flyingSweets.map((sweet) => (
        <div 
          key={sweet.id} 
          className="flying-copter-sweet" 
          style={{ left: `${sweet.left}vw`, transform: `scale(${sweet.scale})` }}
        >
          {sweet.emoji}
        </div>
      ))}
    </>
  );
}
