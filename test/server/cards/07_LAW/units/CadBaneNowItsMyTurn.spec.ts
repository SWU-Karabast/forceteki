describe('Cad Bane, Now it\'s My Turn', function() {
    integration(function(contextRef) {
        describe('Cad Bane\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cad-bane#now-its-my-turn'],
                        credits: 4,
                    },
                    player2: {
                        credits: 4
                    }
                });
            });


            it('should prompt to choose a number, allowing the controller to pick, defeat all of their credits, then give Cad Experience', function () {
                const { context } = contextRef;


                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);


                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 5 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');


                expect(context.p2Base.damage).toBe(10);
                expect(context.cadBane).toHaveExactUpgradeNames(['experience', 'experience', 'experience', 'experience']);
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });


            it('should prompt to choose a number, allowing the controller to pick, defeat some of their credits, then give Cad Experience', function () {
                const { context } = contextRef;


                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);


                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 5 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');


                expect(context.p2Base.damage).toBe(8);
                expect(context.cadBane).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });


            it('should prompt to choose a number, allowing the controller to pick, defeat no credits, give Cad no Experience', function () {
                const { context } = contextRef;


                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);


                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 5 }, (x, i) => `${i}`));
                context.player1.chooseListOption('0');


                expect(context.p2Base.damage).toBe(6);
                expect(context.cadBane).toHaveExactUpgradeNames([]);
                expect(context.player1.credits).toBe(4);
                expect(context.player2.credits).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });


        describe('Cad\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cad-bane#now-its-my-turn'],
                    },
                    player2: {
                        credits: 4
                    }
                });
            });


            it('should do nothing if the player has no Credits', function () {
                const { context } = contextRef;


                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.cadBane).toHaveExactUpgradeNames([]);
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
