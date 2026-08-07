import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertCircle, Zap } from 'lucide-react'

export default function Analytics() {
  // Fleet utilization trend (last 12 months)
  const utilizationTrend = [
    { month: 'Jan', utilization: 62, available: 38 },
    { month: 'Feb', utilization: 65, available: 35 },
    { month: 'Mar', utilization: 68, available: 32 },
    { month: 'Apr', utilization: 72, available: 28 },
    { month: 'May', utilization: 75, available: 25 },
    { month: 'Jun', utilization: 78, available: 22 },
    { month: 'Jul', utilization: 76, available: 24 },
    { month: 'Aug', utilization: 80, available: 20 },
    { month: 'Sep', utilization: 82, available: 18 },
    { month: 'Oct', utilization: 79, available: 21 },
    { month: 'Nov', utilization: 81, available: 19 },
    { month: 'Dec', utilization: 84, available: 16 },
  ]

  // Maintenance cost trends
  const maintenanceCosts = [
    { month: 'Jan', scheduled: 2400, unscheduled: 1200, parts: 800 },
    { month: 'Feb', scheduled: 2200, unscheduled: 1400, parts: 900 },
    { month: 'Mar', scheduled: 2600, unscheduled: 1100, parts: 700 },
    { month: 'Apr', scheduled: 2800, unscheduled: 1500, parts: 1100 },
    { month: 'May', scheduled: 2400, unscheduled: 1300, parts: 950 },
    { month: 'Jun', scheduled: 2900, unscheduled: 1600, parts: 1200 },
    { month: 'Jul', scheduled: 2700, unscheduled: 1400, parts: 1000 },
    { month: 'Aug', scheduled: 3100, unscheduled: 1800, parts: 1300 },
    { month: 'Sep', scheduled: 2800, unscheduled: 1200, parts: 900 },
    { month: 'Oct', scheduled: 3000, unscheduled: 1500, parts: 1100 },
    { month: 'Nov', scheduled: 2600, unscheduled: 1300, parts: 950 },
    { month: 'Dec', scheduled: 3200, unscheduled: 1700, parts: 1250 },
  ]

  // Cost per kilometre by vehicle type
  const costPerKm = [
    { type: 'Saloon', cost: 12.5, revenue: 45, margin: 32.5 },
    { type: 'SUV', cost: 18.2, revenue: 65, margin: 46.8 },
    { type: 'Safari 4x4', cost: 22.1, revenue: 85, margin: 62.9 },
    { type: 'Van', cost: 16.8, revenue: 55, margin: 38.2 },
  ]

  // Fleet condition distribution
  const fleetCondition = [
    { name: 'Excellent', value: 35, color: '#34d399' },
    { name: 'Good', value: 45, color: '#60a5fa' },
    { name: 'Fair', value: 15, color: '#fbbf24' },
    { name: 'Needs Attention', value: 5, color: '#f87171' },
  ]

  // Key metrics
  const metrics = [
    { label: 'Avg Fleet Utilization', value: '79%', trend: '+4% vs last month', color: 'text-emerald-400' },
    { label: 'Monthly Maintenance Cost', value: 'KES 45,200', trend: '+8% vs last month', color: 'text-amber-400' },
    { label: 'Cost per Km (Avg)', value: 'KES 17.4', trend: '-2% vs last month', color: 'text-blue-400' },
    { label: 'Fleet Downtime', value: '3.2%', trend: '-0.8% vs last month', color: 'text-cyan-400' },
  ]

  // Operational alerts
  const alerts = [
    { id: 1, severity: 'high', message: 'KBA-005-S overdue for 10,000 km service', action: 'Schedule now' },
    { id: 2, severity: 'medium', message: 'KBA-002-A tire replacement recommended', action: 'Review' },
    { id: 3, severity: 'medium', message: 'Maintenance budget 87% utilized this month', action: 'Monitor' },
    { id: 4, severity: 'low', message: 'KBA-001-A idle for 8 days', action: 'Investigate' },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="glass-lg p-4 border border-slate-800">
            <p className="text-xs text-psk-text-secondary uppercase tracking-wider font-semibold mb-2">{metric.label}</p>
            <p className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
            <p className="text-xs text-psk-text-tertiary">{metric.trend}</p>
          </div>
        ))}
      </div>

      {/* Fleet Utilization Trend */}
      <div className="glass-lg p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-psk-text-primary">Fleet Utilization Trend (12 months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={utilizationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121a24', border: '1px solid #1e293b', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc' }}
            />
            <Legend />
            <Line type="monotone" dataKey="utilization" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399' }} />
            <Line type="monotone" dataKey="available" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Maintenance Cost Breakdown */}
      <div className="glass-lg p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-psk-text-primary">Maintenance Cost Breakdown (12 months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maintenanceCosts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121a24', border: '1px solid #1e293b', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc' }}
            />
            <Legend />
            <Bar dataKey="scheduled" stackId="a" fill="#60a5fa" />
            <Bar dataKey="unscheduled" stackId="a" fill="#f87171" />
            <Bar dataKey="parts" stackId="a" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost per Km & Fleet Condition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost per Km */}
        <div className="glass-lg p-6 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-psk-text-primary mb-4">Revenue & Cost by Vehicle Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costPerKm}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="type" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121a24', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              <Bar dataKey="cost" fill="#f87171" />
              <Bar dataKey="revenue" fill="#34d399" />
              <Bar dataKey="margin" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Condition */}
        <div className="glass-lg p-6 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-psk-text-primary mb-4">Fleet Condition Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fleetCondition}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fleetCondition.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#121a24', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Alerts */}
      <div className="glass-lg p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-red-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-psk-text-primary">Operational Alerts & Actions</h3>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
              alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-400' :
                  alert.severity === 'medium' ? 'bg-amber-400' :
                  'bg-blue-400'
                }`}></div>
                <p className="text-sm text-psk-text-primary">{alert.message}</p>
              </div>
              <button className="px-3 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-psk-text-secondary hover:text-psk-text-primary transition">
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
