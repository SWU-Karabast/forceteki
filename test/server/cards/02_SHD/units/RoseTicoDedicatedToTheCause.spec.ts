describe('Rose Tico, Dedicated to the Cause', function () {
    integration(function (contextRef) {
        describe('Rose Tico\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'wampa',
                            { card: 'battlefield-marine', upgrades: ['jedi-lightsaber'] },
                            { card: 'rose-tico#dedicated-to-the-cause', upgrades: ['shield', 'experience'] },
                        ],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['shield'] }]
                    }
                });
            });

            it('should defeat a shield on a friendly unit and give 2 experience tokens', function () {
                const { context } = contextRef;
                const myShields = context.player1.findCardsByName('shield');
                const roseTicoShield = myShields.find((s) => s.parentCard === context.roseTico);

                context.player1.clickCard(context.roseTico);
                context.player1.clickCard(context.p2Base);

                // able to select all shield on friendly unit
                expect(context.player1).toBeAbleToSelectExactly(myShields);
                expect(context.player1).toHavePassAbilityButton();

                // select rose tico shield
                context.player1.clickCard(roseTicoShield);

                expect(context.player2).toBeActivePlayer();
                expect(context.roseTico).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber']);
                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
