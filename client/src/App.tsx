import { Route, Switch } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import Store from "@/pages/store";
import Gallery from "@/pages/gallery";
import Threads from "@/pages/threads";
import Courses from "@/pages/courses";
import AskAlta from "@/pages/ask-alta";
import CalculatorPage from "@/pages/calculator";
import CrystalGuide from "@/pages/crystal-guide";
import Gematria from "@/pages/gematria";
import DailyNumerologyPage from "@/pages/daily";
import CompatibilityPage from "@/pages/compatibility";
import WordLookupPage from "@/pages/word-lookup";
import PrivacyPolicy from "@/pages/legal/privacy";
import TermsOfService from "@/pages/legal/terms";
import RefundPolicy from "@/pages/legal/refund";
import Disclaimer from "@/pages/legal/disclaimer";
import OrderSuccess from "@/pages/order-success";
import Admin from "@/pages/admin";
import { AdminProvider } from "@/context/admin";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <Switch>
        <Route path="/admin">
          <Admin />
        </Route>
        <Route>
          <PublicLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={BlogPostPage} />
              <Route path="/store" component={Store} />
              <Route path="/gallery" component={Gallery} />
              <Route path="/threads" component={Threads} />
              <Route path="/courses" component={Courses} />
              <Route path="/calculator" component={CalculatorPage} />
              <Route path="/crystals" component={CrystalGuide} />
              <Route path="/gematria" component={Gematria} />
              <Route path="/daily" component={DailyNumerologyPage} />
              <Route path="/compatibility" component={CompatibilityPage} />
              <Route path="/word-lookup" component={WordLookupPage} />
              <Route path="/ask-alta" component={AskAlta} />
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/terms" component={TermsOfService} />
              <Route path="/refund-policy" component={RefundPolicy} />
              <Route path="/disclaimer" component={Disclaimer} />
              <Route path="/order-success" component={OrderSuccess} />
              <Route>
                <div className="section-padding text-center">
                  <h1 className="font-display text-4xl font-bold mb-4">404</h1>
                  <p className="text-gray-500">The universe hasn't created this page yet.</p>
                </div>
              </Route>
            </Switch>
          </PublicLayout>
        </Route>
      </Switch>
    </AdminProvider>
  );
}
