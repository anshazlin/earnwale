"use client";
import { useCallback, useEffect, useState } from "react";
import { COURSE_MODULES } from "@/lib/trading-course";
import Link from "next/link";

type Account = { plan?: number | string };
type Config = { videos: { id: number; available: boolean }[]; downloads: string[] };
type Question = { id: number; question: string; options: string[] };
type ExamData = { token: string; questions: Question[]; passingScore: number; questionCount: number };
type Result = {
  score: number; total: number; passed: boolean; passingScore: number;
  review: { id: number; chosenChoice: number; correctChoice: number; explanation: string }[];
};
export default function MyCoursesPage() {
  const [loading,setLoading]=useState(true);
  const [authorised,setAuthorised]=useState(false);
  const [config,setConfig]=useState<Config|null>(null);
  const [active,setActive]=useState(1);
  const [videoError,setVideoError]=useState(false);
  const [exam,setExam]=useState<ExamData|null>(null);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [result,setResult]=useState<Result|null>(null);
  const [examBusy,setExamBusy]=useState(false);
  const [examError,setExamError]=useState("");
  const [history,setHistory]=useState<{id:string;score:number;total:number;passed:boolean;createdAt:string}[]>([]);

  const bootstrap=useCallback(async()=>{
    try {
      const res=await fetch("/api/auth/me",{credentials:"include"});
      if(res.status===401){window.location.href="/login";return;}
      if(!res.ok) throw new Error("Could not check your enrollment.");
      const data=await res.json();
      const user:Account=data.user??data;
      const permitted=["300","500"].includes(String(user.plan??""));
      setAuthorised(permitted);
      if(permitted) {
        const [configRes, historyRes]=await Promise.all([
          fetch("/api/trading/media?config=1",{credentials:"include"}),
          fetch("/api/trading/quiz?history=1",{credentials:"include"}),
        ]);
        if(configRes.ok)setConfig(await configRes.json());
        if(historyRes.ok){const data=await historyRes.json();setHistory(data.attempts??[]);}
      }
    } catch {setExamError("Unable to load the course. Try refreshing the page.");}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{void bootstrap();},[bootstrap]);
  const selected=COURSE_MODULES.find(m=>m.id===active)??COURSE_MODULES[0];
  const playable=Boolean(config?.videos.find(m=>m.id===active)?.available);

  async function startExam(){
    setExamBusy(true);setExamError("");
    try{
      const res=await fetch("/api/trading/quiz",{credentials:"include",cache:"no-store"});
      if(!res.ok)throw new Error("The assessment is temporarily unavailable.");
      setExam(await res.json());setResult(null);setAnswers({});setStep(0);
    } catch(e){setExamError(e instanceof Error?e.message:"Could not load assessment.");}
    finally{setExamBusy(false);}
  }
  async function submitExam(){
    if(!exam || Object.keys(answers).length!==exam.questions.length)return;
    setExamBusy(true);setExamError("");
    try{
      const res=await fetch("/api/trading/quiz",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:exam.token,answers:exam.questions.map(q=>({id:q.id,choice:answers[q.id]}))})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error??"Could not submit assessment.");
      setResult(data);
      const historyRes=await fetch("/api/trading/quiz?history=1",{credentials:"include"});
      if(historyRes.ok){const list=await historyRes.json();setHistory(list.attempts??[]);}
    }catch(e){setExamError(e instanceof Error?e.message:"Please try again.");}
    finally{setExamBusy(false);}
  }
  const currentQuestion=exam?.questions[step];
  const review=currentQuestion?result?.review.find(item=>item.id===currentQuestion.id):undefined;
  const answeredCount=exam?exam.questions.filter(q=>answers[q.id]!==undefined).length:0;
  if(loading) return <div className="flex min-h-[40vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-label="Loading courses" /></div>;
  if(!authorised) return <section className="rounded-2xl border border-amber-200 bg-white p-7"><h1 className="text-2xl font-bold text-slate-900">My Courses</h1><p className="mt-3 text-slate-600">Enroll in Earnwale Trading Academy to access the lessons.</p><Link href="/#courses" className="mt-5 inline-block rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white">View plans</Link></section>;
  return <div className="space-y-6 pb-8">
    <section className="overflow-hidden rounded-3xl bg-[#071B33] px-5 py-7 text-white sm:px-8 sm:py-9">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Earnwale Trading Academy · Starter</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Trading Fundamentals</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Six beginner lessons with fictional market examples, worksheets and a knowledge assessment. Educational content only—not investment advice, signals or guaranteed returns.</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-white/10 px-3 py-2">6 lessons</span>
        <span className="rounded-full bg-white/10 px-3 py-2">44 min 44 sec of video</span>
        <span className="rounded-full bg-white/10 px-3 py-2">8-question assessment · fresh set each attempt</span>
      </div>
    </section>

    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
      <div className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold text-slate-900">Module {selected.id}: {selected.title}</h2><span className="text-xs text-slate-500">{selected.duration}</span></div>
        {playable ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
            <video key={active} controls playsInline preload="none" className="h-full w-full" onError={()=>setVideoError(true)}>
              <source src={`/api/trading/media?module=${active}`} type="video/mp4" />
              Your browser does not support this video.
            </video>
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-slate-950 px-5 text-center text-white">
            <p className="text-base font-semibold">Video is being prepared</p>
            <p className="mt-2 text-sm text-slate-300">This lesson will become playable after secure video hosting is configured.</p>
          </div>
        )}
        {videoError && <p className="text-sm text-rose-700" role="alert">The video could not be loaded. Please try again later.</p>}
        <p className="text-sm leading-6 text-slate-600">{selected.summary}</p>
        <p className="text-xs text-slate-500">Videos stream only when selected. No automatic loading of all six lessons.</p>
      </div>
      <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Course lessons</h2>
        {COURSE_MODULES.map(m=><button key={m.id} type="button" onClick={()=>{setActive(m.id);setVideoError(false);}}
          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${active===m.id?"border-amber-400 bg-amber-50":"border-slate-200 hover:bg-slate-50"}`}>
          <span className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-900">{m.id}. {m.title}</span><span className="shrink-0 text-xs text-slate-500">{m.duration}</span></span>
          <span className="mt-1 block text-xs text-slate-500">{config?.videos.find(x=>x.id===m.id)?.available?"Ready to watch":"Pending upload"}</span>
        </button>)}
      </aside>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Learning resources</h2>
      <p className="mt-1 text-sm text-slate-600">Read the handbook and complete the fictional exercises after watching the lessons.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {config?.downloads.includes("handbook")&&<a className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" href="/api/trading/media?file=handbook">Download handbook</a>}
        {config?.downloads.includes("workbook")&&<a className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900" href="/api/trading/media?file=workbook">Download worksheets</a>}
        {!config?.downloads.length&&<p className="text-sm text-amber-800">Handbook and worksheets will appear once secure file hosting is configured.</p>}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="quiz">
      <h2 className="text-lg font-semibold text-slate-900">Final knowledge assessment</h2>
      <p className="mt-1 text-sm text-slate-600">8 random questions from the Trading Academy question bank · one at a time · pass at 7/8. Your next set avoids all eight questions from the previous set. This is a learning check, not a professional qualification to trade.</p>
      {history.length>0 && <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-950">Your recent assessments</p>
        <ul className="mt-2 space-y-1 text-sm text-blue-900">
          {history.map(attempt=><li key={attempt.id}>{new Date(attempt.createdAt).toLocaleDateString("en-IN")} · {attempt.score}/{attempt.total} · {attempt.passed?"Passed":"Review suggested"}</li>)}
        </ul>
      </div>}
      {!exam && <button type="button" disabled={examBusy} onClick={startExam} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">{examBusy?"Preparing your questions…":"Start 8-question assessment"}</button>}
      {exam && currentQuestion && <div className="mt-5">
        {result && <div className="mb-5 rounded-2xl bg-[#071B33] p-5 text-white" role="status">
          <p className="text-lg font-bold">Score: {result.score}/{result.total} — {result.passed?"Assessment passed":"Review and try again"}</p>
          <p className="mt-1 text-sm text-blue-100">Passing score: {result.passingScore}/{result.total}. Review each question below, then try a different set.</p>
        </div>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{result?"Answer review":"Question"} {step+1} of {exam.questionCount}</p>
          <p className="text-xs text-slate-500">{result?"Graded and saved":`${answeredCount} of ${exam.questionCount} answered`}</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar" aria-label="Assessment question progress"
          aria-valuemin={0} aria-valuemax={exam.questionCount} aria-valuenow={step+1}>
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{width:`${((step+1)/exam.questionCount)*100}%`}} />
        </div>
        <fieldset key={currentQuestion.id} disabled={Boolean(result)||examBusy} className="mt-6">
          <legend className="text-base font-semibold leading-7 text-slate-900 sm:text-lg">{currentQuestion.question}</legend>
          <div className="mt-5 space-y-3">
            {currentQuestion.options.map((option,index)=>{
              const selectedAnswer=answers[currentQuestion.id]===index;
              const rightAnswer=result && review?.correctChoice===index;
              return <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm leading-6 transition ${rightAnswer?"border-emerald-400 bg-emerald-50":selectedAnswer?"border-amber-500 bg-amber-50":"border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                <input className="mt-1 accent-amber-500" type="radio" name={`quiz-question-${currentQuestion.id}`}
                  checked={selectedAnswer} onChange={()=>setAnswers(previous=>({...previous,[currentQuestion.id]:index}))}/>
                <span className="font-medium text-slate-700">{String.fromCharCode(65+index)}.</span>
                <span className="text-slate-800">{option}</span>
              </label>;
            })}
          </div>
        </fieldset>
        {result && review && <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
          <strong>{review.chosenChoice===review.correctChoice?"✓ Your answer was correct.":"Review:"}</strong> Correct answer: {String.fromCharCode(65+review.correctChoice)}. {review.explanation}
        </p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button type="button" disabled={step===0 || examBusy} onClick={()=>setStep(previous=>previous-1)}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-35">← Back</button>
          {step<exam.questions.length-1
            ? <button type="button" disabled={(!result && answers[currentQuestion.id]===undefined)||examBusy}
                onClick={()=>setStep(previous=>previous+1)}
                className="rounded-xl bg-[#071B33] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Next →</button>
            : !result
              ? <button type="button" disabled={examBusy || answeredCount!==exam.questionCount}
                  onClick={submitExam} className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{examBusy?"Grading…":"Finish & see result"}</button>
              : <button type="button" onClick={()=>void startExam()} disabled={examBusy}
                  className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40">Try new questions ↻</button>}
        </div>
        {!result && <button type="button" disabled={examBusy} onClick={()=>{if(answeredCount===0 || window.confirm("Start a different set? Your current answers will be lost."))void startExam();}}
          className="mt-5 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-950 disabled:opacity-40">Refresh with 8 different questions</button>}
      </div>}
      {examError && <p role="alert" className="mt-3 text-sm text-rose-700">{examError}</p>}
    </section>
  </div>;
}
