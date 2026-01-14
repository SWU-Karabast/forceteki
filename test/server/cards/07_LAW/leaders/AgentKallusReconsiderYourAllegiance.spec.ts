describe('Agent Kallus, Reconsider Your Allegiance', function() {
    integration(function(contextRef) {
        describe('Agent Kallus\'s undeployed ability', function() {
            it('should pay 1 resource and exhaust himself to play a unit from hand ignoring its aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'awing', 'resupply', 'sudden-ferocity'],
                        leader: 'agent-kallus#reconsider-your-allegiance',
                        base: 'colossus',
                        groundArena: ['yoda#old-master'],
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.agentKallus);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.resupply, context.suddenFerocity]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.agentKallus.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            });
        });

        describe('Agent Kallus\'s deployed action ability', function() {
            it('should pay 1 resource to play a unit from hand ignoring its aspect penalties (can be repeated)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'awing', 'resupply', 'sudden-ferocity'],
                        leader: { card: 'agent-kallus#reconsider-your-allegiance', deployed: true },
                        base: 'colossus',
                        groundArena: ['yoda#old-master'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.agentKallus);
                context.player1.clickPrompt('Play a card from your hand, ignoring its aspect penalties');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.resupply, context.suddenFerocity]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.agentKallus.exhausted).toBeFalse();
                expect(context.awing).toBeInZone('spaceArena', context.player1);

                context.player2.passAction();

                context.player1.clickCard(context.agentKallus);
                context.player1.clickPrompt('Play a card from your hand, ignoring its aspect penalties');
                context.player1.clickCard(context.suddenFerocity);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.agentKallus.exhausted).toBeFalse();
            });

            it('should pay 1 resource to play a unit from hand ignoring its aspect penalties (can be used as exhausted)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['awing'],
                        leader: { card: 'agent-kallus#reconsider-your-allegiance', deployed: true },
                        base: 'colossus',
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.agentKallus);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.agentKallus);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.agentKallus.exhausted).toBeTrue();
                expect(context.awing).toBeInZone('spaceArena', context.player1);
            });
        });

        describe('Agent Kallus\'s deployed triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'awing', 'atst', 'jam-communications', 'fulcrum', 'uwing-reinforcement'],
                        deck: ['karis-nemik#freedom-is-a-pure-idea', 'batch-brothers', 'wampa', 'mina-bonteri#stop-this-war'],
                        leader: { card: 'agent-kallus#reconsider-your-allegiance', deployed: true },
                        base: { card: 'colossus', damage: 10 },
                        groundArena: ['yoda#old-master'],
                    },
                    player2: {
                        hand: ['resupply', 'consular-security-force']
                    }
                });
            });

            it('must heal 2 damage from our base when we play a Heroism unit (not limit on round, unit and event)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);

                context.player2.passAction();

                context.player1.clickCard(context.jamCommunications);
                context.player1.clickCardInDisplayCardPrompt(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(6);
            });

            it('must heal 2 damage from our base when we do not play a Heroism unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });

            it('should not heal 2 damage from our base when opponent plays a Heroism unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.consularSecurityForce);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });

            it('must heal 2 damage from our base when we play a Heroism unit (ignoring its aspect penalties with leader action)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.agentKallus);
                context.player1.clickPrompt('Play a card from your hand, ignoring its aspect penalties');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);
            });

            it('should not heal 2 damage from our base when we play a Villainy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });

            it('must heal 2 damage from our base when we play a Heroism unit (upgrade)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fulcrum);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);
            });

            it('must heal 2 damage from our base when we play a Heroism unit (multiple triggers)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);
                context.player1.clickCardInDisplayCardPrompt(context.karisNemik);
                context.player1.clickCardInDisplayCardPrompt(context.batchBrothers);
                context.player1.clickCardInDisplayCardPrompt(context.minaBonteri);
                context.player1.clickPrompt('Play cards in selection order');
                context.player1.clickPrompt('Create a Clone Trooper token.');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(2);
            });
        });

        it('Agent Kallus\'s deployed triggered ability must heal 2 damage from our base when we play Heroism card (from resource)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'agent-kallus#reconsider-your-allegiance', deployed: true },
                    base: { card: 'colossus', damage: 10 },
                    resources: ['smugglers-aid', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.smugglersAid);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);
        });

        it('Agent Kallus\'s deployed triggered ability must heal 2 damage from our base when we play Heroism card (from discard)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'agent-kallus#reconsider-your-allegiance', deployed: true },
                    base: { card: 'colossus', damage: 10 },
                    groundArena: ['battlefield-marine'],
                    hand: ['a-fine-addition', 'rivals-fall'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['fulcrum'] }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.aFineAddition);
            context.player1.clickCard(context.fulcrum);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(8);
        });
    });
});
