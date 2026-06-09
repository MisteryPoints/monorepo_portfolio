import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const experienceData = [
  {
    position: "Analista Sr Gestiones de Cobros",
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
    position: "ING II Operaciones Móviles",
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
    position: "Analista de Operaciones Móviles",
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
    position: "Analista Prevencion y Proyectos Móviles",
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
    position: "Software Developer",
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
    position: "IT Intern",
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

const Details = ({ position, company, companyLink, time, address, work }: {
  position: string;
  company: string;
  companyLink: string;
  time: string;
  address: string;
  work: string[];
}) => {
  const ref = useRef(null);
  return (
    <li ref={ref} className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <h3 className="capitalize font-bold text-2xl text-white">
          {position}&nbsp;
          <a href={companyLink} target="_blank" className="text-purple-500 capitalize">
            @{company}
          </a>
        </h3>
        <span className="capitalize font-medium text-slate-400">
          {time} | {address}
        </span>
        <ul className="mt-4 space-y-2">
          {work.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300">
              <span className="text-purple-400 mt-1.5 flex-shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </li>
  );
};

const ExperienceTimeline = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center start']
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  return (
    <div className="my-40">
      <h2 className="font-bold text-5xl md:text-7xl mb-32 w-full text-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Experience
        </span>
      </h2>

      <div ref={ref} className="w-[75%] mx-auto relative">
        <motion.div
          style={{ scaleY }}
          className="absolute left-9 top-0 w-[4px] h-full bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 origin-top shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        />

        <ul className="w-full flex flex-col items-start justify-between ml-4">
          {experienceData.map((exp, i) => (
            <Details key={i} {...exp} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExperienceTimeline;
