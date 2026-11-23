"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "light" | "dark" | "auto";
      size: "normal" | "compact" | "flexible";
      action: string;
      language: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  resetKey: number;
  onToken: (token: string) => void;
}

export function TurnstileWidget({
  siteKey,
  resetKey,
  onToken,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onToken);
  const lastResetKeyRef = useRef(resetKey);
  const [scriptReady, setScriptReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (window.turnstile) setScriptReady(true);
  }, []);

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !window.turnstile ||
      !containerRef.current ||
      widgetIdRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      action: "mirra_compare",
      language: "zh-cn",
      callback: (token) => callbackRef.current(token),
      "expired-callback": () => callbackRef.current(""),
      "error-callback": () => {
        callbackRef.current("");
        setLoadError(true);
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) return;
    lastResetKeyRef.current = resetKey;
    onToken("");

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [onToken, resetKey]);

  if (!siteKey) return null;

  return (
    <div className="turnstile-row">
      <Script
        id="cloudflare-turnstile-script"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setLoadError(false);
          setScriptReady(true);
        }}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} className="turnstile-widget" />
      {loadError && <p>人机验证加载失败，请刷新后重试。</p>}
    </div>
  );
}
