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
import { convertP3ToSRGB, processImage } from "@/utils/process-image";

const ORIGINS = ["The woods", "The deep sea", "The tundra"];

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  origin: z.string(),
  dob: z.string(),
  portrait: z.custom<File>(
    (val) => val instanceof File,
    "Please upload a file"
  ),
});

export default function Playground() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      dob: "",
      origin: ORIGINS[0],
      portrait: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    alert("Submitted");
    console.log({ data });

    const imageData = await processImage(data.portrait);
    document.getElementById("processTest").src = URL.createObjectURL(imageData);
    // fetch(api, POST, imageData as formdata)
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Fiona Hacker" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="origin"
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
                    {!ORIGINS.includes(form.getValues().origin) && (
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
            name="dob"
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
            name="portrait"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portrait</FormLabel>
                <FormControl>
                  <Input
                    accept=".jpg, .jpeg, .png, .svg"
                    type="file"
                    onChange={(e) =>
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <aside>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          /* @ts-expect-error TODO: encode uploaded image */
          src={`/og?${new URLSearchParams(form.getValues()).toString()}`}
          alt="Preview of passport page"
          className="shadow-lg rounded-lg w-full bg-slate-100"
        />
        <img
          id="processTest"
          src={``}
          alt="test"
          className="shadow-lg rounded-lg w-full bg-slate-100"
        />
      </aside>
    </main>
  );
}
