import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { API_BASE } from '../constants';
import { ArrowRight, Check, AlertCircle, Clock, Rocket } from 'lucide-react';
import { useSession } from '@/state/session';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSession();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for rate limiting
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/email/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const match = data.detail?.match(/(\d+)\s*seconds/);
          if (match) {
            setCountdown(parseInt(match[1]));
          }
        }
        throw new Error(data.detail || 'Failed to send verification code');
      }

      setSuccess('Verification code sent! Check your email.');
      setStep('code');
      setCountdown(60); // Start 60 second countdown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/email/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid verification code');
      }

      login(data.token, data.user?.email ?? email);
      navigate({ to: '/dashboard/solutions', search: {} });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCode('');
    setError(null);
    setSuccess(null);
    handleSendCode(new Event('submit') as any);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-foreground-light">
          {step === 'email' ? 'Enter your email to receive a one-time verification code.' : 'Enter the 6-digit code we sent to your email.'}
        </p>
      </div>

      <div className="rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.45)] p-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
          <Rocket className="h-4 w-4 text-brand" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">Existing users only</div>
          <p className="mt-1 text-sm text-foreground-light">Registration is currently closed.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.45)] p-4 flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-[hsl(var(--sb-fg-light))]" aria-hidden="true" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.45)] p-4 flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 text-brand" aria-hidden="true" />
          <p className="text-sm text-foreground">{success}</p>
        </div>
      ) : null}

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading || countdown > 0}
              className="sb-input mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || countdown > 0}
            className="sb-btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" aria-hidden="true" />
                Sending
              </>
            ) : countdown > 0 ? (
              <>
                <Clock className="h-4 w-4" aria-hidden="true" />
                Wait {countdown}s
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-foreground">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
              className="sb-input mt-2 h-14 px-4 text-center text-xl font-mono tracking-widest"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-foreground-light">
              Sent to <span className="text-foreground">{email}</span>
            </p>
          </div>

          <button type="submit" disabled={loading || code.length !== 6} className="sb-btn-primary w-full">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" aria-hidden="true" />
                Verifying
              </>
            ) : (
              <>
                Verify <Check className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>

          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || countdown > 0}
              className="sb-btn-secondary w-full"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-foreground-light hover:text-foreground underline underline-offset-4"
            >
              Change email
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
