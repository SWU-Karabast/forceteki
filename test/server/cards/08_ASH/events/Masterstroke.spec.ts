describe('Masterstroke', function() {
    integration(function(contextRef) {
        it('Masterstroke\'s ability should give a unit +1/+0 for each unit the defending player controls in its arena for ground', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['masterstroke'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }, 'death-star-stormtrooper', 'guavian-antagonizer'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.masterstroke);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(7);
            expect(context.battlefieldMarine.getPower()).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('Masterstroke\'s ability should give a unit +1/+0 for each unit the defending player controls in its arena for space', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['masterstroke'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['wing-leader']
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }, 'death-star-stormtrooper', 'guavian-antagonizer'],
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.masterstroke);
            expect(context.player1).toBeAbleToSelectExactly([context.wingLeader, context.battlefieldMarine]);
            context.player1.clickCard(context.wingLeader);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.wingLeader.getPower()).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Masterstroke\'s ability should work if there are no other units in arena and not buff', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['masterstroke'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['wing-leader']
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }, 'death-star-stormtrooper', 'guavian-antagonizer'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.masterstroke);
            expect(context.player1).toBeAbleToSelectExactly([context.wingLeader, context.battlefieldMarine]);
            context.player1.clickCard(context.wingLeader);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(2);
            expect(context.wingLeader.getPower()).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Masterstroke\'s ability should maintain buff if other unit in arena dies from on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['masterstroke'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['punishing-one#takes-no-prisoners']
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }, 'death-star-stormtrooper', 'guavian-antagonizer'],
                    spaceArena: ['wing-leader'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.masterstroke);
            expect(context.player1).toBeAbleToSelectExactly([context.punishingOne, context.battlefieldMarine]);
            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.wingLeader);

            expect(context.p2Base.damage).toBe(4);
            expect(context.punishingOne.getPower()).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });
    });
});