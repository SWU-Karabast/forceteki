describe('Choke On Aspirations', function () {
    integration(function (contextRef) {
        describe('Choke On Aspirations\'s ability', function () {
            it('should deal up to 5 damage to a friendly unit and heal damage from your base equal to the damage dealt', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choke-on-aspirations'],
                        spaceArena: ['jade-squadron-patrol'],
                        groundArena: ['darth-vader#twilight-of-the-apprentice'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                expect(context.p1Base.damage).toBe(5);
                context.player1.clickCard(context.chokeOnAspirations);

                // Distribute 5 damage to Darth Vader
                expect(context.player1).toBeAbleToSelectExactly([context.darthVader]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.darthVader, 5],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.darthVader).toBeInZone('groundArena');
                // Darth Vader should take 5 damage and then player1's base should heal 5 damage
                expect(context.p1Base.damage).toBe(0); // Base starts with 5 damage and heals 5, it should be at 0
                expect(context.darthVader.damage).toBe(5);
            });

            it('should deal up to 5 damage to a friendly unit and not heal damage from your base if the unit is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choke-on-aspirations'],
                        groundArena: ['battlefield-marine'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                expect(context.p1Base.damage).toBe(5);
                context.player1.clickCard(context.chokeOnAspirations);

                // Distribute 5 damage to Battlefield Marine
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 5],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard'); // Battlefield Marine should be defeated and sent to the discard pile
                expect(context.p1Base.damage).toBe(5); // Base starts with 5 damage and should not heal because the unit was defeated
            });

            it('should deal no damage to a friendly unit and not heal damage from your base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choke-on-aspirations'],
                        groundArena: ['battlefield-marine'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                expect(context.p1Base.damage).toBe(5);
                context.player1.clickCard(context.chokeOnAspirations);

                // Distribute 5 damage to Battlefield Marine
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 0],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena'); // Battlefield Marine should be in the ground arena and not take any damage
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.p1Base.damage).toBe(5); // Base starts with 5 damage and should not heal because the unit was defeated
            });

            it('should deal less than 5 damage to a friendly unit and heal damage that much damage from your base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choke-on-aspirations'],
                        groundArena: ['darth-vader#twilight-of-the-apprentice'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                expect(context.p1Base.damage).toBe(5);
                context.player1.clickCard(context.chokeOnAspirations);

                // Distribute 5 damage to Darth Vader
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.darthVader, 3],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.darthVader).toBeInZone('groundArena'); // Darth Vader should be in the ground arena and not take any damage
                expect(context.darthVader.damage).toBe(3);
                expect(context.p1Base.damage).toBe(2); // Base starts with 5 damage and should heal 3 damage because the unit survived
            });

            it('should deal up to 5 damage to a friendly unit with a shield and heal no damage from your base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choke-on-aspirations'],
                        groundArena: [{ card: 'darth-vader#twilight-of-the-apprentice', upgrades: ['shield'] }],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                expect(context.p1Base.damage).toBe(5);
                expect(context.darthVader).toHaveExactUpgradeNames(['shield']);
                context.player1.clickCard(context.chokeOnAspirations);

                // Distribute 5 damage to Darth Vader
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.darthVader, 5],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.darthVader).toBeInZone('groundArena'); // Darth Vader should be in the ground arena and not take any damage
                expect(context.darthVader.damage).toBe(0);
                expect(context.p1Base.damage).toBe(5); // Base starts with 5 damage and should not heal because no damage was dealt to the unit
            });
        });
    });
});
