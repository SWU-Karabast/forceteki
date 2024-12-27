describe('The Emprerors Legion', function () {
    integration(function (contextRef) {
        it('should only return card defeated this phase to player hand from a discard pile', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion', 'wilderness-fighter'],
                    groundArena: ['pyke-sentinel', 'blizzard-assault-atat'],
                    spaceArena: ['cartel-spacer'],
                    discard: ['keep-fighting', 'disarm']
                },
                player2: {
                    hand: ['superlaser-blast', 'takedown'],
                    groundArena: ['seasoned-shoretrooper'],
                    discard: ['tactical-advantage', 'guerilla-attack-pod']
                }
            });
            const { context } = contextRef;

            // Phase 1 defeat one unit
            context.player1.clickCard(context.wildernessFighter);
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wildernessFighter);
            context.moveToNextActionPhase();

            // Phase 2 Defeate all Units
            context.player1.passAction();
            context.player2.clickCard(context.superlaserBlast);
            context.player1.clickCard(context.theEmperorsLegion);

            // Expect cards returned correctly to players hand
            expect(context.pykeSentinel.zoneName).toBe('hand');
            expect(context.blizzardAssaultAtat.zoneName).toBe('hand');
            // Expect earlier defeated units to still be in the discard pile
            expect(context.player1.discard.length).toBe(4);
            expect(context.wildernessFighter.zoneName).toBe('discard');
            // Expect enemy discarded units still in discard pile
            expect(context.player2.discard.length).toBe(5);
        });

        it('should not return card to player hand from a discard pile if no units were defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion'],
                    groundArena: ['pyke-sentinel'],
                    discard: ['green-squadron-awing'],
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['alliance-dispatcher']
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.allianceDispatcher);
            context.player2.passAction();
            context.player1.clickCard(context.theEmperorsLegion);

            expect(context.theEmperorsLegion.zoneName).toBe('discard');
            expect(context.greenSquadronAwing.zoneName).toBe('discard');
            expect(context.allianceDispatcher.zoneName).toBe('discard');
            expect(context.pykeSentinel.zoneName).toBe('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should only affect units that were defeated as their most recent in-play copy', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion', 'the-emperors-legion'],
                    groundArena: ['atst', 'wampa']
                },
                player2: {
                    hand: ['superlaser-blast', 'waylay', 'force-throw', 'vanquish'],
                    resources: 30,
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const [emperorsLegion1, emperorsLegion2] = context.player1.findCardsByName('the-emperors-legion');

            // both units are defeated and returned to hand
            context.player2.clickCard(context.superlaserBlast);
            context.player1.clickCard(emperorsLegion1);
            expect(context.atst).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');

            // play AT-ST, then it gets waylaid and discarded (so this copy was never defeated)
            context.player2.passAction();
            context.player1.clickCard(context.atst);
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.atst);

            context.player1.passAction();
            context.player2.clickCard(context.forceThrow);
            context.player2.clickPrompt('Opponent');
            context.player1.clickCard(context.atst);

            // play Wampa then defeat it, so it now has two separately defeated copies this phase
            context.player1.clickCard(context.wampa);
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.wampa);

            // play the second copy of The Emperor's Legion, only the Wampa should be returned to hand
            // (and not cause an error due to two defeated copies)
            context.player1.clickCard(emperorsLegion2);
            expect(context.atst).toBeInZone('discard');
            expect(context.wampa).toBeInZone('hand');
        });
    });
});
