// Объявления типов для решения проблем с TypeScript

// Next.js модули
declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string[];
    openGraph?: {
      title?: string;
      description?: string;
      images?: Array<{
        url: string;
        width: number;
        height: number;
        alt: string;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  }
}

declare module 'next/image' {
  const Image: React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>;
  export default Image;
}

declare module 'next/link' {
  interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    className?: string;
    [key: string]: any;
  }
  
  const Link: React.ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string) => Promise<void>;
  };
  
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/server' {
  export class NextURL extends URL {
    pathname: string;
    search: string;
    searchParams: URLSearchParams;
    clone(): NextURL;
  }

  export interface NextRequest extends Request {
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(cookie: { name: string; value: string; [key: string]: any }): void;
      [key: string]: any;
    };
    nextUrl: NextURL;
  }

  export interface ResponseInit extends globalThis.ResponseInit {
    headers?: Headers | Record<string, string>;
    cookies?: Record<string, string>;
    status?: number;
  }

  export class NextResponse extends Response {
    headers: Headers;
    cookies: any;
    status: number;
  }

  export namespace NextResponse {
    export function next(options?: ResponseInit): NextResponse;
    export function json(body: any, options?: ResponseInit): NextResponse;
    export function redirect(url: string | URL, options?: ResponseInit): NextResponse;
    export function rewrite(url: string | URL, options?: ResponseInit): NextResponse;
  }
}

declare module 'next/headers' {
  export function cookies(): {
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (cookie: { name: string; value: string; [key: string]: any }) => void;
  };
  
  export function headers(): Headers;
}

// Библиотеки UI
declare module 'lucide-react' {
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    [key: string]: any;
  }
  
  export const ArrowRight: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ArrowLeft: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Check: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ChevronDown: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ChevronUp: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ChevronRight: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ChevronLeft: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const X: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Menu: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Search: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const User: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ShoppingCart: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Heart: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Mail: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Phone: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const MapPin: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Calendar: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Clock: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Info: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const AlertCircle: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const CheckCircle: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const XCircle: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Loader2: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const BookOpen: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const BookOpenCheck: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const FileText: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Users: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Tag: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Database: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const CreditCard: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const RefreshCw: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const BarChart3: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Lock: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Download: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Eye: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Edit: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Trash2: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ImageIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const ExternalLink: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Hash: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Settings: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Filter: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Building: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Building2: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Package: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const DollarSign: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Shield: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const TrendingUp: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Bell: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Activity: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Zap: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Plus: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Copy: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Upload: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const Star: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const MessageSquare: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const WifiOff: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export const LogOut: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// UI Components
declare module '@/components/ui/badge' {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: string;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export function Badge(props: BadgeProps): JSX.Element;
}

declare module '@/components/ui/tabs' {
  export interface TabsProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
    [key: string]: any;
  }
  
  export function Tabs(props: TabsProps): JSX.Element;
  export function TabsList(props: any): JSX.Element;
  export function TabsTrigger(props: any): JSX.Element;
  export function TabsContent(props: any): JSX.Element;
}

// Библиотеки форм
declare module 'react-hook-form' {
  export function useForm<T = any>(config?: any): {
    register: (name: string, options?: any) => any;
    handleSubmit: (onSubmit: (data: T) => void) => (event: any) => void;
    formState: {
      errors: Record<string, any>;
      isValid: boolean;
    };
    watch: (field?: string) => any;
    setValue: (name: string, value: any, options?: any) => void;
    reset: (values?: any, options?: any) => void;
    trigger: (name?: string) => Promise<boolean>;
    control: any;
    getValues: (field?: string) => any;
  };
  export function Controller(props: any): JSX.Element;
  export function FormProvider(props: any): JSX.Element;
  export function useFormContext(): any;
  export function useWatch(config?: any): any;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: any): any;
}

// Sonner Toast Library
declare module 'sonner' {
  export function toast(message: string, options?: any): void;
  export function toast(options: any): void;
  export namespace toast {
    function success(message: string, options?: any): void;
    function error(message: string, options?: any): void;
    function info(message: string, options?: any): void;
    function warning(message: string, options?: any): void;
    function promise(promise: Promise<any>, options?: any): void;
    function loading(message: string, options?: any): void;
    function dismiss(): void;
  }
  
  export function Toaster(props?: any): JSX.Element;
}

// Supabase
declare module '@supabase/supabase-js' {
  export interface SupabaseClientOptions {
    auth?: {
      persistSession?: boolean;
      storage?: any;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
      [key: string]: any;
    };
    global?: {
      headers?: Record<string, string>;
      fetch?: any;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export function createClient(
    url: string, 
    key: string, 
    options?: SupabaseClientOptions
  ): any;
}

declare module '@supabase/ssr' {
  export function createServerClient(url: string, key: string, options?: any): any;
  export type CookieOptions = {
    domain?: string;
    maxAge?: number;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
  };
}

// CSV
declare module 'csv-stringify/sync' {
  export function stringify(data: any[], options?: any): string;
}