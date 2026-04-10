import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Bell, Mail, Loader2, Save, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_content: string;
  description: string | null;
  updated_at: string;
}

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isModerator = user?.role === "moderator";

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_key");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Email Templates - Moderator Only */}
        {isModerator && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Edit the content of emails sent to users. Use placeholders like {"{{name}}"}, {"{{resetUrl}}"}, {"{{newEmail}}"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates && templates.length > 0 ? (
                <Tabs defaultValue={templates[0].template_key}>
                  <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                    {templates.map((t) => (
                      <TabsTrigger key={t.template_key} value={t.template_key} className="text-xs">
                        {t.template_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {templates.map((t) => (
                    <TabsContent key={t.template_key} value={t.template_key}>
                      <EmailTemplateEditor template={t} />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p className="text-muted-foreground text-sm">No email templates found.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Registrations</p>
                <p className="text-sm text-muted-foreground">Allow new user registrations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Withdrawals</p>
                <p className="text-sm text-muted-foreground">Enable withdrawal requests</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email for new deposits</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Withdrawal Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for pending withdrawals</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

function EmailTemplateEditor({ template }: { template: EmailTemplate }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(template.subject);
  const [htmlContent, setHtmlContent] = useState(template.html_content);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setHtmlContent(template.html_content);
  }, [template]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("email_templates")
        .update({ subject, html_content: htmlContent })
        .eq("id", template.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({ title: "Template updated", description: `"${template.template_key}" saved successfully.` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const previewHtml = htmlContent
    .replace(/\{\{name\}\}/g, "John Doe")
    .replace(/\{\{resetUrl\}\}/g, "https://iamversetrade.com/reset-password?token=example")
    .replace(/\{\{newEmail\}\}/g, "newemail@example.com");

  return (
    <div className="space-y-4 mt-4">
      {template.description && (
        <p className="text-sm text-muted-foreground">{template.description}</p>
      )}
      <div className="space-y-2">
        <Label>Subject Line</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>HTML Content</Label>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? "Edit" : "Preview"}
          </Button>
        </div>
        {showPreview ? (
          <div className="border rounded-lg p-4 bg-white min-h-[300px]">
            <iframe
              srcDoc={previewHtml}
              className="w-full min-h-[300px] border-0"
              title="Email Preview"
              sandbox=""
            />
          </div>
        ) : (
          <Textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={15}
            className="font-mono text-xs"
          />
        )}
      </div>
      <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save Template
      </Button>
    </div>
  );
}

export default AdminSettings;
