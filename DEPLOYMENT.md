# JW Consulting — Business Solutions

Responsive, animated, dependency-free landing page. Production: https://jw-business-solutions.vercel.app

## Runtime and deployment

Static website in `public/`. Node.js 24 Web Request/Response function in `api/enquiry.js`. Vercel is connected to this GitHub repository; `main` is the production branch. Run `npm test` for backend checks.

## Email delivery

The local `/api/enquiry` function validates requests and forwards them server-to-server to the existing owner-controlled service at `https://jw-consulting-noir.vercel.app/api/enquiry`. That Vercel function holds the existing Resend sending credential and sends to **nickooi42a123@gmail.com**. The selected business service and new website source are preserved in the email body; the shared sender uses its existing subject category. No secrets are copied or embedded in the frontend or repository. This deployment depends on that existing email service remaining live.

To make delivery independent later, configure `RESEND_API_KEY` in this project's Vercel production environment, optionally `ENQUIRY_FROM`, and redeploy. The same endpoint automatically uses direct Resend delivery when configured. With the Resend onboarding sender, delivery is limited to the account owner's address. A verified sending domain is needed for wider recipients.

The destination is fixed server-side. The visitor email becomes Reply-To. No automatic visitor copy is sent. Errors never produce a success response. Protection includes server validation, origin checks, honeypot, payload limit, provider timeout and a stable idempotency reference. No durable distributed rate limiter is configured; the provider's sending limits and Vercel platform protections apply.

## UI

Responsive navigation; labelled, accessible form; keyboard-operated example tabs; native FAQ disclosures; canvas ribbon animation and scroll reveals that respect reduced-motion preferences. Content labelled “illustrative concept” is an example, not customer evidence. No invented clients, testimonials, or performance statistics.
