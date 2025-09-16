// Объявления типов для решения проблем с TypeScript

// Определяем namespace JSX для решения проблемы с JSX.IntrinsicElements
declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    // Additional elements needed for components
    br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    code: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    svg: React.SVGProps<SVGSVGElement>;
    path: React.SVGProps<SVGPathElement>;
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    strong: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    iframe: React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
    details: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
    summary: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    pre: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  }
}

// Модули React
declare module 'react' {
  export * from 'react';
  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: ReadonlyArray<any>) => void;
  export const useRef: <T>(initialValue: T) => { current: T };
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>) => T;
  export const useMemo: <T>(factory: () => T, deps: ReadonlyArray<any>) => T;
  export const Suspense: any;
  export type ChangeEvent<T> = {
    target: T;
    preventDefault(): void;
    stopPropagation(): void;
  };
  export type DependencyList = ReadonlyArray<any>;
  export type FC<P = Record<string, unknown>> = FunctionComponent<P>;
  export interface FunctionComponent<P = Record<string, unknown>> {
    (props: P, context?: any): ReactElement<any, any> | null;
    displayName?: string;
  }
  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
    type: T;
    props: P;
    key: Key | null;
  };
  export type Key = string | number;
  export type JSXElementConstructor<P> = (props: P) => ReactElement<any, any> | null;
}

declare module 'react/jsx-runtime' {
  export * from 'react/jsx-runtime';
}

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
  import { FC, ImgHTMLAttributes } from 'react';
  
  interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    loading?: 'eager' | 'lazy';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    fill?: boolean;
    className?: string;
    [key: string]: any;
  }
  
  const Image: FC<ImageProps>;
  export default Image;
}

declare module 'next/link' {
  import { FC, AnchorHTMLAttributes } from 'react';
  
  interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
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
  
  const Link: FC<LinkProps>;
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
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    [key: string]: any;
  }
  
  export const ArrowRight: FC<IconProps>;
  export const ArrowLeft: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const ChevronUp: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const ChevronLeft: FC<IconProps>;
  export const X: FC<IconProps>;
  export const Menu: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const User: FC<IconProps>;
  export const ShoppingCart: FC<IconProps>;
  export const Heart: FC<IconProps>;
  export const Mail: FC<IconProps>;
  export const Phone: FC<IconProps>;
  export const MapPin: FC<IconProps>;
  export const Calendar: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const Info: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const CheckCircle: FC<IconProps>;
  export const XCircle: FC<IconProps>;
  export const Loader2: FC<IconProps>;
  export const BookOpen: FC<IconProps>;
  export const BookOpenCheck: FC<IconProps>;
  export const FileText: FC<IconProps>;
  export const Users: FC<IconProps>;
  export const Tag: FC<IconProps>;
  export const Database: FC<IconProps>;
  export const CreditCard: FC<IconProps>;
  export const RefreshCw: FC<IconProps>;
  export const BarChart3: FC<IconProps>;
  export const Lock: FC<IconProps>;
  export const Download: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const Edit: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  export const ImageIcon: FC<IconProps>;
  export const ExternalLink: FC<IconProps>;
  export const Hash: FC<IconProps>;
  export const Settings: FC<IconProps>;
  export const Filter: FC<IconProps>;
  export const Building: FC<IconProps>;
  export const Building2: FC<IconProps>;
  export const Package: FC<IconProps>;
  export const DollarSign: FC<IconProps>;
  export const Shield: FC<IconProps>;
  export const TrendingUp: FC<IconProps>;
  export const Bell: FC<IconProps>;
  export const Activity: FC<IconProps>;
  export const Zap: FC<IconProps>;
  export const Plus: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const Upload: FC<IconProps>;
  export const Star: FC<IconProps>;
  export const MessageSquare: FC<IconProps>;
  export const WifiOff: FC<IconProps>;
  
  // Добавьте здесь другие иконки по мере необходимости
}

// UI Components
declare module '@/components/ui/Badge' {
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

// Global namespace for React
declare global {
  export namespace React {
    export interface ChangeEvent<T> {
      target: T;
      preventDefault(): void;
      stopPropagation(): void;
    }
  }
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

// Добавьте здесь другие модули по мере необходимости
