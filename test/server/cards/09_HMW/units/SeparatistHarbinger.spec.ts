describe('Separatist Harbinger', function() {
    integration(function(contextRef) {
        describe('Separatist Harbinger\'s On Attack Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['separatist-harbinger'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should deal damage to either a base or a unit (depending on opponent choice)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistHarbinger);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.p2Base]);

                context.player2.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to Administrator\'s Tower');

                context.player1.clickPrompt('Trigger');
                expect(context.p2Base.damage).toEqual(2);
            });
        });

        describe('Separatist Harbinger\'s When Played Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['separatist-harbinger'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should deal damage to either a base or a unit (depending on opponent choice)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistHarbinger);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.p2Base]);

                context.player2.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to Administrator\'s Tower');

                context.player1.clickPrompt('Trigger');
                expect(context.p2Base.damage).toEqual(2);
            });
        });
    });
});