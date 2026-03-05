import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, Sparkles, Zap, ShieldCheck, Loader2 } from 'lucide-react'
import { PRICE_PER_STUDENT_PER_TERM, SUBSCRIPTION_PLAN } from '@/lib/school-service'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionCardProps {
    currentTier: string | null
    studentCount: number
    onUpdate?: () => void
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ currentTier, studentCount, onUpdate }) => {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const isSubscribed = currentTier && currentTier !== 'FREE'
    const totalPrice = studentCount * PRICE_PER_STUDENT_PER_TERM

    const handleUpgrade = async () => {
        setLoading(true)
        // Simulate payment process
        setTimeout(() => {
            setLoading(false)
            toast({
                title: "Subscription Activated",
                description: `Your school subscription is now active for ${studentCount} students.`,
            })
            if (onUpdate) onUpdate()
        }, 1500)
    }

    return (
        <Card className="bg-gradient-surface border-card-border overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-primary/5 border-b border-card-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <CardTitle>School Subscription</CardTitle>
                    </div>
                    <Badge variant={isSubscribed ? "default" : "outline"} className={isSubscribed ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20 font-bold px-3"}>
                        {isSubscribed ? 'Subscribed' : 'Free Tier'}
                    </Badge>
                </div>
                <CardDescription>
                    Simple, transparent pricing for your entire institution
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-foreground">{SUBSCRIPTION_PLAN.name}</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Empower every student in your school with high-quality AI career guidance.
                            Pay only for the students you have.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SUBSCRIPTION_PLAN.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-foreground-muted">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-full md:w-72 p-6 rounded-2xl bg-muted/20 border border-card-border flex flex-col items-center text-center">
                        <div className="text-[10px] uppercase tracking-widest text-foreground-muted font-bold mb-2">Current Total</div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-foreground">KES {totalPrice.toLocaleString()}</span>
                            <span className="text-xs text-foreground-muted">/ term</span>
                        </div>
                        <div className="text-[10px] text-foreground-muted mb-6">
                            {studentCount} students × {PRICE_PER_STUDENT_PER_TERM} bob
                        </div>

                        <Button
                            className="w-full font-bold group"
                            onClick={handleUpgrade}
                            disabled={loading || isSubscribed}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : isSubscribed ? (
                                <>
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Active
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2 fill-current group-hover:animate-pulse" /> Upgrade Now
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="mt-auto bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">Termly Billing</p>
                            <p className="text-[10px] text-foreground-muted mt-1 leading-relaxed">
                                Subscription is billed at the start of each academic term based on your current enrollment.
                                Prices are inclusive of all AI career matching and report generation features.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SubscriptionCard
