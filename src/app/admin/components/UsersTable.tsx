"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, Phone, MapPin, Calendar, RefreshCw } from "lucide-react"
import type { UserRow } from "@/lib/types/admin"

interface UsersTableProps {
  users: UserRow[]
  onRefresh?: () => void
}

export function UsersTable({ users, onRefresh }: UsersTableProps) {

  // Данные передаются через пропсы, загрузка не нужна

  const getSubscriptionBadgeVariant = (type: string) => {
    switch (type) {
      case 'premium': return 'default'
      case 'maxi': return 'secondary'
      case 'mini': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }



  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-neutral-900 flex items-center gap-2">
            <Users className="size-5" />
            Користувачі ({users.length})
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="md">
            <RefreshCw className="size-4 mr-2" />
            Оновити
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Users className="size-16 mx-auto mb-4 opacity-50" />
            <p className="text-body-lg font-semibold text-neutral-700 mb-2">Немає користувачів</p>
            <p className="text-neutral-500">Користувачі з&apos;являться тут після реєстрації</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-body-lg font-semibold text-neutral-900">{user.name}</h3>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status === 'active' ? 'Активний' : 
                         user.status === 'inactive' ? 'Неактивний' : 'Заблокований'}
                      </Badge>
                      <Badge variant={getSubscriptionBadgeVariant(user.subscription_type)}>
                        {user.subscription_type === 'premium' ? 'Преміум' :
                         user.subscription_type === 'maxi' ? 'Максі' : 'Міні'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="size-4" />
                          <span>{user.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {user.subscription_start && user.subscription_end && (
                      <div className="flex items-center gap-2 mt-3 text-body-sm text-neutral-500">
                        <Calendar className="size-4" />
                        <span>
                          Підписка: {new Date(user.subscription_start).toLocaleDateString('uk-UA')} - {new Date(user.subscription_end).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                    )}
                    
                    {user.notes && (
                      <p className="mt-2 text-body-sm text-neutral-600 bg-neutral-50 p-2 rounded-lg">
                        {user.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}