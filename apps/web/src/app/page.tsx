import TaskList from "../components/TaskList";
import CalendarDay from "../components/CalendarDay";

export default function Home() {
  return (
    <div className="min-h-screen p-6 sm:p-8">
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
        <TaskList />
        <CalendarDay />
      </main>
    </div>
  );
}
