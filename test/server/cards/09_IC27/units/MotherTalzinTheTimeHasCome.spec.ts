describe('Mother Talzin, The Time Has Come', function () {
    integration(function (contextRef) {
        describe('Mother Talzin\'s when played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mother-talzin#the-time-has-come'],
                        discard: [
                            'imperial-interceptor', // Villainy, 4 cost, not Night or Undead
                            'karis#we-dont-like-strangers', // Villainy, 2 cost, Night
                            'deceptive-shade', // Villainy, 2 cost, Undead
                            'interceptor-ace', // Villainy, 3 cost, Pilot
                            'patrolling-aat', // Villainy, 5 cost (too expensive)
                            'wampa', // Not Villainy
                            'alliance-xwing' // Not Villainy
                        ],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor',
                        base: 'chopper-base'
                    },
                    player2: {
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        discard: ['death-trooper'] // Villainy, but in the opponent's discard pile
                    }
                });
            });

            it('should deal damage equal to the played unit\'s cost to this unit before the played unit\'s When Played ability resolves', function () {
                const { context } = contextRef;

                // Play Mother Talzin, only cheap Villainy units in own discard pile are selectable
                context.player1.clickCard(context.motherTalzin);
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.imperialInterceptor,
                    context.karis,
                    context.deceptiveShade,
                    context.interceptorAce
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Play Imperial Interceptor for free, Talzin's damage resolves before its own When Played ability
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.imperialInterceptor).toBeInZone('spaceArena');
                expect(context.motherTalzin.damage).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(7);

                // Resolve Imperial Interceptor's When Played ability
                expect(context.player1).toHavePrompt('Deal 3 damage to a space unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.tielnFighter,
                    context.imperialInterceptor,
                    context.avenger
                ]);
                context.player1.clickCard(context.avenger);
                expect(context.avenger.damage).toBe(3);
                expect(context.motherTalzin.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal damage to this unit when the played unit is a Night unit', function () {
                const { context } = contextRef;

                // Play Mother Talzin and Karis from discard
                context.player1.clickCard(context.motherTalzin);
                context.player1.clickCard(context.karis);

                // Karis is played, no damage dealt to Talzin
                expect(context.karis).toBeInZone('groundArena');
                expect(context.motherTalzin.damage).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal damage to this unit when the played unit is an Undead unit', function () {
                const { context } = contextRef;

                // Play Mother Talzin and Deceptive Shade from discard
                context.player1.clickCard(context.motherTalzin);
                context.player1.clickCard(context.deceptiveShade);

                // Deceptive Shade is played, no damage dealt to Talzin
                expect(context.deceptiveShade).toBeInZone('groundArena');
                expect(context.motherTalzin.damage).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should play a Pilot unit only as a unit and deal damage equal to its cost to this unit', function () {
                const { context } = contextRef;

                // Play Mother Talzin and Interceptor Ace from discard
                context.player1.clickCard(context.motherTalzin);
                context.player1.clickCard(context.interceptorAce);

                // Interceptor Ace is played as a unit, Talzin takes damage equal to its cost
                expect(context.interceptorAce).toBeInZone('groundArena');
                expect(context.tielnFighter).toHaveExactUpgradeNames([]);
                expect(context.motherTalzin.damage).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal damage to this unit when the player passes', function () {
                const { context } = contextRef;

                // Play Mother Talzin and pass on playing a unit
                context.player1.clickCard(context.motherTalzin);
                context.player1.clickPrompt('Pass');

                // Nothing is played, no damage dealt to Talzin
                expect(context.imperialInterceptor).toBeInZone('discard');
                expect(context.motherTalzin.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not deal damage to this unit when there is no legal unit in the discard pile', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mother-talzin#the-time-has-come'],
                    discard: [
                        'patrolling-aat',
                        'wampa',
                        'alliance-xwing'
                    ]
                },
                player2: {
                    discard: ['death-trooper']
                }
            });
            const { context } = contextRef;

            // Play Mother Talzin, no legal unit to play from discard
            context.player1.clickCard(context.motherTalzin);

            // Ability does nothing, no damage dealt to Talzin
            expect(context.motherTalzin).toBeInZone('groundArena');
            expect(context.motherTalzin.damage).toBe(0);
            expect(context.patrollingAat).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
