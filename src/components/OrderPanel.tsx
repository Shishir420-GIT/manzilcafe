import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { supabase, menuItems } from '../lib/supabase';
import { Order, MenuItem } from '../types';
import { motion } from 'framer-motion';
import { checkRateLimit } from '../lib/rateLimiter';

interface OrderPanelProps {
  cafeId: string;
  userId: string;
}

const OrderPanel = ({ cafeId, userId }: OrderPanelProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    subscribeToOrders();
  }, [cafeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(name)
        `)
        .eq('cafe_id', cafeId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const subscribeToOrders = () => {
    const channel = supabase
      .channel(`orders:${cafeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`,
        },
        async (payload) => {
          const newOrder = payload.new as Order;
          
          // Fetch user info
          const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', newOrder.user_id)
            .single();

          setOrders(prev => [{ ...newOrder, user: user as any }, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const placeOrder = async (item: MenuItem) => {
    // Check rate limit for orders
    const rateLimitCheck = checkRateLimit(userId, 'order');
    if (!rateLimitCheck.allowed) {
      alert(rateLimitCheck.error);
      return;
    }

    setLoading(item.id);

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          cafe_id: cafeId,
          user_id: userId,
          item_name: item.name,
          quantity: 1,
          price: item.price,
          status: 'pending',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-800">Menu & Orders</h3>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Menu</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 text-sm">{item.name}</h5>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-amber-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => placeOrder(item)}
                      disabled={loading === item.id}
                      className="flex items-center space-x-1 px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {loading === item.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Orders</h4>
        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No orders yet. Be the first to order something!
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">
                      {order.item_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {order.user?.name || 'Someone'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(order.timestamp)}
                    </span>
                    <span className="text-xs font-medium text-amber-600">
                      ${order.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {order.status === 'completed' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;