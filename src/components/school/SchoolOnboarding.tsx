import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService } from '@/lib/school-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

const KENYAN_COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

interface Props {
    onComplete: () => void
}

type Step = 'details' | 'confirm' | 'done'

const SchoolOnboarding: React.FC<Props> = ({ onComplete }) => {
    const { user, refreshProfile } = useAuth()
    const [step, setStep] = useState<Step>('details')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [region, setRegion] = useState('')

    const autoCode = (schoolName: string) =>
        schoolName
            .split(' ')
            .map((w) => w[0]?.toUpperCase() ?? '')
            .join('')
            .slice(0, 6)

    const handleNameChange = (val: string) => {
        setName(val)
        if (!code || code === autoCode(name)) {
            setCode(autoCode(val))
        }
    }

    const handleSubmit = async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            await schoolService.createSchool(user.id, name.trim(), code.trim(), region)
            await refreshProfile()
            setStep('done')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create school')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'done') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
                <Card className="bg-gradient-surface border-card-border max-w-md w-full mx-4">
                    <CardContent className="pt-10 pb-8 text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">School Created!</h2>
                        <p className="text-foreground-muted mb-6">
                            <strong>{name}</strong> is ready. You're the school admin.
                        </p>
                        <Button className="w-full bg-gradient-primary" onClick={onComplete}>
                            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
            <div className="max-w-lg w-full mx-4">
                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {(['details', 'confirm'] as Step[]).map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step === s ? 'bg-primary text-primary-foreground' :
                                    (step === 'confirm' && s === 'details') ? 'bg-green-500 text-white' :
                                        'bg-muted text-foreground-muted'
                                }`}>
                                {(step === 'confirm' && s === 'details') ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            {i === 0 && <div className={`h-0.5 w-12 ${step === 'confirm' ? 'bg-primary' : 'bg-muted'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <Card className="bg-gradient-surface border-card-border">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <CardTitle>{step === 'details' ? 'Set Up Your School' : 'Confirm Details'}</CardTitle>
                                <CardDescription>
                                    {step === 'details' ? 'Enter your school information to get started' : 'Review before creating'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {step === 'details' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="school-name">School Name *</Label>
                                    <Input
                                        id="school-name"
                                        placeholder="e.g. Nairobi High School"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="school-code">School Code *</Label>
                                    <Input
                                        id="school-code"
                                        placeholder="e.g. NHS"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-foreground-muted">Short unique identifier (auto-generated from name)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="region">County / Region *</Label>
                                    <Select value={region} onValueChange={setRegion}>
                                        <SelectTrigger id="region">
                                            <SelectValue placeholder="Select county" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {KENYAN_COUNTIES.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                <Button
                                    className="w-full bg-gradient-primary"
                                    disabled={!name.trim() || !code.trim() || !region}
                                    onClick={() => setStep('confirm')}
                                >
                                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </>
                        )}

                        {step === 'confirm' && (
                            <>
                                <div className="rounded-xl bg-muted/40 border border-card-border p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground-muted">School Name</span>
                                        <span className="font-medium text-foreground">{name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground-muted">School Code</span>
                                        <span className="font-mono font-medium text-foreground">{code}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground-muted">County</span>
                                        <span className="font-medium text-foreground">{region}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground-muted">Your Role</span>
                                        <span className="font-medium text-foreground">School Admin</span>
                                    </div>
                                </div>

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep('details')} disabled={loading}>
                                        Back
                                    </Button>
                                    <Button className="flex-1 bg-gradient-primary" onClick={handleSubmit} disabled={loading}>
                                        {loading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating...</> : 'Create School'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SchoolOnboarding
