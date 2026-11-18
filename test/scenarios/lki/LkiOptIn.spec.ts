/**
 * Tests for the last known information opt-in (`Card.usesLkiRegistry`).
 *
 * Every card's setup receives a card state getter. A card that has opted in receives the
 * registry-backed one; every other card receives a live-only getter whose reads are exactly what
 * reading the card directly would give. That second behavior is what makes it safe to rewrite a
 * card's reads to go through the getter before the card is migrated, so it is what these tests pin.
 *
 * See long-term-project-docs/lki-redesign-decisions-and-insights.md (D-35).
 */

describe('Last known information opt-in', function () {
    integration(function (contextRef) {
        describe('Which getter a card receives', function () {
            it('gives a card that has opted in the registry-backed getter, and every other card a live-only one', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['experience'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates;

                expect(context.helgait.usesLkiRegistry).toBeTrue();
                expect(context.wampa.usesLkiRegistry).toBeFalse();

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);

                // Helgait is in the discard pile, and its record is still live behind this prompt.
                expect(context.player1).toHavePrompt('Distribute 7 Advantage tokens among targets');
                expect(context.helgait).toBeInZone('discard');

                // Opted in: reads the record, so it still sees the unit as it was in play, modifiers included.
                const recorded = cardStates.forCard(context.helgait).getLastKnownProperties(context.helgait)
                    .asUnit();
                expect(recorded.arena as string).toBe('groundArena');
                expect(recorded.asInPlayStats().power).toBe(7);

                // Not opted in: reads the card as it is right now, exactly as reading it directly would.
                const live = cardStates.forCard(context.wampa).getLastKnownProperties(context.helgait)
                    .asUnit();
                expect(live.arena).toBeNull();
                expect(live.hasInPlayStats()).toBeFalse();
                expect(live.printedPower).toBe(6);
                expect(() => live.asInPlayStats()).toThrowError(/to be in play/);

                // Where the card is now is presence, which both read from the live card (D-37).
                expect(recorded.zoneName as string).toBe('discard');
                expect(recorded.isInPlay()).toBeFalse();
                expect(live.zoneName as string).toBe('discard');
                expect(live.isInPlay()).toBeFalse();

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 7]
                ]));
            });

            it('gives a copied ability the getter of the card whose code it is, not of the card receiving it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['helgait#dooku-was-a-visionary', 'wampa'],
                        resources: 10
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                // Clone becomes a copy of Helgait and runs Helgait's setup code, which has opted in. Clone
                // itself has not, and a live-only getter would fail on the defeated unit below.
                expect(context.clone.usesLkiRegistry).toBeFalse();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.helgait);
                expect(context.clone).toBeCloneOf(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeInZone('discard');

                // The copied When Defeated reads the power the Clone had in play, which only a record holds.
                expect(context.player1).toHavePrompt('Distribute 6 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 6]
                ]));
            });
        });

        describe('A card that has not opted in', function () {
            it('reads a card whose record has been flushed as it is now, as an opted-in card does', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['experience'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 7]
                ]));

                // The action that caused the defeat has ended, so the record is gone. Helgait is still the
                // same identity, sitting in the discard pile, and an opted-in card reads it there as it is
                // now (D-39): card code picks cards up from the discard pile all the time.
                const optedIn = cardStates.forCard(context.helgait).getLastKnownProperties(context.helgait)
                    .asUnit();
                expect(optedIn.zoneName as string).toBe('discard');
                expect(optedIn.hasInPlayStats()).toBeFalse();

                // A card that has not opted in never reaches the records at all, and reads the same.
                const live = cardStates.forCard(context.wampa).getLastKnownProperties(context.helgait)
                    .asUnit();
                expect(live.zoneName as string).toBe('discard');
                expect(live.hasInPlayStats()).toBeFalse();
            });

            it('reads the card as it is now when given a reference to an earlier identity of it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        groundArena: ['hk47#exclamation-die-meatbag', 'battlefield-marine'],
                        resources: 10
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates;

                const whileInHand = cardStates.getIdentity(context.wampa);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena');

                // Entering play made Wampa a new copy, so the earlier reference no longer names it. The
                // registry-backed getter has no record to fall back on and refuses...
                expect(cardStates.getIdentity(context.wampa)).not.toBe(whileInHand);
                expect(() => cardStates.forCard(context.hk47).getLastKnownProperties(whileInHand))
                    .toThrowError(/names an identity that no longer exists/);

                // ...whereas reading the card directly never cared which identity it was asked about.
                // The view describes the card as it is now, so it names the identity it has now.
                const live = cardStates.forCard(context.battlefieldMarine).getLastKnownProperties(whileInHand);
                expect(live.zoneName as string).toBe('groundArena');
                expect(live.ref).toBe(cardStates.getIdentity(context.wampa));
            });

            it('still gets the same canonical identity references as a card that has opted in', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hk47#exclamation-die-meatbag', 'wampa']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates;

                expect(cardStates.forCard(context.wampa).getIdentity(context.hk47))
                    .toBe(cardStates.forCard(context.hk47).getIdentity(context.hk47));
            });
        });
    });
});
