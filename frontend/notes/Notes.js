   const notes = [
      {id:'1',title:'Análise Anatômica - Proporções de Membros',category:'anatomico',content:'Braços relativamente longos ...',updatedAt:'2025-01-02',ai:true},
      {id:'2',title:'Perfil Psicológico - Resposta ao Stress',category:'psicologico',content:'Atleta demonstra melhor performance ...',updatedAt:'2024-12-27',ai:true},
      {id:'3',title:'Lesão Ombro Esquerdo - Histórico',category:'anatomico',content:'Histórico de tendinite ...',updatedAt:'2024-11-30',ai:false},
      {id:'4',title:'Preferência de Periodização',category:'treino',content:'Respondeu muito bem ao DUP ...',updatedAt:'2024-12-15',ai:true},
      {id:'5',title:'Metas de Competição 2024',category:'geral',content:'Objetivo: participar do campeonato ...',updatedAt:'2024-10-14',ai:false}
    ];

    const notesList = document.getElementById('notesList');
    const detail = document.getElementById('detail');
    const search = document.getElementById('search');
    const filters = document.getElementById('filters');
    let activeCat = 'all';

    function renderList(){
      const q = (search.value||'').toLowerCase();
      notesList.innerHTML = '';
      notes.filter(n => (activeCat==='all' || n.category===activeCat) && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))).forEach(n => {
        const el = document.createElement('div'); el.className='note'; el.dataset.id=n.id;
        el.innerHTML = `<div class="note-title">${n.title}${n.ai? ' <small class="ai-badge">IA</small>':''}</div><div class="small-meta">${n.updatedAt}</div>`;
        el.addEventListener('click', ()=> showDetail(n.id));
        notesList.appendChild(el);
      });
    }

    function showDetail(id){
      const n = notes.find(x=>x.id===id);
      detail.innerHTML = `<h2 class="no-margin">${n.title}</h2><div class="muted small-meta">${n.updatedAt} • ${n.category}</div><p class="detail-content">${n.content}</p>`;
    }

    search.addEventListener('input', renderList);
    filters.querySelectorAll('.chip').forEach(c => { c.addEventListener('click', ()=>{ activeCat = c.dataset.cat; renderList(); }); });
    renderList();
    const categoryConfig = {
      anatomico: 'Anatômico',
      psicologico: 'Psicológico',
      treino: 'Treino',
      geral: 'Geral'
    };

    let selectedNoteId = null;

    function renderList(){
      const q = (search.value||'').toLowerCase();
      notesList.innerHTML = '';
      const filtered = notes.filter(n => (activeCat==='all' || n.category===activeCat) && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)));
      
      if(filtered.length === 0){
        notesList.innerHTML = '<div style="padding:20px;text-align:center;color:#999">Nenhuma anotação encontrada</div>';
        return;
      }
      
      filtered.forEach(n => {
        const el = document.createElement('div');
        el.className = 'note' + (selectedNoteId === n.id ? ' active' : '');
        el.dataset.id = n.id;
        el.innerHTML = `<div class="note-title">${n.title}${n.ai ? '<span class="ai-badge">IA</span>' : ''}</div><div class="small-meta">${n.updatedAt} • ${categoryConfig[n.category]}</div>`;
        el.addEventListener('click', () => showDetail(n.id));
        notesList.appendChild(el);
      });
    }

    function showDetail(id){
      selectedNoteId = id;
      const n = notes.find(x=>x.id===id);
      detail.innerHTML = `
        <div style="border-bottom:1px solid rgba(0,0,0,0.05);margin-bottom:20px;padding-bottom:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="display:inline-block;padding:4px 8px;background:rgba(107,70,193,0.1);border-radius:4px;font-size:12px;color:#6b46c1">${categoryConfig[n.category]}</span>
            ${n.ai ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#6b46c1">Gerado pela IA</span>' : ''}
          </div>
          <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700">${n.title}</h2>
          <div style="font-size:12px;color:#999">${n.updatedAt}</div>
        </div>
        <div style="white-space:pre-wrap;color:#666;line-height:1.6;font-size:14px">${n.content}</div>
      `;
      renderList();
    }

    search.addEventListener('input', renderList);
    filters.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        activeCat = c.dataset.cat;
        filters.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        renderList();
      });
    });
    
    // Mark first category as active
    filters.querySelector('.chip').classList.add('active');
    renderList();