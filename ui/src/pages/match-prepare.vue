<script setup>
import { computed, watch, nextTick, onUnmounted } from 'vue';
import { useMatchStore } from '@/stores/match';
import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

const matchStore = useMatchStore();
const { match, userInfo } = matchStore;

const PARTICLES_ID = 'waiting-particles';
let particlesLoaded = false;

const isPreparePhase = computed(() => match.value.round === 0 && match.value.step === 0);

// Logo 垂直偏移
const logoOffsetY = computed(() => (userInfo.viewer ? '-6vh' : '-10vh'));

const ensureParticlesLoaded = async () => {
	if (particlesLoaded) return;
	await loadSlim(tsParticles);
	particlesLoaded = true;
};

const initParticles = async () => {
	await ensureParticlesLoaded();
	destroyParticles();

	await tsParticles.load({
		id: PARTICLES_ID,
		options: {
			fullScreen: { enable: false },
			background: { color: 'transparent' },
			fpsLimit: 60,
			detectRetina: true,

			interactivity: {
				detectsOn: 'window',
				events: {
					onHover: { enable: true, mode: 'repulse' },
					onClick: { enable: true, mode: 'push' },
					resize: true,
				},
				modes: {
					repulse: { distance: 170, duration: 0.45 },
					push: { quantity: 4 },
				},
			},

			particles: {
				// 粒子数量
				number: { value: 140, density: { enable: true, area: 800 } },
				color: { value: ['#00bfff', '#4f7cff', '#ffffff'] },
				links: { enable: true, distance: 150, color: '#4f7cff', opacity: 0.25, width: 1 },
				opacity: { value: { min: 0.2, max: 0.6 } },
				size: { value: { min: 1.2, max: 3.0 } },
				move: { enable: true, speed: 1.1, outModes: { default: 'out' } },
			},
		},
	});
};

const destroyParticles = () => {
	const inst = tsParticles.domItem(PARTICLES_ID);
	if (inst) inst.destroy();
};

// 进入准备阶段就初始化粒子，离开就销毁
watch(
	isPreparePhase,
	async (val) => {
		if (val) {
			await nextTick();
			initParticles();
		} else {
			destroyParticles();
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	destroyParticles();
});
</script>

<template>
	<transition name="overlay-fade">
		<div v-if="isPreparePhase" class="waiting-overlay" aria-hidden="true">
			<!-- 粒子范围限制 -->
			<div :id="PARTICLES_ID" class="waiting-particles"></div>

			<div class="waiting-logo-wrapper">
				<img src="/images/logo.png" class="waiting-logo" alt="Logo" />
			</div>
		</div>
	</transition>
</template>

<style scoped>
/* 叠加层：不挡点击，层级别太高避免盖弹窗 */
.waiting-overlay {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
}

/* 粒子容器：限制范围（红框） */
.waiting-particles {
	position: absolute;
	left: 18vw;
	right: 18vw;
	top: 4vh;
	bottom: 4vh;

	z-index: 79;
	pointer-events: none;

	overflow: hidden;
	border-radius: 10px;
}

.waiting-particles canvas {
	position: absolute !important;
	inset: 0 !important;
	width: 100% !important;
	height: 100% !important;
	display: block;
}

/* Logo 容器：调位置就改 translateY */
.waiting-logo-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) translateY(v-bind(logoOffsetY));
	z-index: 80;
	pointer-events: none;
}

.waiting-logo {
	width: 360px;
	height: auto;
	transform-origin: center;

	animation: logo-float 5.5s ease-in-out infinite, breathe 2.8s ease-in-out infinite;
}

@keyframes logo-float {
	0%,
	100% {
		transform: translateY(0) scale(1);
	}
	50% {
		transform: translateY(-10px) scale(1.03);
	}
}

/* 呼吸辉光*/
@keyframes breathe {
	0%,
	100% {
		filter: brightness(1.02) contrast(1.06) saturate(1.18)
			drop-shadow(0 0 18px rgba(0, 191, 255, 0.6))
			drop-shadow(0 0 55px rgba(64, 128, 255, 0.5))
			drop-shadow(0 0 100px rgba(120, 120, 255, 0.42));
	}
	50% {
		filter: brightness(1.22) contrast(1.1) saturate(1.45)
			drop-shadow(0 0 22px rgba(0, 255, 255, 0.62))
			drop-shadow(0 0 70px rgba(80, 128, 255, 0.58))
			drop-shadow(0 0 125px rgba(160, 160, 255, 0.5));
	}
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
	transition: opacity 0.35s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
	opacity: 0;
}
.overlay-fade-enter-to,
.overlay-fade-leave-from {
	opacity: 1;
}
</style>
