import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield } from "lucide-react";

type SupabaseOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): SupabaseOAuth {
  return (supabase.auth as unknown as { oauth: SupabaseOAuth }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Authorize access</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">Could not load this authorization request: {error}</p>
          ) : !details ? (
            <p className="text-sm text-muted-foreground text-center">Loading…</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{details.client?.name ?? "An app"}</span> is
                requesting access to ShippersLink 360 on your behalf. It will be able to read the data your
                account can access.
              </p>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  Approve
                </Button>
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  Deny
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
