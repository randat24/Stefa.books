// Type declarations for Next.js modules
declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
  }
  
  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static json(data: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    json(data: any): NextResponse;
    redirect(url: string | URL): NextResponse;
  }
  
  // Export as both class and function for compatibility
  export const NextResponse: {
    new(body?: BodyInit | null, init?: ResponseInit): NextResponse;
    json(data: any, init?: ResponseInit): NextResponse;
    redirect(url: string | URL, status?: number): NextResponse;
  };
  
  export function NextRequest(input: RequestInfo | URL, init?: RequestInit): NextRequest;
}

declare module 'next/script' {
  import { ComponentProps } from 'react';
  
  interface ScriptProps extends ComponentProps<'script'> {
    strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
    onLoad?: () => void;
    onError?: (e: Error) => void;
  }
  
  export default function Script(props: ScriptProps): JSX.Element;
}
