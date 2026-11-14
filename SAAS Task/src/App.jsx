import {useEffect,useMemo,useState} from 'react';
const API='/api';
export default function App(){
 const [orgs,setOrgs]=useState([]),[active,setActive]=useState('');
 const [tasks,setTasks]=useState([]),[orgName,setOrgName]=useState('');
 const [title,setTitle]=useState(''),[priority,setPriority]=useState('Medium');
 const [notice,setNotice]=useState(''),[loading,setLoading]=useState(true);
 const current=orgs.find(o=>o.id===active);
 async function loadOrgs(){
  const r=await fetch(`${API}/organizations`),data=await r.json();
  setOrgs(data);setActive(v=>v&&data.some(o=>o.id===v)?v:data[0]?.id||'');setLoading(false);
 }
 async function loadTasks(id){
  if(!id){setTasks([]);return;}
  const r=await fetch(`${API}/organizations/${id}/tasks`);setTasks(await r.json());
 }
 useEffect(()=>{loadOrgs().catch(()=>{setNotice('Unable to connect to the server.');setLoading(false);});},[]);
 useEffect(()=>{loadTasks(active);},[active]);
 async function addOrg(e){
  e.preventDefault();if(!orgName.trim())return;
  const r=await fetch(`${API}/organizations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:orgName})});
  const data=await r.json();if(!r.ok){setNotice(data.message);return;}
  setOrgs(v=>[...v,data]);setActive(data.id);setOrgName('');setNotice('Workspace created.');
 }
 async function addTask(e){
  e.preventDefault();if(!title.trim()||!active)return;
  const r=await fetch(`${API}/organizations/${active}/tasks`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,priority})});
  const data=await r.json();if(!r.ok){setNotice(data.message);return;}
  setTasks(v=>[data,...v]);setTitle('');setNotice('Task added.');
 }
 async function changeStatus(task,status){
  const r=await fetch(`${API}/tasks/${task.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  const data=await r.json();if(r.ok)setTasks(v=>v.map(t=>t.id===data.id?data:t));
 }
 const groups=useMemo(()=>['To Do','In Progress','Completed'].map(status=>({status,items:tasks.filter(t=>t.status===status)})),[tasks]);
 if(loading)return <main className="loading">Loading...</main>;
 return <div className="layout">
  <aside className="sidebar">
   <div className="brand">MiniSaaS</div>
   <div className="side-label">WORKSPACES</div>
   {orgs.length>0?<select aria-label="Choose workspace" value={active} onChange={e=>setActive(e.target.value)}>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>:<p className="side-hint">No workspaces yet.</p>}
   <form className="create-form" onSubmit={addOrg}>
    <label htmlFor="org-name">New workspace</label>
    <input id="org-name" placeholder="Organization name" value={orgName} onChange={e=>setOrgName(e.target.value)}/>
    <button type="submit">Create workspace</button>
   </form>
   <div className="side-bottom">Team task manager</div>
  </aside>
  <main className="main">
   <header><div><small>WORKSPACE</small><h1>{current?.name||'Your workspaces'}</h1></div><div className="user-mark">U</div></header>
   {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss">×</button></div>}
   {!current?<section className="empty-start"><h2>Create your first workspace</h2><p>Enter an organization name in the left panel to get started. Each workspace keeps its own tasks separate.</p></section>:<>
    <section className="summary">
     <div><span>Total tasks</span><strong>{tasks.length}</strong></div>
     <div><span>To do</span><strong>{tasks.filter(t=>t.status==='To Do').length}</strong></div>
     <div><span>In progress</span><strong>{tasks.filter(t=>t.status==='In Progress').length}</strong></div>
     <div><span>Completed</span><strong>{tasks.filter(t=>t.status==='Completed').length}</strong></div>
    </section>
    <section className="panel">
     <div className="panel-head"><div><h2>Tasks</h2><p>Add tasks and update their status.</p></div></div>
     <form className="task-form" onSubmit={addTask}>
      <input aria-label="Task title" placeholder="Enter a task" value={title} onChange={e=>setTitle(e.target.value)}/>
      <select aria-label="Priority" value={priority} onChange={e=>setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select>
      <button type="submit">Add task</button>
     </form>
     <div className="board">{groups.map(group=><div className="lane" key={group.status}>
      <h3>{group.status}<span>{group.items.length}</span></h3>
      {group.items.length===0&&<p className="empty-lane">No tasks</p>}
      {group.items.map(task=><article className="task" key={task.id}>
       <div className="task-title">{task.title}</div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
       <select aria-label={`Status for ${task.title}`} value={task.status} onChange={e=>changeStatus(task,e.target.value)}><option>To Do</option><option>In Progress</option><option>Completed</option></select>
      </article>)}
     </div>)}</div>
    </section>
    <p className="workspace-note">Workspace ID: <code>{current.id}</code> · Workspace slug: <code>{current.slug}</code></p>
   </>}
   <footer>MiniSaaS · Project workspace</footer>
  </main>
 </div>;
}