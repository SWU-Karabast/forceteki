describe('The Emprerors Legion', function () {
    integration(function (contextRef) {
        it('should return card to player hand from a discard pile', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion'],
                    groundArena: ['pyke-sentinel', 'seasoned-shoretrooper', 'blizzard-assault-atat'],
                    spaceArena: ['cartel-spacer'],
                    discard: ['keep-fighting', 'green-squadron-awing', 'disarm']
                },
                player2: {
                    hand: ['superlaser-blast'],
                    discard: ['tactical-advantage', 'guerilla-attack-pod']
                }
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.superlaserBlast);
            expect(context.pykeSentinel.location).toBe('discard');
            expect(context.seasonedShoretrooper.location).toBe('discard');
            expect(context.blizzardAssaultAtat.location).toBe('discard');
            expect(context.cartelSpacer.location).toBe('discard');
            context.player1.clickCard(context.theEmperorsLegion);
            expect(context.pykeSentinel.location).toBe('hand');
            expect(context.seasonedShoretrooper.location).toBe('hand');
            expect(context.blizzardAssaultAtat.location).toBe('hand');
            expect(context.cartelSpacer.location).toBe('hand');
            expect(context.player2).toBeActivePlayer();
            // Expect earlier defeated units to still be in the discard pile
            expect(context.player1.discard.length).toBe(4);
            expect(context.greenSquadronAwing.location).toBe('discard');
        });

        it('should not return card to player hand from a discard pile if no units were defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-emperors-legion'],
                    groundArena: ['pyke-sentinel'],
                    discard: ['green-squadron-awing'],
                    base: 'echo-base'
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.theEmperorsLegion);
            expect(context.theEmperorsLegion.location).toBe('discard');
            expect(context.pykeSentinel.location).toBe('ground arena');
            expect(context.greenSquadronAwing.location).toBe('discard');
            expect(context.player1.countExhaustedResources()).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
