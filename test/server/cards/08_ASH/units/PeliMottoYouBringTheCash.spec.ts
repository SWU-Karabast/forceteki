describe('Peli Motto, You Bring the Cash?', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    // identity aspects: Command (base) + Vigilance/Heroism (leader)
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend',
                    groundArena: ['peli-motto#you-bring-the-cash'],
                    // daring-raid (Aggression) is off-aspect (+2 penalty), smugglers-aid (Heroism) is on-aspect,
                    // seasoned-shoretrooper (Villainy/Command) is an off-aspect unit (+2 penalty)
                    hand: ['daring-raid', 'daring-raid', 'daring-raid', 'smugglers-aid', 'seasoned-shoretrooper'],
                    resources: 10
                },
                player2: {}
            });
        });

        it('ignores the aspect penalty on the first non-unit card played each phase, but not subsequent ones', function () {
            const { context } = contextRef;
            const daringRaids = context.player1.findCardsByName('daring-raid');

            // first non-unit card: aspect penalty ignored, costs 1 instead of 3
            context.player1.clickCard(daringRaids[0]);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player2.passAction();

            // second non-unit card: aspect penalty applies, costs 3
            context.player1.clickCard(daringRaids[1]);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player2.passAction();

            // the discount resets each phase
            context.moveToNextActionPhase();
            expect(context.player1.exhaustedResourceCount).toBe(0);

            context.player1.clickCard(daringRaids[2]);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('does not count units played toward the first non-unit card', function () {
            const { context } = contextRef;
            const daringRaids = context.player1.findCardsByName('daring-raid');

            // play a unit first (off-aspect, costs 4) - this should not consume the non-unit discount
            context.player1.clickCard(context.seasonedShoretrooper);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player2.passAction();

            // first non-unit card still ignores the aspect penalty, costs 1
            context.player1.clickCard(daringRaids[0]);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('counts an on-aspect non-unit card as the first non-unit card, removing the discount from later ones', function () {
            const { context } = contextRef;
            const daringRaids = context.player1.findCardsByName('daring-raid');

            // first non-unit card is on-aspect (no penalty anyway) but still consumes the discount
            context.player1.clickCard(context.smugglersAid);
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.player2.passAction();

            // second non-unit card now pays the aspect penalty, costs 3
            context.player1.clickCard(daringRaids[0]);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });
    });
});
