"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";
import { Heart } from "lucide-react";
import { DonationDialog } from "./components/donation-dialog";

const teamMembers = [
  {
    name: "Yukesh",
    role: "Full Stack Developer",
    description: "Lead developer and project architect",
  },
  {
    name: "Ujjwal",
    role: "Frontend Developer",
    description: "UI/UX specialist and frontend implementation",
  },
  {
    name: "Poonam",
    role: "Backend Developer",
    description: "Database design and API implementation",
  },
  {
    name: "Manab",
    role: "QA Engineer",
    description: "Testing and quality assurance",
  },
];

export default function AboutPage() {
  const { t } = useTranslations([
    "about.title",
    "about.description",
    "about.donate",
    "about.donateDescription",
    "common.error",
  ] as const satisfies readonly TranslationKey[]);

  const [showDonationDialog, setShowDonationDialog] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          {t("about.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("about.description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.name}>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </CardHeader>
            <CardContent>
              <p>{member.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("about.donate")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("about.donateDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowDonationDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
          >
            <Heart className="mr-2 h-4 w-4" />
            {t("about.donate")}
          </Button>
        </CardContent>
      </Card>

      <DonationDialog
        open={showDonationDialog}
        onOpenChange={setShowDonationDialog}
      />
    </div>
  );
}
