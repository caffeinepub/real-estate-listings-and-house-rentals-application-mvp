import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import BrowseListingsPage from './pages/BrowseListingsPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import MyListingsPage from './pages/MyListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyInquiriesPage from './pages/MyInquiriesPage';
import InquiriesForMyListingsPage from './pages/InquiriesForMyListingsPage';
import AppHeader from './components/layout/AppHeader';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-muted/30 border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
        </div>
      </footer>
      <ProfileSetupDialog />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BrowseListingsPage,
});

const listingDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$id',
  component: ListingDetailsPage,
});

const myListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-listings',
  component: MyListingsPage,
});

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-listing',
  component: CreateListingPage,
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-listing/$id',
  component: EditListingPage,
});

const myInquiriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-inquiries',
  component: MyInquiriesPage,
});

const inquiriesForMyListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inquiries-for-my-listings',
  component: InquiriesForMyListingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingDetailsRoute,
  myListingsRoute,
  createListingRoute,
  editListingRoute,
  myInquiriesRoute,
  inquiriesForMyListingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
