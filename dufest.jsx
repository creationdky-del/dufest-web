import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "dufest2026";
const WHATSAPP_NUMBER = "9411461837";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/dufest.in",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  youtube: "https://youtube.com/@dufest",
  twitter: "https://twitter.com/dufestin",
};

const CATEGORIES = ["All", "Events", "News", "Artist", "Passes", "Updates"];

const SAMPLE_POSTS = [
  {
    id: "post_1",
    title: "RHYTHM'26 — Coming Soon 🎶",
    category: "Events",
    content: "Delhi University ka biggest music fest aa raha hai! Get ready for an unforgettable night with top artists. Stay tuned for lineup reveal.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    date: "2026-05-28",
    pinned: true,
    ratings: [5, 4, 5, 5],
    comments: [{ user: "Rahul", text: "Can't wait!! 🔥", date: "2026-05-29" }],
  },
  {
    id: "post_2",
    title: "PAPON LIVE at DU Fest 🎤",
    category: "Artist",
    content: "Papon is coming to perform LIVE! One of India's most beloved folk-fusion artists. Free passes available for DU students.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    date: "2026-05-25",
    pinned: false,
    ratings: [5, 5, 4],
    comments: [],
  },
  {
    id: "post_3",
    title: "Free Passes — How to Get Them?",
    category: "Passes",
    content: "Follow us on Instagram @dufest.in, share this post on your story, and DM us your college ID. Limited passes available!",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    date: "2026-05-20",
    pinned: false,
    ratings: [4, 5],
    comments: [{ user: "Priya", text: "Done! DM kar diya 😊", date: "2026-05-21" }],
  },
];

function avgRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
}

function StarRating({ value, onRate, readonly }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => !readonly && onRate && onRate(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: 18,
            cursor: readonly ? "default" : "pointer",
            color: s <= (hovered || value) ? "#FF6B00" : "#444",
            transition: "color 0.15s",
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function DUFestWebsite() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentUser, setCommentUser] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [toast, setToast] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);

  const [newPost, setNewPost] = useState({
    title: "", category: "Events", content: "", image: "", pinned: false
  });

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await window.storage.get("dufest_posts");
        if (stored && stored.value) {
          setPosts(JSON.parse(stored.value));
        } else {
          setPosts(SAMPLE_POSTS);
          await window.storage.set("dufest_posts", JSON.stringify(SAMPLE_POSTS));
        }
      } catch {
        setPosts(SAMPLE_POSTS);
      }
    };
    init();
  }, []);

  const savePosts = async (updated) => {
    setPosts(updated);
    try {
      await window.storage.set("dufest_posts", JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleAdminLogin = () => {
    if (adminPwd === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPwd("");
      setAdminError("");
      showToast("✅ Admin mode activated!");
    } else {
      setAdminError("Wrong password! Try again.");
    }
  };

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.content) return;
    const post = {
      id: "post_" + Date.now(),
      ...newPost,
      date: new Date().toISOString().split("T")[0],
      ratings: [],
      comments: [],
    };
    const updated = [post, ...posts];
    await savePosts(updated);
    setNewPost({ title: "", category: "Events", content: "", image: "", pinned: false });
    setShowNewPostForm(false);
    showToast("✅ Post published!");
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    const updated = posts.filter(p => p.id !== id);
    await savePosts(updated);
    if (selectedPost?.id === id) setSelectedPost(null);
    showToast("🗑️ Post deleted");
  };

  const handleComment = async () => {
    if (!commentText.trim() || !commentUser.trim()) return;
    const updated = posts.map(p => {
      if (p.id === selectedPost.id) {
        const up = {
          ...p,
          comments: [...(p.comments || []), {
            user: commentUser, text: commentText,
            date: new Date().toISOString().split("T")[0]
          }]
        };
        setSelectedPost(up);
        return up;
      }
      return p;
    });
    await savePosts(updated);
    setCommentText("");
    setCommentUser("");
    showToast("💬 Comment added!");
  };

  const handleRate = async (rating) => {
    if (userRating > 0) return showToast("You already rated this!");
    setUserRating(rating);
    const updated = posts.map(p => {
      if (p.id === selectedPost.id) {
        const up = { ...p, ratings: [...(p.ratings || []), rating] };
        setSelectedPost(up);
        return up;
      }
      return p;
    });
    await savePosts(updated);
    showToast("⭐ Thanks for your rating!");
  };

  const handleSaveEdit = async () => {
    if (!editPost.title || !editPost.content) return;
    const updated = posts.map(p => p.id === editPost.id ? { ...editPost } : p);
    await savePosts(updated);
    setSelectedPost(editPost);
    setEditPost(null);
    showToast("✅ Post updated!");
  };

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const pinned = filtered.filter(p => p.pinned);
  const regular = filtered.filter(p => !p.pinned);
  const displayPosts = [...pinned, ...regular];

  const styles = {
    root: {
      fontFamily: "'Bebas Neue', 'Black Han Sans', sans-serif",
      background: "#080A0F",
      minHeight: "100vh",
      color: "#F0EDE8",
      position: "relative",
    },
    header: {
      background: "linear-gradient(135deg, #0D0F1A 0%, #130A00 100%)",
      borderBottom: "2px solid #FF6B00",
      padding: "0 20px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 58,
    },
    logo: {
      fontSize: 26,
      fontWeight: 900,
      background: "linear-gradient(90deg, #FF6B00, #FFB347)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: 2,
    },
    nav: {
      display: "flex",
      gap: 6,
    },
    navBtn: (active) => ({
      background: active ? "#FF6B00" : "transparent",
      border: active ? "none" : "1px solid #333",
      color: active ? "#fff" : "#AAA",
      padding: "5px 14px",
      borderRadius: 20,
      fontSize: 12,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: 1,
      transition: "all 0.2s",
    }),
    hero: {
      background: "linear-gradient(135deg, #130A00 0%, #0A0D1A 50%, #001020 100%)",
      padding: "48px 20px 36px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroTitle: {
      fontSize: 52,
      fontWeight: 900,
      letterSpacing: 6,
      background: "linear-gradient(90deg, #FF6B00, #FFD700, #FF6B00)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundSize: "200%",
      animation: "shimmer 3s infinite linear",
      margin: 0,
    },
    heroSub: {
      fontSize: 13,
      color: "#888",
      letterSpacing: 3,
      marginTop: 8,
      fontFamily: "sans-serif",
    },
    statsRow: {
      display: "flex",
      justifyContent: "center",
      gap: 32,
      marginTop: 24,
    },
    stat: {
      textAlign: "center",
    },
    statNum: {
      fontSize: 28,
      color: "#FF6B00",
      display: "block",
    },
    statLabel: {
      fontSize: 10,
      color: "#666",
      letterSpacing: 2,
      fontFamily: "sans-serif",
    },
    catRow: {
      display: "flex",
      gap: 8,
      padding: "16px 16px 8px",
      overflowX: "auto",
    },
    catBtn: (active) => ({
      flexShrink: 0,
      background: active ? "#FF6B00" : "#12151F",
      border: active ? "none" : "1px solid #222",
      color: active ? "#fff" : "#777",
      padding: "6px 16px",
      borderRadius: 20,
      fontSize: 11,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: 1.5,
      transition: "all 0.2s",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: 16,
      padding: "16px",
    },
    card: {
      background: "#0E1118",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #1A1D28",
      cursor: "pointer",
      transition: "transform 0.2s, border-color 0.2s",
    },
    cardImg: {
      width: "100%",
      height: 180,
      objectFit: "cover",
    },
    cardBody: {
      padding: "14px 16px",
    },
    cardCat: {
      fontSize: 10,
      color: "#FF6B00",
      letterSpacing: 2,
      fontFamily: "sans-serif",
    },
    cardTitle: {
      fontSize: 18,
      margin: "6px 0 4px",
      letterSpacing: 1,
    },
    cardMeta: {
      fontSize: 11,
      color: "#555",
      fontFamily: "sans-serif",
    },
    pinnedBadge: {
      display: "inline-block",
      background: "#FF6B00",
      color: "#fff",
      fontSize: 9,
      letterSpacing: 2,
      padding: "2px 8px",
      borderRadius: 4,
      marginBottom: 6,
      fontFamily: "sans-serif",
    },
    socialBar: {
      display: "flex",
      justifyContent: "center",
      gap: 16,
      padding: "24px 20px",
      flexWrap: "wrap",
    },
    socialBtn: (color) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: color,
      color: "#fff",
      padding: "10px 20px",
      borderRadius: 24,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "inherit",
      letterSpacing: 1,
      textDecoration: "none",
      fontWeight: 700,
    }),
    // Modal
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 200,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      overflowY: "auto",
      padding: "20px 0 40px",
    },
    modal: {
      background: "#0E1118",
      borderRadius: 16,
      width: "100%",
      maxWidth: 600,
      margin: "0 16px",
      border: "1px solid #2A2D3A",
      overflow: "hidden",
    },
    modalImg: {
      width: "100%",
      maxHeight: 320,
      objectFit: "cover",
    },
    modalBody: {
      padding: "20px",
    },
    input: {
      width: "100%",
      background: "#12151F",
      border: "1px solid #2A2D3A",
      color: "#F0EDE8",
      padding: "10px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontFamily: "sans-serif",
      marginBottom: 10,
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      background: "#12151F",
      border: "1px solid #2A2D3A",
      color: "#F0EDE8",
      padding: "10px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontFamily: "sans-serif",
      resize: "vertical",
      marginBottom: 10,
      boxSizing: "border-box",
    },
    btn: (variant) => ({
      background: variant === "primary" ? "#FF6B00" : variant === "danger" ? "#C0392B" : "#1A1D28",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 12,
      fontFamily: "inherit",
      letterSpacing: 1,
      fontWeight: 700,
    }),
    comment: {
      background: "#12151F",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 8,
      border: "1px solid #1E2130",
    },
    whatsappFloat: {
      position: "fixed",
      bottom: 24,
      right: 24,
      background: "#25D366",
      color: "#fff",
      borderRadius: "50%",
      width: 56,
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 28,
      boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
      cursor: "pointer",
      zIndex: 300,
      textDecoration: "none",
    },
    toast: {
      position: "fixed",
      bottom: 90,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#FF6B00",
      color: "#fff",
      padding: "10px 24px",
      borderRadius: 24,
      fontSize: 13,
      fontFamily: "sans-serif",
      zIndex: 500,
      boxShadow: "0 4px 20px rgba(255,107,0,0.5)",
      whiteSpace: "nowrap",
    },
    adminBar: {
      background: "#1A0800",
      borderBottom: "1px solid #FF6B00",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },
    footer: {
      background: "#080A0F",
      borderTop: "1px solid #1A1D28",
      padding: "32px 20px",
      textAlign: "center",
    },
  };

  const renderHome = () => (
    <>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <h1 style={styles.heroTitle}>DUFEST.IN</h1>
        <p style={styles.heroSub}>DELHI UNIVERSITY FESTS • EVENTS • ARTIST NEWS</p>
        <div style={styles.statsRow}>
          {[["136", "POSTS"], ["465", "FOLLOWERS"], ["26.6T", "VIEWS/MONTH"]].map(([n, l]) => (
            <div key={l} style={styles.stat}>
              <span style={styles.statNum}>{n}</span>
              <span style={styles.statLabel}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Bar */}
      <div style={styles.socialBar}>
        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" style={styles.socialBtn("linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)")}>
          📸 Instagram
        </a>
        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" style={styles.socialBtn("#25D366")}>
          💬 WhatsApp
        </a>
        <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" style={styles.socialBtn("#FF0000")}>
          ▶️ YouTube
        </a>
        <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" style={styles.socialBtn("#1DA1F2")}>
          🐦 Twitter
        </a>
      </div>

      {/* Categories */}
      <div style={styles.catRow}>
        {CATEGORIES.map(c => (
          <button key={c} style={styles.catBtn(activeCategory === c)}
            onClick={() => setActiveCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Posts Grid */}
      <div style={styles.grid}>
        {displayPosts.length === 0 && (
          <div style={{ color: "#555", padding: 32, fontFamily: "sans-serif", gridColumn: "1/-1" }}>
            No posts yet. {isAdmin ? "Create one! ↑" : "Check back soon."}
          </div>
        )}
        {displayPosts.map(post => (
          <div key={post.id} style={styles.card}
            onClick={() => { setSelectedPost(post); setUserRating(0); }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "#FF6B00";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.borderColor = "#1A1D28";
            }}>
            {post.image && <img src={post.image} alt="" style={styles.cardImg} onError={e => e.target.style.display = "none"} />}
            <div style={styles.cardBody}>
              {post.pinned && <div style={styles.pinnedBadge}>📌 PINNED</div>}
              <div style={styles.cardCat}>{post.category}</div>
              <div style={styles.cardTitle}>{post.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <StarRating value={Math.round(avgRating(post.ratings))} readonly />
                <span style={{ fontSize: 11, color: "#666", fontFamily: "sans-serif" }}>
                  {avgRating(post.ratings)} ({post.ratings?.length || 0})
                </span>
              </div>
              <div style={{ ...styles.cardMeta, marginTop: 6 }}>
                {post.date} • {post.comments?.length || 0} comments
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collab Banner */}
      <div style={{
        margin: "20px 16px",
        background: "linear-gradient(135deg, #130A00, #1A0D00)",
        borderRadius: 12,
        padding: "20px",
        border: "1px solid #FF6B00",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 18, letterSpacing: 2, marginBottom: 6 }}>🤝 COLLABORATE WITH US</div>
        <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#AAA", margin: "0 0 12px" }}>
          Societies & Brands — DM for Collabs • Media Partnerships • Brand Promotions
        </p>
        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer"
          style={{ ...styles.socialBtn("#25D366"), display: "inline-flex", textDecoration: "none" }}>
          💬 WhatsApp: +91 94114 61837
        </a>
      </div>
    </>
  );

  const renderAbout = () => (
    <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, letterSpacing: 3, color: "#FF6B00" }}>ABOUT US</h2>
      <p style={{ fontFamily: "sans-serif", color: "#AAA", lineHeight: 1.7, fontSize: 14 }}>
        <strong style={{ color: "#F0EDE8" }}>DUFest.in</strong> is Delhi University's premier hub for fest updates, artist news, event passes, and campus happenings across Delhi NCR. We connect students with the best college experiences.
      </p>
      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {[
          ["📢", "Fest Updates", "First updates on every DU fest"],
          ["🎟️", "Free Passes", "Win passes to top events"],
          ["🎤", "Artist News", "Lineup reveals & artist features"],
          ["🤝", "Brand Partnerships", "Collab with 465+ students"],
          ["📱", "Multi-Platform", "Instagram, YouTube, WhatsApp"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ background: "#0E1118", border: "1px solid #1A1D28", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 15, letterSpacing: 1 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#666", fontFamily: "sans-serif" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, background: "#130A00", borderRadius: 12, padding: 20, border: "1px solid #FF6B00" }}>
        <div style={{ fontSize: 18, letterSpacing: 2, marginBottom: 10 }}>📞 CONTACT</div>
        <p style={{ fontFamily: "sans-serif", color: "#AAA", fontSize: 13 }}>For collabs, queries, and partnerships:</p>
        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer"
          style={{ ...styles.socialBtn("#25D366"), display: "inline-flex", textDecoration: "none", marginTop: 8 }}>
          💬 +91 94114 61837
        </a>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#080A0F}
        ::-webkit-scrollbar-thumb{background:#FF6B00;border-radius:4px}
        select option{background:#12151F;color:#F0EDE8}
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>DUFEST.IN</div>
        <div style={styles.nav}>
          {[["home", "HOME"], ["about", "ABOUT"]].map(([id, label]) => (
            <button key={id} style={styles.navBtn(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
          {isAdmin
            ? <button style={styles.navBtn(false)} onClick={() => setIsAdmin(false)}>LOGOUT</button>
            : <button style={styles.navBtn(false)} onClick={() => setShowAdminLogin(true)}>ADMIN</button>
          }
        </div>
      </div>

      {/* Admin Bar */}
      {isAdmin && (
        <div style={styles.adminBar}>
          <span style={{ fontSize: 12, color: "#FF6B00", fontFamily: "sans-serif", letterSpacing: 1 }}>⚡ ADMIN MODE</span>
          <button style={styles.btn("primary")} onClick={() => setShowNewPostForm(true)}>+ NEW POST</button>
        </div>
      )}

      {activeTab === "home" ? renderHome() : renderAbout()}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={{ fontSize: 20, letterSpacing: 3, color: "#FF6B00" }}>DUFEST.IN</div>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#444", marginTop: 8 }}>
          © 2026 DUFest.in • Delhi University Fests • Delhi NCR Events
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {Object.entries(SOCIAL_LINKS).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer"
              style={{ color: "#555", fontSize: 11, fontFamily: "sans-serif", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
              {k}
            </a>
          ))}
        </div>
      </div>

      {/* WhatsApp Float */}
      <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" style={styles.whatsappFloat} title="WhatsApp Us">💬</a>

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div style={styles.overlay} onClick={() => setShowAdminLogin(false)}>
          <div style={{ ...styles.modal, maxWidth: 360, marginTop: 80 }} onClick={e => e.stopPropagation()}>
            <div style={{ ...styles.modalBody }}>
              <div style={{ fontSize: 22, letterSpacing: 2, marginBottom: 4 }}>🔐 ADMIN LOGIN</div>
              <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#666", marginBottom: 16 }}>
                Enter password to manage posts from any device
              </p>
              <input
                type="password"
                style={styles.input}
                placeholder="Password"
                value={adminPwd}
                onChange={e => setAdminPwd(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              />
              {adminError && <div style={{ color: "#E74C3C", fontSize: 12, fontFamily: "sans-serif", marginBottom: 8 }}>{adminError}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.btn("primary")} onClick={handleAdminLogin}>LOGIN</button>
                <button style={styles.btn()} onClick={() => setShowAdminLogin(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostForm && (
        <div style={styles.overlay} onClick={() => setShowNewPostForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ ...styles.modalBody }}>
              <div style={{ fontSize: 22, letterSpacing: 2, marginBottom: 16 }}>📝 NEW POST</div>
              <input style={styles.input} placeholder="Title *" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
              <select style={styles.input} value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea style={{ ...styles.textarea, minHeight: 100 }} placeholder="Content *" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} />
              <input style={styles.input} placeholder="Image URL (optional)" value={newPost.image} onChange={e => setNewPost({ ...newPost, image: e.target.value })} />
              <label style={{ fontFamily: "sans-serif", fontSize: 12, color: "#AAA", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <input type="checkbox" checked={newPost.pinned} onChange={e => setNewPost({ ...newPost, pinned: e.target.checked })} />
                📌 Pin this post
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.btn("primary")} onClick={handleAddPost}>PUBLISH</button>
                <button style={styles.btn()} onClick={() => setShowNewPostForm(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && !editPost && (
        <div style={styles.overlay} onClick={() => setSelectedPost(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            {selectedPost.image && (
              <img src={selectedPost.image} alt="" style={styles.modalImg} onError={e => e.target.style.display = "none"} />
            )}
            <div style={styles.modalBody}>
              {selectedPost.pinned && <div style={styles.pinnedBadge}>📌 PINNED</div>}
              <div style={{ fontSize: 11, color: "#FF6B00", letterSpacing: 2, fontFamily: "sans-serif" }}>{selectedPost.category}</div>
              <h2 style={{ fontSize: 24, margin: "8px 0 6px", letterSpacing: 1 }}>{selectedPost.title}</h2>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "sans-serif", marginBottom: 14 }}>{selectedPost.date}</div>
              <p style={{ fontFamily: "sans-serif", color: "#CCC", lineHeight: 1.7, fontSize: 14 }}>{selectedPost.content}</p>

              {/* Rating */}
              <div style={{ marginTop: 20, padding: "16px 0", borderTop: "1px solid #1A1D28" }}>
                <div style={{ fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>⭐ RATE THIS POST</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StarRating value={userRating || Math.round(avgRating(selectedPost.ratings))} onRate={handleRate} readonly={userRating > 0} />
                  <span style={{ fontSize: 12, color: "#666", fontFamily: "sans-serif" }}>
                    {avgRating(selectedPost.ratings)} avg ({selectedPost.ratings?.length || 0} ratings)
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div style={{ marginTop: 16, borderTop: "1px solid #1A1D28", paddingTop: 16 }}>
                <div style={{ fontSize: 14, letterSpacing: 1, marginBottom: 12 }}>
                  💬 COMMENTS ({selectedPost.comments?.length || 0})
                </div>
                {selectedPost.comments?.map((c, i) => (
                  <div key={i} style={styles.comment}>
                    <div style={{ fontSize: 12, color: "#FF6B00", fontFamily: "sans-serif", fontWeight: 700 }}>{c.user}</div>
                    <div style={{ fontSize: 13, color: "#CCC", fontFamily: "sans-serif", marginTop: 2 }}>{c.text}</div>
                    <div style={{ fontSize: 10, color: "#444", fontFamily: "sans-serif", marginTop: 4 }}>{c.date}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <input style={styles.input} placeholder="Your name" value={commentUser} onChange={e => setCommentUser(e.target.value)} />
                  <textarea style={{ ...styles.textarea, minHeight: 70 }} placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <button style={styles.btn("primary")} onClick={handleComment}>POST COMMENT</button>
                </div>
              </div>

              {/* Admin Actions */}
              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button style={styles.btn()} onClick={() => setSelectedPost(null)}>✕ CLOSE</button>
                {isAdmin && <>
                  <button style={styles.btn()} onClick={() => setEditPost({ ...selectedPost })}>✏️ EDIT</button>
                  <button style={styles.btn("danger")} onClick={() => handleDeletePost(selectedPost.id)}>🗑️ DELETE</button>
                </>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <div style={styles.overlay} onClick={() => setEditPost(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalBody}>
              <div style={{ fontSize: 22, letterSpacing: 2, marginBottom: 16 }}>✏️ EDIT POST</div>
              <input style={styles.input} placeholder="Title" value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value })} />
              <select style={styles.input} value={editPost.category} onChange={e => setEditPost({ ...editPost, category: e.target.value })}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea style={{ ...styles.textarea, minHeight: 100 }} value={editPost.content} onChange={e => setEditPost({ ...editPost, content: e.target.value })} />
              <input style={styles.input} placeholder="Image URL" value={editPost.image} onChange={e => setEditPost({ ...editPost, image: e.target.value })} />
              <label style={{ fontFamily: "sans-serif", fontSize: 12, color: "#AAA", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <input type="checkbox" checked={editPost.pinned} onChange={e => setEditPost({ ...editPost, pinned: e.target.checked })} />
                📌 Pinned
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.btn("primary")} onClick={handleSaveEdit}>SAVE</button>
                <button style={styles.btn()} onClick={() => setEditPost(null)}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
