describe('The Legacy Run, Doomed Debris', function() {
    integration(function(contextRef) {
        describe('The Legacy Run\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-legacy-run#doomed-debris'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                        groundArena: ['consular-security-force', 'wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should distribute damage among targets when defeated', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.theLegacyRun);
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
                expect(context.getChatLogs(3)).toContain('player1 uses The Legacy Run to distribute 6 damage among enemy units');
                expect(context.getChatLogs(2)).toContain('player1 uses The Legacy Run to deal 2 damage to Consular Security Force, 2 damage to Wampa, 1 damage to TIE/ln Fighter, and 1 damage to Boba Fett');
                expect(context.getChatLogs(1)).toContain('player2\'s TIE/ln Fighter is defeated by player1 due to having no remaining HP');
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.theLegacyRun);
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

        describe('The Legacy Run\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-legacy-run#doomed-debris'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                        groundArena: ['general-krell#heartless-tactician', 'wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should have all on-defeat effects from damage go into the same triggered ability window', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.theLegacyRun);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter, context.generalKrell]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.tielnFighter, 1],
                    [context.wampa, 5]
                ]));

                expect(context.player2).toHaveExactPromptButtons(['Draw a card', 'Draw a card']);

                // so we don't have to resolve the rest of the trigger flow
                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });

        describe('The Legacy Run\'s ability, if there is only one target,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-legacy-run#doomed-debris'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should automatically deal all damage to that target', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.theLegacyRun);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('The Legacy Run\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-legacy-run#doomed-debris'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                    }
                });
            });

            it('should do nothing if there are no enemy units', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.theLegacyRun);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
