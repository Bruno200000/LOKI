import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

// Directive pour aider l'éditeur avec les types Deno
// @deno-types="https://deno.land/x/servest@v1.3.1/types/index.d.ts"

serve(async (req) => {
  try {
    // 1. Récupération et validation du payload envoyé par le Webhook Supabase
    const payload = await req.json()
    console.log("Webhook payload received:", payload)

    // Vérifier s'il s'agit bien d'une insertion (nouveau bien)
    if (payload.type !== 'INSERT' || payload.table !== 'houses') {
      return new Response("Action ignorée : ce n'est pas une insertion de maison", { status: 200 })
    }

    const house = payload.record

    // 2. Initialisation du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error("Variables d'environnement manquantes")
      return new Response("Configuration serveur incomplète", { status: 500 })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Récupérer tous les emails des locataires
    const { data: tenants, error: tenantError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'tenant')
      .not('email', 'is', null)

    if (tenantError) throw tenantError

    if (!tenants || tenants.length === 0) {
      console.log("Aucun locataire trouvé avec un email.")
      return new Response("Aucun locataire à notifier", { status: 200 })
    }

    // 4. Préparation du contenu de l'email
    const bccEmails = tenants.map(t => t.email).filter(Boolean) as string[]
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(house.price)

    console.log(`Envoi de notifications à ${bccEmails.length} locataires.`)

    // 5. Envoi via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'LOKI Notifications <onboarding@resend.dev>',
        to: ['notifications@lokivoire.pro'],
        bcc: bccEmails,
        subject: `Nouveau bien disponible sur LOKI : ${house.title}`,
        html: `
          <div style="font-family: sans-serif; max-w-md; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #ea580c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">LOKI</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Un nouveau bien vient d'être publié !</h2>
              <p>Bonjour,</p>
              <p>Une nouvelle opportunité vient d'être ajoutée sur la plateforme :</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
                <h3 style="margin-top: 0; color: #ea580c;">${house.title}</h3>
                <p style="margin: 5px 0;"><strong>📍 Ville :</strong> ${house.city}</p>
                ${house.neighborhood ? `<p style="margin: 5px 0;"><strong>🏡 Quartier :</strong> ${house.neighborhood}</p>` : ''}
                <p style="margin: 5px 0;"><strong>💰 Prix :</strong> ${formattedPrice} FCFA</p>
              </div>

              <p>Ne tardez pas à consulter l'annonce et à contacter le propriétaire.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://lokivoire.pro/?view=dashboard" 
                   style="display: inline-block; padding: 14px 28px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                   Voir l'annonce sur LOKI
                </a>
              </div>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
              Vous recevez cette notification automatique car vous êtes inscrit comme locataire sur LOKI.
            </p>
          </div>
        `
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Erreur Resend: ${errorText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })

  } catch (error) {
    console.error("Erreur Notification:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    })
  }
})
