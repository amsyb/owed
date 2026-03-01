import React from "react";

const STEPS = [
  {
    number: "01",
    title: "Understand your rights",
    description:
      "Use the Navigator to get a clear picture of your entitlements under Ontario's Employment Standards Act (ESA). This step is fully private — no one is notified.",
    consequence: "Zero consequences. Fully private.",
    isHumanDecision: false,
  },
  {
    number: "02",
    title: "Document your case",
    description:
      "Record your hours, pay stubs, schedules, and any relevant messages or communications. This builds evidence for your claim.",
    consequence: "Prepares you for any future escalation.",
    isHumanDecision: false,
  },
  {
    number: "03",
    title: "Send a demand letter",
    description:
      "A formal written request to your employer stating what you’re owed and giving a clear deadline for payment or correction.",
    consequence: "Employer is notified. Still no government involvement.",
    isHumanDecision: false,
  },
  {
    number: "04",
    title: "File a formal ESA complaint",
    description:
      "Submit a complaint to the Ministry of Labour (MOL). A government officer reviews your case and may contact your employer.",
    consequence:
      "Your employer is officially contacted. This step creates an official record.",
    isHumanDecision: true,
    humanNote:
      "This decision must stay yours. Filing is formal and irreversible. This tool will never file on your behalf.",
  },
];

const LINKS = [
  [
    "Ministry of Labour — File an ESA Claim",
    "https://www.ontario.ca/document/your-guide-employment-standards-act-0/filing-claim",
  ],
  ["Ontario Human Rights Commission", "https://www.ohrc.on.ca/en"],
  ["Community Legal Education Ontario (CLEO)", "https://www.cleo.on.ca/en"],
];

export default function YourOptions() {
  return (
    <div className="options">
      <h2 className="section__title">Your Options as a Worker</h2>
      <p className="section__subtitle">
        These steps guide you from understanding your rights to formal action.
        You remain in control of each decision.
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
        <div className="options__links-title">Helpful Resources</div>
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
