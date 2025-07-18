describe('Colonel Yularen, ISB Director', function() {
    integration(function(contextRef) {
        describe('Yularen\'s triggered ability', function() {
            it('should heal 1 from friendly base when a friendly Command unit is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['colonel-yularen#isb-director', 'battlefield-marine'],
                        base: { card: 'nevarro-city', damage: 3 }
                    },
                    player2: {
                        hand: ['vanguard-infantry']
                    }
                });

                const { context } = contextRef;

                // CASE 1: Yularen heals when he himself is played
                context.player1.clickCard(context.colonelYularen);
                expect(context.p1Base.damage).toBe(2);

                // CASE 2: no heal when opponent plays a Command unit
                context.player2.clickCard(context.vanguardInfantry);
                expect(context.p1Base.damage).toBe(2);

                // CASE 3: heal happens when another friendly Command unit is played
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p1Base.damage).toBe(1);

                // double Yularen case is covered in UniqueRule.spec.ts
            });

            it('should heal 1 from base when a friendly Command unit owned by the opponent is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['unrefusable-offer', 'takedown'],
                        groundArena: ['colonel-yularen#isb-director'],
                        base: { card: 'nevarro-city', damage: 3 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.unrefusableOffer);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Trigger');

                expect(context.p1Base.damage).toBe(2);
            });

            it('should not heal 1 from friendly base when a friendly Command Pilot is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#you-still-with-me'],
                        groundArena: ['colonel-yularen#isb-director'],
                        spaceArena: ['cartel-spacer'],
                        base: { card: 'nevarro-city', damage: 3 }
                    },
                    player2: {
                        hand: ['vanguard-infantry']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Play Luke Skywalker with Piloting');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.p1Base.damage).toBe(3);
            });

            it('should trigger twice when cloned with Clone', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone', 'battlefield-marine'],
                        groundArena: ['colonel-yularen#isb-director'],
                        base: { card: 'nevarro-city', damage: 5 }
                    },
                    player2: {
                        hand: ['vanguard-infantry']
                    }
                });

                const { context } = contextRef;

                // CASE 1: Clone heals when he is played as a copy of Colonel Yularen
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.colonelYularen);
                context.player1.clickPrompt('Heal 1 damage from your base');
                expect(context.clone).toBeCloneOf(context.colonelYularen);
                expect(context.p1Base.damage).toBe(3); // 1 for Clone and 1 for Colonel Yularen

                // CASE 2: no heal when opponent plays a Command unit
                context.player2.clickCard(context.vanguardInfantry);
                expect(context.p1Base.damage).toBe(3);

                // CASE 3: heal happens when another friendly Command unit is played
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Heal 1 damage from your base');
                expect(context.p1Base.damage).toBe(1); // 1 for Clone and 1 for Colonel Yularen
            });
        });
    });
});
