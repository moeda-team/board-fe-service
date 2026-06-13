export interface PrivacySection {
  id: string;
  number: number;
  title: string;
  content?: string;
  subsections?: PrivacySubsection[];
  cards?: PrivacyCard[];
}

export interface PrivacySubsection {
  id: string;
  number: string;
  title: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  items: string[];
}

export interface PrivacyCard {
  title: string;
  icon: string;
}

export const privacySections: PrivacySection[] = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction",
    content:
      'Welcome to our Task Management Application ("Application", "we", "our", or "us"). We are committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our Application.\n\nBy accessing or using the Application, you agree to the practices described in this Privacy Policy.'
  },
  {
    id: "information-we-collect",
    number: 2,
    title: "Information We Collect",
    subsections: [
      {
        id: "information-you-provide",
        number: "2.1",
        title: "Information You Provide",
        icon: "User",
        iconColor: "#227bfe",
        iconBg: "#ebf1fd",
        items: [
          "Full name",
          "Email address",
          "Username and profile information",
          "Job title and department",
          "Organization or company information",
          "Profile photos or avatars",
          "Task descriptions, comments, attachments, and project-related data",
          "Communications submitted through support channels"
        ]
      },
      {
        id: "information-collected-automatically",
        number: "2.2",
        title: "Information Collected Automatically",
        icon: "Monitor",
        iconColor: "#22c55e",
        iconBg: "#dcfce7",
        items: [
          "IP address",
          "Browser type and version",
          "Device information",
          "Operating system",
          "Login timestamps and activity logs",
          "Application usage statistics",
          "Cookies and similar tracking technologies"
        ]
      },
      {
        id: "third-party-integrations",
        number: "2.3",
        title: "Third-Party Integrations",
        icon: "Link2",
        iconColor: "#a855f7",
        iconBg: "#f3e8ff",
        items: [
          "Single Sign-On (SSO) providers",
          "Calendar applications",
          "Communication platforms",
          "File storage providers"
        ]
      }
    ]
  },
  {
    id: "how-we-use-your-information",
    number: 3,
    title: "How We Use Your Information",
    cards: [
      { title: "Provide and maintain the Application", icon: "Settings" },
      { title: "Create and manage user accounts", icon: "Users" },
      { title: "Facilitate task assignment, tracking, and collaboration", icon: "CheckSquare" },
      { title: "Monitor project progress and team performance", icon: "BarChart3" },
      { title: "Generate reports and analytics", icon: "FileText" },
      { title: "Provide customer support", icon: "Headphones" },
      { title: "Detect, investigate, and prevent security incidents", icon: "Shield" },
      { title: "Comply with legal obligations", icon: "Scale" }
    ]
  },
  {
    id: "data-sharing-and-disclosure",
    number: 4,
    title: "Data Sharing and Disclosure",
    content:
      'We do not sell your personal information.\n\nWe may share information under the following circumstances:\n\nWith Your Organization\n\nIf your account is provided through your employer or organization, administrators may access and manage information associated with your account, including user profiles, assigned tasks, project activities, performance and productivity reports, and audit logs.\n\nService Providers\n\nWe may share information with trusted third-party vendors that assist us in operating the Application, including providers of cloud hosting services, analytics services, customer support tools, and security monitoring services. These providers are contractually obligated to protect your information.\n\nLegal Requirements\n\nWe may disclose information when required to comply with applicable laws and regulations, respond to lawful requests from public authorities, protect our rights, users, and systems, or investigate fraud or security incidents.'
  },
  {
    id: "data-retention",
    number: 5,
    title: "Data Retention",
    content:
      'We retain personal and organizational data only as long as necessary to provide the services requested, fulfill contractual obligations, comply with legal and regulatory requirements, and resolve disputes and enforce agreements.\n\nOrganizations may request deletion of their data in accordance with applicable laws and contractual agreements.'
  },
  {
    id: "data-security",
    number: 6,
    title: "Data Security",
    content:
      'We implement reasonable administrative, technical, and organizational safeguards to protect your information, including encryption of data in transit using SSL/TLS, role-based access control (RBAC), multi-factor authentication (where enabled), regular security monitoring and audits, and secure backup and disaster recovery procedures.\n\nHowever, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.'
  },
  {
    id: "user-rights",
    number: 7,
    title: "User Rights",
    content:
      'Depending on applicable laws, you may have the right to access personal information we hold about you, correct inaccurate or incomplete information, request deletion of your personal information, restrict or object to certain processing activities, request a copy of your data in a portable format, and withdraw consent where processing is based on consent.\n\nRequests can be submitted through the contact information provided below.'
  },
  {
    id: "cookies-and-tracking",
    number: 8,
    title: "Cookies and Tracking Technologies",
    content:
      'The Application may use cookies and similar technologies to maintain user sessions, remember preferences, analyze usage patterns, and improve performance and functionality.\n\nYou may control cookie settings through your browser settings; however, disabling cookies may affect certain Application features.'
  },
  {
    id: "international-data-transfers",
    number: 9,
    title: "International Data Transfers",
    content:
      'If information is transferred or processed outside your country of residence, we will take appropriate measures to ensure that such transfers comply with applicable data protection laws and maintain adequate safeguards.'
  },
  {
    id: "childrens-privacy",
    number: 10,
    title: "Children's Privacy",
    content:
      'The Application is intended for business and professional use and is not directed toward individuals under the age of 18. We do not knowingly collect personal information from children.'
  },
  {
    id: "changes-to-policy",
    number: 11,
    title: "Changes to This Privacy Policy",
    content:
      'We may update this Privacy Policy periodically. Any changes will be posted within the Application, and the "Last Updated" date will be revised accordingly.\n\nContinued use of the Application after changes become effective constitutes acceptance of the updated Privacy Policy.'
  },
  {
    id: "contact-us",
    number: 12,
    title: "Contact Us",
    content:
      'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at the email or address provided in your organization settings or on our website.'
  },
  {
    id: "compliance-statement",
    number: 13,
    title: "Compliance Statement",
    content:
      'This Privacy Policy is designed to align with applicable data protection regulations, including but not limited to the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA) where applicable, and applicable local data protection laws and regulations.'
  }
];
