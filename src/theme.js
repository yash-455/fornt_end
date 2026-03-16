export const G = {
  navy: "#0a0a0a", navy2: "#111111", navy3: "#1a1a1a",
  gold: "#ffffff", goldL: "#f0f0f0", goldD: "#cccccc",
  text: "#ffffff", muted: "#888888", muted2: "#aaaaaa",
  border: "#222222", borderL: "#333333",
  green: "#ffffff", greenBg: "#1a1a1a",
  red: "#ffffff", redBg: "#1a1a1a",
  amber: "#ffffff", amberBg: "#1a1a1a",
  blue: "#ffffff", blueBg: "#1a1a1a",
};

export const MOCK_USER = {
  id: "u1", name: "Rahul Sharma",
  email: "rahul@sharma-legal.com",
  firm: "Sharma & Associates",
  phone: "9876543210",
};

export const MOCK_CLIENTS = [
  { id: "c1", name: "Amit Patel",   email: "amit@gmail.com",   phone: "9811111111", address: "Mumbai, MH",  cases: 3 },
  { id: "c2", name: "Priya Verma",  email: "priya@gmail.com",  phone: "9822222222", address: "Pune, MH",    cases: 2 },
  { id: "c3", name: "Rajan Mehta",  email: "rajan@gmail.com",  phone: "9833333333", address: "Delhi, DL",   cases: 1 },
  { id: "c4", name: "Sunita Joshi", email: "sunita@gmail.com", phone: "9844444444", address: "Nagpur, MH",  cases: 2 },
  { id: "c5", name: "Vikram Singh", email: "vikram@gmail.com", phone: "9855555555", address: "Chennai, TN", cases: 1 },
];

export const MOCK_CASES = [
  { id: "cs1", case_number: "2024-1042", case_name: "Patel vs State",    client_id: "c1", client_name: "Amit Patel",   status: "open",    court: "High Court Mumbai",      filing_date: "2024-01-15", notes: "Property dispute case.",   ai_summary: "Property dispute filed by Amit Patel against the State of Maharashtra regarding land acquisition." },
  { id: "cs2", case_number: "2024-1043", case_name: "Verma vs Union",    client_id: "c2", client_name: "Priya Verma",  status: "pending", court: "Supreme Court",          filing_date: "2024-02-20", notes: "Service matter appeal.",   ai_summary: "Service matter appeal by Priya Verma against Union of India regarding wrongful termination." },
  { id: "cs3", case_number: "2024-1044", case_name: "Mehta vs Corp Ltd", client_id: "c3", client_name: "Rajan Mehta",  status: "closed",  court: "District Court Delhi",   filing_date: "2023-11-10", notes: "Contract breach resolved.", ai_summary: "Contract breach case — resolved in favour of plaintiff with damages awarded." },
  { id: "cs4", case_number: "2024-1045", case_name: "Joshi vs Dept",     client_id: "c4", client_name: "Sunita Joshi", status: "open",    court: "High Court Mumbai",      filing_date: "2024-03-05", notes: "Pension dispute.",         ai_summary: "Pension dispute case filed by Sunita Joshi against the government department." },
  { id: "cs5", case_number: "2024-1046", case_name: "Singh vs Builder",  client_id: "c5", client_name: "Vikram Singh", status: "pending", court: "Consumer Court",         filing_date: "2024-04-12", notes: "Real estate fraud.",       ai_summary: "Consumer complaint filed by Vikram Singh against a real estate builder for project delays." },
  { id: "cs6", case_number: "2024-1047", case_name: "Patel vs Bank",     client_id: "c1", client_name: "Amit Patel",   status: "open",    court: "Debt Recovery Tribunal", filing_date: "2024-05-01", notes: "Loan dispute.",            ai_summary: "Loan recovery dispute between Amit Patel and his bank regarding restructuring terms." },
];

export const MOCK_HEARINGS = [
  { id: "h1", case_id: "cs1", case_name: "Patel vs State",    date: "2024-06-15", judge: "Justice Mehta",  outcome: "Adjourned",           next_date: "2024-08-20", notes: "Both parties present. Next date fixed." },
  { id: "h2", case_id: "cs1", case_name: "Patel vs State",    date: "2024-03-10", judge: "Justice Mehta",  outcome: "Arguments heard",     next_date: "2024-06-15", notes: "Plaintiff arguments completed." },
  { id: "h3", case_id: "cs2", case_name: "Verma vs Union",    date: "2024-07-01", judge: "Justice Kapoor", outcome: "Pending",             next_date: "2024-09-15", notes: "Stay granted." },
  { id: "h4", case_id: "cs3", case_name: "Mehta vs Corp Ltd", date: "2024-01-20", judge: "Justice Singh",  outcome: "Decided — Plaintiff", next_date: null,         notes: "Final judgement delivered." },
  { id: "h5", case_id: "cs4", case_name: "Joshi vs Dept",     date: "2024-07-22", judge: "Justice Rathi",  outcome: "Adjourned",           next_date: "2024-10-05", notes: "Government sought time." },
  { id: "h6", case_id: "cs5", case_name: "Singh vs Builder",  date: "2024-08-10", judge: "Justice Nair",   outcome: "Pending",             next_date: "2024-11-01", notes: "Evidence submitted." },
  { id: "h7", case_id: "cs6", case_name: "Patel vs Bank",     date: "2024-09-03", judge: "Justice Joshi",  outcome: "Adjourned",           next_date: "2024-12-15", notes: "Bank filed additional documents." },
];

export const MOCK_DOCS = [
  { id: "d1", name: "Affidavit_Patel.pdf",       case_id: "cs1", case_name: "Patel vs State",    file_type: "pdf",  uploaded_at: "2024-01-20", ai_summary: "Affidavit filed by Amit Patel detailing land acquisition facts, survey numbers, and valuation disputes." },
  { id: "d2", name: "Land_Survey_Report.pdf",    case_id: "cs1", case_name: "Patel vs State",    file_type: "pdf",  uploaded_at: "2024-02-05", ai_summary: "Official land survey report confirming disputed area measurements and ownership chain." },
  { id: "d3", name: "Service_Record_Verma.docx", case_id: "cs2", case_name: "Verma vs Union",    file_type: "docx", uploaded_at: "2024-02-25", ai_summary: "Complete service record of Priya Verma showing 12 years of employment and performance ratings." },
  { id: "d4", name: "Contract_Mehta_Corp.pdf",   case_id: "cs3", case_name: "Mehta vs Corp Ltd", file_type: "pdf",  uploaded_at: "2023-11-15", ai_summary: "Original contract between Rajan Mehta and Corp Ltd outlining deliverable timelines and payment terms." },
  { id: "d5", name: "Pension_Order_Joshi.pdf",   case_id: "cs4", case_name: "Joshi vs Dept",     file_type: "pdf",  uploaded_at: "2024-03-10", ai_summary: "Government order denying pension benefits to Sunita Joshi citing administrative error." },
  { id: "d6", name: "Builder_Agreement.pdf",     case_id: "cs5", case_name: "Singh vs Builder",  file_type: "pdf",  uploaded_at: "2024-04-18", ai_summary: "Sale agreement between Vikram Singh and the builder specifying possession date and penalty clauses." },
];
