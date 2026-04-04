import { SwuPgn } from '../../../server/game/core/chat/SwuPgn';
import type { IPgnHeader, IPgnPlayerDecklist, IPgnReplayRecord } from '../../../server/game/core/chat/PgnTypes';
import { PgnActionType } from '../../../server/game/core/chat/PgnTypes';

describe('SwuPgn', function () {
    // ── formatSetId ──────────────────────────────────────────────────────────
    describe('formatSetId', function () {
        it('zero-pads a single-digit number to 3 digits', function () {
            expect(SwuPgn.formatSetId('sor', 5)).toBe('SOR#005');
        });

        it('zero-pads a two-digit number to 3 digits', function () {
            expect(SwuPgn.formatSetId('sor', 42)).toBe('SOR#042');
        });

        it('does not pad a three-digit number', function () {
            expect(SwuPgn.formatSetId('sor', 123)).toBe('SOR#123');
        });

        it('uppercases the set identifier', function () {
            expect(SwuPgn.formatSetId('shd', 7)).toBe('SHD#007');
        });
    });

    // ── formatCardName ───────────────────────────────────────────────────────
    describe('formatCardName', function () {
        it('returns just the title when no subtitle provided', function () {
            expect(SwuPgn.formatCardName('Luke Skywalker')).toBe('Luke Skywalker');
        });

        it('returns "Title, Subtitle" when subtitle is provided', function () {
            expect(SwuPgn.formatCardName('Luke Skywalker', 'Faithful Friend')).toBe('Luke Skywalker, Faithful Friend');
        });

        it('returns just the title when subtitle is undefined', function () {
            expect(SwuPgn.formatCardName('Chewbacca', undefined)).toBe('Chewbacca');
        });
    });

    // ── formatHeader ─────────────────────────────────────────────────────────
    describe('formatHeader', function () {
        const baseHeader: IPgnHeader = {
            game: 'Star Wars: Unlimited',
            date: '2026.04.04',
            player1: 'P1',
            player2: 'P2',
            p1Leader: 'Luke Skywalker, Faithful Friend',
            p1Base: 'Echo Base',
            p2Leader: 'Darth Vader, Dark Lord of the Sith',
            p2Base: 'Command Center',
            result: 'P1',
            reason: 'Base Destroyed',
        };

        it('formats required tags as [Tag "Value"] lines', function () {
            const output = SwuPgn.formatHeader(baseHeader);
            expect(output).toContain('[Game "Star Wars: Unlimited"]');
            expect(output).toContain('[Date "2026.04.04"]');
            expect(output).toContain('[Player1 "P1"]');
            expect(output).toContain('[Player2 "P2"]');
            expect(output).toContain('[P1Leader "Luke Skywalker, Faithful Friend"]');
            expect(output).toContain('[P1Base "Echo Base"]');
            expect(output).toContain('[P2Leader "Darth Vader, Dark Lord of the Sith"]');
            expect(output).toContain('[P2Base "Command Center"]');
            expect(output).toContain('[Result "P1"]');
            expect(output).toContain('[Reason "Base Destroyed"]');
        });

        it('omits optional Format tag when not provided', function () {
            const output = SwuPgn.formatHeader(baseHeader);
            expect(output).not.toContain('[Format');
        });

        it('omits optional Rounds tag when not provided', function () {
            const output = SwuPgn.formatHeader(baseHeader);
            expect(output).not.toContain('[Rounds');
        });

        it('includes Format tag when provided', function () {
            const headerWithFormat: IPgnHeader = { ...baseHeader, format: 'Premier' };
            const output = SwuPgn.formatHeader(headerWithFormat);
            expect(output).toContain('[Format "Premier"]');
        });

        it('includes Rounds tag when provided', function () {
            const headerWithRounds: IPgnHeader = { ...baseHeader, rounds: '5' };
            const output = SwuPgn.formatHeader(headerWithRounds);
            expect(output).toContain('[Rounds "5"]');
        });

        it('includes both optional tags when both provided', function () {
            const fullHeader: IPgnHeader = { ...baseHeader, format: 'Premier', rounds: '3' };
            const output = SwuPgn.formatHeader(fullHeader);
            expect(output).toContain('[Format "Premier"]');
            expect(output).toContain('[Rounds "3"]');
        });
    });

    // ── formatCardIndex ──────────────────────────────────────────────────────
    describe('formatCardIndex', function () {
        const p1Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Luke Skywalker, Faithful Friend', setId: 'SOR#005', count: 1 },
            base: { name: 'Echo Base', setId: 'SOR#012', count: 1 },
            deck: [
                { name: 'Wampa', setId: 'SOR#101', count: 2 },
                { name: 'Alliance X-Wing', setId: 'SOR#055', count: 3 },
                { name: 'Battlefield Marine', setId: 'SOR#062', count: 2 },
            ],
        };

        const p2Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Darth Vader, Dark Lord of the Sith', setId: 'SOR#001', count: 1 },
            base: { name: 'Command Center', setId: 'SOR#020', count: 1 },
            deck: [
                { name: 'Death Trooper', setId: 'SOR#201', count: 3 },
            ],
        };

        it('includes the CARD INDEX section header', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
        });

        it('includes P1 Decklist subsection header', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('\u2500\u2500 P1 Decklist \u2500\u2500');
        });

        it('includes P2 Decklist subsection header', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('\u2500\u2500 P2 Decklist \u2500\u2500');
        });

        it('formats leader on its own line', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('Leader: Luke Skywalker, Faithful Friend = SOR#005');
        });

        it('formats base on its own line', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('Base: Echo Base = SOR#012');
        });

        it('formats deck cards with count prefix', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('  2x Wampa = SOR#101');
            expect(output).toContain('  3x Alliance X-Wing = SOR#055');
            expect(output).toContain('  2x Battlefield Marine = SOR#062');
        });

        it('sorts deck cards alphabetically', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            const alliancePos = output.indexOf('Alliance X-Wing');
            const battlefieldPos = output.indexOf('Battlefield Marine');
            const wampaPos = output.indexOf('Wampa');
            expect(alliancePos).toBeLessThan(battlefieldPos);
            expect(battlefieldPos).toBeLessThan(wampaPos);
        });

        it('formats p2 leader and base', function () {
            const output = SwuPgn.formatCardIndex(p1Decklist, p2Decklist);
            expect(output).toContain('Leader: Darth Vader, Dark Lord of the Sith = SOR#001');
            expect(output).toContain('Base: Command Center = SOR#020');
        });
    });

    // ── formatReplayData ─────────────────────────────────────────────────────
    describe('formatReplayData', function () {
        const records: IPgnReplayRecord[] = [
            { seq: '001', type: PgnActionType.RoundStart },
            { seq: '002', type: PgnActionType.Play, player: 'P1', card: 'SOR#055' },
        ];

        it('includes the REPLAY DATA section header', function () {
            const output = SwuPgn.formatReplayData(records);
            expect(output).toContain('=== PARSEABLE ===');
        });

        it('serializes each record as a JSON line', function () {
            const output = SwuPgn.formatReplayData(records);
            expect(output).toContain(JSON.stringify(records[0]));
            expect(output).toContain(JSON.stringify(records[1]));
        });

        it('puts each record on its own line', function () {
            const output = SwuPgn.formatReplayData(records);
            const lines = output.split('\n').filter((l) => l.startsWith('{'));
            expect(lines.length).toBe(2);
        });
    });

    // ── formatFile ───────────────────────────────────────────────────────────
    describe('formatFile', function () {
        const header: IPgnHeader = {
            game: 'Star Wars: Unlimited',
            date: '2026.04.04',
            player1: 'P1',
            player2: 'P2',
            p1Leader: 'Luke Skywalker, Faithful Friend',
            p1Base: 'Echo Base',
            p2Leader: 'Darth Vader, Dark Lord of the Sith',
            p2Base: 'Command Center',
            result: 'P1',
            reason: 'Base Destroyed',
        };

        const p1Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Luke Skywalker, Faithful Friend', setId: 'SOR#005', count: 1 },
            base: { name: 'Echo Base', setId: 'SOR#012', count: 1 },
            deck: [{ name: 'Wampa', setId: 'SOR#101', count: 2 }],
        };

        const p2Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Darth Vader, Dark Lord of the Sith', setId: 'SOR#001', count: 1 },
            base: { name: 'Command Center', setId: 'SOR#020', count: 1 },
            deck: [{ name: 'Death Trooper', setId: 'SOR#201', count: 3 }],
        };

        const replayData: IPgnReplayRecord[] = [
            { seq: '001', type: PgnActionType.RoundStart },
        ];

        const humanNotation = 'Round 1 started\nP1 played Wampa';

        it('starts with HUMAN READABLE marker', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output.startsWith('=== FREEFORM ===')).toBe(true);
        });

        it('contains header section', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('[Game "Star Wars: Unlimited"]');
        });

        it('contains human notation section', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('Round 1 started');
            expect(output).toContain('P1 played Wampa');
        });

        it('contains card index section', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
        });

        it('contains replay data section', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('=== PARSEABLE ===');
        });

        it('has sections in correct order: header, notation, card index, replay data', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            const headerPos = output.indexOf('[Game');
            const notationPos = output.indexOf('Round 1 started');
            const cardIndexPos = output.indexOf('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
            const replayPos = output.indexOf('=== PARSEABLE ===');
            expect(headerPos).toBeLessThan(notationPos);
            expect(notationPos).toBeLessThan(cardIndexPos);
            expect(cardIndexPos).toBeLessThan(replayPos);
        });

        it('separates sections with blank lines', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('\n\n');
        });
    });

    // ── flattenMessage ───────────────────────────────────────────────────────
    describe('flattenMessage', function () {
        it('returns a plain string as-is', function () {
            expect(SwuPgn.flattenMessage('hello world')).toBe('hello world');
        });

        it('converts a number to its string representation', function () {
            expect(SwuPgn.flattenMessage(42)).toBe('42');
        });

        it('joins an array of strings', function () {
            expect(SwuPgn.flattenMessage(['hello', ' ', 'world'])).toBe('hello world');
        });

        it('joins an array of mixed strings and numbers', function () {
            expect(SwuPgn.flattenMessage(['damage: ', 3])).toBe('damage: 3');
        });

        it('converts object with title and subtitle to card name', function () {
            const card = { title: 'Luke Skywalker', subtitle: 'Faithful Friend' };
            expect(SwuPgn.flattenMessage(card)).toBe('Luke Skywalker, Faithful Friend');
        });

        it('converts object with title only to card name', function () {
            const card = { title: 'Wampa' };
            expect(SwuPgn.flattenMessage(card)).toBe('Wampa');
        });

        it('converts object with name property to the name', function () {
            const player = { name: 'player1' };
            expect(SwuPgn.flattenMessage(player)).toBe('player1');
        });

        it('handles alert object by recursing into message string', function () {
            const alert = { alert: { type: 'info', message: 'Round 1 began' } };
            expect(SwuPgn.flattenMessage(alert)).toBe('Round 1 began');
        });

        it('handles alert object with array message', function () {
            const alert = { alert: { type: 'info', message: ['P1', ' attacked'] } };
            expect(SwuPgn.flattenMessage(alert)).toBe('P1 attacked');
        });

        it('handles array containing card objects', function () {
            const msg = ['P1 played ', { title: 'Wampa' }];
            expect(SwuPgn.flattenMessage(msg)).toBe('P1 played Wampa');
        });

        it('returns empty string for null/undefined', function () {
            expect(SwuPgn.flattenMessage(null)).toBe('');
            expect(SwuPgn.flattenMessage(undefined)).toBe('');
        });
    });

    // ── anonymizePlayers ─────────────────────────────────────────────────────
    describe('anonymizePlayers', function () {
        it('replaces player1 name with P1', function () {
            const result = SwuPgn.anonymizePlayers('Alice played a card', 'Alice', 'Bob');
            expect(result).toBe('P1 played a card');
        });

        it('replaces player2 name with P2', function () {
            const result = SwuPgn.anonymizePlayers('Bob passed', 'Alice', 'Bob');
            expect(result).toBe('P2 passed');
        });

        it('replaces possessive form of player1 name', function () {
            const result = SwuPgn.anonymizePlayers("Alice's turn", 'Alice', 'Bob');
            expect(result).toBe("P1's turn");
        });

        it('replaces possessive form of player2 name', function () {
            const result = SwuPgn.anonymizePlayers("Bob's base took damage", 'Alice', 'Bob');
            expect(result).toBe("P2's base took damage");
        });

        it('replaces multiple occurrences', function () {
            const result = SwuPgn.anonymizePlayers('Alice vs Alice', 'Alice', 'Bob');
            expect(result).toBe('P1 vs P1');
        });

        it('replaces both players in same text', function () {
            const result = SwuPgn.anonymizePlayers('Alice attacked Bob', 'Alice', 'Bob');
            expect(result).toBe('P1 attacked P2');
        });

        it('handles possessive before plain replacement to avoid double replacement', function () {
            const result = SwuPgn.anonymizePlayers("Alice's attack hit Bob", 'Alice', 'Bob');
            expect(result).toBe("P1's attack hit P2");
        });
    });

    // ── generateHumanNotation ─────────────────────────────────────────────────
    describe('generateHumanNotation', function () {
        it('flattens and anonymizes regular messages', function () {
            const messages = [
                ['Alice', ' played ', { title: 'Wampa' }],
            ];
            const result = SwuPgn.generateHumanNotation(messages, 'Alice', 'Bob');
            expect(result).toBe('P1 played Wampa');
        });

        it('skips player chat messages (first element has type === playerChat)', function () {
            const messages = [
                [{ type: 'playerChat', name: 'Alice' }, ' hello there'],
                ['Alice', ' played ', { title: 'Wampa' }],
            ];
            const result = SwuPgn.generateHumanNotation(messages, 'Alice', 'Bob');
            expect(result).toBe('P1 played Wampa');
        });

        it('joins multiple messages with newlines', function () {
            const messages = [
                ['Alice', ' played ', { title: 'Wampa' }],
                ['Bob', ' passed'],
            ];
            const result = SwuPgn.generateHumanNotation(messages, 'Alice', 'Bob');
            expect(result).toBe('P1 played Wampa\nP2 passed');
        });

        it('handles alert messages', function () {
            const messages = [
                { alert: { type: 'info', message: 'Round 1 began' } },
            ];
            const result = SwuPgn.generateHumanNotation(messages, 'Alice', 'Bob');
            expect(result).toBe('Round 1 began');
        });

        it('returns empty string for empty messages array', function () {
            const result = SwuPgn.generateHumanNotation([], 'Alice', 'Bob');
            expect(result).toBe('');
        });

        it('skips messages where first element has type playerChat but processes others', function () {
            const messages = [
                [{ type: 'playerChat', name: 'Alice' }, 'hi'],
                [{ type: 'playerChat', name: 'Bob' }, 'hey'],
                ['Alice', ' attacked'],
            ];
            const result = SwuPgn.generateHumanNotation(messages, 'Alice', 'Bob');
            expect(result).toBe('P1 attacked');
        });
    });
});
