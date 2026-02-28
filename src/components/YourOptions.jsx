import React from "react";

const STEPS = [
  {
    number: "01",
    title: "Understand your rights",
    description:
      "Use the Navigator to get a clear picture of what you're owed and what laws apply. No one is notified.",
    consequence: "Zero consequences. Fully private.",
    isHumanDecision: false,
  },
  {
    number: "02",
    title: "Calculate and document",
    description:
      "Use the Wage Calculator to produce exact figures. Keep records , pay stubs, schedules, messages.",
    consequence: "Builds your case if you escalate later.",
    isHumanDecision: false,
  },
  {
    number: "03",
    title: "Send a demand letter",
    description:
      "A formal written request directly to your employer or landlord. States what you're owed and gives a deadline.",
    consequence:
      "Employer or landlord is notified. No government involvement yet.",
    isHumanDecision: false,
  },
  {
    number: "04",
    title: "File a formal complaint",
    description:
      "Employment: Ministry of Labour (MOL). Tenant: Landlord and Tenant Board (LTB). A government officer gets involved.",
    consequence:
      "Your employer or landlord is officially contacted. This is on record.",
    isHumanDecision: true,
    humanNote:
      "This decision must stay yours. The consequences are real and irreversible. This tool will never file on your behalf.",
  },
];

const LINKS = [
  [
    "Ministry of Labour , File an ESA Claim",
    "https://www.ontario.ca/document/your-guide-employment-standards-act-0/filing-claim",
  ],
  ["Landlord and Tenant Board", "https://tribunalsontario.ca/ltb/"],
  ["Ontario Human Rights Commission", "https://www.ohrc.on.ca/"],
  ["Community Legal Education Ontario (CLEO)", "https://www.cleo.on.ca/"],
];

export default function YourOptions() {
  return (
    <div className="options">
      <h2 className="section__title">Your Options</h2>
      <p className="section__subtitle">
        These paths are ordered from lowest to highest escalation. You are in
        control of each step.
      </p>

      <div className="options__steps">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={`step ${step.isHumanDecision ? "step--human" : ""}`}
          >
            <div className="step__number">{step.number}</div>
            <div className="step__body">
              <div className="step__header">
                <span className="step__title">{step.title}</span>
                {step.isHumanDecision && (
                  <span className="step__badge">Human Decision</span>
                )}
              </div>
              <p className="step__description">{step.description}</p>
              <p className="step__consequence">→ {step.consequence}</p>
              {step.humanNote && (
                <p className="step__human-note">{step.humanNote}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="options__links">
        <div className="options__links-title">Useful Links</div>
        {LINKS.map(([label, url]) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="options__link"
          >
            {label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
