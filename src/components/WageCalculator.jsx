import { useState } from "react";
import React from "react";

const ESA = {
  minimumWage: 17.2,
  overtimeThreshold: 44,
  overtimeMultiplier: 1.5,
  vacationPayRate: 0.04,
};

function calculateViolations({ hourlyRate, weeklyHours, weeksWorked }) {
  const violations = [];
  let totalOwed = 0;
  const totalHours = weeklyHours * weeksWorked;

  if (hourlyRate < ESA.minimumWage) {
    const amount = (ESA.minimumWage - hourlyRate) * totalHours;
    violations.push({
      type: "Minimum Wage Violation",
      detail: `Paid $${hourlyRate}/hr , minimum is $${ESA.minimumWage}/hr`,
      law: "ESA s.23",
      amount,
    });
    totalOwed += amount;
  }

  if (weeklyHours > ESA.overtimeThreshold) {
    const overtimeHrs = weeklyHours - ESA.overtimeThreshold;
    const amount =
      overtimeHrs * hourlyRate * (ESA.overtimeMultiplier - 1) * weeksWorked;
    violations.push({
      type: "Overtime Not Paid",
      detail: `${overtimeHrs} hrs/week over the 44hr threshold`,
      law: "ESA s.22",
      amount,
    });
    totalOwed += amount;
  }

  const vacationAmount = totalHours * hourlyRate * ESA.vacationPayRate;
  violations.push({
    type: "Vacation Pay",
    detail: "4% vacation pay owed on all wages earned",
    law: "ESA s.35",
    amount: vacationAmount,
  });
  totalOwed += vacationAmount;

  return { violations, totalOwed };
}

export default function WageCalculator() {
  const [form, setForm] = useState({
    hourlyRate: "",
    weeklyHours: "",
    weeksWorked: "",
  });
  const [result, setResult] = useState(null);
  const [letter, setLetter] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function calculate() {
    const { hourlyRate, weeklyHours, weeksWorked } = form;
    if (!hourlyRate || !weeklyHours || !weeksWorked) return;
    setResult(
      calculateViolations({
        hourlyRate: parseFloat(hourlyRate),
        weeklyHours: parseFloat(weeklyHours),
        weeksWorked: parseFloat(weeksWorked),
      }),
    );
    setLetter("");
  }

  async function generateLetter() {
    if (!result) return;
    setGeneratingLetter(true);

    const summary = result.violations
      .map((v) => `${v.type}: $${v.amount.toFixed(2)} (${v.law})`)
      .join(", ");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Draft a formal demand letter to an employer for the following Ontario ESA violations: ${summary}. Total owed: $${result.totalOwed.toFixed(2)}.

Use [EMPLOYEE NAME], [EMPLOYER NAME], [EMPLOYMENT DATES] as placeholders.
Make it professional, cite specific ESA sections, give a 14-day response deadline, and note that failure to respond may result in a Ministry of Labour complaint. Keep it under 300 words.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setLetter(
        data.choices?.[0]?.message?.content || "Error generating letter.",
      );
    } catch {
      setLetter("Connection error. Please try again.");
    }

    setGeneratingLetter(false);
  }

  const fields = [
    {
      key: "hourlyRate",
      label: "Your hourly rate ($)",
      placeholder: "e.g. 16.00",
    },
    {
      key: "weeklyHours",
      label: "Hours worked per week",
      placeholder: "e.g. 50",
    },
    { key: "weeksWorked", label: "Number of weeks", placeholder: "e.g. 12" },
  ];

  return (
    <div className="calculator">
      <h2 className="section__title">Wage Calculator</h2>
      <p className="section__subtitle">
        Calculates what you're owed under Ontario's Employment Standards Act.
        Numbers are exact, not estimates.
      </p>

      <div className="calculator__fields">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="field">
            <label className="field__label">{label}</label>
            <input
              className="field__input"
              type="number"
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className="btn btn--primary" onClick={calculate}>
        Calculate
      </button>

      {result && (
        <div className="calculator__results">
          {result.violations.map((v, i) => (
            <div key={i} className="violation">
              <div className="violation__info">
                <span className="violation__type">{v.type}</span>
                <span className="violation__detail">{v.detail}</span>
                <span className="violation__law">{v.law}</span>
              </div>
              <span className="violation__amount">${v.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="calculator__total">
            <span className="calculator__total-label">Total Owed</span>
            <span className="calculator__total-amount">
              ${result.totalOwed.toFixed(2)}
            </span>
          </div>

          <button
            className="btn btn--outline"
            onClick={generateLetter}
            disabled={generatingLetter}
          >
            {generatingLetter
              ? "Drafting letter..."
              : "Generate Demand Letter →"}
          </button>

          {letter && (
            <div className="letter">
              <div className="letter__label">
                Draft Demand Letter, Review before sending
              </div>
              <div className="letter__body">{letter}</div>
              <div className="letter__disclaimer">
                Replace all bracketed placeholders before sending. Sending this
                letter is your decision, this tool does not send it on your
                behalf.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
