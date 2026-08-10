import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PAYBILL = '4563877'

const OK = (extra: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted', ...extra }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })

/** Safaricom sends TransTime as YYYYMMDDHHmmss. Return YYYY-MM-DD. */
function safDate(raw?: string): string {
  const s = (raw || '').toString()
  if (s.length >= 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  return new Date().toISOString().split('T')[0]
}

function fmtPhone(raw?: string | number): string {
  const p = (raw ?? '').toString().trim()
  if (!p) return ''
  return p.startsWith('254') ? '+' + p : p
}

interface Payment {
  mpesaRef: string
  amount: number
  phone: string
  date: string
  payerName: string
  billRef: string
  source: 'c2b' | 'stk'
}

/** Normalise either payload shape into one Payment object. */
function parsePayment(body: any): Payment | null {
  // --- STK Push callback ---
  const cb = body?.Body?.stkCallback
  if (cb) {
    if (cb.ResultCode !== 0) {
      console.log('STK payment not successful:', cb.ResultDesc)
      return null
    }
    const items = cb.CallbackMetadata?.Item || []
    const get = (name: string) => items.find((i: any) => i.Name === name)?.Value
    const ref = get('MpesaReceiptNumber')
    if (!ref) return null
    return {
      mpesaRef: ref.toString(),
      amount: Number(get('Amount')) || 0,
      phone: fmtPhone(get('PhoneNumber')),
      date: safDate(get('TransactionDate')),
      payerName: 'M-Pesa Customer',
      billRef: '',
      source: 'stk',
    }
  }

  // --- C2B confirmation (customer pays the paybill directly) ---
  if (body?.TransID) {
    const name = [body.FirstName, body.MiddleName, body.LastName]
      .filter(Boolean).join(' ').trim()
    return {
      mpesaRef: body.TransID.toString(),
      amount: Number(body.TransAmount) || 0,
      phone: fmtPhone(body.MSISDN),
      date: safDate(body.TransTime),
      payerName: name || 'M-Pesa Customer',
      billRef: (body.BillRefNumber || '').toString().trim(),
      source: 'c2b',
    }
  }

  return null
}

serve(async (req) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'PSK M-Pesa webhook active', paybill: PAYBILL }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Always answer Safaricom with 200 - a non-200 makes them retry the same
  // payment repeatedly, and our own errors are not their problem.
  try {
    const body = await req.json()
    console.log('M-Pesa callback received:', JSON.stringify(body))

    // C2B validation URL, if Safaricom is configured to call it first.
    if (body?.TransactionType && !body?.TransID) return OK()

    const pay = parsePayment(body)
    if (!pay) return OK()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Idempotency - Safaricom retries, so never double-record a receipt.
    const { data: existing } = await supabase
      .from('mpesa_transactions')
      .select('id')
      .eq('mpesa_ref', pay.mpesaRef)
      .maybeSingle()

    if (existing) {
      console.log('Duplicate callback ignored:', pay.mpesaRef)
      return OK()
    }

    const { data: txn, error: txnErr } = await supabase
      .from('mpesa_transactions')
      .insert([{
        date: pay.date,
        mpesa_ref: pay.mpesaRef,
        type: 'Customer payment',
        amount: pay.amount,
        phone: pay.phone,
        name: pay.payerName,
        matched: false,
        receipt_sent: false,
        branch: 'eldoret',
        notes: `Auto-captured via Daraja (${pay.source.toUpperCase()}). Paybill: ${PAYBILL}.` +
          (pay.billRef ? ` Account: ${pay.billRef}` : ''),
      }])
      .select()
      .single()

    if (txnErr || !txn) {
      console.error('Failed to save transaction:', txnErr)
      return OK()
    }
    console.log('Transaction saved:', txn.id, pay.mpesaRef)

    // --- Try to match an unpaid invoice ---
    // First choice: the account number the customer typed is the invoice ref.
    let inv: any = null

    if (pay.billRef) {
      const { data } = await supabase
        .from('psk_documents')
        .select('*')
        .eq('doc_type', 'invoice')
        .neq('status', 'paid')
        .ilike('doc_ref', pay.billRef)
        .limit(1)
      if (data && data.length > 0) inv = data[0]
    }

    // Fallback: a single unpaid invoice for exactly this amount.
    // If two invoices share the amount we do NOT guess - leave it for
    // Miriam to match by hand on the recon screen.
    if (!inv) {
      const { data } = await supabase
        .from('psk_documents')
        .select('*')
        .eq('doc_type', 'invoice')
        .neq('status', 'paid')
        .eq('total', pay.amount)
        .limit(2)
      if (data && data.length === 1) inv = data[0]
      else if (data && data.length > 1) {
        console.log('Ambiguous amount match, leaving unmatched:', pay.amount)
      }
    }

    if (!inv) return OK()

    const paidToDate = Number(inv.amount_paid || 0) + pay.amount
    const balance = Math.max(Number(inv.total || 0) - paidToDate, 0)
    const fullySettled = balance <= 0

    await supabase.from('mpesa_transactions').update({
      matched: true,
      invoice_ref: inv.doc_ref,
      name: inv.client_name || pay.payerName,
    }).eq('id', txn.id)

    await supabase.from('psk_documents').update({
      status: fullySettled ? 'paid' : 'partial',
      amount_paid: paidToDate,
      balance,
    }).eq('id', inv.id)

    // Only cut a receipt once the invoice is actually settled in full.
    if (fullySettled) {
      const rref = `PSK-REC-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`
      await supabase.from('psk_documents').insert([{
        doc_ref: rref,
        doc_type: 'receipt',
        branch: inv.branch || 'eldoret',
        client_id: inv.client_id,
        client_name: inv.client_name,
        client_phone: inv.client_phone || pay.phone,
        issue_date: pay.date,
        line_items: inv.line_items,
        subtotal: inv.subtotal,
        vat_rate: inv.vat_rate,
        vat_amount: inv.vat_amount,
        total: inv.total,
        amount_paid: paidToDate,
        balance: 0,
        notes: `Payment received via M-Pesa. Ref: ${pay.mpesaRef}. Paybill: ${PAYBILL}`,
        linked_doc_ref: inv.doc_ref,
        status: 'paid',
      }])

      await supabase.from('mpesa_transactions')
        .update({ receipt_sent: true })
        .eq('id', txn.id)

      console.log(`Matched invoice ${inv.doc_ref}, receipt ${rref} created`)
    } else {
      console.log(`Part payment on ${inv.doc_ref}, balance ${balance}`)
    }

    return OK()
  } catch (err) {
    console.error('Error processing callback:', err)
    return OK()
  }
})
