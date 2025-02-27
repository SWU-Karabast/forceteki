describe('Emperor Palpatine, Master of the Dark Side', function() {
    integration(function(contextRef) {
        describe('Palpatine\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['emperor-palpatine#master-of-the-dark-side'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should distribute damage among targets when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.wampa, context.tielnFighter, context.bobaFett]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.consularSecurityForce, 2],
                    [context.wampa, 2],
                    [context.tielnFighter, 1],
                    [context.bobaFett, 1]
                ]));

                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.bobaFett.damage).toBe(1);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.wampa, context.tielnFighter, context.bobaFett]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 6]
                ]));

                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.bobaFett.damage).toBe(0);
            });
        });

        describe('Palpatine\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['emperor-palpatine#master-of-the-dark-side'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['general-krell#heartless-tactician', 'wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should have all on-defeat effects from damage go into the same triggered ability window', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter, context.generalKrell]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 1],
                    [context.wampa, 5]
                ]));

                expect(context.player2).toHaveExactPromptButtons(['Draw a card', 'Draw a card']);

                // so we don't have to resolve the rest of the trigger flow
                context.allowTestToEndWithOpenPrompt = true;
            });
        });

        describe('Palpatine\'s ability, if there is only one target,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['emperor-palpatine#master-of-the-dark-side'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should automatically deal all damage to that target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Palpatine\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['emperor-palpatine#master-of-the-dark-side'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                    }
                });
            });

            it('should do nothing if there are no enemy units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
