import { parse, validate, fold, render } from '../../../swupgn/src/index';

describe('SWU-PGN/1.1 generator round-trip', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'atst'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer'],
                },
            });
        });

        it('generates one .swupgn that parses, validates, folds, and renders', function () {
            const { context } = contextRef;
            const game: any = context.game;

            // Play a short, real game across multiple rounds.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            context.moveToNextActionPhase();

            const text: string = game.getCachedSwuPgn();
            expect(typeof text).toBe('string');

            const report = validate(text);
            expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
            expect(report.valid).toBe(true);

            const doc = parse(text);
            expect(doc.header.game).toBe('SWU-PGN/1.1');
            expect(doc.header.seed).toBeDefined();
            expect(doc.events.length).toBeGreaterThan(0);

            const state = fold(doc.events);
            expect(state.round).toBeGreaterThanOrEqual(1);

            const story = render(doc, { nameOf: (id) => id });
            expect(story.length).toBeGreaterThan(0);

            // No real usernames leaked into the archive (player ids are sha256-salted,
            // labels are anonymized seats). The only '@' in the file is the Engine tag
            // (forceteki@<version>), which is not PII.
            expect(text).not.toContain('player1');
            expect(text).not.toContain('player2');
            expect(text).not.toMatch(/@[^\s"]+\.[a-z]+/i); // no email-shaped tokens
        });
    });
});
