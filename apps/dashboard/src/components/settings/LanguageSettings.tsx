"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Globe, Calendar, Clock, DollarSign, Download, Check } from "lucide-react"
import { toast } from "sonner"

export const LanguageSettings = () => {
  const [language, setLanguage] = useState("en")
  const [region, setRegion] = useState("RW")
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy")
  const [timeFormat, setTimeFormat] = useState("24h")
  const [currency, setCurrency] = useState("RWF")
  const [autoTranslate, setAutoTranslate] = useState(false)

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", progress: 100 },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", progress: 95 },
    { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda", flag: "🇷🇼", progress: 85 },
  ]

  const regions = [
    { code: "RW", name: "Rwanda", flag: "🇷🇼" },
    { code: "KE", name: "Kenya", flag: "🇰🇪" },
    { code: "UG", name: "Uganda", flag: "🇺🇬" },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  ]

  const currencies = [
    { code: "RWF", name: "Rwandan Franc", symbol: "₣" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  ]

  const handleSaveSettings = () => {
    toast.success("Language settings saved successfully")
  }

  const handleDownloadLanguagePack = (langCode: string) => {
    toast.success(`Downloading ${languages.find((l) => l.code === langCode)?.name} language pack...`)
  }

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>Choose your preferred language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Language */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Display Language</p>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    language === lang.code ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setLanguage(lang.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lang.progress === 100 ? "default" : "secondary"}>{lang.progress}%</Badge>
                      {language === lang.code && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                  {lang.progress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: `${lang.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Region */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Region</p>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg.code} value={reg.code}>
                    <div className="flex items-center gap-2">
                      <span>{reg.flag}</span>
                      <span>{reg.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto Translation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Auto-translate</p>
              <p className="text-sm text-muted-foreground">Automatically translate content when available</p>
            </div>
            <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
          </div>
        </CardContent>
      </Card>

      {/* Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Format Preferences
          </CardTitle>
          <CardDescription>Customize how dates, times, and numbers are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Date Format</p>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (31/12/2024)</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2024-12-31)</SelectItem>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY (31-12-2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Time Format</p>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Currency</p>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{curr.symbol}</span>
                      <span>
                        {curr.name} ({curr.code})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Packs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Language Packs
          </CardTitle>
          <CardDescription>Download language packs for offline use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {languages.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lang.progress === 100 ? "Complete" : `${lang.progress}% translated`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lang.code === language && <Badge variant="default">Active</Badge>}
                  <Button variant="outline" size="sm" onClick={() => handleDownloadLanguagePack(lang.code)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Format Preview</CardTitle>
          <CardDescription>See how your settings will display information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Appointment Date:{" "}
                {dateFormat === "dd/mm/yyyy"
                  ? "15/03/2024"
                  : dateFormat === "mm/dd/yyyy"
                    ? "03/15/2024"
                    : dateFormat === "yyyy-mm-dd"
                      ? "2024-03-15"
                      : "15-03-2024"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Time: {timeFormat === "12h" ? "2:30 PM" : "14:30"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Cost: {currencies.find((c) => c.code === currency)?.symbol}50,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Language Settings</Button>
      </div>
    </div>
  )
}
