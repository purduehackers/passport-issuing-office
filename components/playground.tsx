"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { processImage } from "@/utils/process-image";
import { CropDemo } from "./crop";
import { useState } from "react";
import { CURRENT_PASSPORT_VERSION } from "@/config";
import { ImageResponse } from "next/og";

const ORIGINS = ["The woods", "The deep sea", "The tundra"];

const FormSchema = z.object({
  surname: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  firstName: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  placeOfOrigin: z.string(),
  dateOfBirth: z.string().optional(),
  image: z.custom<File>((val) => val instanceof File, "Please upload a file"),
});

export default function Playground() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      dateOfBirth: undefined,
      placeOfOrigin: ORIGINS[0],
      image: undefined,
    },
  });

  const [croppedImageSrc, setCroppedImageSrc] = useState("");
  const [generatedPageUrl, setGeneratedPageUrl] = useState(
    "/passport/default.png"
  );
  const [isLoading, setIsLoading] = useState(false); // TODO: do this better

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const imageData = await processImage(data.image);

    const apiFormData = new FormData();
    for (const [key, val] of Object.entries(data)) {
      apiFormData.append(key, val);
    }
    apiFormData.append("portrait", imageData);

    const postRes: ImageResponse = await fetch(`/og`, {
      method: "POST",
      body: apiFormData,
    });
    const generatedImageBlob = await postRes.blob();
    const generatedImageBuffer = Buffer.from(
      await generatedImageBlob.arrayBuffer()
    );
    const generatedImageUrl =
      "data:image/png;base64," + generatedImageBuffer.toString("base64");

    setGeneratedPageUrl(generatedImageUrl);
    setIsLoading(false);
  }

  return (
    <main className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12 w-full max-w-4xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-y-6"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Wack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Hacker" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeOfOrigin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place of origin</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {ORIGINS.map((origin) => (
                      <FormItem
                        key={origin}
                        className="flex-row items-center gap-x-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={origin} />
                        </FormControl>
                        <FormLabel className="font-normal">{origin}</FormLabel>
                      </FormItem>
                    ))}
                    <FormItem className="flex-row items-center gap-x-2">
                      <FormControl>
                        <RadioGroupItem value="" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Write your own…
                      </FormLabel>
                    </FormItem>
                    {!ORIGINS.includes(form.getValues().placeOfOrigin) && (
                      <div className="pl-6">
                        <Input {...field} className="h-8" autoFocus />
                      </div>
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portrait</FormLabel>
                <FormControl>
                  <Input
                    accept=".jpg, .jpeg, .png, .svg"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const reader = new FileReader();
                        reader.addEventListener("load", () =>
                          setCroppedImageSrc(reader.result?.toString() || "")
                        );
                        reader.readAsDataURL(e.target.files[0]);
                      }

                      return field.onChange(
                        e.target.files ? e.target.files[0] : null
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CropDemo src={croppedImageSrc} />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
      <aside>
        <img
          src={generatedPageUrl}
          alt="Preview of passport page"
          className="shadow-lg rounded-lg w-full bg-slate-100"
        />
        {/* <img
          id="processTest"
          src={""}
          alt="test"
          className="shadow-lg rounded-lg w-full bg-slate-100"
        /> */}
      </aside>
    </main>
  );
}
