export default function UserList({ users, me }) {
  const list = Object.values(users);
  return (
    <div>
      <h2>Here now ({list.length})</h2>
      <ul>
        {list.map((u) => (
          <li key={u.id} style={{ color: u.color }}>
            {u.name} {u.id === me && "(you)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
