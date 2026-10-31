// From Comprehensive Rules v4.0, 8.15.2:
//   If an ability causes a card to "lose all abilities," the card ceases to have any
//   abilities, including abilities given to it by other cards, for the duration of the
//   "lose" effect. The card cannot gain abilities for the duration of the effect.
//
// Fortify (CR 8.11) is an attach-restriction keyword: it replaces an upgrade's default
// "attach to a unit" restriction with "attach to your base." An upgrade that has lost its
// abilities has no Fortify, so it falls back to attaching to a unit. Galen Erso, You'll
// Never Win is the only card that removes abilities from cards out of play, which is what
// makes it possible to play a Fortify upgrade onto a unit in the first place.
describe('Fortify upgrades that have lost all abilities', function() {
    integration(function(contextRef) {
        it('should lose Fortify and attach to a unit instead of a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win'],
                    groundArena: ['atst']
                },
                player2: {
                    hand: ['landing-pad', 'military-academy'],
                    spaceArena: ['awing'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Landing Pad');
            expect(context.landingPad.hasSomeKeyword('fortify')).toBeFalse();

            // Without Fortify the default "attach to a unit" restriction applies, so the base is
            // not a legal target but any unit is
            context.player2.clickCard(context.landingPad);
            expect(context.player2).toHavePrompt('Attach Landing Pad to a unit');
            expect(context.player2).toBeAbleToSelectExactly([context.awing, context.atst, context.galenErso]);
            context.player2.clickCard(context.awing);
            expect(context.landingPad.parentCard).toBe(context.awing);

            // an upgrade that kept Fortify still attaches to its controller's base
            context.player1.passAction();
            context.player2.clickCard(context.militaryAcademy);
            expect(context.player2).toHavePrompt('Attach Military Academy to a base');
            expect(context.player2).toBeAbleToSelectExactly([context.p2Base]);
            context.player2.clickCard(context.p2Base);
            expect(context.militaryAcademy.parentCard).toBe(context.p2Base);
        });

        it('should not grant an "attached base gains" stat bonus to the unit it is attached to when its abilities return', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win']
                },
                player2: {
                    hand: ['landing-pad', 'takedown'],
                    spaceArena: ['awing', 'green-squadron-awing'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Landing Pad');

            context.player2.clickCard(context.landingPad);
            context.player2.clickCard(context.awing);
            expect(context.awing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getPower()).toBe(1);

            // Galen leaves play, so Landing Pad gets its abilities (and Fortify) back while
            // attached to a unit. Its ability is granted to an attached base, and a unit is not one
            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.galenErso);

            expect(context.landingPad.isBlank()).toBeFalse();
            expect(context.landingPad.hasSomeKeyword('fortify')).toBeTrue();
            expect(context.landingPad.parentCard).toBe(context.awing);
            expect(context.awing.getPower()).toBe(1);
            expect(context.greenSquadronAwing.getPower()).toBe(1);
        });

        it('should not grant an "attached base gains" keyword to the unit it is attached to when its abilities return', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win']
                },
                player2: {
                    hand: ['military-academy', 'takedown'],
                    groundArena: ['battlefield-marine'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Military Academy');

            context.player2.clickCard(context.militaryAcademy);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.galenErso);

            expect(context.militaryAcademy.isBlank()).toBeFalse();
            expect(context.militaryAcademy.parentCard).toBe(context.battlefieldMarine);
            expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
        });

        it('should still be able to use its own abilities while attached to a unit when its abilities return', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }]
                },
                player2: {
                    hand: ['carbonite-chamber', 'takedown'],
                    groundArena: ['wampa'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Carbonite Chamber');

            context.player2.clickCard(context.carboniteChamber);
            context.player2.clickCard(context.wampa);
            expect(context.carboniteChamber.parentCard).toBe(context.wampa);

            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.galenErso);
            expect(context.carboniteChamber.isBlank()).toBeFalse();

            // the action ability belongs to the upgrade itself, so it works no matter what it is attached to
            context.player1.passAction();
            context.player2.clickCard(context.carboniteChamber);
            expect(context.player2).toHavePrompt('Choose a non-Vehicle unit. It doesn\'t ready during the next regroup phase');
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.carboniteChamber).toBeInZone('discard', context.player2);

            context.moveToNextActionPhase();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });

        it('should not trigger its When Played ability while it has no abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win']
                },
                player2: {
                    hand: ['bacta-tank'],
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    resources: 20
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Bacta Tank');

            context.player2.clickCard(context.bactaTank);
            expect(context.player2).toHavePrompt('Attach Bacta Tank to a unit');
            context.player2.clickCard(context.wampa);

            expect(context.bactaTank.parentCard).toBe(context.wampa);
            expect(context.wampa.damage).toBe(3);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
