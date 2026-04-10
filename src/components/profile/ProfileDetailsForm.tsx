import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CheckCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Common countries list (abbreviated)
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana",
  "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines",
  "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", "Singapore",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland",
  "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Venezuela", "Vietnam", "Zambia", "Zimbabwe",
];

interface ProfileDetails {
  sex: string | null;
  country: string | null;
  age: number | null;
  occupation: string | null;
  phone_number: string | null;
  phone_verified: boolean;
}

export const ProfileDetailsForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<ProfileDetails>({
    sex: null,
    country: null,
    age: null,
    occupation: null,
    phone_number: null,
    phone_verified: false,
  });

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Fetch existing profile details
  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("profiles")
      .select("sex, country, age, occupation, phone_number, phone_verified")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setDetails({
            sex: (data as any).sex ?? null,
            country: (data as any).country ?? null,
            age: (data as any).age ?? null,
            occupation: (data as any).occupation ?? null,
            phone_number: (data as any).phone_number ?? null,
            phone_verified: (data as any).phone_verified ?? false,
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        sex: details.sex || null,
        country: details.country || null,
        age: details.age ? Number(details.age) : null,
        occupation: details.occupation || null,
      } as any)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your details. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved.",
      });
    }
  };

  const handleSendOtp = async () => {
    if (!details.phone_number || details.phone_number.length < 10) {
      toast({ title: "Error", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-phone-otp", {
        body: { phone_number: details.phone_number },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setOtpSent(true);
      toast({ title: "OTP Sent", description: "A verification code has been sent to your phone." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send OTP", variant: "destructive" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "Error", description: "Please enter the 6-digit code", variant: "destructive" });
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-phone-otp", {
        body: { phone_number: details.phone_number, code: otpCode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDetails((d) => ({ ...d, phone_verified: true }));
      setOtpSent(false);
      setOtpCode("");
      toast({ title: "Phone Verified!", description: "Your phone number has been verified successfully." });
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message || "Invalid code", variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phone Verification Section */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Phone Verification
            {details.phone_verified && (
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Phone verification is required to make withdrawals.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="+1234567890"
              value={details.phone_number || ""}
              onChange={(e) => {
                setDetails((d) => ({ ...d, phone_number: e.target.value, phone_verified: false }));
                setOtpSent(false);
              }}
              disabled={details.phone_verified}
            />
            {!details.phone_verified && (
              <Button
                variant="outline"
                onClick={handleSendOtp}
                disabled={sendingOtp || !details.phone_number}
                className="shrink-0"
              >
                {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                Send Code
              </Button>
            )}
          </div>
          {otpSent && !details.phone_verified && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
              <Button onClick={handleVerifyOtp} disabled={verifyingOtp} className="shrink-0">
                {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other profile fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select
            value={details.sex || ""}
            onValueChange={(val) => setDetails((d) => ({ ...d, sex: val || null }))}
          >
            <SelectTrigger id="sex">
              <SelectValue placeholder="Prefer not to say" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={details.country || ""}
            onValueChange={(val) => setDetails((d) => ({ ...d, country: val || null }))}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={120}
            placeholder="Your age (optional)"
            value={details.age ?? ""}
            onChange={(e) =>
              setDetails((d) => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            type="text"
            placeholder="Your occupation (optional)"
            value={details.occupation ?? ""}
            onChange={(e) => setDetails((d) => ({ ...d, occupation: e.target.value || null }))}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Details"
          )}
        </Button>
      </div>
    </div>
  );
};
