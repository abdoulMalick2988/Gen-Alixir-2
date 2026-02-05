import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    console.log('🔵 API /send-contract appelée');
    
    const body = await request.json();
    const { to, employeeName, jobTitle, contractType, companyName, pdfBase64 } = body;

    if (!to || !pdfBase64) {
      return NextResponse.json({ error: 'Email ou PDF manquant' }, { status: 400 });
    }

    console.log('📧 Destinataire:', to);
    console.log('📄 Taille PDF Base64:', pdfBase64.length);

    // Convertir le PDF base64 en buffer
    // Le format est: "data:application/pdf;base64,XXXXXX"
    const base64Data = pdfBase64.split(',')[1] || pdfBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('✅ Buffer créé, taille:', buffer.length, 'bytes');

    const { data, error } = await resend.emails.send({
      from: 'ECODREUM RH <onboarding@resend.dev>',
      to: [to],
      subject: `Contrat de travail - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              ECODREUM Intelligence
            </h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">
              Département Ressources Humaines
            </p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Votre Contrat de Travail</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Bonjour <strong>${employeeName}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Veuillez trouver ci-joint votre contrat de travail pour le poste de <strong>${jobTitle}</strong> au sein de <strong>${companyName}</strong>.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Type de contrat :</strong> ${contractType}</p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Entreprise :</strong> ${companyName}</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              📎 Le contrat est joint à cet email au format PDF.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Merci de lire attentivement ce document, de le signer et de nous le retourner dans les meilleurs délais.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Cordialement,<br>
              <strong>L'équipe ECODREUM</strong>
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 10px; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Cet email a été généré automatiquement par la plateforme ECODREUM Intelligence.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              Pour toute question, contactez votre service RH.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `CONTRAT_${employeeName.replace(/\s/g, '_')}.pdf`,
          content: buffer,
        }
      ]
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Email envoyé avec succès');
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur',
      details: error.toString()
    }, { status: 500 });
  }
}
