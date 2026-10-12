"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PRO_MODULES, PRO_RESOURCES } from "@/lib/pro-course";

type Settings={videos:{id:number;available:boolean}[];downloads:string[]};
type Question={id:number;question:string;options:string[]};
type Exam={token:string;questions:Question[];questionCount:number;passingScore:number};
type Grade={score:number;total:number;passed:boolean;passingScore:number;review:{id:number;chosenChoice:number;correctChoice:number;explanation:string}[]};
type History={id:string;score:number;total:number;passed:boolean;createdAt:string};

export default function ProLearningPage(){
  const [loading,setLoading]=useState(true);
  const [eligible,setEligible]=useState(false);
  const [config,setConfig]=useState<Settings|null>(null);
  const [lesson,setLesson]=useState(1);
  const [videoError,setVideoError]=useState(false);
  const [error,setError]=useState("");
  const [exam,setExam]=useState<Exam|null>(null);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [step,setStep]=useState(0);
  const [busy,setBusy]=useState(false);
  const [grade,setGrade]=useState<Grade|null>(null);
  const [history,setHistory]=useState<History[]>([]);

  const setup=useCallback(async()=>{
    try{
      const me=await fetch("/api/auth/me",{credentials:"include",cache:"no-store"});
      if(me.status===401){window.location.assign("/login");return;}
      if(!me.ok)throw Error("Could not check your Pro plan.");
      const data=await me.json();
      const isPro=String(data.user?.plan??"")==="500";
      setEligible(isPro);
      if(!isPro)return;
      const [resources,attempts]=await Promise.all([
        fetch("/api/pro/media?config=1",{credentials:"include",cache:"no-store"}),
        fetch("/api/pro/quiz?history=1",{credentials:"include",cache:"no-store"}),
      ]);
      if(resources.ok)setConfig(await resources.json());
      if(attempts.ok){const result=await attempts.json();setHistory(result.attempts??[]);}
    }catch(e){setError(e instanceof Error?e.message:"Unable to load the Pro course.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void setup();},[setup]);

  async function newSet(){
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/pro/quiz",{credentials:"include",cache:"no-store"});
      const result=await response.json();
      if(!response.ok)throw Error(result.error??"Unable to prepare a Pro quiz.");
      setExam(result);setAnswers({});setStep(0);setGrade(null);
    }catch(e){setError(e instanceof Error?e.message:"Could not load the Pro quiz.");}
    finally{setBusy(false);}
  }
  async function finish(){
    if(!exam||exam.questions.some(q=>answers[q.id]===undefined))return;
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/pro/quiz",{
        method:"POST",credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token:exam.token,answers:exam.questions.map(q=>({id:q.id,choice:answers[q.id]}))}),
      });
      const result=await response.json();
      if(!response.ok)throw Error(result.error??"Could not grade the Pro quiz.");
      setGrade(result);
      const historyResponse=await fetch("/api/pro/quiz?history=1",{credentials:"include",cache:"no-store"});
      if(historyResponse.ok){const h=await historyResponse.json();setHistory(h.attempts??[]);}
    }catch(e){setError(e instanceof Error?e.message:"Unable to submit the assessment.");}
    finally{setBusy(false);}
  }

  const currentModule=PRO_MODULES.find(item=>item.id===lesson)??PRO_MODULES[0];
  const playable=Boolean(config?.videos.find(item=>item.id===lesson)?.available);
  const question=exam?.questions[step];
  const review=question?grade?.review.find(item=>item.id===question.id):null;
  const count=exam?.questions.filter(q=>answers[q.id]!==undefined).length??0;

  if(loading)return <div className="flex min-h-[40vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-label="Loading Pro course"/></div>;
  if(!eligible)return <section className="rounded-2xl border border-amber-200 bg-white p-7">
    <h1 className="text-2xl font-bold text-slate-900">Earnwale Trading Academy — Pro</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Pro is currently in production. The ₹500 course is not available for new enrollment yet. Existing Pro plan accounts can access the course when materials are hosted.</p>
    <Link href="/#courses" className="mt-4 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">View Academy plans</Link>
  </section>;

  return <div className="space-y-6 pb-10">
    <header className="rounded-3xl bg-[#071B33] px-5 py-7 text-white sm:px-8 sm:py-9">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Earnwale Trading Academy · Pro</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Practical Trading Education</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Six additional practical educational lessons, five worksheets/resources and a rotating eight-question knowledge check. All examples are fictional. No tips, assured returns or personal financial advice.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">6 Pro lessons</span>
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">5 Pro PDFs</span>
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">8-question Pro quiz</span>
      </div>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-amber-200 underline underline-offset-4">← Back to Starter &amp; Pro choices</Link>
    </header>

    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold text-slate-900">P{currentModule.id}: {currentModule.title}</h2><span className="text-xs text-slate-500">Pro lesson</span></div>
        {playable?<div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
          <video key={lesson} controls playsInline preload="none" className="h-full w-full" onError={()=>setVideoError(true)}>
            <source src={`/api/pro/media?module=${lesson}`} type="video/mp4"/>
            Your browser does not support the video format.
          </video>
        </div>:<div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-slate-950 p-5 text-center text-white">
          <p className="font-semibold">Pro video in production</p>
          <p className="mt-2 text-sm text-slate-300">This lesson will be available after its NotebookLM video is generated, reviewed and securely uploaded.</p>
        </div>}
        {videoError&&<p role="alert" className="text-sm text-rose-700">This video could not be played. Please try again later.</p>}
        <p className="text-sm leading-6 text-slate-600">{currentModule.summary}</p>
        <p className="text-xs text-slate-500">Videos only load when selected. Prices, charts and companies in Pro lessons are fictional.</p>
      </div>
      <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Pro lessons</h2>
        {PRO_MODULES.map(item=><button key={item.id} type="button" onClick={()=>{setLesson(item.id);setVideoError(false);}}
          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${lesson===item.id?"border-amber-400 bg-amber-50":"border-slate-200 hover:bg-slate-50"}`}>
          <span className="block text-sm font-semibold text-slate-900">P{item.id}. {item.title}</span>
          <span className="mt-1 block text-xs text-slate-500">{config?.videos.find(x=>x.id===item.id)?.available?"Ready to watch":"Awaiting upload"}</span>
        </button>)}
      </aside>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pro learning resources</h2>
      <p className="mt-1 text-sm text-slate-600">The handbook, printable workbook, paper-practice journal and case studies use fictional exercises.</p>
      <div className="mt-4 flex flex-wrap gap-3">{PRO_RESOURCES.map(resource=>
        config?.downloads.includes(resource.id)
          ? <a key={resource.id} href={`/api/pro/media?file=${resource.id}`} className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-3 text-sm font-semibold text-white">{resource.title}</a>
          : <span key={resource.id} className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-500">{resource.title} · preparing</span>
      )}</div>
    </section>

    <section id="pro-quiz" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pro knowledge check</h2>
      <p className="mt-1 text-sm text-slate-600">8 questions selected from a bank of 36, covering all six Pro topics. Each fresh set avoids questions from your previous set. Answer one at a time; pass at 7/8. This is not a professional qualification.</p>
      {history.length>0&&<div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-950">Previous Pro attempts</p>
        <ul className="mt-2 space-y-1 text-sm text-blue-900">{history.map(item=><li key={item.id}>{new Date(item.createdAt).toLocaleDateString("en-IN")} · {item.score}/{item.total} · {item.passed?"Passed":"Review suggested"}</li>)}</ul>
      </div>}
      {!exam&&<button type="button" disabled={busy} onClick={()=>void newSet()} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy?"Loading...":"Start Pro assessment"}</button>}
      {exam&&question&&<div className="mt-5">
        {grade&&<div className="mb-5 rounded-xl bg-[#071B33] p-5 text-white" role="status">
          <p className="text-lg font-semibold">Score: {grade.score}/{grade.total} — {grade.passed?"Passed":"Review the lessons and try again"}</p>
          <p className="mt-2 text-sm text-blue-100">View explanations with Back/Next, then request a different set.</p>
        </div>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{grade?"Review":"Question"} {step+1} of {exam.questionCount}</p>
          <p className="text-xs text-slate-500">{grade?"Graded and saved":`${count} of ${exam.questionCount} answered`}</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Pro assessment progress" aria-valuenow={step+1} aria-valuemin={0} aria-valuemax={exam.questionCount}>
          <div className="h-full rounded-full bg-amber-500" style={{width:`${100*(step+1)/exam.questionCount}%`}}/>
        </div>
        <fieldset className="mt-6" disabled={busy||Boolean(grade)}>
          <legend className="text-base font-semibold leading-7 text-slate-900 sm:text-lg">{question.question}</legend>
          <div className="mt-5 space-y-3">{question.options.map((option,index)=><label key={index}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${grade&&review?.correctChoice===index?"border-emerald-400 bg-emerald-50":answers[question.id]===index?"border-amber-500 bg-amber-50":"border-slate-200 hover:bg-slate-50"}`}>
            <input type="radio" className="mt-1 accent-amber-500" name={`pro-q-${question.id}`} checked={answers[question.id]===index}
              onChange={()=>setAnswers(old=>({...old,[question.id]:index}))}/>
            <span className="text-slate-800">{String.fromCharCode(65+index)}. {option}</span>
          </label>)}</div>
        </fieldset>
        {grade&&review&&<p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-800"><strong>{review.correctChoice===review.chosenChoice?"✓ Correct answer.":"Review:"}</strong> Answer {String.fromCharCode(65+review.correctChoice)}. {review.explanation}</p>}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button type="button" disabled={step===0||busy} onClick={()=>setStep(n=>n-1)}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 disabled:opacity-35">← Back</button>
          {step<exam.questions.length-1
            ? <button type="button" disabled={busy||(!grade&&answers[question.id]===undefined)} onClick={()=>setStep(n=>n+1)}
                className="rounded-xl bg-[#071B33] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">Next →</button>
            : grade
              ? <button type="button" disabled={busy} onClick={()=>void newSet()} className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950">New questions ↻</button>
              : <button type="button" disabled={busy||count!==exam.questionCount} onClick={()=>void finish()}
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40">{busy?"Grading...":"Finish & see result"}</button>}
        </div>
        {!grade&&<button type="button" disabled={busy} onClick={()=>{if(count===0||window.confirm("Start a different set? Your current answers will be discarded."))void newSet();}}
          className="mt-4 text-sm text-slate-700 underline underline-offset-4">Refresh eight questions</button>}
      </div>}
      {error&&<p className="mt-4 text-sm text-rose-700" role="alert">{error}</p>}
    </section>
  </div>;
}
