import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, employeeName, jobTitle, contractType, companyName, pdfBase64 } = body;

    // Convertir base64 en Buffer pour l'attachement
    const pdfBuffer = pdfBase64 ? Buffer.from(pdfBase64.split(',')[1], 'base64') : null;

    const { data, error } = await resend.emails.send({
      from: 'ECODREUM RH <onboarding@resend.dev>', // ⚠️ Utilisez ce domaine de test pour commencer
      to: [to],
      subject: `Contrat de travail - ${employeeName} - ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; background: #f9fafb; }
              .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .label { font-weight: bold; color: #6b7280; font-size: 14px; }
              .value { color: #111827; font-size: 14px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900;">📄 CONTRAT DE TRAVAIL</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">ECODREUM Intelligence • Plateforme RH</p>
            </div>
            
            <div class="content">
              <div class="card">
                <h2 style="margin-top: 0; color: #10b981;">Bonjour ${employeeName},</h2>
                <p>Veuillez trouver ci-joint votre contrat de travail généré automatiquement par la plateforme ECODREUM.</p>
                
                <div style="margin: 20px 0;">
                  <div class="info-row">
                    <span class="label">Entreprise</span>
                    <span class="value">${companyName}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Poste</span>
                    <span class="value">${jobTitle}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Type de contrat</span>
                    <span class="value">${contractType}</span>
                  </div>
                  <div class="info-row" style="border: none;">
                    <span class="label">Date d'envoi</span>
                    <span class="value">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <p style="margin-top: 30px;">
                  <strong>⚠️ Action requise :</strong> Veuillez consulter le document PDF ci-joint, le signer et le retourner à votre employeur.
                </p>
              </div>

              <div class="card" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">
                  <strong>📌 Important :</strong> Ce document est confidentiel. Ne le partagez avec personne d'autre que votre employeur. 
                  En cas de question, contactez directement le service RH de ${companyName}.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Ce message a été envoyé automatiquement par <strong>ECODREUM Intelligence</strong></p>
              <p style="margin: 5px 0 0 0; opacity: 0.7;">Plateforme de gestion des ressources humaines</p>
            </div>
          </body>
        </html>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `Contrat_${employeeName.replace(/\s/g, '_')}.pdf`,
          content: pdfBuffer,
        },
      ] : [],
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: error.message || 'Erreur inconnue' }, { status: 500 });
  }
}
