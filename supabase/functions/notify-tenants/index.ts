import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Clé API Resend (à configurer dans les secrets Supabase)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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

    // 2. Initialisation du client Supabase en mode Service Role 
    // Cela permet de contourner le RLS pour lire tous les profils locataires
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Récupérer tous les emails des locataires
    const { data: tenants, error } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'tenant')
      .not('email', 'is', null)

    if (error) {
      throw error
    }

    if (!tenants || tenants.length === 0) {
      console.log("Aucun locataire trouvé avec un email.")
      return new Response("Aucun locataire à notifier", { status: 200 })
    }

    console.log(`Préparation de l'envoi à ${tenants.length} locataires.`)

    if (!RESEND_API_KEY) {
      console.error("Erreur de configuration : RESEND_API_KEY manquant")
      return new Response("Erreur de configuration serveur", { status: 500 })
    }

    // 4. Envoi des emails en masse (via Bcc) avec Resend
    const bccEmails = tenants.map(t => t.email).filter(Boolean)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'LOKI Notifications <onboarding@resend.dev>', // Modifie ceci avec ton domaine vérifié si tu en as un
        to: ['notifications@lokivoire.pro'], // Destinataire principal (fictif ou administratif)
        bcc: bccEmails, // Copie cachée pour tous les locataires
        subject: `Nouveau bien disponible sur LOKI : ${house.title}`,
        html: `
          <div style="font-family: sans-serif; max-w-md; margin: 0 auto; color: #333;">
            <h2 style="color: #ea580c;">Nouveau bien sur LOKI !</h2>
            <p>Bonjour,</p>
            <p>Un nouveau bien qui pourrait vous intéresser vient d'être publié par un propriétaire :</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #0f172a;">${house.title}</h3>
              <p><strong>Ville :</strong> ${house.city}</p>
              ${house.neighborhood ? `<p><strong>Quartier :</strong> ${house.neighborhood}</p>` : ''}
              <p><strong>Prix :</strong> ${house.price.toLocaleString()} FCFA</p>
            </div>
            <p>Connectez-vous vite sur la plateforme pour voir tous les détails, les photos, et contacter le propriétaire en premier !</p>
            <a href="https://lokivoire.pro/?view=dashboard" style="display: inline-block; margin-top: 10px; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir l'annonce</a>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
              Vous recevez cet email car vous êtes inscrit en tant que locataire sur LOKI.
            </p>
          </div>
        `
      })
    })

    const resData = await res.json()
    console.log("Réponse de Resend:", resData)

    return new Response(JSON.stringify({ success: true, message: "Notifications envoyées avec succès" }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})
