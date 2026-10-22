/* eslint-disable react-refresh/only-export-components */
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useLocation,
  Link,
} from "@tanstack/react-router";
import { lazy, Suspense, useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./query-client.ts";
import { SiteHeader } from "../components/SiteHeader.tsx";
import { SiteFooter } from "../shared/components/SiteFooter.tsx";
import { AsyncState } from "../shared/components/AsyncState.tsx";
import { PageBoundary } from "../shared/components/PageBoundary.tsx";
import { parseTourSearch } from "../features/tours/domain/search.ts";
import {
  tourQueryOptions,
  tourDetailQueryOptions,
} from "../features/tours/api/tour-queries.ts";
import { bookingResultQueryOptions } from "../features/booking/api/booking-queries.ts";
import type { TourSearchParams } from "../features/tours/types.ts";

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

// DevTools lazy load in dev mode
const isDev = Boolean(
  typeof import.meta !== "undefined" && import.meta.env?.DEV,
);

const RouterDevtools = isDev
  ? lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )
  : () => null;

export interface MyRouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  const go = useCallback(
    (url: string) => {
      navigate({ href: url });
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  return (
    <>
      <SiteHeader path={location.pathname} go={go} />
      <PageBoundary key={location.pathname}>
        <Suspense fallback={<AsyncState />}>
          <Outlet />
        </Suspense>
      </PageBoundary>
      <SiteFooter />
      {isDev && (
        <Suspense fallback={null}>
          <RouterDevtools position="bottom-right" />
        </Suspense>
      )}
    </>
  );
}

function NotFoundComponent() {
  return (
    <main className="container empty">
      <h1>Trang này chưa có</h1>
      <Link to="/tours" className="cta">
        Khám phá tour
      </Link>
    </main>
  );
}

export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<AsyncState />}>
      <HomePage />
    </Suspense>
  ),
});

export const toursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tours",
  validateSearch: (search: Record<string, unknown>): TourSearchParams => {
    return parseTourSearch(search);
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    return context.queryClient.ensureQueryData(tourQueryOptions(deps));
  },
  component: () => (
    <Suspense fallback={<AsyncState />}>
      <TourListPage />
    </Suspense>
  ),
});

export const tourDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tours/$slug",
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      tourDetailQueryOptions(params.slug),
    );
  },
  component: function TourDetailWrapper() {
    const { slug } = tourDetailRoute.useParams();
    return (
      <Suspense fallback={<AsyncState />}>
        <TourDetailPage slug={slug} />
      </Suspense>
    );
  },
});

export const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: () => (
    <Suspense fallback={<AsyncState />}>
      <CheckoutPage />
    </Suspense>
  ),
});

export const bookingLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking/lookup",
  component: () => (
    <Suspense fallback={<AsyncState />}>
      <BookingLookupPage />
    </Suspense>
  ),
});

export const bookingResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking/$bookingId",
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      bookingResultQueryOptions(params.bookingId),
    );
  },
  component: function BookingResultWrapper() {
    const { bookingId } = bookingResultRoute.useParams();
    return (
      <Suspense fallback={<AsyncState />}>
        <BookingResultPage bookingId={bookingId} />
      </Suspense>
    );
  },
});

export const policiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/policies",
  component: () => (
    <Suspense fallback={<AsyncState />}>
      <PoliciesPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  toursRoute,
  tourDetailRoute,
  bookingRoute,
  bookingLookupRoute,
  bookingResultRoute,
  policiesRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
