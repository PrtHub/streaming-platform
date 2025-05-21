import SubscriptionCreatorsSection from "../sections/subscription-creators-section";
import SubscriptionVideosSection from "../sections/subscription-videos-section";

const SubscriptionsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <header className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground text-xs">
          Videos from channels you follow
        </p>
      </header>
      <SubscriptionCreatorsSection />
      <SubscriptionVideosSection />
    </div>
  );
};

export default SubscriptionsView;
