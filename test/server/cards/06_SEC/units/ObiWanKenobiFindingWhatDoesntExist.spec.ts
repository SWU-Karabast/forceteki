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

        it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties (event)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    groundArena: ['obiwan-kenobi#finding-what-doesnt-exist']
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['power-of-the-dark-side']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.powerOfTheDarkSide);
            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player2);
        });

        it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties. If we find another way to play it, aspect penalties should not apply', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    groundArena: ['obiwan-kenobi#finding-what-doesnt-exist', 'tech#source-of-insight'],
                    hand: ['arquitens-assault-cruiser'],
                    base: 'echo-base'
                },
                player2: {
                    hand: ['command'],
                    groundArena: ['wampa'],
                    deck: ['fetts-firespray#pursuing-the-bounty'],
                    leader: 'grand-moff-tarkin#oversector-governor',
                    base: 'echo-base'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.command);
            context.player2.clickPrompt('Give 2 Experience tokens to a unit.');
            context.player2.clickCard(context.wampa);
            context.player2.clickPrompt('Return a unit from your discard pile to your hand.');
            context.player2.clickCard(context.fettsFirespray);

            context.player1.passAction();

            context.player2.clickCard(context.fettsFirespray);

            expect(context.player2.exhaustedResourceCount).toBe(12); // 4 for command, 8 for fetts firespray

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.fettsFirespray);

            expect(context.fettsFirespray).toBeInZone('resource', context.player1);

            context.player2.passAction();

            context.player1.clickCard(context.fettsFirespray);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(19); // 8 for arquitens, 1 for added resources, 8+2 for smuggle fetts firespray
            expect(context.fettsFirespray).toBeInZone('spaceArena', context.player1);
        });

        it('should discard the top card from opponent\'s deck when he deals combat damage to a base. We can play this card from discard this phase ignoring all aspect penalties (only 1 time)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    groundArena: ['obiwan-kenobi#finding-what-doesnt-exist', 'tech#source-of-insight'],
                    resources: 30
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['arquitens-assault-cruiser'],
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.arquitensAssaultCruiser);

            expect(context.player1).toBeActivePlayer();
            expect(context.arquitensAssaultCruiser).toBeInZone('discard', context.player2);

            // can not play it again
            expect(context.arquitensAssaultCruiser).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        //TODO ADD TEST WITH SMUGGLE EVENT, BOUNCE BACK, YODA, CHAM, DJ
    });
});
