/* =============================================
   PORTFOLIO - Matias Iglesias
   i18n - Espanol / Ingles
   =============================================
   El HTML viene escrito en espanol y se traduce en runtime:
     data-i18n       -> textContent
     data-i18n-html  -> innerHTML (textos con <strong>)
     data-i18n-aria  -> aria-label
   Se guarda la eleccion en localStorage y se avisa al resto
   del JS con el evento 'i18n:change'.
============================================= */
(function initI18n() {
  const STORAGE_KEY = 'portfolio-lang';
  const FALLBACK = 'es';

  const DICT = {
    es: {
      'meta.title': 'Matias Iglesias | Desarrollador Full-Stack',
      'meta.desc': 'Portfolio de Matias Iglesias - Estudiante de Ingenieria en Sistemas y Desarrollador Full-Stack. Proyectos en Next.js, React, NestJS y mas.',

      'nav.about': 'Sobre mi',
      'nav.skills': 'Skills',
      'nav.projects': 'Proyectos',
      'nav.education': 'Educacion',
      'nav.contact': 'Contacto',
      'nav.menu': 'Menu',
      'nav.lang': 'Cambiar idioma',

      'hero.badge': 'Disponible para trabajar',
      'hero.greeting': 'Hola, soy',
      // En espanol el sustantivo va antes; en ingles lo escribe entero el typewriter
      'hero.roleStatic': 'Desarrollador ',
      'hero.desc': 'Estudiante avanzado de <strong>Ingenieria en Sistemas</strong> en ORT Uruguay. Construyo aplicaciones full-stack con tecnologias modernas, desde MVPs presentados a empresas reales hasta herramientas que usan mis companeros de carrera.',
      'hero.btnProjects': 'Ver proyectos',
      'hero.btnContact': 'Contactame',
      'hero.statProjects': 'Proyectos',
      'hero.statTech': 'Tecnologias',
      'hero.statYear': 'Año en curso',

      'about.title': 'Sobre mi',
      'about.who.title': 'Quien soy',
      'about.who.p1': 'Soy estudiante avanzado de <strong>Ingenieria en Sistemas</strong> en la Universidad ORT Uruguay, cursando 4to año. Me apasiona construir software que resuelva problemas reales.',
      'about.who.p2': 'Aunque todavia no tengo experiencia laboral formal, mis proyectos personales hablan por si solos: desde un <strong>sistema de ticketing presentado al director de tecnologia de Penarol</strong>, hasta una <strong>plataforma SaaS de gestion de alquileres</strong> con seguridad de nivel produccion.',
      'about.who.p3': 'Obtuve el titulo intermedio de <strong>Ayudante de Ingeniero en Sistemas</strong> en ORT (2025), lo que respalda mi formacion tecnica y mi capacidad para comunicar ideas con claridad.',
      'about.edu.title': 'Educacion',
      'about.edu.text': 'Ing. en Sistemas - 4to año',
      'about.eng.title': 'Ingles',
      'about.loc.title': 'Ubicacion',
      'about.focus.title': 'Enfoque',
      'about.focus.p': 'Desarrollo <strong>full-stack</strong> con foco en arquitectura limpia, seguridad y experiencia de usuario. Trabajo con metodologias agiles (<strong>Scrum, Kanban</strong>) y practicas de testing (<strong>TDD, BDD</strong>).',

      'skills.title': 'Tech Stack',
      'skills.languages': 'Lenguajes',
      'skills.frontend': 'Frontend',
      'skills.backend': 'Backend & DB',
      'skills.tools': 'Herramientas & Practicas',

      'projects.title': 'Proyectos',
      'projects.filterAll': 'Todos',
      'projects.filterPersonal': 'Personales',
      'projects.filterAcademic': 'Academicos',
      'projects.github': 'Ver en GitHub',
      'projects.site': 'Ver sitio web',
      'projects.prog1': 'Programacion I - ORT',
      'projects.prog2': 'Programacion II - ORT',

      'p.tenant.label': 'Proyecto Destacado',
      'p.tenant.subtitle': 'Plataforma SaaS de gestion de alquileres',
      'p.tenant.desc': 'Sistema full-stack completo para el ciclo de vida de alquileres: publicacion de propiedades, postulaciones, contratos, seguimiento de pagos, calculo de IRPF uruguayo, chat entre partes y sistema de resenas con estrellas. Monorepo con arquitectura limpia y seguridad de nivel produccion (Helmet, rate limiting, JWT rotation, bcrypt).',
      'p.tenant.f1': 'Roles duales (inquilino/propietario)',
      'p.tenant.f2': 'Multi-moneda (UYU/USD/EUR)',
      'p.tenant.f3': 'Calculo IRPF Cat. I',
      'p.tenant.f4': 'Chat en tiempo real',
      'p.tenant.f5': 'Security hardening',

      'p.ticket.label': 'Presentado a Penarol',
      'p.ticket.subtitle': 'Sistema MVP de venta de entradas deportivas',
      'p.ticket.desc': 'MVP de ticketing para eventos deportivos del Club Atletico Penarol. Venta por sectores del estadio, cola virtual para eventos de alta demanda, ventas escalonadas segun categoria de socio y control de acceso via QR. Presentado directamente al director de tecnologia de Penarol.',
      'p.ticket.f1': 'Cola virtual',
      'p.ticket.f2': 'Ventas escalonadas por socio',
      'p.ticket.f3': 'Scanner QR',
      'p.ticket.f4': 'Panel admin',
      'p.ticket.f5': 'Suite de tests completa',
      'p.ticket.f6': 'Auditoria de seguridad',

      'p.ort.label': 'Herramienta para estudiantes',
      'p.ort.subtitle': 'Grafo interactivo de previas de materias',
      'p.ort.desc': 'Herramienta visual interactiva que renderiza todas las materias de Ingenieria en Sistemas (Plan 2019) como nodos conectados por previas. Los estudiantes marcan materias aprobadas y el grafo resalta dinamicamente cuales pueden cursar. Filtrado por año y panel de detalles.',

      'p.plan.label': 'Ingenieria de Software - ORT',
      'p.plan.title': 'Planificacion Semanal',
      'p.plan.subtitle': 'Planificador academico semanal',
      'p.plan.desc': 'Aplicacion web para que estudiantes planifiquen sus ejercicios y tareas por materia a lo largo de la semana. Desarrollo siguiendo metodologia de ingenieria de software: elicitacion de requerimientos, mockups, tests unitarios y evaluacion de calidad.',

      'p.int.title': 'Sistema de Entrevistas',
      'p.int.subtitle': 'Gestion de postulantes y entrevistas laborales',
      'p.int.desc': 'Aplicacion de escritorio en Java con interfaz Swing para gestionar postulantes, evaluadores, entrevistas y puestos de trabajo. Implementa patron Observer, persistencia en archivos y ordenamiento por criterios multiples.',

      'p.board.title': 'Juego de Tablero',
      'p.board.subtitle': 'Juego de mesa con interfaz grafica',
      'p.board.desc': 'Juego de tablero interactivo desarrollado en Java con interfaz grafica Swing. Implementacion de logica de juego, manejo de turnos y renderizado del tablero.',

      'p.claims.title': 'Gestion de Reclamos',
      'p.claims.subtitle': 'Sistema web de reclamos y estadisticas',
      'p.claims.desc': 'Mi primer proyecto: aplicacion web vanilla para gestionar reclamos de empresas. Incluye formularios dinamicos, tablas con ordenamiento, filtros por busqueda, estadisticas en tiempo real y navegacion SPA sin frameworks.',

      'edu.title': 'Educacion',
      'edu.i1.date': '2019 - Actualidad',
      'edu.i1.title': 'Ingenieria en Sistemas',
      'edu.i1.desc': 'Cursando 4to año. Formacion integral en desarrollo de software, arquitectura de sistemas, bases de datos, ingenieria de software y metodologias agiles.',
      'edu.i2.title': 'Ayudante de Ingeniero en Sistemas',
      'edu.i2.desc': 'Titulo intermedio de la carrera de Ingenieria en Sistemas. Formacion en programacion, bases de datos, arquitectura de sistemas, redes y diseño de aplicaciones.',
      'edu.i3.desc': 'Certificacion de nivel B2 en ingles, con capacidad para comunicacion profesional fluida.',
      'edu.i4.title': 'Bachiller en Ingenieria',
      'edu.i4.desc': 'Formacion preuniversitaria con orientacion en ingenieria.',

      'contact.title': 'Contacto',
      'contact.text': 'Estoy buscando mi primera experiencia laboral en desarrollo de software. Si tenes un proyecto interesante o una oportunidad, me encantaria conversar.',
      'contact.hint': 'Toca el icono para copiar al portapapeles',
      'contact.emailAria': 'Enviar email',
      'contact.emailCopy': 'Copiar email',
      'contact.linkedinAria': 'Ver perfil de LinkedIn',
      'contact.linkedinCopy': 'Copiar link de LinkedIn',
      'contact.githubAria': 'Ver perfil de GitHub',
      'contact.githubCopy': 'Copiar link de GitHub',
      'contact.phoneAria': 'Llamar por telefono',
      'contact.phoneCopy': 'Copiar telefono',

      'footer.made': 'Disenado y desarrollado por <strong>Matias Iglesias</strong>',
      'footer.rights': 'Todos los derechos reservados.',

      'toast.copied': 'Copiado: ',
      'toast.error': 'No se pudo copiar, seleccionalo a mano',
    },

    en: {
      'meta.title': 'Matias Iglesias | Full-Stack Developer',
      'meta.desc': "Matias Iglesias' portfolio - Systems Engineering student and full-stack developer. Projects built with Next.js, React, NestJS and more.",

      'nav.about': 'About',
      'nav.skills': 'Skills',
      'nav.projects': 'Projects',
      'nav.education': 'Education',
      'nav.contact': 'Contact',
      'nav.menu': 'Menu',
      'nav.lang': 'Switch language',

      'hero.badge': 'Open to work',
      'hero.greeting': "Hi, I'm",
      'hero.roleStatic': '',
      'hero.desc': 'Advanced <strong>Systems Engineering</strong> student at ORT Uruguay. I build full-stack applications with modern technologies, from MVPs pitched to real companies to tools my classmates actually use.',
      'hero.btnProjects': 'View projects',
      'hero.btnContact': 'Get in touch',
      'hero.statProjects': 'Projects',
      'hero.statTech': 'Technologies',
      'hero.statYear': 'Current year',

      'about.title': 'About me',
      'about.who.title': 'Who I am',
      'about.who.p1': "I'm an advanced <strong>Systems Engineering</strong> student at Universidad ORT Uruguay, currently in my 4th year. I'm passionate about building software that solves real problems.",
      'about.who.p2': "I don't have formal work experience yet, but my personal projects speak for themselves: from a <strong>ticketing system pitched to Penarol's head of technology</strong> to a <strong>rental management SaaS platform</strong> with production-grade security.",
      'about.who.p3': 'I earned the intermediate degree of <strong>Systems Engineering Assistant</strong> at ORT (2025), which backs my technical training and my ability to communicate ideas clearly.',
      'about.edu.title': 'Education',
      'about.edu.text': 'Systems Engineering - 4th year',
      'about.eng.title': 'English',
      'about.loc.title': 'Location',
      'about.focus.title': 'Focus',
      'about.focus.p': '<strong>Full-stack</strong> development focused on clean architecture, security and user experience. I work with agile methodologies (<strong>Scrum, Kanban</strong>) and testing practices (<strong>TDD, BDD</strong>).',

      'skills.title': 'Tech Stack',
      'skills.languages': 'Languages',
      'skills.frontend': 'Frontend',
      'skills.backend': 'Backend & DB',
      'skills.tools': 'Tools & Practices',

      'projects.title': 'Projects',
      'projects.filterAll': 'All',
      'projects.filterPersonal': 'Personal',
      'projects.filterAcademic': 'Academic',
      'projects.github': 'View on GitHub',
      'projects.site': 'View website',
      'projects.prog1': 'Programming I - ORT',
      'projects.prog2': 'Programming II - ORT',

      'p.tenant.label': 'Featured Project',
      'p.tenant.subtitle': 'Rental management SaaS platform',
      'p.tenant.desc': 'Complete full-stack system for the whole rental lifecycle: property listings, applications, contracts, payment tracking, Uruguayan income tax (IRPF) calculation, chat between parties and a star-based review system. Monorepo with clean architecture and production-grade security (Helmet, rate limiting, JWT rotation, bcrypt).',
      'p.tenant.f1': 'Dual roles (tenant/landlord)',
      'p.tenant.f2': 'Multi-currency (UYU/USD/EUR)',
      'p.tenant.f3': 'IRPF Cat. I calculation',
      'p.tenant.f4': 'Real-time chat',
      'p.tenant.f5': 'Security hardening',

      'p.ticket.label': 'Pitched to Penarol',
      'p.ticket.subtitle': 'MVP sports ticketing system',
      'p.ticket.desc': "Ticketing MVP for Club Atletico Penarol's sporting events. Sales by stadium section, virtual queue for high-demand events, tiered sales by membership category and QR-based access control. Pitched directly to Penarol's head of technology.",
      'p.ticket.f1': 'Virtual queue',
      'p.ticket.f2': 'Tiered sales by membership',
      'p.ticket.f3': 'QR scanner',
      'p.ticket.f4': 'Admin panel',
      'p.ticket.f5': 'Full test suite',
      'p.ticket.f6': 'Security audit',

      'p.ort.label': 'Tool for students',
      'p.ort.subtitle': 'Interactive course prerequisite graph',
      'p.ort.desc': "Interactive visual tool that renders every Systems Engineering course (2019 curriculum) as nodes connected by prerequisites. Students mark the courses they've passed and the graph dynamically highlights which ones they can take next. Filtering by year and a details panel.",

      'p.plan.label': 'Software Engineering - ORT',
      'p.plan.title': 'Weekly Planner',
      'p.plan.subtitle': 'Weekly academic planner',
      'p.plan.desc': 'Web app for students to plan their exercises and assignments by course across the week. Built following software engineering methodology: requirements elicitation, mockups, unit tests and quality evaluation.',

      'p.int.title': 'Interview System',
      'p.int.subtitle': 'Applicant and job interview management',
      'p.int.desc': 'Java desktop application with a Swing interface to manage applicants, evaluators, interviews and job openings. Implements the Observer pattern, file-based persistence and sorting by multiple criteria.',

      'p.board.title': 'Board Game',
      'p.board.subtitle': 'Board game with a graphical interface',
      'p.board.desc': 'Interactive board game built in Java with a Swing graphical interface. Game logic, turn handling and board rendering.',

      'p.claims.title': 'Complaint Management',
      'p.claims.subtitle': 'Web system for complaints and statistics',
      'p.claims.desc': 'My first project: a vanilla web app to manage company complaints. Includes dynamic forms, sortable tables, search filters, real-time statistics and SPA navigation without frameworks.',

      'edu.title': 'Education',
      'edu.i1.date': '2019 - Present',
      'edu.i1.title': 'Systems Engineering',
      'edu.i1.desc': 'Currently in 4th year. Comprehensive training in software development, systems architecture, databases, software engineering and agile methodologies.',
      'edu.i2.title': 'Systems Engineering Assistant',
      'edu.i2.desc': 'Intermediate degree within the Systems Engineering program. Training in programming, databases, systems architecture, networks and application design.',
      'edu.i3.desc': 'B2-level English certification, with the ability to communicate fluently in professional contexts.',
      'edu.i4.title': 'High School Diploma, Engineering track',
      'edu.i4.desc': 'Pre-university education with an engineering focus.',

      'contact.title': 'Contact',
      'contact.text': "I'm looking for my first job in software development. If you have an interesting project or an opportunity, I'd love to talk.",
      'contact.hint': 'Tap the icon to copy to the clipboard',
      'contact.emailAria': 'Send email',
      'contact.emailCopy': 'Copy email',
      'contact.linkedinAria': 'View LinkedIn profile',
      'contact.linkedinCopy': 'Copy LinkedIn link',
      'contact.githubAria': 'View GitHub profile',
      'contact.githubCopy': 'Copy GitHub link',
      'contact.phoneAria': 'Call by phone',
      'contact.phoneCopy': 'Copy phone number',

      'footer.made': 'Designed and built by <strong>Matias Iglesias</strong>',
      'footer.rights': 'All rights reserved.',

      'toast.copied': 'Copied: ',
      'toast.error': "Couldn't copy, please select it manually",
    },
  };

  // Palabras del typewriter del hero. En ingles el sustantivo va al final,
  // asi que la frase se escribe entera (ver 'hero.roleStatic')
  const ROLES = {
    es: ['Full-Stack', 'Frontend', 'Backend', 'de Software'],
    en: ['Full-Stack Developer', 'Frontend Developer', 'Backend Developer', 'Software Developer'],
  };

  let current = FALLBACK;

  function t(key) {
    const table = DICT[current] || DICT[FALLBACK];
    return table[key] != null ? table[key] : (DICT[FALLBACK][key] != null ? DICT[FALLBACK][key] : key);
  }

  function detect() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { /* modo privado */ }
    if (saved && DICT[saved]) return saved;
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return nav.startsWith('es') ? 'es' : 'en';
  }

  function setMeta(name, value) {
    const el = document.querySelector(`meta[${name}]`);
    if (el) el.setAttribute('content', value);
  }

  function apply(lang) {
    current = DICT[lang] ? lang : FALLBACK;
    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.title = t('meta.title');
    setMeta('name="description"', t('meta.desc'));
    setMeta('property="og:title"', t('meta.title'));
    setMeta('property="og:description"', t('meta.desc'));

    document.querySelectorAll('.lang-opt').forEach(opt => {
      const on = opt.dataset.lang === current;
      opt.classList.toggle('active', on);
      opt.setAttribute('aria-current', String(on));
    });

    try { localStorage.setItem(STORAGE_KEY, current); } catch (_) { /* modo privado */ }

    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: current } }));
  }

  // API para el resto del JS (typewriter, toasts)
  window.i18n = {
    t,
    lang: () => current,
    roles: () => ROLES[current] || ROLES[FALLBACK],
    set: apply,
  };

  const btn = document.getElementById('lang-switch');
  if (btn) {
    btn.addEventListener('click', (e) => {
      // Si tocaste una de las dos siglas va directo a ese idioma; si no, alterna
      const picked = e.target.closest('[data-lang]');
      apply(picked ? picked.dataset.lang : (current === 'es' ? 'en' : 'es'));
    });
  }

  apply(detect());
})();
