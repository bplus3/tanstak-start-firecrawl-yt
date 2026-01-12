import { createFileRoute } from "@tanstack/react-router";
import { ComponentExample } from "@/components/component-example";

export const Route = createFileRoute("/_marketing/")({ component: App });

function App() {
return (
  <div>
    <ComponentExample />
  </div>
);
}