import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted">We couldn't find that page.</p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
