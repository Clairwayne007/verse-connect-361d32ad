import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertTriangle, Activity, Lock } from "lucide-react";

const AdminSecurity = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage platform security configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication Requirement</p>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Attempt Limiting</p>
                <p className="text-sm text-muted-foreground">
                  Block accounts after 5 failed login attempts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after 30 minutes of inactivity
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">
                  Restrict admin access to specific IPs
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Security Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <LogEntry
                action="Admin login"
                user="admin@iamverse.com"
                ip="192.168.1.1"
                time="2024-01-25 14:30"
              />
              <LogEntry
                action="User suspended"
                user="admin@iamverse.com"
                ip="192.168.1.1"
                time="2024-01-25 13:15"
              />
              <LogEntry
                action="Transaction approved"
                user="admin@iamverse.com"
                ip="192.168.1.1"
                time="2024-01-25 12:00"
              />
              <LogEntry
                action="Settings updated"
                user="admin@iamverse.com"
                ip="192.168.1.1"
                time="2024-01-25 11:30"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              No security alerts at this time
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const LogEntry = ({
  action,
  user,
  ip,
  time,
}: {
  action: string;
  user: string;
  ip: string;
  time: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div>
      <p className="font-medium">{action}</p>
      <p className="text-sm text-muted-foreground">{user}</p>
    </div>
    <div className="text-right text-sm">
      <p className="font-mono text-muted-foreground">{ip}</p>
      <p className="text-muted-foreground">{time}</p>
    </div>
  </div>
);

export default AdminSecurity;
