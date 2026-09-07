describe('Asajj Ventress, No Time for Regret', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Attack with a unit. For this attack, replace any Raid it has or gains with Restore, or vice versa';
        const raidToRestore = 'Replace Raid with Restore';
        const restoreToRaid = 'Replace Restore with Raid';

        describe('Asajj Ventress\'s leader side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#no-time-for-regret',
                        resources: 4,
                        base: { card: 'kestro-city', damage: 5 },
                        groundArena: [
                            'cantina-braggart',
                            'chandrilan-sponsor',
                            'sundari-peacekeeper',
                            'battlefield-marine',
                            { card: 'toydarian-technician', upgrades: ['clone-cohort'] }
                        ]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should replace Raid with Restore when that direction is chosen', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.cantinaBraggart,
                    context.chandrilanSponsor,
                    context.sundariPeacekeeper,
                    context.battlefieldMarine,
                    context.toydarianTechnician
                ]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player1).toHaveExactPromptButtons([raidToRestore, restoreToRaid]);
                context.player1.clickPrompt(raidToRestore);

                context.player1.clickCard(context.p2Base);

                // Raid 2 became Restore 2, so the braggart's 0 power is not buffed and the base is healed
                expect(context.p2Base.damage).toBe(0);
                expect(context.p1Base.damage).toBe(3);
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 attacks player2\'s base with Cantina Braggart and uses Asajj Ventress to apply a Raid-to-Restore replacement to Cantina Braggart for this attack',
                    'player1 uses Cantina Braggart to heal 2 damage from their base'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('should replace Restore with Raid when that direction is chosen', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.chandrilanSponsor);
                context.player1.clickPrompt(restoreToRaid);
                context.player1.clickCard(context.p2Base);

                // Restore 2 became Raid 2, so the base is not healed and the sponsor gets +2/+0
                expect(context.p2Base.damage).toBe(4);
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should leave the other keyword alone when the chosen direction does not apply', function() {
                const { context } = contextRef;

                // the braggart only has Raid, so replacing Restore with Raid does nothing
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.cantinaBraggart);
                context.player1.clickPrompt(restoreToRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should replace only one direction on a unit that has both keywords, stacking with the keyword it already had', function() {
                const { context } = contextRef;

                // Raid 2 becomes Restore 2 and stacks with the printed Restore 2, leaving Restore 4 and no Raid
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.sundariPeacekeeper);
                context.player1.clickPrompt(raidToRestore);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.p1Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should replace the other direction on a unit that has both keywords', function() {
                const { context } = contextRef;

                // Restore 2 becomes Raid 2 and stacks with the printed Raid 2, leaving Raid 4 and no Restore
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.sundariPeacekeeper);
                context.player1.clickPrompt(restoreToRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should replace Raid gained from an upgrade as well as printed Raid', function() {
                const { context } = contextRef;

                // printed Raid 1 and the upgrade's Raid 2 both become Restore, stacking with the printed Restore 1
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.toydarianTechnician);
                context.player1.clickPrompt(raidToRestore);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing extra when attacking with a unit that has neither keyword', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt(raidToRestore);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only replace keywords for the attack it initiates', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.chandrilanSponsor);
                context.player1.clickPrompt(restoreToRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
                expect(context.p1Base.damage).toBe(5);

                context.readyCard(context.chandrilanSponsor);
                context.player2.passAction();

                // on a normal attack the sponsor's printed Restore 2 works as usual
                context.player1.clickCard(context.chandrilanSponsor);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.p1Base.damage).toBe(3);
            });
        });

        describe('Asajj Ventress\'s leader unit side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#no-time-for-regret', deployed: true },
                        base: { card: 'kestro-city', damage: 5 },
                        groundArena: ['cantina-braggart']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should replace Raid with Restore without exhausting Asajj', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveExactPromptButtons([abilityTitle, 'Attack', 'Cancel']);
                context.player1.clickPrompt(abilityTitle);

                context.player1.clickCard(context.cantinaBraggart);
                context.player1.clickPrompt(raidToRestore);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(0);
                expect(context.p1Base.damage).toBe(3);
                expect(context.asajjVentress.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should replace Asajj\'s own Restore with Raid when she is the attacker', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt(abilityTitle);

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt(restoreToRaid);
                context.player1.clickCard(context.p2Base);

                // her printed Restore 2 became Raid 2, so she hits for 5 and heals nothing
                expect(context.p2Base.damage).toBe(5);
                expect(context.p1Base.damage).toBe(5);
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should keep Asajj\'s own Restore when the other direction is chosen', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt(abilityTitle);

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt(raidToRestore);
                context.player1.clickCard(context.p2Base);

                // she has no Raid to replace, so her printed Restore 2 still heals
                expect(context.p2Base.damage).toBe(3);
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
