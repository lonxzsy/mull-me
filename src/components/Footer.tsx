import { Heart, Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-surface/50 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mull Me. Free temporary email service.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-success" />
            Secure & private
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-danger" />
            Open source friendly
          </span>
          <a
            href="https://github.com/lonxzsy/mull-me"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.838 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.103.823 2.222v3.293c0 .32.192.694.8.576C20.566 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
