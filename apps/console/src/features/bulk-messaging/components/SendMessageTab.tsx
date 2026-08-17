
import { Checkbox } from "@gridcore/ui/components/ui/checkbox";
import { useState, useMemo } from "react";

import classNames from "classnames";
import { Mail, MessagesSquare, Send, Store, Users } from "lucide-react";
import type { StylesConfig } from "react-select";
import Select from "react-select";

import Button from "@gridcore/ui/components/Button";

import { useBulkMessaging } from "../hooks/useBulkMessaging";
import type { DeliveryChannel, SelectOption } from "../types";


const selectStyles: StylesConfig<SelectOption, true> = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    borderColor: "rgba(209, 213, 219, 1)",
    boxShadow: "none",
    fontSize: "0.875rem",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#2626FD" : state.isFocused ? "rgba(237, 242, 247, 1)" : "transparent",
    color: state.isSelected ? "white" : "rgba(55, 65, 81, 1)",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
  }),
  dropdownIndicator: (provided) => ({ ...provided, color: "rgba(107, 114, 128, 1)" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.05)",
    fontSize: "0.875rem",
  }),
};

const SMS_SEGMENT_LENGTH = 160;

export function SendMessageTab() {
  const { merchantOptions, customerOptions, sendMessage, sendLoading } = useBulkMessaging();
  const [merchantIds, setMerchantIds] = useState<SelectOption[]>([]);
  const [customerIds, setCustomerIds] = useState<SelectOption[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<DeliveryChannel>("SMS");
  const [selectAllMerchants, setSelectAllMerchants] = useState(false);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);

  const charCount = content.length;
  const smsCount = useMemo(() => Math.ceil(charCount / SMS_SEGMENT_LENGTH), [charCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mIds = merchantIds.map((o) => o.value);
    const cIds = customerIds.map((o) => o.value);
    if (mIds.length === 0 && cIds.length === 0 && !selectAllMerchants && !selectAllCustomers) {
      return;
    }
    await sendMessage({
      merchantIds: mIds,
      customerIds: cIds,
      title,
      content,
      channel,
      sendToAllMerchants: selectAllMerchants,
      sendToAllCustomers: selectAllCustomers,
    });
    setMerchantIds([]);
    setCustomerIds([]);
    setTitle("");
    setContent("");
    setSelectAllMerchants(false);
    setSelectAllCustomers(false);
    // window.location.href = "/bulk-messaging?tab=logs";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[75fr_20fr] gap-6 w-full max-w-full">
      <form onSubmit={handleSubmit} className="min-w-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">Recipients</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <Store className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  Merchants
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="select-all-merchants" className="text-sm">Select All</label>
                  <Checkbox
                    id="select-all-merchants"
                    checked={selectAllMerchants}
                    onCheckedChange={(checked) => {
                      // Either way the explicit selection is cleared; only the
                      // "all" flag differs.
                      setMerchantIds([]);
                      setSelectAllMerchants(checked === true);
                    }}
                  />
                </div>
              </div>
              <Select<SelectOption, true>
                isMulti
                options={merchantOptions}
                value={merchantIds}
                onChange={(v) => setMerchantIds([...(v ?? [])])}
                placeholder="Select merchants"
                styles={selectStyles}
                className="text-sm"
                isDisabled={selectAllMerchants}
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <Users className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  Customers
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="select-all-customers" className="text-sm">Select All</label>
                  <Checkbox
                    id="select-all-customers"
                    checked={selectAllCustomers}
                    onCheckedChange={(checked) => {
                      // Either way the explicit selection is cleared; only the
                      // "all" flag differs.
                      setCustomerIds([]);
                      setSelectAllCustomers(checked === true);
                    }}
                  />
                </div>
              </div>
              <Select<SelectOption, true>
                isMulti
                options={customerOptions}
                value={customerIds}
                onChange={(v) => setCustomerIds([...(v ?? [])])}
                placeholder="Select customers"
                styles={selectStyles}
                className="text-sm"
                isDisabled={selectAllCustomers}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="message-title" className="block text-sm font-medium text-gray-900 mb-2">
            Message Title
          </label>
          <input
            id="message-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Payment Reminder, System Update"
            className="block w-full rounded-md border-0 py-2 px-3 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300 text-sm"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="message-content" className="block text-sm font-medium text-gray-900 mb-2">
            Message Content
          </label>
          <textarea
            id="message-content"
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message here..."
            className="block w-full rounded-md border-0 py-2 px-3 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300 text-sm resize-y min-h-[140px]"
          />
          <div className="flex justify-between mt-1.5 text-xs text-accent">
            <span>{charCount} characters</span>
            {channel === "SMS" ? (
              <span>SMS: {smsCount} message(s)</span>
            ) : (
              <span>Email</span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          text={sendLoading ? "Sending..." : "Send Message"}
          isLoading={sendLoading}
          isDisabled={sendLoading || (merchantIds.length === 0 && customerIds.length === 0 && !selectAllMerchants && !selectAllCustomers)}
          prefixIcon={<Send className="h-4 w-4" />}
          className="w-full"
        />
      </form>

      <div className="min-w-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 h-fit">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Delivery Channel</h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setChannel("SMS")}
            className={classNames(
              "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
              channel === "SMS"
                ? "border-primary ring-1 ring-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div
              className={classNames(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                channel === "SMS" ? "border-primary bg-primary/10" : "border-gray-300"
              )}
            >
              {channel === "SMS" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
            <MessagesSquare className="h-6 w-6 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">SMS</div>
              <div className="text-xs text-accent">Text message</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setChannel("EMAIL")}
            className={classNames(
              "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
              channel === "EMAIL"
                ? "border-primary ring-1 ring-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div
              className={classNames(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                channel === "EMAIL" ? "border-primary bg-primary/10" : "border-gray-300"
              )}
            >
              {channel === "EMAIL" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
            <Mail className="h-6 w-6 text-violet-600 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Email</div>
              <div className="text-xs text-accent">Email message</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
