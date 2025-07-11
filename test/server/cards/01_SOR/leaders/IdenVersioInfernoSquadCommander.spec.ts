describe('Iden Version, Inferno Squad Commander', function() {
    integration(function(contextRef) {
        describe('Iden\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: 'iden-versio#inferno-squad-commander',
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['specforce-soldier', 'atst'],
                    }
                });
            });

            it('should heal 1 from if an opponent\'s unit was defeated this phase', function () {
                const { context } = contextRef;

                // case 1: nothing happens, no cards defeated
                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                context.player1.clickPrompt('Use it anyway');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(5);

                context.readyCard(context.idenVersio);
                context.player2.passAction();

                // case 2: friendly unit defeated
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                context.player2.passAction();

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                context.player1.clickPrompt('Use it anyway');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(5);

                context.readyCard(context.idenVersio);
                context.player2.passAction();

                // case 3: enemy unit defeated
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                context.player2.passAction();

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(4);

                // case 4: next action phase, ability should no longer be active
                context.moveToNextActionPhase();
                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                context.player1.clickPrompt('Use it anyway');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should heal 1 from base if an opponent took control of a unit and defeated it this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.player2.findCardByName('no-glory-only-results'));
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should not heal 1 from base if you took control of a unit and defeated it this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.player1.findCardByName('no-glory-only-results'));
                context.player1.clickCard(context.atst);

                context.player2.passAction();

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                context.player1.clickPrompt('Use it anyway');
                expect(context.idenVersio.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(5);
            });
        });

        describe('Iden\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: [{ card: 'x34-landspeeder', upgrades: ['wingman-victor-three#backstabber'] }, 'atst'],
                    }
                });
            });

            it('should heal 1 from base when an enemy unit is defeated', function () {
                const { context } = contextRef;

                // case 1: friendly unit defeated
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                expect(context.p1Base.damage).toBe(5);

                context.player2.passAction();

                // case 2: enemy unit defeated
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.x34Landspeeder);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should heal 1 from base when an opponent takes control of a unit and defeats it', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.player2.findCardByName('no-glory-only-results'));
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.p1Base.damage).toBe(4);
            });

            it('should not heal 1 from base when you take control of a unit and defeat it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.player1.findCardByName('no-glory-only-results'));
                context.player1.clickCard(context.atst);

                expect(context.p1Base.damage).toBe(5);
            });

            // TODO QIRA: once leader shields and defeat timing is fixed, add a test for Iden's ability to heal base when she is defeated
            // TODO: once defeat timing is fixed, add a test checking that Iden's ability functions correctly with parallel defeats (e.g. superlaser)
        });
    });
});
