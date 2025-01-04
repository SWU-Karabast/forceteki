describe('Cobb Vanth, The Marshal', function() {
    integration(function(contextRef) {
        describe('Cobb Vanth, The Marshal\'s ability', function() {
            it('should search the deck for a card and make it playable for free for the phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['cobb-vanth#the-marshal'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'patrolling-vwing', 'devotion',
                             'consular-security-force', 'echo-base-defender', 'swoop-racer', 'resupply', 'superlaser-technician'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.cobbVanth);
                expect(context.player1).toHaveEnabledPromptButtons([context.sabineWren.title, context.battlefieldMarine.title, context.patrollingVwing.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.waylay.title, context.protector.title, context.devotion.title, context.consularSecurityForce.title, 
                    context.echoBaseDefender.title, context.swoopRacer.title, context.resupply.title]); // and not superlaser as its the 11th card
                context.player1.clickPrompt(context.patrollingVwing.title);
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.patrollingVwing).toBeInZone('discard');

                context.player1.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(0); // free cost on aspect penalty too!
            });
        });
    });
});
