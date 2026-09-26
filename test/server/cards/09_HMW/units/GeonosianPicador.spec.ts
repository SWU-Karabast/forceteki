describe('Geonosian Picador', function () {
    integration(function (contextRef) {
        describe('Geonosian Picador\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['geonosian-picador'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['lurking-tie-phantom'],
                        leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should create a Beast and give a Weakness token to a friendly unit, choosing the beast', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.geonosianPicador);
                const p1Beast = context.player1.findCardByName('beast');
                expect(p1Beast).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, p1Beast, context.lurkingTiePhantom, context.geonosianPicador, context.cadBane]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(p1Beast);

                expect(context.player2).toBeActivePlayer();
                expect(p1Beast).toHaveExactUpgradeNames(['weakness']);
            });

            it('should create a Beast and give a Weakness token to a friendly unit, choosing the picador', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.geonosianPicador);
                const p1Beast = context.player1.findCardByName('beast');
                expect(p1Beast).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, p1Beast, context.lurkingTiePhantom, context.geonosianPicador, context.cadBane]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.geonosianPicador);

                expect(context.player2).toBeActivePlayer();
                expect(context.geonosianPicador).toHaveExactUpgradeNames(['weakness']);
            });

            it('should create a Beast and give a Weakness token to a friendly unit, choosing a regular unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.geonosianPicador);
                const p1Beast = context.player1.findCardByName('beast');
                expect(p1Beast).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, p1Beast, context.lurkingTiePhantom, context.geonosianPicador, context.cadBane]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            });

            it('should create a Beast and give a Weakness token to a friendly unit, choosing a leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.geonosianPicador);
                const p1Beast = context.player1.findCardByName('beast');
                expect(p1Beast).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, p1Beast, context.lurkingTiePhantom, context.geonosianPicador, context.cadBane]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.cadBane);

                expect(context.player2).toBeActivePlayer();
                expect(context.cadBane).toHaveExactUpgradeNames(['weakness']);
            });
        });
    });
});