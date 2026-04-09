import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Download, ArrowRight, ArrowLeft, CheckCircle, Brain, Target, User, Heart, Compass, ShieldAlert, Rocket } from "lucide-react";
import BrandedLoader from "@/components/BrandedLoader";
import { aiCareerService } from "@/lib/ai-service";
import { ReportGenerator, type GuestProfile } from "@/lib/report-generator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { RIASEC_ACTIVITIES, RIASEC_LABELS } from "@/data/riasec-assessment";

const QuickAssessment = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);

    // Phase 1: Academics
    const [name, setName] = useState("");
    const [curriculum, setCurriculum] = useState<'cbc' | 'igcse' | null>(null);
    const [grade, setGrade] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Phase 2: RIASEC
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

    // Phase 3: Values & Work Style
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [workStyle, setWorkStyle] = useState("");

    // Phase 4: MBTI
    const [mbtiEnergy, setMbtiEnergy] = useState("");
    const [mbtiDecisions, setMbtiDecisions] = useState("");
    const [mbtiStructure, setMbtiStructure] = useState("");

    // Phase 5: Reality
    const [barrier, setBarrier] = useState("");
    const [experience, setExperience] = useState("");

    // Phase 6: Readiness
    const [readiness, setReadiness] = useState("");

    const [finalRecommendations, setFinalRecommendations] = useState<any[]>([]);
    const [guestProfile, setGuestProfile] = useState<GuestProfile>({});

    const commonSubjects = [
        "Mathematics", "English / Literature", "Sciences (Physics/Chem/Bio)",
        "Computer Science / IT", "Business / Economics", "Arts & Design",
        "Humanities (History/Geo)", "Physical Education / Sports",
        "Technical / Applied Skills"
    ];

    const valueOptions = ["High Income / Wealth", "Helping Others / Impact", "Work-Life Balance", "Leadership / Power", "Creativity / Innovation", "Stability / Security"];
    const workStyleOptions = ["Solo / Independent", "Collaborative Team", "Remote / Tech-Focused", "Outdoors / Active", "Corporate Office", "Hands-on / Fieldwork"];

    const barrierOptions = ["Financial Constraints", "Unsure of my interests", "Fear of failure", "Lack of mentorship/guidance", "Poor academic grades currently", "No barriers right now"];
    const experienceOptions = ["School Clubs / Leader", "Volunteering / Community Service", "Hobby / Personal Projects", "Part-time Job / Internship", "None yet"];
    const readinessOptions = ["Ready to apply now!", "Exploring my options", "Completely stuck / Need help"];

    const handleNext = () => {
        setError(null);
        if (currentStep === 1) {
            if (!name.trim()) return setError("Please enter your name");
            if (!curriculum) return setError("Please select your curriculum");
            if (!grade.trim()) return setError("Please enter your current grade/year");
            if (selectedSubjects.length === 0) return setError("Please select at least one subject area");
        }
        if (currentStep === 2 && selectedActivities.length === 0) return setError("Please select at least one activity");
        if (currentStep === 3) {
            if (selectedValues.length === 0) return setError("Please select your core values");
            if (!workStyle) return setError("Please select your preferred work style");
        }
        if (currentStep === 4) {
            if (!mbtiEnergy || !mbtiDecisions || !mbtiStructure) return setError("Please answer all personality questions");
        }
        if (currentStep === 5) {
            if (!barrier || !experience) return setError("Please answer the reality check questions");
        }
        if (currentStep === 6 && !readiness) return setError("Please select your action readiness");

        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep(prev => prev - 1);
    };

    const calculateRiasec = () => {
        const scores = { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 };
        selectedActivities.forEach(id => {
            const activity = RIASEC_ACTIVITIES.find(a => a.id === id);
            if (activity) {
                const key = activity.code === 'R' ? 'realistic' :
                    activity.code === 'I' ? 'investigative' :
                        activity.code === 'A' ? 'artistic' :
                            activity.code === 'S' ? 'social' :
                                activity.code === 'E' ? 'enterprising' : 'conventional';
                scores[key]++;
            }
        });
        const sortedTypes = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .filter(s => s[1] > 0)
            .map(s => RIASEC_LABELS[s[0].charAt(0).toUpperCase() as keyof typeof RIASEC_LABELS]);
        return { scores, personalityTypes: sortedTypes };
    };

    const finishAssessment = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { personalityTypes, scores } = calculateRiasec();
            const topPersonality = personalityTypes[0] || 'Balanced';
            const mbtiCode = `${mbtiEnergy === 'Introvert' ? 'I' : 'E'}N${mbtiDecisions === 'Thinker' ? 'T' : 'F'}${mbtiStructure === 'Judging' ? 'J' : 'P'}`;

            const profile: GuestProfile = {
                name,
                curriculum: curriculum || undefined,
                grade,
                subjects: selectedSubjects,
                interests: [`RIASEC Type: ${personalityTypes.join(', ')}`],
                values: selectedValues,
                workStyle,
                mbti: mbtiCode,
                barriers: barrier,
                experience,
                readiness,
                careerGoals: "Seeking career alignment via AI Counselor Assessment."
            };
            setGuestProfile(profile);

            // Generate customized recommendations passing ALL the new params
            const payload = {
                name: profile.name,
                curriculum: profile.curriculum,
                currentGrade: profile.grade,
                subjects: profile.subjects,
                interests: profile.interests,
                values: profile.values,
                workStyle: profile.workStyle,
                mbti: profile.mbti,
                limitations: profile.barriers
            };

            const recommendations = await aiCareerService.generateCareerRecommendations(payload);
            setFinalRecommendations(recommendations);

            const summaryString = await aiCareerService.sendMessage(
                "Generate a 3-paragraph executive summary detailing exactly why the recommended career paths fit the student based on their selected RIASEC profile (" + topPersonality + "), MBTI (" + mbtiCode + "), and core values (" + selectedValues.join(', ') + "). Emphasize how they can overcome their stated barrier ('" + barrier + "'). Use professional, encouraging tone. DO NOT ask any questions. Use markdown formatting.",
                [],
                { ...payload, assessmentResults: { riasec_scores: scores, personality_type: personalityTypes } }
            );

            setGuestProfile(prev => ({
                ...prev,
                aiSummary: summaryString
            }));

            setShowReport(true);
            setCurrentStep(7);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate assessment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadReport = async () => {
        const html = ReportGenerator.generatePDFReport(guestProfile, [], finalRecommendations);
        await ReportGenerator.downloadPDF(html, `${guestProfile.name || 'CareerGuide'}-Diagnostic-Report.pdf`);
    };

    return (
        <div className="min-h-screen text-foreground relative overflow-x-hidden pt-20">
            <BackgroundGradient />
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-1">Professional Counselor Assessment</h1>
                    <p className="text-base text-muted-foreground mt-2">Comprehensive 10-point analysis covering Values, MBTI Personality, Works Styles, and Real Challenges.</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-center gap-1.5 md:gap-2 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(s => (
                            <div key={s} className={`h-1.5 md:h-2 flex-1 max-w-[40px] md:max-w-[60px] rounded-full transition-all ${currentStep >= s ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />
                        ))}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/5">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="bg-gradient-surface border-card-border shadow-elevated overflow-hidden">
                    <CardContent className="p-5 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: FOUNDATION */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><User className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Phase 1: Academics</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <Label className="text-base font-semibold">Your Full Name</Label>
                                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Kamau" className="text-base p-5 border-2 bg-background/50 focus:ring-primary" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-base font-semibold">Curriculum</Label>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <button type="button" onClick={() => setCurriculum('cbc')} className={`p-3 rounded-xl border-2 transition-all font-bold ${curriculum === 'cbc' ? 'border-primary bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50'}`}>Kenyan CBC</button>
                                                    <button type="button" onClick={() => setCurriculum('igcse')} className={`p-3 rounded-xl border-2 transition-all font-bold ${curriculum === 'igcse' ? 'border-primary bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50'}`}>British IGCSE</button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-base font-semibold">Current Grade</Label>
                                                <Input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Grade 9" className="text-base p-5 mt-1 border-2 bg-background/50 focus:ring-primary" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold mb-2 block">Strongest Subjects</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {commonSubjects.map(sub => (
                                                    <button key={sub} type="button" onClick={() => setSelectedSubjects(p => p.includes(sub) ? p.filter(x => x !== sub) : [...p, sub])}
                                                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${selectedSubjects.includes(sub) ? 'border-primary bg-primary text-primary-foreground' : 'border-card-border bg-card hover:border-primary/50 text-foreground'}`}>
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={handleNext} className="h-12 md:h-14 px-8 text-base md:text-lg rounded-2xl bg-primary shadow-lg hover:translate-x-1 transition-transform">
                                            Continue <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: RIASEC */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><Target className="w-8 h-8 text-primary" /> Phase 2: Interests</h2>
                                        <p className="text-muted-foreground mt-2">Pick 3-5 activities that sound genuinely fun to you.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                                        {RIASEC_ACTIVITIES.slice(0, 16).map(a => (
                                            <button key={a.id} type="button" onClick={() => setSelectedActivities(p => p.includes(a.id) ? p.filter(x => x !== a.id) : [...p, a.id])}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${selectedActivities.includes(a.id) ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-card-border hover:border-primary/20 bg-card/50'}`}>
                                                <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center ${selectedActivities.includes(a.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                                    {selectedActivities.includes(a.id) && <CheckCircle className="w-3 h-3" />}
                                                </div>
                                                <p className="text-[15px] font-medium leading-tight text-foreground">{a.text}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="h-12 md:h-14 px-6 md:px-8 border-2 font-bold mb-4 sm:mb-0"><ArrowLeft className="mr-2 w-5 h-5" /> Back</Button>
                                        <Button onClick={handleNext} className="h-12 md:h-14 px-6 md:px-8 bg-primary shadow-lg hover:translate-x-1 transition-transform">Continue <ArrowRight className="ml-2 w-5 h-5" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: VALUES & WORK STYLE */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><Heart className="w-8 h-8 text-primary" /> Phase 3: Values & Work</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-base font-semibold block mb-2">What matters MOST to you in a career? (Pick 2)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {valueOptions.map(val => (
                                                    <button key={val} type="button" onClick={() => setSelectedValues(p => p.includes(val) ? p.filter(x => x !== val) : p.length < 2 ? [...p, val] : p)}
                                                        className={`p-3 rounded-xl border-2 transition-all font-medium text-sm md:text-base ${selectedValues.includes(val) ? 'border-primary bg-primary text-primary-foreground' : 'border-card-border hover:border-primary/50 bg-card/50 text-foreground'}`}>
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold block mb-2">How do you prefer to work?</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {workStyleOptions.map(ws => (
                                                    <button key={ws} type="button" onClick={() => setWorkStyle(ws)}
                                                        className={`p-3 rounded-xl border-2 transition-all font-medium text-sm md:text-base ${workStyle === ws ? 'border-primary bg-primary text-primary-foreground' : 'border-card-border hover:border-primary/50 bg-card/50 text-foreground'}`}>
                                                        {ws}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="h-12 md:h-14 px-6 md:px-8 border-2 font-bold mb-4 sm:mb-0"><ArrowLeft className="mr-2 w-5 h-5" /> Back</Button>
                                        <Button onClick={handleNext} className="h-12 md:h-14 px-6 md:px-8 bg-primary shadow-lg hover:translate-x-1 transition-transform">Continue <ArrowRight className="ml-2 w-5 h-5" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: MBTI PERSONALITY */}
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><Brain className="w-8 h-8 text-primary" /> Phase 4: Personality</h2>
                                        <p className="text-muted-foreground mt-2">MBTI-inspired psychological framing.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-base font-semibold block mb-2">1. Do you focus better...</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => setMbtiEnergy('Extrovert')} className={`p-4 rounded-xl border-2 font-medium ${mbtiEnergy === 'Extrovert' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>In active groups (Extrovert)</button>
                                                <button type="button" onClick={() => setMbtiEnergy('Introvert')} className={`p-4 rounded-xl border-2 font-medium ${mbtiEnergy === 'Introvert' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>Working alone (Introvert)</button>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold block mb-2">2. Do you make decisions using...</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => setMbtiDecisions('Thinker')} className={`p-4 rounded-xl border-2 font-medium ${mbtiDecisions === 'Thinker' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>Strict Logic/Data (Thinker)</button>
                                                <button type="button" onClick={() => setMbtiDecisions('Feeler')} className={`p-4 rounded-xl border-2 font-medium ${mbtiDecisions === 'Feeler' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>Feelings/People (Feeler)</button>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold block mb-2">3. Do you prefer...</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => setMbtiStructure('Judging')} className={`p-4 rounded-xl border-2 font-medium ${mbtiStructure === 'Judging' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>A strict schedule (Judging)</button>
                                                <button type="button" onClick={() => setMbtiStructure('Perceiving')} className={`p-4 rounded-xl border-2 font-medium ${mbtiStructure === 'Perceiving' ? 'border-primary tracking-wide bg-primary/10 text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>Flexibility (Perceiving)</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="h-12 md:h-14 px-6 md:px-8 border-2 font-bold mb-4 sm:mb-0"><ArrowLeft className="mr-2 w-5 h-5" /> Back</Button>
                                        <Button onClick={handleNext} className="h-12 md:h-14 px-6 md:px-8 bg-primary shadow-lg hover:translate-x-1 transition-transform">Continue <ArrowRight className="ml-2 w-5 h-5" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: REALITY CHECK */}
                            {currentStep === 5 && (
                                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><ShieldAlert className="w-8 h-8 text-primary" /> Phase 5: Reality Check</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-base font-semibold block mb-2">What is your biggest obstacle right now?</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {barrierOptions.map(opt => (
                                                    <button key={opt} type="button" onClick={() => setBarrier(opt)}
                                                        className={`p-4 rounded-xl border-2 transition-all font-medium text-sm md:text-[15px] text-left ${barrier === opt ? 'border-primary bg-primary/10 ring-1 ring-primary text-primary' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold block mb-2">Do you have practical experience?</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {experienceOptions.map(opt => (
                                                    <button key={opt} type="button" onClick={() => setExperience(opt)}
                                                        className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${experience === opt ? 'border-primary bg-primary text-white' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="h-12 md:h-14 px-6 md:px-8 border-2 font-bold mb-4 sm:mb-0"><ArrowLeft className="mr-2 w-5 h-5" /> Back</Button>
                                        <Button onClick={handleNext} className="h-12 md:h-14 px-6 md:px-8 bg-primary shadow-lg hover:translate-x-1 transition-transform">Continue <ArrowRight className="ml-2 w-5 h-5" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 6: READINESS */}
                            {currentStep === 6 && (
                                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2"><Rocket className="w-8 h-8 text-primary" /> Phase 6: Action</h2>
                                        <p className="text-muted-foreground mt-2">How ready are you to start planning?</p>
                                    </div>

                                    <div className="flex flex-col gap-3 max-w-md mx-auto">
                                        {readinessOptions.map(opt => (
                                            <button key={opt} type="button" onClick={() => setReadiness(opt)}
                                                className={`p-5 rounded-2xl border-2 transition-all text-left font-bold text-lg ${readiness === opt ? 'border-primary bg-primary text-white scale-105 shadow-xl' : 'border-card-border hover:border-primary/50 bg-background/50'}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-8 flex flex-col md:flex-row justify-between gap-4">
                                        <Button variant="outline" onClick={handleBack} className="h-14 px-8 border-2 font-bold order-2 md:order-1 disabled:opacity-50" disabled={isLoading}><ArrowLeft className="mr-2 w-5 h-5" /> Back</Button>
                                        <Button onClick={finishAssessment} disabled={isLoading || !readiness} className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl hover:shadow-primary/20 order-1 md:order-2">
                                            {isLoading ? <><BrandedLoader size="xs" showText={false} className="mr-2 inline-flex" /> Finalizing...</> : <><Sparkles className="mr-2 w-5 h-5" /> Reveal Diagnostic</>}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 7: RESULTS */}
                            {currentStep === 7 && (
                                <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-10">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Diagnostic is Ready</h2>
                                    <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
                                        We evaluated 10 professional metrics including your MBTI, Values, and Barriers.
                                    </p>

                                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto backdrop-blur-sm">
                                        <h3 className="text-xl font-bold text-primary mb-3 flex items-center justify-center gap-2">
                                            <Compass className="w-6 h-6" /> The Next Logical Step
                                        </h3>
                                        <p className="text-foreground mb-6 text-sm md:text-base leading-relaxed">
                                            The AI has identified your potential. Now, validate these results with a
                                            <strong> Human Career Counselor</strong> to build a realistic roadmap for your
                                            education and future job market in Kenya.
                                        </p>
                                        <Button onClick={() => navigate('/student')} size="lg" className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground rounded-2xl shadow-glow hover:scale-[1.02] transition-all">
                                            Book a 1-on-1 Counseling Session
                                        </Button>
                                    </div>

                                    <div className="pt-8 flex flex-col items-center gap-4">
                                        <Button onClick={downloadReport} variant="outline" className="h-14 px-8 border-2 font-bold flex items-center gap-2">
                                            <Download className="w-5 h-5" /> Download Diagnostic Report
                                        </Button>
                                        <Button variant="ghost" onClick={() => { setCurrentStep(1); setGuestProfile({}); }} className="mt-4">Retake Assessment</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default QuickAssessment;
