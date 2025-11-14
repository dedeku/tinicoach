/**
 * Email Service
 *
 * Handles sending transactional emails via SendGrid
 */

import sgMail from '@sendgrid/mail'

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@tinicoach.hu'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'tinicoach'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
} else {
  console.warn('⚠️ SENDGRID_API_KEY not set - emails will not be sent')
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using SendGrid
 *
 * @param options - Email options
 * @returns Promise that resolves when email is sent
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.log('📧 Email would be sent to:', options.to)
    console.log('Subject:', options.subject)
    console.log('Preview:', options.text || options.html.substring(0, 100))
    return
  }

  try {
    await sgMail.send({
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    console.log(`✅ Email sent to ${options.to}: ${options.subject}`)
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw new Error('Nem sikerült az email küldése')
  }
}

/**
 * Send welcome email after registration
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param verificationLink - Email verification link
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  verificationLink: string
): Promise<void> {
  const subject = 'Üdvözlünk a tinicoach-ban! 🎉'
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Üdvözlünk a tinicoach-ban! 🎉</h1>
      <p>Szia ${name}!</p>
      <p>Örülünk, hogy csatlakoztál hozzánk! A tinicoach egy személyre szabott coaching platform, ami segít elérni a céljaidat.</p>
      <p>Kérlek, erősítsd meg az email címedet az alábbi gombra kattintva:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Email cím megerősítése</a>
      </p>
      <p style="color: #666; font-size: 14px;">Ha nem működik a gomb, másold be ezt a linket a böngésződbe:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationLink}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Ez a link 24 óráig érvényes.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Üdvözlünk a tinicoach-ban!

Szia ${name}!

Örülünk, hogy csatlakoztál hozzánk! Kérlek, erősítsd meg az email címedet az alábbi linkre kattintva:

${verificationLink}

Ez a link 24 óráig érvényes.

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}

/**
 * Send email verification email
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param verificationLink - Email verification link
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationLink: string
): Promise<void> {
  const subject = 'Erősítsd meg az email címedet'
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Email cím megerősítése</h1>
      <p>Szia ${name}!</p>
      <p>Kérlek, erősítsd meg az email címedet az alábbi gombra kattintva:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Email cím megerősítése</a>
      </p>
      <p style="color: #666; font-size: 14px;">Ha nem működik a gomb, másold be ezt a linket a böngésződbe:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationLink}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Ez a link 24 óráig érvényes.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Email cím megerősítése

Szia ${name}!

Kérlek, erősítsd meg az email címedet az alábbi linkre kattintva:

${verificationLink}

Ez a link 24 óráig érvényes.

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}

/**
 * Send password reset email
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param resetLink - Password reset link
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string
): Promise<void> {
  const subject = 'Jelszó visszaállítása'
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Jelszó visszaállítása</h1>
      <p>Szia ${name}!</p>
      <p>Jelszó visszaállítási kérést kaptunk a fiókodhoz. Ha nem te voltál, kérlek, hagyd figyelmen kívül ezt az emailt.</p>
      <p>A jelszavad visszaállításához kattints az alábbi gombra:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Jelszó visszaállítása</a>
      </p>
      <p style="color: #666; font-size: 14px;">Ha nem működik a gomb, másold be ezt a linket a böngésződbe:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Ez a link 24 óráig érvényes.</p>
      <p style="color: #dc2626; font-size: 14px; margin-top: 20px;"><strong>Biztonsági tipp:</strong> Ne oszd meg ezt a linket senkivel!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Jelszó visszaállítása

Szia ${name}!

Jelszó visszaállítási kérést kaptunk a fiókodhoz. A jelszavad visszaállításához kattints az alábbi linkre:

${resetLink}

Ez a link 24 óráig érvényes.

Ne oszd meg ezt a linket senkivel!

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}

/**
 * Send password changed confirmation email
 *
 * @param to - Recipient email address
 * @param name - User's name
 */
export async function sendPasswordChangedEmail(
  to: string,
  name: string
): Promise<void> {
  const subject = 'Jelszó megváltoztatva'
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Jelszó sikeresen megváltoztatva</h1>
      <p>Szia ${name}!</p>
      <p>Ez egy megerősítő email arról, hogy a jelszavad sikeresen megváltozott.</p>
      <p>Ha nem te voltál, aki megváltoztatta a jelszót, kérjük <strong>azonnal</strong> lépj kapcsolatba velünk a support@tinicoach.hu címen.</p>
      <p style="color: #16a34a; margin-top: 20px;">✓ A jelszó változtatás dátuma: ${new Date().toLocaleString('hu-HU')}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Jelszó sikeresen megváltoztatva

Szia ${name}!

Ez egy megerősítő email arról, hogy a jelszavad sikeresen megváltozott.

Ha nem te voltál, aki megváltoztatta a jelszót, kérjük azonnal lépj kapcsolatba velünk a support@tinicoach.hu címen.

A jelszó változtatás dátuma: ${new Date().toLocaleString('hu-HU')}

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}

/**
 * Send account deletion confirmation email
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param reactivationLink - Account reactivation link (valid for 30 days)
 */
export async function sendAccountDeletionEmail(
  to: string,
  name: string,
  reactivationLink: string
): Promise<void> {
  const subject = 'Fiók törölve'
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626;">Fiók törölve</h1>
      <p>Szia ${name}!</p>
      <p>Sajnáljuk, hogy távozol. A fiókod törlésre került.</p>
      <p><strong>Fontos információ:</strong> 30 napod van újraaktíválni a fiókodat, ha meggondolnád magad. Ez után az összes adatod véglegesen törlésre kerül.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${reactivationLink}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Fiók újraaktíválása</a>
      </p>
      <p style="color: #666; font-size: 14px;">Ha nem működik a gomb, másold be ezt a linket a böngésződbe:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${reactivationLink}</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Ez a link 30 napig érvényes.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Fiók törölve

Szia ${name}!

Sajnáljuk, hogy távozol. A fiókod törlésre került.

Fontos: 30 napod van újraaktíválni a fiókodat. Az alábbi linkre kattintva megteheted:

${reactivationLink}

Ez a link 30 napig érvényes.

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}

/**
 * Send unverified account reminder email
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param verificationLink - Email verification link
 * @param daysRemaining - Days remaining until account deletion
 */
export async function sendUnverifiedReminderEmail(
  to: string,
  name: string,
  verificationLink: string,
  daysRemaining: number
): Promise<void> {
  const subject = `Emlékeztető: Erősítsd meg az email címedet (${daysRemaining} nap van hátra)`
  const html = `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #ea580c;">Emlékeztető: Email cím megerősítése</h1>
      <p>Szia ${name}!</p>
      <p>Észrevettük, hogy még nem erősítetted meg az email címedet.</p>
      <p style="color: #dc2626; font-weight: bold;">Figyelem: ${daysRemaining} napod van hátra, hogy megerősítsd az email címedet, különben a fiókod automatikusan törlésre kerül.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Email cím megerősítése</a>
      </p>
      <p style="color: #666; font-size: 14px;">Ha nem működik a gomb, másold be ezt a linket a böngésződbe:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationLink}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} tinicoach. Minden jog fenntartva.</p>
    </body>
    </html>
  `
  const text = `Emlékeztető: Email cím megerősítése

Szia ${name}!

Észrevettük, hogy még nem erősítetted meg az email címedet.

Figyelem: ${daysRemaining} napod van hátra, hogy megerősítsd az email címedet, különben a fiókod automatikusan törlésre kerül.

Erősítsd meg az email címedet az alábbi linkre kattintva:

${verificationLink}

© ${new Date().getFullYear()} tinicoach`

  await sendEmail({ to, subject, html, text })
}
