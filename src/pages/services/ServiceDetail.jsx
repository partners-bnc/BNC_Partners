import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiEye,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiList,
  FiMail,
  FiMic,
  FiPhone,
  FiChevronDown,
  FiChevronUp,
  FiBookOpen,
  FiUsers
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import { getServiceById } from '../../data/services';
import RequirementVoiceModal from '../../Component/RequirementVoiceModal';

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { country, serviceId } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const mdRowDirection = isRtl ? 'md:flex-row-reverse' : 'md:flex-row';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const iconMargin = isRtl ? 'mr-4' : 'ml-4';
  const sectionPadding = isRtl ? 'pr-8' : 'pl-8';
  const listPadding = isRtl ? 'pr-5' : 'pl-5';
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('know-more');
  const [hoveredHighlight, setHoveredHighlight] = useState(null);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [activeSubService, setActiveSubService] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const service = useMemo(() => {
    const found = getServiceById(serviceId);
    if (!found || !found.country.includes(country)) {
      return null;
    }

    const localizedTitle = t(`servicesData.${found.id}.title`, {
      defaultValue: found.title
    });
    const localizedSummary = t(`servicesData.${found.id}.summary`, {
      defaultValue: found.summary
    });
    const localizedBullets = t(`servicesData.${found.id}.bullets`, {
      returnObjects: true,
      defaultValue: found.bullets
    });
    const localizedDescription = t(`servicesData.${found.id}.description`, {
      returnObjects: true,
      defaultValue: found.description
    });
    const localizedManpower = t(`servicesData.${found.id}.manpowerDescription`, {
      defaultValue: found.manpowerDescription
    });
    const localizedDocuments = t(`servicesData.${found.id}.documents`, {
      returnObjects: true,
      defaultValue: found.documents || []
    });

    return {
      ...found,
      title: localizedTitle,
      summary: localizedSummary,
      bullets: Array.isArray(localizedBullets) ? localizedBullets : found.bullets,
      description: Array.isArray(localizedDescription) ? localizedDescription : found.description,
      manpowerDescription: localizedManpower,
      documents: Array.isArray(localizedDocuments) ? localizedDocuments : found.documents
    };
  }, [country, serviceId, t, i18n.language]);

  const countryLabelMap = {
    india: t('countries.india'),
    'saudi-arabia': t('countries.saudi'),
    other: t('countries.other'),
    global: t('countries.other')
  };
  const countryLabel = countryLabelMap[country] || (country ? country.replace('-', ' ') : '');
  const commonDocuments = [
    {
      label: t('serviceDetail.documentsLabels.bncGlobal'),
      url: 'https://drive.google.com/file/d/1U44K-42bhLuTntT2xOdWAIqBW1KzMMpp/view?usp=sharing'
    }
  ];
  const saudiOnlyDocuments = [
    {
      label: t('serviceDetail.documentsLabels.bncGlobalKsa'),
      url: 'https://drive.google.com/file/d/1XV4OlKqt_7YhIR4B4koFVXYISw7Oa8Er/view?usp=sharing'
    }
  ];

  const sections = [
    {
      key: 'know-more',
      label: t('serviceDetail.sections.knowMore.label'),
      heading: t('serviceDetail.sections.knowMore.heading'),
      description: t('serviceDetail.sections.knowMore.description')
    },
    {
      key: 'manpower',
      label: t('serviceDetail.sections.manpower.label'),
      heading: t('serviceDetail.sections.manpower.heading'),
      description: t('serviceDetail.sections.manpower.description')
    },
    {
      key: 'training',
      label: t('serviceDetail.sections.training.label'),
      heading: t('serviceDetail.sections.training.heading'),
      description: t('serviceDetail.sections.training.description')
    },
    {
      key: 'contact',
      label: t('serviceDetail.sections.contact.label'),
      heading: t('serviceDetail.sections.contact.heading'),
      description: t('serviceDetail.sections.contact.description')
    }
  ];

  const activeSectionData = sections.find((section) => section.key === activeSection) || sections[0];
  const serviceTaglines = {
    'financial-advisory':
      'Earn more by becoming a strategic CFO partner — not just a compliance advisor.',
    'cybersecurity-data-privacy':
      'DPDP is not optional. If you can’t guide clients on data privacy, you lose trust.',
    'risk-advisory':
      'Build governance strength. Become the advisor who protects business continuity.',
    'esg-advisory':
      'ESG opens new advisory income — and positions you as future-ready.',
    'erp-implementation-digital-transformation':
      'Transformation projects mean higher billing and deeper client engagement.',
    'gcc-operation-hub':
      'Help clients scale globally — and expand your service portfolio.',
    'training-workshop':
      'Monthly upskilling makes you the complete new-age consulting partner.',
    'recruitment-manpower-services':
      'Talent solutions create recurring income and long-term client dependence.'
  };
  const knowMoreDescription = serviceTaglines[service?.id] || activeSectionData.description;

  const subServiceDetailsDefault = {
    'financial-advisory': [
      {
        title: 'Virtual CFO Services',
        brief:
          'Not every client can hire a full-time CFO — but every growing business needs strategic financial leadership. We enable you to deliver Virtual CFO capabilities, helping clients with strategy, governance, cash flow control, and performance direction — positioning you as their long-term financial partner.',
        methodologyTitle: 'Understand → Strategise → Execute → Review',
        steps: [
          'Assess financial health and growth objectives',
          'Develop structured financial strategy',
          'Implement governance and reporting systems',
          'Ongoing performance review and advisory'
        ]
      },
      {
        title: 'Budget & Cost Management',
        brief:
          'Uncontrolled costs erode margins silently. We help you guide clients in building disciplined budgeting frameworks and cost optimisation strategies that protect profitability without slowing growth.',
        methodologyTitle: 'Analyse → Allocate → Control → Optimise',
        steps: [
          'Cost structure assessment',
          'Budget framework design',
          'Variance tracking mechanisms',
          'Continuous cost improvement planning'
        ]
      },
      {
        title: 'Financial Planning & Analysis (FP&A)',
        brief:
          'Financial planning is no longer annual forecasting — it is continuous decision intelligence. We empower you to provide structured forecasting, scenario planning, and performance analytics that drive informed business decisions.',
        methodologyTitle: 'Forecast → Model → Evaluate → Advise',
        steps: [
          'Revenue and expense forecasting',
          'Scenario and sensitivity modelling',
          'KPI-driven performance analysis',
          'Strategic advisory insights'
        ]
      },
      {
        title: 'Reporting & MIS',
        brief:
          'Clear reporting builds confidence at the board and investor level. We help you implement structured MIS frameworks that convert raw numbers into actionable business intelligence.',
        methodologyTitle: 'Structure → Standardise → Visualise → Improve',
        steps: [
          'Define reporting requirements',
          'Build standard MIS formats',
          'Dashboard and performance tracking',
          'Ongoing refinement and automation'
        ]
      }
    ],
    'cybersecurity-data-privacy': [
      {
        title: 'ISO/IEC 27001 Certification',
        brief:
          'Information security is now a business expectation. We enable you to guide clients through ISO/IEC 27001 certification, strengthening data protection, governance, and stakeholder trust.',
        methodologyTitle: 'Assess → Design → Implement → Certify',
        steps: [
          'Gap assessment against ISO standards',
          'ISMS framework design',
          'Policy and control implementation',
          'Certification readiness support'
        ]
      },
      {
        title: 'SOC Certification (Type 1 & Type 2)',
        brief:
          'Global clients demand SOC assurance before partnerships. We help you prepare clients for SOC 1/2 (Type 1 & Type 2) compliance — improving credibility and unlocking enterprise opportunities.',
        methodologyTitle: 'Scope → Evaluate → Remediate → Audit Support',
        steps: [
          'Define control scope and readiness',
          'Test internal controls',
          'Implement corrective actions',
          'Coordinate with external auditors'
        ]
      },
      {
        title: 'GDPR Compliance',
        brief:
          'If your clients handle EU data, GDPR compliance is mandatory. We help you structure privacy frameworks that reduce legal exposure and reputational risk.',
        methodologyTitle: 'Map → Align → Protect → Monitor',
        steps: [
          'Data mapping and risk identification',
          'Policy and consent framework alignment',
          'Security control implementation',
          'Ongoing compliance monitoring'
        ]
      },
      {
        title: 'HIPAA Compliance',
        brief:
          'Healthcare data requires strict protection. We support consultants in guiding healthcare and health-tech clients toward HIPAA-compliant systems and safeguards.',
        methodologyTitle: 'Review → Secure → Document → Validate',
        steps: [
          'Risk assessment of health data systems',
          'Administrative and technical safeguards',
          'Documentation and training',
          'Compliance validation'
        ]
      },
      {
        title: 'Global Data Privacy Compliance',
        brief:
          'Data laws are evolving worldwide. We help you equip clients with cross-border privacy frameworks that ensure compliance across multiple jurisdictions.',
        methodologyTitle: 'Identify → Harmonise → Implement → Govern',
        steps: [
          'Multi-country regulatory mapping',
          'Unified privacy framework development',
          'Process integration',
          'Continuous governance oversight'
        ]
      },
      {
        title: 'Cybersecurity Implementation',
        brief:
          'Strategy without execution creates vulnerability. We support real-world cybersecurity implementation — from access controls to system hardening — protecting client infrastructure.',
        methodologyTitle: 'Diagnose → Deploy → Test → Strengthen',
        steps: [
          'Security posture assessment',
          'Technology and control deployment',
          'Penetration and vulnerability testing',
          'Continuous improvement plan'
        ]
      },
      {
        title: 'AI Audit',
        brief:
          'AI adoption brings new risks — bias, privacy breaches, governance gaps. We help you guide clients in auditing AI systems to ensure ethical, compliant, and secure deployment.',
        methodologyTitle: 'Evaluate → Assess Risk → Recommend → Monitor',
        steps: [
          'AI model governance review',
          'Data integrity and bias testing',
          'Risk mitigation recommendations',
          'Ongoing compliance monitoring'
        ]
      }
    ],
    'risk-advisory': [
      {
        title: 'Corporate Governance & Compliance',
        brief:
          'Strong governance builds investor trust and long-term stability. We help consulting firms guide their clients in establishing robust governance structures, regulatory compliance frameworks, and board-level accountability systems — ensuring credibility in a fast-changing regulatory environment.',
        methodologyTitle: 'Assess → Align → Implement → Monitor',
        steps: [
          'Review existing governance and compliance structure',
          'Map regulatory exposure and compliance gaps',
          'Design practical governance frameworks',
          'Support implementation and ongoing monitoring'
        ]
      },
      {
        title: 'Internal Audit & Controls',
        brief:
          'Internal audit is no longer fault-finding — it is value protection. We enable you to deliver risk-based internal audit and control assessments that strengthen financial integrity and operational efficiency for your clients.',
        methodologyTitle: 'Identify → Evaluate → Strengthen → Report',
        steps: [
          'Risk-based audit planning',
          'Control testing and gap identification',
          'Process improvement recommendations',
          'Clear, board-ready reporting'
        ]
      },
      {
        title: 'Policies, SOPs & Process Reengineering',
        brief:
          'Undefined processes create inefficiency and compliance risk. We help you structure, document, and redesign client processes to improve clarity, accountability, and scalability.',
        methodologyTitle: 'Map → Diagnose → Redesign → Standardise',
        steps: [
          'Process mapping workshops',
          'Gap and bottleneck analysis',
          'SOP drafting and policy development',
          'Implementation and change support'
        ]
      },
      {
        title: 'Business Intelligence & Continuous Improvement',
        brief:
          'Data-driven decision-making separates average firms from market leaders. We help you enable clients with structured reporting, dashboards, and performance tracking systems that drive continuous improvement.',
        methodologyTitle: 'Collect → Analyse → Visualise → Optimise',
        steps: [
          'Identify key performance drivers',
          'Build structured reporting frameworks',
          'Implement dashboards and insights',
          'Continuous monitoring and refinement'
        ]
      },
      {
        title: 'IT, Systems & Fraud Risk Audits',
        brief:
          'As businesses digitise, system vulnerabilities increase. We support consultants in assessing IT controls, fraud exposure, and system risks — protecting client assets and reputation.',
        methodologyTitle: 'Review → Test → Detect → Secure',
        steps: [
          'IT system risk assessment',
          'Control environment testing',
          'Fraud risk identification',
          'Remediation roadmap'
        ]
      },
      {
        title: 'Stock & Fixed Asset Verification',
        brief:
          'Asset mismanagement directly impacts profitability. We help you deliver structured verification of stock and fixed assets to ensure financial accuracy and prevent leakage.',
        methodologyTitle: 'Plan → Verify → Reconcile → Report',
        steps: [
          'Physical verification planning',
          'Asset validation and tagging review',
          'Reconciliation with financial records',
          'Exception reporting and corrective guidance'
        ]
      },
      {
        title: 'SAR Reconciliation & Process Review',
        brief:
          'System Application Reports (SAR) and financial reconciliations must align with operational reality. We assist in reviewing reconciliation frameworks to reduce reporting errors and strengthen reliability.',
        methodologyTitle: 'Examine → Reconcile → Rectify → Control',
        steps: [
          'Review reconciliation processes',
          'Identify mismatches and inefficiencies',
          'Recommend corrective mechanisms',
          'Implement stronger review controls'
        ]
      },
      {
        title: 'Third-Party Risk Management',
        brief:
          'Vendors, partners, and outsourced functions introduce hidden risks. We help you equip clients with structured third-party risk assessment frameworks to prevent compliance failures and operational disruption.',
        methodologyTitle: 'Screen → Assess → Monitor → Mitigate',
        steps: [
          'Vendor risk profiling',
          'Due diligence framework design',
          'Ongoing monitoring mechanisms',
          'Risk mitigation planning'
        ]
      }
    ],
    'esg-advisory': [
      {
        title: 'ESG & Sustainability Reporting',
        brief:
          'Investors, regulators, and stakeholders now expect structured ESG disclosures. We enable you to guide clients in building transparent sustainability reports that enhance credibility, valuation, and investor confidence.',
        methodologyTitle: 'Assess → Structure → Report → Improve',
        steps: [
          'ESG maturity assessment',
          'Framework alignment (global standards)',
          'Data consolidation and reporting design',
          'Continuous performance improvement roadmap'
        ]
      },
      {
        title: 'Supply Chain Audit & Data Gathering',
        brief:
          'ESG responsibility extends beyond the company — into its supply chain. We help you equip clients with structured supplier audits and ESG data collection systems to reduce hidden risks.',
        methodologyTitle: 'Map → Audit → Validate → Strengthen',
        steps: [
          'Supplier risk mapping',
          'ESG audit frameworks',
          'Data validation processes',
          'Risk mitigation planning'
        ]
      },
      {
        title: 'Carbon Emissions Estimation',
        brief:
          'Carbon transparency is becoming mandatory. We support consultants in helping clients measure, track, and manage carbon emissions — building accountability and sustainability positioning.',
        methodologyTitle: 'Measure → Analyse → Benchmark → Reduce',
        steps: [
          'Emission source identification (Scope 1, 2, 3)',
          'Data modelling and estimation',
          'Industry benchmarking',
          'Reduction strategy guidance'
        ]
      },
      {
        title: 'Climate Risk Assessment',
        brief:
          'Climate risks directly impact financial performance and long-term resilience. We help you assess and integrate climate-related risks into business strategy and reporting.',
        methodologyTitle: 'Identify → Evaluate → Model → Mitigate',
        steps: [
          'Physical and transition risk analysis',
          'Scenario modelling',
          'Financial impact assessment',
          'Risk mitigation framework'
        ]
      },
      {
        title: 'Compliance Trainings',
        brief:
          'ESG transformation requires organisational alignment. We provide structured training programs to build awareness, accountability, and implementation capability across client teams.',
        methodologyTitle: 'Educate → Align → Implement → Reinforce',
        steps: [
          'Role-based ESG workshops',
          'Policy and reporting guidance',
          'Implementation frameworks',
          'Ongoing learning reinforcement'
        ]
      }
    ],
    'erp-implementation-digital-transformation': [
      {
        title: 'ERP Module Review & Report Optimization',
        brief:
          'Many businesses invest in ERP systems but fail to extract full value. We enable you to help clients optimise ERP modules, improve reporting accuracy, and convert system data into decision-ready insights.',
        methodologyTitle: 'Review → Diagnose → Optimise → Enhance',
        steps: [
          'ERP module performance assessment',
          'Gap identification in workflows and reporting',
          'Report restructuring and automation',
          'Continuous performance monitoring'
        ]
      },
      {
        title: 'Master Data Management',
        brief:
          'Poor master data leads to reporting errors, operational delays, and compliance risks. We help you guide clients in structuring, cleansing, and governing master data for long-term accuracy and control.',
        methodologyTitle: 'Assess → Cleanse → Standardise → Govern',
        steps: [
          'Data quality assessment',
          'Duplicate and inconsistency removal',
          'Standardisation framework',
          'Ongoing governance model'
        ]
      },
      {
        title: 'Department-Wise Digital Transformation',
        brief:
          'Digital transformation must go beyond technology — it must reshape how departments operate. We support you in redesigning finance, operations, HR, and supply chain processes for efficiency and scalability.',
        methodologyTitle: 'Map → Redesign → Digitise → Monitor',
        steps: [
          'Departmental process mapping',
          'Workflow automation design',
          'Technology enablement',
          'KPI tracking and performance review'
        ]
      },
      {
        title: 'AI Integration for Process Efficiency & Insights',
        brief:
          'AI is redefining operational efficiency. We help you integrate AI-driven tools that enhance forecasting, automate repetitive tasks, detect anomalies, and generate actionable insights.',
        methodologyTitle: 'Identify → Implement → Train → Optimise',
        steps: [
          'Process suitability analysis for AI',
          'AI tool deployment',
          'Team training and adaptation',
          'Continuous optimisation and monitoring'
        ]
      }
    ],
    'gcc-operation-hub': [
      {
        title: 'Support Services',
        brief:
          'Global Capability Centers (GCCs) require structured operational, compliance, finance, and governance support. We enable you to guide clients in establishing strong backend frameworks that ensure scalability, efficiency, and regulatory alignment.',
        methodologyTitle: 'Assess → Structure → Deploy → Strengthen',
        steps: [
          'Operational readiness assessment',
          'Governance and compliance structuring',
          'Process and support deployment',
          'Continuous monitoring and optimisation'
        ]
      },
      {
        title: 'Captive Shared Services Center Setup & Stabilization',
        brief:
          'Setting up a captive shared services center demands strategic planning, process integration, and talent alignment. We help you support clients from initial setup to operational stabilization, ensuring cost efficiency and performance control.',
        methodologyTitle: 'Plan → Establish → Integrate → Stabilize',
        steps: [
          'Feasibility and location assessment',
          'Process migration planning',
          'Governance and reporting setup',
          'Performance tracking and stabilization'
        ]
      },
      {
        title: 'Build, Operate & Transform (BOT) Model Implementation',
        brief:
          'The BOT model enables clients to enter new markets with reduced risk and structured control. We help consultants guide businesses through building operations, managing execution, and transitioning to full ownership seamlessly.',
        methodologyTitle: 'Build → Operate → Transform → Transition',
        steps: [
          'Infrastructure and team setup',
          'Operational management framework',
          'Performance optimization',
          'Structured transition to client control'
        ]
      }
    ],
    'training-workshop': [
      {
        title: 'Internal Audit',
        brief:
          'Strong internal audit capability strengthens governance and builds client trust. We provide structured training to enhance risk-based auditing, control evaluation, and reporting effectiveness.',
        methodologyTitle: 'Understand → Apply → Practice → Refine',
        steps: [
          'Core audit framework training',
          'Real-case simulations',
          'Control testing techniques',
          'Practical reporting improvement'
        ]
      },
      {
        title: 'ESG & Sustainability',
        brief:
          'ESG is becoming a strategic priority across industries. We equip professionals with practical knowledge of sustainability reporting, compliance frameworks, and ESG risk management.',
        methodologyTitle: 'Educate → Align → Implement → Monitor',
        steps: [
          'ESG framework overview',
          'Reporting standards guidance',
          'Risk identification training',
          'Implementation workshops'
        ]
      },
      {
        title: 'Cybersecurity & Data Privacy Awareness',
        brief:
          'Cyber risks and data regulations demand organisational awareness. We conduct practical sessions to build understanding of data protection laws, privacy frameworks, and cybersecurity best practices.',
        methodologyTitle: 'Assess → Train → Simulate → Strengthen',
        steps: [
          'Risk awareness sessions',
          'Regulatory overview (global privacy laws)',
          'Scenario-based learning',
          'Policy and control reinforcement'
        ]
      },
      {
        title: 'AI Implementation',
        brief:
          'AI adoption must be structured and responsible. We train teams to identify AI opportunities, manage risks, and integrate AI tools into business processes effectively.',
        methodologyTitle: 'Identify → Enable → Integrate → Optimise',
        steps: [
          'AI readiness assessment',
          'Use-case identification',
          'Implementation guidance',
          'Performance monitoring'
        ]
      },
      {
        title: 'Leadership & Soft Skills Development',
        brief:
          'Technical strength must be complemented by leadership capability. We provide development programs to enhance communication, decision-making, and strategic influence.',
        methodologyTitle: 'Develop → Practice → Feedback → Improve',
        steps: [
          'Leadership assessment',
          'Communication workshops',
          'Decision-making frameworks',
          'Continuous development planning'
        ]
      }
    ],
    'recruitment-manpower-services': [
      {
        title: 'Temporary Staffing',
        brief:
          'Business demands fluctuate — but talent gaps cannot slow operations. We enable you to support clients with skilled temporary professionals who maintain continuity, compliance, and performance without long-term hiring commitments.',
        methodologyTitle: 'Understand → Source → Evaluate → Deploy',
        steps: [
          'Role requirement mapping',
          'Targeted candidate sourcing',
          'Skill and compliance screening',
          'Quick onboarding and deployment'
        ]
      },
      {
        title: 'Permanent Recruitment',
        brief:
          'The right permanent hire defines long-term business success. We help you deliver structured recruitment solutions that align technical expertise with culture fit — reducing hiring risk and improving retention.',
        methodologyTitle: 'Define → Attract → Assess → Onboard',
        steps: [
          'Detailed role and competency definition',
          'Multi-channel talent sourcing',
          'Structured interviews and evaluation',
          'Offer management and onboarding support'
        ]
      }
    ]
  };
  const localizedSubServices = t('serviceDetail.subServices', {
    returnObjects: true,
    defaultValue: subServiceDetailsDefault
  });
  const subServicesForService = localizedSubServices?.[service?.id] || subServiceDetailsDefault[service?.id] || null;
  const activeSubServiceData = subServicesForService && activeSubService !== null
    ? subServicesForService[activeSubService]
    : null;
  const sectionIconMap = {
    'know-more': FiInfo,
    manpower: FiUsers,
    enquiry: FiHelpCircle,
    training: FiBookOpen
  };
  const ActiveSectionIcon = sectionIconMap[activeSection] || FiInfo;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const stored = localStorage.getItem('partnerUser');
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      setIsLoggedIn(true);
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      setFormValues((prev) => ({
        ...prev,
        name: fullName || prev.name,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone
      }));
    } catch (error) {
      console.error('Failed to read partner user data', error);
    }
  }, []);

  useEffect(() => {
    setSubmitted(false);
  }, [activeSection, serviceId, country]);

  useEffect(() => {
    setActiveSubService(null);
  }, [serviceId, activeSection]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formTypeLabel = activeSection === 'manpower'
      ? 'Manpower'
      : activeSection === 'training'
        ? 'Training'
        : 'Enquiry';

    const params = new URLSearchParams({
      action: 'submitEnquiry',
      country: country || '',
      countryLabel: countryLabel || '',
      service: service?.title || '',
      formType: formTypeLabel,
      name: formValues.name || '',
      email: formValues.email || '',
      phone: formValues.phone || '',
      company: formValues.company || '',
      message: formValues.message || ''
    });

    const url = `https://script.google.com/macros/s/AKfycbxFTbVglGTWrOFI0VVjM4NwcQ80kUtuvLhwPPwNw-Vi3OMF3Cn7tzC3cz_iyCzSNY8T9g/exec?${params}`;
    setIsSubmitting(true);
    fetch(url, { method: 'GET', mode: 'cors' })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setSubmitted(true);
        } else {
          alert(result.message || t('serviceDetail.submitFailed'));
        }
      })
      .catch((error) => {
        console.error('Enquiry submission error:', error);
        alert(t('serviceDetail.submitFailed'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formTitleMap = {
    manpower: t('serviceDetail.formTitles.manpower'),
    enquiry: t('serviceDetail.formTitles.enquiry', { service: service?.title || '' }),
    training: t('serviceDetail.formTitles.training')
  };
  const formCtaMap = {
    manpower: t('serviceDetail.formCtas.manpower'),
    enquiry: t('serviceDetail.formCtas.enquiry'),
    training: t('serviceDetail.formCtas.training')
  };
  const messagePlaceholderMap = {
    manpower: t('serviceDetail.messagePlaceholders.manpower'),
    enquiry: t('serviceDetail.messagePlaceholders.enquiry', { service: service?.title || t('serviceDetail.messagePlaceholders.defaultService') }),
    training: t('serviceDetail.messagePlaceholders.training')
  };
  const formTitle = formTitleMap[activeSection] || t('serviceDetail.requestMoreInfo');
  const formCta = formCtaMap[activeSection] || t('serviceDetail.submitRequest');
  const messagePlaceholder = messagePlaceholderMap[activeSection] || t('serviceDetail.messagePlaceholders.default');

  const LazyVideo = ({ src, title }) => {
    const containerRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
      if (!containerRef.current) return undefined;
      if (shouldLoad) return undefined;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
            }
          });
        },
        { rootMargin: '150px' }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }, [shouldLoad]);

    return (
      <div ref={containerRef} className="relative w-full h-full">
        {shouldLoad ? (
          <iframe
            className="w-full h-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-100">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(226,232,240,0.35),rgba(255,255,255,0.8),rgba(226,232,240,0.35))] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-geist text-slate-500 shadow-sm">
                {t('countryServices.preparingPreview')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!service) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg">
            <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-3">
              {t('serviceDetail.notFoundTitle')}
            </h2>
            <p className="font-geist text-gray-600 mb-6">
              {t('serviceDetail.notFoundText')}
            </p>
            <button
              onClick={() => navigate('/bnc-services')}
              className="bg-[#2C5AA0] text-white px-5 py-2.5 rounded-xl font-semibold"
            >
              {t('serviceDetail.backToBncServices')}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fb] via-[#f9fbff] to-[#eef2f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className={`flex flex-col gap-6 ${isRtl ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            <aside className="lg:w-[32%] lg:sticky lg:top-40 lg:self-start space-y-3 lg:-mt-8">
              <button
                onClick={() => navigate(`/services/${country}`)}
                className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-black transition ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}
              >
                <span className="text-base">{isRtl ? '→' : '←'}</span>
                {t('serviceDetail.backToServices')}
              </button>
              <div className="border border-slate-200 rounded-2xl bg-white shadow-sm">
                <div className={`p-6 border-b border-slate-200 ${textAlign}`}>
                    <p className="font-geist text-xs uppercase tracking-[0.2em] text-slate-400">
                      {countryLabel}
                    </p>
                    <h1 className="font-poppins text-2xl font-semibold text-gray-900 mt-2">
                      {service.title}
                    </h1>
                    <p className="font-geist text-sm text-gray-600 mt-3">
                      {service.summary}
                    </p>
                </div>
              <div className="px-4 py-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`group relative w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl border transition ${
                      activeSection === section.key
                        ? 'bg-[#2C5AA0]/10 border-[#2C5AA0]/30 text-[#1e3a8a]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="relative inline-block text-sm font-semibold font-geist">
                      {section.label}
                      <span className={`absolute -bottom-1 ${isRtl ? 'right-0' : 'left-0'} h-0.5 w-0 bg-[#2C5AA0] transition-all duration-500 group-hover:w-full`}></span>
                    </span>
                  </button>
                ))}
              </div>
              </div>
            </aside>

            <section className={`lg:w-[68%] ${textAlign}`}>
              <div className="space-y-8">
                <div className={`relative flex flex-col gap-4 ${mdRowDirection} md:items-center md:justify-between ${textAlign}`}>
                  <div>
                    {activeSection !== 'know-more' && (
                      <div>
                        <h2 className="font-poppins text-2xl font-semibold text-gray-900">
                          {activeSectionData.heading}
                        </h2>
                      </div>
                    )}
                    <p
                      className={`mt-2 ${sectionPadding} ${
                        activeSection === 'know-more'
                          ? 'font-poppins text-sm sm:text-base font-medium leading-relaxed text-[#1e3a8a] bg-[#eef4ff] border border-[#cfe0ff] px-4 py-3 rounded-2xl shadow-sm'
                          : 'font-geist text-gray-600'
                      }`}
                    >
                      {activeSection === 'know-more' ? knowMoreDescription : activeSectionData.description}
                    </p>
                  </div>
                </div>

                {activeSection === 'know-more' ? (
                  <>
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                      {service.videoUrl ? (
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-md">
                          <LazyVideo
                            src={service.videoUrl}
                            title={`${service.title} overview`}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-500 font-geist">
                          {t('serviceDetail.videoComingSoon')}
                        </div>
                      )}
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiEye className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <h3 className="font-poppins text-xl font-semibold">
                              {t('serviceDetail.overview')}
                            </h3>
                            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                          </div>
                        </div>
                        {service.description && service.description.length > 0 ? (
                          <p className={`text-gray-600 font-geist mt-3 ${sectionPadding}`}>
                            {service.description.join(' ')}
                          </p>
                        ) : (
                          <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                            {t('serviceDetail.overviewComingSoon')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                      <div className={`grid gap-6 md:grid-cols-2 ${sectionPadding}`}>
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiList className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <h3 className="font-poppins text-xl font-semibold">
                              {t('serviceDetail.serviceDetails')}
                            </h3>
                            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                          </div>
                        </div>
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection} ${isRtl ? 'md:pr-6' : 'md:pl-6'}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiMic className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <h4 className="font-poppins text-lg font-semibold">
                              {t('serviceDetail.voiceRequirement.title')}
                            </h4>
                            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-4 grid gap-6 md:grid-cols-2 ${sectionPadding}`}>
                        <div>
                          {service.bullets.length > 0 ? (
                            <ul className="space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                              {service.bullets.map((item, index) => {
                                const subService = subServicesForService?.[index] || null;
                                const isClickable = Boolean(subService);
                                const isActive = activeSubService === index;
                                const displayText = subService?.title || item;
                                return (
                                  <li key={`${item}-${index}`}>
                                    {isClickable ? (
                                      <button
                                        type="button"
                                        onClick={() => setActiveSubService(isActive ? null : index)}
                                        className={`text-left w-full transition flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''} ${
                                          isActive
                                            ? 'text-[#1e3a8a] font-semibold'
                                            : 'text-gray-700 hover:text-[#1e3a8a]'
                                        } ${inputAlign}`}
                                      >
                                        <span>{displayText}</span>
                                        <span className={`${isRtl ? 'ml-0 mr-3' : 'ml-3'} text-[#2C5AA0]`}>
                                          {isActive ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                                        </span>
                                      </button>
                                    ) : (
                                      <span>{displayText}</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="font-geist text-gray-600">
                              {t('serviceDetail.servicesComingSoon')}
                            </p>
                          )}
                        </div>
                        <div className={`border-t border-slate-200 pt-4 md:border-t-0 md:pt-0 ${isRtl ? 'md:border-r md:pr-6' : 'md:border-l md:pl-6'}`}>
                          <p className="font-geist text-gray-600">
                            {t('serviceDetail.voiceRequirement.description')}
                          </p>
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                const stored = localStorage.getItem('partnerUser');
                                if (!stored) {
                                  window.location.href = '/login';
                                  return;
                                }
                                setIsRequirementModalOpen(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-[#2C5AA0] text-white px-5 py-2.5 text-sm font-semibold shadow hover:bg-[#1e3a8a] transition"
                            >
                              {t('serviceDetail.voiceRequirement.button')}
                            </button>
                        </div>
                      </div>
                    </div>
                    </div>

                    {activeSubServiceData && (
                      <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiInfo className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <h4 className="font-poppins text-lg font-semibold">
                              {activeSubServiceData.title}
                            </h4>
                            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                          </div>
                        </div>
                        <p className={`mt-3 font-geist text-gray-600 ${sectionPadding}`}>
                          {activeSubServiceData.brief}
                        </p>
                        <div className={`mt-5 ${sectionPadding}`}>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-geist">
                            {t('serviceDetail.subServiceMethodologyLabel')}
                          </p>
                          <p className="mt-2 font-geist text-sm font-semibold text-slate-800">
                            {activeSubServiceData.methodologyTitle}
                          </p>
                          <ul className="mt-3 space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                            {activeSubServiceData.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                      <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                        <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                          <FiFileText className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <div>
                          <h4 className="font-poppins text-lg font-semibold">
                            {t('serviceDetail.documents')}
                          </h4>
                          <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                        </div>
                      </div>
                      <div className={`mt-4 ${sectionPadding}`}>
                        {(() => {
                          const serviceDocs = service.documents || [];
                          const countryDocs = country === 'saudi-arabia' ? saudiOnlyDocuments : [];
                          const docs = [...commonDocuments, ...serviceDocs, ...countryDocs];
                          if (docs.length === 0) {
                            return (
                              <p className="font-geist text-gray-600">
                                {t('serviceDetail.documentsComingSoon')}
                              </p>
                            );
                          }
                          return (
                            <ul className="space-y-3 font-geist text-gray-700">
                              {docs.map((doc) => (
                                <li key={`${doc.label}-${doc.url}`}>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-[#2C5AA0] hover:text-[#1e3a8a] font-semibold"
                                  >
                                    <FiFileText className="h-4 w-4" aria-hidden="true" />
                                    {doc.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                ) : activeSection === 'manpower' ? (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiUsers className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.manpowerSupport')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    {service.manpowerDescription ? (
                      <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                        {service.manpowerDescription}
                      </p>
                    ) : (
                      <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                        {t('serviceDetail.manpowerFallback', { service: service.title })}
                      </p>
                    )}
                  </div>
                ) : activeSection === 'training' ? (
                  <div className={`border border-slate-200 rounded-2xl p-6 bg-white ${textAlign}`}>
                    <div className={`grid gap-6 ${isRtl ? 'md:grid-cols-[0.9fr_1.1fr]' : 'md:grid-cols-[1.1fr_0.9fr]'}`}>
                      <div>
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiBookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                            <div>
                              <h3 className="font-poppins text-xl font-semibold">
                              {t('serviceDetail.training.title')}
                              </h3>
                              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                            </div>
                          </div>
                        <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                          {t('serviceDetail.training.description', { service: service.title })}
                        </p>
                        <div className={`mt-5 ${sectionPadding}`}>
                          <p className="font-geist text-sm text-slate-500 uppercase tracking-[0.2em]">
                            {t('serviceDetail.training.coverageTitle')}
                          </p>
                          <ul className={`mt-3 space-y-2 text-gray-700 list-disc list-outside ${listPadding} font-geist`}>
                            {t('serviceDetail.training.coverageItems', { returnObjects: true }).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="font-geist text-sm text-slate-500 uppercase tracking-[0.2em]">
                          {t('serviceDetail.training.highlightsTitle')}
                        </p>
                        <div className="mt-4 space-y-4" style={{ perspective: '1000px' }}>
                          {t('serviceDetail.training.highlights', { returnObjects: true }).map((item, index) => (
                            <div
                              key={item.title}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                              onMouseEnter={() => setHoveredHighlight(index)}
                              onMouseLeave={() => setHoveredHighlight(null)}
                              style={{
                                transform:
                                  hoveredHighlight === index
                                    ? `translateY(-8px) rotateX(6deg) rotateY(${index % 2 === 0 ? '-4deg' : '4deg'})`
                                    : 'translateZ(0)',
                                boxShadow:
                                  hoveredHighlight === index
                                    ? '0 18px 40px rgba(15, 23, 42, 0.18)'
                                    : '0 4px 12px rgba(15, 23, 42, 0.08)',
                                transition: 'transform 240ms ease, box-shadow 240ms ease'
                              }}
                            >
                              <p className="font-poppins text-sm font-semibold text-gray-900">
                                {item.title}
                              </p>
                              <p className="font-geist text-sm text-gray-600 mt-2">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeSection === 'contact' ? (
                  <div className={`border border-slate-200 rounded-2xl p-6 bg-white ${textAlign}`}>
                    <div className={`flex items-center justify-between flex-wrap gap-4 ${rowDirection}`}>
                      <div className={textAlign}>
                        <h3 className="font-poppins text-xl font-semibold text-gray-900">
                          {t('serviceDetail.contact.title')}
                        </h3>
                        <p className="font-geist text-gray-600 text-sm mt-2">
                          {t('serviceDetail.contact.description')}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <a
                          href="mailto:info@bncglobal.in"
                          className="group border border-slate-200 rounded-2xl bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-geist">
                                {t('serviceDetail.contact.email')}
                              </p>
                              <p className="font-geist text-sm text-slate-700 mt-2">
                                info@bncglobal.in
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-[#2C5AA0]/40 group-hover:bg-[#2C5AA0]/10 transition`}>
                              <FiMail className="h-5 w-5 text-[#2C5AA0]" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                        <a
                          href="https://wa.me/919958711796"
                          target="_blank"
                          rel="noreferrer"
                          className="group border border-emerald-200 rounded-2xl bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-geist">
                                {t('serviceDetail.contact.whatsapp')}
                              </p>
                              <p className="font-geist text-sm text-emerald-700 mt-2">
                                +91 99587 11796
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center group-hover:border-emerald-300 group-hover:bg-emerald-100 transition`}>
                              <FiUsers className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                        <a
                          href="tel:+919810575613"
                          className="group border border-slate-200 rounded-2xl bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-geist">
                                {t('serviceDetail.contact.call')}
                              </p>
                              <p className="font-geist text-sm text-slate-700 mt-2">
                                +91 98105 75613
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-[#2C5AA0]/40 group-hover:bg-[#2C5AA0]/10 transition`}>
                              <FiPhone className="h-5 w-5 text-[#2C5AA0]" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : activeSection === 'enquiry' ? (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiHelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.enquiryDetails')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                      {t('serviceDetail.enquiryDetailsDesc', { service: service.title })}
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiHelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.howWeHelp')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                      {t('serviceDetail.howWeHelpDesc', { service: service.title })}
                    </p>
                  </div>
                )}

                {activeSection !== 'contact' && activeSection !== 'know-more' && (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiMail className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {formTitle}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 text-sm mt-3 mb-4 ${sectionPadding}`}>
                      {activeSection === 'enquiry'
                        ? t('serviceDetail.enquiryDesc', { service: service.title })
                        : t('serviceDetail.requestMoreInfoDesc')}
                    </p>
                    {submitted ? (
                      <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-4 font-geist text-sm">
                        {t('serviceDetail.thankYou', { service: service.title, country: countryLabel })}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className={`space-y-3 ${sectionPadding}`}>
                        <input type="hidden" name="country" value={country} />
                        <input type="hidden" name="service" value={service.title} />
                        <input type="hidden" name="topic" value={activeSectionData.label} />
                        <input
                          type="text"
                          name="name"
                          value={formValues.name}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.fullName')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          required
                          readOnly={isLoggedIn}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.email')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          required
                          readOnly={isLoggedIn}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formValues.phone}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.phone')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          readOnly={isLoggedIn}
                        />
                        <input
                          type="text"
                          name="company"
                          value={formValues.company}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.company')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                        />
                        <textarea
                          name="message"
                          value={formValues.message}
                          onChange={handleChange}
                          rows="4"
                          placeholder={messagePlaceholder}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#2C5AA0] text-white py-2.5 rounded-xl font-semibold shadow hover:bg-[#1e3a8a] transition"
                        >
                          {isSubmitting ? t('serviceDetail.submitting') : formCta}
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
      <RequirementVoiceModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
      />
    </>
  );
};

export default ServiceDetail;
