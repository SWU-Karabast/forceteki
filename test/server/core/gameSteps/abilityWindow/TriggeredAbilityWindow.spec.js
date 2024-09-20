describe('Simultaneous triggers', function() {
    integration(function() {
        describe('Chewbacca being attacked by Sabine', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    }
                });
            });

            it('should prompt the active player(controller of Sabine) which player\'s triggers to resolve first', function () {
                this.player1.clickCard(this.sabineWren);
                //Don't need to click Chewbacca due to sentinel
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(this.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                this.player1.clickPrompt('You');
                expect(this.chewbacca.exhausted).toBe(true);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base, this.chewbacca]);
                expect(this.chewbacca.damage).toBe(0);

                this.player1.clickCard(this.p1Base);
                expect(this.player2).toBeActivePlayer();
                expect(this.chewbacca.damage).toBe(2);
                expect(this.chewbacca.exhausted).toBe(false);
            });

            it('should have the triggers work in either order', function () {
                this.player1.clickCard(this.sabineWren);
                //Don't need to click Chewbacca due to sentinel
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(this.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                this.player1.clickPrompt('Opponent');
                expect(this.chewbacca.exhausted).toBe(false);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base, this.chewbacca]);
                expect(this.chewbacca.damage).toBe(0);

                this.player1.clickCard(this.p1Base);
                expect(this.player2).toBeActivePlayer();
                expect(this.chewbacca.damage).toBe(2);
                expect(this.chewbacca.exhausted).toBe(false);
            });
        });

        // TODO: test a unit that triggers on other units being defeated, being defeated at the same time as other units
        describe('Two units with a when defeated ability killing each other', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'yoda#old-master', damage: 3 }],
                        deck: ['wampa', 'vanquish', 'repair']
                    },
                    player2: {
                        groundArena: ['vanguard-infantry', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    }
                });
            });

            it('should let the active player choose which player\'s triggers happen first', function () {
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.vanguardInfantry);
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                this.player1.clickPrompt('You');

                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);
                expect(this.player1.hand.length).toBe(0);
                this.player1.clickPrompt('You');
                expect(this.player1.hand.length).toBe(1);

                expect(this.player2).toBeAbleToSelectExactly([this.allianceXwing, this.battlefieldMarine]);
                expect(this.allianceXwing).toHaveExactUpgradeNames([]);
                this.player2.clickCard(this.allianceXwing);
                expect(this.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(this.player2).toBeActivePlayer();
            });

            it('should have the triggers work in either order', function () {
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.vanguardInfantry);
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                this.player1.clickPrompt('Opponent');

                expect(this.player2).toBeAbleToSelectExactly([this.allianceXwing, this.battlefieldMarine]);
                expect(this.allianceXwing).toHaveExactUpgradeNames([]);
                this.player2.clickCard(this.allianceXwing);
                expect(this.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);
                expect(this.player1.hand.length).toBe(0);
                this.player1.clickPrompt('You');
                expect(this.player1.hand.length).toBe(1);

                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('The Leia leader\'s "Attack. Then, attack." activated ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst', 'battlefield-marine', 'fleet-lieutenant', { card: 'rebel-pathfinder', exhausted: true }],
                        spaceArena: ['tieln-fighter', 'alliance-xwing'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should have "on attack" triggers resolve after the whole ability', function () {
                // unit with trigger first
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Attack with a Rebel unit');
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.sundariPeacekeeper);
                // attack goes through, trigger is saved for later
                expect(this.sabineWren.damage).toBe(1);
                expect(this.sundariPeacekeeper.damage).toBe(2);

                // second attack
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.fleetLieutenant, this.allianceXwing]);
                this.player1.clickCard(this.allianceXwing);
                this.player1.clickCard(this.tieAdvanced);
                expect(this.allianceXwing).toBeInLocation('discard');
                expect(this.tieAdvanced).toBeInLocation('discard');

                // trigger from first attack
                expect(this.player1).toBeAbleToSelectExactly([this.sundariPeacekeeper, this.p1Base, this.p2Base]);
                expect(this.p2Base.damage).toBe(0);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(1);

                expect(this.player2).toBeActivePlayer();

                this.moveToNextActionPhase();
                // unit with trigger second
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Attack with a Rebel unit');
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.p2Base);

                // second attack
                expect(this.player1).toBeAbleToSelectExactly([this.sabineWren, this.fleetLieutenant, this.rebelPathfinder]);
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.sundariPeacekeeper);
                expect(this.sabineWren.damage).toBe(2);
                expect(this.sundariPeacekeeper.damage).toBe(4);
                // trigger from second attack
                expect(this.player1).toBeAbleToSelectExactly([this.sundariPeacekeeper, this.p1Base, this.p2Base]);
            });
        });
    });
});
