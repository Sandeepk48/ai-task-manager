import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

function wantsHtmlDocument(accept: string | undefined): boolean {
  const a = (accept ?? '').toLowerCase();
  return a.includes('text/html') && !a.includes('application/json');
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Browsers send Accept: text/html — show a small landing page so embedded
   * browsers are not "blank". API clients and curl (no / weak Accept) get JSON.
   */
  @Get()
  root(@Req() req: Request, @Res() res: Response): void {
    if (wantsHtmlDocument(req.headers.accept)) {
      res.type('html').send(this.browserWelcomeHtml());
      return;
    }
    res.json(this.appService.getHealth());
  }

  /** JSON health for uptime checks (always application/json). */
  @Get('health')
  health(@Res() res: Response): void {
    res.json(this.appService.getHealth());
  }

  private browserWelcomeHtml(): string {
    const payload = JSON.stringify(this.appService.getHealth(), null, 2);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Task Manager API</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at top, #ecfdf5, #f4f4f5); color: #18181b; }
    @media (prefers-color-scheme: dark) {
      body { background: radial-gradient(ellipse at top, #022c22, #09090b); color: #fafafa; }
    }
    main { max-width: 36rem; padding: 2rem; }
    h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem; }
    p { margin: 0 0 1rem; line-height: 1.5; font-size: 0.9rem; opacity: 0.85; }
    a { color: #059669; font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { font-size: 0.75rem; padding: 1rem; border-radius: 0.75rem; overflow: auto;
      background: rgba(0,0,0,.06); border: 1px solid rgba(0,0,0,.08); }
    @media (prefers-color-scheme: dark) {
      pre { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); }
    }
  </style>
</head>
<body>
  <main>
    <h1>AI Task Manager API</h1>
    <p>This URL is the <strong>REST API</strong>, not the web app. Open the Next.js frontend to use the UI.</p>
    <p><a href="http://localhost:3000">Open app → http://localhost:3000</a></p>
    <p style="font-size:0.8rem;margin-top:1.5rem">Health payload (same as <code>GET /health</code> JSON):</p>
    <pre>${escapeHtml(payload)}</pre>
  </main>
</body>
</html>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
