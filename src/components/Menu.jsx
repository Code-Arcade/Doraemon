import React from 'react';

const menuProducts = [
  {
    id: "dorayaki",
    name: "Red-Bean Dorayaki",
    price: 4.50,
    desc: "Doraemon's favorite. House-made sweet red bean paste layered inside fluffy honey pancakes.",
    img: "/assets/images/doraemon_desserts.png"
  },
  {
    id: "memory-bread",
    name: "Memory French Toast",
    price: 6.25,
    desc: "Sweet caramelized French brioche slice embossed with sweet edible numbers.",
    img: "/assets/images/memory_french_toast.jpg"
  },
  {
    id: "anywhere-door-tart",
    name: "Anywhere Door Tart",
    price: 7.50,
    desc: "Molten dark chocolate tart topped with acid raspberries and custom strawberry glazes.",
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80"
  },
  {
    id: "copter-cupcake",
    name: "Bamboo Cloud Mochi",
    price: 5.75,
    desc: "Sponge velvet cupcake topped with light cloud vanilla mochi and miniature prop details.",
    img: "/assets/images/bamboo_cloud_mochi.jpg"
  }
];

export default function Menu({ products, onAddToCart }) {
  const displayProducts = products && products.length > 0 ? products : menuProducts;

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Signature Treats</span>
          <h2 className="section-title">Magical Pastry Lab</h2>
        </div>

        <div className="menu-grid" id="dessert-menu-grid">
          {displayProducts.map((prod) => (
            <div className="menu-card" key={prod.id} data-item-id={prod.id}>
              <div className="card-img-container">
                {prod.img ? (
                  <img src={prod.img} alt={prod.name} className="card-img" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: prod.colorBg || '#f0f6ff', fontSize: '5rem' }} className="card-img">
                    {prod.emoji || '🧁'}
                  </div>
                )}
                
                {/* Clean default view bottom bar */}
                <div className="card-info-bar">
                  <span className="bar-title">{prod.name}</span>
                  <span className="bar-price">₹{parseFloat(prod.price).toFixed(2)}</span>
                </div>
                
                {/* Slide-Up Hover Details Overlay */}
                <div className="card-hover-overlay">
                  <h4 className="overlay-title">{prod.name}</h4>
                  <p className="overlay-desc">{prod.desc}</p>
                  <button className="btn-overlay-cart" onClick={() => onAddToCart(prod.name, prod.price)}>
                    Add to Cart +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
