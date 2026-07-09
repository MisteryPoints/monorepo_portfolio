import { useTranslation } from '@/lib/translations';

interface Experience {
  position: string;
  company: string;
  companyLink: string;
  time: string;
  address: string;
  work: string[];
}

const experienceData_en: Experience[] = [
  {
    position: "Senior Software Engineer — Accounts Receivable Automation",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Aug 2024 — Present",
    address: "Remote",
    work: [
      "Maintained and optimized automated accounts receivable assignment cycle for managers using SAS and Python to ensure efficiency",
      "Developed automated reporting generating strategic reports in real time, supporting operational decisions",
      "Complied with Dominican Telecommunications Institute (Indotel) regulations, integrating regulatory validations into processes to reduce risk",
      "Automated management of client portfolios and legal managers, improving case distribution and collection prioritization",
      "Designed analytical and automated systems with SAS, procedures, and Python (Selenium), improving collections IVR with predictive reports, generating +$3MM in recoveries (+20% efficiency)",
      "Implemented omnichannel contact (SMS/email/WhatsApp) with dynamic templates, reducing involuntary cancellations by 15% and optimizing case assignment by 30%"
    ]
  },
  {
    position: "Software Engineer II — Mobile Operations & Internal Tools",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Dec 2023 — Aug 2024",
    address: "Santo Domingo, DN, Dominican Republic",
    work: [
      "Developed an internal documentation portal using React, Next.js, and Go, reducing training times by 40%",
      "Implemented proactive fault detection systems with automated alerts, reducing incident resolution time by 60% and eliminating data packet discrepancies generating losses of +$50K annually",
      "Ensured provisioning of Voice/Data/SMS lines and services with automated validations, improving end-customer experience",
      "Led development of solutions for a provisioning transaction queue, reducing probability of provisioning issues by 40%"
    ]
  },
  {
    position: "Software Engineer — Mobile Operations & Data Analytics",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Sep 2020 — Dec 2023",
    address: "Santo Domingo, DN, Dominican Republic",
    work: [
      "Designed numerical inventory management systems using SAS, SQL, and XML APIs, achieving 99.7% accuracy in inventory of 5M+ numbers, reducing discrepancies by 28%",
      "Automated processes with VBA and SAS Macros, reducing reporting times by 50%, and developed interactive HTML dashboards for operational decisions",
      "Implemented validation pipelines reducing errors in mobile services by 30%, generating 700+ annual savings hours and supporting 20% reduction in provisioning incidents"
    ]
  },
  {
    position: "Software Engineer — Mobile Projects & Reliability",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Mar 2018 — Sep 2020",
    address: "Santo Domingo, DN, Dominican Republic",
    work: [
      "Coordinated production outage resolution, reducing critical incidents by 30% and downtime by 40% through nightly support and rollbacks",
      "Assisted Development team in implementing mobile solutions, preventing mobile provisioning outages and improving reported case incidence by 30%",
      "Participated in mobile projects with automated testing (Postman, CI/CD), reducing crashes by 60% and saving $50K annually in outages"
    ]
  },
  {
    position: "Full-Stack Developer",
    company: "Quickarr",
    companyLink: "#",
    time: "May 2017 — Mar 2018",
    address: "Santo Domingo, DN, Dominican Republic",
    work: [
      "Developed an invoicing system with JavaScript and Go, integrating inventory and dashboards with database connection, increasing operational efficiency by 40% and profits by 25% (+$17K)",
      "Reduced accounting errors with real-time data and automated purchase planning, avoiding stockouts"
    ]
  },
  {
    position: "Software Engineering Intern",
    company: "Laboratorios Rowe",
    companyLink: "#",
    time: "Feb 2017 — May 2017",
    address: "Los Alcarrizos, Santo Domingo, Dominican Republic",
    work: [
      "Collaborated on a Java inventory application, connecting it to FinTech for pricing and PLC/machinery maintenance, reducing downtime by 25% ($2,500/hour) and corrective costs by 20%",
      "Improved operational efficiency by 10-20% and facilitated regulatory compliance with traceability"
    ]
  }
];

const experienceData_es: Experience[] = [
  {
    position: "Ingeniero de Software Senior — Automatización de Cuentas por Cobrar",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Ago 2024 — Presente",
    address: "Remoto",
    work: [
      "Mantuve y optimicé el ciclo automatizado de asignación de cuentas por cobrar para gestores usando SAS y Python para garantizar eficiencia",
      "Desarrollé informes automatizados generando reportes estratégicos en tiempo real, apoyando decisiones operativas",
      "Cumplí con regulaciones del Instituto Dominicano de las Telecomunicaciones (Indotel), integrando validaciones regulatorias en los procesos para reducir riesgos",
      "Automaticé la gestión de carteras de clientes y gestores legales, mejorando la distribución de casos y la priorización de cobros",
      "Diseñé sistemas analíticos y automatizados con SAS, procedimientos y Python (Selenium), mejorando el IVR de cobros con reportes predictivos, generando +$3MM en recuperaciones (+20% eficiencia)",
      "Implementé contacto omnicanal (SMS/email/WhatsApp) con plantillas dinámicas, reduciendo cancelaciones involuntarias en 15% y optimizando la asignación de casos en 30%"
    ]
  },
  {
    position: "Ingeniero de Software II — Operaciones Móviles y Herramientas Internas",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Dic 2023 — Ago 2024",
    address: "Santo Domingo, DN, República Dominicana",
    work: [
      "Desarrollé un portal de documentación interna usando React, Next.js y Go, reduciendo tiempos de capacitación en 40%",
      "Implementé sistemas proactivos de detección de fallas con alertas automatizadas, reduciendo tiempo de resolución de incidentes en 60% y eliminando discrepancias de paquetes de datos que generaban pérdidas de +$50K anuales",
      "Aseguré el aprovisionamiento de líneas y servicios de Voz/Datos/SMS con validaciones automatizadas, mejorando la experiencia del cliente final",
      "Lideré el desarrollo de soluciones para una cola de transacciones de aprovisionamiento, reduciendo la probabilidad de problemas de aprovisionamiento en 40%"
    ]
  },
  {
    position: "Ingeniero de Software — Operaciones Móviles y Analítica de Datos",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Sep 2020 — Dic 2023",
    address: "Santo Domingo, DN, República Dominicana",
    work: [
      "Diseñé sistemas de inventario numérico usando SAS, SQL y APIs XML, logrando 99.7% de precisión en inventario de 5M+ números, reduciendo discrepancias en 28%",
      "Automaticé procesos con VBA y Macros SAS, reduciendo tiempos de reportes en 50%, y desarrollé dashboards HTML interactivos para decisiones operativas",
      "Implementé pipelines de validación reduciendo errores en servicios móviles en 30%, generando 700+ horas de ahorro anuales y apoyando reducción de 20% en incidentes de aprovisionamiento"
    ]
  },
  {
    position: "Ingeniero de Software — Proyectos Móviles y Confiabilidad",
    company: "Claro RD",
    companyLink: "https://www.claro.com.do",
    time: "Mar 2018 — Sep 2020",
    address: "Santo Domingo, DN, República Dominicana",
    work: [
      "Coordiné la resolución de interrupciones de producción, reduciendo incidentes críticos en 30% y tiempo de inactividad en 40% mediante soporte nocturno y rollbacks",
      "Asistí al equipo de Desarrollo en la implementación de soluciones móviles, previniendo interrupciones de aprovisionamiento móvil y mejorando la incidencia de casos reportados en 30%",
      "Participé en proyectos móviles con pruebas automatizadas (Postman, CI/CD), reduciendo caídas en 60% y ahorrando $50K anuales en interrupciones"
    ]
  },
  {
    position: "Desarrollador Full-Stack",
    company: "Quickarr",
    companyLink: "#",
    time: "May 2017 — Mar 2018",
    address: "Santo Domingo, DN, República Dominicana",
    work: [
      "Desarrollé un sistema de facturación con JavaScript y Go, integrando inventario y dashboards con conexión a base de datos, aumentando la eficiencia operativa en 40% y ganancias en 25% (+$17K)",
      "Reduje errores contables con datos en tiempo real y planificación de compras automatizada, evitando desabastecimientos"
    ]
  },
  {
    position: "Pasante de Ingeniería de Software",
    company: "Laboratorios Rowe",
    companyLink: "#",
    time: "Feb 2017 — May 2017",
    address: "Los Alcarrizos, Santo Domingo, República Dominicana",
    work: [
      "Colaboré en una aplicación de inventario en Java, conectándola a FinTech para precios y mantenimiento de PLC/maquinaria, reduciendo tiempo de inactividad en 25% ($2,500/hora) y costos correctivos en 20%",
      "Mejoré la eficiencia operativa en 10-20% y facilité el cumplimiento regulatorio con trazabilidad"
    ]
  }
];

const TimelineItem = ({ position, company, companyLink, time, address, work }: Experience) => {
  return (
    <div className="relative pl-8 pb-12 last:pb-0">
      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 z-10" />
      <div className="absolute left-[5px] top-3 bottom-0 w-px bg-slate-800" />

      <div>
        <h3 className="text-lg font-semibold text-white">
          {position}{' '}
          <a href={companyLink} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
            @{company}
          </a>
        </h3>
        <span className="text-sm text-slate-500">
          {time} | {address}
        </span>
        <ul className="mt-3 space-y-1.5">
          {work.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-purple-400 mt-1 flex-shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ExperienceTimeline = () => {
  const { t, lang } = useTranslation();
  const data = lang === 'es' ? experienceData_es : experienceData_en;

  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('experience.title')}
          </h2>
          <div className="w-12 h-px bg-slate-700 mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto">
          {data.map((exp, i) => (
            <TimelineItem key={i} {...exp} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceTimeline;
