import type { IPlayerReportEntity } from '../services/DynamoDBInterfaces';
import { PlayerReportStatus } from '../services/DynamoDBInterfaces';

export enum PlayerReportListSort {
    NewestFirst = 'newest',
    OldestFirst = 'oldest',
}

export interface IPlayerReportListQuery {

    /** Omitted for open and closed reports together */
    status?: PlayerReportStatus;

    /** Case-insensitive part of the reporter's, the reported player's or the closing moderator's username */
    search?: string;

    /** Only reports for this offense (PlayerReportType) */
    offense?: string;
    limit: number;

    /** Omitted: oldest first when only open reports are listed (the queue is worked through in order), newest first otherwise */
    sort?: PlayerReportListSort;

    /** `nextCursor` of the previous page, which must have used the same sort */
    cursor?: string;
}

export interface IPlayerReportPage {

    /** In the requested sort order */
    reports: IPlayerReportEntity[];

    /** Pass as `cursor` to load the next page; null on the last page */
    nextCursor: string | null;

    /** Number of reports matching the filters, over all pages */
    total: number;
}

/** Thrown for a cursor that was not handed out by {@link PlayerReportListCache.queryAsync}, or for another sort order */
export class InvalidReportCursorError extends Error {
    public constructor() {
        super('Invalid cursor');
        this.name = 'InvalidReportCursorError';
    }
}

type Mutation = (reports: Map<string, IPlayerReportEntity>) => void;
type CursorPosition = Pick<IPlayerReportEntity, 'createdAt' | 'id'>;

/**
 * Every stored player report record (without its logs), kept in memory so the mod tools can sort, search and page
 * the report list without reading DynamoDB on each request. The GSI the reports are filed under has no sort key,
 * so DynamoDB cannot hand out sorted pages itself.
 *
 * The cache loads lazily and reloads once it is older than `maxAgeMs`, which picks up anything written by another
 * process (e.g. a second task during a deploy). Writes from this process are applied straight away; one that lands
 * while a load is in flight is replayed on top of the loaded data, since it is newer than anything the load saw.
 */
export class PlayerReportListCache {
    private reports: Map<string, IPlayerReportEntity> | null = null;
    private loadedAt = 0;
    private loading: Promise<Map<string, IPlayerReportEntity>> | null = null;
    private writesDuringLoad: Mutation[] = [];

    public constructor(
        private readonly loadAsync: () => Promise<IPlayerReportEntity[]>,
        private readonly currentDate: () => Date,
        private readonly maxAgeMs: number,
    ) {}

    public async queryAsync(query: IPlayerReportListQuery): Promise<IPlayerReportPage> {
        const sort = PlayerReportListCache.effectiveSort(query);
        const after = query.cursor != null ? PlayerReportListCache.decodeCursor(query.cursor, sort) : null;
        const search = query.search?.trim().toLowerCase();
        const compare = sort === PlayerReportListSort.OldestFirst
            ? (a: CursorPosition, b: CursorPosition) => PlayerReportListCache.newestFirst(b, a)
            : PlayerReportListCache.newestFirst;

        const matching = [...(await this.getReportsAsync()).values()]
            .filter((report) => !query.status || report.status === query.status)
            .filter((report) => !query.offense || report.offense === query.offense)
            .filter((report) => !search || PlayerReportListCache.matchesSearch(report, search))
            .sort(compare);

        const start = after ? matching.findIndex((report) => compare(report, after) > 0) : 0;
        const remaining = start < 0 ? [] : matching.slice(start);
        const reports = remaining.slice(0, query.limit);
        const last = reports[reports.length - 1];

        return {
            reports,
            nextCursor: remaining.length > query.limit ? PlayerReportListCache.encodeCursor(last, sort) : null,
            total: matching.length,
        };
    }

    private static effectiveSort(query: IPlayerReportListQuery): PlayerReportListSort {
        if (query.sort) {
            return query.sort;
        }
        return query.status === PlayerReportStatus.Open ? PlayerReportListSort.OldestFirst : PlayerReportListSort.NewestFirst;
    }

    public async countOpenAsync(): Promise<number> {
        let count = 0;
        for (const report of (await this.getReportsAsync()).values()) {
            count += report.status === PlayerReportStatus.Open ? 1 : 0;
        }
        return count;
    }

    /** Stores the report as it is now in DynamoDB */
    public upsert(report: IPlayerReportEntity): void {
        this.write((reports) => reports.set(report.id, { ...report }));
    }

    /**
     * Stores the report only if it is not cached yet. For reads that may be stale (not strongly consistent): they
     * must not overwrite a newer copy, e.g. one a close or reopen in this process just wrote.
     */
    public addIfMissing(report: IPlayerReportEntity): void {
        this.write((reports) => {
            if (!reports.has(report.id)) {
                reports.set(report.id, { ...report });
            }
        });
    }

    /** Changes fields of a cached report; does nothing if the report is not cached */
    public patch(reportId: string, fields: Partial<IPlayerReportEntity>): void {
        this.write((reports) => {
            const report = reports.get(reportId);
            if (report) {
                reports.set(reportId, { ...report, ...fields });
            }
        });
    }

    public remove(reportId: string): void {
        this.write((reports) => reports.delete(reportId));
    }

    private write(mutation: Mutation): void {
        if (this.reports) {
            mutation(this.reports);
        }
        if (this.loading) {
            this.writesDuringLoad.push(mutation);
        }
    }

    private getReportsAsync(): Promise<Map<string, IPlayerReportEntity>> {
        const isFresh = this.reports && this.currentDate().getTime() - this.loadedAt < this.maxAgeMs;
        if (isFresh) {
            return Promise.resolve(this.reports);
        }

        this.loading ??= this.reloadAsync().finally(() => {
            this.loading = null;
        });
        return this.loading;
    }

    private async reloadAsync(): Promise<Map<string, IPlayerReportEntity>> {
        this.writesDuringLoad = [];
        const startedAt = this.currentDate().getTime();
        const loaded = await this.loadAsync();

        const reports = new Map(loaded.map((report) => [report.id, report]));
        for (const mutation of this.writesDuringLoad) {
            mutation(reports);
        }
        this.writesDuringLoad = [];

        this.reports = reports;
        this.loadedAt = startedAt;
        return reports;
    }

    private static matchesSearch(report: IPlayerReportEntity, search: string): boolean {
        return [report.reporterUsername, report.reportedPlayerUsername, report.closedByUsername]
            .some((username) => username?.toLowerCase().includes(search));
    }

    /** Newest report first; the id breaks ties so the order (and with it every cursor) is stable */
    private static newestFirst(a: CursorPosition, b: CursorPosition): number {
        return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
    }

    private static encodeCursor(report: IPlayerReportEntity, sort: PlayerReportListSort): string {
        return Buffer.from(JSON.stringify([sort, report.createdAt, report.id])).toString('base64url');
    }

    /** A cursor only continues the order it was handed out for; changing the sort starts again without one */
    private static decodeCursor(cursor: string, sort: PlayerReportListSort): CursorPosition {
        try {
            const decoded: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
            if (Array.isArray(decoded) && decoded.length === 3 && decoded.every((part) => typeof part === 'string') && decoded[0] === sort) {
                return { createdAt: decoded[1], id: decoded[2] };
            }
        } catch {
            // handled below
        }
        throw new InvalidReportCursorError();
    }
}
