import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Moon, Sun, Globe, Mail, Phone, Building } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Route protection: Check for admin token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "Luxe Style Studio",
    siteEmail: "admin@luxestylestudio.com",
    contactNumber: "+1 (555) 123-4567",
    theme: "light",
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThemeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, theme: value }));
    setIsDarkMode(value === "dark");
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      });
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="font-brand text-2xl text-foreground">Settings</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Manage your website configuration and preferences
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="font-body text-xs uppercase tracking-[0.1em]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-brand text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription className="font-body">
                    Basic website information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="font-body text-sm">
                      Site Name
                    </Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleInputChange}
                      className="font-body text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteEmail" className="font-body text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Site Email
                    </Label>
                    <Input
                      id="siteEmail"
                      name="siteEmail"
                      type="email"
                      value={formData.siteEmail}
                      onChange={handleInputChange}
                      className="font-body text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="font-body text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number
                    </Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="font-body text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-brand text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Theme Settings
                  </CardTitle>
                  <CardDescription className="font-body">
                    Customize the look and feel of your site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="font-body text-sm">Theme Mode</Label>
                    <RadioGroup
                      value={formData.theme}
                      onValueChange={handleThemeChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.theme === "light"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleThemeChange("light")}
                      >
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label
                          htmlFor="theme-light"
                          className="flex items-center gap-2 cursor-pointer font-body text-sm"
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </Label>
                      </div>
                      <div
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.theme === "dark"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label
                          htmlFor="theme-dark"
                          className="flex items-center gap-2 cursor-pointer font-body text-sm"
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body text-sm">Dark Mode Preview</Label>
                      <p className="font-body text-xs text-muted-foreground">
                        Toggle to preview dark mode
                      </p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-brand text-lg">Notification Settings</CardTitle>
                  <CardDescription className="font-body">
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body text-sm">Push Notifications</Label>
                      <p className="font-body text-xs text-muted-foreground">
                        Receive push notifications for new orders
                      </p>
                    </div>
                    <Switch
                      id="enableNotifications"
                      name="enableNotifications"
                      checked={formData.enableNotifications}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, enableNotifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body text-sm">Email Alerts</Label>
                      <p className="font-body text-xs text-muted-foreground">
                        Receive email alerts for important updates
                      </p>
                    </div>
                    <Switch
                      id="enableEmailAlerts"
                      name="enableEmailAlerts"
                      checked={formData.enableEmailAlerts}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, enableEmailAlerts: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body text-sm">Maintenance Mode</Label>
                      <p className="font-body text-xs text-muted-foreground">
                        Put the site in maintenance mode (disables public access)
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={formData.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Settings;
