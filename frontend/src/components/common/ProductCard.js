import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const StarRating = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? "star" : "star empty"}>★</span>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to add to cart"); return; }
    if (product.stock === 0) return;
    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const price = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  return (
    <Link to={`/products/${product._id}`} style={{ display: "flex", flexDirection: "column", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", transition: "var(--transition)", textDecoration: "none", color: "inherit" }}>
      <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "var(--bg-elevated)" }}>
        {product.images?.[0]?.url
          ? <img src={product.images[0].url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🖼️</div>
        }
        {hasDiscount && <span style={{ position: "absolute", top: "12px", left: "12px", background: "var(--accent)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" }}>-{discountPct}%</span>}
        {product.stock === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600 }}>Out of Stock</div>}
        {product.isLowStock && product.stock > 0 && <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(245,158,11,0.2)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.3)", fontSize: "11px", padding: "3px 8px", borderRadius: "20px" }}>Low Stock</span>}
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{product.category}</div>
        <h3 style={{ fontWeight: 600, fontSize: "15px", lineHeight: 1.3 }}>{product.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StarRating rating={product.ratings} />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({product.numReviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px" }}>
          <div>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>₹{price.toLocaleString("en-IN")}</span>
            {hasDiscount && <span style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "line-through", marginLeft: "8px" }}>₹{product.price.toLocaleString("en-IN")}</span>}
          </div>
          <button
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: product.stock === 0 ? "var(--bg-elevated)" : "var(--accent)", color: product.stock === 0 ? "var(--text-muted)" : "white", border: "none", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: product.stock === 0 ? "not-allowed" : "pointer" }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >{product.stock === 0 ? "✗" : "+"}</button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
