export interface ErrorDetails {
  id: string
  message: string
  stack?: string
  timestamp: string
  url?: string
  userAgent?: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  type?: string
  category?: string
  firstOccurred?: string
  lastOccurred?: string
  count?: number
  context?: {
    url?: string
  }
  metadata?: Record<string, any>
}

export interface ErrorMetrics {
  total: number
  resolved: number
  unresolved: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
  byDate: {
    date: string
    count: number
  }[]
}

export class ErrorTracker {
  private errors: ErrorDetails[] = []

  addError(error: Omit<ErrorDetails, 'id' | 'timestamp' | 'resolved'>): string {
    const id = Math.random().toString(36).substr(2, 9)
    const timestamp = new Date().toISOString()
    
    const newError: ErrorDetails = {
      ...error,
      id,
      timestamp,
      resolved: false
    }
    
    this.errors.push(newError)
    return id
  }

  getErrors(): ErrorDetails[] {
    return this.errors
  }

  getMetrics(): ErrorMetrics {
    const total = this.errors.length
    const resolved = this.errors.filter(e => e.resolved).length
    const unresolved = total - resolved

    const bySeverity = {
      low: this.errors.filter(e => e.severity === 'low').length,
      medium: this.errors.filter(e => e.severity === 'medium').length,
      high: this.errors.filter(e => e.severity === 'high').length,
      critical: this.errors.filter(e => e.severity === 'critical').length
    }

    // Group by date (last 7 days)
    const byDate = this.getErrorsByDate()

    return {
      total,
      resolved,
      unresolved,
      bySeverity,
      byDate
    }
  }

  private getErrorsByDate() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => ({
      date,
      count: this.errors.filter(e => e.timestamp.startsWith(date)).length
    }))
  }

  resolveError(id: string, resolvedBy?: string): boolean {
    const error = this.errors.find(e => e.id === id)
    if (error) {
      error.resolved = true
      error.resolvedAt = new Date().toISOString()
      error.resolvedBy = resolvedBy
      return true
    }
    return false
  }
}

// Export a singleton instance
export const errorTracker = new ErrorTracker()
