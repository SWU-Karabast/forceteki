import { ERROR_CODES } from '../registry.js';

export type Level = 'malformed' | 'well-formed' | 'valid';

export interface Issue {
    code: string;
    severity: 'fatal' | 'error' | 'warning';
    line?: number;
    message: string;
}

export interface ValidationReport {
    level: Level;
    issues: Issue[];
}

const SEVERITY: ReadonlyMap<string, Issue['severity']> = new Map(ERROR_CODES.map((c) => [c.code, c.severity]));

/**
 * Collects issues. Past `cap` an issue still counts toward the level but is not listed ([V-13]).
 * One issue is kept per code per line: a line that breaks one rule in two places is one issue.
 */
export class Collector {
    private readonly listed: Issue[] = [];
    private readonly seen = new Set<string>();
    private fatals = 0;
    private errors = 0;
    private capped = false;

    public constructor(private readonly cap: number) {}

    public add(code: string, line: number | undefined, message: string): void {
        const key = `${code}@${line ?? ''}`;
        if (this.seen.has(key)) {
            return;
        }
        this.seen.add(key);
        const severity = SEVERITY.get(code) ?? 'error';
        if (severity === 'fatal') {
            this.fatals++;
        } else if (severity === 'error') {
            this.errors++;
        }
        if (this.listed.length >= this.cap) {
            this.capped = true;
            return;
        }
        this.listed.push(line === undefined ? { code, severity, message } : { code, severity, line, message });
    }

    /** Whether `code` was reported on `line`, listed or not. */
    public has(code: string, line: number | undefined): boolean {
        return this.seen.has(`${code}@${line ?? ''}`);
    }

    public report(): ValidationReport {
        // Stable by line, so the list reads top to bottom; issues without a line go last.
        const issues = this.listed
            .map((issue, i) => ({ issue, i }))
            .sort((a, b) => (a.issue.line ?? Infinity) - (b.issue.line ?? Infinity) || a.i - b.i)
            .map((x) => x.issue);
        if (this.capped) {
            issues.push({ code: 'too-many-issues', severity: 'warning', message: `more than ${this.cap} issues; the rest are not listed` });
        }
        const level: Level = this.fatals > 0 ? 'malformed' : this.errors > 0 ? 'well-formed' : 'valid';
        return { level, issues };
    }
}
