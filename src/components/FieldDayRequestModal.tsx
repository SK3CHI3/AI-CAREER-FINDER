import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Calendar, MapPin, Phone, User, CheckCircle2 } from 'lucide-react'
import { fieldDayService } from '@/lib/field-day-service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface FieldDayRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FieldDayRequestModal: React.FC<FieldDayRequestModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    contactNumber: profile?.phone || '',
    preferredLocation: '',
    preferredDate: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await fieldDayService.submitRequest({
        student_id: user.id,
        school_id: profile?.school_id,
        full_name: formData.fullName,
        contact_number: formData.contactNumber,
        preferred_location: formData.preferredLocation,
        preferred_date: formData.preferredDate
      })
      
      setIsSuccess(true)
      toast.success('Field Day request submitted successfully!')
    } catch (error) {
      console.error('Error submitting field day request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setIsSuccess(false)
    setFormData({
      fullName: profile?.full_name || '',
      contactNumber: profile?.phone || '',
      preferredLocation: '',
      preferredDate: '',
      notes: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-card-border overflow-hidden">
        {isSuccess ? (
          <div className="py-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Request Received!</h3>
              <p className="text-foreground-muted max-w-[300px] mx-auto">
                We have received your Field Day request. Our team will contact you at <strong>{formData.contactNumber}</strong> shortly to discuss rates and logistics.
              </p>
            </div>
            <Button onClick={handleResetAndClose} className="w-full max-w-[200px]">
              Back to Journey
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Request a Field Day
              </DialogTitle>
              <DialogDescription className="text-foreground-muted">
                Career field days are organized excursions to industries and companies. Fill out the details below and we'll get back to you with a quote.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                  <Input
                    id="fullName"
                    placeholder="Enter your name"
                    className="pl-10"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                    <Input
                      id="phone"
                      placeholder="e.g. 0712345678"
                      className="pl-10"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">Preferred Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Preferred Location/Sector</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                  <Input
                    id="location"
                    placeholder="e.g. Nairobi Tech Hubs, Nakuru Agricultural Firms"
                    className="pl-10"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Additional Details (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tell us more about your interests for this field day..."
                  className="min-h-[100px] resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
