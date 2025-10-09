describe('Dryden Vos, I Get All Worked Up', function() {
    integration(function(contextRef) {
        const prompt = 'Double this unit\'s power for this attack. If you do, this unit does not ready during the next regroup phase.';

        it('Dryden Vos\'s on attack ability may double its power but he can not ready the next regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#i-get-all-worked-up'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos.exhausted).toBeTrue();

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos.exhausted).toBeFalse();
        });

        it('Dryden Vos\'s on attack ability may double its power but he can not ready the next regroup phase (can be ready on action phase)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-fighting'],
                    groundArena: ['dryden-vos#i-get-all-worked-up'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
            expect(context.drydenVos.exhausted).toBeTrue();

            context.player2.passAction();

            // ready him with keep fighting
            context.player1.clickCard(context.keepFighting);
            context.player1.clickCard(context.drydenVos);

            context.player2.passAction();
            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            // can trigger his ability again
            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(8);
            expect(context.drydenVos.exhausted).toBeTrue();

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos.exhausted).toBeTrue();
        });

        it('Dryden Vos\'s on attack ability may double its power but he can not ready the next regroup phase (if he finish the action phase ready, still ready the next action phase)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keep-fighting'],
                    groundArena: ['dryden-vos#i-get-all-worked-up'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
            expect(context.drydenVos.exhausted).toBeTrue();

            context.player2.passAction();

            // ready him with keep fighting
            context.player1.clickCard(context.keepFighting);
            context.player1.clickCard(context.drydenVos);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos.exhausted).toBeFalse();
        });

        it('Dryden Vos\'s on attack ability should double his Raid and +X', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#i-get-all-worked-up', 'hondo-ohnaka#you-better-hurry', 'clone-commander-cody#commanding-the-212th'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            // 2x(2 + Raid 1 (from hondo) + +1/+0 (from cody))
            expect(context.p2Base.damage).toBe(8);
        });

        it('Dryden Vos\'s on attack ability should double his Raid and +X (7 buffs/debuffs)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surprise-strike'],
                    groundArena: ['marchion-ro#eye-of-the-nihil', 'benthic-two-tubes#partisan-lieutenant',
                        'hondo-ohnaka#you-better-hurry', 'clone-commander-cody#commanding-the-212th',
                        { card: 'dryden-vos#i-get-all-worked-up', damage: 2 }],
                    spaceArena: ['first-light#headquarters-of-the-crimson-dawn']
                },
                player2: {
                    hand: ['make-an-opening']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.benthicTwoTubes);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.drydenVos);

            context.player2.clickCard(context.makeAnOpening);
            context.player2.clickCard(context.drydenVos);

            context.setDamage(context.p2Base, 0);

            context.player1.clickCard(context.surpriseStrike);
            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(prompt);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            // 2 base
            // -2 make an opening
            // raid 2 from benthic
            // raid 1 from hondo
            // raid 3 from marchion ro
            // +2 from grit (first light)
            // +1 from cody
            // +3 from surprise strike
            // total : 12 x 2 = 24
            expect(context.p2Base.damage).toBe(24);
        });
    });
});
