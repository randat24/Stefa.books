import { SubscriptionManager } from '@/components/payment/SubscriptionManager';

export default function SubscriptionsPage() {
  return (
    <div className="container-default py-8">
      <h1 className="h1 mb-6">Мої підписки</h1>
      <SubscriptionManager />
    </div>
  );
}