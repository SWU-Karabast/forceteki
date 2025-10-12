describe('Obi-Wan Kenobi, Finding What Doesn\'t Exist', function() {
    integration(function(contextRef) {
        describe('Obi-Wan Kenobi\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        groundArena: ['wampa', 'obiwan-kenobi#finding-what-doesnt-exist', 'clone-commander-cody#commanding-the-212th'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'consular-security-force'],
                        spaceArena: ['awing'],
                        deck: ['atst']
                    }
                });
            });

            it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player2);

                expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                expect(context.atst).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties (overwhelm)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player2);

                expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                expect(context.atst).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties (next phase we can not play it anymore)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player2);

                expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                context.moveToNextActionPhase();

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should does nothing when other friendly deals combat damage to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('deck', context.player2);
            });

            it('should does nothing when he does not deal combat damage to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('deck', context.player2);
            });

            it('should does nothing when ennemy units deals combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.awing);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('deck', context.player2);
                expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
            });
        });


        it('should does nothing when opponent\'s deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    groundArena: ['obiwan-kenobi#finding-what-doesnt-exist']
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.discard.length).toBe(0);
        });
    });
});
