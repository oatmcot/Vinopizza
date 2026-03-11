import { useState, useEffect, useRef } from "react";

// ====== MOCK DATA ======
const MENU_DATA = {
  food: [
    { id: "f001", name: { th: "ข้าวกะเพราไก่", en: "Basil Chicken Rice" }, price: 60, emoji: "🍚", status: "available", category: "food" },
    { id: "f002", name: { th: "ต้มยำกุ้ง", en: "Tom Yum Shrimp" }, price: 120, emoji: "🍲", status: "available", category: "food" },
    { id: "f003", name: { th: "ผัดไทยกุ้งสด", en: "Pad Thai Fresh Shrimp" }, price: 90, emoji: "🍜", status: "available", category: "food" },
    { id: "f004", name: { th: "แกงเขียวหวานไก่", en: "Green Curry Chicken" }, price: 80, emoji: "🥘", status: "available", category: "food" },
    { id: "f005", name: { th: "ยำวุ้นเส้น", en: "Glass Noodle Salad" }, price: 70, emoji: "🥗", status: "available", category: "food" },
    { id: "f006", name: { th: "ข้าวมันไก่", en: "Hainanese Chicken Rice" }, price: 55, emoji: "🍗", status: "unavailable", category: "food" },
    { id: "f007", name: { th: "ส้มตำไทย", en: "Thai Papaya Salad" }, price: 50, emoji: "🥙", status: "available", category: "food" },
    { id: "f008", name: { th: "ไก่ทอดกระเทียม", en: "Garlic Fried Chicken" }, price: 85, emoji: "🍳", status: "available", category: "food" },
  ],
  drink: [
    { id: "d001", name: { th: "ชาไทยเย็น", en: "Thai Iced Tea" }, price: 35, emoji: "🧋", status: "available", category: "drink" },
    { id: "d002", name: { th: "น้ำมะพร้าว", en: "Coconut Water" }, price: 40, emoji: "🥥", status: "available", category: "drink" },
    { id: "d003", name: { th: "น้ำส้มคั้น", en: "Fresh Orange Juice" }, price: 45, emoji: "🍊", status: "available", category: "drink" },
    { id: "d004", name: { th: "กาแฟเย็น", en: "Iced Coffee" }, price: 50, emoji: "☕", status: "available", category: "drink" },
    { id: "d005", name: { th: "โกโก้ร้อน", en: "Hot Cocoa" }, price: 45, emoji: "🍫", status: "unavailable", category: "drink" },
    { id: "d006", name: { th: "น้ำเสาวรส", en: "Passion Fruit Juice" }, price: 40, emoji: "🍹", status: "available", category: "drink" },
  ]
};

const STATUS_LABELS = {
  pending:  { th: "รอดำเนินการ", en: "Pending",  color: "#f59e0b" },
  cooking:  { th: "กำลังปรุง",   en: "Cooking",  color: "#3b82f6" },
  served:   { th: "เสิร์ฟแล้ว",  en: "Served",   color: "#10b981" },
  paid:     { th: "ชำระแล้ว",   en: "Paid",     color: "#6b7280" },
};

let orderIdCounter = 1;

// ====== MAIN APP ======
export default function RestaurantApp() {
  const [view, setView]     = useState("customer"); // customer | kitchen | cashier | admin
  const [lang, setLang]     = useState("th");
  const [orders, setOrders] = useState([]);
  const [cart, setCart]     = useState([]);
  const [tableNo, setTableNo] = useState("1");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [menuData, setMenuData] = useState(MENU_DATA);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("food");
  const notifRef = useRef(null);

  const t = (obj) => (typeof obj === "object" ? obj[lang] : obj);

  const showNotif = (msg, color = "#10b981") => {
    setNotification({ msg, color });
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (item) => {
    if (item.status === "unavailable") return;
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
                : [...prev, { ...item, qty: 1 }];
    });
    showNotif(lang === "th" ? `เพิ่ม ${t(item.name)} แล้ว` : `Added ${t(item.name)}`);
  };

  const removeFromCart = (id) => setCart(prev => {
    const ex = prev.find(c => c.id === id);
    if (!ex) return prev;
    return ex.qty === 1 ? prev.filter(c => c.id !== id) : prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
  });

  const placeOrder = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `ORD-${String(orderIdCounter++).padStart(3, "0")}`,
      table: tableNo,
      items: [...cart],
      status: "pending",
      time: new Date(),
      total: cart.reduce((s, c) => s + c.price * c.qty, 0),
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    showNotif(lang === "th" ? "✅ สั่งอาหารเรียบร้อย!" : "✅ Order placed!", "#3b82f6");
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const toggleItemStatus = (category, itemId) => {
    setMenuData(prev => ({
      ...prev,
      [category]: prev[category].map(i =>
        i.id === itemId ? { ...i, status: i.status === "available" ? "unavailable" : "available" } : i
      )
    }));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "cooking");
  const allItems = [...menuData.food, ...menuData.drink];

  return (
    <div style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", minHeight: "100vh", background: "#0f0e0b", color: "#f5f0e8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: notification.color, color: "#fff", padding: "12px 20px",
          borderRadius: 12, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease", fontSize: 15
        }}>{notification.msg}</div>
      )}

      {/* TOP NAV */}
      <nav style={{
        background: "#1a1814", borderBottom: "1px solid #2d2a24",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🍜</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e8c97a", fontWeight: 700 }}>
            Siam Kitchen
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View Tabs */}
          {[
            { key: "customer", label: { th: "สั่งอาหาร", en: "Order" }, icon: "🛒" },
            { key: "kitchen",  label: { th: "ครัว",     en: "Kitchen"}, icon: "👨‍🍳" },
            { key: "cashier",  label: { th: "แคชเชียร์",en: "Cashier"}, icon: "💳" },
            { key: "admin",    label: { th: "แอดมิน",   en: "Admin"  }, icon: "⚙️" },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{
              background: view === v.key ? "#e8c97a" : "transparent",
              color: view === v.key ? "#0f0e0b" : "#a09880",
              border: "1px solid " + (view === v.key ? "#e8c97a" : "#2d2a24"),
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 5
            }}>
              <span>{v.icon}</span>
              <span style={{ display: window.innerWidth < 600 ? "none" : "inline" }}>{t(v.label)}</span>
              {v.key === "kitchen" && pendingOrders.length > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}

          {/* Lang Toggle */}
          <button onClick={() => setLang(l => l === "th" ? "en" : "th")} style={{
            background: "#2d2a24", border: "none", borderRadius: 8,
            padding: "6px 12px", cursor: "pointer", color: "#e8c97a", fontWeight: 700, fontSize: 13
          }}>
            {lang === "th" ? "EN" : "TH"}
          </button>
        </div>
      </nav>

      {/* VIEWS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* ===== CUSTOMER VIEW ===== */}
        {view === "customer" && (
          <div>
            {/* Table selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ color: "#a09880", fontSize: 15 }}>
                {lang === "th" ? "โต๊ะที่:" : "Table:"}
              </span>
              {["1","2","3","4","5","6"].map(t => (
                <button key={t} onClick={() => setTableNo(t)} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: tableNo === t ? "#e8c97a" : "#1a1814",
                  border: "1px solid " + (tableNo === t ? "#e8c97a" : "#2d2a24"),
                  color: tableNo === t ? "#0f0e0b" : "#a09880",
                  fontWeight: 700, cursor: "pointer", fontSize: 14
                }}>{t}</button>
              ))}
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { key: "food",  label: { th: "อาหาร", en: "Food" } },
                { key: "drink", label: { th: "เครื่องดื่ม", en: "Drinks" } },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: "8px 24px", borderRadius: 24,
                  background: activeTab === tab.key ? "#e8c97a" : "#1a1814",
                  color: activeTab === tab.key ? "#0f0e0b" : "#a09880",
                  border: "1px solid " + (activeTab === tab.key ? "#e8c97a" : "#2d2a24"),
                  fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all 0.2s"
                }}>{t(tab.label)}</button>
              ))}
            </div>

            {/* Menu Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
              {menuData[activeTab].map(item => (
                <div key={item.id} onClick={() => addToCart(item)} style={{
                  background: "#1a1814", borderRadius: 16, padding: 16, cursor: item.status === "available" ? "pointer" : "not-allowed",
                  border: "1px solid #2d2a24", opacity: item.status === "available" ? 1 : 0.45,
                  transition: "all 0.2s", position: "relative",
                  transform: "translateY(0)",
                }}>
                  <div style={{ fontSize: 48, textAlign: "center", marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#f5f0e8" }}>{t(item.name)}</div>
                  <div style={{ color: "#e8c97a", fontWeight: 700, fontSize: 16 }}>{item.price} ฿</div>
                  {item.status === "unavailable" && (
                    <div style={{
                      position: "absolute", top: 10, right: 10, background: "#ef4444",
                      color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600
                    }}>{lang === "th" ? "หมด" : "Sold Out"}</div>
                  )}
                  {cart.find(c => c.id === item.id) && (
                    <div style={{
                      position: "absolute", top: 10, right: 10, background: "#e8c97a",
                      color: "#0f0e0b", fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 700
                    }}>×{cart.find(c => c.id === item.id).qty}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div style={{ background: "#1a1814", border: "1px solid #2d2a24", borderRadius: 20, padding: 20 }}>
                <h3 style={{ marginBottom: 16, color: "#e8c97a", display: "flex", alignItems: "center", gap: 8 }}>
                  🛒 {lang === "th" ? "รายการสั่ง" : "Your Order"}
                  <span style={{ background: "#e8c97a", color: "#0f0e0b", borderRadius: "50%", width: 22, height: 22, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cartCount}</span>
                </h3>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #2d2a24" }}>
                    <span style={{ fontSize: 14 }}>{item.emoji} {t(item.name)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "#a09880", fontSize: 13 }}>{item.price} ฿</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} style={{
                          width: 28, height: 28, borderRadius: "50%", background: "#2d2a24",
                          border: "none", color: "#f5f0e8", cursor: "pointer", fontSize: 16
                        }}>−</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{
                          width: 28, height: 28, borderRadius: "50%", background: "#2d2a24",
                          border: "none", color: "#f5f0e8", cursor: "pointer", fontSize: 16
                        }}>+</button>
                      </div>
                      <span style={{ fontWeight: 700, color: "#e8c97a", minWidth: 55, textAlign: "right" }}>{item.price * item.qty} ฿</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <span style={{ color: "#a09880" }}>{lang === "th" ? "รวมทั้งหมด" : "Total"}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#e8c97a" }}>{cartTotal} ฿</span>
                </div>
                <button onClick={placeOrder} style={{
                  width: "100%", marginTop: 16, padding: "14px", borderRadius: 12,
                  background: "linear-gradient(135deg, #e8c97a, #d4a843)", border: "none",
                  color: "#0f0e0b", fontWeight: 700, fontSize: 16, cursor: "pointer",
                  fontFamily: "inherit"
                }}>
                  {lang === "th" ? `✅ ยืนยันสั่งโต๊ะ ${tableNo}` : `✅ Confirm Order — Table ${tableNo}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== KITCHEN VIEW ===== */}
        {view === "kitchen" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 24, color: "#e8c97a" }}>
              👨‍🍳 {lang === "th" ? "หน้าจอครัว" : "Kitchen Display"}
            </h2>
            {orders.filter(o => o.status !== "paid").length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#4a4640" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
                <div style={{ fontSize: 18 }}>{lang === "th" ? "ยังไม่มีออเดอร์" : "No orders yet"}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {orders.filter(o => o.status !== "paid").map(order => (
                  <OrderCard key={order.id} order={order} lang={lang} t={t} updateStatus={updateOrderStatus} view="kitchen" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CASHIER VIEW ===== */}
        {view === "cashier" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 24, color: "#e8c97a" }}>
              💳 {lang === "th" ? "แคชเชียร์" : "Cashier"}
            </h2>
            {orders.filter(o => o.status === "served").length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#4a4640" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🧾</div>
                <div style={{ fontSize: 18 }}>{lang === "th" ? "ยังไม่มีรายการรอชำระ" : "No orders ready for payment"}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {orders.filter(o => o.status === "served").map(order => (
                  <div key={order.id} style={{ background: "#1a1814", border: "1px solid #2d2a24", borderRadius: 16, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#e8c97a", fontSize: 18 }}>{order.id}</span>
                      <span style={{ background: "#10b98133", color: "#10b981", padding: "2px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                        {lang === "th" ? "เสิร์ฟแล้ว" : "Served"}
                      </span>
                    </div>
                    <div style={{ color: "#a09880", marginBottom: 12, fontSize: 14 }}>
                      {lang === "th" ? "โต๊ะ" : "Table"} {order.table} · {order.time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                        <span>{item.emoji} {t(item.name)} ×{item.qty}</span>
                        <span style={{ color: "#e8c97a" }}>{item.price * item.qty} ฿</span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid #2d2a24", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700 }}>{lang === "th" ? "ยอดรวม" : "Total"}</span>
                      <span style={{ fontWeight: 700, fontSize: 20, color: "#e8c97a" }}>{order.total} ฿</span>
                    </div>
                    <button onClick={() => updateOrderStatus(order.id, "paid")} style={{
                      width: "100%", marginTop: 12, padding: "12px", borderRadius: 10,
                      background: "linear-gradient(135deg, #10b981, #059669)", border: "none",
                      color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit"
                    }}>
                      💰 {lang === "th" ? "รับชำระเงิน" : "Accept Payment"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Paid summary */}
            {orders.filter(o => o.status === "paid").length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ color: "#6b7280", marginBottom: 16, fontSize: 16 }}>
                  ✅ {lang === "th" ? "ชำระแล้ว" : "Paid"} ({orders.filter(o => o.status === "paid").length})
                  <span style={{ marginLeft: 16, color: "#e8c97a" }}>
                    {lang === "th" ? "รวม" : "Total"}: {orders.filter(o => o.status === "paid").reduce((s, o) => s + o.total, 0)} ฿
                  </span>
                </h3>
              </div>
            )}
          </div>
        )}

        {/* ===== ADMIN VIEW ===== */}
        {view === "admin" && (
          <div>
            {!adminAuth ? (
              <div style={{ maxWidth: 360, margin: "60px auto", background: "#1a1814", border: "1px solid #2d2a24", borderRadius: 20, padding: 32 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 24, color: "#e8c97a", textAlign: "center" }}>
                  ⚙️ Admin Login
                </h2>
                <input
                  type="password"
                  placeholder={lang === "th" ? "รหัสผ่าน (ทดลอง: 1234)" : "Password (demo: 1234)"}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && adminPass === "1234" && setAdminAuth(true)}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    background: "#0f0e0b", border: "1px solid #2d2a24",
                    color: "#f5f0e8", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12
                  }}
                />
                <button onClick={() => adminPass === "1234" ? setAdminAuth(true) : showNotif(lang === "th" ? "รหัสผ่านผิด!" : "Wrong password!", "#ef4444")} style={{
                  width: "100%", padding: "12px", borderRadius: 10,
                  background: "#e8c97a", border: "none", color: "#0f0e0b",
                  fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit"
                }}>
                  {lang === "th" ? "เข้าสู่ระบบ" : "Login"}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#e8c97a" }}>
                    ⚙️ {lang === "th" ? "จัดการเมนู" : "Menu Management"}
                  </h2>
                  <button onClick={() => setAdminAuth(false)} style={{
                    background: "transparent", border: "1px solid #ef4444", color: "#ef4444",
                    padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit"
                  }}>
                    {lang === "th" ? "ออกจากระบบ" : "Logout"}
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: { th: "รายการอาหาร", en: "Food Items" }, value: menuData.food.length, icon: "🍽️" },
                    { label: { th: "เครื่องดื่ม", en: "Drinks" },     value: menuData.drink.length, icon: "🥤" },
                    { label: { th: "ออเดอร์วันนี้", en: "Orders" },   value: orders.length,         icon: "📋" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#1a1814", border: "1px solid #2d2a24", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: "#e8c97a" }}>{s.value}</div>
                      <div style={{ color: "#a09880", fontSize: 13 }}>{t(s.label)}</div>
                    </div>
                  ))}
                </div>

                {/* Menu toggle */}
                {["food", "drink"].map(cat => (
                  <div key={cat} style={{ marginBottom: 32 }}>
                    <h3 style={{ color: "#a09880", marginBottom: 16, fontSize: 16, textTransform: "uppercase", letterSpacing: 2 }}>
                      {cat === "food" ? "🍽️ " + (lang === "th" ? "อาหาร" : "Food") : "🥤 " + (lang === "th" ? "เครื่องดื่ม" : "Drinks")}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                      {menuData[cat].map(item => (
                        <div key={item.id} style={{ background: "#1a1814", border: "1px solid " + (item.status === "available" ? "#10b98144" : "#ef444444"), borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{item.emoji} {t(item.name)}</div>
                            <div style={{ color: "#e8c97a", fontSize: 14 }}>{item.price} ฿</div>
                          </div>
                          <button onClick={() => toggleItemStatus(cat, item.id)} style={{
                            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                            background: item.status === "available" ? "#10b981" : "#ef4444",
                            color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: "inherit"
                          }}>
                            {item.status === "available" ? (lang === "th" ? "เปิด" : "ON") : (lang === "th" ? "ปิด" : "OFF")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        button:hover { opacity: 0.88; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ===== ORDER CARD COMPONENT =====
function OrderCard({ order, lang, t, updateStatus, view }) {
  const statusColor = STATUS_LABELS[order.status]?.color || "#6b7280";
  return (
    <div style={{ background: "#1a1814", border: `1px solid ${statusColor}44`, borderRadius: 16, padding: 20, borderLeft: `4px solid ${statusColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: "#e8c97a", fontSize: 17 }}>{order.id}</span>
        <span style={{ background: statusColor + "22", color: statusColor, padding: "2px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {STATUS_LABELS[order.status]?.[lang] || order.status}
        </span>
      </div>
      <div style={{ color: "#a09880", fontSize: 13, marginBottom: 12 }}>
        {lang === "th" ? "โต๊ะ" : "Table"} {order.table} · {order.time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
      </div>
      {order.items.map(item => (
        <div key={item.id} style={{ fontSize: 14, marginBottom: 5, color: "#d4cfc4" }}>
          {item.emoji} {t(item.name)} <span style={{ color: "#e8c97a" }}>×{item.qty}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {order.status === "pending" && (
          <button onClick={() => updateStatus(order.id, "cooking")} style={{
            flex: 1, padding: "9px", borderRadius: 8, background: "#3b82f6", border: "none",
            color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>
            🔥 {lang === "th" ? "เริ่มปรุง" : "Start Cooking"}
          </button>
        )}
        {order.status === "cooking" && (
          <button onClick={() => updateStatus(order.id, "served")} style={{
            flex: 1, padding: "9px", borderRadius: 8, background: "#10b981", border: "none",
            color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>
            ✅ {lang === "th" ? "เสิร์ฟแล้ว" : "Served"}
          </button>
        )}
      </div>
    </div>
  );
}
