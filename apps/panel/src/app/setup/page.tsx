"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { setup } from "./action";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const setupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SetupForm = z.infer<typeof setupSchema>;

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SetupForm) => {
    setIsLoading(true);
    try {
      console.log(data);
      await setup(data);
    } catch (error) {
      console.error("Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">First time here?</h1>
          <p className="text-muted-foreground text-sm">
            Please fill in the following information to setup SerialSMS.
          </p>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
            <CardDescription>
              Enter your administrator username and password.
              <br />
              <span className="text-muted-foreground text-xs">
                Once you set your account up, you will be able to add more users
                or update your account later.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@serialsms.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
