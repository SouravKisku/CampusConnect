import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui";
import { IdCard } from "../components/IdCard";
import { useAuth } from "../context/AuthContext";
import { homePath } from "../lib/utils";

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Link to={homePath(user.role)}><Button>Open dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/signup"><Button>Sign up</Button></Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pt-20">
        <div>
          <h1 className="text-4xl font-bold leading-[1.08] sm:text-6xl">
            Find the people who get you through semester.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            CampusConnect is your university's private network. Match with study partners, share notes, ask questions and hear from faculty, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? homePath(user.role) : "/signup"}><Button className="h-11 px-6 text-base">{user ? "Open dashboard" : "Create your account"}</Button></Link>
            {!user && <Link to="/login"><Button variant="secondary" className="h-11 px-6 text-base">Log in</Button></Link>}
          </div>
          <p className="mt-4 text-sm text-muted">Sign up with your university email. Connect. Collaborate. Grow together.</p>
        </div>

        <div className="flex justify-center lg:justify-end lg:pr-8">
          <IdCard
            swing
            name="Aarav Sharma"
            line1="Computer Science"
            line2="B.Tech CSE · 5th semester"
            tags={["Python", "Machine Learning", "SQL"]}
          />
        </div>
      </main>
    </div>
  );
}
