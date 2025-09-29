describe('Alexsandr Kallus, With New Purpose', function () {
    integration(function (contextRef) {
        describe('Alexsandr Kallus\'s constant ability', () => {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasInitiative: true,
                        groundArena: ['alexsandr-kallus#with-new-purpose', 'yoda#old-master', 'battlefield-marine']
                    },
                });
            });

            it('should not give Raid 2 to himself', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.alexsandrKallus);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
            });

            it('should not give Raid 2 to non unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
            });

            it('should give Raid 2 to other friendly unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('should not give Raid 2 if we do not have initiative', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                context.player2.claimInitiative();

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
            });
        });

        it('Alexsandr Kallus\'s constant ability should not give Raid 2 to enemy unique unit if he has initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['alexsandr-kallus#with-new-purpose']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['colonel-yularen#isb-director']
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.colonelYularen);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(2);
        });

        it('Alexsandr Kallus\'s constant ability should not give Raid 2 to non-unique enemy unit which has a pilot if he has initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['alexsandr-kallus#with-new-purpose']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['atst'],
                    hand: ['chewbacca#faithful-first-mate']
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.chewbacca);
            context.player1.clickPrompt('Play Chewbacca with Piloting');
            context.player2.clickCard(context.atst);

            context.player2.passAction();

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(9);
        });

        describe('Alexsandr Kallus\'s when played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alexsandr-kallus#with-new-purpose'],
                        groundArena: ['yoda#old-master']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'sabine-wren#explosives-artist'],
                        spaceArena: ['vanguard-droid-bomber']
                    }
                });
            });

            it('should deal 2 damage to each of up to 3 ground units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.alexsandrKallus);

                // Should be able to select up to 3 ground units, space unit should not be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.alexsandrKallus, context.yoda, context.battlefieldMarine, context.sabineWren]);
                expect(context.player1).not.toBeAbleToSelect(context.vanguardDroidBomber);

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCardNonChecking(context.alexsandrKallus);
                context.player1.clickDone();

                expect(context.yoda.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.alexsandrKallus.damage).toBe(0);
            });

            it('should deal 2 damage to each of up to 3 ground units (can choose less)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.alexsandrKallus);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sabineWren);
                context.player1.clickDone();

                expect(context.yoda.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.alexsandrKallus.damage).toBe(0);
            });

            it('should deal 2 damage to each of up to 3 ground units (can choose less)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.alexsandrKallus);

                context.player1.clickPrompt('Choose nothing');

                expect(context.yoda.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.sabineWren.damage).toBe(0);
                expect(context.alexsandrKallus.damage).toBe(0);
            });
        });
    });
});
