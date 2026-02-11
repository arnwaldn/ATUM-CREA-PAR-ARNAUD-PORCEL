# Email Patterns - React Email + Resend

> **Version**: v1.0 | ATUM CREA
> **Packages**: `react-email` + `@react-email/components` + `resend`
> **Principe**: Emails en JSX, envoyes via Resend (ou tout SMTP)

---

## Architecture

```
src/
├── emails/
│   ├── welcome.tsx          # Template bienvenue
│   ├── reset-password.tsx   # Template reset mdp
│   ├── invoice.tsx          # Template facture
│   └── components/
│       ├── header.tsx       # Header reutilisable
│       ├── footer.tsx       # Footer reutilisable
│       └── button.tsx       # Bouton CTA
├── lib/
│   └── email.ts             # Service d'envoi
└── app/api/email/
    └── route.ts             # API endpoint
```

---

## Installation

```bash
pnpm add resend @react-email/components react-email
```

---

## Templates Email (JSX)

```typescript
// emails/welcome.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Tailwind,
} from '@react-email/components';

type WelcomeEmailProps = {
  username: string;
  loginUrl: string;
};

export function WelcomeEmail({ username, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur MonApp, {username} !</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-lg bg-white p-8">
            <Img
              src="https://monapp.com/logo.png"
              width={120}
              height={40}
              alt="MonApp"
            />
            <Heading className="text-2xl font-bold text-gray-900">
              Bienvenue, {username} !
            </Heading>
            <Text className="text-gray-600">
              Votre compte a ete cree avec succes. Vous pouvez maintenant
              acceder a toutes les fonctionnalites de MonApp.
            </Text>
            <Section className="text-center">
              <Button
                className="rounded-lg bg-blue-600 px-6 py-3 text-white"
                href={loginUrl}
              >
                Se connecter
              </Button>
            </Section>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-sm text-gray-400">
              Si vous n'avez pas cree ce compte, ignorez cet email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Props par defaut pour le preview
WelcomeEmail.PreviewProps = {
  username: 'Arnaud',
  loginUrl: 'https://monapp.com/login',
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
```

```typescript
// emails/reset-password.tsx
import {
  Body, Container, Head, Heading, Html,
  Preview, Section, Text, Button, Tailwind, Hr,
} from '@react-email/components';

type ResetPasswordProps = {
  username: string;
  resetUrl: string;
  expiresIn: string;
};

export function ResetPasswordEmail({ username, resetUrl, expiresIn }: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Reinitialisation de votre mot de passe</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-lg bg-white p-8">
            <Heading className="text-xl font-bold">
              Reinitialisation du mot de passe
            </Heading>
            <Text>Bonjour {username},</Text>
            <Text>
              Vous avez demande la reinitialisation de votre mot de passe.
              Cliquez sur le bouton ci-dessous pour creer un nouveau mot de passe.
            </Text>
            <Section className="text-center">
              <Button
                className="rounded-lg bg-red-600 px-6 py-3 text-white"
                href={resetUrl}
              >
                Reinitialiser le mot de passe
              </Button>
            </Section>
            <Text className="text-sm text-gray-500">
              Ce lien expire dans {expiresIn}. Si vous n'avez pas fait cette demande, ignorez cet email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ResetPasswordEmail;
```

---

## Service d'envoi

```typescript
// lib/email.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome';
import { ResetPasswordEmail } from '@/emails/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'MonApp <noreply@monapp.com>';

export const emailService = {
  async sendWelcome(to: string, username: string) {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Bienvenue sur MonApp, ${username} !`,
      react: WelcomeEmail({
        username,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      }),
    });

    if (error) throw new Error(`Email failed: ${error.message}`);
  },

  async sendPasswordReset(to: string, username: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Reinitialisation de votre mot de passe',
      react: ResetPasswordEmail({ username, resetUrl, expiresIn: '1 heure' }),
    });

    if (error) throw new Error(`Email failed: ${error.message}`);
  },

  // Envoi batch
  async sendBatch(emails: Array<{ to: string; subject: string; react: React.ReactElement }>) {
    const { error } = await resend.batch.send(
      emails.map((e) => ({ from: FROM, ...e }))
    );

    if (error) throw new Error(`Batch email failed: ${error.message}`);
  },
};
```

### Server Actions

```typescript
// app/actions/auth.ts
'use server';

import { emailService } from '@/lib/email';
import { db } from '@/lib/db';

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  // Creer l'utilisateur
  const user = await db.user.create({
    data: { email, name },
  });

  // Envoyer l'email de bienvenue
  await emailService.sendWelcome(email, name);

  return { success: true };
}
```

---

## Preview local

```json
// package.json
{
  "scripts": {
    "email:dev": "email dev --dir emails --port 3001"
  }
}
```

```bash
pnpm email:dev
# Ouvre http://localhost:3001 avec le preview de tous les templates
```

---

## Checklist

- [ ] `resend` + `@react-email/components` installes
- [ ] Templates dans `emails/` avec TypeScript strict
- [ ] `Tailwind` wrapper pour les styles
- [ ] `Preview` component pour le texte de pre-header
- [ ] Service d'envoi centralise (`lib/email.ts`)
- [ ] Variable `RESEND_API_KEY` configuree
- [ ] Domaine verifie dans Resend dashboard
- [ ] Preview local (`pnpm email:dev`)
- [ ] Tests d'envoi vers differents clients email

---

*Knowledge ATUM CREA | Sources: resend/react-email, Resend docs*
