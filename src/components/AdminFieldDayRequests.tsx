import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, MapPin, Calendar, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fieldDayService, FieldDayRequest } from '@/lib/field-day-service'
import { toast } from 'sonner'

export function AdminFieldDayRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await fieldDayService.getAllRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load field day requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(id)
      await fieldDayService.updateRequestStatus(id, status)
      toast.success(`Request ${status} successfully`)
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req))
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredRequests = requests.filter(req => 
    req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.preferred_location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Field Day Requests</h2>
          <p className="text-slate-400 text-sm">Manage student requests for career field days and excursions.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, contact, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border-card-border h-10 pl-12 focus:ring-primary/40 focus:border-primary/40"
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-card-border shadow-sm">
        <CardHeader className="border-b border-card-border">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            All Requests
          </CardTitle>
          <CardDescription>Review and process incoming requests from students</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Student Details</TableHead>
                  <TableHead className="font-bold">Contact</TableHead>
                  <TableHead className="font-bold">Preferences</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{req.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.profiles?.email}
                        </p>
                        {req.schools?.name && (
                          <p className="text-xs text-primary mt-1">{req.schools.name}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{req.contact_number}</p>
                      </TableCell>
                      <TableCell>
                        {req.preferred_location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {req.preferred_location}
                          </div>
                        )}
                        {req.preferred_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(req.preferred_date).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(req.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            disabled={req.status === 'approved' || updatingId === req.id}
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                          >
                            {updatingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            disabled={req.status === 'rejected' || updatingId === req.id}
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                          >
                            {updatingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
