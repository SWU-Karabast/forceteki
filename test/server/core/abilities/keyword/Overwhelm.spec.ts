describe('Overwhelm keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Overwhelm keyword attacks,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [
                            'partisan-insurgent',
                            'specforce-soldier',
                            { card: 'battlefield-marine', upgrades: ['shield'] }
                        ],
                        hand: ['waylay']
                    }
                });
            });

            it('it deals any excess damage to the target\'s base', function () {
                const { context } = contextRef;

                // CASE 1: overwhelm damage applies
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.wampa.exhausted).toBe(true);

                context.player2.passAction();
                context.setDamage(context.wampa, 0);
                context.readyCard(context.wampa);
                context.setDamage(context.p2Base, 0);

                // CASE 2: shield prevents overwhelm
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(3);
                expect(context.wampa.exhausted).toBe(true);

                context.setDamage(context.wampa, 0);

                // CASE 3: overwhelm doesn't work when the unit is defending
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);

                context.setDamage(context.wampa, 0);
                context.readyCard(context.wampa);

                // CASE 4: no overwhelm damage if attacking base
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                context.player2.passAction();
                context.readyCard(context.wampa);
                context.setDamage(context.p2Base, 0);

                // CASE 5: no overwhelm damage if unit's hp is not exceeded
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.partisanInsurgent);
                expect(context.p2Base.damage).toBe(0);
            });

            it('after it was removed from play and played again it should only deal excess damage once', function() {
                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.wampa);
                context.readyCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.wampa.exhausted).toBe(true);
            });
        });

        describe('When a unit with the Overwhelm keyword attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            {
                                card: 'emperor-palpatine#master-of-the-dark-side',
                                upgrades: ['fallen-lightsaber']
                            },
                            'cloudrider'
                        ]
                    },
                    player2: {
                        hand: ['traitorous'],
                        groundArena: ['death-star-stormtrooper']
                    }
                });
            });

            it('and the unit is defeated before damage is resolved, all damage goes to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.p2Base.damage).toBe(9);
            });

            it('a stolen unit, and the unit is defeated before damage is resolved, all damage goes to the opponent\'s base', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 takes control of Cloud-Rider with Traitorous
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.cloudrider);
                expect(context.cloudrider).toBeInZone('groundArena', context.player2);

                // Emperor Palpatine attacks Cloud-Rider
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.cloudrider);

                expect(context.cloudrider).toBeInZone('discard', context.player1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(9);
            });
        });

        describe('When a unit with the Overwhelm and Ambush keyword attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['gor#grievouss-pet'],
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });
            });

            it('and the unit is defeated all damage goes to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.gorGrievoussPet);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(6); // 1 for stormtrooper, 6 for base
            });
        });

        describe('When conditional Overwhelm is lost before combat damage resolves', function() {
            // Ruling 2024: Overwhelm must be present at the moment combat damage is resolved for excess
            // damage to spill to the base. If a unit's Overwhelm was granted conditionally and the
            // condition stops being true before combat damage resolution, the unit no longer has
            // Overwhelm at that point, so excess damage is NOT dealt to the base.
            // NOTE: needs a concrete conditional-Overwhelm source that can be turned off mid-attack.
            xit('does not deal excess damage to the base if the attacker loses conditional Overwhelm before damage resolution', function () {
                // An attacker has Overwhelm granted by a conditional effect (e.g. "while <condition>,
                // this unit has Overwhelm") and attacks a defender it will over-kill. The condition
                // becomes false before the combat damage step resolves, so the attacker no longer has
                // Overwhelm and the excess damage does not carry over to the defending base.
            });
        });

        describe('When a defender is defeated by a replacement effect during an Overwhelm attack with two defenders', function() {
            // Ruling 2026-05-06: an Overwhelm attacker attacking two defenders calculates its full damage
            // against each. If the defending player uses a replacement effect (e.g. Queen Amidala,
            // Championing Her People: "you may defeat another friendly unit that shares a trait to
            // prevent that damage") to defeat one defender in order to prevent Amidala's own damage, the
            // defeated defender is defeated and dealt the attacker's full damage simultaneously — so the
            // excess (attacker power minus that defender's HP) carries to the base via Overwhelm, and the
            // attacker takes combat damage from BOTH defenders.
            xit('applies excess to the base and full return damage when Amidala defeats the other defender to prevent her own damage', function () {
                // Player A: Darth Maul (Revenge At Last) with Darth Maul's Lightsaber (gains Overwhelm,
                // attacks 2 units, power 9). Player B: Queen Amidala (Championing Her People, 5/3) and a
                // trait-sharing Furtive Handmaiden (2/2). Maul attacks both Amidala and the Handmaiden.
                // Player B uses Amidala's replacement to defeat the Handmaiden and prevent Amidala's
                // damage. The Handmaiden is defeated and dealt 9 simultaneously, so 7 excess is dealt to
                // Player B's base via Overwhelm, and Darth Maul takes 7 (2 from the Handmaiden + 5 from
                // Amidala).
            });
        });
    });
});
