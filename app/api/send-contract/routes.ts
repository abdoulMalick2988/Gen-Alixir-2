import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, employeeName, jobTitle, contractType, companyName, pdfBase64 } = await req.json();

    const base64Data = pdfBase64.split(',')[1];

    const { data, error } = await resend.emails.send({
      from: 'ECODREUM <onboarding@resend.dev>',
      to: [to],
      subject: `Contrat de travail - ${employeeName} - ${companyName}`,
      html: `
        <h2>Contrat de travail</h2>
        <p>Bonjour ${employeeName},</p>
        <p>Veuillez trouver ci-joint votre contrat de travail (${contractType}) pour le poste de <strong>${jobTitle}</strong> chez <strong>${companyName}</strong>.</p>
        <p>Merci de le lire attentivement.</p>
        <br>
        <p>Cordialement,<br>${companyName}</p>
      `,
      attachments: [
        {
          filename: `Contrat_${employeeName.replace(/\s/g, '_')}.pdf`,
          content: base64Data,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Server error:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
