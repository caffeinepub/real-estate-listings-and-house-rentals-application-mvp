import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, PlusCircle, List, MessageSquare, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className={mobile ? 'w-full justify-start' : ''}
      >
        <Home className="h-4 w-4 mr-2" />
        Accueil
      </Button>
      {isAuthenticated && (
        <>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/my-listings' })}
            className={mobile ? 'w-full justify-start' : ''}
          >
            <List className="h-4 w-4 mr-2" />
            Mes Annonces
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/create-listing' })}
            className={mobile ? 'w-full justify-start' : ''}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer une Annonce
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={mobile ? 'w-full justify-start' : ''}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Demandes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={mobile ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => navigate({ to: '/my-inquiries' })}>
                Mes Demandes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/inquiries-for-my-listings' })}>
                Demandes Reçues
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: '/' })}>
            <img
              src="/assets/generated/realty-logo.dim_512x512.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold hidden sm:inline">ImmoBien</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Bonjour, {userProfile.name}
              </span>
            )}
            <LoginButton />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
