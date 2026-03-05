import React, { useState } from 'react'
import { schoolService } from '@/lib/school-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
    schoolId: string
    invitedBy: string
    onInvited?: () => void
}

const InviteTeacher: React.FC<Props> = ({ schoolId, invitedBy, onInvited }) => {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleInvite = async () => {
        if (!email.trim()) return
        setLoading(true)
        setError(null)
        try {
            const invite = await schoolService.inviteTeacher(schoolId, email, invitedBy)
            const link = `${window.location.origin}/invite?token=${invite.token}`
            setInviteLink(link)
            onInvited?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create invite')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = () => {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        toast({ title: 'Copied!', description: 'Invite link copied to clipboard' })
    }

    const reset = () => {
        setEmail('')
        setInviteLink(null)
        setError(null)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary">
                    <UserPlus className="mr-2 w-4 h-4" /> Invite Teacher
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite a Teacher</DialogTitle>
                    <DialogDescription>
                        Enter the teacher's email. They'll receive a link to join your school.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="teacher-email">Teacher's Email</Label>
                            <Input
                                id="teacher-email"
                                type="email"
                                placeholder="teacher@school.ac.ke"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                className="flex-1 bg-gradient-primary"
                                disabled={!email.trim() || loading}
                                onClick={handleInvite}
                            >
                                {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Sending...</> : 'Generate Invite'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <p className="text-sm font-medium">Invite created for <strong>{email}</strong></p>
                        </div>
                        <div className="space-y-2">
                            <Label>Invite Link (share this with the teacher)</Label>
                            <div className="flex gap-2">
                                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                                <Button variant="outline" size="icon" onClick={copyLink}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-foreground-muted">Link expires in 7 days</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => { setEmail(''); setInviteLink(null) }}>
                                Invite Another
                            </Button>
                            <Button className="flex-1" onClick={reset}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default InviteTeacher
