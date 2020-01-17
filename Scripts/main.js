/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

/*
 * -------------------------------------------
 * BASE CLASS
 * -------------------------------------------
 */

var Base = Class.extend({
	init: function (x, y) {
		this.setPosition(x || 0, y || 0);
		this.clearFrames();
		this.frameCount = 0;
	},
	setPosition: function (x, y) {
		this.x = x;
		this.y = y;
	},
	getPosition: function () {
		return {
			x: this.x,
			y: this.y
		};
	},
	setImage: function (img, x, y) {
		this.image = {
			path: img,
			x: x,
			y: y
		};
	},
	setSize: function (width, height) {
		this.width = width;
		this.height = height;
	},
	getSize: function () {
		return {
			width: this.width,
			height: this.height
		};
	},
	setupFrames: function (fps, frames, rewind, id) {
		if (id) {
			if (this.frameID === id)
				return true;

			this.frameID = id;
		}

		this.currentFrame = 0;
		this.frameTick = frames ? (1000 / fps / constants.interval) : 0;
		this.frames = frames;
		this.rewindFrames = rewind;
		return false;
	},
	clearFrames: function () {
		this.frameID = undefined;
		this.frames = 0;
		this.currentFrame = 0;
		this.frameTick = 0;
	},
	playFrame: function () {
		if (this.frameTick && this.view) {
			this.frameCount++;

			if (this.frameCount >= this.frameTick) {
				this.frameCount = 0;

				if (this.currentFrame === this.frames)
					this.currentFrame = 0;

				var $el = this.view;
				$el.css('background-position', '-' + (this.image.x + this.width * ((this.rewindFrames ? this.frames - 1 : 0) - this.currentFrame)) + 'px -' + this.image.y + 'px');
				this.currentFrame++;
			}
		}
	},
});

/*
 * -------------------------------------------
 * GAUGE CLASS
 * -------------------------------------------
 */
var Gauge = Base.extend({
	init: function (id, startImgX, startImgY, fps, frames, rewind) {
		this._super(0, 0);
		this.view = $('#' + id);
		this.setSize(this.view.width(), this.view.height());
		this.setImage(this.view.css('background-image'), startImgX, startImgY);
		this.setupFrames(fps, frames, rewind);
	},
});

/*
 * -------------------------------------------
 * LEVEL CLASS
 * -------------------------------------------
 */
var Level = Base.extend({
	init: function (id) {
		this.world = $('#' + id);
		this.nextCycles = 0;
		this._super(0, 0);
		this.active = false;
		this.figures = [];
		this.obstacles = [];
		this.decorations = [];
		this.items = [];
		this.coinGauge = new Gauge('coin', 0, 0, 10, 4, true);
		this.liveGauge = new Gauge('live',1, 422, 6, 6, true);
	},
	reload: function () {
		var settings = {};
		this.pause();

		for (var i = this.figures.length; i--;) {
			if (this.figures[i] instanceof Mario) {
				settings.lifes = this.figures[i].lifes - 1;
				settings.coins = this.figures[i].coins;
				break;
			}

		}

		

		if (settings.lifes < 0) {
			var audio = new Audio(AUDIOPATH +'gameover2.mp3');
			audio11.pause();
			$( document ).ready(function(){
					audio.play();
					
				$('#gameove').fadeIn('slow', function(){
				   $('#gameove').delay(6000).fadeOut(); 
				});
			});
setTimeout(() => {
	this.reset();
	location.reload();
	this.load(definedLevels[0]);
	}, 5000);
			

		} else {
			this.load(this.raw);

			for (var i = this.figures.length; i--;) {
				if (this.figures[i] instanceof Mario) {
					this.figures[i].setLifes(settings.lifes || 0);
					this.figures[i].setCoins(settings.coins || 0);
					break;
				}

			}

			
		}
		this.start();
		
	},
	reload2: function() {
		var settings = {};
		this.pause();
		
		for(var i = this.figures.length; i--; ) {
			if(this.figures[i] instanceof Mario2) {
				settings.lifes = this.figures[i].lifes - 1;
				settings.coins = this.figures[i].coins;
				break;
			}
		
		}
		
		this.reset();
		
		if(settings.lifes < 0) {
			this.load(definedLevels[0]);
		} else {		
			this.load(this.raw);
			
			for(var i = this.figures.length; i--; ) {
				if(this.figures[i] instanceof Mario2) {
					this.figures[i].setLifes(settings.lifes || 0);
					this.figures[i].setCoins(settings.coins || 0);
					break;
				}
			
			}
			
		
		}
		
		this.start2();
	},

	load: function (level) {
		if (this.active) {
			if (this.loop)
				this.pause();

			this.reset();
		}

		this.setPosition(0, 0);
		this.setSize(level.width * 32, level.height * 32);
		this.setImage(level.background);
		this.raw = level;
		this.id = level.id;
		this.active = true;
		var data = level.data;

		for (var i = 0; i < level.width; i++) {
			var t = [];

			for (var j = 0; j < level.height; j++) {
				t.push('');
			}

			this.obstacles.push(t);
		}

		for (var i = 0, width = data.length; i < width; i++) {
			var col = data[i];

			for (var j = 0, height = col.length; j < height; j++) {
				if (reflection[col[j]])
					new(reflection[col[j]])(i * 32, (height - j - 1) * 32, this);
			}
		}
	},
	next: function () {
		this.nextCycles = Math.floor(7000 / constants.interval  );

	},
	nextLoad: function () {
		if (this.nextCycles)
			return;

		var settings = {};
		this.pause();

		for (var i = this.figures.length; i--;) {
			if (this.figures[i] instanceof Mario) {
				settings.lifes = this.figures[i].lifes;
				settings.coins = this.figures[i].coins;
				settings.state = this.figures[i].state;
				settings.marioState = this.figures[i].marioState;
				break;
			}


		}


		this.reset();
		this.load(definedLevels[this.id + 1]);

		for (var i = this.figures.length; i--;) {
			if (this.figures[i] instanceof Mario) {
				this.figures[i].setLifes(settings.lifes || 0);
				this.figures[i].setCoins(settings.coins || 0);
				this.figures[i].setState(settings.state || size_states.small);
				this.figures[i].setMarioState(settings.marioState || mario_states.normal);
				break;
			}

		}


		this.start();
	},
	nextLoad2: function () {
		if (this.nextCycles)
			return;

		var settings = {};
		this.pause();

		for (var i = this.figures.length; i--;) {


			if (this.figures[i] instanceof Mario2) {
				settings.lifes = this.figures[i].lifes;
				settings.coins = this.figures[i].coins;
				settings.state = this.figures[i].state;
				settings.marioState = this.figures[i].marioState;
				break;
			}

		}


		this.reset();
		this.load(definedLevels[this.id + 1]);

		for (var i = this.figures.length; i--;) {


			if (this.figures[i] instanceof Mario2) {
				this.figures[i].setLifes(settings.lifes || 0);
				this.figures[i].setCoins(settings.coins || 0);
				this.figures[i].setState(settings.state || size_states.small);
				this.figures[i].setMarioState(settings.marioState || mario_states.normal);
				break;
			}

		}


		this.start2();
	},
	getGridWidth: function () {
		return this.raw.width;
	},
	getGridHeight: function () {
		return this.raw.height;
	},
	setSounds: function (manager) {
		this.sounds = manager;
	},
	playSound: function (label) {
		if (this.sounds)
			this.sounds.play(label);
	},
	playMusic: function (label) {
		if (this.sounds)
			this.sounds.sideMusic(label);
	},
	reset: function () {
		this.active = false;
		this.world.empty();
		this.figures = [];
		this.obstacles = [];
		this.items = [];
		this.decorations = [];
	},
	tick: function () {
		if (this.nextCycles) {
			this.nextCycles--;
			this.nextLoad();
			return;
		}

		var i = 0,
			j = 0,
			figure, opponent;
		
		for (i = this.figures.length; i--;) {
			figure = this.figures[i];
			
			if (figure.dead) {
				
				if (!figure.death()) {
					if (figure instanceof Mario){
						return this.reload();
					}
					figure.view.remove();
					this.figures.splice(i, 1);
					
				} else
					figure.playFrame();
			} else {
				
				if (i) {
					
					for (j = i; j--;) {
						if (figure.dead)
							break;

						opponent = this.figures[j];

						if (!opponent.dead && q2q(figure, opponent)) {
							figure.hit(opponent);
							opponent.hit(figure);
						}
					}
				}
			}

			if (!figure.dead) {
				figure.move();
				figure.playFrame();
			}
		}


		for (i = this.items.length; i--;)
			this.items[i].playFrame();

		this.coinGauge.playFrame();
		this.liveGauge.playFrame();
	},
	tick2: function () {
		if (this.nextCycles) {
			this.nextCycles--;
			this.nextLoad2();
			return;
		}

		var i = 0,
			j = 0,
			figure, opponent2;

		for (i = this.figures.length; i--;) {
			figure = this.figures[i];

			if (figure.dead) {
				if (!figure.death()) {
					if (figure instanceof Mario2)
						return this.reload2();

					figure.view.remove();
					this.figures.splice(i, 1);
				} else
					figure.playFrame();
			} else {
				if (i) {
					for (j = i; j--;) {
						if (figure.dead)
							break;

						opponent2 = this.figures[j];

						if (!opponent2.dead && q2q2(figure, opponent2)) {
							figure.hit(opponent2);
							opponent2.hit(figure);
						}
					}
				}
			}

			if (!figure.dead) {
				figure.move();
				figure.playFrame();
			}
		}


		for (i = this.items.length; i--;)
			this.items[i].playFrame();

		this.coinGauge.playFrame();
		this.liveGauge.playFrame();
	},
	start: function () {
		var me = this;
		me.loop = setInterval(function () {
			me.tick.apply(me);
		},
		 constants.interval );
	},
	start2: function () {
		var me2 = this;
		me2.loop = setInterval(function () {
			me2.tick2.apply(me2);
		}, constants.interval );
	},
	pause: function () {
		clearInterval(this.loop);
		this.loop = undefined;
	},
	setPosition: function (x, y) {
		this._super(x, y);
		this.world.css('left', -x);
	},
	setImage: function (index) {
		var img = BASEPATH + 'backgrounds/' + ((index < 10 ? '0' : '') + index) + '.png';
		this.world.parent().css({
			backgroundImage: c2u(img),
			backgroundPosition: '0 -380px'
		});
		this._super(img, 0, 0);
	},
	setSize: function (width, height) {
		this._super(width, height);
	},
	setParallax: function (x) {
		this.setPosition(x, this.y);
		this.world.parent().css('background-position', '-' + Math.floor(x / 1) + 'px -80px'); /** background image fixation */
	},
});

/*
 * -------------------------------------------
 * FIGURE CLASS
 * -------------------------------------------
 */
var Figure = Base.extend({
	init: function (x, y, level) {
		this.view = $(DIV).addClass(CLS_FIGURE).appendTo(level.world);
		this.dx = 0;
		this.dy = 0;
		this.dead = false;
		this.onground = true;
		this.setState(size_states.small);
		this.setVelocity(0, 0);
		this.direction = directions.none;
		this.level = level;
		this._super(x, y);
		level.figures.push(this);
	},
	setState: function (state) {
		this.state = state;
	},
	setImage: function (img, x, y) {
		this.view.css({
			backgroundImage: img ? c2u(img) : 'none',
			backgroundPosition: '-' + (x || 0) + 'px -' + (y || 0) + 'px',
		});
		this._super(img, x, y);
	},
	setOffset: function (dx, dy) {
		this.dx = dx;
		this.dy = dy;
		this.setPosition(this.x, this.y);
	},
	setPosition: function (x, y) {
		this.view.css({
			left: x,
			bottom: y,
			marginLeft: this.dx,
			marginBottom: this.dy,
			
			
		});
		this._super(x, y);
		this.setGridPosition(x, y);
	},
	setSize: function (width, height) {
		this.view.css({
			width: width,
			height: height
		});
		this._super(width, height);
	},
	setGridPosition: function (x, y) {
		this.i = Math.floor((x + 16) / 32);
		this.j = Math.ceil(this.level.getGridHeight() - 1 - y / 32);

		if (this.j > this.level.getGridHeight())
			this.die();
	},
	getGridPosition: function (x, y) {
		return {
			i: this.i,
			j: this.j
		};
	},
	setVelocity: function (vx, vy) {
		this.vx = vx;
		this.vy = vy;

		if (vx > 0)
			this.direction = directions.right;
		else if (vx < 0)
			this.direction = directions.left;
	},
	getVelocity: function () {
		return {
			vx: this.vx,
			vy: this.vy
		};
	},
	hit: function (opponent) {

	},


	collides: function (is, ie, js, je, blocking) {
		var isHero = this instanceof Hero;



		if (is < 0 || ie >= this.level.obstacles.length)
			return true;

		if (js < 0 || je >= this.level.getGridHeight())
			return false;

		for (var i = is; i <= ie; i++) {
			for (var j = je; j >= js; j--) {
				var obj = this.level.obstacles[i][j];

				if (obj) {
					if (obj instanceof Item && isHero && (blocking === ground_blocking.bottom || obj.blocking === ground_blocking.none))
						obj.activate(this);

					if ((obj.blocking & blocking) === blocking)
						return true;
				}
			}
		}

		return false;
	},
	move: function () {
		var vx = this.vx;
		var vy = this.vy - constants.gravity;

		var s = this.state;
		if (s > 2) s = 2;

		var x = this.x;
		var y = this.y;
		var dx = Math.sign(vx);
		var dy = Math.sign(vy);

		var is = this.i;
		var ie = is;

		var js = Math.ceil(this.level.getGridHeight() - s - (y + 31) / 32);
		var je = this.j;

		var d = 0,
			b = ground_blocking.none;
		var onground = false;
		var t = Math.floor((x + 16 + vx) / 32);

		if (dx > 0) {
			d = t - ie;
			t = ie;
			b = ground_blocking.left;
		} else if (dx < 0) {
			d = is - t;
			t = is;
			b = ground_blocking.right;
		}

		x += vx;

		for (var i = 0; i < d; i++) {
			if (this.collides(t + dx, t + dx, js, je, b)) {
				vx = 0;
				x = t * 32 + 15 * dx;
				break;
			}

			t += dx;
			is += dx;
			ie += dx;
		}

		if (dy > 0) {
			t = Math.ceil(this.level.getGridHeight() - s - (y + 31 + vy) / 32);
			d = js - t;
			t = js;
			b = ground_blocking.bottom;
		} else if (dy < 0) {
			t = Math.ceil(this.level.getGridHeight() - 1 - (y + vy) / 32);
			d = t - je;
			t = je;
			b = ground_blocking.top;
		} else
			d = 0;

		y += vy;

		for (var i = 0; i < d; i++) {
			if (this.collides(is, ie, t - dy, t - dy, b)) {
				onground = dy < 0;
				vy = 0;
				y = this.level.height - (t + 1) * 32 - (dy > 0 ? (s - 1) * 32 : 0);
				break;
			}

			t -= dy;
		}

		this.onground = onground;
		this.setVelocity(vx, vy);
		this.setPosition(x, y);
	},
	death: function () {
		return false;
	},
	die: function () {
		this.dead = true;
	},
});

/*
 * -------------------------------------------
 * MATTER CLASS
 * -------------------------------------------
 */
var Matter = Base.extend({
	init: function (x, y, blocking, level) {
		this.blocking = blocking;
		this.view = $(DIV).addClass(CLS_MATTER).appendTo(level.world);
		this.level = level;
		this._super(x, y);
		this.setSize(32, 32);
		this.addToGrid(level);
	},
	addToGrid: function (level) {
		level.obstacles[this.x / 32][this.level.getGridHeight() - 1 - this.y / 32] = this;
	},
	setImage: function (img, x, y) {
		this.view.css({
			backgroundImage: img ? c2u(img) : 'none',
			backgroundPosition: '-' + (x || 0) + 'px -' + (y || 0) + 'px',
		});
		this._super(img, x, y);
	},
	setPosition: function (x, y) {
		this.view.css({
			left: x,
			bottom: y
		});
		this._super(x, y);
	},
});

/*
 * -------------------------------------------
 * GROUND CLASS
 * -------------------------------------------
 */
var Ground = Matter.extend({
	init: function (x, y, blocking, level) {
		this._super(x, y, blocking, level);
	},
});

/*
 * -------------------------------------------
 * GRASS CLASSES
 * -------------------------------------------
 */
var TopGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 888, 404);
	},
}, 'grass_top');
var TopRightGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.top + ground_blocking.right;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 404);
	},
}, 'grass_top_right');
var TopLeftGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.left + ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 404);
	},
}, 'grass_top_left');
var RightGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.right;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 438);
	},
}, 'grass_right');
var LeftGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.left;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 438);
	},
}, 'grass_left');
var TopRightRoundedGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 506);
	},
}, 'grass_top_right_rounded');
var TopLeftRoundedGrass = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 506);
	},
}, 'grass_top_left_rounded');

/*
 * -------------------------------------------
 * STONE CLASSES
 * -------------------------------------------
 */
var Stone = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 550, 160);
	},
}, 'stone');
var BrownBlock = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 514, 194);
	},
}, 'brown_block');

/*
 * -------------------------------------------
 * PIPE CLASSES
 * -------------------------------------------
 */
var RightTopPipe = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 36, 358);
	},
}, 'pipe_top_right');
var LeftTopPipe = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 2, 358);
	},
}, 'pipe_top_left');
var RightPipe = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.right + ground_blocking.bottom;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 36, 390);
	},
}, 'pipe_right');
var LeftPipe = Ground.extend({
	init: function (x, y, level) {
		var blocking = ground_blocking.left + ground_blocking.bottom;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 2, 390);
	},
}, 'pipe_left');

/*
 * -------------------------------------------
 * DECORATION CLASS
 * -------------------------------------------
 */
var Decoration = Matter.extend({
	init: function (x, y, level) {
		this._super(x, y, ground_blocking.none, level);
		level.decorations.push(this);
	},
	setImage: function (img, x, y) {
		this.view.css({
			backgroundImage: img ? c2u(img) : 'none',
			backgroundPosition: '-' + (x || 0) + 'px -' + (y || 0) + 'px',
		});
		this._super(img, x, y);
	},
	setPosition: function (x, y) {
		this.view.css({
			left: x,
			bottom: y
		});
		this._super(x, y);
	},
});

/*
 * -------------------------------------------
 * DECORATION GRASS CLASSES
 * -------------------------------------------
 */
var TopRightCornerGrass = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 612, 868);
	},
}, 'grass_top_right_corner');
var TopLeftCornerGrass = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 648, 868);
	},
}, 'grass_top_left_corner');

/*
 * -------------------------------------------
 * SOIL CLASSES
 * -------------------------------------------
 */
var Soil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 888, 438);
	},
}, 'soil');
var RightSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 922, 540);
	},
}, 'soil_right');
var LeftSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 854, 540);
	},
}, 'soil_left');

/*
 * -------------------------------------------
 * BUSH CLASSES
 * -------------------------------------------
 */
var RightBush = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 382, 928);
	},
}, 'bush_right');
var RightMiddleBush = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 314, 928);
	},
}, 'bush_middle_right');
var MiddleBush = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 348, 928);
	},
}, 'bush_middle');
var LeftMiddleBush = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 212, 928);
	},
}, 'bush_middle_left');
var LeftBush = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 178, 928);
	},
}, 'bush_left');

/*
 * -------------------------------------------
 * GRASS-SOIL CLASSES
 * -------------------------------------------
 */
var TopRightGrassSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 990, 506);
	},
}, 'grass_top_right_rounded_soil');
var TopLeftGrassSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 956, 506);
	},
}, 'grass_top_left_rounded_soil');

/*
 * -------------------------------------------
 * PLANTED SOIL CLASSES
 * -------------------------------------------
 */
var RightPlantedSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 782, 832);
	},
}, 'planted_soil_right');
var MiddlePlantedSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 748, 832);
	},
}, 'planted_soil_middle');
var LeftPlantedSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 714, 832);
	},
}, 'planted_soil_left');

/*
 * -------------------------------------------
 * PIPE DECORATION
 * -------------------------------------------
 */
var RightPipeGrass = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 36, 424);
	},
}, 'pipe_right_grass');
var LeftPipeGrass = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 2, 424);
	},
}, 'pipe_left_grass');
var RightPipeSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 36, 458);
	},
}, 'pipe_right_soil');
var LeftPipeSoil = Decoration.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 2, 458);
	},
}, 'pipe_left_soil');

/*
 * -------------------------------------------
 * ITEM CLASS
 * -------------------------------------------
 */
var Item = Matter.extend({
	init: function (x, y, isBlocking, level) {
		this.isBouncing = false;
		this.bounceCount = 0;
		this.bounceFrames = Math.floor(50 / constants.interval);
		this.bounceStep = Math.ceil(10 / this.bounceFrames);
		this.bounceDir = 1;
		this.isBlocking = isBlocking;
		this._super(x, y, isBlocking ? ground_blocking.all : ground_blocking.none, level);
		this.activated = false;
		this.addToLevel(level);
	},
	addToLevel: function (level) {
		level.items.push(this);
	},
	activate: function (from) {
		this.activated = true;
	},
	bounce: function () {
		this.isBouncing = true;

		for (var i = this.level.figures.length; i--;) {
			var fig = this.level.figures[i];

			if (fig.y === this.y + 32 && fig.x >= this.x - 16 && fig.x <= this.x + 16) {
				if (fig instanceof ItemFigure)
					fig.setVelocity(fig.vx, constants.bounce);
				else
					fig.die();
			}
		}
	},
	playFrame: function () {
		if (this.isBouncing) {
			this.view.css({
				'bottom': (this.bounceDir > 0 ? '+' : '-') + '=' + this.bounceStep + 'px'
			});
			this.bounceCount += this.bounceDir;

			if (this.bounceCount === this.bounceFrames)
				this.bounceDir = -1;
			else if (this.bounceCount === 0) {
				this.bounceDir = 1;
				this.isBouncing = false;
			}
		}

		this._super();
	},
});

/*
 * -------------------------------------------
 * COIN CLASSES
 * -------------------------------------------
 */
var Coin = Item.extend({
	init: function (x, y, level) {
		this._super(x, y, false, level);
		this.setImage(images.objects, 0, 0);
		this.setupFrames(10, 4, true);
	},
	activate: function (from) {
		var audio = new Audio(AUDIOPATH +'coin1.mp3');

		if (!this.activated) {
			audio.play();
			from.addCoin();
			this.remove();
		}
		this._super(from);
	},
	remove: function () {
		this.view.remove();
	},
}, 'coin');
var CoinBoxCoin = Coin.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 96, 0);
		this.clearFrames();
		this.view.hide();
		this.count = 0;
		this.frames = Math.floor(150 / constants.interval);
		this.step = Math.ceil(30 / this.frames);
	},
	remove: function () {},
	addToGrid: function () {},
	addToLevel: function () {},
	activate: function (from) {
		this._super(from);
		this.view.show().css({
			'bottom': '+=8px'
		});
	},
	act: function () {
		this.view.css({
			'bottom': '+=' + this.step + 'px'
		});
		this.count++;
		return (this.count === this.frames);
	},
});
var CoinBox = Item.extend({
	init: function (x, y, level, amount) {
		this._super(x, y, true, level);
		this.setImage(images.objects, 346, 328);
		this.setAmount(amount || 1);
	},
	setAmount: function (amount) {
		this.items = [];
		this.actors = [];

		for (var i = 0; i < amount; i++)
			this.items.push(new CoinBoxCoin(this.x, this.y, this.level));
	},
	activate: function (from) {
		if (!this.isBouncing) {
			if (this.items.length) {
				this.bounce();
				var coin = this.items.pop();
				coin.activate(from);
				this.actors.push(coin);

				if (!this.items.length)
					this.setImage(images.objects, 514, 194);
			}
		}

		this._super(from);
	},
	playFrame: function () {
		for (var i = this.actors.length; i--;) {
			if (this.actors[i].act()) {
				this.actors[i].view.remove();
				this.actors.splice(i, 1);
			}
		}

		this._super();
	},
}, 'coinbox');
var MultipleCoinBox = CoinBox.extend({
	init: function (x, y, level) {
		this._super(x, y, level, 8);
	},
}, 'multiple_coinbox');

/*
 * -------------------------------------------
 * ITEMFIGURE CLASS
 * -------------------------------------------
 */
var ItemFigure = Figure.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
	},
});

/*
 * -------------------------------------------
 * STARBOX CLASS
 * -------------------------------------------
 */
var StarBox = Item.extend({
	init: function (x, y, level) {
		this._super(x, y, true, level);
		this.setImage(images.objects, 96, 33);
		this.star = new Star(x, y, level);
		this.setupFrames(8, 4, false);
	},
	activate: function (from) {
		if (!this.activated) {
			this.star.release();
			this.clearFrames();
			this.bounce();
			this.setImage(images.objects, 514, 194);
		}

		this._super(from);
	},
}, 'starbox');
var Star = ItemFigure.extend({
	init: function (x, y, level) {
		this._super(x, y + 32, level);
		this.active = false;
		this.setSize(32, 32);
		this.setImage(images.objects, 32, 69);
		this.view.hide();
	},
	release: function () {
		this.taken = 4;
		this.active = true;
		this.level.playSound('mushroom');
		this.view.show();
		this.setVelocity(constants.star_vx, constants.star_vy);
		this.setupFrames(10, 2, false);
	},
	collides: function (is, ie, js, je, blocking) {
		return false;
	},
	move: function () {
		if (this.active) {
			this.vy += this.vy <= -constants.star_vy ? constants.gravity : constants.gravity / 2;
			this._super();
		}

		if (this.taken)
			this.taken--;
	},
	hit: function (opponent) {
		if (!this.taken && this.active && opponent instanceof Mario) {
			opponent.invincible();
			this.die();
		}
	},
	hit2: function (opponent2) {
		if (!this.taken && this.active && opponent2 instanceof Mario2) {
			opponent2.invincible();
			this.die();
		}
	},
});

/*
 * -------------------------------------------
 * MUSHROOMBOX CLASS
 * -------------------------------------------
 */
var MushroomBox = Item.extend({
	init: function (x, y, level) {
		this._super(x, y, true, level);
		this.setImage(images.objects, 96, 33);
		this.max_mode = mushroom_mode.plant;
		this.mushroom = new Mushroom(x, y, level);
		this.setupFrames(8, 4, false);
	},
	activate: function (from) {
		if (!this.activated) {
			if (from.state === size_states.small || this.max_mode === mushroom_mode.mushroom) {

				this.mushroom.release(mushroom_mode.mushroom);


				}
				 else if (from.state === size_states.big || this.max_mode === mushroom_mode.mushroom_1) {
				this.mushroom.release(mushroom_mode.mushroom_1);


			} 
			else if (from.state === size_states.Vbig || this.max_mode === mushroom_mode.mushroom_2) {
				this.mushroom.release(mushroom_mode.mushroom_2);
				

			} else if (from.state === size_states.vvBig || this.max_mode === mushroom_mode.plant) {
				this.mushroom.release(mushroom_mode.plant);

			
			}

			this.clearFrames();
			this.bounce();
			this.setImage(images.objects, 514, 194);
		}

		this._super(from);
	},
}, 'mushroombox');
var Mushroom = ItemFigure.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.active = false;
		this.setSize(32, 32);
		this.released = 0;
		this.view.css('z-index', 94).hide();
	},
	release: function (mode) {
		this.released = 4;
		this.level.playSound('mushroom');
		if (mode === mushroom_mode.mushroom)
			{this.setSize(32 , 48 );
			this.setImage(images.objects, 622, 248);}
		else if (mode === mushroom_mode.mushroom_1)
			this.setImage(images.objects, 616, 60);
		
		else if (mode === mushroom_mode.mushroom_2)
				{	this.setSize(39 , 35 );
				this.setImage(images.objects, 647, 57);}

		else
			{var audio = new Audio(AUDIOPATH +'plantgrow.mp3');
			audio.play();
				this.setSize(30 , 41 );
			this.setImage(images.objects, 588, 255);}


		this.mode = mode;
		this.view.show();
	},
	move: function () {
		if (this.active) {
			this._super();

			if (this.mode === mushroom_mode.mushroom && this.vx === 0)
				this.setVelocity(this.direction === directions.right ? -constants.mushroom_v : constants.mushroom_v, this.vy);
		} else if (this.released) {
			this.released--;
			this.setPosition(this.x, this.y +30);

			if (!this.released) {
				this.active = true;
				this.view.css('z-index', 99);

				if (this.mode === mushroom_mode.mushroom)
					this.setVelocity(constants.mushroom_v, constants.gravity);
					
			}
		}
		if (this.active) {
			this._super();

			if (this.mode === mushroom_mode.mushroom_1 && this.vx === 0)
				this.setVelocity(this.direction === directions.right ? -constants.mushroom_v : constants.mushroom_v, this.vy);
		} else if (this.released) {
			this.released--;
			this.setPosition(this.x, this.y +30);

			if (!this.released) {
				this.active = true;
				this.view.css('z-index', 99);

				if (this.mode === mushroom_mode.mushroom_1)
					this.setVelocity(constants.mushroom_v, constants.gravity);
					
			}
		}
		if (this.active) {
			this._super();

			if (this.mode === mushroom_mode.mushroom_2 && this.vx === 0)
				this.setVelocity(this.direction === directions.right ? -constants.mushroom_v : constants.mushroom_v, this.vy);
		} else if (this.released) {
			this.released--;
			this.setPosition(this.x, this.y +30);

			if (!this.released) {
				this.active = true;
				this.view.css('z-index', 99);

				if (this.mode === mushroom_mode.mushroom_2)
					this.setVelocity(constants.mushroom_v, constants.gravity);
					
			}
		}
	},
	hit: function (opponent) {
		if (this.active && opponent instanceof Mario) {
			if ((this.mode === mushroom_mode.mushroom))
			{	opponent.grow();
				var notification = alertify.notify('Youpi ! L\'hôte a pris un antibiotique sans prescription médicale ! Nouveau gène de résistance acquis !', 'success', 5, function () {
					});
					setTimeout(() => {
						var notification = alertify.notify('Vous êtes sur la bonne voie ! Il faut collecter encore plus de gènes de résistance !', 'success', 5, function () {
						});
						}, 5000);

				} 
				 
			else if (this.mode === mushroom_mode.mushroom_1)
			{	opponent.grow2();
				var notification = alertify.notify('Super ! L\'hôte se sent mieux et n\'a pas fini son traitement antibiotique tel que prescrit ! Mutation déclenchée !', 'success', 5, function () {
					});
				}
			else if (this.mode === mushroom_mode.mushroom_2)
			{		opponent.grow3();
					var notification = alertify.notify('Génial ! L\'hôte a pris le reste des antibiotiques que son conjoint n\'a pas terminé ! Nouveau gène de résistance acquis !','success', 5, function () {
					
					});
				setTimeout(() => {
					var notification = alertify.notify('Extra ! Encore un effort et vous deviendrez une BMR !Vous êtes sur la bonne voie ! Il faut collecter encore plus de gènes de résistance !','success', 5, function () {
					
					});
				},3500);
				}
			else if (this.mode === mushroom_mode.plant)
			{	opponent.shooter();
				var notification = alertify.notify('Chouette ! L\'hôte a raté plusieurs doses de son antibiotique ! Mutation déclenchée !', 'success', 5, function () {
					});
				}
			this.die();


		}
	},
	hit2: function (opponent2) {
		if (this.active && opponent2 instanceof Mario2) {
			if (this.mode === mushroom_mode.mushroom)
				{opponent2.grow();
				
				}
			else if (this.mode === mushroom_mode.plant)
				opponent2.shooter();

			this.die();
		}
	},
});

/*
 * -------------------------------------------
 * BULLET CLASS
 * -------------------------------------------
 */
var Bullet = Figure.extend({
	init: function (parent) {
		this._super(parent.x + 31, parent.y + 14, parent.level);
		this.parent = parent;
		this.setImage(images.sprites, 191, 366);
		this.setSize(16, 16);
		this.direction = parent.direction;
		this.vy = 0;
		this.life = Math.ceil(2000 / constants.interval);
		this.speed = constants.bullet_v;
		this.vx = this.direction === directions.right ? this.speed : -this.speed;
	},
	setVelocity: function (vx, vy) {
		this._super(vx, vy);

		if (this.vx === 0) {
			var s = this.speed * Math.sign(this.speed);
			this.vx = this.direction === directions.right ? -s : s;
		}

		if (this.onground)
			this.vy = constants.bounce;
	},
	move: function () {
		if (--this.life)
			this._super();
		else
			this.die();
	},
	hit: function (opponent) {
		if (!(opponent instanceof Mario)) {
			opponent.die();
			this.die();
		}
	},
	hit2: function (opponent2) {
		if (!(opponent2 instanceof Mario2)) {
			opponent2.die();
			this.die();
		}
	}
});

/*
 * -------------------------------------------
 * HERO CLASS
 * -------------------------------------------
 */
var Hero = Figure.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
	},
});

/*
 * -------------------------------------------
 * MARIO CLASS
 * -------------------------------------------
 */
var Mario = Hero.extend({
	init: function (x, y, level) {
		this.standSprites = [
			[
				[{x: 0,y: 82}, {x: 481,y: 84}],[{x: 81,y: 0}, {x: 561,y: 84}]],
			[[{x: 0,y: 161}, {x: 481,y: 244}],[{x: 81,y: 241}, {x: 561,y: 247}]],
			[[{x: 0,y: 483}, {x: 481,y: 568}],[{x: 81,y: 566}, {x: 561,y: 568}]],
			[[{x: 0,y: 804}, {x: 481,y: 895}],[{x: 81,y: 895}, {x: 561,y: 895}]],
			[[{x: 0,y: 1174}, {x: 481,y: 1261}],[{x: 81,y: 1258}, {x: 561,y: 1261}]]
			
			];
		this.crouchSprites = [
			[{x: 241,y: 0}, {x: 161,y: 0}],
			[{x: 241,y: 165}, {x: 241,y: 244}],
			[{x: 241,y: 482}, {x: 241,y: 566}],
			[{x: 241,y: 807}, {x: 241,y: 895}],
			[{x: 241,y: 1176}, {x: 241,y: 1258}]

		];
		this.deadly = 0;
		this.invulnerable = 0;
		this.width = 80;
		this._super(x, y, level);
		this.blinking = 0;
		this.setOffset(-24, 0);
		this.setSize(80, 80);
		this.cooldown = 0;
		this.setMarioState(mario_states.normal);
		this.setLifes(constants.start_lives);
		this.setCoins(0);
		this.deathBeginWait = Math.floor(700 / constants.interval);
		this.deathEndWait = 0;
		this.deathFrames = Math.floor(600 / constants.interval);
		this.deathStepUp = Math.ceil(200 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
		this.direction = directions.right;
		this.setImage(images.sprites, 81, 0);
		this.crouching = false;
		this.fast = false;
	},
	setMarioState: function (state) {
		this.marioState = state;
	},
	setState: function (state) {
		if (state !== this.state) {
			this.setMarioState(mario_states.normal);
			this._super(state);
		}
	},
	setPosition: function (x, y) {
		this._super(x, y);
		var r = this.level.width - 640;
		var w = (this.x <= 210) ? 0 : ((this.x >= this.level.width - 230) ? r : r / (this.level.width - 440) * (this.x - 210));
		this.level.setParallax(w);
		if (this.onground && this.x >= this.level.width - 130)
			this.victory();
			
	},

	input: function (keys) {
		this.fast = keys.accelerate;
		this.crouching = keys.down;

		if (!this.crouching) {
			if (this.onground && keys.up)
				this.jump();

			if (keys.firee && this.marioState === mario_states.fire)
				this.shoot();

			if (keys.right || keys.left)
				this.walk(keys.left, keys.accelerate);
			else
				this.vx = 0;
		}
	},
	victory: function () {
		this.level.playMusic('success');
		this.clearFrames();
		this.view.show();
	
			
		if (this.state === size_states.small)
		{
			this.setImage(images.sprites, 242, 86); 
			}
		else if (this.state === size_states.big)
		{
			this.setImage(images.sprites, 161, 86); 
			}	
		else  if (this.state === size_states.Vbig)
		{
			this.setImage(images.sprites, 161, 647); 
			}
		else  if (this.state === size_states.vvBig)
		{
			this.setImage(images.sprites, 161, 984); 
			}	
			else  if (this.state === size_states.giant)
		{
			this.setImage(images.sprites, 161, 1347); 
			}
		this.level.pause(); // valuer : next ==> pause
		audio11.pause()
		var audio = new Audio(AUDIOPATH +'final_re.mp3');
		audio.play();
		let te = this.level.id + 1 ;  
		setTimeout(() => {
			// var notification = alertify.notify('you are  now going to Level :' +  te , 'success', 5, function () {
			// });	
			var notification = alertify.notify('Félicitations ! Vous avez colonisé les voies respiratoires et êtes devenue une Bactérie MultiRésistante ! Il faut maintenant attaquer les autres organes ! '  , 'custom', 10, function () {
			});		
		}, 2000);

			
	},
	shoot: function () {
		var audio = new Audio(AUDIOPATH +'hit1.mp3');
			
		if (!this.cooldown) {
			this.cooldown = constants.cooldown;
			audio.play();
			new Bullet(this);
		}
	},
	setVelocity: function (vx, vy) {
		if (this.crouching) {
			vx = 0;
			this.crouch();
		} else {
			if (this.onground && vx > 0)
					this.walkRight();
			else if (this.onground && vx < 0)
				this.walkLeft();
			else
				this.stand();
		}
		this._super(vx, vy);
	},
	blink: function (times) {
		this.blinking = Math.max(1 * times * constants.blinkfactor, this.blinking || 0);
	},
	invincible: function () {
		this.level.playMusic('invincibility');
		this.deadly = Math.floor(constants.invincible / constants.interval);
		this.invulnerable = this.deadly;
		this.blink(Math.ceil(this.deadly / (2 * constants.blinkfactor)));
	},
	grow: function () {
		if (this.state === size_states.small) {
			this.level.playSound('grow');
			this.setState(size_states.big);
			var audio = new Audio(AUDIOPATH +'growup1_4.mp3');
			audio.play();
			this.blink(2);
		}
		// else if(this.state === size_states.big) {
		// 	this.level.playSound('grow');
		// 	this.setState(size_states.Vbig);
		// 	this.blink(3);
		// }
	},
	grow2: function () {
		if (this.state === size_states.big) {
			this.level.playSound('grow');
			this.setState(size_states.Vbig);
			this.blink(2);
			var audio = new Audio(AUDIOPATH +'growup1_4.mp3');
			audio.play();
		}



	},
	grow3: function () {
		if (this.state === size_states.Vbig) {
			this.setState(size_states.vvBig);
			this.blink(2);
			var audio = new Audio(AUDIOPATH +'growup1_4.mp3');
			audio.play();
		}
	},
	grow4: function () {
		if (this.state === size_states.vvBig) {
			this.setState(size_states.giant);
			this.blink(2);
			var audio = new Audio(AUDIOPATH +'growup5.mp3');
			audio.play();
		}
		
	},
	shooter: function () {
		if (this.state === size_states.vvBig)

			this.grow4();
		else
		this.level.playSound('grow');
		this.setMarioState(mario_states.fire);

	},
	walk: function (reverse, fast) {
		this.vx = constants.walking_v * (fast ? 2 : 1) * (reverse ? -1 : 1);
		
		
		
	},
	walkRight: function () {
		if (this.state === size_states.small) {
			if (!this.setupFrames(8, 2, true, 'WalkRightSmall'))
				this.setImage(images.sprites, 0, 0);
		} else if (this.state === size_states.big) {
			if (!this.setupFrames(9, 2, true, 'WalkRightBig'))
				this.setImage(images.sprites, 0, 243);
		} else if (this.state === size_states.Vbig) {
			if (!this.setupFrames(9, 2, true, 'WalkRightveryBigs'))
				this.setImage(images.sprites, 0, 566);
		} else if (this.state === size_states.vvBig) {
			if (!this.setupFrames(9, 2, true, 'WalkRighvvbig'))
				this.setImage(images.sprites, 0, 894);
		} else {
			if (!this.setupFrames(9, 2, true, 'WalkRighgiant'))
				this.setImage(images.sprites, 0, 1259);
		}

	},
	walkLeft: function () {
		if (this.state === size_states.small) {
			if (!this.setupFrames(8, 2, false, 'WalkLeftSmall'))
				this.setImage(images.sprites, 80, 81);
		} else if (this.state === size_states.big) {
			if (!this.setupFrames(9, 2, false, 'WalkLeftBig'))
				this.setImage(images.sprites, 158, 164);
		} else if (this.state === size_states.Vbig) {
			if (!this.setupFrames(10, 2, false, 'WalkLeftveryBig'))
				this.setImage(images.sprites, 81, 481);
		} else if (this.state === size_states.vvBig) {
			{
				if (!this.setupFrames(10, 2, false, 'WalkLeftvvbig'))
					this.setImage(images.sprites, 81, 806);
			}
		} else {
			if (!this.setupFrames(10, 2, false, 'WalkLeftGiant'))
				this.setImage(images.sprites, 81, 1174);
		}
	},
	stand: function () {
		var coords = this.standSprites[this.state - 1][this.direction === directions.left ? 0 : 1][this.onground ? 0 : 1];

		this.setImage(images.sprites, coords.x, coords.y);
		this.clearFrames();
		

	},
	crouch: function () {
		var coords = this.crouchSprites[this.state - 1][this.direction === directions.left ? 0 : 1];


		this.setImage(images.sprites, coords.x, coords.y);
		this.clearFrames();
	},
	jump: function () {
		var audio = new Audio(AUDIOPATH +'jump_sml.mp3');
		audio.play();

		this.vy = constants.jumping_v;
	},
	move: function () {
		this.input(keys);
		this._super();
	

		
	},
	addCoin: function () {
		this.setCoins(this.coins + 1);
	},
	playFrame: function () {
		if (this.blinking) {
			if (this.blinking % constants.blinkfactor === 0)
				this.view.toggle();

			this.blinking--;
		}

		if (this.cooldown)
			this.cooldown--;

		if (this.deadly)
			this.deadly--;

		if (this.invulnerable)
			this.invulnerable--;

		this._super();
	},
	setCoins: function (coins) {
		this.coins = coins;

		if (this.coins >= constants.max_coins) {
			this.addLife()
			this.coins -= constants.max_coins;
		}

		this.level.world.parent().children('#coinNumber').text(this.coins);
	},
	addLife: function () {
		var audio = new Audio(AUDIOPATH +'nsmbwii1up1.wav');
		audio.play();
		this.setLifes(this.lifes + 1);
	},
	setLifes: function (lifes) {
		this.lifes = lifes;
		this.level.world.parent().children('#liveNumber').text(this.lifes);
	},
	death: function () {
		
		if (this.deathBeginWait) {
			this.deathBeginWait--;
			
			return true;
		}
		
		if (this.deathEndWait) 
		return --this.deathEndWait;
			
			
		
		
		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + (this.deathDir > 0 ? this.deathStepUp : this.deathStepDown) + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			{this.deathEndWait = Math.floor(1800 / constants.interval);
			}

		return true;
	},
	die: function () {
		this.setMarioState(mario_states.normal);
		this.deathStepDown = Math.ceil(240 / this.deathFrames);
		this.setupFrames(9, 2, false);
		alertify.dismissAll();
		if (this.state === size_states.small)
		{
			this.setImage(images.sprites, 81, 325);
			}
		else if (this.state === size_states.big)
		{
			this.setImage(images.sprites, 81, 652); 
			}	
		else  if (this.state === size_states.Vbig)
		{
			this.setImage(images.sprites, 81, 728); 
			}
		else  if (this.state === size_states.vvBig)
		{
			this.setImage(images.sprites, 81, 984); 
			}	
			else  if (this.state === size_states.giant)
		{
			this.setImage(images.sprites, 81, 1347); 
			}		

		this.level.playMusic('die');
		var audio = new Audio(AUDIOPATH +'gameover1.mp3');
		audio.play();
		
		
		this._super();
		var notification = alertify.notify(' Vous avez été détruit ! Recommencez et n\'oubliez pas , plus vous collectez de gènes/plasmides de résistances plus il sera difficile de vous éliminer ! ', 'error', 500, function () {
		});
		setTimeout(() => {
			 alertify.dismissAll();
		}, 7000);

	},
	hurt: function (from) {
		if (this.deadly)
			from.die();
		else if (this.invulnerable)
			return;
		else if (this.state === size_states.small) {
			this.die();
		} else if (this.state === size_states.Vbig) {
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval); // return 
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.big);
			var audio = new Audio(AUDIOPATH +'hurt1_2.mp3');
			audio.play();
				var notification = alertify.notify('Faites attention ! Les cellules immunitaires et les antibiotiques peuvent vous affaiblir et même vous tuer !  ', 'warning', 4, function () {
			});
		} else if (this.state === size_states.vvBig) {
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval); // return 
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.Vbig);
			var audio = new Audio(AUDIOPATH +'hurt3_5.mp3');
			audio.play();
			var notification = alertify.notify('Faites attention ! Les cellules immunitaires et les antibiotiques peuvent vous affaiblir et même vous tuer !', 'warning', 4, function () {
			});
		}
		else  if (this.state === size_states.giant)  {
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval); // return 
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.vvBig);
			var audio = new Audio(AUDIOPATH +'hurt3_5.mp3');
			audio.play();
			var notification = alertify.notify('Faites attention ! Les cellules immunitaires et les antibiotiques peuvent vous affaiblir et même vous tuer !  ', 'warning', 4, function () {
			});
		} 
		else 
		{
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval); // return 
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.small);
			var audio = new Audio(AUDIOPATH +'hurt1_2.mp3');
			audio.play();
			var notification = alertify.notify(' Faites attention ! Les cellules immunitaires et les antibiotiques peuvent vous affaiblir et même vous tuer !', 'warning', 4, function () {
			});
		} 
	},
}, 'mario');
/*
 * -------------------------------------------
 * MARIO2 CLASS
 * -------------------------------------------
 */
 var Mario2 = Hero.extend({
	init: function(x, y, level) {
		this.standSprites2 = [
			[[{ x : 0, y : 81},{ x: 481, y : 83}],[{ x : 81, y : 0},{ x: 561, y : 83}]],
			[[{ x : 0, y : 162},{ x: 481, y : 247}],[{ x : 81, y : 243},{ x: 561, y : 247}]]
		];
		this.crouchSprites2 = [
			[{ x : 241, y : 0},{ x: 161, y : 0}],
			[{ x : 241, y : 172},{ x: 241, y : 252}]
		];
		this.deadly = 0;
		this.invulnerable = 0;
		this.width = 80;
		this._super(x, y, level);
		this.blinking = 0;
		this.setOffset(-24, 0);
		this.setSize(80, 80);
		this.cooldown = 0;
		this.setMarioState(mario_states.normal);
		this.setLifes(constants.start_lives);
		this.setCoins(0);
		this.deathBeginWait = Math.floor(700 / constants.interval);
		this.deathEndWait = 0;
		this.deathFrames = Math.floor(600 / constants.interval);
		this.deathStepUp = Math.ceil(200 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
		this.direction = directions.right;
		this.setImage(images.sprites2, 81, 0);
		this.crouching = false;
		this.fast = false;
	},
	setMarioState: function(state) {
		this.marioState = state;
	},
	setState: function(state) {
		if(state !== this.state) {
			this.setMarioState(mario_states.normal);
			this._super(state);
		}
	},
	setPosition: function(x, y) {
		this._super(x, y);
		var r = this.level.width - 640;
		var w = (this.x <= 210) ? 0 : ((this.x >= this.level.width - 230) ? r : r / (this.level.width - 440) * (this.x - 210));		
		this.level.setParallax(w);

		if(this.onground && this.x >= this.level.width - 128)
			this.victory();
	},
	input: function(keys) {
		this.fast = keys.accelerate;
		this.crouching = keys.down;
		
		if(!this.crouching) {
			if(this.onground && keys.up)
				this.jump();
				
			if(keys.accelerate && this.marioState === mario_states.fire)
				this.shoot();
				
			if(keys.right || keys.left)
				this.walk(keys.left, keys.accelerate);
			else
				this.vx = 0;
		}
	},
	victory: function() {
		this.level.playMusic('success');
		this.clearFrames();
		this.view.show();
		this.setImage(images.sprites2, this.state === size_states.small ? 241 : 161, 81);
		this.level.next();
	},
	shoot: function() {
		if(!this.cooldown) {
			this.cooldown = constants.cooldown;
			this.level.playSound('shoot');
			new Bullet(this);
		}
	},
	setVelocity: function(vx, vy) {
		if(this.crouching) {
			vx = 0;
			this.crouch();
		} else {
			if(this.onground && vx > 0)
				this.walkRight();
			else if(this.onground && vx < 0)
				this.walkLeft();
			else
				this.stand();
		}
	
		this._super(vx, vy);
	},
	blink: function(times) {
		this.blinking = Math.max(2 * times * constants.blinkfactor, this.blinking || 0);
	},
	invincible: function() {
		this.level.playMusic('invincibility');
		this.deadly = Math.floor(constants.invincible / constants.interval);
		this.invulnerable = this.deadly;
		this.blink(Math.ceil(this.deadly / (2 * constants.blinkfactor)));
	},
	grow: function() {
		if(this.state === size_states.small) {
			this.level.playSound('grow');
			this.setState(size_states.big);
			this.blink(3);
		}
	},
	shooter: function() {
		if(this.state === size_states.small)
			this.grow();
		else
			this.level.playSound('grow');
			
		this.setMarioState(mario_states.fire);
	},
	walk: function(reverse, fast) {
		this.vx = constants.walking_v * (fast ? 3 : 1) * (reverse ? - 1 : 1);
	},
	walkRight: function() {
		if(this.state === size_states.small) {
			if(!this.setupFrames(8, 2, true, 'WalkRightSmall'))
				this.setImage(images.sprites2, 0, 0);
		} else {
			if(!this.setupFrames(9, 2, true, 'WalkRightBig'))
				this.setImage(images.sprites2, 0, 243);
		}
	},
	walkLeft: function() {
		if(this.state === size_states.small) {
			if(!this.setupFrames(8, 2, false, 'WalkLeftSmall'))
				this.setImage(images.sprites2, 80, 81);
		} else {
			if(!this.setupFrames(9, 2, false, 'WalkLeftBig'))
				this.setImage(images.sprites2, 81, 162);
		}
	},
	stand: function() {
		var coords = this.standSprites2[this.state - 1][this.direction === directions.left ? 0 : 1][this.onground ? 0 : 1];
		this.setImage(images.sprites2, coords.x, coords.y);
		this.clearFrames();
	},
	crouch: function() {
		var coords = this.crouchSprites2[this.state - 1][this.direction === directions.left ? 0 : 1];
		this.setImage(images.sprites2, coords.x, coords.y);
		this.clearFrames();
	},
	jump: function() {
		this.level.playSound('jump');
		this.vy = constants.jumping_v;
	},
	move: function() {
		this.input(keys);		
		this._super();
	},
	addCoin: function() {
		this.setCoins(this.coins + 1);
	},
	playFrame: function() {		
		if(this.blinking) {
			if(this.blinking % constants.blinkfactor === 0)
				this.view.toggle();
				
			this.blinking--;
		}
		
		if(this.cooldown)
			this.cooldown--;
		
		if(this.deadly)
			this.deadly--;
		
		if(this.invulnerable)
			this.invulnerable--;
		
		this._super();
	},
	setCoins: function(coins) {
		this.coins = coins;
		
		if(this.coins >= constants.max_coins) {
			this.addLife()
			this.coins -= constants.max_coins;
		}
				
		this.level.world.parent().children('#coinNumber').text(this.coins);
	},
	addLife: function() {
		this.level.playSound('liveupgrade');
		this.setLifes(this.lifes + 1);
	},
	setLifes : function(lifes) {
		this.lifes = lifes;
		this.level.world.parent().children('#liveNumber').text(this.lifes);
	},
	death: function() {
		if(this.deathBeginWait) {
			this.deathBeginWait--;
			return true;
		}
		
		if(this.deathEndWait)
			return --this.deathEndWait;
		
		this.view.css({ 'bottom' : (this.deathDir > 0 ? '+' : '-') + '=' + (this.deathDir > 0 ? this.deathStepUp : this.deathStepDown) + 'px' });
		this.deathCount += this.deathDir;
		
		if(this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if(this.deathCount === 0)
			this.deathEndWait = Math.floor(1800 / constants.interval);
			
		return true;
	},
	die: function() {
		this.setMarioState(mario_states.normal);
		this.deathStepDown = Math.ceil(240 / this.deathFrames);
		this.setupFrames(9, 2, false);
		this.setImage(images.sprites2, 81, 324);
		this.level.playMusic('die');
		this._super();
	},
	hurt: function(from) {
		if(this.deadly)
			from.die();
		else if(this.invulnerable)
			return;
		else if(this.state === size_states.small) {
			this.die();
		} else {
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval);
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.small);
			this.level.playSound('hurt');			
		}
	},
}, 'mario2');
/*
 * -------------------------------------------
 * ENEMY CLASS
 * -------------------------------------------
 */
var Enemy = Figure.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.speed = 0;
	},
	hide: function () {
		this.invisible = true;
		this.view.hide();
	},
	show: function () {
		this.invisible = false;
		this.view.show();
	},
	move: function () {
		if (!this.invisible) {
			this._super();

			if (this.vx === 0) {
				var s = this.speed * Math.sign(this.speed);
				this.setVelocity(this.direction === directions.right ? -s : s, this.vy);
			}
		}
	},
	collides: function (is, ie, js, je, blocking) {
		if (this.j + 1 < this.level.getGridHeight()) {
			for (var i = is; i <= ie; i++) {
				if (i < 0 || i >= this.level.getGridWidth())
					return true;

				var obj = this.level.obstacles[i][this.j + 1];

				if (!obj || (obj.blocking & ground_blocking.top) !== ground_blocking.top)
					return true;
			}
		}

		return this._super(is, ie, js, je, blocking);
	},
	setSpeed: function (v) {
		this.speed = v;
		this.setVelocity(-v, 0);
	},
	hurt: function (from) {
		this.die();
	},
	hit: function (opponent) {
		if (this.invisible)
			return;

		if (opponent instanceof Mario) {

			if (opponent.vy < 0 && opponent.y - opponent.vy >= this.y + this.state * 32) {
				opponent.setVelocity(opponent.vx, constants.bounce);
				this.hurt(opponent);

			} else {
				opponent.hurt(this);
			}
		}
	},
	hit2: function(opponent2) {
		if(this.invisible)
			return;

		if(opponent2 instanceof Mario2) {
			if(opponent2.vy < 0 && opponent2.y - opponent2.vy >= this.y + this.state * 32) {
				opponent2.setVelocity(opponent2.vx, opponent2.bounce);
				this.hurt(opponent2);
			} else {
				opponent2.hurt(this);
			}
		}
	},
});
var Ghost = Enemy.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setSize(33, 32);
		this.setMode(ghost_mode.sleep, directions.left);
	},
	die: function() {
                //Do nothing here!
        },
	setMode: function(mode, direction) {
		if(this.mode !== mode || this.direction !== direction) {
			this.mode = mode;
			this.direction = direction;
			this.setImage(images.ghost, 33 * (mode + direction - 1), 0);
		}
	},
	getMario: function() {
		for(var i = this.level.figures.length; i--; )
			if(this.level.figures[i] instanceof Mario)
				return this.level.figures[i];
	},
	move: function() {
		var mario = this.getMario();
		
		if(mario && Math.abs(this.x - mario.x) <= 800) {
			var dx = Math.sign(mario.x - this.x);
			var dy = Math.sign(mario.y - this.y) * 0.5;
			var direction = dx ? dx + 2 : this.direction;
			var mode = mario.direction === direction ? ghost_mode.awake : ghost_mode.sleep;
			this.setMode(mode, direction);
			
			if(mode)		
				this.setPosition(this.x + dx, this.y + dy);
		} else 
			this.setMode(ghost_mode.sleep, this.direction);
	},
	hit: function(opponent) {			
		if(opponent instanceof Mario) {
			opponent.hurt(this);
		}
	},
}, 'ghost');
/*
 * -------------------------------------------
 * GUMPA CLASS
 * -------------------------------------------
 */
var Gumpa = Enemy.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setSize(32, 32);
		this.setSpeed(constants.ballmonster_v);
		this.death_mode = death_modes.normal;
		this.deathCount = 0;
	},
	setVelocity: function (vx, vy) {
		this._super(vx, vy);

		if (this.direction === directions.left) {
			if (!this.setupFrames(6, 2, false, 'LeftWalk'))
				this.setImage(images.enemies, 36, 188);
		} else {
			if (!this.setupFrames(6, 2, true, 'RightWalk'))
				this.setImage(images.enemies, 4, 228);
		}
	},
	death: function () {
		if (this.death_mode === death_modes.normal)
			return --this.deathCount;

		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + this.deathStep + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			return false;

		return true;
	},
	die: function () {
		this.clearFrames();

		if (this.death_mode === death_modes.normal) {
			this.level.playSound('enemy_die');
			this.setImage(images.enemies, 112, 228);
			this.deathCount = Math.ceil(600 / constants.interval);
		} else if (this.death_mode === death_modes.shell) {
			this.level.playSound('shell');
			this.setImage(images.enemies, 68, this.direction === directions.right ? 228 : 188);
			this.deathFrames = Math.floor(250 / constants.interval);
			this.deathDir = 1;
			this.deathStep = Math.ceil(150 / this.deathFrames);
		}

		this._super();
	},
}, 'ballmonster');

/*
 * -------------------------------------------
 * TURTLESHELL CLASS
 * -------------------------------------------
 */
var TurtleShell = Enemy.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 32);
		this.speed = 0;
		this.setImage(images.enemies, 0, 494);
	},
	activate: function (x, y) {
		this.setupFrames(6, 4, false)
		this.setPosition(x, y);
		this.show();
	},
	takeBack: function (where) {
		if (where.setShell(this))
			this.clearFrames();
	},
	hit: function (opponent) {
		if (this.invisible)
			return;

		if (this.vx) {
			if (this.idle)
				this.idle--;
			else if (opponent instanceof Mario)
				opponent.hurt(this);
			else {
				opponent.deathMode = death_modes.shell;
				opponent.die();
			}
		} else {
			if (opponent instanceof Mario) {
				this.setSpeed(opponent.direction === directions.right ? -constants.shell_v : constants.shell_v);
				opponent.setVelocity(opponent.vx, constants.bounce);
				this.idle = 2;
			} else if (opponent instanceof GreenTurtle && opponent.state === size_states.small)
				this.takeBack(opponent);
		}
	},
	hit2: function (opponent2) {
		if (this.invisible)
			return;

		if (this.vx) {
			if (this.idle)
				this.idle--;
			else if (opponent2 instanceof Mario2)
				opponent2.hurt(this);
			else {
				opponent2.deathMode = death_modes.shell;
				opponent2.die();
			}
		} else {
			if (opponent2 instanceof Mario2) {
				this.setSpeed(opponent2.direction === directions.right ? -constants.shell_v : constants.shell_v);
				opponent2.setVelocity(opponent2.vx, constants.bounce);
				this.idle = 2;
			} else if (opponent2 instanceof GreenTurtle && opponent2.state === size_states.small)
				this.takeBack(opponent2);
		}
	},
	collides: function (is, ie, js, je, blocking) {
		if (is < 0 || ie >= this.level.obstacles.length)
			return true;

		if (js < 0 || je >= this.level.getGridHeight())
			return false;

		for (var i = is; i <= ie; i++) {
			for (var j = je; j >= js; j--) {
				var obj = this.level.obstacles[i][j];

				if (obj && ((obj.blocking & blocking) === blocking))
					return true;
			}
		}

		return false;
	},
}, 'shell');


/*
 * -------------------------------------------
 * GREENTURTLE CLASS
 * -------------------------------------------
 */
var GreenTurtle = Enemy.extend({
	init: function (x, y, level) {
		this.walkSprites = [
			[{
				x: 40,
				y: 383
			}, {
				x: 0,
				y: 438
			}],
			[{
				x: 40,
				y: 266
			}, {
				x: 0,
				y: 328
			}]
		];
		this._super(x, y, level);
		this.wait = 0;
		this.deathMode = death_modes.normal;
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(150 / this.deathFrames);
		this.deathStepDown = Math.ceil(182 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
		this.setSize(40, 54);
		this.setShell(new TurtleShell(x, y, level));
	},
	setShell: function (shell) {
		if (this.shell || this.wait)
			return false;

		this.shell = shell;
		shell.hide();
		this.setState(size_states.big);
		return true;
	},
	setState: function (state) {
		this._super(state);

		if (state === size_states.big)
			this.setSpeed(constants.big_turtle_v);
		else
			this.setSpeed(constants.small_turtle_v);
	},
	setVelocity: function (vx, vy) {
		this._super(vx, vy);
		var rewind = this.direction === directions.right;
		var coords = this.walkSprites[this.state - 1][rewind ? 1 : 0];
		var label = Math.sign(vx) + '-' + this.state;

		if (!this.setupFrames(6, 2, rewind, label))
			this.setImage(images.enemies, coords.x, coords.y);
	},
	die: function () {
		this._super();
		this.clearFrames();

		if (this.deathMode === death_modes.normal) {
			this.deathFrames = Math.floor(600 / constants.interval);
			this.setImage(images.enemies, 116, 442);
		} else if (this.deathMode === death_modes.shell) {
			this.level.playSound('shell');
			this.setImage(images.enemies, 82, (this.state === size_states.small ? (this.direction === directions.right ? 435 : 382) : 325));
		}
	},
	death: function () {
		if (this.deathMode === death_modes.normal)
			return --this.deathFrames;

		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + (this.deathDir > 0 ? this.deathStepUp : this.deathStepDown) + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			return false;

		return true;
	},
	move: function () {
		if (this.wait)
			this.wait--;

		this._super();
	},
	hurt: function (opponent) {
		this.level.playSound('enemy_die');

		if (this.state === size_states.small)
			return this.die();

		this.wait = constants.shell_wait
		this.setState(size_states.small);
		this.shell.activate(this.x, this.y);
		this.shell = undefined;
	},
}, 'greenturtle');

/*
 * -------------------------------------------
 * SPIKEDTURTLE CLASS
 * -------------------------------------------
 */
var SpikedTurtle = Enemy.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 32);
		this.setSpeed(constants.spiked_turtle_v);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(150 / this.deathFrames);
		this.deathStepDown = Math.ceil(182 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
	},
	setVelocity: function (vx, vy) {
		this._super(vx, vy);

		if (this.direction === directions.left) {
			if (!this.setupFrames(4, 2, true, 'LeftWalk'))
				this.setImage(images.enemies, 2, 106);
		} else {
			if (!this.setupFrames(6, 2, false, 'RightWalk'))
				this.setImage(images.enemies, 38, 147);
		}
	},
	death: function () {
		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + (this.deathDir > 0 ? this.deathStepUp : this.deathStepDown) + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			return false;

		return true;
	},
	die: function () {
		this.level.playSound('shell');
		this.clearFrames();
		this._super();
		this.setImage(images.enemies, 76, this.direction === directions.left ? 101 : 141);
	},
	hit: function (opponent) {
		if (this.invisible)
			return;

		if (opponent instanceof Mario) {
			opponent.hurt(this);
		}
	},
	hit2: function (opponent2) {
		if (this.invisible)
			return;

		if (opponent2 instanceof Mario2) {
			opponent2.hurt(this);
		}
	},
}, 'spikedturtle');

/*
 * -------------------------------------------
 * PLANT CLASS
 * -------------------------------------------
 */
var Plant = Enemy.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 42);
		this.setupFrames(5, 2, true);
		this.setImage(images.enemies, 0, 3);
	},
	setVelocity: function (vx, vy) {
		this._super(0, 0);
	},
	die: function () {
		this.level.playSound('shell');
		this.clearFrames();
		this._super();
	},
	hit: function (opponent) {
		if (this.invisible)
			return;

		if (opponent instanceof Mario) {
			opponent.hurt(this);
		}
	},
	hit2: function (opponent2) {
		if (this.invisible)
			return;

		if (opponent2 instanceof Mario2) {
			opponent2.hurt(this);
		}
	},
});

/*
 * -------------------------------------------
 * STATICPLANT CLASS
 * -------------------------------------------
 */
var StaticPlant = Plant.extend({
	init: function (x, y, level) {
		this._super(x, y, level);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(100 / this.deathFrames);
		this.deathStepDown = Math.ceil(132 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
	},
	die: function () {
		this._super();
		this.setImage(images.enemies, 68, 3);
	},
	death: function () {
		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + (this.deathDir > 0 ? this.deathStepUp : this.deathStepDown) + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			return false;

		return true;
	},
}, 'staticplant');

/*
 * -------------------------------------------
 * PIPEPLANT CLASS
 * -------------------------------------------
 */
var PipePlant = Plant.extend({
	init: function (x, y, level) {
		this.bottom = y - 46;
		this.top = y - 7;
		this._super(x + 17, y - 7, level);
		this.setDirection(directions.down);
		this.setImage(images.enemies, 6, 56);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathFramesExtended = 6;
		this.deathFramesExtendedActive = false;
		this.deathStep = Math.ceil(100 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
		this.view.css('z-index', 95);
	},
	setDirection: function (dir) {
		this.direction = dir;
	},
	setPosition: function (x, y) {
		if (y === this.bottom || y === this.top) {
			this.minimum = constants.pipeplant_count;
			this.setDirection(this.direction === directions.up ? directions.down : directions.up);
		}

		this._super(x, y);
	},
	blocked: function () {
		if (this.y === this.bottom) {
			var state = false;
			this.y += 48;

			for (var i = this.level.figures.length; i--;) {
				if (this.level.figures[i] != this && q2q(this.level.figures[i], this)) {
					state = true;
					break;
				}
			}

			this.y -= 48;
			return state;
		}

		return false;
	},
	move: function () {
		if (this.minimum === 0) {
			if (!this.blocked())
				this.setPosition(this.x, this.y - (this.direction - 3) * constants.pipeplant_v);
		} else
			this.minimum--;
	},
	die: function () {
		this._super();
		this.setImage(images.enemies, 68, 56);
	},
	death: function () {
		if (this.deathFramesExtendedActive) {
			this.setPosition(this.x, this.y - 8);
			return --this.deathFramesExtended;
		}

		this.view.css({
			'bottom': (this.deathDir > 0 ? '+' : '-') + '=' + this.deathStep + 'px'
		});
		this.deathCount += this.deathDir;

		if (this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if (this.deathCount === 0)
			this.deathFramesExtendedActive = true;

		return true;
	},
}, 'pipeplant');

  


/*
 * -------------------------------------------
 * DOCUMENT READY STARTUP METHOD
 * -------------------------------------------
 */
var x;
var i =0;

$(document).ready(() => {

	$("#main2").addClass("main_game2");
	$("#coinNumber").addClass("gauge");
	$("#liveNumber").addClass("gauge");
	$("#live").addClass("gaugeSprite");
	$("#coin").addClass("gaugeSprite");
	$("#game").hide();
	$("#world").hide();
	$("#coinNumber").hide();
	$("#liveNumber").hide();
	$("#liveNumber").hide();
	$("#live").hide();
	
	var level = new Level('world');
	x = level ; 
	level.load(definedLevels[0]);
	localStorage.setItem('test', x);
	level.start();

	keys.bind();
	x.pause();


	});
	var audio11 = new Audio(AUDIOPATH + 'a-game.mp3');
	$("#play1").click(function () {
		$('#play1').removeClass('button_play1') ; 
		$('#main2').removeClass('main_game2') ; 
		$('#BMR1').removeClass('BMR1') ; 
		$('#BMR2').removeClass('BMR2') ; 
		$('#BMR3').removeClass('BMR3') ; 
		$('#BMR4').removeClass('BMR4') ; 
		$('#BMR5').removeClass('BMR5') ; 
		$("#game").show();
		$("#world").show();
		$("#coinNumber").show();
		$("#liveNumber").show();
		$("#coin").show();
		$("#live").show();
		$("#mute_btn").show();
		x.start();
	 
		audio11.play();
		audio11.volume = 0.2;
		audio11.loop = true;  

});  


$('#mute_btn').click(function () {

	audio11.muted = true
	$('#unmute_btn').show();
	setTimeout(() => {
		$('#mute_btn').hide();
	}, 100);
});
$('#unmute_btn').click(function () {

	audio11.muted = false;
	$('#unmute_btn').hide();
	$('#mute_btn').show();
});
	document.onkeydown = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == 27) {
			x.pause() ;
			audio11.pause();
		 		 $.confirm({
						escapeKey: false,
						theme: 'dark',
						animationBounce: 1.5,
												title: ' ',
						boxWidth: '500px',
   						useBootstrap: false,
						content: 'Voulez vous quitter le jeu ?  ',
						buttons: {
							Oui: function () {
								document.location.reload(true)
							},
							Non: function () {
								x.start() ;
								audio11.play();
							}
							
								}
							});
							}
	}
