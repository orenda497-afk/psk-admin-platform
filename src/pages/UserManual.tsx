import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const gl = {
  panel: { background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'14px', backdropFilter:'blur(14px)' } as React.CSSProperties,
}

const SECTIONS = [
  { id:'welcome',    emoji:'👋', label:'Welcome' },
  { id:'login',      emoji:'🔐', label:'Logging In' },
  { id:'home',       emoji:'🏠', label:'Home Screen' },
  { id:'bookings',   emoji:'📅', label:'Bookings' },
  { id:'clients',    emoji:'👥', label:'Clients' },
  { id:'fleet',      emoji:'🚗', label:'PSK Fleet' },
  { id:'documents',  emoji:'📄', label:'Documents' },
  { id:'handover',   emoji:'📷', label:'Handover Checklists' },
  { id:'agreements', emoji:'📋', label:'Rental Agreements' },
  { id:'reminders',  emoji:'🔔', label:'Reminders' },
  { id:'partners',   emoji:'🤝', label:'Partners & Drivers' },
  { id:'finance',    emoji:'💰', label:'Finance (Ken & Miriam)' },
  { id:'tips',       emoji:'💡', label:'Tips & Troubleshooting' },
]

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div style={{ display:'flex', gap:'16px', marginBottom:'24px' }}>
    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,215,0,0.15)', border:'2px solid rgba(255,215,0,0.40)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'rgba(255,215,0,0.90)', flexShrink:0, marginTop:'2px' }}>{n}</div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'6px' }}>{title}</div>
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:'1.8' }}>{children}</div>
    </div>
  </div>
)

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.20)', borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', fontSize:'12px', color:'rgba(255,215,0,0.80)', lineHeight:'1.7' }}>
    💡 {children}
  </div>
)

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background:'rgba(239,154,154,0.07)', border:'1px solid rgba(239,154,154,0.22)', borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', fontSize:'12px', color:'rgba(239,154,154,0.85)', lineHeight:'1.7' }}>
    ⚠️ {children}
  </div>
)

const Good = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background:'rgba(129,199,132,0.07)', border:'1px solid rgba(129,199,132,0.22)', borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', fontSize:'12px', color:'rgba(129,199,132,0.85)', lineHeight:'1.7' }}>
    ✅ {children}
  </div>
)

const Screen = ({ title, color='rgba(255,215,0,0.80)', children }: { title:string; color?:string; children:React.ReactNode }) => (
  <div style={{ background:'rgba(6,14,24,0.80)', border:'1.5px solid rgba(255,255,255,0.10)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px' }}>
    <div style={{ background:'rgba(255,255,255,0.04)', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', fontSize:'12px', fontWeight:600, color }}>
      📺 {title}
    </div>
    <div style={{ padding:'16px' }}>{children}</div>
  </div>
)

const Badge = ({ label, color }: { label:string; color:string }) => (
  <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:`${color}18`, border:`1px solid ${color}40`, color, marginLeft:'6px' }}>{label}</span>
)

export default function UserManual() {
  const navigate = useNavigate()
  const [active, setActive] = useState('welcome')

  const content: Record<string, React.ReactNode> = {

    welcome: (
      <div>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <img src="/branding/psk-logo.png" alt="PSK" style={{ width:'80px', height:'80px', borderRadius:'50%', border:'3px solid rgba(255,215,0,0.40)', marginBottom:'16px' }} />
          <div style={{ fontSize:'28px', fontWeight:800, color:'rgba(255,255,255,0.95)', marginBottom:'8px' }}>PSK Safaris Admin Platform</div>
          <div style={{ fontSize:'15px', color:'rgba(255,215,0,0.70)', marginBottom:'16px' }}>Staff User Manual — August 2026</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.40)', maxWidth:'500px', margin:'0 auto', lineHeight:'1.8' }}>
            Welcome to the PSK Safaris Admin Platform. This manual will guide you through every feature of the system. Read your relevant sections and refer back anytime you need help.
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginBottom:'28px' }}>
          {[
            { emoji:'📅', title:'Bookings', desc:'Create and manage all vehicle bookings, track status, assign drivers' },
            { emoji:'👥', title:'Clients', desc:'Register individual, corporate, agency and government clients' },
            { emoji:'🚗', title:'Fleet', desc:'Track all PSK vehicles, maintenance, fuel and compliance documents' },
            { emoji:'📄', title:'Documents', desc:'Create invoices, quotations, receipts, credit and debit notes' },
            { emoji:'📷', title:'Handover Checklists', desc:'Check-out and check-in vehicles with photos and condition reports' },
            { emoji:'💰', title:'Finance', desc:'M-Pesa reconciliation, expenses, P&L and owner payouts' },
          ].map((f,i)=>(
            <div key={i} style={{ ...gl.panel, padding:'16px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <div style={{ fontSize:'24px', flexShrink:0 }}>{f.emoji}</div>
              <div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'4px' }}>{f.title}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', lineHeight:'1.6' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...gl.panel, padding:'20px', marginBottom:'20px' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'14px' }}>👤 Who has access to what?</div>
          {[
            { name:'Ken Mulanya',    role:'Owner',              badge:'rgba(255,215,0,0.90)',  access:'Full access to everything including Finance and Owner Payouts' },
            { name:'Miriam Wanjiku', role:'Finance Manager',    badge:'rgba(100,181,246,0.90)',access:'Full access to Finance (except Owner Payouts), all operational screens' },
            { name:'Faith',          role:'Kisumu Manager',     badge:'rgba(129,199,132,0.90)',access:'All operational screens — Registry, Bookings, Clients, Fleet, Documents' },
            { name:'Evans & Brenda', role:'Operations',         badge:'rgba(206,147,216,0.90)',access:'All operational screens — Registry, Bookings, Clients, Fleet, Documents' },
            { name:'Interns',        role:'Intern (shared)',    badge:'rgba(150,150,150,0.70)',access:'All operational screens — same as Evans and Brenda' },
          ].map((u,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:i<4?'1px solid rgba(255,255,255,0.06)':'none' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)', width:'140px', flexShrink:0 }}>{u.name}</div>
              <Badge label={u.role} color={u.badge} />
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)', flex:1 }}>{u.access}</div>
            </div>
          ))}
        </div>

        <Tip>Use the left sidebar to navigate between sections. Click any category to expand its menu items.</Tip>
        <Good>The platform works on both desktop and mobile. For the best experience use Chrome or Safari.</Good>
      </div>
    ),

    login: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>🔐 Logging In</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>How to access the platform and set up your account</div>

        <Screen title="Login Screen — admin.psksafariskenya.com">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.8px' }}>Your login details</div>
              {[
                { label:'Email', value:'yourname@psksafaris.com' },
                { label:'Password', value:'Provided by Kevin (change on first login)' },
              ].map((r,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.40)' }}>{r.label}</span>
                  <span style={{ fontSize:'12px', color:'rgba(255,215,0,0.75)', fontFamily:'monospace' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:'8px', padding:'14px', fontSize:'12px', color:'rgba(255,215,0,0.70)', lineHeight:'1.8' }}>
              🌐 Platform URL:<br/>
              <strong style={{ color:'rgba(255,215,0,0.90)' }}>admin.psksafariskenya.com</strong><br/>
              Save this in your browser favourites.
            </div>
          </div>
        </Screen>

        <Step n={1} title="Go to the platform URL">
          Open your browser (Chrome recommended) and type <strong style={{ color:'rgba(255,215,0,0.80)' }}>admin.psksafariskenya.com</strong>. You will see the PSK Safaris login screen with the acacia tree logo.
        </Step>
        <Step n={2} title="Enter your email and password">
          Type your work email (e.g. <strong style={{ color:'rgba(100,181,246,0.80)' }}>ken@psksafaris.com</strong>) and the password Kevin provided you. Click <strong>Sign In</strong>.
        </Step>
        <Step n={3} title="Set your personal password (first login only)">
          On your very first login, the system will ask you to set your own personal password. Type a password you will remember (at least 6 characters), confirm it, and click <strong>Set my password</strong>. You can also click <em>Skip for now</em> if you prefer to do it later.
        </Step>
        <Step n={4} title="Add a backup email (recommended)">
          After setting your password, the system will ask for a backup email. This is your personal email (e.g. Gmail) — NOT your PSK work email. If you ever forget your password, this is how Kevin can help reset it. Click <strong>Save backup email</strong> or <em>Skip</em>.
        </Step>

        <Tip>If you forget your password, click <strong>"Forgot password?"</strong> on the login screen, enter your work email, and follow the instructions.</Tip>
        <Warning>Never share your password with anyone — not even other PSK staff. Each person has their own login.</Warning>

        <div style={{ ...gl.panel, padding:'16px', marginTop:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.80)', marginBottom:'12px' }}>🔑 Finance PIN (Ken & Miriam only)</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.8' }}>
            The Finance section has an extra layer of security — a PIN pad. When you click Finance in the sidebar for the first time, you will see a number keypad.<br/><br/>
            • <strong style={{ color:'rgba(255,215,0,0.80)' }}>Ken:</strong> 4-digit PIN (provided by Kevin)<br/>
            • <strong style={{ color:'rgba(100,181,246,0.80)' }}>Miriam:</strong> 6-digit PIN (provided by Kevin)<br/><br/>
            After entering the correct PIN the first time, you will be given the option to change it to your own personal PIN. Once unlocked, Finance stays open until you log out.
          </div>
        </div>
      </div>
    ),

    home: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>🏠 Home Screen</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Your dashboard overview — the first thing you see after logging in</div>

        <Screen title="Home Screen Overview">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'12px' }}>
            {[
              { label:'Available vehicles', color:'rgba(129,199,132,0.80)' },
              { label:'Out on hire',        color:'rgba(100,181,246,0.80)' },
              { label:'In service',         color:'rgba(255,183,77,0.80)' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:800, color:s.color }}>—</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px' }}>
            {['📅 Pickups today','🔄 Returns today','📄 Quotes pending','📱 Unmatched M-Pesa','🔔 Reminders'].map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'7px', padding:'8px', textAlign:'center', fontSize:'10px', color:'rgba(255,255,255,0.45)' }}>{s}</div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'14px' }}>What you can see on the Home screen:</div>
        {[
          { emoji:'🚗', title:'Fleet status strip', desc:'Shows how many vehicles are available, out on hire, or in service — updated in real time.' },
          { emoji:'📊', title:'Stats strip', desc:'Pickups today, returns expected today, pending quotes, unmatched M-Pesa payments and open reminders.' },
          { emoji:'📦', title:'6 category cards', desc:'Quick links to Operations, Clients, Fleet, Partners, Finance and Intelligence. Click any card to go directly to that section.' },
          { emoji:'🔔', title:'Top bar — New Booking', desc:'The golden "+ New booking" button at the top right opens the booking form from any screen.' },
          { emoji:'🦁', title:'Leopard mascot', desc:'The animated leopard on the right is purely decorative — a signature of the PSK platform.' },
        ].map((f,i)=>(
          <div key={i} style={{ display:'flex', gap:'12px', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'20px', flexShrink:0 }}>{f.emoji}</div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:'3px' }}>{f.title}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.6' }}>{f.desc}</div>
            </div>
          </div>
        ))}

        <Tip>The numbers on the Home screen update automatically whenever anyone on the team makes a change — no need to refresh the page.</Tip>
      </div>
    ),

    bookings: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>📅 Bookings</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Creating, managing and tracking all vehicle bookings</div>

        <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,215,0,0.80)', marginBottom:'16px' }}>How to create a new booking</div>
        <Step n={1} title="Open the booking form">
          Go to <strong>Operations → Bookings</strong> in the sidebar, or click the golden <strong>+ New booking</strong> button in the top right corner from any screen.
        </Step>
        <Step n={2} title="Select the branch">
          Choose <strong>Eldoret HQ</strong> or <strong>Kisumu Branch</strong> depending on where the booking originates.
        </Step>
        <Step n={3} title="Select the client">
          Click the Client dropdown and choose the client from the list. If the client is new, add them in <strong>Clients</strong> first, then come back to create the booking.
        </Step>
        <Step n={4} title="Select the vehicle">
          Only <strong>available vehicles</strong> appear in this list. If a vehicle is not showing, it may be out on hire or in service — check the Registry Board.
        </Step>
        <Step n={5} title="Choose trip type and rate band">
          Select the trip type (Chauffeur, Safari, Self-drive, Airport). Then choose the rate band — Driver only, With fuel up to 100km, or With fuel up to 300km. The estimated amount will appear automatically based on the PSK ratecard.
        </Step>
        <Step n={6} title="Set pickup and return dates">
          Select the pickup date, time, return date and time. Also enter the pickup location and dropoff location if applicable.
        </Step>
        <Step n={7} title="Assign a driver (optional)">
          Select a driver from the dropdown. Only available drivers appear. You can assign a driver later if not yet confirmed.
        </Step>
        <Step n={8} title="Add overnight driver if needed">
          Toggle <strong>Overnight driver? Yes</strong> and enter the number of nights. This adds the overnight allowance (KES 2,500 per night) to the total.
        </Step>
        <Step n={9} title="Confirm the booking">
          Click <strong>Confirm Booking</strong>. The booking is saved with a reference number (e.g. BK-2026-1234) and status <em>Confirmed</em>.
        </Step>

        <Screen title="Booking Status Flow">
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', justifyContent:'center', padding:'8px 0' }}>
            {[
              { s:'Confirmed', c:'rgba(129,199,132,0.90)' },
              { s:'→', c:'rgba(255,255,255,0.20)' },
              { s:'Active', c:'rgba(100,181,246,0.90)' },
              { s:'→', c:'rgba(255,255,255,0.20)' },
              { s:'Completed', c:'rgba(255,255,255,0.50)' },
            ].map((x,i)=>(
              <span key={i} style={{ fontSize:x.s==='→'?'16px':'11px', fontWeight:x.s==='→'?400:600, color:x.c, padding:x.s==='→'?'0':'3px 10px', borderRadius:'20px', background:x.s==='→'?'transparent':'rgba(255,255,255,0.06)' }}>{x.s}</span>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>Managing existing bookings</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'1.9', marginBottom:'16px' }}>
          Click any booking row to open the detail slide-over panel on the right. From there you can:<br/>
          ▶ <strong style={{ color:'rgba(100,181,246,0.80)' }}>Mark active</strong> — vehicle goes out, status updates automatically<br/>
          ✓ <strong style={{ color:'rgba(129,199,132,0.80)' }}>Mark returned</strong> — vehicle comes back, status resets to available<br/>
          🧾 <strong style={{ color:'rgba(255,215,0,0.80)' }}>Create invoice</strong> — opens Finance Documents with client pre-filled<br/>
          📱 <strong style={{ color:'rgba(37,211,102,0.80)' }}>WhatsApp client</strong> — sends booking confirmation to client<br/>
          ✕ <strong style={{ color:'rgba(239,154,154,0.75)' }}>Cancel</strong> — cancels booking and frees the vehicle
        </div>

        <Tip>Always mark a booking as <strong>Active</strong> when the vehicle leaves and <strong>Returned</strong> when it comes back. This keeps the fleet status accurate for everyone.</Tip>
        <Warning>Only vehicles with status <strong>Available</strong> appear in the booking form. If you cannot find a vehicle, check its current status in PSK Fleet.</Warning>
      </div>
    ),

    clients: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>👥 Clients</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Registering and managing all client types</div>

        <Screen title="Four Client Types">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
            {[
              { type:'Individual', emoji:'👤', c:'rgba(129,199,132,0.90)', desc:'Walk-in clients, personal travel' },
              { type:'Corporate',  emoji:'🏢', c:'rgba(100,181,246,0.90)', desc:'Company accounts, LPOs' },
              { type:'Agency',     emoji:'🤝', c:'rgba(206,147,216,0.90)', desc:'Tour operators, travel agents' },
              { type:'Government', emoji:'🏛️', c:'rgba(255,183,77,0.90)',  desc:'Government ministries' },
            ].map((t,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'9px', padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:'24px', marginBottom:'6px' }}>{t.emoji}</div>
                <div style={{ fontSize:'12px', fontWeight:600, color:t.c, marginBottom:'4px' }}>{t.type}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>How to register a new client</div>
        <Step n={1} title="Go to Clients and select the tab">
          In the sidebar click <strong>Clients</strong> then choose the right tab — Individual, Corporate, Agency, or Government.
        </Step>
        <Step n={2} title="Click + New client">
          The form opens. Each client type has different fields. Select the correct type at the top of the form.
        </Step>
        <Step n={3} title="Fill in the details">
          <strong>Individual:</strong> Name, phone, email, ID type and number, ID photo (take with camera or upload).<br/>
          <strong>Corporate/Agency:</strong> Company name, phone, KRA PIN, contact person name and title, credit limit, payment terms.<br/>
          <strong>Government:</strong> Ministry name, contact person, KRA PIN, phone.
        </Step>
        <Step n={4} title="Take or upload an ID photo (Individual clients)">
          Tap 📷 <strong>Take photo</strong> to use your phone camera, or 📁 <strong>Upload file</strong> to select from your gallery or files.
        </Step>
        <Step n={5} title="Save the client">
          Click <strong>Save Client</strong>. The client is now in the system and can be selected when creating bookings.
        </Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'20px' }}>From a client profile you can:</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0' }}>
          📱 <strong style={{ color:'rgba(37,211,102,0.80)' }}>WhatsApp</strong> — opens WhatsApp with client number pre-loaded<br/>
          ✉️ <strong style={{ color:'rgba(100,181,246,0.80)' }}>Email</strong> — opens your email with client address pre-loaded<br/>
          📞 <strong style={{ color:'rgba(129,199,132,0.80)' }}>Call</strong> — dials the client directly<br/>
          🖨 <strong style={{ color:'rgba(255,215,0,0.80)' }}>Print profile</strong> — prints a PSK-branded client profile document<br/>
          + <strong style={{ color:'rgba(255,215,0,0.80)' }}>New booking</strong> — goes straight to booking form with client pre-selected<br/>
          📄 <strong style={{ color:'rgba(255,215,0,0.80)' }}>New quote / Invoice</strong> — opens document form with client pre-filled
        </div>
      </div>
    ),

    fleet: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>🚗 PSK Fleet</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Managing vehicles, maintenance, fuel and compliance</div>

        <Screen title="Four Fleet Tabs">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
            {[
              { tab:'Vehicles',    emoji:'🚗', desc:'All fleet vehicles and their status' },
              { tab:'Maintenance', emoji:'🔧', desc:'Service history and upcoming services' },
              { tab:'Fuel Log',    emoji:'⛽', desc:'All refuels and consumption tracking' },
              { tab:'Compliance',  emoji:'📅', desc:'Insurance, NTSA and document expiry' },
            ].map((t,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'9px', padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:'22px', marginBottom:'5px' }}>{t.emoji}</div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,215,0,0.80)', marginBottom:'3px' }}>{t.tab}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>Vehicle status colours</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginBottom:'20px' }}>
          {[
            { s:'Available',    c:'rgba(129,199,132,0.90)', desc:'Vehicle is ready to be booked' },
            { s:'Out on hire',  c:'rgba(100,181,246,0.90)', desc:'Vehicle is currently with a client' },
            { s:'In service',   c:'rgba(255,183,77,0.90)',  desc:'Vehicle is at the garage' },
            { s:'Grounded',     c:'rgba(150,150,150,0.85)', desc:'Vehicle is off the road' },
          ].map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'9px' }}>
              <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:s.c, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:'12px', fontWeight:600, color:s.c }}>{s.s}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>Document expiry dots</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0', marginBottom:'16px' }}>
          Each vehicle shows coloured dots for Insurance and NTSA Inspection dates:<br/>
          🟢 <strong>Green</strong> — more than 60 days remaining<br/>
          🟡 <strong>Amber</strong> — 31 to 60 days remaining — renew soon<br/>
          🔴 <strong>Red</strong> — 30 days or less, or already expired — urgent action needed
        </div>

        <Step n={1} title="Log a service (Maintenance tab)">
          Click <strong>🔧 Log service</strong>. Select the vehicle, service type (Routine, Oil change, Tyres, etc.), date, odometer reading, and garage name. Upload the receipt if available. Click <strong>Save Service Record</strong>.
        </Step>
        <Step n={2} title="Log a fuel refuel (Fuel Log tab)">
          Click <strong>⛽ Log fuel</strong>. Select the vehicle and driver, enter the date, litres, amount in KES, odometer reading and petrol station name. The system automatically calculates KES per 100km. Upload receipt if available.
        </Step>

        <Warning>If a vehicle's insurance or NTSA inspection is showing red, that vehicle should not be hired out until the document is renewed. An automatic reminder will also appear in the Reminders section.</Warning>
        <Tip>After logging a service, also log the cost as an expense in Finance → Expenses, linked to that vehicle, so it appears in the P&L calculations.</Tip>
      </div>
    ),

    documents: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>📄 Documents</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Creating invoices, quotations, receipts and notes</div>

        <Screen title="Five Document Types">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px' }}>
            {[
              { t:'Quotation',   e:'📄', c:'rgba(255,215,0,0.90)' },
              { t:'Invoice',     e:'🧾', c:'rgba(100,181,246,0.90)' },
              { t:'Receipt',     e:'✅', c:'rgba(129,199,132,0.90)' },
              { t:'Credit Note', e:'🔵', c:'rgba(206,147,216,0.90)' },
              { t:'Debit Note',  e:'🔴', c:'rgba(255,183,77,0.90)' },
            ].map((d,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                <div style={{ fontSize:'18px', marginBottom:'5px' }}>{d.e}</div>
                <div style={{ fontSize:'10px', fontWeight:600, color:d.c }}>{d.t}</div>
              </div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>How to create a document</div>
        <Step n={1} title="Go to Operations → Documents">
          Click the document type tab at the top: Quotation, Invoice, Receipt, Credit Note or Debit Note.
        </Step>
        <Step n={2} title="Click + New [Document type]">
          The form opens. Select the client (or type the name manually), enter the branch, and add the booking reference if applicable.
        </Step>
        <Step n={3} title="Add line items">
          Each line item has a description, quantity and unit price. The total calculates automatically. Click <strong>+ Add line item</strong> to add more rows. Example line item: <em>Prado hire — Chauffeur — 3 days</em>.
        </Step>
        <Step n={4} title="Toggle VAT if applicable">
          Use the VAT dropdown to select 0% (no VAT) or 16%. The VAT amount is calculated and added to the total automatically.
        </Step>
        <Step n={5} title="Add notes (optional)">
          In the Notes field you can add payment instructions, M-Pesa number, or any other relevant information for the client.
        </Step>
        <Step n={6} title="Create the document">
          Click <strong>Create [Document type]</strong>. It is saved with a reference number (e.g. PSK-INV-2026-1234).
        </Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'8px' }}>After creating a document you can:</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0', marginBottom:'16px' }}>
          👁 <strong style={{ color:'rgba(255,215,0,0.80)' }}>View / Preview</strong> — opens the full PSK-branded document with your logo<br/>
          🖨 <strong style={{ color:'rgba(255,215,0,0.80)' }}>Print / Save PDF</strong> — print or save as PDF to send by other means<br/>
          📱 <strong style={{ color:'rgba(37,211,102,0.80)' }}>WhatsApp</strong> — sends a payment summary to client via WhatsApp<br/>
          ✉️ <strong style={{ color:'rgba(100,181,246,0.80)' }}>Email</strong> — opens your email with invoice summary pre-written<br/>
          📤 <strong style={{ color:'rgba(100,181,246,0.80)' }}>Mark as Sent</strong> — updates status from Draft to Sent<br/>
          ✓ <strong style={{ color:'rgba(129,199,132,0.80)' }}>Mark Paid</strong> — marks invoice as paid, auto-creates a receipt and sends WhatsApp to client<br/>
          🗑 <strong style={{ color:'rgba(239,154,154,0.75)' }}>Delete</strong> — permanently removes the document
        </div>

        <Tip>When you mark an invoice as <strong>Paid</strong>, a receipt is automatically created and a WhatsApp message is sent to the client — you do not need to do anything extra.</Tip>
        <Good>All documents use the PSK Safaris Warm Safari template — gold header, rainbow stripe, green banner with the PSK logo. They look professional and branded.</Good>
      </div>
    ),

    handover: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>📷 Handover Checklists</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Recording vehicle condition before and after every hire</div>

        <div style={{ ...gl.panel, padding:'18px', marginBottom:'20px', borderLeft:'4px solid rgba(239,154,154,0.60)' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'8px' }}>⚠️ Why this matters</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'1.8' }}>
            A handover checklist is your proof of the vehicle's condition. If a client returns a car with new damage and claims it was already there, you have photo evidence from the check-out to prove otherwise. <strong style={{ color:'rgba(255,255,255,0.80)' }}>Always do a check-out before the vehicle leaves and a check-in when it returns.</strong>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
          <div style={{ ...gl.panel, padding:'16px', borderLeft:'4px solid rgba(129,199,132,0.60)' }}>
            <div style={{ fontSize:'24px', marginBottom:'8px' }}>🚗</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(129,199,132,0.90)', marginBottom:'6px' }}>Check-out</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>Done <strong>before</strong> the vehicle leaves with the client. Records the condition at departure.</div>
          </div>
          <div style={{ ...gl.panel, padding:'16px', borderLeft:'4px solid rgba(100,181,246,0.60)' }}>
            <div style={{ fontSize:'24px', marginBottom:'8px' }}>🔄</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(100,181,246,0.90)', marginBottom:'6px' }}>Check-in</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>Done <strong>when</strong> the vehicle returns. Compare condition against check-out record.</div>
          </div>
        </div>

        <Step n={1} title="Click 🚗 Check-out or 🔄 Check-in">
          Go to <strong>Operations → Handover Checklists</strong>. Click the green <strong>🚗 Check-out</strong> button before departure, or the blue <strong>🔄 Check-in</strong> button on return.
        </Step>
        <Step n={2} title="Link to a booking">
          Select the booking from the dropdown — this auto-fills the client name, vehicle registration and other details.
        </Step>
        <Step n={3} title="Set the odometer reading">
          Enter the current odometer reading from the vehicle dashboard.
        </Step>
        <Step n={4} title="Set the fuel level">
          Click the fuel gauge bars to set the level — Empty (E), 1/4, 1/2, 3/4, or Full (F).
        </Step>
        <Step n={5} title="Note any damage">
          Click <strong>⚠️ Yes — damage found</strong> if there is any existing damage and describe it in detail (e.g. "Small dent on rear left bumper, scratch on driver door"). If no damage, click <strong>✓ No damage</strong>.
        </Step>
        <Step n={6} title="Take vehicle photos">
          Tap each of the 7 photo spots — Front, Rear, Left side, Right side, Interior, Dashboard, Boot. For each one tap <strong>📷 Camera</strong> to take a live photo or <strong>📁 Upload</strong> to use an existing photo.
        </Step>
        <Step n={7} title="Upload paper form (if used)">
          If your team filled a paper checklist at the garage, upload a photo of it using the yellow <strong>📄 Upload paper form</strong> section at the top.
        </Step>
        <Step n={8} title="Complete the checklist">
          Click <strong>🚗 Complete Check-out</strong> or <strong>🔄 Complete Check-in</strong>. The record is saved.
        </Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'8px' }}>After saving you can:</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0' }}>
          ✓ <strong>Mark as signed</strong> — records that the client has signed the checklist<br/>
          🖨 <strong>Print / PDF</strong> — generates a branded PSK checklist document<br/>
          📱 <strong>WhatsApp</strong> — sends checklist summary to client<br/>
          ✉️ <strong>Email</strong> — sends checklist report by email
        </div>

        <Tip>Take photos in good light. Walk around the vehicle with the client present so they can see and agree with the condition recorded.</Tip>
      </div>
    ),

    agreements: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>📋 Rental Agreements</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Digital rental agreements for every hire</div>

        <Step n={1} title="Go to Operations → Rental Agreements">
          Click <strong>+ New agreement</strong> to open the form.
        </Step>
        <Step n={2} title="Select the booking">
          Choose the booking from the dropdown. All client and vehicle details auto-fill — you do not need to type them manually.
        </Step>
        <Step n={3} title="Check the details">
          Verify the client name, vehicle registration, pickup and return dates, trip type, total amount and deposit amount are all correct.
        </Step>
        <Step n={4} title="Add special conditions (optional)">
          If there are any special terms for this particular hire (e.g. client restricted to certain routes), add them in the Special Conditions box.
        </Step>
        <Step n={5} title="Create the agreement">
          Click <strong>Create Agreement</strong>. A reference number is generated (e.g. PSK-RA-2026-1234).
        </Step>
        <Step n={6} title="Preview and share with client">
          Click <strong>Preview</strong> to see the full PSK-branded rental agreement. Share it by:<br/>
          🖨 <strong>Print / Save PDF</strong> — print for client signature<br/>
          📱 <strong>Send WhatsApp</strong> — send summary to client<br/>
          ✓ <strong>Mark as signed</strong> — once the client has signed, update the status
        </Step>

        <Good>Every rental agreement includes PSK's full terms and conditions automatically. You do not need to add them manually.</Good>
        <Tip>Always create a rental agreement before the vehicle leaves. It protects PSK legally if there is ever a dispute.</Tip>
      </div>
    ),

    reminders: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>🔔 Reminders</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Your action list — everything that needs attention</div>

        <Screen title="Reminders Priority Levels">
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[
              { p:'🔴 URGENT',           c:'rgba(239,154,154,0.90)', bg:'rgba(231,76,60,0.08)', examples:'Overdue vehicle return, expired insurance, expired driver licence' },
              { p:'🟡 ACTION NEEDED',     c:'rgba(255,183,77,0.90)',  bg:'rgba(255,149,0,0.06)', examples:'Document expiring within 30 days, outstanding invoice, service due soon' },
              { p:'⚪ INFO',              c:'rgba(150,150,150,0.70)', bg:'rgba(150,150,150,0.04)', examples:'Manual reminders, general notes from the team' },
            ].map((r,i)=>(
              <div key={i} style={{ padding:'10px 14px', borderRadius:'9px', background:r.bg, borderLeft:`3px solid ${r.c}` }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:r.c, marginBottom:'3px' }}>{r.p}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>{r.examples}</div>
              </div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>What generates reminders automatically?</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0', marginBottom:'16px' }}>
          📅 <strong>Overdue vehicle returns</strong> — when a booking return date has passed<br/>
          🚗 <strong>Vehicle insurance expiring</strong> — within 30 days<br/>
          🔧 <strong>NTSA inspection expiring</strong> — within 30 days<br/>
          🧑‍✈️ <strong>Driver licence expiring</strong> — within 30 days<br/>
          🆔 <strong>Driver PSV badge expiring</strong> — within 30 days<br/>
          📜 <strong>Driver good conduct expiring</strong> — within 30 days
        </div>

        <Step n={1} title="Check reminders daily">
          Go to <strong>Operations → Reminders</strong> every morning. Red reminders need immediate action.
        </Step>
        <Step n={2} title="Click View → to go to the source">
          Each reminder has a <strong>View →</strong> button that takes you directly to the relevant booking, vehicle, or driver record so you can take action.
        </Step>
        <Step n={3} title="Add manual reminders">
          Click <strong>+ Add reminder</strong> to create your own reminder — for example, <em>"Call Equity Bank about LPO renewal"</em>. Set the priority and due date.
        </Step>
        <Step n={4} title="Resolve reminders">
          Once an issue is dealt with, click <strong>✓ Resolve</strong> to remove it from the list. Click <strong>✓ Resolve all</strong> to clear everything.
        </Step>

        <Tip>Click <strong>🔄 Refresh</strong> to check if any new automatic reminders have been generated since you last opened the page.</Tip>
      </div>
    ),

    partners: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>🤝 Partners — Drivers & Vehicle Owners</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Managing drivers, staff and private vehicle owner partners</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
          <div style={{ ...gl.panel, padding:'16px' }}>
            <div style={{ fontSize:'22px', marginBottom:'8px' }}>🧑‍✈️</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(100,181,246,0.90)', marginBottom:'6px' }}>Drivers & Staff</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>Register drivers, track document expiry dates (licence, PSV badge, good conduct, medical), manage availability status.</div>
          </div>
          <div style={{ ...gl.panel, padding:'16px' }}>
            <div style={{ fontSize:'22px', marginBottom:'8px' }}>🚙</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,215,0,0.90)', marginBottom:'6px' }}>Vehicle Owners</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>Private car owners who deposit vehicles with PSK. Earn 70% of net revenue. Track their vehicles and payout information.</div>
          </div>
        </div>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>Registering a driver</div>
        <Step n={1} title="Go to Partners → Drivers & Staff">Click <strong>+ Add driver</strong>.</Step>
        <Step n={2} title="Add driver photo (optional)">Tap 📷 Camera to take a photo or 📁 Upload to select one. The photo appears in the driver table and profile.</Step>
        <Step n={3} title="Fill in personal details">Name, phone, email, National ID, branch, date joined and emergency contact.</Step>
        <Step n={4} title="Add driving documents">Enter licence number, licence class (BCE, B, etc.), licence expiry date, PSV badge number, PSV expiry, good conduct expiry and medical certificate expiry.</Step>
        <Step n={5} title="Save the driver">Click <strong>Save Driver</strong>. Expiry dates will show colour-coded dots in the table and generate automatic reminders when approaching expiry.</Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'16px' }}>Driver status options</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' }}>
          {[
            { s:'Available', c:'rgba(129,199,132,0.90)' },
            { s:'On trip',   c:'rgba(100,181,246,0.90)' },
            { s:'On safari', c:'rgba(206,147,216,0.90)' },
            { s:'Off duty',  c:'rgba(150,150,150,0.85)' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'10px', textAlign:'center', fontSize:'11px', fontWeight:600, color:s.c }}>{s.s}</div>
          ))}
        </div>

        <Good>The 70/30 split is built into the system. Vehicle owners automatically receive 70% of net revenue as calculated in Finance → P&L by Vehicle.</Good>
        <Warning>Only drivers with status <strong>Available</strong> appear in the booking form when assigning a driver to a booking.</Warning>
      </div>
    ),

    finance: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>💰 Finance Section</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>For Ken and Miriam only — PIN protected</div>

        <Warning>The Finance section requires your personal PIN to access. Enter your PIN on the keypad each time. It stays unlocked until you log out.</Warning>

        <Screen title="Finance Tabs Overview">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
            {[
              { t:'Dashboard',    e:'📊', desc:'Revenue, expenses, alerts' },
              { t:'M-Pesa Recon', e:'📱', desc:'Match payments to invoices' },
              { t:'Expenses',     e:'💸', desc:'Log all operating costs' },
              { t:'P&L by Vehicle',e:'📈', desc:'Profit per vehicle, 70/30' },
              { t:'Receivables',  e:'⏰', desc:'Unpaid invoices, reminders' },
              { t:'Owner Payouts',e:'💵', desc:'Ken only — owner payments' },
              { t:'Documents',    e:'📄', desc:'All invoices and receipts' },
              { t:'Reports',      e:'📋', desc:'CSV exports' },
            ].map((t,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                <div style={{ fontSize:'18px', marginBottom:'4px' }}>{t.e}</div>
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,215,0,0.80)', marginBottom:'3px' }}>{t.t}</div>
                <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.30)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </Screen>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px' }}>How to log an M-Pesa payment</div>
        <Step n={1} title="Go to Finance → M-Pesa Recon">Click <strong>+ Log M-Pesa</strong>.</Step>
        <Step n={2} title="Enter the M-Pesa details">Enter the M-Pesa reference number (e.g. RGJ4K8L9QP), the amount, sender name and phone number. These are in the M-Pesa confirmation SMS.</Step>
        <Step n={3} title="Match to an invoice">In the <strong>Match to invoice</strong> dropdown, select the unpaid invoice this payment is for. When you match it, the system will: mark the invoice as paid, create a receipt, and automatically send a WhatsApp receipt to the client.</Step>
        <Step n={4} title="Save the transaction">Click <strong>Log M-Pesa Transaction</strong>. Everything updates instantly.</Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'8px' }}>How to log an expense</div>
        <Step n={1} title="Go to Finance → Expenses or click + Log expense on the Dashboard">Select the category (Fuel, Maintenance, Driver allowance, Insurance, etc.).</Step>
        <Step n={2} title="Fill in the details">Enter the date, description, amount, and link it to a specific vehicle if applicable.</Step>
        <Step n={3} title="Upload receipt">Tap 📷 Camera to photograph the receipt, or 📁 Upload to select from files.</Step>
        <Step n={4} title="Save">Click <strong>Save Expense</strong>. It appears in the expense table and updates the P&L calculations.</Step>

        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'12px', marginTop:'8px' }}>Owner Payouts (Ken only)</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'1.8', marginBottom:'12px' }}>
          Go to Finance → Owner Payouts. Click <strong>+ Calculate payout</strong>. Select the vehicle owner, the period (e.g. January 2026), enter the gross revenue and any direct expenses. The system calculates 70% for the owner and 30% for PSK automatically. Once you click <strong>✓ Mark paid + 📱</strong>, it opens WhatsApp to the owner with the full payout breakdown.
        </div>

        <Tip>The Finance Dashboard shows live numbers — total invoiced, amount collected, outstanding balance and collection rate. Check it every morning.</Tip>
        <Good>When an invoice is marked paid (manually or via M-Pesa), a receipt is automatically created and sent to the client on WhatsApp. No extra steps needed.</Good>
      </div>
    ),

    tips: (
      <div>
        <div style={{ fontSize:'20px', fontWeight:800, color:'rgba(255,255,255,0.92)', marginBottom:'8px' }}>💡 Tips & Troubleshooting</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'24px' }}>Common questions and how to handle them</div>

        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px' }}>
          {[
            { q:'The platform is slow to load or shows a loading screen', a:'This happens if the platform has been inactive for a while (free tier). Wait 30-60 seconds and it will load. It only happens once — it stays fast until there is a long period of no use.' },
            { q:'I cannot find a vehicle in the booking form', a:'The vehicle may be out on hire, in service, or grounded. Go to PSK Fleet → Vehicles and check its current status. Only Available vehicles appear in the booking dropdown.' },
            { q:'I cannot find a driver in the booking form', a:'The driver\'s status may not be set to Available. Go to Partners → Drivers, open the driver profile and change the status to Available.' },
            { q:'A client is not appearing in the booking form', a:'You may need to register them first. Go to Clients, add the client, then come back to create the booking.' },
            { q:'I forgot my Finance PIN', a:'Contact Kevin. He can reset your PIN to the default from his admin panel.' },
            { q:'I forgot my login password', a:'Click "Forgot password?" on the login screen and enter your work email. If you set a backup email, instructions will appear. Otherwise contact Kevin directly.' },
            { q:'A reminder keeps coming back after I resolve it', a:'Click Refresh on the Reminders page. If it reappears it means the underlying issue (expired document, overdue booking) has not been resolved. Fix the actual issue first.' },
            { q:'The M-Pesa payment does not match any invoice', a:'The payment amount may not exactly match any invoice. Save the transaction without matching it. Go to Finance → M-Pesa Recon and use the Match widget to manually link it to the correct invoice once you identify it.' },
            { q:'How do I know if a client received their receipt?', a:'In Finance → M-Pesa Recon, the Receipt Sent column shows ✓ Sent when the WhatsApp has been opened. You can also click 📱 Resend to send it again.' },
            { q:'Can I use this on my phone?', a:'Yes. The platform works on mobile browsers. Use Chrome on Android or Safari on iPhone. For the best experience bookmark the URL admin.psksafariskenya.com on your phone home screen.' },
          ].map((faq,i)=>(
            <div key={i} style={{ ...gl.panel, padding:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,215,0,0.85)', marginBottom:'8px' }}>❓ {faq.q}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:'1.7' }}>→ {faq.a}</div>
            </div>
          ))}
        </div>

        <div style={{ ...gl.panel, padding:'20px', marginBottom:'16px' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:'14px' }}>📞 Need more help?</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.50)', lineHeight:'2.0' }}>
            If you encounter an issue not covered in this manual:<br/>
            1. Take a screenshot of what you see on screen<br/>
            2. Note what you were trying to do<br/>
            3. WhatsApp or call Kevin with the screenshot and description<br/>
            4. Kevin will fix any issues and update the platform
          </div>
        </div>

        <div style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.20)', borderRadius:'12px', padding:'20px', textAlign:'center' }}>
          <div style={{ fontSize:'24px', marginBottom:'8px' }}>🚀</div>
          <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,215,0,0.90)', marginBottom:'6px' }}>You're all set!</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:'1.8' }}>
            PSK Safaris Admin Platform is built for your team. The more you use it, the more the data builds up and the better your analytics and reports become. Start with bookings, clients and fleet — everything else will follow naturally.
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', marginTop:'12px' }}>
            Platform built by Kevin · admin.psksafariskenya.com · August 2026
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'system-ui,sans-serif' }}>
      {/* Left nav */}
      <div style={{ width:'220px', flexShrink:0, background:'rgba(6,14,24,0.95)', borderRight:'1px solid rgba(255,255,255,0.08)', overflowY:'auto', padding:'20px 0' }}>
        <div style={{ padding:'0 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <img src="/branding/psk-logo.png" alt="" style={{ width:'28px', height:'28px', borderRadius:'50%' }} />
            <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.80)' }}>PSK User Manual</div>
          </div>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)' }}>August 2026</div>
        </div>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActive(s.id)} style={{ width:'100%', padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', background:active===s.id?'rgba(255,215,0,0.10)':'transparent', border:'none', borderLeft:`3px solid ${active===s.id?'rgba(255,215,0,0.60)':'transparent'}`, color:active===s.id?'rgba(255,215,0,0.90)':'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'inherit', textAlign:'left', fontSize:'12px', fontWeight:active===s.id?600:400, transition:'all 0.15s' }}>
            <span style={{ fontSize:'14px', flexShrink:0 }}>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
        <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'8px' }}>
          <button onClick={()=>navigate('/')} style={{ width:'100%', padding:'9px', borderRadius:'9px', fontSize:'11px', fontWeight:600, background:'rgba(255,215,0,0.10)', border:'1px solid rgba(255,215,0,0.25)', color:'rgba(255,215,0,0.80)', cursor:'pointer', fontFamily:'inherit' }}>← Back to platform</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'32px 40px', background:'rgba(8,16,28,0.60)' }}>
        <div style={{ maxWidth:'780px', margin:'0 auto' }}>
          {content[active]}
        </div>
      </div>
    </div>
  )
}
