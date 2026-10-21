import { lazy, Suspense, useCallback } from "react";
import { useAppRouter } from "./router.ts";
import { SiteHeader } from "../components/SiteHeader.tsx";
import { SiteFooter } from "../shared/components/SiteFooter.tsx";
import { AsyncState } from "../shared/components/AsyncState.tsx";
import { PageBoundary } from "../shared/components/PageBoundary.tsx";
import { AppLink } from "../shared/components/AppLink.tsx";
import "../style.css";

const HomePage = lazy(() => import("../features/tours/pages/HomePage.tsx"));
const TourListPage = lazy(
  () => import("../features/tours/pages/TourListPage.tsx"),
);
const TourDetailPage = lazy(
  () => import("../features/tours/pages/TourDetailPage.tsx"),
);
const CheckoutPage = lazy(
  () => import("../features/booking/pages/CheckoutPage.tsx"),
);
const BookingLookupPage = lazy(
  () => import("../features/booking/pages/BookingLookupPage.tsx"),
);
const BookingResultPage = lazy(
  () => import("../features/booking/pages/BookingResultPage.tsx"),
);
const PoliciesPage = lazy(() => import("../shared/pages/PoliciesPage.tsx"));

export default function App() {
  const { pathname, navigate } = useAppRouter();
  const go = useCallback(
    (url: string) => {
      navigate(url);
      window.scrollTo(0, 0);
    },
    [navigate],
  );
  const page =
    pathname === "/" ? (
      <HomePage />
    ) : pathname === "/tours" ? (
      <TourListPage />
    ) : pathname.startsWith("/tours/") ? (
      <TourDetailPage slug={pathname.slice("/tours/".length)} />
    ) : pathname === "/booking" ? (
      <CheckoutPage />
    ) : pathname === "/booking/lookup" ? (
      <BookingLookupPage />
    ) : pathname.startsWith("/booking/") ? (
      <BookingResultPage bookingId={pathname.slice("/booking/".length)} />
    ) : pathname === "/policies" ? (
      <PoliciesPage />
    ) : (
      <main className="container empty">
        <h1>Trang này chưa có</h1>
        <AppLink href="/tours" className="cta">
          Khám phá tour
        </AppLink>
      </main>
    );
  return (
    <>
      <SiteHeader path={pathname} go={go} />
      <PageBoundary key={pathname}>
        <Suspense fallback={<AsyncState />}>{page}</Suspense>
      </PageBoundary>
      <SiteFooter />
    </>
  );
}
