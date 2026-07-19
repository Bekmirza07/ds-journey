import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, GithubAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, doc, onSnapshot, setDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ---------------------------------------------------------------------------
// PLAN DATA
// ---------------------------------------------------------------------------
const PLAN = [
  { phase:1, title:"Foundations & Software Hygiene", goal:"Close the \u201cnotebook coder\u201d gap.", weeks:[
    {w:1, focus:"Python refresh + OOP basics", hours:6, topics:"Functions, classes, modules, virtual envs", resources:[["Corey Schafer OOP playlist","https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc"]],
      done:["Old script refactored into functions/classes","Code runs from a .py module, not just a notebook","Pushed to GitHub with a short README"],
      stretch:"Add type hints to every function you wrote."},
    {w:2, focus:"NumPy properly", hours:8, topics:"Broadcasting, vectorization, indexing, why pandas/sklearn rely on it", resources:[["NumPy quickstart","https://numpy.org/doc/stable/user/quickstart.html"],["freeCodeCamp NumPy course","https://www.youtube.com/watch?v=QUT1VHiLmmI"]],
      done:["Rewrote one pandas script using vectorized NumPy","Timed loop version vs vectorized version","Short note on why vectorization is faster"],
      stretch:"Implement one operation (e.g. a distance matrix) using pure NumPy broadcasting, no loops."},
    {w:3, focus:"Git/GitHub for real", hours:5, topics:"Branches, commits, .gitignore, README writing", resources:[["freeCodeCamp Git & GitHub course","https://www.freecodecamp.org/news/git-and-github-for-beginners/"]],
      done:["Thesis clustering code pushed as its own repo","README explains what the project does and how to run it","At least 3 separate meaningful commits, not one big dump"],
      stretch:"Open a pull request on your own repo and merge it, just to practice the workflow."},
    {w:4, focus:"Advanced SQL", hours:8, topics:"Window functions, CTEs, query optimization", resources:[["Mode SQL Tutorial","https://mode.com/sql-tutorial/"],["LeetCode SQL 50","https://leetcode.com/studyplan/top-sql-50/"]],
      done:["15 LeetCode SQL problems solved","Can explain a window function without looking it up","Solutions saved somewhere you can review later"],
      stretch:"Solve 3 problems a second way (e.g. subquery vs window function) and compare."},
    {w:5, focus:"Statistics refresh", hours:6, topics:"Hypothesis testing, confidence intervals, A/B testing logic", resources:[["StatQuest \u2014 Stats Fundamentals","https://www.youtube.com/@statquest"]],
      done:["1-page notes doc on A/B testing written","Can explain p-value and confidence interval in plain language","Worked through 2 practice hypothesis-testing problems"],
      stretch:"Design a hypothetical A/B test for something at your logistics job \u2014 write the null and alternative hypotheses."},
    {w:6, focus:"Advanced pandas \u2192 production-grade", hours:8, topics:"Method chaining, pipe(), memory optimization", resources:[["Effective Pandas by Matt Harrison","https://store.metasnake.com/effective-pandas-book"]],
      done:["Messy notebook rewritten as a clean pipeline script","Used method chaining or pipe() at least once","Script runs top to bottom with no manual notebook steps"],
      stretch:"Profile the script's memory usage and reduce it with dtype optimization."},
    {w:7, focus:"Testing & clean code", hours:6, topics:"pytest basics, docstrings, type hints", resources:[["Real Python: Testing Your Code","https://realpython.com/python-testing/"]],
      done:["pytest installed and configured","At least 3 tests written for your Week 6 script","Docstrings added to all functions"],
      stretch:"Add a GitHub Actions workflow that runs your tests automatically on push."},
  ]},
  { phase:2, title:"Core Machine Learning", goal:"Build, evaluate, and explain models end-to-end.", weeks:[
    {w:8, focus:"ML fundamentals", hours:8, topics:"Supervised vs unsupervised, bias-variance tradeoff", resources:[["Andrew Ng ML Specialization (audit free)","https://www.coursera.org/specializations/machine-learning-introduction"]],
      done:["Course 1 of the specialization completed","Notes doc written in your own words","Can explain bias-variance tradeoff without notes"],
      stretch:"Explain overfitting using an analogy from economics or logistics."},
    {w:9, focus:"Regression deep dive", hours:10, topics:"Linear/logistic regression, regularization", resources:[["Hands-On ML \u2014 A. G\u00e9ron, Ch. 3\u20134","https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/"]],
      done:["Thesis regression rebuilt in scikit-learn","Coefficients compared to your original R output","Any differences explained in writing"],
      stretch:"Add Ridge and Lasso versions and compare coefficients to plain OLS."},
    {w:10, focus:"Tree-based models", hours:12, topics:"Random Forest, XGBoost/LightGBM", resources:[["StatQuest tree playlist","https://www.youtube.com/@statquest"],["Kaggle Learn: Intermediate ML","https://www.kaggle.com/learn/intermediate-machine-learning"]],
      done:["Model trained (Random Forest or XGBoost)","README written explaining the approach","Results interpreted in plain language","Code pushed to GitHub"],
      stretch:"Try LightGBM instead of Random Forest and compare performance."},
    {w:11, focus:"Feature engineering, part 1", hours:8, topics:"Encoding, scaling, missing data", resources:[["Kaggle Learn: Feature Engineering","https://www.kaggle.com/learn/feature-engineering"]],
      done:["5 new features engineered on a CIS/World Bank dataset","Missing data handled with a documented strategy","Before/after model performance comparison done"],
      stretch:"Try target encoding on one categorical feature and check for leakage risk."},
    {w:12, focus:"Feature engineering, part 2", hours:8, topics:"Feature selection, interaction terms, why features usually matter more than model choice", resources:[["Same course, second half + a Kaggle winning-solution writeup","https://www.kaggle.com/learn/feature-engineering"]],
      done:["Feature selection applied (e.g. importance ranking)","Written explanation of why each feature helped or didn't","At least one interaction term tested"],
      stretch:"Read one Kaggle winning-solution writeup and note 2 feature ideas you hadn't considered."},
    {w:13, focus:"Model evaluation & tuning", hours:10, topics:"Cross-validation, ROC-AUC, GridSearch/Optuna", resources:[["Hands-On ML, Ch. 3 evaluation sections","https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/"]],
      done:["Full evaluation report written (metrics + interpretation)","Cross-validation used, not just one train/test split","At least one hyperparameter search run"],
      stretch:"Compare CV results across 3 different random seeds to check stability."},
    {w:14, focus:"Unsupervised learning deep dive", hours:8, topics:"DBSCAN, hierarchical clustering \u2014 alongside K-Means & PCA you already know", resources:[["StatQuest clustering playlist","https://www.youtube.com/@statquest"]],
      done:["Second clustering method applied (DBSCAN or hierarchical)","Results compared to your original K-Means clusters","Comparison written up with visuals"],
      stretch:"Cluster on PCA-reduced features and see if cluster quality changes."},
    {w:15, focus:"Time series + NLP intro", hours:10, topics:"Deepen ARIMA/SARIMA; basic text classification / sentiment", resources:[["Kaggle Learn: Time Series","https://www.kaggle.com/learn/time-series"],["Kaggle Learn: NLP","https://www.kaggle.com/learn/natural-language-processing"]],
      done:["Economic indicator forecast produced","Small NLP project built (sentiment or classification)","Both pushed to GitHub with brief write-ups"],
      stretch:"Compare your ARIMA/SARIMA forecast to a simple Prophet forecast on the same series."},
  ]},
  { phase:3, title:"Applied Skills, Visualization & Deployment", goal:"Prove you can ship something a company could use.", weeks:[
    {w:16, focus:"APIs & data pulling", hours:8, topics:"requests, calling public APIs (World Bank, IMF)", resources:[["Real Python: Web Scraping","https://realpython.com/beautiful-soup-web-scraper-python/"]],
      done:["Live data pulled from a World Bank or IMF API","Script handles errors (bad response, missing data)","Data saved locally in a reusable format"],
      stretch:"Wrap the API call in a small class so it's reusable across projects."},
    {w:17, focus:"Interactive visualization", hours:6, topics:"Plotly for interactive charts; Altair as an optional lighter alternative", resources:[["Plotly Python docs","https://plotly.com/python/"]],
      done:["One static chart rebuilt in Plotly","Chart includes hover detail or filtering","Embedded in a notebook or small app"],
      stretch:"Rebuild the same chart in Altair and compare which reads better for your data."},
    {w:18, focus:"Cloud fundamentals (no exam yet)", hours:9, topics:"Cloud concepts, S3, basic compute, IAM", resources:[["AWS Cloud Practitioner Essentials","https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/"]],
      done:["AWS account set up","Dataset uploaded to and read from S3 in a script","Basic IAM permissions understood, not using root credentials"],
      stretch:"Set up a second S3 bucket with restricted access and test the permission boundary."},
    {w:19, focus:"Docker", hours:10, topics:"Dockerfile basics, containerizing a Python app, docker-compose (optional)", resources:[["Docker \u2014 Get Started guide","https://docs.docker.com/get-started/"]],
      done:["Dockerfile written for one existing script/API","Image builds successfully","Container runs and produces the expected output"],
      stretch:"Add docker-compose to run your app alongside a database container."},
    {w:20, focus:"Model deployment", hours:10, topics:"FastAPI, serving a model as an API, run it inside your Week 19 container", resources:[["FastAPI official tutorial","https://fastapi.tiangolo.com/tutorial/"]],
      done:["FastAPI endpoint serving a model","Endpoint runs inside your Week 19 container","Tested with at least 3 different inputs"],
      stretch:"Add basic input validation and a health-check endpoint."},
    {w:21, focus:"Dashboards for DS", hours:9, topics:"Streamlit for interactive ML demos", resources:[["Streamlit docs + 30 Days of Streamlit","https://30days.streamlit.app/"]],
      done:["Clustering or time-series project turned into a Streamlit app","App runs locally without errors","Deployed or at least shareable (Streamlit Cloud or similar)"],
      stretch:"Add an interactive filter or slider that changes the model output live."},
  ]},
  { phase:4, title:"Capstone Project", goal:"One project that showcases nearly everything above, tied to your background.", capstone:true, weeks:[
    {w:22, focus:"Data layer: ETL + PostgreSQL", hours:15, topics:"World Bank API, IMF API, UN Comtrade \u2192 PostgreSQL schema + ETL script", resources:[["World Bank API","https://data.worldbank.org/"],["UN Comtrade","https://comtrade.un.org/"]],
      done:["ETL script pulling from World Bank, IMF, and UN Comtrade","Data loaded into a PostgreSQL schema you designed","Pipeline reruns without manual fixes"],
      stretch:"Schedule the ETL with a simple cron job or a lightweight Airflow setup."},
    {w:23, focus:"Modeling + dashboard", hours:15, topics:"Forecasting model (extend Week 15 work) + Streamlit frontend with Plotly charts", resources:[["Streamlit docs","https://docs.streamlit.io/"]],
      done:["Forecasting model built on the capstone data","Streamlit dashboard displaying results with Plotly charts","Dashboard reads from PostgreSQL, not a static file"],
      stretch:"Add a model comparison view, e.g. ARIMA vs Random Forest forecast side by side."},
    {w:24, focus:"Infra + polish", hours:15, topics:"Docker, basic GitHub Actions CI, README, architecture diagram", resources:[["GitHub Actions quickstart","https://docs.github.com/en/actions/quickstart"]],
      done:["Project fully Dockerized","Basic GitHub Actions CI running tests on push","README + architecture diagram written","LinkedIn post published explaining the project"],
      stretch:"Record a 2-minute screen walkthrough of the dashboard for your portfolio."},
  ]},
  { phase:5, title:"Interview Prep & Communication", goal:"Technical skill gets you the interview \u2014 explaining your reasoning gets you the offer.", weeks:[
    {w:25, focus:"SQL + Python + ML theory drilling", hours:8, topics:"Timed practice, explaining answers out loud, not just solving", resources:[["StrataScratch","https://www.stratascratch.com/"],["DataLemur","https://datalemur.com/"],["Chip Huyen \u2014 ML Interviews Book","https://huyenchip.com/ml-interviews-book/"]],
      done:["10 timed problems solved","Each answer explained out loud, not just solved silently","Weak areas written down for review"],
      stretch:"Time yourself solving 3 problems back-to-back under interview-length pressure."},
    {w:26, focus:"Communication practice", hours:8, topics:"Explaining model choices clearly, case-study framing, resume + LinkedIn polish", resources:[["Tech Interview Handbook \u2014 Resume Guide","https://www.techinterviewhandbook.org/resume/"]],
      done:["5 technical explanations recorded and tightened to 60\u201390 seconds (e.g. why Random Forest vs XGBoost, why R\u00b2 is low)","3 case-study answers drafted linking your econometrics/trade background to a business problem","Resume finalized to one page","LinkedIn profile fully updated"],
      stretch:"Ask a friend or mentor to grill you with 5 surprise follow-up questions."},
  ]},
  { phase:6, title:"Job Search Sprint", goal:"Applications out, interviews booked.", weeks:[
    {w:27, focus:"Targeted applications", hours:8, topics:"EPAM (junior/trainee track), local dev companies, World Bank/ADB/UNDP Tashkent internships, remote DS roles (Himalayas, LinkedIn)", resources:[],
      done:["15+ tailored applications sent","Each application customized, not one generic copy-paste","Application tracker (spreadsheet) set up"],
      stretch:"Message 1 employee at each of your top 3 target companies."},
    {w:28, focus:"Networking + mock interviews", hours:8, topics:"Reach out to 10 people on LinkedIn in DS/analytics roles in Uzbekistan/CIS; do 2 mock interviews", resources:[],
      done:["10 LinkedIn outreach messages sent","2 mock interviews completed","Feedback from mock interviews written down"],
      stretch:"Ask one mock interviewer for a warm introduction to someone at their company."},
  ]},
];

const REVIEW_WEEKS = [4, 8, 12, 16, 20, 24, 28];
function reviewFor(weekNum){
  const month = REVIEW_WEEKS.indexOf(weekNum) + 1;
  return { id: 'review-' + weekNum, label: 'Review \u00b7 Month ' + month, title: 'After Week ' + weekNum + ': Monthly Review' };
}

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------
let currentUser = null;
let unsubscribeDoc = null;
let saveTimer = null;

let state = {
  weeks:{},
  stats:{ projects:0, repos:0, interview:0, applications:0 },
  reviews:{},
  activity:{},      // { "2026-07-19": true, ... } for streaks
  startDate:null,   // ISO date string, set on first save
};

function allWeeks(){ return PLAN.flatMap(p => p.weeks); }
function totalWeeks(){ return allWeeks().length; }
function totalHours(){ return allWeeks().reduce((a,w)=>a+w.hours,0); }
function todayStr(){ return new Date().toISOString().slice(0,10); }

function weekChecks(w){
  const arr = state.weeks[w.w];
  if(!arr || arr.length !== w.done.length) return new Array(w.done.length).fill(false);
  return arr;
}
function isWeekCleared(w){ return weekChecks(w).every(Boolean); }
function loggedHours(){ return allWeeks().reduce((a,w)=> a + (isWeekCleared(w) ? w.hours : 0), 0); }
function computePhaseProgress(phase){
  const done = phase.weeks.filter(isWeekCleared).length;
  return { done, total: phase.weeks.length };
}
function computeOverall(){
  const tot = totalWeeks();
  const done = allWeeks().filter(isWeekCleared).length;
  return { done, total: tot, pct: tot ? Math.round(100*done/tot) : 0 };
}
function currentWeekObj(){ return allWeeks().find(w => !isWeekCleared(w)) || null; }

function computeStreak(){
  const dates = Object.keys(state.activity).filter(d => state.activity[d]).sort();
  if(dates.length === 0) return 0;
  const set = new Set(dates);
  let streak = 0;
  let cursor = new Date();
  // if no activity today, streak still counts through yesterday
  if(!set.has(todayStr())){
    cursor.setDate(cursor.getDate() - 1);
  }
  while(true){
    const ds = cursor.toISOString().slice(0,10);
    if(set.has(ds)){ streak++; cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}

function computeETA(){
  const o = computeOverall();
  if(!state.startDate || o.done === 0) return 'Not enough data yet';
  const start = new Date(state.startDate);
  const daysElapsed = Math.max(1, Math.round((Date.now() - start.getTime()) / 86400000));
  const ratePerDay = o.done / daysElapsed;
  if(ratePerDay <= 0) return 'Not enough data yet';
  const remaining = o.total - o.done;
  const daysNeeded = Math.ceil(remaining / ratePerDay);
  const eta = new Date(Date.now() + daysNeeded * 86400000);
  return eta.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}

// ---------------------------------------------------------------------------
// RENDER
// ---------------------------------------------------------------------------
function renderMission(){
  const o = computeOverall();
  document.getElementById('overallLabel').textContent = o.pct + '% \u00b7 ' + o.done + '/' + o.total + ' weeks cleared';
  document.getElementById('hoursLabel').textContent = loggedHours() + ' / ' + totalHours() + ' hrs logged';
  document.getElementById('routeFill').style.width = o.pct + '%';

  const cw = currentWeekObj();
  document.getElementById('missionCurrent').innerHTML = cw
    ? 'Week <span>' + cw.w + '</span> &mdash; ' + cw.focus
    : '<span>All 28 weeks cleared \ud83c\udf89</span>';

  const s = state.stats;
  const streak = computeStreak();
  const eta = computeETA();
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = `
    <div class="stat-cell readonly"><span class="k">Weeks Cleared</span><div class="v">${o.done}/${o.total}</div></div>
    <div class="stat-cell readonly"><span class="k">Streak</span><div class="v">${streak} \ud83d\udd25</div></div>
    <div class="stat-cell readonly"><span class="k">Est. Completion</span><div class="v" style="font-size:13px;">${eta}</div></div>
    <div class="stat-cell"><span class="k">Projects Completed</span>
      <div class="stat-editable" data-stat="projects"><button data-delta="-1">\u2212</button><div class="v">${s.projects}</div><button data-delta="1">+</button></div></div>
    <div class="stat-cell"><span class="k">GitHub Repositories</span>
      <div class="stat-editable" data-stat="repos"><button data-delta="-1">\u2212</button><div class="v">${s.repos}</div><button data-delta="1">+</button></div></div>
    <div class="stat-cell"><span class="k">Interview Problems Solved</span>
      <div class="stat-editable" data-stat="interview"><button data-delta="-1">\u2212</button><div class="v">${s.interview}</div><button data-delta="1">+</button></div></div>
    <div class="stat-cell"><span class="k">Applications Sent</span>
      <div class="stat-editable" data-stat="applications"><button data-delta="-1">\u2212</button><div class="v">${s.applications}</div><button data-delta="1">+</button></div></div>
  `;
  grid.querySelectorAll('.stat-editable button').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.stat-editable').dataset.stat;
      const delta = parseInt(btn.dataset.delta, 10);
      state.stats[key] = Math.max(0, (state.stats[key]||0) + delta);
      markActivity();
      renderMission();
      queueSave();
    });
  });

  const badgesRow = document.getElementById('badgesRow');
  const badges = PLAN.filter(p => {
    const pr = computePhaseProgress(p);
    return pr.done === pr.total;
  }).map(p => `<span class="badge">\ud83c\udfc6 ${p.title} Complete</span>`);
  badgesRow.innerHTML = badges.join('');

  const nav = document.getElementById('phaseNav');
  nav.innerHTML = '';
  PLAN.forEach(p => {
    const pr = computePhaseProgress(p);
    const chip = document.createElement('button');
    chip.className = 'phase-chip' + (pr.done===pr.total ? ' done' : '');
    chip.textContent = 'P' + p.phase + ' \u00b7 ' + pr.done + '/' + pr.total;
    chip.onclick = () => document.getElementById('phase-'+p.phase)?.scrollIntoView({behavior:'smooth', block:'start'});
    nav.appendChild(chip);
  });
}

function renderReviewBlock(weekNum){
  const rv = reviewFor(weekNum);
  const div = document.createElement('div');
  div.className = 'review';
  div.innerHTML = `
    <div class="review-head"><span class="review-tag">${rv.label}</span><span class="review-title">${rv.title}</span></div>
    <ul><li>What did I learn?</li><li>What am I still weak at?</li><li>Which GitHub project needs polishing?</li></ul>
    <textarea id="${rv.id}" placeholder="Jot your reflection here...">${state.reviews[rv.id] || ''}</textarea>
  `;
  return div;
}

function renderPhases(){
  const root = document.getElementById('phases');
  root.innerHTML = '';
  PLAN.forEach(p => {
    const section = document.createElement('div');
    section.className = 'phase';
    section.id = 'phase-'+p.phase;
    const pr = computePhaseProgress(p);
    section.innerHTML = `
      <div class="phase-head">
        <div class="phase-num">${String(p.phase).padStart(2,'0')}</div>
        <div class="phase-title">${p.title}</div>
        <div class="phase-bar-wrap" id="phasebar-${p.phase}">${pr.done}/${pr.total}</div>
      </div>
      <div class="phase-goal">${p.goal}</div>
    `;
    if(p.capstone){
      const callout = document.createElement('div');
      callout.className = 'capstone-callout';
      callout.innerHTML = `
        <span class="lbl2">Capstone \u2014 Trade Intelligence Dashboard</span>
        <p>Ties economics + the full DS stack together, and extends your thesis directly.</p>
        <ul>
          <li>Data: World Bank, IMF, UN Comtrade APIs \u2014 CIS trade & digital economy indicators</li>
          <li>Storage: PostgreSQL, basic schema design</li>
          <li>Pipeline: Python ETL, reproducible</li>
          <li>Modeling: feature engineering + ML forecasting</li>
          <li>Interface: Streamlit dashboard with Plotly charts</li>
          <li>Infra: Dockerized, basic GitHub Actions CI</li>
        </ul>`;
      section.appendChild(callout);
    }
    p.weeks.forEach(w => {
      const card = document.createElement('div');
      card.className = 'week';
      card.id = 'week-'+w.w;
      const resourcesHtml = w.resources.length
        ? w.resources.map(r => `<a href="${r[1]}" target="_blank" rel="noopener">${r[0]}</a>`).join(' &middot; ')
        : '<span style="color:var(--ink-faint)">\u2014</span>';
      const checks = weekChecks(w);
      const criteriaHtml = w.done.map((d,i) => `
        <div class="criterion">
          <input type="checkbox" id="cb-${w.w}-${i}" data-week="${w.w}" data-idx="${i}" ${checks[i] ? 'checked' : ''}>
          <label for="cb-${w.w}-${i}">${d}</label>
        </div>`).join('');
      card.innerHTML = `
        <div class="week-head" data-toggle="${w.w}">
          <div class="week-num">WK ${String(w.w).padStart(2,'0')}</div>
          <div class="week-focus">${w.focus}</div>
          <div class="week-hours">${w.hours}h</div>
          <div class="stamp">Cleared</div>
          <div class="week-toggle">\u25B8</div>
        </div>
        <div class="week-body">
          <div class="week-body-inner">
            <div class="row"><div class="lbl">Topics</div><div class="val">${w.topics}</div></div>
            <div class="row"><div class="lbl">Resources</div><div class="val">${resourcesHtml}</div></div>
            <div class="done-block"><span class="lbl2">Done means</span>${criteriaHtml}</div>
            <div class="stretch"><b>Stretch</b><br>${w.stretch}</div>
          </div>
        </div>`;
      if(isWeekCleared(w)) card.classList.add('checked');
      section.appendChild(card);
      if(REVIEW_WEEKS.includes(w.w)) section.appendChild(renderReviewBlock(w.w));
    });
    root.appendChild(section);
  });

  document.querySelectorAll('.week-head').forEach(h => {
    h.addEventListener('click', (e) => {
      if(e.target.tagName === 'INPUT') return;
      h.closest('.week').classList.toggle('open');
    });
  });
  document.querySelectorAll('.criterion input[type=checkbox]').forEach(cb => {
    cb.addEventListener('click', (e) => e.stopPropagation());
    cb.addEventListener('change', (e) => {
      const weekNum = e.target.dataset.week;
      const idx = parseInt(e.target.dataset.idx, 10);
      const w = allWeeks().find(w => String(w.w) === weekNum);
      const arr = weekChecks(w).slice();
      arr[idx] = e.target.checked;
      state.weeks[weekNum] = arr;
      document.getElementById('week-'+weekNum).classList.toggle('checked', arr.every(Boolean));
      markActivity();
      renderMission();
      PLAN.forEach(p => {
        if(p.weeks.some(w => String(w.w) === weekNum)){
          const pr = computePhaseProgress(p);
          const el = document.getElementById('phasebar-'+p.phase);
          if(el) el.textContent = pr.done + '/' + pr.total;
        }
      });
      queueSave();
    });
  });
  document.querySelectorAll('.review textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      state.reviews[ta.id] = ta.value;
      queueSave();
    });
  });
}

function markActivity(){
  state.activity[todayStr()] = true;
  if(!state.startDate) state.startDate = todayStr();
}

// ---------------------------------------------------------------------------
// FIRESTORE SYNC
// ---------------------------------------------------------------------------
function setSyncNote(text, cls){
  const el = document.getElementById('syncNote');
  if(!el) return;
  el.textContent = text;
  el.className = 'sync-note' + (cls ? ' ' + cls : '');
}

function queueSave(){
  setSyncNote('Saving\u2026', 'saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if(!currentUser) return;
    try{
      await setDoc(doc(db, 'progress', currentUser.uid), state, { merge:false });
      setSyncNote('Saved to your account \u2713', 'saved');
    }catch(err){
      console.error(err);
      setSyncNote('Save failed \u2014 check connection', '');
    }
  }, 500);
}

function attachDocListener(uid){
  if(unsubscribeDoc) unsubscribeDoc();
  unsubscribeDoc = onSnapshot(doc(db, 'progress', uid), (snap) => {
    if(snap.exists()){
      const data = snap.data();
      state = Object.assign({
        weeks:{}, stats:{projects:0,repos:0,interview:0,applications:0}, reviews:{}, activity:{}, startDate:null
      }, data);
    }
    renderMission();
    renderPhases();
  }, (err) => {
    console.error('Sync error', err);
    setSyncNote('Could not connect to Firestore', '');
  });
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
const gate = document.getElementById('gate');
const appRoot = document.getElementById('appRoot');
const authBar = document.getElementById('authBar');

document.getElementById('googleSignIn').addEventListener('click', () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message)));
document.getElementById('githubSignIn').addEventListener('click', () => signInWithPopup(auth, githubProvider).catch(e => alert(e.message)));
document.getElementById('signOutBtn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if(user){
    gate.classList.add('hidden');
    appRoot.classList.remove('hidden');
    authBar.classList.remove('hidden');
    document.getElementById('userName').textContent = user.displayName || user.email;
    document.getElementById('userAvatar').src = user.photoURL || '';
    attachDocListener(user.uid);
  }else{
    if(unsubscribeDoc) unsubscribeDoc();
    gate.classList.remove('hidden');
    appRoot.classList.add('hidden');
    authBar.classList.add('hidden');
  }
});
