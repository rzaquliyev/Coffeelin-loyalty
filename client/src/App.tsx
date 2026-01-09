import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Cashier from "@/pages/Cashier";
import AdminLogin from "@/pages/AdminLogin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin-login"}>
        {() => <AdminLogin role="admin" />}
      </Route>
      <Route path={"/cashier-login"}>
        {() => <AdminLogin role="cashier" />}
      </Route>
      <Route path={"/admin"} component={Admin} />
      <Route path={"/cashier"} component={Cashier} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
