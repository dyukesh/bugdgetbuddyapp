"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import { categories } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function NewBudgetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslations([
    "budgets.new",
    "budgets.description",
    "budgets.details",
    "budgets.monthlyLimit",
    "common.cancel",
    "loadingStates.creating",
    "budgets.create",
    "common.success",
    "budgets.created",
    "common.error",
    "budgets.failedToCreate",
    "validation.category.required",
    "validation.amount.required",
    "validation.amount.type",
    "validation.amount.positive",
    "amount",
    "category",
  ] as const satisfies readonly TranslationKey[]);

  const formSchema = z.object({
    category: z.string({
      required_error: t("validation.category.required"),
    }),
    amount: z.coerce
      .number({
        required_error: t("validation.amount.required"),
        invalid_type_error: t("validation.amount.type"),
      })
      .positive(t("validation.amount.positive")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await safeDBOperation(async (db) => {
        const now = new Date();
        await db.budgets.add({
          userId: user.id,
          category: values.category,
          amount: values.amount,
          createdAt: now,
          updatedAt: now,
        });
      });

      if (result.success) {
        toast({
          title: t("common.success"),
          description: t("budgets.created"),
        });
        router.push("/budgets");
        router.refresh();
      } else {
        throw new Error(t("budgets.failedToCreate"));
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast({
        title: t("common.error"),
        description: t("budgets.failedToCreate"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("budgets.new")}
        </h1>
        <p className="text-muted-foreground">{t("budgets.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("budgets.details")}</CardTitle>
          <CardDescription>{t("budgets.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("category")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((category) => category.id !== "income")
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {t(`categories.${category.id}` as TranslationKey)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("budgets.monthlyLimit")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("amount")}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("loadingStates.creating")
                    : t("budgets.create")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
