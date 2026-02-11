# Template: Form Builder System

## Structure
```
forms/
├── components/
│   ├── form-field.tsx
│   ├── form-builder.tsx
│   └── field-types/
│       ├── text-field.tsx
│       ├── select-field.tsx
│       ├── checkbox-field.tsx
│       └── file-field.tsx
├── hooks/
│   └── use-form-builder.ts
├── lib/
│   ├── form-schema.ts
│   └── validation.ts
└── types/
    └── form.ts
```

## Types
```typescript
// types/form.ts
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  options?: FieldOption[]; // For select, radio
  defaultValue?: any;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
}
```

## Dynamic Form Component
```tsx
// components/form-builder.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormSchema, FormField as FormFieldType } from "@/types/form";
import { generateZodSchema } from "@/lib/form-schema";

interface FormBuilderProps {
  schema: FormSchema;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function FormBuilder({ schema, onSubmit, isLoading }: FormBuilderProps) {
  const zodSchema = generateZodSchema(schema.fields);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: schema.fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? "";
      return acc;
    }, {} as Record<string, any>),
  });

  return (
    <div className="space-y-6">
      {schema.title && (
        <div>
          <h2 className="text-2xl font-bold">{schema.title}</h2>
          {schema.description && (
            <p className="text-muted-foreground mt-1">{schema.description}</p>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {schema.fields.map((field) => (
            <DynamicField key={field.id} field={field} form={form} />
          ))}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Envoi en cours..." : schema.submitText ?? "Envoyer"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

interface DynamicFieldProps {
  field: FormFieldType;
  form: any;
}

function DynamicField({ field, form }: DynamicFieldProps) {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {renderFieldInput(field, formField)}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function renderFieldInput(field: FormFieldType, formField: any) {
  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "number":
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          {...formField}
        />
      );

    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          rows={4}
          {...formField}
        />
      );

    case "select":
      return (
        <Select onValueChange={formField.onChange} defaultValue={formField.value}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder ?? "Sélectionner..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
          <span className="text-sm text-muted-foreground">
            {field.placeholder}
          </span>
        </div>
      );

    case "radio":
      return (
        <RadioGroup
          onValueChange={formField.onChange}
          defaultValue={formField.value}
          className="flex flex-col space-y-2"
        >
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <label htmlFor={option.value} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      );

    case "date":
      return (
        <Input
          type="date"
          {...formField}
        />
      );

    case "file":
      return (
        <Input
          type="file"
          onChange={(e) => formField.onChange(e.target.files?.[0])}
        />
      );

    default:
      return <Input {...formField} />;
  }
}
```

## Schema Generator (Zod)
```typescript
// lib/form-schema.ts
import { z } from "zod";
import type { FormField } from "@/types/form";

export function generateZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        schema = z.string().email("Email invalide");
        break;

      case "number":
        schema = z.coerce.number();
        if (field.validation?.min !== undefined) {
          schema = (schema as z.ZodNumber).min(
            field.validation.min,
            `Minimum: ${field.validation.min}`
          );
        }
        if (field.validation?.max !== undefined) {
          schema = (schema as z.ZodNumber).max(
            field.validation.max,
            `Maximum: ${field.validation.max}`
          );
        }
        break;

      case "checkbox":
        schema = z.boolean();
        break;

      case "date":
        schema = z.string();
        break;

      case "file":
        schema = z.any();
        break;

      default:
        schema = z.string();
        if (field.validation?.minLength) {
          schema = (schema as z.ZodString).min(
            field.validation.minLength,
            `Minimum ${field.validation.minLength} caractères`
          );
        }
        if (field.validation?.maxLength) {
          schema = (schema as z.ZodString).max(
            field.validation.maxLength,
            `Maximum ${field.validation.maxLength} caractères`
          );
        }
        if (field.validation?.pattern) {
          schema = (schema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            field.validation.message ?? "Format invalide"
          );
        }
    }

    if (!field.required) {
      schema = schema.optional();
    }

    shape[field.name] = schema;
  });

  return z.object(shape);
}
```

## Exemple: Contact Form
```typescript
// Définition du schéma
const contactFormSchema: FormSchema = {
  id: "contact-form",
  title: "Contactez-nous",
  description: "Remplissez le formulaire et nous vous répondrons sous 24h.",
  submitText: "Envoyer le message",
  fields: [
    {
      id: "name",
      type: "text",
      name: "name",
      label: "Nom complet",
      placeholder: "John Doe",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      id: "email",
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      required: true,
    },
    {
      id: "phone",
      type: "text",
      name: "phone",
      label: "Téléphone",
      placeholder: "06 12 34 56 78",
      required: false,
      validation: {
        pattern: "^[0-9\\s\\+\\-]+$",
        message: "Numéro de téléphone invalide",
      },
    },
    {
      id: "subject",
      type: "select",
      name: "subject",
      label: "Sujet",
      required: true,
      options: [
        { label: "Question générale", value: "general" },
        { label: "Support technique", value: "support" },
        { label: "Partenariat", value: "partnership" },
        { label: "Autre", value: "other" },
      ],
    },
    {
      id: "message",
      type: "textarea",
      name: "message",
      label: "Message",
      placeholder: "Votre message...",
      required: true,
      validation: {
        minLength: 10,
        maxLength: 1000,
      },
    },
    {
      id: "newsletter",
      type: "checkbox",
      name: "newsletter",
      label: "Newsletter",
      placeholder: "Je souhaite recevoir la newsletter",
      required: false,
      defaultValue: false,
    },
  ],
};

// Utilisation
export default function ContactPage() {
  const handleSubmit = async (data: any) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <FormBuilder schema={contactFormSchema} onSubmit={handleSubmit} />
    </div>
  );
}
```

## Multi-Step Form
```tsx
// components/multi-step-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FormBuilder } from "./form-builder";
import type { FormSchema } from "@/types/form";

interface MultiStepFormProps {
  steps: FormSchema[];
  onComplete: (data: Record<string, any>) => void;
}

export function MultiStepForm({ steps, onComplete }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleStepSubmit = (stepData: any) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    if (isLastStep) {
      onComplete(newFormData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Étape {currentStep + 1} sur {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Current step */}
      <FormBuilder
        schema={{
          ...steps[currentStep],
          submitText: isLastStep ? "Terminer" : "Suivant",
        }}
        onSubmit={handleStepSubmit}
      />

      {/* Back button */}
      {currentStep > 0 && (
        <Button variant="outline" onClick={handleBack} className="w-full">
          Retour
        </Button>
      )}
    </div>
  );
}
```

## API Handler
```typescript
// app/api/forms/[formId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const body = await request.json();
    const { formId } = params;

    // Validate based on formId
    // Store submission
    // Send notifications

    // Example: Send email
    await fetch(process.env.EMAIL_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL,
        subject: `Nouveau formulaire: ${formId}`,
        html: `<pre>${JSON.stringify(body, null, 2)}</pre>`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
```
