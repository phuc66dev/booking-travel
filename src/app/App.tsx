import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes.tsx";
import "../style.css";

export default function App() {
  return <RouterProvider router={router} />;
}
