import React, { useState } from 'react';
import {
  X,
  Check,
  Crown,
  CreditCard,
  Lock,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Download,
  AlertCircle,
  Tag
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { storageService } from '../services/storageService';
import { soundManager } from '../utils/audio';

interface PricingModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: UserProfile) => void;
}

type CheckoutStep = 'PLAN_AND_PAY' | 'OTP_VERIFICATION' | 'SUCCESS_RECEIPT';
type PaymentMethodType = 'card' | 'mobile_wallet' | 'gpay_apple' | 'paypal';

export const PricingModal: React.FC<PricingModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<CheckoutStep>('PLAN_AND_PAY');
  const [tier, setTier] = useState<'monthly' | 'yearly'>('yearly');
  const [method, setMethod] = useState<PaymentMethodType>('card');

  // Card Form
  const [cardNumber, setCardNumber] = useState('4242 8892 1104 4242');
  const [cardHolder, setCardHolder] = useState('Alex Rider');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [postalCode, setPostalCode] = useState('75500');
  const [saveCard, setSaveCard] = useState(true);

  // Mobile Wallet Form (JazzCash / EasyPaisa / Raast)
  const [walletProvider, setWalletProvider] = useState<'jazzcash' | 'easypaisa' | 'nayapay'>('jazzcash');
  const [walletNumber, setWalletNumber] = useState('0300 1234567');
  const [walletCnic, setWalletCnic] = useState('42101-1234567-1');

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // 3D Secure OTP State
  const [otpCode, setOtpCode] = useState(['1', '2', '3', '4', '5', '6']);
  const [otpError, setOtpError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Completed Receipt Details
  const [receiptDetails, setReceiptDetails] = useState<{
    txnId: string;
    amount: number;
    methodLabel: string;
    date: string;
    tier: string;
  } | null>(null);

  if (!isOpen) return null;

  // Price calculations
  const basePrice = tier === 'yearly' ? 79.99 : 9.99;
  const discountAmount = Number(((basePrice * discountPercent) / 100).toFixed(2));
  const finalPrice = Number((basePrice - discountAmount).toFixed(2));

  // Format Card Number input with automatic spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Credit / Debit';
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'GAMEZONE20' || code === 'PRO20') {
      setDiscountPercent(20);
      setPromoMessage('20% Discount Applied Successfully!');
      soundManager.playCoin();
    } else if (code === 'PRO10') {
      setDiscountPercent(10);
      setPromoMessage('10% Discount Applied!');
      soundManager.playCoin();
    } else {
      setPromoMessage('Invalid coupon code. Try: GAMEZONE20');
      setDiscountPercent(0);
    }
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    soundManager.playClick();

    setTimeout(() => {
      setIsProcessing(false);
      setStep('OTP_VERIFICATION');
      soundManager.playScore();
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsProcessing(true);
    setOtpError('');

    setTimeout(() => {
      let methodLabel = '';
      if (method === 'card') {
        methodLabel = `${getCardBrand()} (•••• ${cardNumber.slice(-4)})`;
      } else if (method === 'mobile_wallet') {
        const walletName = walletProvider === 'jazzcash' ? 'JazzCash' : walletProvider === 'easypaisa' ? 'EasyPaisa' : 'NayaPay';
        methodLabel = `${walletName} (${walletNumber})`;
      } else if (method === 'gpay_apple') {
        methodLabel = 'Google Pay / Apple Pay';
      } else {
        methodLabel = 'PayPal Direct';
      }

      const { user: updatedUser, payment } = storageService.subscribeUser(tier, methodLabel);
      setIsProcessing(false);

      setReceiptDetails({
        txnId: payment.id,
        amount: finalPrice,
        methodLabel,
        date: new Date().toLocaleString(),
        tier: tier === 'yearly' ? 'Annual Championship Pass' : 'Monthly Pro Subscription'
      });

      setStep('SUCCESS_RECEIPT');
      soundManager.playVictory();
      onSuccess(updatedUser);
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= STEP 1: PLAN & PAYMENT DETAILS ================= */}
        {step === 'PLAN_AND_PAY' && (
          <div>
            {/* Header */}
            <div className="text-center max-w-md mx-auto mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>OFFICIAL GAMEZONE PRO PAYMENT GATEWAY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Complete Your Subscription
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your billing plan and secure payment method for instant activation.
              </p>
            </div>

            {/* Plan Selector Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTier('monthly')}
                className={`p-3.5 rounded-xl text-left transition-all relative ${
                  tier === 'monthly'
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-xs font-semibold">Monthly Plan</span>
                <span className="font-display font-black text-xl text-white">
                  $9.99<span className="text-xs font-normal text-slate-400"> / month</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Flexible, cancel anytime</span>
              </button>

              <button
                type="button"
                onClick={() => setTier('yearly')}
                className={`relative p-3.5 rounded-xl text-left transition-all ${
                  tier === 'yearly'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-white shadow-md border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase">
                  Save 33%
                </span>
                <span className="block text-xs font-semibold text-amber-400">Annual Pass</span>
                <span className="font-display font-black text-xl text-white">
                  $79.99<span className="text-xs font-normal text-slate-400"> / year</span>
                </span>
                <span className="text-[11px] text-amber-300/80 block mt-0.5">Best value ($6.60 / mo)</span>
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === 'card'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/70 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('mobile_wallet')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === 'mobile_wallet'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/70 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('gpay_apple')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === 'gpay_apple'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/70 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Google / Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('paypal')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === 'paypal'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/70 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>PayPal Vault</span>
                </button>
              </div>
            </div>

            {/* Payment Form Fields */}
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* Method 1: Credit / Debit Card Form */}
              {method === 'card' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span className="font-medium">Card Information</span>
                    <span className="font-mono text-cyan-400 font-bold">{getCardBrand()}</span>
                  </div>

                  <div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500 tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on Card"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Expires</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CVC/CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="842"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Save card securely with 256-bit tokenization</span>
                    </label>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>PCI-DSS Level 1</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 2: Mobile Wallet (JazzCash / EasyPaisa / NayaPay) */}
              {method === 'mobile_wallet' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setWalletProvider('jazzcash')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        walletProvider === 'jazzcash'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      JazzCash
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletProvider('easypaisa')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        walletProvider === 'easypaisa'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      EasyPaisa
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletProvider('nayapay')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        walletProvider === 'nayapay'
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      NayaPay
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Mobile Account Number</label>
                    <input
                      type="text"
                      required
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">CNIC / Identity Number (Last 6 Digits)</label>
                    <input
                      type="text"
                      value={walletCnic}
                      onChange={(e) => setWalletCnic(e.target.value)}
                      placeholder="42101-1234567-1"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    You will receive a mobile payment prompt / OTP directly on your phone.
                  </span>
                </div>
              )}

              {/* Method 3: Google Pay / Apple Pay */}
              {method === 'gpay_apple' && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Instant One-Tap Checkout</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Biometric fingerprint or Face ID authentication through Google Pay / Apple Pay wallet.
                  </p>
                  <div className="inline-block px-3 py-1 bg-slate-900 rounded-lg text-xs font-mono text-slate-300">
                    Linked to: {user.email}
                  </div>
                </div>
              )}

              {/* Method 4: PayPal Direct */}
              {method === 'paypal' && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto font-bold">
                    P
                  </div>
                  <h4 className="font-bold text-sm text-white">PayPal Instant Checkout</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Safe payment through your linked PayPal balance, credit line, or bank transfer.
                  </p>
                  <div className="inline-block px-3 py-1 bg-slate-900 rounded-lg text-xs font-mono text-slate-300">
                    Account: {user.email}
                  </div>
                </div>
              )}

              {/* Promo Code Strip */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Have a promo code? (try GAMEZONE20)"
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] ${discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {promoMessage}
                </p>
              )}

              {/* Live Order Summary Box */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Selected Subscription:</span>
                  <span className="text-slate-200 font-semibold">
                    {tier === 'yearly' ? 'Annual Pass ($79.99/yr)' : 'Monthly Plan ($9.99/mo)'}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-medium">
                    <span>Discount Applied ({discountPercent}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tax / VAT (Included):</span>
                  <span className="font-mono text-slate-300">$0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
                  <span className="text-white">Total Amount Due:</span>
                  <span className="font-mono text-amber-400 text-base tabular-nums">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Secure Bank Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Proceed to 3D Secure Verification · ${finalPrice.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <Lock className="w-3 h-3" />
                <span>Encrypted Bank Authorization · No hidden fees · Cancel anytime</span>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 2: 3D SECURE OTP VERIFICATION ================= */}
        {step === 'OTP_VERIFICATION' && (
          <div className="py-4 text-center max-w-md mx-auto animate-fadeIn">
            <button
              onClick={() => setStep('PLAN_AND_PAY')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Payment Details
            </button>

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display mb-1.5">
              3D Secure Bank Verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              A 6-digit one-time password (OTP) has been dispatched to your mobile number and email to authorize{' '}
              <strong className="text-amber-400">${finalPrice.toFixed(2)}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit OTP Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const next = [...otpCode];
                      next[idx] = val;
                      setOtpCode(next);
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-11 h-12 text-center text-lg font-bold font-mono text-white bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                ))}
              </div>

              {otpError && <p className="text-xs text-rose-400 font-medium">{otpError}</p>}

              {/* Convenience Demo Helper */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Verification Code: <strong className="text-cyan-400 font-mono">123456</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(['1', '2', '3', '4', '5', '6'])}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Auto-fill Demo OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Card Issuer...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Authorize Payment</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-500 block">
                Didn't receive the code? Resend SMS in 00:45
              </span>
            </form>
          </div>
        )}

        {/* ================= STEP 3: OFFICIAL TAX INVOICE & RECEIPT ================= */}
        {step === 'SUCCESS_RECEIPT' && receiptDetails && (
          <div className="py-4 text-center max-w-md mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-1">Payment Successful!</h3>
            <p className="text-xs text-slate-300 mb-6">
              Your GameZone Pro Premium membership is officially activated. All premium titles and VIP leaderboards are now completely unlocked!
            </p>

            {/* Receipt Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 mb-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-cyan-400 font-bold">{receiptDetails.txnId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="text-white font-medium">{user.username} ({user.email})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan Activated:</span>
                <span className="text-amber-400 font-bold">{receiptDetails.tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-300">{receiptDetails.methodLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-400">{receiptDetails.date}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
                <span className="text-white">Amount Charged:</span>
                <span className="font-mono text-emerald-400 text-base">${receiptDetails.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Start Playing Pro Games</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
