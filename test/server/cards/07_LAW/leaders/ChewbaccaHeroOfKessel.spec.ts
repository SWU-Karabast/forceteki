describe('Chewbacca, Hero Of Kessel', function() {
    integration(function(contextRef) {
        it('Chewbacca\'s undeployed ability should pay 1 resource, exhaust himself and defeat a friendly resources to deal 2 damage to a unit and create a Credit token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#hero-of-kessel',
                    groundArena: ['battlefield-marine'],
                    resources: ['atst', 'wampa']
                },
                player2: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player1);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda, context.greenSquadronAwing]);
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
            // TODO REARRANGE
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.player1.readyResourceCount).toBe(1);
            expect(context.chewbacca.exhausted).toBeTrue();
            expect(context.player1.credits).toBe(1);
            expect(context.yoda.damage).toBe(2);
        });

        describe('Chewbacca\'s epic action ability', function() {
            it('should costs 4 resources to deploy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#hero-of-kessel',
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 2 damage to a unit and create a Credit token',
                    'Deploy Chewbacca',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Deploy Chewbacca');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should costs 4 resources to deploy (can pay with credit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#hero-of-kessel',
                        resources: 3,
                        credits: 1
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 2 damage to a unit and create a Credit token',
                    'Deploy Chewbacca',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Deploy Chewbacca');
                context.player1.clickPrompt('Use 1 Credit');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('is limited to one activation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#hero-of-kessel',
                        resources: 8,
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Deploy Chewbacca');

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.chewbacca);

                expect(context.chewbacca).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHavePrompt('Choose a card to defeat');
                context.player1.clickCard(context.player1.findCardsByName('underworld-thug', 'resource')[0]);
            });
        });

        describe('Chewbacca\'s deployed on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['surprise-strike'],
                        leader: { card: 'chewbacca#hero-of-kessel', deployed: true },
                        groundArena: ['battlefield-marine'],
                        resources: ['atst', 'wampa', 'gungi#finding-himself', 'awing'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should defeat a friendly resource to deal 2 damage to a unit and create a Credit token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.surpriseStrike);
                context.player1.clickCard(context.chewbacca);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.gungi, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);
                // wampa must be exhausted before defeat it
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.battlefieldMarine, context.yoda, context.greenSquadronAwing]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(1);
                expect(context.yoda.damage).toBe(2);
            });

            it('can be skip', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.gungi, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.player1.readyResourceCount).toBe(4);
            });
        });

        it('Chewbacca\'s ability can pay with stolen enemy resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'chewbacca#hero-of-kessel', deployed: true },
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['arquitens-assault-cruiser']
                },
                player2: {
                    groundArena: ['yoda#old-master'],
                    spaceArena: ['green-squadron-awing', 'awing']
                }
            });

            const { context } = contextRef;


            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.awing);

            context.player2.passAction();

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelect(context.awing);
            context.player1.clickCard(context.awing);

            expect(context.player1).toBeAbleToSelectExactly([context.arquitensAssaultCruiser, context.yoda, context.chewbacca, context.battlefieldMarine, context.greenSquadronAwing]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.player1.credits).toBe(1);
            expect(context.awing).toBeInZone('discard', context.player2);
        });
    });
});
