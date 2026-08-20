# Mode A: Frontend-Only Mode

**Mode A** is the primary, zero-config operating mode for applications with an embedded multimodal AI copilot.

---

## How It Works

1. User triggers the overlay (via Alt+shake, shortcut, button, or touch).
2. User drags to select a region (or presses Enter for full viewport).
3. The selected region is captured with **SnapDOM** and delivered as a PNG `Blob` to your `onResult` callback.

```
User Snip ───► SnapDOM Canvas ───► PNG Blob ───► truden.onResult(blob) ───► AI Chat Attachment
```

---

## Example: Attaching to an AI Assistant

```tsx
import { useEffect, useState } from "react";
import truden from "truden";

export function AIAssistantWidget() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; image?: string }>>([]);
  const [attachedImage, setAttachedImage] = useState<Blob | null>(null);

  useEffect(() => {
    return truden.init({
      onResult: (blob: Blob) => {
        // Store the captured screenshot blob in state
        setAttachedImage(blob);
        console.log("Attached screen capture to AI assistant prompt:", blob);
      },
    });
  }, []);

  const handleSend = async (userPrompt: string) => {
    const formData = new FormData();
    formData.append("message", userPrompt);
    if (attachedImage) {
      formData.append("attachment", attachedImage, "screenshot.png");
    }

    // Send prompt + image attachment to your multimodal AI endpoint
    await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });

    setAttachedImage(null);
  };

  return (
    <div className="chat-container">
      {attachedImage && (
        <div className="attachment-chip">
          <span>📸 Screen capture attached</span>
          <button onClick={() => setAttachedImage(null)}>✕</button>
        </div>
      )}
      {/* Your Chat UI */}
    </div>
  );
}
```
