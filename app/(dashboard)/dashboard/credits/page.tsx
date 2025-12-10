'use client';

import { CreditBalanceCard } from '@/components/credits/CreditBalanceCard';
import { DailyRewardCard } from '@/components/credits/DailyRewardCard';
import { ReferralCard } from '@/components/credits/ReferralCard';
import { TransactionList } from '@/components/credits/TransactionList';

export default function CreditsPage() {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          크레딧 센터
        </h1>
        <p className="text-sm text-muted-foreground">
          일일 보상, 추천 보상, 사용/적립 내역
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CreditBalanceCard />
        <DailyRewardCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferralCard />
        <TransactionList />
      </div>
    </div>
  );
}

