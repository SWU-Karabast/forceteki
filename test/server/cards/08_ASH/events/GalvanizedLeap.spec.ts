describe('Glavanized Leap', function() {
    integration(function(contextRef) {
        it('Galvanized Leap\'s ability should ready a friendly unit that was damaged this phase by event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready a friendly unit that was damaged this phase by when played ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                },
                player2: {
                    hand: ['snub-fighter-squadron'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.snubFighterSquadron);
            context.player2.clickPrompt('Ambush');
            context.player2.clickPrompt('Pass');

            context.player2.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(1);

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready a friendly unit that was damaged this phase by combat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    spaceArena: ['awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.awing);
            context.player2.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready a friendly leader unit that was damaged this phase by combat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'], exhausted: true },
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.sabineWren);
            expect(context.sabineWren.damage).toBe(3);

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.sabineWren);

            expect(context.sabineWren.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready an enemy leader unit that was damaged this phase by combat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                },
                player2: {
                    hand: ['daring-raid'],
                    spaceArena: ['awing'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'], exhausted: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.sabineWren);
            expect(context.sabineWren.damage).toBe(3);

            context.player2.passAction();

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.sabineWren);

            expect(context.sabineWren.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready an enemy unit that was damaged this phase by combat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(2);

            context.player2.passAction();

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should do nothing if nobody was damaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galvanizedLeap);
            context.player1.clickPrompt('Play anyway');

            expect(context.greenSquadronAwing.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should ready an attacker that took combat damage from two defenders simultaneously', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    // Resilient upgrades ensure both units survive Maul's 5 damage
                    groundArena: [
                        { card: 'frontier-atrt', upgrades: ['resilient'] },
                        { card: 'first-legion-snowtrooper', upgrades: ['resilient'] },
                    ],
                }
            });

            const { context } = contextRef;

            // Maul attacks both units simultaneously: deals 5 damage to each,
            // and takes 3 (frontier-atrt) + 2 (snowtrooper) = 5 return damage (leaving him at 1 HP). All three survive and are damaged.
            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.frontierAtrt);
            context.player1.clickCard(context.firstLegionSnowtrooper);
            context.player1.clickDone();

            expect(context.darthMaul.damage).toBe(5);
            expect(context.darthMaul.exhausted).toBeTrue();
            expect(context.frontierAtrt.damage).toBe(5);
            expect(context.firstLegionSnowtrooper.damage).toBe(5);

            context.player2.passAction();

            context.player1.clickCard(context.galvanizedLeap);
            expect(context.player1).toBeAbleToSelectExactly([context.darthMaul, context.frontierAtrt, context.firstLegionSnowtrooper]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.darthMaul);

            expect(context.darthMaul.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('Galvanized Leap\'s ability should work if p1 is attacking to make the damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galvanized-leap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.awing.damage).toBe(1);
            expect(context.awing.exhausted).toBeTrue();

            context.player2.passAction();

            context.player1.clickCard(context.galvanizedLeap);
            context.player1.clickCard(context.awing);

            expect(context.awing.exhausted).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });
    });
});