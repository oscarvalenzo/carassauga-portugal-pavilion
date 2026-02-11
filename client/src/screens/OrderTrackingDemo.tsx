import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import Timeline from '../components/Timeline';

export default function OrderTrackingDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-5">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            Your Order
          </h1>
          <p className="text-gray-600">Arriving today by 3:00 PM</p>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          <Timeline
            items={[
              {
                icon: <CheckCircle size={20} strokeWidth={2.5} />,
                title: 'Order confirmed',
                description: 'We received your order and are preparing it for shipment.',
                status: 'completed',
              },
              {
                icon: <Package size={20} strokeWidth={2.5} />,
                title: 'Packed and ready',
                description: 'Your order has been packed and is ready for pickup.',
                status: 'completed',
              },
              {
                icon: <Truck size={20} strokeWidth={2.5} />,
                title: 'Out for delivery',
                description: 'Your package is on its way. Track the driver in real-time.',
                status: 'active',
              },
              {
                icon: <MapPin size={20} strokeWidth={2.5} />,
                title: 'Delivered',
                description: 'Your package will be delivered to your doorstep.',
                status: 'upcoming',
              },
            ]}
          />

          {/* Action Button */}
          <button className="w-full mt-8 bg-gray-900 text-white px-6 py-4 rounded-full font-semibold text-base hover:bg-gray-800 active:scale-98 transition-all">
            Track delivery on map
          </button>
        </div>

        {/* Delivery Details */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-sm text-gray-500 mb-3">DELIVERY DETAILS</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order number</span>
              <span className="font-semibold text-gray-900">#PT-2025-0207</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated arrival</span>
              <span className="font-semibold text-gray-900">3:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Carrier</span>
              <span className="font-semibold text-gray-900">Express Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

