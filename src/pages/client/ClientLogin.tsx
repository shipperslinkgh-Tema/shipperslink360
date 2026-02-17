import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, Globe } from "lucide-react";
import logo from "@/assets/logo.png";

export default function ClientLogin() {
  const { signIn } = useClientAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    navigate("/portal");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card shadow-lg mb-4">
            <img src={logo} alt="SLAC" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Shippers Link Agencies Co., Ltd</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="pb-4 pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Client Access</span>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="client-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="your@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In to Portal"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Contact Shippers Link Agencies for portal access credentials.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          © {new Date().getFullYear()} Shippers Link Agencies Co., Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
