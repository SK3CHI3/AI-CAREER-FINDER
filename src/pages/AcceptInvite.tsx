import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService } from '@/lib/school-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, CheckCircle2, AlertCircle, Building2 } from 'lucide-react'
import BrandedLoader from '@/components/BrandedLoader'
import { supabase } from '@/lib/supabase'

type State = 'loading' | 'ready' | 'accepting' | 'done' | 'error'

const AcceptInvite: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user, profile, loading: authLoading, refreshProfile, signUp, session } = useAuth()

    const token = searchParams.get('token') ?? ''
    const [state, setState] = useState<State>('loading')
    const [invite, setInvite] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

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
        }).catch(err => {
            setErrorMsg('Failed to verify invite.')
            setState('error')
        })
    }, [token])

    const handleAccept = async (userId: string) => {
        setState('accepting')
        try {
            await schoolService.acceptInvite(token, userId)
            await refreshProfile()
            setState('done')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to accept invite')
            setState('error')
        }
    }

    const handleCreateAccountAndAccept = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!invite || !fullName || !password || !confirmPassword) return

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.')
            return
        }
        
        setState('accepting')
        try {
            // 1. Sign up (role: teacher)
            const { data, error: signUpError } = await signUp(invite.email, password, fullName, '', 'teacher')
            if (signUpError) throw signUpError

            // 2. Use the returned user data
            const newUser = data.user
            if (!newUser) {
                setErrorMsg('Account created but failed to sign in automatically. Please log in.')
                setState('error')
                return
            }

            // 3. Accept invite
            await schoolService.acceptInvite(token, newUser.id)
            await refreshProfile()
            
            // 4. Redirect immediately
            navigate('/teacher')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to create account')
            setState('error')
        }
    }

    if (authLoading || state === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <BrandedLoader size="lg" showText={true} text="Verifying invite..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
            
            <div className="max-w-md w-full mx-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img 
                            src="/logos/CareerGuide_Logo.webp" 
                            alt="CareerGuide AI" 
                            className="h-16 w-auto" 
                        />
                    </div>
                    <p className="text-foreground-muted font-medium">Shaping the future of Kenyan education</p>
                </div>

                {state === 'error' && (
                    <Card className="border-card-border shadow-2xl bg-card/50 backdrop-blur-sm">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Invite Issue</h2>
                            <p className="text-sm text-foreground-muted mb-6 leading-relaxed">{errorMsg}</p>
                            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Back to Home</Button>
                        </CardContent>
                    </Card>
                )}

                {state === 'done' && (
                    <Card className="border-card-border shadow-2xl bg-card/50 backdrop-blur-sm">
                        <CardContent className="pt-8 pb-6 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Welcome Aboard!</h2>
                            <p className="text-sm text-foreground-muted mb-8 leading-relaxed">
                                Your account has been created and you've successfully joined the school as a teacher.
                            </p>
                            <Button className="w-full h-12 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20" onClick={() => navigate('/teacher')}>
                                Go to Teacher Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {(state === 'ready' || state === 'accepting') && invite && (
                    <Card className="border-card-border shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer" />
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Join Your School</CardTitle>
                            <CardDescription>
                                You've been invited to join the teaching staff at your institution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 p-4 bg-muted/40 rounded-xl border border-card-border">
                                <span className="text-xs uppercase tracking-widest font-bold text-foreground-muted block mb-1">Institution Member Invite</span>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    <span className="font-semibold text-foreground">{invite.email}</span>
                                </div>
                            </div>

                            {!user ? (
                                <form onSubmit={handleCreateAccountAndAccept} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground mx-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full h-12 px-4 rounded-xl bg-background border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                placeholder="Enter your registered name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground mx-1">Create Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full h-12 px-4 rounded-xl bg-background border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                placeholder="At least 6 characters"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground mx-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full h-12 px-4 rounded-xl bg-background border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                placeholder="Repeat your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-foreground-muted text-center px-4 leading-normal">
                                        By accepting, you agree to join the institution and follow established guidelines for student career mentorship.
                                    </p>
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 text-white font-bold"
                                        disabled={state === 'accepting'}
                                    >
                                        {state === 'accepting' ? (
                                            <><BrandedLoader size="xs" showText={false} className="mr-2 inline-flex" /> Processing...</>
                                        ) : (
                                            'Accept Invite & Create Account'
                                        )}
                                    </Button>
                                    <div className="text-center pt-2">
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/auth')} 
                                            className="text-sm font-bold text-primary hover:underline"
                                        >
                                            Already have an account? Sign In
                                        </button>
                                    </div>
                                </form>
                            ) : profile?.email?.toLowerCase() !== invite.email.toLowerCase() ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                                        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                                        <p className="text-sm text-amber-700 font-medium">
                                            Mismatch Detected
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            You are logged in as <strong>{profile?.email}</strong>, but this invite is for <strong>{invite.email}</strong>.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 border-2" onClick={() => navigate('/auth')}>
                                        Switch Account
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-center text-foreground-muted bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        Great! You're logged in with the correct email. Click below to join the school staff.
                                    </p>
                                    <Button
                                        className="w-full h-12 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20"
                                        onClick={() => handleAccept(user.id)}
                                        disabled={state === 'accepting'}
                                    >
                                        {state === 'accepting'
                                            ? <><BrandedLoader size="xs" showText={false} className="mr-2 inline-flex" /> Joining...</>
                                            : 'Confirm & Join School'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default AcceptInvite
