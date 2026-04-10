import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { useDeposits } from "@/hooks/useDeposits";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Calendar, Shield, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CameraCapture } from "@/components/profile/CameraCapture";
import { ProfileDetailsForm } from "@/components/profile/ProfileDetailsForm";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { totalInvested, totalEarned, activeInvestments, isLoading: investmentsLoading } = useInvestments();
  const { deposits, isLoading: depositsLoading } = useDeposits();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const isLoading = authLoading || investmentsLoading || depositsLoading;

  // Fetch avatar URL
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        });
    }
  }, [user?.id]);

  // Calculate real stats
  const confirmedDeposits = deposits.filter((d) => d.status === "confirmed");
  const totalDeposited = confirmedDeposits.reduce((sum, d) => sum + Number(d.amount_usd), 0);
  const totalWithdrawals = 0; // Will be calculated when withdrawals hook is added

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl || undefined} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCameraOpen(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name || "User"}</h3>
                    <p className="text-muted-foreground capitalize">{user?.role || "Investor"} Account</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-primary"
                      onClick={() => setCameraOpen(true)}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Take a selfie
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <ProfileField icon={Mail} label="Email" value={user?.email || ""} />
                  <ProfileField
                    icon={Calendar}
                    label="Member Since"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  />
                  <ProfileField
                    icon={Shield}
                    label="Account Status"
                    value="Verified"
                    valueClassName="text-success"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Personal Details (optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete these optional details whenever you like — they won't affect deposits or investments.
            </p>
          </CardHeader>
          <CardContent>
            <ProfileDetailsForm />
          </CardContent>
        </Card>

        {/* Account stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatBox 
                  label="Total Deposited" 
                  value={totalDeposited > 0 ? `$${totalDeposited.toLocaleString()}` : "$0.00"} 
                  empty={totalDeposited === 0}
                />
                <StatBox 
                  label="Total Earnings" 
                  value={totalEarned > 0 ? `$${totalEarned.toLocaleString()}` : "$0.00"} 
                  empty={totalEarned === 0}
                />
                <StatBox 
                  label="Active Plans" 
                  value={activeInvestments.length.toString()} 
                  empty={activeInvestments.length === 0}
                />
                <StatBox 
                  label="Total Withdrawals" 
                  value={totalWithdrawals > 0 ? `$${totalWithdrawals.toLocaleString()}` : "$0.00"} 
                  empty={totalWithdrawals === 0}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onAvatarUpdated={(url) => setAvatarUrl(url)}
      />
    </DashboardLayout>
  );
};

const ProfileField = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
    <Icon className="h-5 w-5 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium ${valueClassName}`}>{value}</p>
    </div>
  </div>
);

const StatBox = ({ label, value, empty }: { label: string; value: string; empty?: boolean }) => (
  <div className={`p-4 rounded-lg border border-border text-center ${empty ? "opacity-60" : ""}`}>
    <p className={`text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
    {empty && <p className="text-xs text-muted-foreground mt-1">No data</p>}
  </div>
);

export default Profile;
