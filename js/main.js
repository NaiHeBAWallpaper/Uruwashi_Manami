let canvas, overlay, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let loadingResolution;
let spineData;

let customScale = 0.8;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Theme_350.ogg';
let bgmvolume = 0.2;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = true;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let touchPointConstraint;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;
let renderScale = 1;

const MIN_RENDER_SCALE = 1.5;
const MAX_RENDER_SCALE = 2;
const MAX_RENDER_PIXELS = 5120 * 2880;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko'
};
let isVoicelinePlaying = false;

const CHARACTER = 'CH0339';
let modelResolution = '8k';

// Japanese transcription: https://bluearchive.wiki/wiki/Manami/audio (CC BY-SA 4.0).
// English and Simplified Chinese are translations of the Japanese transcription.
const AUDIO_DETAIL = [
	{
		"dialog": {
			"Japanese": [
				"我がワイルドハント芸術学院は、歴史のある学園です。",
				"歴代の優秀な評議会長の偉業は、今もなお語り継がれています。"
			],
			"English": [
				"Our Wildhunt Academy of Arts is a school with a long history.",
				"The achievements of our distinguished past council presidents are still spoken of today."
			],
			"Chinese": [
				"我们狂猎艺术学院是一所历史悠久的学园。",
				"历代优秀评议会长的事迹，至今仍被传颂。"
			],
			TraditionalChinese: [
				"我們狂獵藝術學院是一所歷史悠久的學園。",
				"歷代優秀評議會長的事蹟，至今仍被傳頌。"
			],
			Korean: [
				"저희 와일드헌트 예술학원은 오랜 역사를 지닌 학교입니다.",
				"역대 뛰어난 평의회장들의 업적은 지금도 전해지고 있지요."
			]
		}
	},
	{
		"dialog": {
			"Japanese": [
				"ですが、私はそこに名を連ねることはないでしょう。",
				"事情があるとはいえ、専攻の活動もできておらず――",
				"学院の運営も、独裁的だと評されています。"
			],
			"English": [
				"But I doubt my name will be counted among theirs.",
				"I have my reasons, but I haven't even been able to work in my field of study—",
				"And people call the way I run the academy dictatorial."
			],
			"Chinese": [
				"不过，我的名字大概不会位列其中。",
				"虽说事出有因，我却连本专业的活动都没能开展——",
				"学院的管理方式，也被人评价为独裁。"
			],
			TraditionalChinese: [
				"不過，我的名字大概不會位列其中。",
				"雖說事出有因，我卻連本專業的活動都沒能開展——",
				"學院的管理方式，也被人評價為獨裁。"
			],
			Korean: [
				"하지만 제 이름은 그들 사이에 오르지 못하겠지요.",
				"사정이 있다곤 해도 전공 분야의 활동조차 하지 못하고 있고—",
				"학원 운영도 독재적이라는 평가를 받고 있으니까요."
			]
		}
	},
	{
		"dialog": {
			"Japanese": [
				"それを不当だとは思っていません。",
				"芸術とは、時を超えるもの。",
				"私が守り抜いた芸術は、後世へと受け継がれていくことでしょう。"
			],
			"English": [
				"I don't think that's an unfair assessment.",
				"Art transcends time.",
				"The art I've worked to protect will be passed down to future generations."
			],
			"Chinese": [
				"我并不觉得这种评价有失公允。",
				"艺术是能够跨越时间的。",
				"我竭力守护的艺术，终将传承给后世吧。"
			],
			TraditionalChinese: [
				"我並不覺得這種評價有失公允。",
				"藝術是能夠跨越時間的。",
				"我竭力守護的藝術，終將傳承給後世吧。"
			],
			Korean: [
				"그 평가가 부당하다고 생각하지는 않습니다.",
				"예술이란 시간을 초월하는 것.",
				"제가 지켜 낸 예술은 후세에 이어지겠지요."
			]
		}
	},
	{
		"dialog": {
			"Japanese": [
				"この学院と、学院の芸術を守ること――",
				"それこそが、私が評議会長を続けている理由です。",
				"ですから、先生――これからも……。",
				"こんな私を、見守っていてくれますよね？"
			],
			"English": [
				"Protecting this academy and the art it fosters—",
				"That's why I continue to serve as council president.",
				"So, Sensei… from now on, too…",
				"You'll keep watching over me, won't you?"
			],
			"Chinese": [
				"守护这所学院，以及学院的艺术——",
				"这就是我继续担任评议会长的理由。",
				"所以，老师——今后也……",
				"您会继续守望这样的我，对吧？"
			],
			TraditionalChinese: [
				"守護這所學院，以及學院的藝術——",
				"這就是我繼續擔任評議會長的理由。",
				"所以，老師——今後也……",
				"您會繼續守望這樣的我，對吧？"
			],
			Korean: [
				"이 학원과 학원의 예술을 지키는 것—",
				"그것이 제가 평의회장을 계속 맡는 이유입니다.",
				"그러니 선생님, 앞으로도……",
				"이런 저를 지켜봐 주실 거죠?"
			]
		}
	}
];

const HITBOX = {
	headpat: { xMin: 1860, xMax: 2230, yMin: 50, yMax: 268, start: 'Pat2_01_M', loop: 'Pat2_02_M', end: 'PatEnd2_01_M' },
	facepat: { xMin: 1895, xMax: 2220, yMin: 310, yMax: 525, start: 'Pat_01_M', loop: 'Pat_02_M', end: 'PatEnd_01_M' },
	voiceline: { xMin: 1570, xMax: 2170, yMin: 592, yMax: 1120 }
};

const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;

let mousePos = { x: 0, y: 0 };
let volume = 0.2;
let mouseActions = true;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

function getRenderScale(cssWidth = window.innerWidth, cssHeight = window.innerHeight) {
	const desiredScale = Math.max(window.devicePixelRatio || 1, MIN_RENDER_SCALE);
	const pixelBudgetScale = Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, cssWidth * cssHeight));
	return Math.max(1, Math.min(desiredScale, MAX_RENDER_SCALE, pixelBudgetScale));
}

function syncCanvasSize(element, cssWidth, cssHeight, scale) {
	element.style.width = cssWidth + 'px';
	element.style.height = cssHeight + 'px';
	element.width = Math.max(1, Math.round(cssWidth * scale));
	element.height = Math.max(1, Math.round(cssHeight * scale));
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;
	TEye.y = TEye.y - (Math.sign(adjX) * EYE_STEP);
	TEye.x = TEye.x - (Math.sign(adjY) * EYE_STEP);
	TEye.y = clamp(TEye.y, EPointY - (Math.abs(adjX) * EYE_CLAMP_X), EPointY + (Math.abs(adjX) * EYE_CLAMP_X));
	TEye.x = clamp(TEye.x, EPointX - (Math.abs(adjY) * EYE_CLAMP_Y), EPointX + (Math.abs(adjY) * EYE_CLAMP_Y));
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			acceptingClick = true;
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta, animationName) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	let gain = 1;
	if (/^Pat(?:End)?2_/.test(animationName)) {
		// Pat2 blends Touch_Point back toward Touch_Eye_Key and suppresses drag movement.
		gain = clamp(0.85 / (1 - touchPointConstraint.mixX), 1, 8.5);
	}
	TPoint.x += headpatOffset.x * gain;
	TPoint.y += headpatOffset.y * gain;
}

function releaseMouseOnExit() {
	if (!spineData) return;
	if (mouseSelect === 2) {
		mouseSelect = -1;
		acceptingClick = true;
	} else if (mouseSelect !== -1) {
		releasedMouse();
	}
}

function showVoicelineSubtitle(clip) {
	const text = clip?.dialog[window.selectedLanguage]?.[clip.index] ?? "";
	textbox.textContent = text;
	textbox.style.opacity = dialogBox && text ? 1 : 0;
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const { dialog } = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase() + '.ogg';
		const track = new Audio(`./assets/audio/${filename}`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	isVoicelinePlaying = true;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				showVoicelineSubtitle(currentTracks.at(-1));
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			showVoicelineSubtitle(clip);
		},
		complete: () => {
			isVoicelinePlaying = false;
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

function isInsideHitbox(x, y, box) {
	return x >= box.xMin && x < box.xMax && y >= box.yMin && y < box.yMax;
}

// -1 = No interaction, 1 = Pat, 2 = Voiceline, 3 = Eye tracking
function pressedMouse(x, y) {
	const tx = t(x, 'x');
	const ty = t(y, 'y');
	const pat = [HITBOX.headpat, HITBOX.facepat].find(box => isInsideHitbox(tx, ty, box));
	if (pat && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, pat.start, false);
		spineData.state.addAnimation(1, pat.loop, true, 0);
		headpatOrigin = { x, y, endAnimation: pat.end };
		mouseSelect = 1;
	}
	else if (isInsideHitbox(tx, ty, HITBOX.voiceline) && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else {
		// Mouse tracking is disabled and click is not in any specific area
		// Set mouseSelect to -1 to indicate no interaction, this prevents
		// releasedMouse from triggering any animation on mouseup
		mouseSelect = -1;
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2 * renderScale;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			const { endAnimation } = headpatOrigin;
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, endAnimation, false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			eyetracking.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, eyetracking.animationEnd);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	const rect = canvas.getBoundingClientRect();
	let ax = (event.clientX - rect.left) * canvas.width / rect.width;
	const ay = (event.clientY - rect.top) * canvas.height / rect.height;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	showVoicelineSubtitle(currentTracks.at(-1));
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;
			if (props.mouseactions) {
				if (!props.mouseactions.value) releaseMouseOnExit();
				mouseActions = props.mouseactions.value;
			}

			if (props.mousetracking) {
				const wasEnabled = mouseOptions.mousetracking;
				mouseOptions.mousetracking = props.mousetracking.value;

				if (wasEnabled && !mouseOptions.mousetracking) {
					if (trackerID != -1) {
						clearInterval(trackerID);
						trackerID = -1;
					}
					if (untrackerID != -1) {
						clearInterval(untrackerID);
						untrackerID = -1;
					}
					if (spineData && mouseSelect === 3) {
						spineData.state.setEmptyAnimation(1, 0);
						mouseSelect = -1;
						acceptingClick = true;
					}
					if (TEye) {
						TEye.x = EPointX;
						TEye.y = EPointY;
					}
				}
			}
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) {
				volume = props.voicevolume.value / 100;
				for (const { track } of currentTracks) track.volume = volume;
			}
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) textbox.style.left = props.dialogx.value + '%';
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;
			if (props.lensflare) {
				showLensflare = props.lensflare.value;
				if (spineData) updateLensflareOpacity(spineData.skeleton.data);
			}

			// 监听模型分辨率设置
			if (props.modelresolution) modelResolution = props.modelresolution.value;
			if (assetManager && typeof introAnimation !== 'undefined' && !modelFrame &&
				(props.modelresolution || loadingResolution !== modelResolution)) {
				reloadModel();
			}

			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}
			if (props.showdialog) {
				showVoicelineSubtitle(currentTracks.at(-1));
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function(isPaused) {
				if (bgm) {
					if (isPaused) {
						setTimeout(() => { bgm.volume = 0; }, 200);
					} else {
						setTimeout(() => { bgm.volume = bgmvolume; }, 200);
					}
				}
			}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseMouseOnExit);
	window.addEventListener('blur', releaseMouseOnExit);
	canvas.addEventListener('mousedown', event => {
		if (!mouseActions || !spineData || !acceptingClick || isVoicelinePlaying) return;
		acceptingClick = false;
		const { x, y } = setMouse(event);
		pressedMouse(x, y);
	});
	canvas.addEventListener('mouseup', () => {
		if (mouseSelect !== -1) releasedMouse();
	});
	canvas.addEventListener('mousemove', event => {
		const { x, y } = setMouse(event);
		movedMouse(x, y);
	});

	overlay = document.getElementById('overlay');
	renderScale = getRenderScale();
	syncCanvasSize(canvas, window.innerWidth, window.innerHeight, renderScale);
	syncCanvasSize(overlay, window.innerWidth, window.innerHeight, renderScale);

	let config = { alpha: false, premultipliedAlpha: false, antialias: true, powerPreference: 'high-performance' };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.Shader.newTwoColoredTextured(gl);
	batcher = new spine.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.SkeletonRenderer(gl);
	assetManager = new spine.AssetManager(gl);

	window.addEventListener('resize', resize);
	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		if (loadingResolution === undefined && !modelFrame) reloadModel();
	}, 350);

	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

// Function to reload the model with a new resolution
function reloadModel() {
	if (!assetManager || modelFrame) return;
	acceptingClick = false;
	mouseSelect = -1;
	clearInterval(trackerID);
	clearInterval(untrackerID);
	trackerID = -1;
	untrackerID = -1;
	clearTimeout(headpatCooldown);
	headpatCooldown = 0;
	headpatOrigin = null;
	headpatTarget.set(0, 0);
	headpatOffset.set(0, 0);

	// Stop and clear all voiceline audio tracks
	currentTracks.forEach(({ track }) => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	currentTracks = [];
	
	isVoicelinePlaying = false;
	
	// Hide dialog box
	if (textbox) {
		textbox.style.opacity = 0;
	}
	
	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	spineData = null;
	assetManager.removeAll();
	loadingResolution = modelResolution;
	const binaryPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.skel`, document.baseURI).href;
	const atlasPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.atlas`, document.baseURI).href;
	assetManager.loadBinary(binaryPath);
	assetManager.loadTextureAtlas(atlasPath, (_path, atlas) => {
		for (const page of atlas.pages) {
			const { width, height } = page.texture.getImage();
			// WebGL 1 requires power-of-two dimensions for mipmaps.
			if ((width & (width - 1)) || (height & (height - 1))) continue;
			const minFilter = spine.TextureFilter.MipMapLinearLinear;
			const magFilter = spine.TextureFilter.Linear;
			if (page.minFilter === minFilter && page.magFilter === magFilter) continue;
			page.minFilter = minFilter;
			page.magFilter = magFilter;
			page.texture.setFilters(minFilter, magFilter);
		}
	});
	function waitForAssets() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForAssets);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			reloadModel();
			return;
		}
		if (assetManager.get(binaryPath) && assetManager.get(atlasPath)) {
			load(binaryPath, atlasPath);
		} else {
			console.error('Model assets not found for resolution: ' + loadingResolution);
			loadingResolution = undefined;
		}
	}
	modelFrame = requestAnimationFrame(waitForAssets);
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	touchPointConstraint = spineData.skeleton.findTransformConstraint('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;
}

function load(dynamicBinaryPath, dynamicAtlasPath) {
	spineData = loadSpineData(dynamicBinaryPath, dynamicAtlasPath, false);
	const state = spineData.state;
	state.setAnimation(3, 'Clouds_01_R', true);
	if (introAnimation) {
		const intro = state.setAnimation(0, 'Start_Idle_01', false);
		const idle = state.addAnimation(0, 'Idle_01', true, intro.animationEnd);
		idle.listener = { start: () => { acceptingClick = true; } };
	} else {
		state.setAnimation(0, 'Idle_01', true);
		acceptingClick = true;
	}

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	if (!bgm) {
		bgm = new Audio(bgmfile);
		bgm.volume = bgmvolume;
		bgm.loop = true;
		bgm.play().catch(() => {});
	}

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	updateLensflareOpacity(skeletonData);
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform(spine.Physics.update);
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}

let showLensflare = true;
const LENSFLARE_SLOTS = new Set();
const BROAD_LIGHT_NAME = /sun[ _-]*(?:light|flare)|(?:top|diffuse)[ _-]*light|(?:^|\/)fx[_ -]light[_ -]\d|lens[ e_-]*flare/i;
const lensflareOpacity = new WeakMap();

function updateLensflareOpacity(skeletonData) {
	for (const skin of skeletonData.skins) {
		for (const { slotIndex, name, attachment } of skin.getAttachments()) {
			const slot = skeletonData.slots[slotIndex];
			if (slot.blendMode !== 1 || !attachment.color) continue;
			if (!LENSFLARE_SLOTS.has(slot.name) && !BROAD_LIGHT_NAME.test(slot.name + " " + name)) continue;
			if (!lensflareOpacity.has(attachment)) lensflareOpacity.set(attachment, attachment.color.a);
			attachment.color.a = lensflareOpacity.get(attachment) * (showLensflare ? 0.24 : 0);
		}
	}
}

function render() {
    let now = Date.now() / 1000;
    let delta = now - lastFrameTime;

    lastFrameTime = now;

    gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Only render if spineData is available
    if (spineData) {
        // Apply the animation state based on the delta time.
        let skeleton = spineData.skeleton;
        let state = spineData.state;
        let premultipliedAlpha = spineData.premultipliedAlpha;
        state.update(delta);
		state.apply(skeleton);
		

        const pointX = TPoint.x;
        const pointY = TPoint.y;
        applyHeadpat(delta, state.getCurrent(1)?.animation.name);
        skeleton.updateWorldTransform(spine.Physics.update);
        TPoint.x = pointX;
        TPoint.y = pointY;

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        // 修改这两行，从 spine.webgl.Shader 改为 spine.Shader
        shader.setUniformi(spine.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();
    }

    // throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	renderScale = getRenderScale();
	syncCanvasSize(canvas, w, h, renderScale);
	syncCanvasSize(overlay, w, h, renderScale);

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 800;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();
