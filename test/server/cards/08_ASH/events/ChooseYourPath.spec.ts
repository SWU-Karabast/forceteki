describe('Choose Your Path', function() {
    integration(function(contextRef) {
        describe('Choose Your Path\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choose-your-path'],
                        groundArena: ['obiwan-kenobi#protective-padawan', 'mandalorian-warrior'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should allow choosing to heal 5 damage from base when controlling a Force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chooseYourPath);
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons([
                    'If you control a Force unit, heal 5 damage from your base',
                    'If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it'
                ]);

                context.player1.clickPrompt('If you control a Force unit, heal 5 damage from your base');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
            });

            it('should allow choosing to create a Mandalorian token and give it Advantage when controlling a Mandalorian unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chooseYourPath);
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons([
                    'If you control a Force unit, heal 5 damage from your base',
                    'If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it'
                ]);

                context.player1.clickPrompt('If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it');

                expect(context.player2).toBeActivePlayer();

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();
                expect(mandalorians[0]).toHaveExactUpgradeNames(['shield', 'advantage']);
            });
        });

        it('should allow choosing the Force option when not controlling a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['choose-your-path'],
                    groundArena: ['mandalorian-warrior'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chooseYourPath);
            expect(context.player1).toHavePrompt('Select one');
            expect(context.player1).toHaveExactPromptButtons([
                'If you control a Force unit, heal 5 damage from your base',
                'If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it'
            ]);

            context.player1.clickPrompt('If you control a Force unit, heal 5 damage from your base');

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
        });

        it('should allow choosing the Mandalorian option when not controlling a Mandalorian unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['choose-your-path'],
                    groundArena: ['obiwan-kenobi#protective-padawan'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    groundArena: ['koska-reeves#loyal-nite-owl']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chooseYourPath);
            expect(context.player1).toHavePrompt('Select one');
            expect(context.player1).toHaveExactPromptButtons([
                'If you control a Force unit, heal 5 damage from your base',
                'If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it'
            ]);

            context.player1.clickPrompt('If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it');

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(10);

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
        });

        it('should not allow any choice when controlling neither Force nor Mandalorian units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['choose-your-path'],
                    groundArena: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chooseYourPath);
            expect(context.player1).toHavePrompt('Playing Choose Your Path will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();

            expect(context.p1Base.damage).toBe(5);

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
        });

        describe('Choose Your Path with Moff Jerjerrod', function() {
            it('should give an Advantage token to both Mandalorian tokens when doubled by Moff Jerjerrod', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choose-your-path'],
                        groundArena: ['mandalorian-warrior', 'moff-jerjerrod#we-shall-redouble-our-efforts'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chooseYourPath);
                context.player1.clickPrompt('If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it');
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Mandalorian tokens instead');
                context.player1.clickPrompt('Trigger');

                // Both doubled Mandalorian tokens have Shielded; their grouped triggers resolve via the modal
                expect(context.player1).toHavePrompt('Resolve "Shielded"');
                context.player1.clickPrompt('Resolve all remaining (2)');

                const mandalorians = context.player1.findCardsByName('mandalorian', 'groundArena');
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(mandalorians.length).toBe(2);
                mandalorians.forEach((mandalorian) => {
                    expect(mandalorian).toHaveExactUpgradeNames(['shield', 'advantage']);
                });
            });
        });
    });
});
