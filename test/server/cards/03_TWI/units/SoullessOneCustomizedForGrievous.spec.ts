describe('Soulless One, Customized for Grievous', function () {
    integration(function (contextRef) {
        it('Soulless One\'s ability should exhaust a friendly droid unit or a friendly general grievous to get +2/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#trophy-collector', 'atst', 'viper-probe-droid'],
                    spaceArena: ['soulless-one#customized-for-grievous'],
                    leader: 'general-grievous#general-of-the-droid-armies'
                },
                player2: {
                    groundArena: ['r2d2#ignoring-protocol']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            const grievousUnit = context.player1.findCardByName('general-grievous#trophy-collector');
            const grievousLeader = context.player1.findCardByName('general-grievous#general-of-the-droid-armies');

            function reset() {
                context.soullessOne.exhausted = false;
                context.setDamage(context.p2Base, 0);
                context.player2.passAction();
            }

            context.player1.clickCard(context.soullessOne);

            // can select friendly droid or friendly grievous (leader or unit)
            expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, grievousLeader, grievousUnit]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickPrompt('Pass');

            // we pass, no power boost
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(1);

            reset();

            context.player1.clickCard(context.soullessOne);
            context.player1.clickCard(context.viperProbeDroid);

            // we exhaust a droid unit, 3 damage should be done
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
            expect(context.soullessOne.getPower()).toBe(1);
            expect(context.viperProbeDroid.exhausted).toBeTrue();

            reset();

            context.player1.clickCard(context.soullessOne);
            context.player1.clickCard(grievousLeader);

            // we exhaust grievous leader, 3 damage should be done
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
            expect(context.soullessOne.getPower()).toBe(1);
            expect(grievousLeader.exhausted).toBeTrue();
        });
    });
});
