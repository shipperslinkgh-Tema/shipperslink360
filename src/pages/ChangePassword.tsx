import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, XCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ChangePassword() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allValid = PASSWORD_RULES.every(r => r.test(password));
  const passwordsMatch = password === confirm && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid || !passwordsMatch) return;
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Mark password as changed
    if (profile) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("user_id", profile.user_id);
    }

    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img src={logo} alt="SLAC" className="w-14 h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-foreground">Change Your Password</h1>
          <p className="text-sm text-muted-foreground">You must set a new password before continuing.</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>

              {/* Password strength */}
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</p>
                {PASSWORD_RULES.map(rule => (
                  <div key={rule.label} className="flex items-center gap-2 text-xs">
                    {rule.test(password) ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={rule.test(password) ? "text-success" : "text-muted-foreground"}>
                      {rule.label}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs mt-1">
                  {passwordsMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={passwordsMatch ? "text-success" : "text-muted-foreground"}>
                    Passwords match
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={loading || !allValid || !passwordsMatch}
              >
                {loading ? "Updating..." : "Set New Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
