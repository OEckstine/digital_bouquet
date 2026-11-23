export default function CardNote({ note, onChange, typingUser }) {
  return (
    <div>
      <h2>Card message</h2>
      <textarea
        rows={4}
        cols={50}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a note to go with the flowers"
      />
      <p style={{ minHeight: "1.2em", color: typingUser?.color }}>
        {typingUser ? `${typingUser.name} is writing...` : ""}
      </p>
    </div>
  );
}
