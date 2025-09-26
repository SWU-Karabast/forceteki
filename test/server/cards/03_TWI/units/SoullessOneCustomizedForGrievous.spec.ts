describe('Soulless One, Customized for Grievous', function () {
    integration(function (contextRef) {
        describe('Soulless One\'s ability', function () {
            beforeEach(async function () {
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
                });
            });

            it('should be able to target friendly droid units and General Grievous cards', function () {
                const { context } = contextRef;

                const grievousUnit = context.player1.findCardByName('general-grievous#trophy-collector');
                const grievousLeader = context.player1.findCardByName('general-grievous#general-of-the-droid-armies');

                context.player1.clickCard(context.soullessOne);
                context.player1.clickCard(context.p2Base);

                // can select friendly droid or friendly grievous (leader or unit)
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, grievousLeader, grievousUnit]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.viperProbeDroid);

                expect(context.p2Base.damage).toBe(3);
                expect(context.soullessOne.getPower()).toBe(1);
                expect(context.viperProbeDroid.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not get +2/+0 boost when ability is declined', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.soullessOne);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');

                // we pass, no power boost - base 1 power attack
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust General Grievous leader and get +2/+0 for this attack', function () {
                const { context } = contextRef;

                const grievousLeader = context.player1.findCardByName('general-grievous#general-of-the-droid-armies');

                context.player1.clickCard(context.soullessOne);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(grievousLeader);

                // we exhaust grievous leader, 3 damage should be done (1 base + 2 boost)
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.soullessOne.getPower()).toBe(1); // power returns to base after attack
                expect(grievousLeader.exhausted).toBeTrue();
            });

            it('should exhaust General Grievous unit and get +2/+0 for this attack', function () {
                const { context } = contextRef;

                const grievousUnit = context.player1.findCardByName('general-grievous#trophy-collector');

                context.player1.clickCard(context.soullessOne);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(grievousUnit);

                // we exhaust grievous unit, 3 damage should be done (1 base + 2 boost)
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.soullessOne.getPower()).toBe(1); // power returns to base after attack
                expect(grievousUnit.exhausted).toBeTrue();
            });
        });

        it('should not be able to target and exhaust IG88 leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r2d2#ignoring-protocol'],
                    spaceArena: ['soulless-one#customized-for-grievous'],
                    leader: 'ig88#ruthless-bounty-hunter'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.soullessOne);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.r2d2]);
            expect(context.player1).not.toBeAbleToSelectExactly([context.ig88]);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to target and exhaust IG88 leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r2d2#ignoring-protocol'],
                    spaceArena: ['soulless-one#customized-for-grievous'],
                    leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.soullessOne);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.ig88]);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
