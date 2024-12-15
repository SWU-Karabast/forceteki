describe('Sabine Wren, You Can Count On Me', function () {
    integration(function (contextRef) {
        it('Sabine Wren\'s on attack ability should discard the top card of deck to deal 2 damage to an enemy ground unit if the discarded card does not share an aspect with base and Sabine Wren should not be attacked while she\'s exhausted', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['sabine-wren#you-can-count-on-me', 'wampa'],
                    base: 'echo-base',
                    deck: ['specforce-soldier', 'echo-base-defender']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.p2Base);

            // can discard the top card of deck
            expect(context.player1).toHavePassAbilityPrompt('Discard the top card from your deck');
            context.player1.clickPrompt('Discard the top card from your deck');

            // specforce soldier does not share an aspect with echo base, can select an enemy ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce]);
            context.player1.clickCard(context.battlefieldMarine);

            // battlefield marine should have 2 damage
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();

            context.sabineWren.exhausted = false;
            context.player2.passAction();

            // aspect match the base, nothing happen
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Discard the top card from your deck');
            expect(context.player2).toBeActivePlayer();

            // sabine wren can't be attacked
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa]);
            context.player2.clickCard(context.p1Base);
        });
    });
});
