import { useState } from "react";

export default function CopyLink({ label, url }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="text-btn" onClick={copy}>
      {copied ? "Copied!" : label}
    </button>
  );
}
