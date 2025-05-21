import SubscriptionSection from "../sections/subscription-section";

const SubscriptionsView = () => {
  return (
    <div className="max-w-[1400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <header className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-semibold">All Subscriptions</h1>
        <p className="text-muted-foreground text-xs">
          View and manage all of your subscriptions
        </p>
      </header>
      <SubscriptionSection />
    </div>
  );
};

export default SubscriptionsView;
