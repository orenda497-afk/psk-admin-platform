import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PAYBILL = '4563877'

serve(async (req) => {
  // Handle Safaricom STK Push callback
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      console.log('M-Pesa callback received:', JSON.stringify(body))

      const cb = body?.Body?.stkCallback
      if (!cb) return new Response('OK', { status: 200 })

      const resultCode = cb.ResultCode
      if (resultCode !== 0) {
        // Payment failed or cancelled
        console.log('Payment failed:', cb.ResultDesc)
        return new Response('OK', { status: 200 })
      }

      // Extract payment details
      const items = cb.CallbackMetadata?.Item || []
      const get = (name: string) => items.find((i: any) => i.Name === name)?.Value

      const amount     = get('Amount')
      const mpesaRef   = get('MpesaReceiptNumber')
      const phone      = get('PhoneNumber')?.toString() || ''
      const txDate     = get('TransactionDate')?.toString() || ''

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      // Check if already recorded
      const { data: existing } = await supabase
        .from('mpesa_transactions')
        .select('id')
        .eq('mpesa_ref', mpesaRef)
        .single()

      if (existing) return new Response('OK', { status: 200 })

      // Format phone for WhatsApp
      const phoneFmt = phone.startsWith('254') ? '+' + phone : phone

      // Insert M-Pesa transaction
      const { data: txn } = await supabase.from('mpesa_transactions').insert([{
        date: new Date().toISOString().split('T')[0],
        mpesa_ref: mpesaRef,
        type: 'Customer payment',
        amount: amount,
        phone: phoneFmt,
        name: 'M-Pesa Customer',
        matched: false,
        receipt_sent: false,
        branch: 'eldoret',
        notes: `Auto-captured via Daraja. Paybill: ${PAYBILL}. Date: ${txDate}`,
      }]).select().single()

      console.log('Transaction saved:', txn)

      // Try to auto-match to an unpaid invoice of the same amount
      const { data: invoices } = await supabase
        .from('psk_documents')
        .select('*')
        .eq('doc_type', 'invoice')
        .eq('status', 'draft')
        .eq('total', amount)
        .order('created_at', { ascending: false })
        .limit(1)

      if (invoices && invoices.length > 0 && txn) {
        const inv = invoices[0]
        // Auto-match
        await supabase.from('mpesa_transactions').update({
          matched: true,
          invoice_ref: inv.doc_ref,
          name: inv.client_name || 'M-Pesa Customer',
        }).eq('id', txn.id)

        // Mark invoice paid
        await supabase.from('psk_documents').update({
          status: 'paid',
          amount_paid: amount,
          balance: 0,
        }).eq('id', inv.id)

        // Auto-create receipt
        const rref = `PSK-REC-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`
        await supabase.from('psk_documents').insert([{
          doc_ref: rref,
          doc_type: 'receipt',
          branch: inv.branch || 'eldoret',
          client_id: inv.client_id,
          client_name: inv.client_name,
          client_phone: inv.client_phone || phoneFmt,
          issue_date: new Date().toISOString().split('T')[0],
          line_items: inv.line_items,
          subtotal: inv.subtotal,
          vat_rate: inv.vat_rate,
          vat_amount: inv.vat_amount,
          total: inv.total,
          amount_paid: amount,
          balance: 0,
          notes: `Payment received via M-Pesa. Ref: ${mpesaRef}. Paybill: ${PAYBILL}`,
          linked_doc_ref: inv.doc_ref,
          status: 'paid',
        }])

        await supabase.from('mpesa_transactions').update({ receipt_sent: true }).eq('id', txn.id)

        console.log(`Auto-matched to invoice ${inv.doc_ref}, receipt ${rref} created`)
      }

      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (err) {
      console.error('Error processing callback:', err)
      return new Response('OK', { status: 200 })
    }
  }

  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'PSK M-Pesa webhook active', paybill: PAYBILL }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response('Method not allowed', { status: 405 })
})
