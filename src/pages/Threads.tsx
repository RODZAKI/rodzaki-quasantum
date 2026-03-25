import { useThreads } from "../hooks/useThreads";

export default function Threads() {
  const { data, isLoading, error } = useThreads();

  if (isLoading) return <div>Loading threads…</div>;
  if (error) return <div>Error loading thread catalog.</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Thread Catalog</h1>

      <ul>
        {data?.threads?.map((thread: any) => (
          <li key={thread.id}>
            <a
              href={"https://rodzaki.github.io${thread.pdf}"}
              target="_blank"
              rel="noreferrer"
            >
              {thread.title}
            </a>{" "}
            <small>({thread.era})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}