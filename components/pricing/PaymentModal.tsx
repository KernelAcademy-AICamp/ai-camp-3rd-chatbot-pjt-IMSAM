"use client";

import { useState } from "react";
import { Loader2, CreditCard, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  planName,
  price,
  onConfirm,
  isLoading,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handlePayment = async () => {
    if (cardNumber.length < 10 || expiry.length < 4 || cvc.length < 3) {
      alert("카드 정보를 올바르게 입력해주세요.");
      return;
    }

    await onConfirm();

    // 🔥 결제 성공 → 모달 닫기
    onClose();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">결제하기</DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-bold text-foreground">{planName}</span> 플랜으로 업그레이드합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border">
            <span className="text-sm font-medium">결제 금액</span>
            <span className="text-lg font-bold text-primary">{price}</span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="card-number">카드 번호</Label>
            <div className="relative">
              <Input
                id="card-number"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="pl-10 font-mono"
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expiry">유효기간 (MM/YY)</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").substring(0, 3))
                  }
                  maxLength={3}
                  type="password"
                  className="pl-8 font-mono"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0">
          <Button
            className="w-full h-11 text-base"
            onClick={handlePayment}
            disabled={isLoading || cardNumber.length < 1}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                결제 처리 중...
              </>
            ) : (
              "결제하기"
            )}
          </Button>

          <div className="text-[10px] text-center text-muted-foreground mt-2">
            * 이것은 테스트 결제입니다. 실제 비용이 청구되지 않습니다.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
