import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";

// Executes code via the public Wandbox API (https://wandbox.org) — free, no
// API key. (Piston's public API went whitelist-only in Feb 2026.)
const WANDBOX_URL = "https://wandbox.org/api/compile.json";

const COMPILERS: Record<string, string> = {
  cpp: "gcc-13.2.0",
  java: "openjdk-jdk-22+36",
  python: "cpython-3.14.0",
  javascript: "nodejs-20.17.0",
};

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const compiler = COMPILERS[String(body.language)];
  const code = String(body.code ?? "");
  const stdin = String(body.stdin ?? "");

  if (!compiler) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  if (!code.trim()) return NextResponse.json({ error: "No code to run" }, { status: 400 });
  if (code.length > 64_000) return NextResponse.json({ error: "Code too long" }, { status: 400 });

  try {
    const res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler, code, stdin }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Wandbox ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const compileError = String(data.compiler_error ?? "");
    // Warnings also land in compiler_error — only flag a failure when the
    // program didn't actually run.
    const compileFailed = compileError !== "" && String(data.status) !== "0";
    return NextResponse.json({
      compile: compileError
        ? { stdout: String(data.compiler_output ?? ""), stderr: compileError, code: compileFailed ? 1 : 0 }
        : null,
      run: {
        stdout: String(data.program_output ?? ""),
        stderr: String(data.program_error ?? ""),
        code: data.status != null && data.status !== "" ? Number(data.status) : null,
        signal: String(data.signal ?? "") || null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Code execution service unavailable — try again in a few seconds." },
      { status: 502 },
    );
  }
}
