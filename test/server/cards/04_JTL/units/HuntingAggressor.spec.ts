describe('Hunting Aggressor', function() {
    integration(function(contextRef) {
        it('Hunting Aggressor\'s ability should not increase the damage of non-indirect damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    spaceArena: ['hunting-aggressor'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);
        });

        it('Hunting Aggressor\'s ability should increase the amount of indirect damage dealt to opponents by 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['planetary-bombardment'],
                    spaceArena: ['hunting-aggressor'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Planetary Bombardment deals 9 damage (8 plus one from Hunting Aggressor)
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.player2).toHavePrompt('Distribute 9 indirect damage among targets');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 4],
                [context.p2Base, 5],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.p2Base.damage).toBe(5);
        });

        it('Two Hunting Aggressor\'s abilities\' should increase the amount of indirect damage dealt to opponents by 2', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['planetary-bombardment'],
                    spaceArena: ['hunting-aggressor', 'hunting-aggressor'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Planetary Bombardment deals 10 damage (8 plus two from Hunting Aggressors)
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.player2).toHavePrompt('Distribute 10 indirect damage among targets');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 4],
                [context.p2Base, 6],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.p2Base.damage).toBe(6);
        });

        it('Hunting Aggressor\'s ability should not increase indirect damage amounts played by the opponent of its controller', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['hunting-aggressor'],
                },
                player2: {
                    hand: ['planetary-bombardment'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            // Planetary Bombardment deals 8 damage
            context.player2.clickCard(context.planetaryBombardment);
            context.player2.clickPrompt('Deal indirect damage to opponent');
            expect(context.player1).toHavePrompt('Distribute 8 indirect damage among targets');

            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.huntingAggressor, 3],
                [context.p1Base, 5],
            ]));

            expect(context.player1).toBeActivePlayer();
            expect(context.huntingAggressor.damage).toBe(3);
            expect(context.p1Base.damage).toBe(5);
        });

        it('Hunting Aggressor\'s ability should increase the amount of indirect damage dealt to opponents by 1 when stolen by the opponent', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['planetary-bombardment', 'change-of-heart'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['hunting-aggressor'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.huntingAggressor);

            context.player2.passAction();

            // Planetary Bombardment deals 9 damage (8 plus one from Hunting Aggressor)
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.player2).toHavePrompt('Distribute 9 indirect damage among targets');

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 4],
                [context.p2Base, 5],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.p2Base.damage).toBe(5);
        });

        it('Hunting Aggressor\'s ability should not increase the amount of indirect damage dealt to yourself', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['planetary-bombardment'],
                    spaceArena: ['hunting-aggressor'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Planetary Bombardment deals 8 damage
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Deal indirect damage to yourself');
            expect(context.player1).toHavePrompt('Distribute 8 indirect damage among targets');

            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.huntingAggressor, 4],
                [context.p1Base, 4],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.huntingAggressor.damage).toBe(4);
            expect(context.p1Base.damage).toBe(4);
        });

        it('Hunting Aggressor\'s ability should increase each instance of indirect damage when multiple are triggered', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['hunting-aggressor', { card: 'tie-bomber', upgrades: ['dengar#crude-and-slovenly'] }],
                    leader: 'boba-fett#any-methods-necessary',
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tieBomber);
            context.player1.clickCard(context.p2Base);

            // Trigger Tie Bomber, deals 4 indirect damage (3 plus one from Hunting Aggressor)
            context.player1.clickPrompt('Deal 3 indirect damage to the defending player');
            expect(context.p2Base.damage).toBe(4);

            // Trigger Boba's ability, deals 2 indirect damage (1 plus one from Hunting Aggressor)
            context.player1.clickPrompt('Trigger');
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.p2Base.damage).toBe(6);

            // Trigger Dengar's ability, deals 3 indirect damage (2 plus one from Hunting Aggressor) and 1 combat damage
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.p2Base.damage).toBe(10);
        });
    });
});
