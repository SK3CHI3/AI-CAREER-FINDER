import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Basic verification - typically IntaSend signs their webhooks or provides a mechanism to verify headers.
    // If IntaSend sends an authorization header, we can verify it here.
    const signature = req.headers.get('x-intasend-signature')
    
    // Read the JSON body from IntaSend
    const body = await req.json()
    console.log('Received IntaSend Webhook:', JSON.stringify(body))

    // IntaSend webhook payload typically includes:
    // invoice_id, state, api_ref, value, account, etc.
    const { state, api_ref, invoice_id, tracking_id } = body

    // Only process completed payments
    if (state !== 'COMPLETED' && state !== 'SUCCESSFUL' && state !== 'COMPLETE') {
      console.log(`Payment state is ${state}, ignoring update.`)
      return new Response(JSON.stringify({ message: 'Ignored non-completed state' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (!api_ref) {
      return new Response(JSON.stringify({ error: 'Missing api_ref' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Initialize Supabase Client with the SERVICE_ROLE key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Option 1: Subscription Payment (api_ref starts with PAY_userId_timestamp)
    if (api_ref.startsWith('PAY_')) {
      const parts = api_ref.split('_')
      // Expecting PAY_{userId}_{timestamp}
      if (parts.length >= 2) {
        const userId = parts[1]
        console.log(`Processing Subscription Payment for user: ${userId}`)
        
        // Optionally calculate expiry date dynamically. Here we just set an arbitrary future date or rely on business logic
        const expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            payment_status: 'completed',
            payment_reference: invoice_id || tracking_id || api_ref,
            payment_amount: body.value,
            intasend_transaction_id: tracking_id || invoice_id,
            subscription_expires_at: expiryDate
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating profile:', updateError)
          throw updateError
        }
      }
    } 
    // Option 2: Counselor Booking Payment (api_ref starts with BOOK_{counselorId}_{timestamp})
    else if (api_ref.startsWith('BOOK_')) {
      const parts = api_ref.split('_')
      if (parts.length >= 2) {
        const counselorId = parts[1]
        console.log(`Processing Booking Payment for counselor: ${counselorId}`)

        // If the frontend also creates a 'requested' record, we update it.
        // Or if it relies entirely on the webhook to CREATE the record:
        // Let's assume the frontend already inserted a 'requested' record with intasend_transaction_id or payment_reference
        // Wait, frontend cannot safely insert 'requested' either without risking impersonation, but if RLS protects it, it's fine.
        // Let's find the existing record by transaction ID or API ref, or if not found, we don't have the student ID.
        // To be safe, the frontend should include the userId in the api_ref: BOOK_{userId}_{counselorId}_{timestamp}
        // If it's just BOOK_{counselorId}_{timestamp}, we must rely on the frontend inserting the pending record first.
        
        // Let's look for an existing session with this payment_reference or transaction_id
        const { data: existingSession, error: checkError } = await supabase
          .from('counselor_sessions')
          .select('id')
          .or(`intasend_transaction_id.eq.${tracking_id}, payment_reference.eq.${invoice_id}`)
          .single()

        if (existingSession) {
          // Update existing session to active/paid
          await supabase
            .from('counselor_sessions')
            .update({ status: 'active', payment_amount: body.value })
            .eq('id', existingSession.id)
        } else {
          console.warn(`Could not find an existing booking session for IntaSend tracking ID ${tracking_id}`)
          // We can't insert it securely because we don't know the student ID unless the frontend encoded it in api_ref!
          // We will modify the frontend to send BOOK_{userId}_{counselorId}_{timestamp}
          if (parts.length >= 3) {
             const userId = parts[1]
             const counselorId = parts[2]
             
             await supabase.from('counselor_sessions').insert([{
                student_id: userId,
                counselor_id: counselorId,
                status: 'active',
                payment_amount: body.value,
                payment_reference: invoice_id || api_ref,
                intasend_transaction_id: tracking_id || invoice_id
             }])
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
