describe('Tranquility, Inspiring Flagship', function() {
    integration(function(contextRef) {
        it('Tranquility\'s ability should return 1 republic card to hand and the next 3 republic cards played should cost 1 resource less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tranquility#inspiring-flagship', 'barriss-offee#unassuming-apprentice', 'compassionate-senator', 'shaak-ti#unity-wins-wars', 'battlefield-marine', 'for-the-republic'],
                    discard: ['mace-windu#party-crasher', 'general-krell#heartless-tactician', 'adelphi-patrol-wing'],
                    base: 'echo-base',
                    leader: 'chewbacca#walking-carpet',
                    resources: 30
                },
                player2: {
                    discard: ['republic-arc170']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tranquility);

            // return to hand a republic card from discard
            expect(context.player1).toBeAbleToSelectExactly([context.maceWindu, context.generalKrell]);
            context.player1.clickCard(context.maceWindu);
            expect(context.maceWindu).toBeInZone('hand');

            context.tranquility.exhausted = false;
            context.player2.passAction();

            // attack with tranquility, the next 3 republic card cost 1 less
            context.player1.clickCard(context.tranquility);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();
            let exhaustedResourceCount = context.player1.exhaustedResourceCount;

            // not a republic card
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player2.passAction();

            // republic card, should cost 1 less
            context.player1.clickCard(context.forTheRepublic);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player2.passAction();

            // republic card, should cost 1 less
            context.player1.clickCard(context.compassionateSenator);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount);

            exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player2.passAction();

            // republic card, should cost 1 less
            context.player1.clickCard(context.shaakTi);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 3);

            exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player2.passAction();

            // republic card but 4th on the phase
            context.player1.clickCard(context.maceWindu);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 9); // 7+2 (aspect penalty)

            // reset
            context.player1.moveCard(context.maceWindu, 'hand');
            context.player1.moveCard(context.shaakTi, 'hand');
            context.player1.moveCard(context.compassionateSenator, 'hand');
            context.moveToNextActionPhase();

            // trigger tranquility ability
            context.player1.clickCard(context.tranquility);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            // play mace windu, should cost 1 less
            context.player1.clickCard(context.maceWindu);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(8);

            context.moveToNextActionPhase();

            // phase has changed, not more discount
            context.player1.clickCard(context.shaakTi);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });
    });
});
