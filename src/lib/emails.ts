import { Resend } from 'resend'
import { Appointment } from './supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Serenity Spa <noreply@rocketmedia.website>'

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
}

export async function sendConfirmationEmail(apt: Appointment) {
  await resend.emails.send({
    from: FROM,
    to: apt.client_email,
    subject: `Reserva confirmada — ${apt.service}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#fafaf8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <!-- Header -->
              <tr>
                <td style="background:#1c1917;padding:40px;text-align:center;">
                  <div style="width:56px;height:56px;background:#f59e0b;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                    <span style="font-size:28px;">✨</span>
                  </div>
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Serenity Spa & Masajes</h1>
                  <p style="color:#a8a29e;margin:8px 0 0;font-size:14px;">Tu reserva está confirmada</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#44403c;font-size:16px;margin:0 0 24px;">Hola <strong>${apt.client_name}</strong>,</p>
                  <p style="color:#78716c;font-size:15px;margin:0 0 32px;line-height:1.6;">
                    Tu sesión ha sido reservada con éxito. Te esperamos con mucho gusto.
                  </p>
                  <!-- Details box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;overflow:hidden;">
                    <tr><td style="padding:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;">
                            <span style="color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Servicio</span>
                          </td>
                          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;text-align:right;">
                            <span style="color:#1c1917;font-size:14px;font-weight:600;">${apt.service}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;">
                            <span style="color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Fecha</span>
                          </td>
                          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;text-align:right;">
                            <span style="color:#1c1917;font-size:14px;font-weight:600;">${formatDate(apt.date)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            <span style="color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Hora</span>
                          </td>
                          <td style="padding:8px 0;text-align:right;">
                            <span style="color:#1c1917;font-size:14px;font-weight:600;">${apt.time} hs</span>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                  <p style="color:#a8a29e;font-size:13px;margin:32px 0 0;text-align:center;">
                    Lunes a Sábado · 9 a 18 hs · Mallorca 1020, Barcelona
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f5f5f4;padding:20px 40px;text-align:center;">
                  <p style="color:#a8a29e;font-size:12px;margin:0;">
                    Si necesitas cancelar o modificar tu reserva, contáctanos con al menos 24 horas de anticipación.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}

export async function sendDailySummaryEmail(date: string, appointments: Appointment[]) {
  const adminEmail = process.env.ADMIN_EMAIL!
  const dateFormatted = formatDate(date)

  const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']
  const booked = appointments.map((a) => a.time)
  const free = TIME_SLOTS.filter((t) => !booked.includes(t))

  const aptRows = TIME_SLOTS.map((time) => {
    const apt = appointments.find((a) => a.time === time)
    if (apt) {
      return `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #fef3c7;font-weight:600;color:#1c1917;font-size:14px;">${time}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #fef3c7;color:#1c1917;font-size:14px;">${apt.client_name}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #fef3c7;color:#78716c;font-size:13px;">${apt.service}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #fef3c7;color:#78716c;font-size:13px;">${apt.client_phone}</td>
        </tr>`
    }
    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f5f5f4;color:#a8a29e;font-size:14px;">${time}</td>
        <td colspan="3" style="padding:10px 16px;border-bottom:1px solid #f5f5f4;color:#d6d3d1;font-size:13px;font-style:italic;">Disponible</td>
      </tr>`
  }).join('')

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Agenda del ${dateFormatted} — ${appointments.length} citas`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#fafaf8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr>
                <td style="background:#1c1917;padding:32px 40px;">
                  <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Serenity Spa — Agenda del día</h1>
                  <p style="color:#f59e0b;margin:8px 0 0;font-size:15px;text-transform:capitalize;">${dateFormatted}</p>
                </td>
              </tr>
              <!-- Stats -->
              <tr>
                <td style="padding:24px 40px;background:#fffbeb;border-bottom:1px solid #fde68a;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:#1c1917;">${appointments.length}</div>
                        <div style="font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Citas</div>
                      </td>
                      <td style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:#1c1917;">${free.length}</div>
                        <div style="font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Disponibles</div>
                      </td>
                      <td style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:#1c1917;">${TIME_SLOTS.length}</div>
                        <div style="font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Total horarios</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Table -->
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr style="background:#f5f5f4;">
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Hora</td>
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Cliente</td>
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Servicio</td>
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">Teléfono</td>
                    </tr>
                    ${aptRows}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background:#f5f5f4;padding:20px 40px;text-align:center;">
                  <p style="color:#a8a29e;font-size:12px;margin:0;">Serenity Spa & Masajes · Resumen automático</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}
