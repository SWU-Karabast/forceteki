describe('Anakin Skywalker, Destined for Darkness', function () {
    integration(function (contextRef) {
        it('Anakin Skywalker\'s when defeated ability should search whole deck for a Darth Vader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#destined-for-darkness'],
                    deck: [
                        'brain-invaders', 'battlefield-marine', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself',
                        'awing', 'green-squadron-awing', 'fulcrum', 'phoenix-squadron-awing', 'mastery', 'champion',
                        'wampa', 'atst', 'takedown', 'darth-vader#scourge-of-squadrons', 'darth-maul#revenge-at-last',
                    ]
                },
                player2: {
                    hand: ['rivals-fall'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.anakinSkywalker);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.darthVader],
                invalid: [
                    context.brainInvaders, context.battlefieldMarine, context.yoda, context.rey, context.gungi,
                    context.awing, context.greenSquadronAwing, context.fulcrum, context.phoenixSquadronAwing,
                    context.mastery, context.champion, context.wampa, context.atst, context.takedown, context.darthMaul
                ]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.darthVader);

            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.darthVader]);
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.darthVader).toBeInZone('hand', context.player1);
            expect(context.player1.deck[0]).not.toBe(context.brainInvaders);
        });

        it('Anakin Skywalker\'s when defeated ability should search whole deck for a Darth Vader (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#destined-for-darkness'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                    deck: [
                        'brain-invaders', 'battlefield-marine', 'yoda#old-master', 'rey#skywalker', 'gungi#finding-himself',
                        'awing', 'green-squadron-awing', 'fulcrum', 'phoenix-squadron-awing', 'mastery', 'champion',
                        'wampa', 'atst', 'takedown', 'darth-vader#scourge-of-squadrons', 'darth-maul#revenge-at-last',
                    ]
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.anakinSkywalker);

            expect(context.player2).toHaveExactDisplayPromptCards({
                selectable: [context.darthVader],
                invalid: [
                    context.brainInvaders, context.battlefieldMarine, context.yoda, context.rey, context.gungi,
                    context.awing, context.greenSquadronAwing, context.fulcrum, context.phoenixSquadronAwing,
                    context.mastery, context.champion, context.wampa, context.atst, context.takedown, context.darthMaul
                ]
            });
            expect(context.player2).toHaveEnabledPromptButton('Take nothing');

            context.player2.clickCardInDisplayCardPrompt(context.darthVader);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.darthVader]);
            context.player1.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.darthVader).toBeInZone('hand', context.player2);
            expect(context.player2.deck[0]).not.toBe(context.brainInvaders);
        });

        it('Anakin Skywalker\'s when defeated ability should fail if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#destined-for-darkness'],
                    deck: []
                },
                player2: {
                    hand: ['rivals-fall'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.anakinSkywalker);

            expect(context.player1).toBeActivePlayer();
        });

        it('Anakin Skywalker\'s constant ability should ignore not aspect penalties on cards you play not named Darth Vader', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['anakin-skywalker#destined-for-darkness'],
                    hand: ['marrok#mysterious-warrior'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.marrok);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(7);
        });

        it('Anakin Skywalker\'s constant ability should do nothing on enemy units named Darth Vader', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['anakin-skywalker#destined-for-darkness'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
                player2: {
                    hand: ['darth-vader#meet-your-destiny'],
                    leader: 'sabine-wren#galvanized-revolutionary',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.darthVader);

            expect(context.player1).toBeActivePlayer();
            expect(context.player2.exhaustedResourceCount).toBe(7);
        });

        it('Anakin Skywalker\'s constant ability should ignore aspect penalties on cards you play named Darth Vader while he is in discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['anakin-skywalker#destined-for-darkness'],
                    hand: ['darth-vader#scourge-of-squadrons'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Anakin Skywalker\'s constant ability should do nothing if he is not in discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-vader#scourge-of-squadrons'],
                    groundArena: ['anakin-skywalker#destined-for-darkness'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(10);
        });

        it('Anakin Skywalker\'s constant ability should ignore aspect penalties on cards you play named Darth Vader while he is in discard (multiple Darth Vader)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['anakin-skywalker#destined-for-darkness'],
                    hand: ['darth-vader#scourge-of-squadrons', 'darth-vader#meet-your-destiny'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVaderScourgeOfSquadrons);

            context.player2.passAction();

            context.player1.clickCard(context.darthVaderMeetYourDestiny);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(11);
        });

        it('Anakin Skywalker\'s constant ability should ignore aspect penalties on cards you play named Darth Vader while he is in discard (not playing as unit)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['anakin-skywalker#destined-for-darkness'],
                    hand: ['darth-vader#scourge-of-squadrons'],
                    spaceArena: ['awing'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'data-vault'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Play Darth Vader with Piloting');
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });
    });
});
