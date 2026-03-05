import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService } from '@/lib/school-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, CheckCircle2, Loader2, AlertCircle, Building2 } from 'lucide-react'

type State = 'loading' | 'ready' | 'accepting' | 'done' | 'error'

const AcceptInvite: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user, profile, loading: authLoading, refreshProfile } = useAuth()

    const token = searchParams.get('token') ?? ''
    const [state, setState] = useState<State>('loading')
    const [invite, setInvite] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState('')

    // Validate invite on mount
    useEffect(() => {
        if (!token) {
            setErrorMsg('No invite token found in URL.')
            setState('error')
            return
        }

        schoolService.getInviteByToken(token).then((inv) => {
            if (!inv) {
                setErrorMsg('Invite not found. It may have been revoked.')
                setState('error')
                return
            }
            if (inv.accepted_at) {
                setErrorMsg('This invite has already been accepted.')
                setState('error')
                return
            }
            if (new Date(inv.expires_at) < new Date()) {
                setErrorMsg('This invite has expired. Ask your school admin to resend.')
                setState('error')
                return
            }
            setInvite(inv)
            setState('ready')
        })
    }, [token])

    // If not logged in, send to auth with redirect
    const goToAuth = () => {
        navigate(`/auth?redirect=/invite?token=${token}`)
    }

    const handleAccept = async () => {
        if (!user || !invite) return
        setState('accepting')
        try {
            await schoolService.acceptInvite(token, user.id)
            await refreshProfile()
            setState('done')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to accept invite')
            setState('error')
        }
    }

    if (authLoading || state === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Bot className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-foreground-muted">Verifying invite...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
            <div className="max-w-md w-full mx-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">CareerPath AI</span>
                    </div>
                </div>

                {state === 'error' && (
                    <Card className="bg-gradient-surface border-card-border">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-7 h-7 text-destructive" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground mb-2">Invite Issue</h2>
                            <p className="text-sm text-foreground-muted mb-6">{errorMsg}</p>
                            <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
                        </CardContent>
                    </Card>
                )}

                {state === 'done' && (
                    <Card className="bg-gradient-surface border-card-border">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-7 h-7 text-green-500" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground mb-2">You're In!</h2>
                            <p className="text-sm text-foreground-muted mb-6">
                                You've joined the school as a teacher. Head to your dashboard to create classes and manage students.
                            </p>
                            <Button className="w-full bg-gradient-primary" onClick={() => navigate('/teacher')}>
                                Go to Teacher Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {(state === 'ready' || state === 'accepting') && invite && (
                    <Card className="bg-gradient-surface border-card-border">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <CardTitle>Teacher Invite</CardTitle>
                                    <CardDescription>You've been invited to join as a teacher</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-xl bg-muted/40 border border-card-border p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Invited email</span>
                                    <span className="font-medium">{invite.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Expires</span>
                                    <span className="font-medium">{new Date(invite.expires_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {!user ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-foreground-muted text-center">
                                        You need to be signed in to accept this invite.
                                    </p>
                                    <Button className="w-full bg-gradient-primary" onClick={goToAuth}>
                                        Sign In / Sign Up to Accept
                                    </Button>
                                </div>
                            ) : profile?.email?.toLowerCase() !== invite.email.toLowerCase() ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        ⚠️ You're signed in as <strong>{profile?.email}</strong>, but this invite is for <strong>{invite.email}</strong>. Please sign in with the correct account.
                                    </p>
                                    <Button variant="outline" className="w-full" onClick={goToAuth}>
                                        Switch Account
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-gradient-primary"
                                    onClick={handleAccept}
                                    disabled={state === 'accepting'}
                                >
                                    {state === 'accepting'
                                        ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Accepting...</>
                                        : 'Accept & Join School'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default AcceptInvite
