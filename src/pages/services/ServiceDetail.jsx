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
import { submitEnquiry, submitVoiceRequirement } from '../../lib/supabaseData';

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

  const visibleSections =
    service?.id === 'personal-business-loan'
      ? sections.filter((section) => section.key !== 'manpower' && section.key !== 'training')
      : sections;
  const activeSectionData =
    visibleSections.find((section) => section.key === activeSection) || visibleSections[0];
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
    'physical-verification-stock-fixed-asset': [
      {
        title: 'Fixed Asset Physical Verification',
        coreOfferingIntro: 'Comprehensive, line-by-line on-site verification of fixed assets across locations to validate existence, location, and operational condition.',
        coreOffering: [
          'Physical existence check',
          'Location & custodian validation',
          'Missing/obsolete asset identification',
          'FAR reconciliation',
          'Exception reporting'
        ],
        methodologyTitle: 'Plan ? Verify ? Reconcile ? Report',
        steps: [
          'Plan verification scope and asset universe',
          'Conduct structured on-site inspection',
          'Reconcile findings with FAR',
          'Deliver discrepancy and risk report'
        ],
        valueToConsultant: [
          'Expand into audit-support and compliance assignments',
          'Increase recurring annual verification mandates',
          'Strengthen financial reporting credibility',
          'Deliver measurable governance impact'
        ],
        whyUs: [
          'Technology-enabled verification process',
          'Multi-location execution capability',
          'Strong accounting and compliance expertise',
          'Detailed, audit-ready documentation'
        ]
      },
      {
        title: 'Asset Tagging & Identification',
        coreOfferingIntro: 'Structured tagging solutions using barcodes, QR codes, RFID, metal, polyester, or vinyl tags to enable traceability and future audit efficiency.',
        coreOffering: [
          'Unique ID allocation',
          'Durable tagging solutions',
          'Custodian & location mapping',
          'ERP-integrated tagging'
        ],
        methodologyTitle: 'Identify ? Tag ? Capture ? Integrate',
        steps: [
          'Identify all taggable assets',
          'Deploy appropriate tagging solution',
          'Capture asset data digitally',
          'Integrate tagging data with FAR'
        ],
        valueToConsultant: [
          'Offer long-term asset control frameworks',
          'Improve future audit efficiency for clients',
          'Create repeat engagement opportunities',
          'Position yourself as a technology-driven advisor'
        ],
        whyUs: [
          'Durable, industry-specific tagging materials',
          'Digital asset capture tools',
          'Scalable tagging deployment',
          'Compliance-aligned tracking systems'
        ]
      },
      {
        title: 'FAR (Fixed Asset Register) Updation & Reconciliation',
        coreOfferingIntro: 'Complete review, correction, and restructuring of the Fixed Asset Register to ensure accuracy and regulatory compliance.',
        coreOffering: [
          'Additions, disposals & transfers update',
          'Depreciation alignment (SLM/WDV)',
          'CWIP adjustments',
          'ERP-compatible digital FAR',
          'Audit trail documentation'
        ],
        methodologyTitle: 'Review ? Correct ? Align ? Document',
        steps: [
          'Review existing FAR accuracy',
          'Correct discrepancies',
          'Align depreciation & accounting treatment',
          'Document for audit readiness'
        ],
        valueToConsultant: [
          'Strengthen financial statement reliability',
          'Expand into accounting compliance advisory',
          'Increase audit-support revenue',
          'Build long-term governance credibility'
        ],
        whyUs: [
          'Deep accounting standard expertise',
          'Strong reconciliation frameworks',
          'ERP compatibility support',
          'Audit-focused documentation precision'
        ]
      },
      {
        title: 'Componentization (IFRS / Ind AS / IAS 16 Compliance)',
        coreOfferingIntro: 'Identification and segregation of significant asset components for separate depreciation and regulatory compliance.',
        coreOffering: [
          'Component breakdown analysis',
          'Useful life assessment',
          'Separate depreciation calculation',
          'Register restructuring',
          'Replacement accounting support'
        ],
        methodologyTitle: 'Analyse ? Segregate ? Calculate ? Update',
        steps: [
          'Analyse major asset categories',
          'Segregate components with varying useful lives',
          'Calculate revised depreciation schedules',
          'Update FAR accordingly'
        ],
        valueToConsultant: [
          'Enter IFRS/Ind AS advisory domain',
          'Increase technical compliance engagements',
          'Strengthen board-level advisory credibility',
          'Expand into international reporting mandates'
        ],
        whyUs: [
          'Strong IFRS/Ind AS knowledge base',
          'Practical implementation expertise',
          'Compliance-driven documentation approach',
          'Experience across industries'
        ]
      },
      {
        title: 'Stock & Inventory Verification',
        coreOfferingIntro: 'Structured physical verification and reconciliation of stock to ensure accuracy and prevent shrinkage or misstatement.',
        coreOffering: [
          'Physical inventory count',
          'ERP reconciliation',
          'Slow-moving/obsolete stock identification',
          'Warehouse process review',
          'Exception reporting'
        ],
        methodologyTitle: 'Count ? Reconcile ? Analyse ? Recommend',
        steps: [
          'Conduct physical count',
          'Reconcile with system records',
          'Analyse discrepancies',
          'Recommend control improvements'
        ],
        valueToConsultant: [
          'Expand into operational assurance',
          'Increase recurring verification mandates',
          'Strengthen working capital governance',
          'Improve client cost control'
        ],
        whyUs: [
          'Structured count procedures',
          'Technology-assisted reconciliation',
          'Strong control-focused reporting',
          'Multi-location execution capability'
        ]
      },
      {
        title: 'Condition Assessment & Asset Health Review',
        coreOfferingIntro: 'Evaluation of asset condition, operational efficiency, and impairment indicators to support financial and strategic decisions.',
        coreOffering: [
          'Operational status check',
          'Impairment indicators',
          'Maintenance review inputs',
          'Replacement planning guidance',
          'Insurance adequacy inputs'
        ],
        methodologyTitle: 'Inspect ? Evaluate ? Quantify ? Advise',
        steps: [
          'Inspect physical and operational state',
          'Evaluate impairment or risk exposure',
          'Quantify potential financial impact',
          'Advise on maintenance or replacement strategy'
        ],
        valueToConsultant: [
          'Enter strategic asset advisory',
          'Support capex decision-making',
          'Increase board-level engagement',
          'Strengthen long-term advisory positioning'
        ],
        whyUs: [
          'Risk-focused evaluation framework',
          'Financial and operational integration',
          'Governance-aligned advisory',
          'Practical, decision-ready insights'
        ]
      },
      {
        title: 'Regulatory & Compliance Review',
        coreOfferingIntro: 'Comprehensive review to ensure asset-related compliance with Companies Act, CARO, IFRS/Ind AS, and internal control frameworks.',
        coreOffering: [
          'Compliance checklist mapping',
          'Control environment assessment',
          'Documentation review',
          'Audit readiness support',
          'Management action plan'
        ],
        methodologyTitle: 'Map ? Evaluate ? Align ? Certify Readiness',
        steps: [
          'Map applicable regulatory requirements',
          'Evaluate compliance gaps',
          'Align processes and documentation',
          'Prepare for audit and statutory review'
        ],
        valueToConsultant: [
          'Expand into regulatory advisory',
          'Increase high-value compliance engagements',
          'Strengthen client governance reputation',
          'Position yourself as a risk and compliance partner'
        ],
        whyUs: [
          'Strong regulatory interpretation expertise',
          'Governance-driven approach',
          'Structured documentation standards',
          'End-to-end compliance readiness support'
        ]
      }
    ],
    'personal-business-loan': [
      {
        title: 'CGTMSE Loan',
        coreOfferingIntro: 'Collateral-free loans under the CGTMSE scheme to support MSME growth and expansion.',
        coreOffering: [
          'MSME eligibility structuring',
          'Loan documentation support',
          'Bank coordination',
          'Compliance guidance',
          'Credit guarantee alignment'
        ],
        methodologyTitle: 'Assess ? Structure ? Apply ? Facilitate',
        steps: [
          'Assess eligibility and credit profile',
          'Structure loan application strategically',
          'Facilitate documentation and submission',
          'Coordinate with lenders for approval'
        ],
        valueToConsultant: [
          'Expand into MSME funding advisory',
          'Increase client retention',
          'Offer end-to-end growth support',
          'Strengthen long-term client dependency'
        ],
        whyUs: [
          'Deep MSME funding understanding',
          'Structured documentation approach',
          'Strong lender network coordination',
          'Faster, smoother processing'
        ]
      },
      {
        title: 'Working Capital Loan',
        coreOfferingIntro: 'Short-term financing solutions to support operational cash flow needs.',
        coreOffering: [
          'Inventory funding',
          'Receivable financing',
          'Business cycle support',
          'Structured working capital assessment'
        ],
        methodologyTitle: 'Evaluate ? Calculate ? Structure ? Secure',
        steps: [
          'Evaluate cash flow cycle',
          'Calculate funding requirement',
          'Structure appropriate facility',
          'Secure bank approval'
        ],
        valueToConsultant: [
          'Strengthen operational advisory',
          'Improve client liquidity management',
          'Increase recurring engagement',
          'Become a financial growth partner'
        ],
        whyUs: [
          'Cash-flow focused assessment',
          'Practical lender negotiation support',
          'Governance-aligned financial structuring',
          'Fast documentation turnaround'
        ]
      },
      {
        title: 'LAP OD Limit (Loan Against Property ? Overdraft)',
        coreOfferingIntro: 'Overdraft facility backed by property to enable flexible fund usage.',
        coreOffering: [
          'Property valuation coordination',
          'OD structuring',
          'Flexible withdrawal options',
          'Interest optimisation support'
        ],
        methodologyTitle: 'Value ? Structure ? Negotiate ? Activate',
        steps: [
          'Assess property valuation',
          'Structure OD limit',
          'Negotiate competitive rates',
          'Activate and monitor utilisation'
        ],
        valueToConsultant: [
          'Offer flexible funding solutions',
          'Increase advisory revenue',
          'Support expansion and liquidity management',
          'Strengthen client trust'
        ],
        whyUs: [
          'Competitive structuring approach',
          'Bank coordination expertise',
          'Transparent advisory process',
          'Quick approval assistance'
        ]
      },
      {
        title: 'Unsecured Business Loan',
        coreOfferingIntro: 'Collateral-free business loans based on financial strength and credit profile.',
        coreOffering: [
          'Credit assessment support',
          'Financial documentation preparation',
          'Fast-track processing',
          'Short-term and growth financing'
        ],
        methodologyTitle: 'Review ? Strengthen ? Apply ? Disburse',
        steps: [
          'Review financial eligibility',
          'Strengthen documentation',
          'Apply with suitable lenders',
          'Support smooth disbursement'
        ],
        valueToConsultant: [
          'Offer quick funding solutions',
          'Increase client dependency',
          'Strengthen growth advisory',
          'Improve service portfolio depth'
        ],
        whyUs: [
          'Strong lender network',
          'Quick processing frameworks',
          'Practical credit profiling',
          'Transparent advisory'
        ]
      },
      {
        title: 'Loan Against Property (Term Loan)',
        coreOfferingIntro: 'Structured term loans secured against residential or commercial property.',
        coreOffering: [
          'Property-backed funding',
          'Long-tenure structuring',
          'Competitive interest negotiation',
          'Capital expansion support'
        ],
        methodologyTitle: 'Assess ? Structure ? Negotiate ? Close',
        steps: [
          'Assess valuation and funding capacity',
          'Structure repayment plan',
          'Negotiate best lending terms',
          'Close and support documentation'
        ],
        valueToConsultant: [
          'Support large capital expansion',
          'Increase high-ticket engagements',
          'Deepen financial advisory positioning',
          'Build long-term relationships'
        ],
        whyUs: [
          'Structured funding advisory',
          'Strong bank coordination',
          'Transparent cost breakdown',
          'End-to-end documentation support'
        ]
      },
      {
        title: 'Personal Loans (Car / Home / Education)',
        coreOfferingIntro: 'Quick and structured personal financing solutions tailored to individual needs.',
        coreOffering: [
          'Car loans',
          'Home loans',
          'Education loans',
          'Eligibility structuring',
          'EMI planning support'
        ],
        methodologyTitle: 'Evaluate ? Compare ? Apply ? Secure',
        steps: [
          'Evaluate eligibility',
          'Compare lender options',
          'Apply with optimal structuring',
          'Secure approval and disbursement'
        ],
        valueToConsultant: [
          'Expand into retail financial advisory',
          'Strengthen client lifetime value',
          'Increase cross-selling opportunities',
          'Build trust beyond business advisory'
        ],
        whyUs: [
          'Multi-lender comparison support',
          'Competitive rate negotiation',
          'Smooth documentation handling',
          'Transparent advisory'
        ]
      },
      {
        title: 'Cash Credit / Overdraft (OD) Limits',
        coreOfferingIntro: 'Flexible revolving credit facilities to manage daily operational requirements.',
        coreOffering: [
          'Working capital assessment',
          'Limit structuring',
          'Renewal and enhancement support',
          'Bank compliance coordination'
        ],
        methodologyTitle: 'Assess ? Structure ? Approve ? Monitor',
        steps: [
          'Assess cash flow cycle',
          'Structure suitable limit',
          'Support sanction process',
          'Assist in renewals and enhancements'
        ],
        valueToConsultant: [
          'Strengthen client liquidity management',
          'Increase recurring advisory',
          'Position yourself as a financial growth enabler',
          'Improve client operational continuity'
        ],
        whyUs: [
          'Cash-flow centric structuring',
          'Strong financial analysis support',
          'End-to-end sanction assistance',
          'Long-term renewal guidance'
        ]
      }
    ],
    'financial-advisory': [
      {
        title: 'Virtual CFO Services',
        coreOfferingIntro:
          'We enable you to deliver structured Virtual CFO support, including:',
        coreOffering: [
          'Strategic financial planning & forecasting',
          'Cash flow and working capital management',
          'Profitability and margin optimisation',
          'Board-level reporting & investor readiness',
          'Financial structuring and growth strategy support'
        ],
        methodologyTitle: 'Assess → Architect → Implement → Optimise',
        steps: [
          'Assess financial health and operational stability',
          'Architect a strategic finance roadmap',
          'Implement governance-driven reporting systems',
          'Optimise performance through continuous review'
        ],
        valueToConsultant: [
          'Build high-value recurring retainers',
          'Participate in strategic decision-making',
          'Increase engagement size per client',
          'Transition from compliance provider to growth advisor'
        ],
        whyUs: [
          'Practical CFO-led frameworks',
          'Real implementation experience across industries',
          'Structured advisory models you can replicate confidently',
          'Strategic depth without operational complexity'
        ]
      },
      {
        title: 'Budget & Cost Management',
        coreOfferingIntro:
          'We help you implement disciplined financial control systems for your clients:',
        coreOffering: [
          'Annual and rolling budgeting frameworks',
          'Cost allocation and monitoring systems',
          'Variance tracking & performance dashboards',
          'Margin improvement strategies'
        ],
        methodologyTitle: 'Plan → Control → Analyse → Improve',
        steps: [
          'Design structured budget architecture',
          'Establish tracking and accountability mechanisms',
          'Analyse deviations and financial leakages',
          'Improve cost efficiency and profitability'
        ],
        valueToConsultant: [
          'Deliver measurable bottom-line impact',
          'Strengthen client profitability narratives',
          'Increase repeat and cross-service opportunities',
          'Position yourself as a performance-focused advisor'
        ],
        whyUs: [
          'Data-driven cost optimisation frameworks',
          'Experience across multi-sector financial structures',
          'Scalable models adaptable to SMEs and enterprises',
          'Execution-oriented approach, not theoretical advice'
        ]
      },
      {
        title: 'Financial Planning & Analysis (FP&A)',
        coreOfferingIntro:
          'We support you in delivering forward-looking financial intelligence:',
        coreOffering: [
          'Revenue and growth forecasting models',
          'Scenario planning and sensitivity analysis',
          'Capital allocation advisory',
          'Business performance evaluation frameworks'
        ],
        methodologyTitle: 'Model → Evaluate → Forecast → Advise',
        steps: [
          'Develop customised financial models',
          'Evaluate revenue and cost drivers',
          'Forecast under multiple strategic scenarios',
          'Provide board-ready strategic recommendations'
        ],
        valueToConsultant: [
          'Offer premium, insight-led advisory services',
          'Influence investment and expansion decisions',
          'Strengthen your positioning as a transformation partner',
          'Increase long-term client dependency'
        ],
        whyUs: [
          'Structured modelling templates and frameworks',
          'Strong analytical and governance expertise',
          'Practical advisory integration support',
          'Clear, executive-level communication tools'
        ]
      },
      {
        title: 'Reporting & MIS',
        coreOfferingIntro:
          'We help you establish clarity through structured reporting systems:',
        coreOffering: [
          'KPI-based performance dashboards',
          'Integrated financial and operational MIS',
          'Executive-level summary reporting',
          'Real-time financial visibility frameworks'
        ],
        methodologyTitle: 'Structure → Integrate → Visualise → Optimise',
        steps: [
          'Define measurable KPIs aligned with strategy',
          'Integrate financial and operational datasets',
          'Visualise insights for leadership clarity',
          'Optimise reporting cycles and accuracy'
        ],
        valueToConsultant: [
          'Build executive trust through clarity',
          'Improve decision-making speed for clients',
          'Position yourself as the interpreter of business intelligence',
          'Strengthen advisory stickiness and retention'
        ],
        whyUs: [
          'Proven MIS structuring experience',
          'Governance-aligned reporting frameworks',
          'Scalable systems for growing organisations',
          'Focus on clarity, usability, and impact'
        ]
      }
    ],
        'cybersecurity-data-privacy': [
      {
        title: 'AI Audit',
        coreOfferingIntro: 'As AI adoption grows, governance gaps increase. We help you guide clients in evaluating AI systems for risk, bias, data integrity, compliance exposure, and operational reliability.',
        coreOffering: [
          'AI governance framework assessment',
          'Model risk and bias evaluation',
          'Data integrity and usage review',
          'Regulatory exposure mapping',
          'AI control and documentation readiness'
        ],
        methodologyTitle: 'Discover ? Evaluate ? Strengthen ? Govern',
        steps: [
          'Identify AI usage across business functions',
          'Evaluate algorithmic risks and compliance gaps',
          'Strengthen governance and control mechanisms',
          'Implement monitoring and documentation frameworks'
        ],
        valueToConsultant: [
          'Enter a high-growth, emerging advisory domain',
          'Position yourself as a future-ready advisor',
          'Increase premium advisory billing',
          'Become indispensable in tech-enabled organisations'
        ],
        whyUs: [
          'Governance-driven AI audit frameworks',
          'Risk and compliance integration expertise',
          'Practical, implementation-focused approach',
          'Designed for evolving regulatory landscapes'
        ]
      },
      {
        title: 'Cybersecurity Certification ? ISO 27001',
        coreOfferingIntro: 'We enable you to support clients in achieving and maintaining ISO 27001 certification by building structured Information Security Management Systems (ISMS).',
        coreOffering: [
          'ISMS framework development',
          'Risk assessment and gap analysis',
          'Policy and control documentation',
          'Implementation support',
          'Pre-certification audit readiness'
        ],
        methodologyTitle: 'Assess ? Design ? Implement ? Certify',
        steps: [
          'Conduct security posture assessment',
          'Design compliant ISMS architecture',
          'Implement security controls and policies',
          'Prepare for certification audit'
        ],
        valueToConsultant: [
          'Add globally recognised certification advisory',
          'Strengthen client credibility in global markets',
          'Increase project-based and recurring revenue',
          'Build long-term compliance engagements'
        ],
        whyUs: [
          'Structured certification roadmap',
          'Experienced compliance and audit specialists',
          'Clear documentation and control frameworks',
          'End-to-end implementation support'
        ]
      },
      {
        title: 'Global Data Privacy Compliance ? GDPR',
        coreOfferingIntro: 'With increasing global data regulations, businesses must align with GDPR standards. We support you in guiding clients through structured data protection and privacy governance frameworks.',
        coreOffering: [
          'Data mapping and privacy impact assessment',
          'Consent and data processing framework design',
          'Cross-border data compliance alignment',
          'Data subject rights implementation',
          'Privacy policy and documentation structuring'
        ],
        methodologyTitle: 'Map ? Assess ? Align ? Monitor',
        steps: [
          'Map personal data flows',
          'Assess regulatory exposure and risk',
          'Align processes with GDPR standards',
          'Establish monitoring and review mechanisms'
        ],
        valueToConsultant: [
          'Offer cross-border compliance expertise',
          'Increase advisory credibility in global markets',
          'Strengthen trust-driven client relationships',
          'Expand into recurring governance services'
        ],
        whyUs: [
          'Strong regulatory and governance foundation',
          'Practical privacy control implementation',
          'Alignment with evolving global data laws',
          'Focus on operational feasibility'
        ]
      },
      {
        title: 'SOC Certification (Type 1 & Type 2)',
        coreOfferingIntro: 'We assist you in enabling clients to achieve SOC 1 / SOC 2 readiness and certification, strengthening trust with global customers and partners.',
        coreOffering: [
          'Control framework design',
          'Risk assessment and gap analysis',
          'Documentation and evidence preparation',
          'Internal readiness review',
          'Audit coordination support'
        ],
        methodologyTitle: 'Evaluate ? Control ? Document ? Certify',
        steps: [
          'Evaluate internal controls environment',
          'Implement trust service criteria controls',
          'Document policies and operational evidence',
          'Support audit and certification process'
        ],
        valueToConsultant: [
          'Unlock high-value compliance projects',
          'Strengthen client trust in technology environments',
          'Increase international business readiness',
          'Create recurring audit support revenue'
        ],
        whyUs: [
          'Structured SOC readiness programs',
          'Strong internal control expertise',
          'Clear evidence-based documentation processes',
          'Practical execution support'
        ]
      },
      {
        title: 'HIPAA Compliance',
        coreOfferingIntro: 'Healthcare data protection requires strict regulatory compliance. We support consultants in guiding healthcare and health-tech clients through HIPAA compliance frameworks.',
        coreOffering: [
          'HIPAA gap assessment',
          'Security and privacy rule alignment',
          'Data safeguard implementation',
          'Risk management planning',
          'Compliance documentation support'
        ],
        methodologyTitle: 'Assess ? Secure ? Document ? Maintain',
        steps: [
          'Assess protected health information (PHI) handling',
          'Secure technical and administrative safeguards',
          'Document compliance controls',
          'Establish continuous monitoring mechanisms'
        ],
        valueToConsultant: [
          'Expand into specialised healthcare compliance advisory',
          'Increase high-ticket compliance engagements',
          'Build authority in regulated industries',
          'Strengthen long-term governance partnerships'
        ],
        whyUs: [
          'Strong governance and control background',
          'Integrated cybersecurity and compliance expertise',
          'Clear implementation-driven frameworks',
          'Designed for complex regulatory environments'
        ]
      }
    ],
        'risk-advisory': [
      {
        title: 'Corporate Governance & Compliance',
        coreOfferingIntro: 'We help you establish structured governance frameworks that enhance transparency, accountability, and regulatory compliance.',
        coreOffering: [
          'Governance structure design',
          'Regulatory compliance mapping',
          'Board reporting frameworks',
          'Compliance monitoring systems',
          'Policy alignment with legal requirements'
        ],
        methodologyTitle: 'Assess ? Align ? Implement ? Monitor',
        steps: [
          'Assess governance gaps and regulatory exposure',
          'Align policies with applicable laws and standards',
          'Implement structured governance controls',
          'Monitor compliance through review mechanisms'
        ],
        valueToConsultant: [
          'Strengthen client credibility and investor confidence',
          'Expand into board-level advisory',
          'Increase long-term governance retainers',
          'Become a trusted strategic partner'
        ],
        whyUs: [
          'Strong regulatory and governance expertise',
          'Practical, execution-oriented frameworks',
          'Scalable models for SMEs and enterprises',
          'Focus on sustainable compliance, not just documentation'
        ]
      },
      {
        title: 'Internal Audit & Controls',
        coreOfferingIntro: 'We support you in delivering risk-based internal audit and control evaluations that protect financial and operational integrity.',
        coreOffering: [
          'Risk-based audit planning',
          'Control testing and assessment',
          'Process risk identification',
          'Governance and compliance reporting'
        ],
        methodologyTitle: 'Identify ? Evaluate ? Strengthen ? Report',
        steps: [
          'Identify key operational and financial risks',
          'Evaluate control effectiveness',
          'Strengthen weak areas through corrective measures',
          'Deliver clear, actionable reports'
        ],
        valueToConsultant: [
          'Offer structured assurance services',
          'Increase recurring audit assignments',
          'Improve client risk resilience',
          'Build authority in governance advisory'
        ],
        whyUs: [
          'Risk-driven audit frameworks',
          'Deep control environment expertise',
          'Practical recommendations, not theoretical insights',
          'Strong reporting clarity'
        ]
      },
      {
        title: 'Policies, SOPs & Process Reengineering',
        coreOfferingIntro: 'We help you structure and redesign client processes to improve efficiency, accountability, and scalability.',
        coreOffering: [
          'SOP drafting and documentation',
          'Policy framework development',
          'Process gap and bottleneck analysis',
          'Operational workflow redesign'
        ],
        methodologyTitle: 'Map ? Diagnose ? Redesign ? Standardise',
        steps: [
          'Map existing workflows',
          'Diagnose inefficiencies and risks',
          'Redesign processes for optimisation',
          'Standardise through documented SOPs'
        ],
        valueToConsultant: [
          'Deliver operational transformation',
          'Increase cross-functional advisory scope',
          'Improve client productivity and clarity',
          'Create long-term advisory dependency'
        ],
        whyUs: [
          'Structured process engineering approach',
          'Governance-aligned documentation standards',
          'Industry-wide implementation experience',
          'Focus on measurable operational impact'
        ]
      },
      {
        title: 'Business Intelligence & Continuous Improvement',
        coreOfferingIntro: 'We help you enable data-driven performance management systems that drive informed decision-making.',
        coreOffering: [
          'KPI identification frameworks',
          'Performance dashboards',
          'Financial and operational analytics',
          'Continuous improvement systems'
        ],
        methodologyTitle: 'Collect ? Analyse ? Visualise ? Optimise',
        steps: [
          'Collect relevant business data',
          'Analyse performance drivers',
          'Visualise insights through dashboards',
          'Optimise through ongoing monitoring'
        ],
        valueToConsultant: [
          'Deliver insight-led advisory services',
          'Strengthen executive trust',
          'Expand into performance consulting',
          'Increase advisory premium'
        ],
        whyUs: [
          'Structured analytics frameworks',
          'Integration of financial and operational data',
          'Clear visual reporting systems',
          'Practical implementation support'
        ]
      },
      {
        title: 'IT, Systems & Fraud Risk Audits',
        coreOfferingIntro: 'We support you in assessing technology controls and fraud vulnerabilities to protect client systems and reputation.',
        coreOffering: [
          'IT control assessment',
          'Fraud risk analysis',
          'System security reviews',
          'Control enhancement recommendations'
        ],
        methodologyTitle: 'Review ? Test ? Detect ? Secure',
        steps: [
          'Review system architecture and access controls',
          'Test vulnerabilities and control weaknesses',
          'Detect fraud exposure points',
          'Secure systems with corrective strategies'
        ],
        valueToConsultant: [
          'Enter technology risk advisory',
          'Increase governance-focused engagements',
          'Strengthen client protection frameworks',
          'Enhance long-term compliance relationships'
        ],
        whyUs: [
          'Integrated IT and governance expertise',
          'Practical fraud risk detection frameworks',
          'Strong internal control background',
          'Execution-focused remediation support'
        ]
      },
      {
        title: 'Stock & Fixed Asset Verification',
        coreOfferingIntro: 'We assist in verifying inventory and fixed assets to ensure financial accuracy and prevent loss or misstatement.',
        coreOffering: [
          'Physical verification planning',
          'Asset tagging review',
          'Inventory reconciliation',
          'Exception and discrepancy reporting'
        ],
        methodologyTitle: 'Plan ? Verify ? Reconcile ? Report',
        steps: [
          'Plan structured verification exercises',
          'Conduct physical validation',
          'Reconcile with financial records',
          'Report discrepancies and corrective actions'
        ],
        valueToConsultant: [
          'Strengthen financial statement reliability',
          'Provide tangible operational assurance',
          'Increase recurring compliance engagements',
          'Improve client cost control'
        ],
        whyUs: [
          'Structured verification processes',
          'Strong reconciliation expertise',
          'Clear documentation and reporting',
          'Reliable execution support'
        ]
      },
      {
        title: 'SAR Reconciliation & Process Review',
        coreOfferingIntro: 'We support consultants in reviewing reconciliation frameworks to reduce reporting errors and improve control reliability.',
        coreOffering: [
          'SAR and financial reconciliation review',
          'Process accuracy testing',
          'Control gap identification',
          'Improvement framework design'
        ],
        methodologyTitle: 'Examine ? Reconcile ? Rectify ? Control',
        steps: [
          'Examine reconciliation procedures',
          'Reconcile system and financial records',
          'Rectify process inefficiencies',
          'Strengthen control checkpoints'
        ],
        valueToConsultant: [
          'Improve financial reporting integrity',
          'Increase operational confidence',
          'Expand into system-level advisory',
          'Build stronger compliance credibility'
        ],
        whyUs: [
          'Structured reconciliation frameworks',
          'Strong financial control expertise',
          'Process-driven correction strategies',
          'Focus on long-term reliability'
        ]
      },
      {
        title: 'Third-Party Risk Management',
        coreOfferingIntro: 'We help you enable clients to assess and manage vendor and partner risks proactively.',
        coreOffering: [
          'Vendor risk profiling',
          'Due diligence frameworks',
          'Contract risk evaluation',
          'Ongoing third-party monitoring systems'
        ],
        methodologyTitle: 'Screen ? Assess ? Monitor ? Mitigate',
        steps: [
          'Screen vendors for risk exposure',
          'Assess compliance and financial stability',
          'Monitor performance and risk indicators',
          'Mitigate through structured risk plans'
        ],
        valueToConsultant: [
          'Expand into vendor governance advisory',
          'Strengthen client supply chain security',
          'Increase compliance-driven engagements',
          'Build long-term governance partnerships'
        ],
        whyUs: [
          'Risk-based third-party frameworks',
          'Integrated compliance and governance expertise',
          'Practical monitoring systems',
          'Scalable advisory models'
        ]
      }
    ],
        'esg-advisory': [
      {
        title: 'ESG & Sustainability Reporting',
        coreOfferingIntro: 'We help you enable clients to build structured ESG frameworks and credible sustainability reports aligned with global standards.',
        coreOffering: [
          'ESG materiality assessment',
          'Sustainability reporting frameworks',
          'Governance and disclosure alignment',
          'Investor-ready ESG documentation',
          'Performance tracking systems'
        ],
        methodologyTitle: 'Assess ? Structure ? Report ? Improve',
        steps: [
          'Assess ESG impact areas and regulatory exposure',
          'Structure reporting aligned to global frameworks',
          'Prepare transparent, defensible disclosures',
          'Improve through measurable ESG KPIs'
        ],
        valueToConsultant: [
          'Unlock high-demand sustainability advisory revenue',
          'Strengthen client investor readiness',
          'Expand into board-level ESG discussions',
          'Position yourself as a future-ready advisory partner'
        ],
        whyUs: [
          'Governance-led ESG approach',
          'Alignment with global reporting standards',
          'Practical implementation expertise',
          'Focus on measurable, reportable outcomes'
        ]
      },
      {
        title: 'Supply Chain Audit & Data Gathering',
        coreOfferingIntro: 'We support you in evaluating supplier practices and collecting ESG-related operational data across the value chain.',
        coreOffering: [
          'Supplier ESG due diligence',
          'Risk-based vendor assessments',
          'Data collection frameworks',
          'Compliance verification processes'
        ],
        methodologyTitle: 'Map ? Audit ? Validate ? Monitor',
        steps: [
          'Map supply chain exposure',
          'Audit supplier ESG practices',
          'Validate operational data',
          'Monitor through structured reporting systems'
        ],
        valueToConsultant: [
          'Expand into supply chain governance advisory',
          'Increase cross-border compliance opportunities',
          'Strengthen client operational resilience',
          'Create recurring vendor risk engagements'
        ],
        whyUs: [
          'Risk-based audit frameworks',
          'Structured supplier evaluation tools',
          'Strong governance integration',
          'Scalable monitoring systems'
        ]
      },
      {
        title: 'Carbon Emissions Estimation',
        coreOfferingIntro: 'We assist you in helping clients quantify and manage their carbon footprint across Scope 1, 2, and 3 emissions.',
        coreOffering: [
          'Emissions data identification',
          'Carbon footprint calculations',
          'Reduction strategy planning',
          'Reporting alignment with global standards'
        ],
        methodologyTitle: 'Identify ? Measure ? Analyse ? Reduce',
        steps: [
          'Identify emission sources across operations',
          'Measure carbon footprint accurately',
          'Analyse emission hotspots',
          'Recommend reduction and optimisation strategies'
        ],
        valueToConsultant: [
          'Enter climate-focused advisory markets',
          'Increase ESG reporting revenue',
          'Support clients in meeting investor expectations',
          'Position yourself as a sustainability transformation partner'
        ],
        whyUs: [
          'Structured carbon accounting frameworks',
          'Regulatory-aware measurement approach',
          'Practical reduction strategy integration',
          'Alignment with international reporting norms'
        ]
      },
      {
        title: 'Climate Risk Assessment',
        coreOfferingIntro: 'We help you guide clients in assessing physical and transition climate risks affecting business continuity and financial performance.',
        coreOffering: [
          'Physical climate exposure analysis',
          'Regulatory and transition risk mapping',
          'Financial impact assessment',
          'Scenario planning frameworks'
        ],
        methodologyTitle: 'Evaluate ? Model ? Quantify ? Mitigate',
        steps: [
          'Evaluate climate exposure across operations',
          'Model risk under different scenarios',
          'Quantify financial and operational impact',
          'Develop mitigation and adaptation strategies'
        ],
        valueToConsultant: [
          'Provide forward-looking risk advisory',
          'Strengthen long-term resilience frameworks',
          'Increase strategic engagement at leadership level',
          'Expand into climate governance consulting'
        ],
        whyUs: [
          'Integrated risk and sustainability expertise',
          'Financial impact-focused analysis',
          'Scenario-based advisory models',
          'Practical, decision-ready insights'
        ]
      },
      {
        title: 'Compliance Trainings',
        coreOfferingIntro: 'We support you in delivering structured ESG, governance, and regulatory training programs to client leadership and teams.',
        coreOffering: [
          'ESG awareness workshops',
          'Governance and compliance training modules',
          'Climate and sustainability education sessions',
          'Leadership sensitisation programs'
        ],
        methodologyTitle: 'Educate ? Engage ? Equip ? Reinforce',
        steps: [
          'Educate teams on regulatory and ESG expectations',
          'Engage through practical case-based learning',
          'Equip participants with implementation tools',
          'Reinforce through follow-up guidance'
        ],
        valueToConsultant: [
          'Build recurring training revenue streams',
          'Strengthen client capability internally',
          'Deepen advisory relationships',
          'Position yourself as a knowledge partner'
        ],
        whyUs: [
          'Expert-led, practical training models',
          'Industry-aligned curriculum',
          'Structured and measurable learning outcomes',
          'Integration with governance advisory services'
        ]
      }
    ],
        'erp-implementation-digital-transformation': [
      {
        title: 'ERP Module Review & Report Optimization',
        coreOfferingIntro: 'We help you evaluate and optimise your clients? ERP systems to improve reporting accuracy, efficiency, and decision-making.',
        coreOffering: [
          'ERP module performance review',
          'Gap analysis between system and business needs',
          'Report restructuring and optimisation',
          'Control and compliance alignment',
          'Process efficiency enhancement'
        ],
        methodologyTitle: 'Assess ? Analyse ? Optimise ? Align',
        steps: [
          'Assess ERP configuration and utilisation',
          'Analyse reporting inefficiencies and control gaps',
          'Optimise modules and reporting structures',
          'Align ERP outputs with management objectives'
        ],
        valueToConsultant: [
          'Expand into technology-led advisory',
          'Increase high-value ERP review engagements',
          'Improve client decision-making systems',
          'Strengthen your positioning as a transformation partner'
        ],
        whyUs: [
          'Deep finance and governance integration',
          'Practical ERP evaluation frameworks',
          'Focus on measurable reporting improvement',
          'Experience across multi-industry systems'
        ]
      },
      {
        title: 'Master Data Management',
        coreOfferingIntro: 'We help you establish structured master data governance frameworks to ensure data accuracy, consistency, and reliability across systems.',
        coreOffering: [
          'Data governance framework design',
          'Master data standardisation',
          'Data validation and cleansing support',
          'Access control and approval workflows'
        ],
        methodologyTitle: 'Audit ? Cleanse ? Standardise ? Govern',
        steps: [
          'Audit existing master data quality',
          'Cleanse duplicates and inconsistencies',
          'Standardise naming and classification structures',
          'Implement governance and monitoring controls'
        ],
        valueToConsultant: [
          'Enhance financial and operational accuracy',
          'Improve reporting reliability for clients',
          'Increase recurring data governance assignments',
          'Position yourself as a digital governance advisor'
        ],
        whyUs: [
          'Governance-driven data frameworks',
          'Integration with compliance and ERP systems',
          'Practical implementation support',
          'Focus on long-term data sustainability'
        ]
      },
      {
        title: 'Department-Wise Digital Transformation',
        coreOfferingIntro: 'We support you in driving structured digital transformation across finance, HR, operations, procurement, and other departments.',
        coreOffering: [
          'Process automation mapping',
          'System integration strategy',
          'Digital workflow implementation',
          'Performance tracking frameworks'
        ],
        methodologyTitle: 'Map ? Digitise ? Integrate ? Optimise',
        steps: [
          'Map manual and inefficient processes',
          'Digitise workflows with appropriate tools',
          'Integrate systems across departments',
          'Optimise through performance measurement'
        ],
        valueToConsultant: [
          'Expand into enterprise-wide transformation advisory',
          'Increase project-based revenue opportunities',
          'Strengthen long-term client dependency',
          'Deliver measurable productivity gains'
        ],
        whyUs: [
          'Finance-first transformation perspective',
          'Governance-aligned digital integration',
          'Cross-functional expertise',
          'Execution-driven implementation approach'
        ]
      },
      {
        title: 'AI Integration for Process Efficiency & Insights',
        coreOfferingIntro: 'We help you integrate AI-driven solutions to automate processes, enhance analytics, and generate actionable business insights.',
        coreOffering: [
          'AI opportunity assessment',
          'Workflow automation design',
          'Predictive analytics integration',
          'AI governance and control framework'
        ],
        methodologyTitle: 'Identify ? Design ? Deploy ? Govern',
        steps: [
          'Identify automation and AI opportunities',
          'Design AI-enabled workflows and dashboards',
          'Deploy solutions aligned with business goals',
          'Govern through monitoring and compliance controls'
        ],
        valueToConsultant: [
          'Enter high-growth AI advisory space',
          'Offer premium, innovation-driven services',
          'Improve client operational efficiency',
          'Position yourself as a next-generation consulting partner'
        ],
        whyUs: [
          'Governance-led AI integration approach',
          'Risk-aware implementation framework',
          'Practical automation strategies',
          'Alignment with compliance and digital standards'
        ]
      }
    ],
        'gcc-operation-hub': [
      {
        title: 'Support Services',
        coreOfferingIntro: 'We help you enable clients to establish structured operational support systems that improve efficiency, governance, and scalability.',
        coreOffering: [
          'Finance & accounting support frameworks',
          'Compliance and reporting support models',
          'Operational control design',
          'Process standardisation',
          'Governance-aligned service structures'
        ],
        methodologyTitle: 'Assess ? Structure ? Deploy ? Optimise',
        steps: [
          'Assess operational inefficiencies and gaps',
          'Structure centralised support models',
          'Deploy governance-driven processes',
          'Optimise through performance tracking'
        ],
        valueToConsultant: [
          'Expand into long-term operational advisory',
          'Increase recurring service-based revenue',
          'Strengthen client process dependency',
          'Position yourself as a strategic operations partner'
        ],
        whyUs: [
          'Governance-first operational design',
          'Experience across multi-function service setups',
          'Practical implementation expertise',
          'Scalable service architecture'
        ]
      },
      {
        title: 'Captive Shared Services Center Setup & Stabilization',
        coreOfferingIntro: 'We assist you in helping clients establish and stabilise Captive Shared Service Centers (SSC) to centralise operations, improve control, and reduce cost.',
        coreOffering: [
          'Feasibility and location assessment',
          'Operating model design',
          'Governance and reporting structure setup',
          'Talent and transition planning',
          'Stabilisation and performance optimisation'
        ],
        methodologyTitle: 'Evaluate ? Design ? Transition ? Stabilise',
        steps: [
          'Evaluate business case and operational readiness',
          'Design SSC structure and governance model',
          'Transition processes and teams',
          'Stabilise operations through performance metrics'
        ],
        valueToConsultant: [
          'Enter global operations advisory',
          'Increase high-value transformation projects',
          'Support clients in cost optimisation strategies',
          'Strengthen your positioning in enterprise consulting'
        ],
        whyUs: [
          'Strong finance and governance integration',
          'Practical SSC setup frameworks',
          'Cross-border operational expertise',
          'Focus on long-term stability, not just launch'
        ]
      },
      {
        title: 'Build, Operate & Transform (BOT) Model Implementation',
        coreOfferingIntro: 'We help you guide clients in setting up operations under the Build, Operate & Transform (BOT) model ? ensuring controlled expansion with structured governance.',
        coreOffering: [
          'BOT strategy and feasibility planning',
          'Operational setup and process design',
          'Governance and compliance structuring',
          'Transformation roadmap development',
          'Exit or transition strategy planning'
        ],
        methodologyTitle: 'Build ? Operate ? Optimise ? Transform',
        steps: [
          'Build operational infrastructure and teams',
          'Operate under structured governance models',
          'Optimise performance and cost structures',
          'Transform into a scalable, independent function'
        ],
        valueToConsultant: [
          'Expand into strategic global expansion advisory',
          'Increase project-based and recurring revenue',
          'Support clients in controlled international growth',
          'Position yourself as a transformation leader'
        ],
        whyUs: [
          'Governance-driven BOT framework',
          'Practical execution expertise',
          'Integrated finance, compliance, and operations approach',
          'Structured transformation and scalability planning'
        ]
      }
    ],
        'training-workshop': [
      {
        title: 'Internal Audit Training',
        coreOfferingIntro: 'Structured training programs to build expertise in internal audit frameworks, risk-based auditing, controls evaluation, and governance alignment.',
        coreOffering: [
          'Risk-based audit approach',
          'Control testing techniques',
          'Audit documentation standards',
          'Reporting & stakeholder communication',
          'Practical case simulations'
        ],
        methodologyTitle: 'Learn ? Apply ? Simulate ? Implement',
        steps: [
          'Concept-based learning',
          'Real-world audit case studies',
          'Simulation-driven workshops',
          'Implementation frameworks for client delivery'
        ],
        valueToConsultant: [
          'Increase audit engagement revenue',
          'Deliver structured, high-quality audit assignments',
          'Improve credibility with CFOs and Boards',
          'Position yourself as a governance advisor'
        ],
        whyUs: [
          'Practical audit exposure',
          'Governance-aligned frameworks',
          'Industry-relevant case studies',
          'Execution-focused learning'
        ]
      },
      {
        title: 'ESG & Sustainability Training',
        coreOfferingIntro: 'Comprehensive ESG workshops to help you advise clients on sustainability reporting, carbon estimation, supply chain compliance, and regulatory readiness.',
        coreOffering: [
          'ESG framework fundamentals',
          'Reporting structures',
          'Carbon & climate risk basics',
          'Data collection methodologies',
          'Regulatory alignment'
        ],
        methodologyTitle: 'Understand ? Structure ? Measure ? Report',
        steps: [
          'ESG concept clarity',
          'Framework design guidance',
          'Measurement tools introduction',
          'Reporting implementation techniques'
        ],
        valueToConsultant: [
          'Enter high-growth ESG advisory',
          'Expand service portfolio',
          'Increase consulting ticket size',
          'Position yourself as a future-ready advisor'
        ],
        whyUs: [
          'Regulatory-focused ESG training',
          'Practical implementation approach',
          'Integrated governance perspective',
          'Market-relevant content'
        ]
      },
      {
        title: 'Cybersecurity & Data Privacy Awareness Training',
        coreOfferingIntro: 'Training programs covering cybersecurity fundamentals, DPDP, global privacy standards, and risk mitigation strategies.',
        coreOffering: [
          'Data protection fundamentals',
          'Privacy risk awareness',
          'Compliance readiness (DPDP, GDPR basics)',
          'Incident response basics',
          'Governance alignment'
        ],
        methodologyTitle: 'Educate ? Assess ? Strengthen ? Comply',
        steps: [
          'Awareness sessions',
          'Risk exposure assessment exercises',
          'Control framework understanding',
          'Compliance-oriented implementation guidance'
        ],
        valueToConsultant: [
          'Expand into compliance advisory',
          'Increase cybersecurity-related engagements',
          'Strengthen client trust',
          'Address board-level concerns'
        ],
        whyUs: [
          'Governance-led cyber approach',
          'Compliance-focused training modules',
          'Practical business scenarios',
          'Strategic positioning support'
        ]
      },
      {
        title: 'AI Implementation Training',
        coreOfferingIntro: 'Hands-on workshops to help you identify AI opportunities, automate workflows, and integrate AI responsibly into client operations.',
        coreOffering: [
          'AI fundamentals for consultants',
          'Process automation use cases',
          'AI governance basics',
          'Risk and control considerations',
          'ROI-driven AI adoption'
        ],
        methodologyTitle: 'Identify ? Design ? Deploy ? Govern',
        steps: [
          'Opportunity identification exercises',
          'Workflow mapping sessions',
          'AI integration frameworks',
          'Governance & control awareness'
        ],
        valueToConsultant: [
          'Enter premium AI advisory market',
          'Deliver innovation-led solutions',
          'Increase digital transformation revenue',
          'Differentiate from traditional consultants'
        ],
        whyUs: [
          'Governance-first AI perspective',
          'Practical business implementation',
          'Risk-aware adoption model',
          'Revenue-oriented approach'
        ]
      },
      {
        title: 'Leadership & Soft Skills Development',
        coreOfferingIntro: 'Workshops designed to enhance leadership presence, communication, negotiation, and stakeholder management for consultants and senior professionals.',
        coreOffering: [
          'Executive communication',
          'Client relationship management',
          'Negotiation skills',
          'Team leadership',
          'Strategic thinking'
        ],
        methodologyTitle: 'Develop ? Practice ? Refine ? Lead',
        steps: [
          'Interactive learning',
          'Role-play simulations',
          'Scenario-based exercises',
          'Personalised feedback'
        ],
        valueToConsultant: [
          'Increase client retention',
          'Improve stakeholder confidence',
          'Strengthen leadership positioning',
          'Build long-term advisory relationships'
        ],
        whyUs: [
          'Practical, real-world scenarios',
          'Consultant-focused curriculum',
          'Executive-level communication frameworks',
          'Immediate applicability'
        ]
      }
    ],
        'recruitment-manpower-services': [
      {
        title: 'Temporary Staffing',
        coreOfferingIntro: 'We help you support clients with structured temporary staffing solutions for short-term, project-based, compliance-driven, or transition requirements.',
        coreOffering: [
          'Finance & accounting professionals',
          'Internal audit & compliance resources',
          'ESG & sustainability support staff',
          'IT & data privacy specialists',
          'Project-based deployment'
        ],
        methodologyTitle: 'Understand ? Source ? Deploy ? Monitor',
        steps: [
          'Understand client skill and timeline requirements',
          'Source pre-vetted professionals',
          'Deploy under structured engagement models',
          'Monitor performance and ensure continuity'
        ],
        valueToConsultant: [
          'Expand into staffing-led revenue streams',
          'Offer end-to-end advisory + execution support',
          'Strengthen client reliance during peak workload',
          'Increase recurring and project-based income'
        ],
        whyUs: [
          'Access to domain-specific talent pools',
          'Governance-aligned resource deployment',
          'Fast turnaround capability',
          'Structured performance oversight'
        ]
      },
      {
        title: 'Permanent Recruitment',
        coreOfferingIntro: 'We assist you in helping clients identify and recruit permanent talent aligned with strategic growth, governance, and compliance requirements.',
        coreOffering: [
          'CXO & senior leadership hiring',
          'Finance & risk professionals',
          'ESG & sustainability experts',
          'Cybersecurity & data privacy specialists',
          'ERP & digital transformation roles'
        ],
        methodologyTitle: 'Define ? Identify ? Evaluate ? Onboard',
        steps: [
          'Define role objectives and capability framework',
          'Identify candidates through structured sourcing',
          'Evaluate technical and cultural fit',
          'Support onboarding and transition alignment'
        ],
        valueToConsultant: [
          'Add executive search capability to your portfolio',
          'Increase engagement value with hiring mandates',
          'Strengthen long-term client relationships',
          'Become a strategic talent partner, not just an advisor'
        ],
        whyUs: [
          'Strong industry talent network',
          'Governance and compliance-focused hiring',
          'Structured evaluation frameworks',
          'Alignment with transformation and growth goals'
        ]
      }
    ],
  };
  const localizedSubServices = t('serviceDetail.subServices', {
    returnObjects: true,
    defaultValue: subServiceDetailsDefault
  });
  const subServicesForService = localizedSubServices?.[service?.id] || subServiceDetailsDefault[service?.id] || null;
  const activeSubServiceData = subServicesForService && activeSubService !== null
    ? subServicesForService[activeSubService]
    : null;
  const hasStructuredSubService = Boolean(
    activeSubServiceData?.coreOffering || activeSubServiceData?.valueToConsultant || activeSubServiceData?.whyUs
  );
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formTypeLabel = activeSection === 'manpower'
      ? 'Manpower'
      : activeSection === 'training'
        ? 'Training'
        : 'Enquiry';

    setIsSubmitting(true);
    try {
      const stored = localStorage.getItem('partnerUser');
      let partnerId = null;
      if (stored) {
        try {
          partnerId = JSON.parse(stored)?.id || null;
        } catch (error) {
          console.error('Could not parse partner user from localStorage:', error);
        }
      }

      await submitEnquiry({
        partnerId,
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

      setSubmitted(true);
    } catch (error) {
      console.error('Enquiry submission error:', error);
      alert(t('serviceDetail.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRequirementModal = () => {
    const stored = localStorage.getItem('partnerUser');
    if (!stored) {
      alert('Please log in first to submit your voice requirement.');
      navigate('/login');
      return;
    }
    setIsRequirementModalOpen(true);
  };

  const handleRequirementSend = async (text) => {
    let partnerId = null;
    let partnerEmail = '';
    try {
      const stored = localStorage.getItem('partnerUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        partnerId = parsed?.id || null;
        partnerEmail = parsed?.email || '';
      }
    } catch (error) {
      console.error('Could not parse partner user from localStorage:', error);
    }

    try {
      await submitVoiceRequirement({
        requirement: text,
        partnerId,
        partnerEmail,
        recipientEmail: 'rohanbncglobal@gmail.com',
        source: 'service-detail'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        navigate('/login');
        throw new Error('Please log in to submit your requirement.');
      }
      throw error;
    }
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
                {visibleSections.map((section) => (
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
                              onClick={handleOpenRequirementModal}
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
                        {hasStructuredSubService ? (
                          <>
                            <div className={`mt-3 ${sectionPadding}`}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-geist">
                                {t('serviceDetail.subServiceCoreOfferingLabel')}
                              </p>
                              {activeSubServiceData.coreOfferingIntro && (
                                <p className="mt-2 font-geist text-sm text-slate-700">
                                  {activeSubServiceData.coreOfferingIntro}
                                </p>
                              )}
                              {activeSubServiceData.coreOffering?.length > 0 && (
                                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                                  {activeSubServiceData.coreOffering.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className={`mt-5 ${sectionPadding}`}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-geist">
                                {t('serviceDetail.subServiceMethodologyLabel')}
                              </p>
                              <p className="mt-2 font-geist text-sm font-semibold text-slate-800">
                                {activeSubServiceData.methodologyTitle}
                              </p>
                              {activeSubServiceData.steps?.length > 0 && (
                                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                                  {activeSubServiceData.steps.map((step) => (
                                    <li key={step}>{step}</li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {activeSubServiceData.valueToConsultant?.length > 0 && (
                              <div className={`mt-5 ${sectionPadding}`}>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-geist">
                                  {t('serviceDetail.subServiceValueLabel')}
                                </p>
                                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                                  {activeSubServiceData.valueToConsultant.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {activeSubServiceData.whyUs?.length > 0 && (
                              <div className={`mt-5 ${sectionPadding}`}>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-geist">
                                  {t('serviceDetail.subServiceWhyUsLabel')}
                                </p>
                                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-outside font-geist leading-relaxed pl-5">
                                  {activeSubServiceData.whyUs.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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
        onSend={handleRequirementSend}
      />
    </>
  );
};

export default ServiceDetail;

