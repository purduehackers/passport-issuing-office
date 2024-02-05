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
import { processImage } from "@/lib/process-image";
import { Crop } from "./crop";
import { useRef, useState } from "react";
import { ImageResponse } from "next/og";
import { User } from "next-auth";
import { Checkbox } from "./ui/checkbox";
import { createPassport, getPreSignedUrl } from "@/lib/actions";

const ORIGINS = ["The woods", "The deep sea", "The tundra"];

const FormSchema = z.object({
  surname: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  firstName: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  placeOfOrigin: z.string().max(13),
  dateOfBirth: z.string().optional(),
  image: z.custom<File>((val) => val instanceof File, "Please upload a file"),
  passportNumber: z.string().max(4).optional(),
  sendToDb: z.boolean().optional().default(false),
});

export default function Playground({ user }: { user: User | undefined }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      dateOfBirth: undefined,
      placeOfOrigin: ORIGINS[0],
      image: undefined,
      passportNumber: "0",
    },
  });

  const [generatedImageUrl, setGeneratedImageUrl] = useState(
    "/passport/default.png"
  );
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // TODO: do this better
  const [croppedImageFile, setCroppedImageFile] = useState<File>();
  const generatedImageRef = useRef(null);

  function generateDownloadName() {
    const { firstName, surname } = form.getValues();

    function processName(name: string) {
      return name.replace(" ", "_").toLowerCase();
    }
    return `passport_${processName(firstName)}_${processName(surname)}`;
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    if (!croppedImageFile) {
      return; // TODO: handle error
    }
    const imageData = await processImage(croppedImageFile);

    const apiFormData = new FormData();
    for (const [key, val] of Object.entries(data)) {
      if (key !== "image") {
        apiFormData.append(key, String(val));
      }
    }
    apiFormData.append("portrait", imageData);
    if (user?.id) {
      apiFormData.append("userId", user.id);
    }

    const postRes: ImageResponse = await fetch(`/og`, {
      method: "POST",
      body: apiFormData,
    });
    const generatedImageBlob = await postRes.blob();
    const generatedImageFile = new File([generatedImageBlob], "data_page.png", {
      type: "image/png",
    });
    const generatedImageBuffer = Buffer.from(
      await generatedImageBlob.arrayBuffer()
    );
    const generatedImageUrl =
      "data:image/png;base64," + generatedImageBuffer.toString("base64");

    if (data.sendToDb) {
      apiFormData.append("generatedImage", generatedImageFile);
      await createPassport(apiFormData);
    }

    const preSignedUrl = await getPreSignedUrl("2");
    await fetch(preSignedUrl, {
      method: "PUT",
      body: generatedImageBlob,
    });

    setGeneratedImageUrl(generatedImageUrl);
    setIsLoading(false);
    setIsDefaultImage(false);
  }

  return (
    <main className="grid lg:grid-cols-[2fr_3fr] gap-20 lg:gap-12 w-full max-w-4xl">
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
                  <Crop
                    field={field}
                    croppedImageFile={croppedImageFile}
                    setCroppedImageFile={setCroppedImageFile}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {user ? (
            <FormField
              control={form.control}
              name="sendToDb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register this passport?</FormLabel>
                  <FormDescription>
                    Checking this box will register you for the next passport
                    ceremony. You can make as many changes as you want before
                    the ceremony.
                  </FormDescription>
                  <FormControl>
                    <Checkbox
                      className="h-6 w-6"
                      onCheckedChange={field.onChange}
                      checked={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <Button className="submitButton" type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>
      </Form>
      <aside>
        <div className="flex flex-col gap-4">
          <img
            ref={generatedImageRef}
            src={generatedImageUrl}
            alt="Preview of passport page"
            className="shadow-lg rounded-lg w-full bg-slate-100"
          />
          {!isDefaultImage && (
            <a href={generatedImageUrl} download={generateDownloadName()}>
              <Button className="w-full" type="button">
                Download
              </Button>
            </a>
          )}
        </div>
      </aside>
    </main>
  );
}
