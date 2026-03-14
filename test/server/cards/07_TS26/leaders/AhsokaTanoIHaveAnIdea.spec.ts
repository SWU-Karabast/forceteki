describe('Ahsoka Tano, I Have an Idea', function () {
    integration(function (contextRef) {
        describe('Ahsoka Tano\'s leader side ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ahsoka-tano#i-have-an-idea',
                        base: 'tarkintown',
                        hand: ['repair', 'battlefield-marine', 'mastery'],
                        groundArena: [{ card: 'yoda#old-master', damage: 3 }],
                        deck: ['wampa', 'atst', 'consular-security-force']
                    },
                    player2: {
                        hand: ['resupply']
                    }
                });
            });

            it('should trigger when an event is played and allow playing the top card of deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.yoda);

                expect(context.player1).toHavePassAbilityPrompt('Look at the top card of your deck');
                context.player1.clickPrompt('Trigger');

                expect(context.ahsokaTano.exhausted).toBeTrue();
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'play');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7); // 3 for off-color repair + 4 for wampa
            });

            it('should allow discarding the top card of deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.yoda);
                context.player1.clickPrompt('Trigger');

                expect(context.ahsokaTano.exhausted).toBeTrue();
                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'discard');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('discard');
            });

            it('should allow leaving the card on top of deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.yoda);
                context.player1.clickPrompt('Trigger');

                expect(context.ahsokaTano.exhausted).toBeTrue();
                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'leave');

                expect(context.wampa).toBeInZone('deck');
                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing not to exhaust the leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.yoda);
                context.player1.clickPrompt('Pass');

                expect(context.ahsokaTano.exhausted).toBeFalse();
                expect(context.wampa).toBeInZone('deck');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when playing a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.ahsokaTano.exhausted).toBeFalse();
                expect(context.wampa).toBeInZone('deck');
            });

            it('should not trigger when playing an upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.ahsokaTano.exhausted).toBeFalse();
                expect(context.wampa).toBeInZone('deck');
            });

            it('should not trigger when opponent plays an event', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.resupply);

                expect(context.player1).toBeActivePlayer();
                expect(context.ahsokaTano.exhausted).toBeFalse();
            });
        });

        describe('Ahsoka Tano\'s unit side ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'ahsoka-tano#i-have-an-idea', deployed: true },
                        base: 'tarkintown',
                        deck: ['wampa', 'consular-security-force']
                    },
                    player2: {
                        groundArena: ['snowtrooper-lieutenant', 'atst'],
                    }
                });
            });

            it('should trigger when attack ends and allow playing the top card with 1 resource discount', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'play');

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should trigger when attack ends and allow playing the top card with 1 resource discount (even if Ahsoka die during attack)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.atst);

                expect(context.ahsokaTano).toBeInZone('base');
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'play');

                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should allow discarding the top card of deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.snowtrooperLieutenant);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'discard');

                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow leaving the card on top of deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.snowtrooperLieutenant);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'leave');

                expect(context.wampa).toBeInZone('deck');
                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Ahsoka Tano\'s unit side ability should apply cost reduction correctly for expensive cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'ahsoka-tano#i-have-an-idea', deployed: true },
                    deck: ['atst'],
                    resources: 7
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);
            context.player1.clickCard(context.p2Base);
            context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'play');

            expect(context.atst).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(7);
        });

        it('Ahsoka Tano\'s leader side ability should work when deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'ahsoka-tano#i-have-an-idea',
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    hand: ['repair'],
                    deck: []
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHavePassAbilityPrompt('Look at the top card of your deck');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.ahsokaTano.exhausted).toBeTrue();
        });
    });
});
