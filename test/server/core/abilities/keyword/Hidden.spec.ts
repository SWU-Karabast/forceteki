describe('Hidden keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Hidden keyword is played', function() {
            it('cannot be attacked for this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#force-prodigy'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield']);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);

                context.player2.clickCardNonChecking(context.anakinSkywalker);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);
            });

            it('can be attacked on the next phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#force-prodigy'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield']);
                expect(context.anakinSkywalker.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.anakinSkywalker.getSummary(context.player1Object).hidden).toBeTrue();

                context.player2.claimInitiative();
                context.moveToNextActionPhase();

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.anakinSkywalker, context.p1Base]);

                context.player2.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames([]);
                expect(context.anakinSkywalker.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.anakinSkywalker.getSummary(context.player1Object).hidden).toBeFalse();
            });

            it('can be targeted by events', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#force-prodigy'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['daring-raid'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield']);

                context.player2.clickCard(context.daringRaid);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.anakinSkywalker, context.p1Base, context.p2Base]);

                context.player2.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames([]);
            });
        });

        describe('When a unit with the Hidden keyword gains Sentinel', function() {
            it('can be attacked', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['anakin-skywalker#force-prodigy', 'unshakeable-will', 'village-protectors'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield']);
                expect(context.anakinSkywalker.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.anakinSkywalker.getSummary(context.player1Object).hidden).toBeTrue();

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);

                context.player2.clickPrompt('Cancel');
                context.player2.passAction();

                context.player1.clickCard(context.unshakeableWill);
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield', 'unshakeable-will']);
                expect(context.anakinSkywalker.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.anakinSkywalker.getSummary(context.player1Object).hidden).toBeFalse();

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.anakinSkywalker]);

                context.player2.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toHaveExactUpgradeNames(['unshakeable-will']);

                context.player1.clickCard(context.villageProtectors);

                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.anakinSkywalker, context.villageProtectors]);

                context.player2.clickCard(context.anakinSkywalker);
                expect(context.anakinSkywalker).toBeInZone('discard');
            });
        });

        it('does not work if the unit has not been played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#force-prodigy'],
                    groundArena: ['wampa'],
                    spaceArena: ['outlaw-corona'],
                },
                player2: {
                    hand: ['sanctioners-shuttle'],
                    groundArena: ['battlefield-marine', 'atst'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);
            context.player2.clickPrompt('Cancel');

            context.player2.clickCard(context.sanctionersShuttle);
            context.player2.clickCard(context.anakinSkywalker);
            expect(context.anakinSkywalker).toBeCapturedBy(context.sanctionersShuttle);

            context.player1.clickCard(context.outlawCorona);
            context.player1.clickCard(context.sanctionersShuttle);
            expect(context.anakinSkywalker).toBeInZone('groundArena');

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.anakinSkywalker, context.p1Base]);
            context.player2.clickCard(context.anakinSkywalker);
            expect(context.anakinSkywalker).toBeInZone('discard');
        });
    });
});
