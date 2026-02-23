import { useState } from "react";
import Navigator from "./components/Navigator";
import WageCalculator from "./components/WageCalculator";
import YourOptions from "./components/YourOptions";
import "./styles/main.scss";

const TABS = [
  { id: "chat", label: "Navigator" },
  { id: "calculator", label: "Wage Calculator" },
  { id: "escalation", label: "Your Options" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="app">
      <header className="header">
        <div className="header__left">
          <div className="header__dot" />
          <span className="header__title">Owed</span>
          <span className="header__region">Ontario, CA</span>
        </div>
        <div className="header__right">PRIVATE · SECURE · NO DATA SHARED</div>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tabs__btn ${activeTab === tab.id ? "tabs__btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === "chat" && <Navigator />}
        {activeTab === "calculator" && <WageCalculator />}
        {activeTab === "escalation" && <YourOptions />}
      </main>
    </div>
  );
}
