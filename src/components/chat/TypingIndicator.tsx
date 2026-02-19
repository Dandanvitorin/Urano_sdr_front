export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="message-bubble-agent flex items-center gap-1.5 py-3 px-5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
