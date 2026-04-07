import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Loader2, Download, ArrowRight, ArrowLeft, CheckCircle, Brain, Target, User } from "lucide-react";
import { aiCareerService } from "@/lib/ai-service";
import { ReportGenerator, type GuestProfile } from "@/lib/report-generator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackgroundGradient from "@/components/BackgroundGradient";
import { RIASEC_ACTIVITIES, RIASEC_LABELS } from "@/data/riasec-assessment";

const QuickAssessment = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    
    // Form State
    const [name, setName] = useState("");
    const [curriculum, setCurriculum] = useState<'cbc' | 'igcse' | null>(null);
    const [grade, setGrade] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [finalRecommendations, setFinalRecommendations] = useState<any[]>([]);
    const [guestProfile, setGuestProfile] = useState<GuestProfile>({});

    const commonSubjects = [
        "Mathematics", "English / Literature", "Sciences (Physics/Chem/Bio)",
        "Computer Science / IT", "Business / Economics", "Arts & Design",
        "Humanities (History/Geo)", "Physical Education / Sports",
        "Technical / Applied Skills"
    ];

    const handleNext = () => {
        if (currentStep === 1) {
            if (!name.trim()) return setError("Please enter your name");
            if (!curriculum) return setError("Please select your curriculum");
            if (!grade.trim()) return setError("Please enter your current grade/year");
        }
        if (currentStep === 2 && selectedSubjects.length === 0) {
            return setError("Please select at least one subject area");
        }
        if (currentStep === 3 && selectedActivities.length === 0) {
            return setError("Please select at least one activity you enjoy");
        }
        setError(null);
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
            const { personalityTypes } = calculateRiasec();
            const topPersonality = personalityTypes[0] || 'Balanced';
            
            const profile: GuestProfile = {
                name,
                curriculum: curriculum || undefined,
                grade,
                subjects: selectedSubjects,
                interests: [`RIASEC Type: ${personalityTypes.join(', ')}`],
                careerGoals: "Seeking career alignment via AI Quick Assessment."
            };
            setGuestProfile(profile);

            // Fetch recommendations
            const recommendations = await aiCareerService.generateCareerRecommendations({
                name: profile.name,
                curriculum: profile.curriculum,
                currentGrade: profile.grade,
                subjects: profile.subjects,
                interests: profile.interests,
            });
            
            setFinalRecommendations(recommendations);
            
            // Also generate an AI Summary to append to the report since we removed the conversational history
            const summaryString = await aiCareerService.sendMessage(
                "Generate a 3-paragraph executive summary detailing why the selected career paths fit the student based on their selected RIASEC profile (" + topPersonality + ") and their chosen subjects. Emphasize either Kenyan CBC or IGCSE pathways depending on context. Keep it highly professional like a consultancy report. Use markdown formatting. DO NOT ask any questions.",
                [],
                {
                    name: profile.name,
                    curriculum: profile.curriculum,
                    currentGrade: profile.grade,
                    subjects: profile.subjects,
                    interests: profile.interests,
                    assessmentResults: {
                        riasec_scores: calculateRiasec().scores,
                        personality_type: personalityTypes
                    }
                }
            );

            setGuestProfile(prev => ({
                ...prev,
                aiSummary: summaryString
            }));

            setShowReport(true);
            setCurrentStep(4);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate assessment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadReport = async () => {
        const html = ReportGenerator.generatePDFReport(guestProfile, [], finalRecommendations);
        await ReportGenerator.downloadPDF(html, `${guestProfile.name || 'CareerGuide'}-Assessment-Report.pdf`);
    };

    return (
        <div className="min-h-screen text-foreground relative overflow-x-hidden pt-20">
            <BackgroundGradient />
            <Navigation />
            
            <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">Comprehensive Quick Assessment</h1>
                    <p className="text-lg text-foreground-muted mt-2">Discover your perfectly aligned career paths in less than 3 minutes.</p>
                </div>

                <div className="mb-8">
                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-2 w-16 rounded-full transition-all ${currentStep >= s ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />
                        ))}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/5">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="bg-gradient-surface border-card-border shadow-elevated overflow-hidden">
                    <CardContent className="p-6 sm:p-10">
                        <AnimatePresence mode="wait">
                            
                            {/* STEP 1: BASICS */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold flex items-center justify-center gap-2"><User className="w-8 h-8 text-primary"/> Let's Start with You</h2>
                                        <p className="text-foreground-muted mt-2">Before we dive in, tell us a bit about where you are in school.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-lg font-semibold">Your Full Name</Label>
                                            <Input 
                                                value={name} onChange={e => setName(e.target.value)} 
                                                placeholder="e.g. John Kamau" 
                                                className="text-lg p-6 bg-background/50 focus:ring-primary border-2"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-lg font-semibold">Which Curriculum are you studying?</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <button type="button" onClick={() => setCurriculum('cbc')} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 ${curriculum === 'cbc' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-card-border hover:border-primary/50'}`}>
                                                    <span className="font-bold text-lg">Kenyan CBC</span>
                                                    <span className="text-sm text-left text-foreground-muted">Junior/Senior Secondary</span>
                                                </button>
                                                <button type="button" onClick={() => setCurriculum('igcse')} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 ${curriculum === 'igcse' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-card-border hover:border-primary/50'}`}>
                                                    <span className="font-bold text-lg">British IGCSE</span>
                                                    <span className="text-sm text-left text-foreground-muted">Key Stage 3-4 / A-Levels</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-lg font-semibold">Current Grade / Year</Label>
                                            <Input 
                                                value={grade} onChange={e => setGrade(e.target.value)} 
                                                placeholder={curriculum === 'cbc' ? "e.g. Grade 9" : "e.g. Year 10"} 
                                                className="text-lg p-6 bg-background/50 focus:ring-primary border-2"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={handleNext} className="h-14 px-8 text-lg rounded-2xl bg-primary text-primary-foreground shadow-lg hover:translate-x-1 transition-transform">
                                            Continue <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: LEARNING AREAS */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold flex items-center justify-center gap-2"><Target className="w-8 h-8 text-primary"/> Learning Interests</h2>
                                        <p className="text-foreground-muted mt-2">Select the general subject areas you naturally excel at or enjoy the most.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-2">
                                        {commonSubjects.map(sub => (
                                            <button
                                                key={sub} type="button"
                                                onClick={() => setSelectedSubjects(p => p.includes(sub) ? p.filter(x => x !== sub) : [...p, sub])}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${selectedSubjects.includes(sub) ? 'border-primary bg-primary text-white shadow-md' : 'border-card-border hover:border-primary/30 bg-background/50'}`}
                                            >
                                                {selectedSubjects.includes(sub) ? <CheckCircle className="w-5 h-5 shrink-0" /> : <div className="w-5 h-5 shrink-0 border-2 rounded-full border-muted-foreground/30" />}
                                                <span className="font-medium">{sub}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="h-14 px-8 text-lg rounded-2xl border-2 font-bold mb-4 sm:mb-0">
                                            <ArrowLeft className="mr-2 w-5 h-5" /> Back
                                        </Button>
                                        <Button onClick={handleNext} className="h-14 px-8 text-lg rounded-2xl bg-primary text-primary-foreground shadow-lg hover:translate-x-1 transition-transform">
                                            Continue <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: WORK STYLES */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold flex items-center justify-center gap-2"><Brain className="w-8 h-8 text-primary"/> What Do You Enjoy Doing?</h2>
                                        <p className="text-foreground-muted mt-2">Pick activities below that sound fun to you. This builds your psychological profile.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                                        {RIASEC_ACTIVITIES.slice(0, 15).map(a => (
                                            <button
                                                key={a.id} type="button"
                                                onClick={() => setSelectedActivities(p => p.includes(a.id) ? p.filter(x => x !== a.id) : [...p, a.id])}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${selectedActivities.includes(a.id) ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-card-border hover:border-primary/20 bg-background/50'}`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center ${selectedActivities.includes(a.id) ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'}`}>
                                                    {selectedActivities.includes(a.id) && <CheckCircle className="w-3 h-3" />}
                                                </div>
                                                <p className="text-base font-medium">{a.text}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
                                        <Button variant="outline" onClick={handleBack} className="h-14 px-8 text-lg rounded-2xl border-2 font-bold order-2 sm:order-1 disabled:opacity-50" disabled={isLoading}>
                                            <ArrowLeft className="mr-2 w-5 h-5" /> Back
                                        </Button>
                                        <Button onClick={finishAssessment} disabled={isLoading} className="h-14 px-8 text-lg rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl hover:shadow-primary/20 order-1 sm:order-2">
                                            {isLoading ? (
                                                <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Analyzing Everything...</>
                                            ) : (
                                                <><Sparkles className="mr-2 w-5 h-5" /> Discover My Future</>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: RESULTS */}
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-10">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-4xl font-extrabold tracking-tight">Your Action Plan is Ready</h2>
                                    <p className="text-xl text-foreground-muted max-w-lg mx-auto">
                                        We evaluated your curriculum, subjects, and personality. Your premium PDF report contains your top 3 matching career paths and AI guidance.
                                    </p>

                                    <div className="pt-8 flex flex-col items-center gap-4">
                                        <Button onClick={downloadReport} size="lg" className="h-16 px-10 text-xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-300">
                                            <Download className="w-6 h-6 mr-3" /> Download Professional Report
                                        </Button>
                                        
                                        <Button variant="ghost" onClick={() => { setCurrentStep(1); setGuestProfile({}); }} className="mt-4">
                                            Retake Assessment
                                        </Button>
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
