describe('Study the Natural World', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-dairu', 'doji-challenger'],
                    hand: ['study-the-natural-world']
                },
                player2: {
                    inPlay: ['callow-delegate', 'akodo-toturi'],
                    provinces: ['tsuma', 'manicured-garden', 'toshi-ranbo'],
                    conflictDiscard: ['display-of-power']
                }
            });

            this.dairu = this.player1.findCardByName('bayushi-dairu');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.study = this.player1.findCardByName('study-the-natural-world');

            this.tsuma = this.player2.findCardByName('tsuma', 'province 1');
            this.manicured = this.player2.findCardByName('manicured-garden', 'province 2');
            this.ranbo = this.player2.findCardByName('toshi-ranbo', 'province 3');
            this.callow = this.player2.findCardByName('callow-delegate');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.dop = this.player2.findCardByName('display-of-power');
        });

        it('should not work out of conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.study);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should add province elements to the contested ring (single element province)', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [],
                province: this.manicured,
                ring: 'water'
            });

            this.player2.pass();
            expect(this.game.rings.water.hasElement('air')).toBe(false);
            expect(this.game.rings.water.hasElement('earth')).toBe(false);
            expect(this.game.rings.water.hasElement('fire')).toBe(false);
            expect(this.game.rings.water.hasElement('void')).toBe(false);
            expect(this.game.rings.water.hasElement('water')).toBe(true);

            this.player1.clickCard(this.study);
            expect(this.getChatLogs(10)).toContain('player1 plays Study the Natural World to add Air to the conflict ring. They may resolve all elements if they win the conflict');
            expect(this.game.rings.water.hasElement('air')).toBe(true);
            expect(this.game.rings.water.hasElement('earth')).toBe(false);
            expect(this.game.rings.water.hasElement('fire')).toBe(false);
            expect(this.game.rings.water.hasElement('void')).toBe(false);
            expect(this.game.rings.water.hasElement('water')).toBe(true);
        });

        it('should add province elements to the contested ring (multiple element province)', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            expect(this.game.rings.water.hasElement('air')).toBe(false);
            expect(this.game.rings.water.hasElement('earth')).toBe(false);
            expect(this.game.rings.water.hasElement('fire')).toBe(false);
            expect(this.game.rings.water.hasElement('void')).toBe(false);
            expect(this.game.rings.water.hasElement('water')).toBe(true);

            this.player1.clickCard(this.study);
            expect(this.getChatLogs(10)).toContain('player1 plays Study the Natural World to add Air and Fire to the conflict ring. They may resolve all elements if they win the conflict');
            expect(this.game.rings.water.hasElement('air')).toBe(true);
            expect(this.game.rings.water.hasElement('earth')).toBe(false);
            expect(this.game.rings.water.hasElement('fire')).toBe(true);
            expect(this.game.rings.water.hasElement('void')).toBe(false);
            expect(this.game.rings.water.hasElement('water')).toBe(true);
        });

        it('should add province elements to the contested ring (Toshi Ranbo)', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [],
                province: this.ranbo,
                ring: 'water'
            });

            this.player2.pass();
            expect(this.game.rings.water.hasElement('air')).toBe(false);
            expect(this.game.rings.water.hasElement('earth')).toBe(false);
            expect(this.game.rings.water.hasElement('fire')).toBe(false);
            expect(this.game.rings.water.hasElement('void')).toBe(false);
            expect(this.game.rings.water.hasElement('water')).toBe(true);

            this.player1.clickCard(this.study);
            expect(this.getChatLogs(10)).toContain('player1 plays Study the Natural World to add Air, Earth, Fire, Void and Water to the conflict ring. They may resolve all elements if they win the conflict');
            expect(this.game.rings.water.hasElement('air')).toBe(true);
            expect(this.game.rings.water.hasElement('earth')).toBe(true);
            expect(this.game.rings.water.hasElement('fire')).toBe(true);
            expect(this.game.rings.water.hasElement('void')).toBe(true);
            expect(this.game.rings.water.hasElement('water')).toBe(true);
        });

        it('should prompt you to resolve all elements if you win - separate from the standard resolution', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [this.callow],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Resolve Ring Effects?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');
        });

        it('should force you to resolve all elements if you say yes', function() {
            this.noMoreActions();
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;


            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [this.callow],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();
            this.player1.clickPrompt('Yes');

            expect(this.player1).toHavePrompt('Water Ring');
            expect(this.player1).not.toHavePromptButton('Don\'t Resolve');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Fire Ring');
            expect(this.player1).not.toHavePromptButton('Don\'t Resolve');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor Doji Challenger');
            expect(this.player1).toHavePrompt('Air Ring');
            expect(this.player1).not.toHavePromptButton('Don\'t Resolve');
            this.player1.clickPrompt('Take 1 honor from opponent');

            expect(this.challenger.bowed).toBe(true);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);
        });

        it('should skip a ring if there are no legal targets', function() {
            this.noMoreActions();
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;


            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [this.callow],
                province: this.tsuma,
                ring: 'water'
            });

            this.dairu.fate = 10;
            this.callow.fate = 10;
            this.challenger.fate = 10;
            this.toturi.fate = 10;

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();
            this.player1.clickPrompt('Yes');

            expect(this.player1).not.toHavePrompt('Water Ring');
            expect(this.player1).toHavePrompt('Fire Ring');
            expect(this.player1).not.toHavePromptButton('Don\'t Resolve');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor Doji Challenger');
            expect(this.player1).toHavePrompt('Air Ring');
            expect(this.player1).not.toHavePromptButton('Don\'t Resolve');
            this.player1.clickPrompt('Take 1 honor from opponent');

            expect(this.challenger.bowed).toBe(false);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);
        });

        it('should proceed to normal ring resolution after you resolve the extra window (and only let you resolve a single ring)', function() {
            this.noMoreActions();
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [this.callow],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor Doji Challenger');
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Take 1 honor from opponent');

            expect(this.challenger.bowed).toBe(true);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);

            expect(this.player1).toHavePrompt('Resolve Ring Effect');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');

            this.player1.clickRing('water');
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.challenger.bowed).toBe(false);
        });

        it('DoP - should let you resolve all rings and then let opponent resolve one', function() {
            this.noMoreActions();
            this.player2.moveCard(this.dop, 'hand');
            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();
            this.player1.clickPrompt('Yes');
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor Doji Challenger');
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Take 1 honor from opponent');

            expect(this.challenger.bowed).toBe(true);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.dop);
            this.player2.clickCard(this.dop);

            expect(this.player2).toHavePrompt('Resolve Ring Effect');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).not.toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).not.toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');

            this.player2.clickRing('water');
            expect(this.player2).toHavePrompt('Water Ring');
            this.player2.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.challenger.bowed).toBe(false);
        });

        it('should not resolve all elements if you lose', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.dairu],
                defenders: [this.toturi],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            this.player1.clickCard(this.study);
            this.noMoreActions();

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.toturi);
            expect(this.player2).toHavePrompt('Resolve Ring Effect');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).not.toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).not.toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');

            this.player2.clickRing('water');
            expect(this.player2).toHavePrompt('Water Ring');
            this.player2.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.challenger.bowed).toBe(true);
        });

        it('should not trigger without an attacking scholar', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.toturi],
                province: this.tsuma,
                ring: 'water'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.study);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not trigger on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.toturi],
                defenders: [this.dairu]
            });

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.study);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
