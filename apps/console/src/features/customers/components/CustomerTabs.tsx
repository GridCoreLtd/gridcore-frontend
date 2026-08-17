
import { useState } from "react";

import classNames from "classnames";

import TopupsTable from "./TopupsTable";
import TransactionsTable from "./TransactionsTable";

const CustomerTabs = ({ userId }: { userId: string }) => {
  const [activeTab, setActiveTab] = useState("transactions");

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const tabs = [
    { name: "Transaction History", href: "#transactions", id: "transactions" },
    { name: "Top up History", href: "#topups", id: "topups" },
  ];

  return (
    <section>
      <div>
        <div>
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-hidden focus:ring-indigo-500 sm:text-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <a
                    key={tab.id}
                    href={tab.href}
                    id={tab.id}
                    className={classNames(
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                    )}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {activeTab === "transactions" && <TransactionsTable userId={userId} />}
        {activeTab === "topups" && <TopupsTable userId={userId} />}
      </div>
    </section>
  );
};

export default CustomerTabs;
