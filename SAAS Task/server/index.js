import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const app=express(), PORT=process.env.PORT||5000;
const here=path.dirname(fileURLToPath(import.meta.url));
const folder=path.join(here,'data'), file=path.join(folder,'store.json');
app.use(cors()); app.use(express.json());
if(!fs.existsSync(folder)) fs.mkdirSync(folder,{recursive:true});
if(!fs.existsSync(file)) fs.writeFileSync(file,JSON.stringify({
 organizations:[],
 tasks:[]
},null,2));
const read=()=>JSON.parse(fs.readFileSync(file,'utf8'));
const save=data=>fs.writeFileSync(file,JSON.stringify(data,null,2));
const slugify=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32);

app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.get('/api/organizations',(req,res)=>res.json(read().organizations));
app.post('/api/organizations',(req,res)=>{
 const name=String(req.body.name||'').trim();
 if(!name)return res.status(400).json({message:'Organization name is required.'});
 const db=read(); const base=slugify(name)||'workspace'; let slug=base,n=2;
 while(db.organizations.some(o=>o.slug===slug))slug=`${base}-${n++}`;
 const org={id:`org_${Date.now()}`,name,slug,createdAt:new Date().toISOString()};
 db.organizations.push(org);save(db);res.status(201).json(org);
});
app.get('/api/organizations/:id/tasks',(req,res)=>{
 const db=read();if(!db.organizations.some(o=>o.id===req.params.id))return res.status(404).json({message:'Workspace not found.'});
 res.json(db.tasks.filter(t=>t.organizationId===req.params.id));
});
app.post('/api/organizations/:id/tasks',(req,res)=>{
 const db=read();if(!db.organizations.some(o=>o.id===req.params.id))return res.status(404).json({message:'Workspace not found.'});
 const title=String(req.body.title||'').trim();if(!title)return res.status(400).json({message:'Task title is required.'});
 const task={id:`task_${Date.now()}`,organizationId:req.params.id,title,status:'To Do',priority:['Low','Medium','High'].includes(req.body.priority)?req.body.priority:'Medium'};
 db.tasks.push(task);save(db);res.status(201).json(task);
});
app.patch('/api/tasks/:id',(req,res)=>{
 const db=read(),task=db.tasks.find(t=>t.id===req.params.id);
 if(!task)return res.status(404).json({message:'Task not found.'});
 if(['To Do','In Progress','Completed'].includes(req.body.status))task.status=req.body.status;
 save(db);res.json(task);
});
const dist=path.resolve(here,'../dist');
if(fs.existsSync(dist)){app.use(express.static(dist));app.get('*',(req,res)=>res.sendFile(path.join(dist,'index.html')));}
app.listen(PORT,'0.0.0.0',()=>console.log(`MiniSaaS server running on port ${PORT}`));