"use client";

interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
}

interface BuyerInfoFormProps {
  value: BuyerInfo;
  onChange: (value: BuyerInfo) => void;
}

export default function BuyerInfoForm({ value, onChange }: BuyerInfoFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full name *"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="email"
        placeholder="Email address *"
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="tel"
        placeholder="Phone number *"
        value={value.phone}
        onChange={(e) => onChange({ ...value, phone: e.target.value })}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
