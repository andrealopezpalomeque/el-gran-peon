import { db } from '../config/firebase.js';
import { cache } from '../utils/cache.js';

export async function getAnalytics(req, res) {
  const cacheKey = 'dashboard:analytics';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Fetch all data in parallel
    const [ordersSnap, productsSnap, purchasesSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('products').get(),
      db.collection('purchases').get(),
    ]);

    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const purchases = purchasesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper to convert Firestore timestamps
    function toMs(date) {
      if (!date) return 0;
      if (date._seconds) return date._seconds * 1000;
      if (date.seconds) return date.seconds * 1000;
      return new Date(date).getTime();
    }

    // --- Current Month KPIs ---
    // Consider orders that are NOT cancelado for sales metrics
    const completedStatuses = ['confirmado', 'pagado', 'enviado', 'entregado'];
    const thisMonthOrders = orders.filter(o => {
      if (!completedStatuses.includes(o.status)) return false;
      return toMs(o.createdAt) >= thisMonthStart.getTime();
    });

    const salesCount = thisMonthOrders.length;
    const revenue = thisMonthOrders.reduce((sum, o) => sum + (o.adjustedAmount || o.totalAmount || 0), 0);
    const profit = thisMonthOrders.reduce((sum, o) => sum + (o.totalProfit || 0), 0);
    const averageTicket = salesCount > 0 ? revenue / salesCount : 0;
    const averageMargin = revenue > 0 && profit > 0 ? (profit / revenue) * 100 : 0;

    // --- Monthly Sales (last 12 months) ---
    const monthlySales = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();

      const monthOrders = orders.filter(o => {
        if (!completedStatuses.includes(o.status)) return false;
        const ts = toMs(o.createdAt);
        return ts >= monthStart && ts < monthEnd;
      });

      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      monthlySales.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        monthShort: monthNames[d.getMonth()],
        count: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + (o.adjustedAmount || o.totalAmount || 0), 0),
        profit: monthOrders.reduce((sum, o) => sum + (o.totalProfit || 0), 0),
      });
    }

    // --- Top Products by Revenue ---
    const productSalesMap = {};
    for (const order of orders) {
      if (!completedStatuses.includes(order.status)) continue;
      for (const item of (order.items || [])) {
        const key = item.productId || item.name;
        if (!productSalesMap[key]) {
          productSalesMap[key] = { name: item.name || item.productName || 'Producto', units: 0, revenue: 0, profit: 0 };
        }
        productSalesMap[key].units += item.quantity || 0;
        productSalesMap[key].revenue += (item.quantity || 0) * (item.price || 0);
        productSalesMap[key].profit += item.profitTotal || 0;
      }
    }

    const productSalesList = Object.values(productSalesMap).map(p => ({
      ...p,
      margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
    }));

    const topProductsByRevenue = [...productSalesList].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const topProductsByProfit = [...productSalesList].sort((a, b) => b.profit - a.profit).slice(0, 10);
    const leastProfitable = [...productSalesList].filter(p => p.units > 0).sort((a, b) => a.margin - b.margin).slice(0, 5);

    // --- Inventory Value ---
    const inventoryValue = products.reduce((sum, p) => {
      if (p.stock > 0 && p.cost > 0) {
        return sum + (p.stock * p.cost);
      }
      return sum;
    }, 0);

    // --- Low Stock Alerts ---
    const lowStockAlerts = products.filter(p =>
      p.stock !== -1 && p.stockMinimo > 0 && p.stock > 0 && p.stock <= p.stockMinimo
    ).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || '',
      stock: p.stock,
      stockMinimo: p.stockMinimo,
    }));

    // --- Purchases This Month ---
    const purchasesThisMonth = purchases.filter(p => {
      const ts = p.date ? new Date(p.date).getTime() : toMs(p.createdAt);
      return ts >= thisMonthStart.getTime();
    });

    const result = {
      currentMonth: {
        salesCount,
        revenue,
        profit,
        averageMargin,
        averageTicket,
      },
      monthlySales,
      topProductsByRevenue,
      topProductsByProfit,
      leastProfitable,
      allProductSales: productSalesList,
      inventoryValue,
      lowStockAlerts,
      purchasesThisMonth: {
        count: purchasesThisMonth.length,
        totalSpent: purchasesThisMonth.reduce((sum, p) => sum + (p.totalPaid || 0), 0),
      },
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error getting analytics:', error);
    const stale = cache.getStale(cacheKey);
    if (stale) return res.json(stale);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
