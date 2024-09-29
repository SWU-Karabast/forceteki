describe('Jedha Agitator', function() {
    integration(function() {
        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should do nothing if no leader is deployed', function () {
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);
                expect(this.jedhaAgitator.exhausted).toBe(true);

                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 2 damage to a ground unit or base if a leader is deployed', function () {
                // ************** CASE 1: deal damage to a ground unit **************
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);

                expect(this.player1).toHaveEnabledPromptButton('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(this.player1).toHaveEnabledPromptButton('Saboteur: defeat all shields');
                expect(this.jedhaAgitator.exhausted).toBe(true);

                this.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.jedhaAgitator, this.battlefieldMarine, this.p1Base, this.p2Base, this.hunter]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(2);
                expect(this.p2Base.damage).toBe(2);

                expect(this.player2).toBeActivePlayer();
                this.player2.passAction();
                this.jedhaAgitator.exhausted = false;

                // ************** CASE 2: deal damage to base **************
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);
                this.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                this.player1.clickCard(this.p1Base);
                expect(this.jedhaAgitator.exhausted).toBe(true);
                expect(this.p1Base.damage).toBe(2);
                expect(this.p2Base.damage).toBe(4);

                this.player2.passAction();
                this.jedhaAgitator.exhausted = false;

                // ************** CASE 3: deal damage to self **************
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);
                this.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                this.player1.clickCard(this.jedhaAgitator);
                expect(this.jedhaAgitator).toBeInLocation('discard');
                expect(this.p1Base.damage).toBe(2);
                expect(this.p2Base.damage).toBe(4);     // attack did not resolve
            });
        });

        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should not prevent the Saboteur shield defeat if used to defeat itself', function () {
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.wampa);
                this.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                this.player1.clickCard(this.jedhaAgitator);

                expect(this.jedhaAgitator).toBeInLocation('discard');
                expect(this.wampa.isUpgraded()).toBe(false);
                expect(this.wampa.damage).toBe(0);
            });
        });
    });
});
