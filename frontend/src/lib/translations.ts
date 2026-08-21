/**
 * BashaBari Bilingual Localization Dictionary (English & বাংলা)
 *
 * `en` is the source of truth for the shape. `bn` is typed against it, so a
 * key added to English fails the build until it is translated rather than
 * silently falling back and shipping half an English screen to a Bangla user.
 */

export type Language = "en" | "bn";

const en = {
  common: {
    appName: "BashaBari",
    tagline: "Property Operations SaaS for Bangladesh",
    currency: "৳",
    currencyCode: "BDT",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    status: "Status",
    action: "Action",
    search: "Search...",
    loading: "Loading...",
    noData: "No data available",
    printReceipt: "Print Official Money Receipt",
    viewAll: "View all",
    retry: "Try again",
    somethingWentWrong: "Could not load this right now.",
  },
  nav: {
    groupEveryday: "Everyday",
    groupMoney: "Money",
    groupProperty: "Property & People",
    groupAdmin: "Settings",

    dashboard: "Home",
    guide: "How to use BashaBari",
    properties: "Buildings",
    units: "Flats",
    tenants: "Tenants",
    leases: "Agreements",
    invoices: "Rent Bills",
    payments: "Money Received",
    financials: "Income & Expenses",
    utilities: "Meters & Bills",
    expenses: "Spending",
    maintenance: "Repairs",
    staff: "Caretakers & Guards",
    reports: "Reports",
    organization: "My Organisation",
    members: "My Team",
    auditLogs: "Activity History",
    compliance: "Rent Law & Legal",

    switchOrganization: "Switch organisation",
    addOrganization: "Add new organisation",
    settings: "Settings",
    signOut: "Sign out",
    trial: "5-Day Trial",
  },
  dashboard: {
    greeting: "Welcome back",
    managing: "Managing",

    outstandingTitle: "Rent still to collect",
    outstandingEmpty: "Everything is collected. Nothing outstanding.",
    outstandingFrom: (count: number) => `from ${count} unpaid ${count === 1 ? "bill" : "bills"}`,
    collectedThisPeriod: "Collected so far",
    billedThisPeriod: "Billed in total",

    seeUnpaidBills: "See unpaid bills",
    recordPayment: "Record a payment",

    buildings: "Buildings",
    flatsOccupied: "Flats occupied",
    activeTenants: "Tenants",
    openRepairs: "Open repairs",

    unitsSummary: (occupied: number, total: number) => `${occupied} of ${total} flats occupied`,
    vacantFlats: (count: number) => `${count} vacant`,
    tenantsSummary: (count: number) => `${count} on active agreements`,
    repairsSummary: (pending: number, emergency: number) =>
      emergency > 0 ? `${pending} waiting · ${emergency} urgent` : `${pending} waiting`,

    trialTitle: "5-Day Trial Active",
    trialBody: "You have full access to every feature during your trial.",

    setupTitle: "Let's get you set up",
    setupBody: "Three steps and you can start collecting rent.",
    step1Title: "Add your building",
    step1Body: "Enter your building, floors and flats.",
    step1Cta: "Add building",
    step2Title: "Add your tenants",
    step2Body: "Record who lives in each flat and their agreement.",
    step2Cta: "Add tenant",
    step3Title: "Send the first bills",
    step3Body: "Generate this month's rent bills in one click.",
    step3Cta: "Create bills",
  },
  portal: {
    title: "Tenant Portal",
    backToSite: "Main site",
    home: "My Home",
    invoices: "My Rent Bills",
    maintenance: "Report a Problem",
    guide: "How to use this",
    logout: "Log out",
    homepage: "BashaBari homepage",
  },
  status: {
    paid: "Paid",
    unpaid: "Unpaid",
    partially_paid: "Partially Paid",
    overdue: "Overdue",
    active: "Active",
    vacant: "Vacant",
    occupied: "Occupied",
    pending: "Pending",
    completed: "Completed",
    refunded: "Refunded",
  },
  receipt: {
    title: "OFFICIAL MONEY RECEIPT",
    bengaliTitle: "বাড়ি ভাড়ার অফিসিয়াল মানি রসিদ",
    receiptNo: "Receipt No",
    date: "Date",
    receivedFrom: "Received With Thanks From (Tenant)",
    nidNumber: "National ID (NID)",
    premises: "Rental Premises & Flat Unit",
    amountInWords: "Amount in Words",
    paymentMethod: "Payment Method",
    transactionId: "Transaction / Ref ID",
    itemDescription: "Description / Particulars",
    rent: "Monthly House Rent",
    electricity: "Sub-Meter Electricity Bill",
    gas: "Gas Bill",
    water: "Water Supply Bill",
    serviceCharge: "Building Maintenance & Service Charge",
    authorizedSignature: "Authorized Landlord / Manager Signature",
  },
  dmp: {
    title: "DHAKA METROPOLITAN POLICE (DMP) TENANT REGISTRATION FORM",
    bengaliTitle: "ঢাকা মেট্রোপলিটন পুলিশ (ডিএমপি) ভাড়াটিয়া তথ্য ফরম",
    subHeader: "Form as per DMP Citizen Information Management System (CIMS)",
    tenantName: "Tenant's Full Name",
    fatherName: "Father's Name",
    permanentAddress: "Permanent Address",
    workplace: "Occupation & Workplace Address",
    nidNumber: "National ID / Passport Number",
    mobileNumber: "Mobile Number",
    emergencyContact: "Emergency Contact Person & Phone",
    flatNumber: "Assigned Flat / Unit Number",
    moveInDate: "Move-in / Lease Start Date",
  },
  utilities: {
    electricity: "Electricity",
    gas: "Gas",
    water: "Water",
    subMeter: "Sub-Meter Reading",
    previousReading: "Previous Reading",
    currentReading: "Current Reading",
    unitsConsumed: "Units Consumed",
    ratePerUnit: "Rate / Unit (BDT)",
  },
};

export type Dictionary = typeof en;

const bn: Dictionary = {
  common: {
    appName: "বাসাবাড়ি",
    tagline: "বাংলাদেশের জন্য পূর্ণাঙ্গ বাড়ি ও ফ্ল্যাট ব্যবস্থাপনা প্ল্যাটফর্ম",
    currency: "৳",
    currencyCode: "টাকা",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    delete: "মুছে ফেলুন",
    edit: "সম্পাদনা",
    view: "দেখুন",
    status: "অবস্থা",
    action: "পদক্ষেপ",
    search: "অনুসন্ধান করুন...",
    loading: "লোড হচ্ছে...",
    noData: "কোন তথ্য পাওয়া যায়নি",
    printReceipt: "অফিসিয়াল মানি রসিদ প্রিন্ট করুন",
    viewAll: "সব দেখুন",
    retry: "আবার চেষ্টা করুন",
    somethingWentWrong: "এই মুহূর্তে তথ্য আনা যায়নি।",
  },
  nav: {
    groupEveryday: "প্রতিদিনের কাজ",
    groupMoney: "টাকা-পয়সা",
    groupProperty: "বাড়ি ও ভাড়াটিয়া",
    groupAdmin: "সেটিংস",

    dashboard: "হোম",
    guide: "বাসাবাড়ি কীভাবে চালাবেন",
    properties: "বাড়িসমূহ",
    units: "ফ্ল্যাটসমূহ",
    tenants: "ভাড়াটিয়া",
    leases: "ভাড়ার চুক্তি",
    invoices: "ভাড়ার বিল",
    payments: "জমা হওয়া টাকা",
    financials: "আয় ও ব্যয়",
    utilities: "মিটার ও ইউটিলিটি বিল",
    expenses: "খরচ",
    maintenance: "মেরামত",
    staff: "কেয়ারটেকার ও দারোয়ান",
    reports: "হিসাব ও রিপোর্ট",
    organization: "আমার প্রতিষ্ঠান",
    members: "আমার টিম",
    auditLogs: "কার্যক্রমের ইতিহাস",
    compliance: "ভাড়া আইন ও আইনি বিষয়",

    switchOrganization: "প্রতিষ্ঠান পরিবর্তন করুন",
    addOrganization: "নতুন প্রতিষ্ঠান যোগ করুন",
    settings: "সেটিংস",
    signOut: "সাইন আউট",
    trial: "৫ দিনের ট্রায়াল",
  },
  dashboard: {
    greeting: "স্বাগতম",
    managing: "পরিচালনা করছেন",

    outstandingTitle: "যত ভাড়া এখনো বাকি",
    outstandingEmpty: "সব ভাড়া আদায় হয়ে গেছে। কোনো বকেয়া নেই।",
    outstandingFrom: (count: number) => `${toBn(count)} টি অপরিশোধিত বিল থেকে`,
    collectedThisPeriod: "এ পর্যন্ত আদায়",
    billedThisPeriod: "মোট বিল করা হয়েছে",

    seeUnpaidBills: "বকেয়া বিল দেখুন",
    recordPayment: "টাকা জমা লিখুন",

    buildings: "বাড়ি",
    flatsOccupied: "ভাড়া হওয়া ফ্ল্যাট",
    activeTenants: "ভাড়াটিয়া",
    openRepairs: "চলমান মেরামত",

    unitsSummary: (occupied: number, total: number) =>
      `${toBn(total)} টির মধ্যে ${toBn(occupied)} টি ফ্ল্যাট ভাড়া হয়েছে`,
    vacantFlats: (count: number) => `${toBn(count)} টি খালি`,
    tenantsSummary: (count: number) => `${toBn(count)} জন সক্রিয় চুক্তিতে আছেন`,
    repairsSummary: (pending: number, emergency: number) =>
      emergency > 0
        ? `${toBn(pending)} টি অপেক্ষমাণ · ${toBn(emergency)} টি জরুরি`
        : `${toBn(pending)} টি অপেক্ষমাণ`,

    trialTitle: "৫ দিনের ট্রায়াল চালু আছে",
    trialBody: "ট্রায়াল চলাকালীন আপনি সব সুবিধা ব্যবহার করতে পারবেন।",

    setupTitle: "চলুন শুরু করা যাক",
    setupBody: "তিনটি ধাপ শেষ করলেই ভাড়া আদায় শুরু করতে পারবেন।",
    step1Title: "আপনার বাড়ি যোগ করুন",
    step1Body: "বাড়ি, তলা ও ফ্ল্যাটের তথ্য দিন।",
    step1Cta: "বাড়ি যোগ করুন",
    step2Title: "ভাড়াটিয়া যোগ করুন",
    step2Body: "কোন ফ্ল্যাটে কে থাকেন ও তাঁর চুক্তির তথ্য লিখুন।",
    step2Cta: "ভাড়াটিয়া যোগ করুন",
    step3Title: "প্রথম বিল পাঠান",
    step3Body: "এক ক্লিকেই এই মাসের ভাড়ার বিল তৈরি করুন।",
    step3Cta: "বিল তৈরি করুন",
  },
  portal: {
    title: "ভাড়াটিয়া পোর্টাল",
    backToSite: "মূল সাইট",
    home: "আমার তথ্য",
    invoices: "আমার ভাড়ার বিল",
    maintenance: "সমস্যা জানান",
    guide: "কীভাবে ব্যবহার করবেন",
    logout: "লগ আউট",
    homepage: "বাসাবাড়ি হোমপেজ",
  },
  status: {
    paid: "পরিশোধিত",
    unpaid: "বকেয়া",
    partially_paid: "আংশিক পরিশোধিত",
    overdue: "মেয়াদোত্তীর্ণ",
    active: "সক্রিয়",
    vacant: "খালি",
    occupied: "ভাড়া দেওয়া",
    pending: "অপেক্ষমান",
    completed: "সম্পন্ন",
    refunded: "ফেরত প্রদানকৃত",
  },
  receipt: {
    title: "অফিসিয়াল মানি রসিদ",
    bengaliTitle: "বাড়ি ভাড়ার অফিসিয়াল মানি রসিদ",
    receiptNo: "রসিদ নম্বর",
    date: "তারিখ",
    receivedFrom: "ভাড়াটিয়ার নাম",
    nidNumber: "জাতীয় পরিচয়পত্র নম্বর (NID)",
    premises: "ভাড়া দেওয়া ফ্ল্যাট ও ভবনের ঠিকানা",
    amountInWords: "কথায় মোট টাকা",
    paymentMethod: "পরিশোধের মাধ্যম",
    transactionId: "ট্রানজেকশন / রেফারেন্স নম্বর",
    itemDescription: "বিবরণ",
    rent: "মাসিক বাড়ি ভাড়া",
    electricity: "সাব-মিটার বিদ্যুৎ বিল",
    gas: "গ্যাস বিল",
    water: "পানি বিল",
    serviceCharge: "বিল্ডিং সার্ভিস ও সিকিউরিটি চার্জ",
    authorizedSignature: "বাড়িওয়ালা / ম্যানেজারের স্বাক্ষর",
  },
  dmp: {
    title: "ঢাকা মেট্রোপলিটন পুলিশ (ডিএমপি) ভাড়াটিয়া তথ্য ফরম",
    bengaliTitle: "ঢাকা মেট্রোপলিটন পুলিশ (ডিএমপি) ভাড়াটিয়া তথ্য ফরম",
    subHeader: "ডিএমপি সিটিজেন ইনফরমেশন ম্যানেজমেন্ট সিস্টেম (CIMS) অনুযায়ী",
    tenantName: "ভাড়াটিয়ার পুরো নাম",
    fatherName: "পিতার নাম",
    permanentAddress: "স্থায়ী ঠিকানা",
    workplace: "পেশা ও কর্মক্ষেত্রের ঠিকানা",
    nidNumber: "জাতীয় পরিচয়পত্র / পাসপোর্ট নম্বর",
    mobileNumber: "মোবাইল নম্বর",
    emergencyContact: "জরুরি যোগাযোগের ব্যক্তি ও ফোন",
    flatNumber: "ভাড়া নেওয়া ফ্ল্যাট / ইউনিট",
    moveInDate: "ভাড়া শুরুর তারিখ",
  },
  utilities: {
    electricity: "বিদ্যুৎ",
    gas: "গ্যাস",
    water: "পানি",
    subMeter: "সাব-মিটার রিডিং",
    previousReading: "পূর্বের রিডিং",
    currentReading: "বর্তমান রিডিং",
    unitsConsumed: "ব্যবহৃত ইউনিট",
    ratePerUnit: "প্রতি ইউনিট রেট (টাকা)",
  },
};

/**
 * Local Bengali-numeral helper.
 *
 * Duplicated from i18n.ts on purpose: importing i18n here would create a cycle
 * (i18n imports this module for the dictionary).
 */
function toBn(value: number | string): string {
  const digits: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };

  const str = typeof value === "number" ? value.toLocaleString("en-US") : String(value);

  return str.replace(/[0-9]/g, (d) => digits[d] ?? d);
}

export const translations: Record<Language, Dictionary> = { en, bn };
