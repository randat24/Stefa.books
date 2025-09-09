'use client'

interface NotificationsPanelProps {
  onRefresh?: () => void
}

export function NotificationsPanel({ onRefresh }: NotificationsPanelProps) {
  return (
    <div className="p-4">
      <h3 className="text-body-lg font-semibold mb-4">Notifications</h3>
      <p className="text-neutral-600">No new notifications</p>
    </div>
  )
}