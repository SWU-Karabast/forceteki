describe('Wipe Them Out', function() {
    integration(function(contextRef) {
        describe('Wipe Them Out\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wipe-them-out'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['lothal-insurgent', 'porg', 'sullustan-spacer', 'atst', 'chewbacca#pykesbane'],
                        spaceArena: ['cartel-spacer']
                    },
                });
            });

            it('may deal the excess damage from defeating a unit to another unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wipeThemOut);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.porg);
                expect(context.porg).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(1);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.lothalInsurgent, context.atst, context.chewbacca, context.sullustanSpacer]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.readyCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sullustanSpacer);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal excess damage if there was no defeat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wipeThemOut);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger on a trade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wipeThemOut);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.lothalInsurgent);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.lothalInsurgent).toBeInZone('discard');

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.atst, context.chewbacca, context.sullustanSpacer]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Wipe Them Out\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wipe-them-out'],
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['hardpoint-heavy-blaster'] }]
                    },
                    player2: {
                        groundArena: ['jawa-scavenger']
                    },
                });
            });

            it('will not trigger if the unit is defeated by an on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wipeThemOut);
                context.player1.clickCard(context.frontierAtrt);
                context.player1.clickCard(context.jawaScavenger);

                // hardpoint heavy blaster ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.jawaScavenger, context.frontierAtrt]);
                context.player1.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toBeInZone('discard');
                expect(context.frontierAtrt.damage).toBe(0);
                expect(context.frontierAtrt.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Wipe Them Out\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wipe-them-out'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['porg', 'consular-security-force'],
                        spaceArena: ['cartel-spacer']
                    },
                });
            });

            it('will not trigger if Overwhelm has used up the excess damage from the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wipeThemOut);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.porg).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});