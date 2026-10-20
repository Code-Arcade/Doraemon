import React from 'react';

const friendsReviews = [
  {
    emoji: "👓",
    name: "Nobita Nobi",
    role: "Regular Customer",
    text: "The Memory French Toast is incredibly delicious. And it actually works for exam mornings!"
  },
  {
    emoji: "🐱",
    name: "Doraemon",
    role: "Gadget Inspector",
    text: "The Red-Bean Dorayaki is the best in the century! I have automated weekly orders."
  },
  {
    emoji: "🌸",
    name: "Shizuka",
    role: "Sweets Critic",
    text: "Beautiful styling and lovely ambiance shifts! The Anywhere Door tart is extremely refined."
  }
];

export default function Reviews() {
  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">Neighborhood Stories</span>
          <h2 className="section-title">Tested by Friends</h2>
        </div>

        <div className="reviews-grid">
          {friendsReviews.map((rev, index) => (
            <div className="review-card" key={index}>
              <p className="review-text">"{rev.text}"</p>
              <div className="review-author">
                <span className="author-emoji">{rev.emoji}</span>
                <div>
                  <h4 className="author-name">{rev.name}</h4>
                  <p className="author-role">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
