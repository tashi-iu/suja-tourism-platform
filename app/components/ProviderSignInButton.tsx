import type { Provider } from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { signInWithProvider } from "~/utils";

type ProviderSignInButtonProps = PropsWithChildren<{
  provider: Provider;
}>;

export default function ProviderSignInButton({
  provider,
  children,
}: ProviderSignInButtonProps) {
  const handleButtonClick = useCallback(async () => {
    try {
      await signInWithProvider(provider, window.location.pathname);
    } catch {
      return;
    }
  }, [provider]);

  return (
    <button
      onClick={handleButtonClick}
      type="submit"
      className="flex items-center justify-between gap-x-2 rounded bg-slate-500/80 px-4 py-2.5 font-semibold text-white/90 shadow-lg"
    >
      {children}
    </button>
  );
}
